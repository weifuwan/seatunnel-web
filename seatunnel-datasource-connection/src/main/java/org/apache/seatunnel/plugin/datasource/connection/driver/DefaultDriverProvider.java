package org.apache.seatunnel.plugin.datasource.connection.driver;


import org.apache.seatunnel.plugin.datasource.connection.api.DataSourceId;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverClassPath;
import org.apache.seatunnel.plugin.datasource.connection.api.DriverDescriptor;

import java.sql.Driver;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class DefaultDriverProvider implements DriverProvider {

    private final DriverStorageStrategy storageStrategy;
    private final ClassLoaderStrategy classLoaderStrategy;

    private final ConcurrentMap<String, DriverHandle> cache = new ConcurrentHashMap<>();

    public DefaultDriverProvider(DriverStorageStrategy storageStrategy, ClassLoaderStrategy classLoaderStrategy) {
        this.storageStrategy = storageStrategy;
        this.classLoaderStrategy = classLoaderStrategy;
    }

    @Override
    public DriverHandle getOrCreate(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        String key = buildKey(dataSourceId, descriptor);

        return cache.computeIfAbsent(key, k -> {
            DriverClassPath classPath = storageStrategy.prepare(dataSourceId, descriptor);
            ClassLoaderStrategy.ManagedClassLoader mcl =
                    classLoaderStrategy.getOrCreate(dataSourceId, descriptor, classPath);
            try {
                Class<?> clazz = mcl.classLoader().loadClass(descriptor.getDriverClass());
                Driver driver = (Driver) clazz.getDeclaredConstructor().newInstance();
                return new DriverHandle(driver, mcl, classPath.getIdentifier());
            } catch (Exception e) {
                classLoaderStrategy.release(dataSourceId, descriptor);
                storageStrategy.release(dataSourceId, descriptor);
                throw new RuntimeException("load jdbc driver failed: " + descriptor.getDriverClass(), e);
            }
        });
    }

    @Override
    public void release(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        String key = buildKey(dataSourceId, descriptor);
        DriverHandle handle = cache.remove(key);
        classLoaderStrategy.release(dataSourceId, descriptor);
        storageStrategy.release(dataSourceId, descriptor);
    }

    @Override
    public void shutdown() {
        cache.clear();
        classLoaderStrategy.shutdown();
        storageStrategy.shutdown();
    }

    private String buildKey(DataSourceId dataSourceId, DriverDescriptor descriptor) {
        return dataSourceId.value() + "::" + descriptor.getFingerprint() + "::" + descriptor.getDriverClass();
    }
}

