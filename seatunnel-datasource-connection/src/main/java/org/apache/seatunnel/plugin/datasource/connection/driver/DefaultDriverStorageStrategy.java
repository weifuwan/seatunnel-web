package org.apache.seatunnel.plugin.datasource.connection.driver;

import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverClassPath;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverDescriptor;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 一个“默认可用”的 DriverStorageStrategy：
 * - 仅处理本地文件 jar（上传/远程下载不在这里做）
 * - 支持 SHARED/ISOLATED 两种目录结构
 * - SHARED 模式使用引用计数 + 定时清理
 *
 * 目录结构示例：
 *  - SHARED:   {baseDir}/jdbc-drivers/shared/{fingerprint}/xxx.jar
 *  - ISOLATED: {baseDir}/jdbc-drivers/isolated/{dataSourceId}/{fingerprint}/xxx.jar
 */
public class DefaultDriverStorageStrategy implements DriverStorageStrategy {

    public enum Mode { SHARED, ISOLATED }

    private final Mode mode;
    private final File baseDir;
    private final Duration cleanupInterval;
    private final Duration orphanTtl;

    private final RefCountRegistry refCountRegistry;
    private final ScheduledExecutorService cleaner;



    public DefaultDriverStorageStrategy(
            Mode mode,
            File baseDir,
            Duration cleanupInterval,
            Duration orphanTtl) {
        this(mode, baseDir, cleanupInterval, orphanTtl, new InMemoryRefCountRegistry());
    }

