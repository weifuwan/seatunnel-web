package org.apache.seatunnel.admin.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.dao.DataSourceMapper;
import org.apache.seatunnel.admin.service.DataSourceService;
import org.apache.seatunnel.communal.ConnectionParam;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.bean.dto.DataSourceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.DataSourcePO;
import org.apache.seatunnel.communal.bean.vo.DBOptionVO;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;
import org.apache.seatunnel.communal.enums.ConnStatus;
import org.apache.seatunnel.communal.utils.ConvertUtil;
import org.apache.seatunnel.communal.utils.JSONUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.DataSourceProcessor;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
            return false;
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
            return false;
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
