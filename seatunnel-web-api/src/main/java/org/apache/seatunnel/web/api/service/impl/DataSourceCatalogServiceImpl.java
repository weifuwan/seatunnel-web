package org.apache.seatunnel.web.api.service.impl;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcCatalog;
import org.apache.seatunnel.plugin.datasource.api.modal.DataSourceTableColumn;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.apache.seatunnel.web.api.enums.Status;
import org.apache.seatunnel.web.api.exceptions.ServiceException;
import org.apache.seatunnel.web.api.service.DataSourceCatalogService;
import org.apache.seatunnel.web.api.service.DataSourceService;
import org.apache.seatunnel.web.common.BaseConnectionParam;
import org.apache.seatunnel.web.common.QueryResult;
import org.apache.seatunnel.web.common.bean.vo.ColumnOptionVO;
import org.apache.seatunnel.web.common.bean.vo.OptionVO;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DataSourceCatalogServiceImpl implements DataSourceCatalogService {

    private static final String KEY_TABLE_PATH = "table_path";
    private static final String KEY_QUERY = "query";
    private static final String KEY_TASK_EXECUTE_TYPE = "taskExecuteType";
    private static final String SINGLE_TABLE = "SINGLE_TABLE";

    @Resource
    private DataSourceService dataSourceService;

    @Override
    public List<OptionVO> listTable(Long datasourceId) {
        DataSource dataSource = getDataSourceOrThrow(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSource);

        try {
            List<String> tables = getJdbcCatalog(dataSource, connectionParam).listTables();
            return tables.stream()
                    .map(this::toOption)
                    .collect(Collectors.toList());
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to list tables, datasourceId={}", datasourceId, e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    @Override
    public List<OptionVO> listTableReference(Long datasourceId, String matchMode, String keyword) {
        List<OptionVO> allTables = listTable(datasourceId);

        if (StringUtils.isBlank(keyword)) {
            return allTables;
        }

        if ("2".equals(matchMode)) {
            return allTables.stream()
                    .filter(table -> String.valueOf(table.getValue()).matches(keyword))
                    .collect(Collectors.toList());
        }

        if ("3".equals(matchMode)) {
            String[] exactNames = keyword.split(",");
            return allTables.stream()
                    .filter(table -> matchExactTable(String.valueOf(table.getValue()), exactNames))
                    .collect(Collectors.toList());
        }

        return allTables;
    }

    @Override
    public List<ColumnOptionVO> listColumn(Long datasourceId, Map<String, Object> requestBody) {
        validateDatasourceId(datasourceId);
        validateRequestBody(requestBody, "requestBody");

        DataSource dataSource = getDataSourceOrThrow(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSource);

        try {
            List<DataSourceTableColumn> columns = getJdbcCatalog(dataSource, connectionParam).listColumns(requestBody);

            return columns.stream()
                    .map(column -> {
                        ColumnOptionVO optionVO = new ColumnOptionVO();
                        optionVO.setKey(column.getOrdinalPosition());
                        optionVO.setFieldName(column.getColumnName());
                        optionVO.setFieldType(column.getSourceType());
                        optionVO.setIsNullable(column.getIsNullable());
                        optionVO.setFieldComment(column.getColumnComment());
                        optionVO.setFieldKey(column.getColumnKey());
                        return optionVO;
                    })
                    .collect(Collectors.toList());
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to list columns, datasourceId={}, requestBody={}", datasourceId, requestBody, e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    @Override
    public QueryResult getTop20Data(Long datasourceId, Map<String, Object> requestBody) {
        validateDatasourceId(datasourceId);
        validateRequestBody(requestBody, "requestBody");

        DataSource dataSource = getDataSourceOrThrow(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSource);

        try {
            return getJdbcCatalog(dataSource, connectionParam).getTop20Data(requestBody);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to query top20 preview data, datasourceId={}, requestBody={}", datasourceId, requestBody, e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    @Override
    public Integer count(Long datasourceId, Map<String, Object> requestBody) {
        validateDatasourceId(datasourceId);
        validateRequestBody(requestBody, "requestBody");

        DataSource dataSource = getDataSourceOrThrow(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSource);

        try {
            return getJdbcCatalog(dataSource, connectionParam).count(requestBody);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to count preview data, datasourceId={}, requestBody={}", datasourceId, requestBody, e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    @Override
    public String buildSqlTemplate(Long datasourceId, Map<String, Object> requestBody) {
        validateDatasourceId(datasourceId);
        validateRequestBody(requestBody, "requestBody");

        String tablePath = getRequiredText(requestBody, KEY_TABLE_PATH);

        DataSource dataSource = getDataSourceOrThrow(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSource);
        JdbcCatalog jdbcCatalog = getJdbcCatalog(dataSource, connectionParam);

        Map<String, Object> columnRequest = Map.of(
                KEY_TASK_EXECUTE_TYPE, SINGLE_TABLE,
                KEY_TABLE_PATH, tablePath,
                KEY_QUERY, ""
        );

        try {
            List<DataSourceTableColumn> columns = jdbcCatalog.listColumns(columnRequest);
            if (columns == null || columns.isEmpty()) {
                throw new ServiceException(Status.DATASOURCE_COLUMN_NOT_FOUND, tablePath);
            }
            return jdbcCatalog.buildSelectAllColumnsSql(tablePath, columns);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to build sql template, datasourceId={}, tablePath={}", datasourceId, tablePath, e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    @Override
    public String resolveSql(Long datasourceId, Map<String, Object> requestBody) {
        validateDatasourceId(datasourceId);
        validateRequestBody(requestBody, "requestBody");

        String query = getRequiredText(requestBody, KEY_QUERY);

        DataSource dataSource = getDataSourceOrThrow(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSource);

        try {
            return getJdbcCatalog(dataSource, connectionParam).resolveSqlVariables(query);
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to resolve sql, datasourceId={}, query={}", datasourceId, query, e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    private DataSource getDataSourceOrThrow(Long datasourceId) {
        validateDatasourceId(datasourceId);

        DataSource dataSource = dataSourceService.selectById(datasourceId);
        if (dataSource == null) {
            log.warn("Datasource not found, datasourceId={}", datasourceId);
            throw new ServiceException(Status.DATASOURCE_NOT_EXIST);
        }
        return dataSource;
    }

    private BaseConnectionParam buildConnectionParam(DataSource dataSource) {
        try {
            return DataSourceUtils.buildConnectionParams(
                    dataSource.getDbType(),
                    dataSource.getConnectionParams()
            );
        } catch (Exception e) {
            log.error("Failed to build connection param, datasourceId={}", dataSource.getId(), e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    private JdbcCatalog getJdbcCatalog(DataSource dataSource, BaseConnectionParam connectionParam) {
        try {
            return DataSourceUtils
                    .getDatasourceProcessor(dataSource.getDbType())
                    .getMetadataService(connectionParam);
        } catch (Exception e) {
            log.error("Failed to get jdbc catalog, datasourceId={}", dataSource.getId(), e);
            throw new ServiceException(Status.DATASOURCE_METADATA_ERROR, e.getMessage());
        }
    }

    private void validateDatasourceId(Long datasourceId) {
        if (datasourceId == null || datasourceId <= 0) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, "datasourceId");
        }
    }

    private void validateRequestBody(Map<String, Object> requestBody, String fieldName) {
        if (MapUtils.isEmpty(requestBody)) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, fieldName);
        }
    }

    private String getRequiredText(Map<String, Object> requestBody, String key) {
        Object value = requestBody.get(key);
        if (value == null || StringUtils.isBlank(String.valueOf(value))) {
            throw new ServiceException(Status.REQUEST_PARAMS_NOT_VALID_ERROR, key);
        }
        return String.valueOf(value);
    }

    private boolean matchExactTable(String tableName, String[] exactNames) {
        for (String exact : exactNames) {
            if (tableName.equals(exact.trim())) {
                return true;
            }
        }
        return false;
    }

    private OptionVO toOption(String value) {
        OptionVO optionVO = new OptionVO();
        optionVO.setLabel(value);
        optionVO.setValue(value);
        return optionVO;
    }
}