    public DefaultDriverStorageStrategy(
            Mode mode,
            File baseDir,
            Duration cleanupInterval,
            Duration orphanTtl,
            RefCountRegistry refCountRegistry) {
        this.mode = Objects.requireNonNull(mode);
        this.baseDir = Objects.requireNonNull(baseDir);
        this.cleanupInterval = Objects.requireNonNull(cleanupInterval);
        this.orphanTtl = Objects.requireNonNull(orphanTtl);
        this.refCountRegistry = Objects.requireNonNull(refCountRegistry);

        if (!baseDir.exists() && !baseDir.mkdirs()) {
            throw new IllegalStateException("Cannot create baseDir: " + baseDir.getAbsolutePath());
        }

        if (mode == Mode.SHARED) {
            this.cleaner = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "jdbc-driver-storage-cleaner");
                t.setDaemon(true);
                return t;
            });
            this.cleaner.scheduleAtFixedRate(
                    this::cleanupOnce,
                    cleanupInterval.toMillis(),
                    cleanupInterval.toMillis(),
                    TimeUnit.MILLISECONDS);
        } else {
            this.cleaner = null;
        }
    }

    @Override
    public File resolveJarLocation(DataSourceId dataSourceId, DriverDescriptor descriptor, String jarPath) {
        File src = new File(jarPath);
        String fileName = src.getName();
        File dir = new File(resolveBaseDir(dataSourceId, descriptor));
        return new File(dir, fileName);
    }

    @Override
    public DriverClassPath prepare(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        Objects.requireNonNull(dataSourceId, "dataSourceId");
        Objects.requireNonNull(descriptor, "descriptor");

        File targetDir = new File(resolveBaseDir(dataSourceId, descriptor));
        mkdirsOrThrow(targetDir);

        List<URL> urls = new ArrayList<>();
        for (String jarPath : descriptor.getJarPaths()) {
            if (jarPath == null || jarPath.trim().isEmpty()) {
                continue;
            }
            File src = new File(jarPath.trim());
            if (!src.exists() || !src.isFile()) {
                throw new IllegalArgumentException("JDBC driver jar not found: " + src.getAbsolutePath());
            }

            File dst = resolveJarLocation(dataSourceId, descriptor, src.getAbsolutePath());
            copyIfAbsent(src.toPath(), dst.toPath());

            try {
                urls.add(dst.toURI().toURL());
            } catch (MalformedURLException e) {
                throw new RuntimeException("Bad jar url: " + dst.getAbsolutePath(), e);
            }
        }

        // 3) 引用计数：SHARED 模式需要；ISOLATED 可选（这里也记一下，方便统一 release）
        String key = registryKey(dataSourceId, descriptor);
        refCountRegistry.increase(key);

        return new DriverClassPath(urls, targetDir.getAbsolutePath());
    }

    @Override
    public void release(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        Objects.requireNonNull(dataSourceId, "dataSourceId");
        Objects.requireNonNull(descriptor, "descriptor");

        String key = registryKey(dataSourceId, descriptor);
        long refs = refCountRegistry.decrease(key);

        // ISOLATED：没人用了就删（通常 datasource 不再用时释放）
        if (mode == Mode.ISOLATED && refs <= 0) {
            deleteQuietly(new File(resolveBaseDir(dataSourceId, descriptor)));
            refCountRegistry.remove(key);
            return;
        }

        // SHARED：不在 release 时立即删，交给后台 cleanup（避免并发/抖动）
        if (mode == Mode.SHARED && refs <= 0) {
            refCountRegistry.touch(key); // 标记为“可能可清理”，避免刚变 0 就立刻被扫掉
        }
    }

    @Override
    public void shutdown() {
        if (cleaner != null) {
            cleaner.shutdownNow();
        }
    }

    // --------------------------- internal ---------------------------

    private String resolveBaseDir(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        String fp = safe(descriptor.getFingerprint());
        switch (mode) {
            case SHARED:
                return new File(baseDir, "jdbc-drivers/shared/" + fp).getAbsolutePath();
            case ISOLATED:
                return new File(baseDir, "jdbc-drivers/isolated/" + safe(dataSourceId.value()) + "/" + fp).getAbsolutePath();
            default:
                throw new IllegalArgumentException("Unknown mode: " + mode);
        }
    }

    private String registryKey(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        // SHARED：同 fingerprint 全局共享
        // ISOLATED：按 datasourceId 隔离
        if (mode == Mode.SHARED) {
            return "shared::" + descriptor.getFingerprint();
        }
        return "isolated::" + dataSourceId.value() + "::" + descriptor.getFingerprint();
    }

    private void cleanupOnce() {
        try {
            // 只清 shared
            File sharedRoot = new File(baseDir, "jdbc-drivers/shared");
            if (!sharedRoot.exists()) {
                return;
            }
            long now = System.currentTimeMillis();

            File[] children = sharedRoot.listFiles();
            if (children == null) {
                return;
            }

            for (File fpDir : children) {
                if (fpDir == null || !fpDir.isDirectory()) {
                    continue;
                }
                String key = "shared::" + fpDir.getName();
                long refs = refCountRegistry.getRefs(key);
                if (refs > 0) {
                    continue;
                }
                Optional<Long> lastTouched = refCountRegistry.getLastTouchedMillis(key);
                long touched = lastTouched.orElseGet(fpDir::lastModified);
                if (now - touched >= orphanTtl.toMillis()) {
                    deleteQuietly(fpDir);
                    refCountRegistry.remove(key);
                }
            }
        } catch (Throwable t) {
            // 避免清理线程挂掉
            // 生产环境你可以接 logger
        }
    }

    private static void mkdirsOrThrow(File dir) {
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IllegalStateException("Cannot create dir: " + dir.getAbsolutePath());
        }
    }

    private static void copyIfAbsent(Path src, Path dst) {
        try {
            if (Files.exists(dst)) {
                return;
            }
            Files.createDirectories(dst.getParent());
            Files.copy(src, dst, StandardCopyOption.COPY_ATTRIBUTES);
        } catch (IOException e) {
            throw new RuntimeException("Copy jar failed: " + src + " -> " + dst, e);
        }
    }

    private static void deleteQuietly(File file) {
        if (file == null || !file.exists()) {
            return;
        }
        try {
            Path p = file.toPath();
            // 递归删除
            Files.walk(p)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                        }
                    });
        } catch (IOException ignored) {
        }
    }

    private static String safe(String s) {
        if (s == null) return "null";
        // 简单做一下路径安全（你也可以更严格）
        return s.replace("/", "_").replace("\\", "_").replace("..", "_");
    }

    // --------------------------- RefCount Registry ---------------------------

    public interface RefCountRegistry extends Serializable {
        void increase(String key);
        long decrease(String key);
        long getRefs(String key);
        void remove(String key);
        void touch(String key);
        Optional<Long> getLastTouchedMillis(String key);
    }

    public static class InMemoryRefCountRegistry implements RefCountRegistry {
        private static class Entry {
            final AtomicLong refs = new AtomicLong(0);
            volatile long lastTouched = System.currentTimeMillis();
        }

        private final Map<String, Entry> map = new ConcurrentHashMap<>();

        @Override
        public void increase(String key) {
            map.compute(key, (k, v) -> {
                if (v == null) v = new Entry();
                v.refs.incrementAndGet();
                v.lastTouched = System.currentTimeMillis();
                return v;
            });
        }

        @Override
        public long decrease(String key) {
            return map.compute(key, (k, v) -> {
                if (v == null) return null;
                long after = v.refs.decrementAndGet();
                v.lastTouched = System.currentTimeMillis();
                return v;
            }) == null ? 0 : map.get(key).refs.get();
        }

        @Override
        public long getRefs(String key) {
            Entry e = map.get(key);
            return e == null ? 0 : e.refs.get();
        }

        @Override
        public void remove(String key) {
            map.remove(key);
        }

        @Override
        public void touch(String key) {
            Entry e = map.get(key);
            if (e != null) {
                e.lastTouched = System.currentTimeMillis();
            }
        }

        @Override
        public Optional<Long> getLastTouchedMillis(String key) {
            Entry e = map.get(key);
            return e == null ? Optional.empty() : Optional.of(e.lastTouched);
        }
    }
}

/*
 * 依赖类：DriverStorageStrategy / DriverClassPath 来自我之前给你的结构。
 * 你只要确保包名一致，或者自己调整 import 即可。
 */