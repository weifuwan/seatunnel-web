package org.apache.seatunnel.web.api.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.dao.DataSourceMapper;
import org.apache.seatunnel.web.api.service.DataSourceService;
import org.apache.seatunnel.web.common.ConnectionParam;
import org.apache.seatunnel.web.common.DbType;
import org.apache.seatunnel.web.common.bean.dto.DataSourceDTO;
import org.apache.seatunnel.web.common.bean.entity.PaginationResult;
import org.apache.seatunnel.web.common.bean.po.DataSourcePO;
import org.apache.seatunnel.web.common.bean.vo.DBOptionVO;
import org.apache.seatunnel.web.common.bean.vo.DataSourceVO;
import org.apache.seatunnel.web.common.enums.ConnStatus;
import org.apache.seatunnel.web.common.utils.ConvertUtil;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DataSourceServiceImpl extends ServiceImpl<DataSourceMapper, DataSourcePO> implements DataSourceService {

    @Override
    public DataSourceVO create(DataSourceDTO dto) {
        if (checkNameExists(dto.getDbName())) {
            throw new IllegalArgumentException("Data source name already exists");
        }

        ConnectionParam connectionParam = DataSourceUtils.buildConnectionParams(dto.getDbType(), dto.getConnectionParams());
        DataSourcePO dataSource = ConvertUtil.sourceToTarget(dto, DataSourcePO.class);
        dataSource.setConnectionParams(JSONUtils.toJsonString(connectionParam));
        dataSource.setOriginalJson(dto.getConnectionParams());
        dataSource.setConnStatus(ConnStatus.CONNECTED_NONE);
        dataSource.initInsert();

        try {
            save(dataSource);
            return ConvertUtil.sourceToTarget(dataSource, DataSourceVO.class);
        } catch (DuplicateKeyException ex) {
            throw new RuntimeException("Failed to insert data source: " + dto.getDbName(), ex);
        }
    }

    @Override
    public Long update(Long id, DataSourceDTO dto) {
        DataSourceVO existing = selectById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Data source does not exist: " + id);
        }

        ConnectionParam connectionParam = DataSourceUtils.buildConnectionParams(dto.getDbType(), dto.getConnectionParams());
        DataSourcePO dataSource = ConvertUtil.sourceToTarget(dto, DataSourcePO.class);
        dataSource.setConnectionParams(JSONUtils.toJsonString(connectionParam));
        dataSource.setOriginalJson(dto.getConnectionParams());
        dataSource.setId(id);
        dataSource.initUpdate();

        try {
            updateById(dataSource);
            return id;
        } catch (DuplicateKeyException ex) {
            throw new RuntimeException("Failed to update data source: " + id, ex);
        }
    }

    @Override
    public DataSourceVO selectById(Long id) {
        DataSourcePO po = getById(id);
        return po == null ? null : ConvertUtil.sourceToTarget(po, DataSourceVO.class);
    }

    @Override
    public PaginationResult<DataSourceVO> paging(DataSourceDTO dto) {
        LambdaQueryWrapper<DataSourcePO> wrapper = buildWrapper(dto);
        IPage<DataSourcePO> pageRequest = new Page<>(dto.getPageNo(), dto.getPageSize());
        IPage<DataSourcePO> pageResult = page(pageRequest, wrapper);

        List<DataSourceVO> records = ConvertUtil.sourceListToTarget(pageResult.getRecords(), DataSourceVO.class);
        // Extract JDBC URL and environment description
        records.forEach(item -> {
            JSONObject json = JSON.parseObject(item.getConnectionParams());
            item.setJdbcUrl(json.getString("url"));
            if (item.getEnvironment() != null) {
                item.setEnvironmentName(item.getEnvironment().getDescription());
            }
        });

        return PaginationResult.buildSuc(records, pageResult);
    }

    @Override
    public Boolean delete(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Data source ID is empty");
        }
        return removeById(id);
    }

    @Override
    public Boolean connectionTest(Long id) {
        DataSourcePO po = getById(id);
        if (po == null) {
            throw new IllegalArgumentException("Data source not found: " + id);
        }
        return testConnection(po);
    }

    @Override
    public Boolean batchConnectionTest(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Data source ID list is empty");
        }

        return ids.parallelStream()
                .allMatch(this::connectionTest);
    }


    @Override
    public Boolean connectionTestWithParam(String connJson) {
        DbType dbType = extractDbType(connJson);
        ConnectionParam param = DataSourceUtils.buildConnectionParams(dbType, connJson);
        return checkConnection(dbType, param);
    }

    @Override
    public List<DataSourceVO> listAll() {
        List<DataSourcePO> entities = getBaseMapper().selectList(new LambdaQueryWrapper<>());
        return ConvertUtil.sourceListToTarget(entities, DataSourceVO.class);
    }

    @Override
    public Map<String, Object> uploadJdbcDriver(MultipartFile file, String pluginType, boolean overwrite) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("file is empty");
        }

        String original = file.getOriginalFilename();
        String filename = StringUtils.isNotBlank(original) ? Paths.get(original).getFileName().toString() : null;
        if (!StringUtils.isNotBlank(filename)) {
            throw new RuntimeException("invalid filename");
        }

        String lower = filename.toLowerCase();
        if (!lower.endsWith(".jar")) {
            throw new RuntimeException("only .jar is allowed");
        }

        long max = 200L * 1024 * 1024;
        if (file.getSize() > max) {
            throw new RuntimeException("file too large (>200MB)");
        }

        String userHome = System.getProperty("user.dir");
        Path targetDir = Paths.get(userHome, "jdbc-drivers");

        try {
            Files.createDirectories(targetDir);

            Path targetFile = targetDir.resolve(filename).normalize();

            if (!targetFile.startsWith(targetDir)) {
                throw new RuntimeException("invalid file path");
            }

            if (Files.exists(targetFile) && !overwrite) {
                throw new RuntimeException("file already exists, set overwrite=true to replace");
            }

            Path tmp = Files.createTempFile(targetDir, filename + ".", ".uploading");
            try {
                Files.copy(file.getInputStream(), tmp, StandardCopyOption.REPLACE_EXISTING);
                Files.move(tmp, targetFile, overwrite
                        ? new CopyOption[]{StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE}
                        : new CopyOption[]{StandardCopyOption.ATOMIC_MOVE});
            } finally {
                try {
                    Files.deleteIfExists(tmp);
                } catch (Exception ignore) {
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("fileName", filename);
            data.put("absolutePath", targetFile.toAbsolutePath().toString());
            data.put("driverLocation", filename);

            return data;
        } catch (IOException e) {
            log.error("Upload JDBC driver failed, filename={}", filename, e);
            throw new RuntimeException("upload failed: " + e.getMessage());
        }
    }

    private DbType extractDbType(String connJson) {
        JSONObject json = JSON.parseObject(connJson);
        return DbType.valueOf(json.getString("type"));
    }

    private Boolean testConnection(DataSourcePO po) {
        updateConnectionStatus(po, ConnStatus.CONNECTING);
        try {
            ConnectionParam param = DataSourceUtils.buildConnectionParams(po.getDbType(), po.getConnectionParams());
            boolean connected = checkConnection(po.getDbType(), param);
            updateConnectionStatus(po, connected ? ConnStatus.CONNECTED_SUCCESS : ConnStatus.CONNECTED_FAILED);
            return connected;
        } catch (Exception e) {
            log.error("Connection test failed for data source: {}", po.getId(), e);
            updateConnectionStatus(po, ConnStatus.CONNECTED_FAILED);
            throw new RuntimeException(e.getMessage());
        }
    }

    public Boolean checkConnection(DbType dbType, ConnectionParam param) {
        try {
            DataSourceProcessor processor = DataSourceUtils.getDatasourceProcessor(dbType);
            boolean connected = processor.getConnectionManager().checkDataSourceConnectivity(param);
            if (!connected) {
                throw new RuntimeException("Data source connection failed");
            }
            return true;
        } catch (Exception e) {
            log.error("Error checking connection for dbType {}: {}", dbType, e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public List<DBOptionVO> option(String dbType) {
        LambdaQueryWrapper<DataSourcePO> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(dbType)) {
            wrapper.eq(DataSourcePO::getDbType, dbType);
        }
        List<DataSourcePO> pos = list(wrapper);
        return pos.stream()
                .map(po -> {
                    DBOptionVO option = new DBOptionVO();
                    option.setValue(po.getId());
                    option.setLabel(po.getDbName());
                    option.setDbType(po.getDbType());
                    return option;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean batchDelete(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Data source ID list is empty");
        }
        return removeByIds(ids);
    }


    private LambdaQueryWrapper<DataSourcePO> buildWrapper(DataSourceDTO dto) {
        LambdaQueryWrapper<DataSourcePO> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(dto.getDbName())) wrapper.eq(DataSourcePO::getDbName, dto.getDbName());
        if (dto.getDbType() != null) wrapper.eq(DataSourcePO::getDbType, dto.getDbType());
        if (dto.getEnvironment() != null) wrapper.eq(DataSourcePO::getEnvironment, dto.getEnvironment());
        return wrapper;
    }

    private boolean checkNameExists(String dbName) {
        return count(new LambdaQueryWrapper<DataSourcePO>()
                .eq(DataSourcePO::getDbName, dbName.trim())) > 0;
    }


    private void updateConnectionStatus(DataSourcePO po, ConnStatus status) {
        po.setConnStatus(status);
        updateById(po);
    }
}
