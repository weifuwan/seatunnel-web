package org.apache.seatunnel.admin.service.impl;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.MapUtils;
import org.apache.seatunnel.admin.service.DataSourceCatalogService;
import org.apache.seatunnel.admin.service.DataSourceService;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.QueryResult;
import org.apache.seatunnel.communal.bean.vo.ColumnOptionVO;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;
import org.apache.seatunnel.communal.bean.vo.OptionVO;
import org.apache.seatunnel.plugin.datasource.api.modal.DataSourceTableColumn;
import org.apache.seatunnel.plugin.datasource.api.utils.DataSourceUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DataSourceCatalogServiceImpl implements DataSourceCatalogService {

    @Resource
    private DataSourceService dataSourceService;

    /**
     * List all tables under the specified data source.
     *
     * @param datasourceId data source ID
     * @return list of table options
     */
    @Override
    public List<OptionVO> listTable(Long datasourceId) {
        if (datasourceId == null) {
            throw new IllegalArgumentException("Datasource ID must not be empty");
        }

        DataSourceVO dataSourceVO = getAndCheckDataSource(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSourceVO);

        try {
            List<String> tables = DataSourceUtils
                    .getDatasourceProcessor(dataSourceVO.getDbType())
                    .getMetadataService(connectionParam)
                    .listTables();

            return tables.stream()
                    .map(tableName -> {
                        OptionVO optionVO = new OptionVO();
                        optionVO.setLabel(tableName);
                        optionVO.setValue(tableName);
                        return optionVO;
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to list tables, datasourceId={}", datasourceId, e);
            throw new RuntimeException("Failed to list tables");
        }
    }

    /**
     * Retrieves a list of table references from a datasource, with optional filtering based on match mode.
     *
     * @param datasourceId the ID of the datasource from which to list tables
     * @param matchMode    the filtering mode:
     *                     "2" - treat `keyword` as a regex pattern and match table names against it
     *                     "3" - treat `keyword` as a comma-separated list of exact table names to match
     * @param keyword      the filtering keyword, whose meaning depends on the matchMode; can be null or empty for no filtering
     * @return a list of OptionVO objects representing the tables, filtered according to the matchMode and keyword
     */
    @Override
    public List<OptionVO> listTableReference(Long datasourceId, String matchMode, String keyword) {
        List<OptionVO> allTables = listTable(datasourceId);

        if ("2".equals(matchMode) && !StringUtils.isEmpty(keyword)) {
            allTables = allTables.stream()
                    .filter(t -> t.getValue().toString().matches(keyword))
                    .collect(Collectors.toList());
        } else if ("3".equals(matchMode) && !StringUtils.isEmpty(keyword)) {
            String[] exacts = keyword.split(",");
            allTables = allTables.stream()
                    .filter(t -> {
                        for (String e : exacts) {
                            if (t.getValue().equals(e.trim())) return true;
                        }
                        return false;
                    })
                    .collect(Collectors.toList());
        }
        return allTables;
    }


    /**
     * List column metadata for the specified table.
     *
     * @param datasourceId data source ID
     * @param requestBody  requestBody query conditions including table name and optional filters
     * @return list of column options
     */
    @SneakyThrows
    @Override
    public List<ColumnOptionVO> listColumn(Long datasourceId, Map<String, Object> requestBody) {
        if (datasourceId == null) {
            throw new IllegalArgumentException("Datasource ID must not be empty");
        }
        if (MapUtils.isEmpty(requestBody)) {
            throw new IllegalArgumentException("Table request body must not be empty");
        }

        DataSourceVO dataSourceVO = getAndCheckDataSource(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSourceVO);

        try {
            List<DataSourceTableColumn> columns = DataSourceUtils
                    .getDatasourceProcessor(dataSourceVO.getDbType())
                    .getMetadataService(connectionParam)
                    .listColumns(requestBody);

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

        } catch (Exception e) {
            log.error(
                    "Failed to list columns, datasourceId={}",
                    datasourceId,
                    e
            );
            throw new RuntimeException("Failed to list columns");
        }
    }

    /**
     * Query top 20 rows of data for preview.
     *
     * @param datasourceId data source ID
     * @param requestBody  query parameters
     * @return query result
     */
    @Override
    public QueryResult getTop20Data(Long datasourceId, Map<String, Object> requestBody) {
        if (datasourceId == null) {
            throw new IllegalArgumentException("Datasource ID must not be empty");
        }
        if (requestBody == null || requestBody.isEmpty()) {
            throw new IllegalArgumentException("Query parameters must not be empty");
        }

        DataSourceVO dataSourceVO = getAndCheckDataSource(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSourceVO);

        try {
            return DataSourceUtils
                    .getDatasourceProcessor(dataSourceVO.getDbType())
                    .getMetadataService(connectionParam)
                    .getTop20Data(requestBody);

        } catch (Exception e) {
            log.error("Failed to query preview data, datasourceId={}", datasourceId, e);
            throw new RuntimeException("Failed to query preview data");
        }
    }

    /**
     * Get datasource and verify existence.
     */
    private DataSourceVO getAndCheckDataSource(Long datasourceId) {
        DataSourceVO dataSourceVO = dataSourceService.selectById(datasourceId);
        if (dataSourceVO == null) {
            log.warn("Datasource not found, datasourceId={}", datasourceId);
            throw new RuntimeException("Datasource does not exist");
        }
        return dataSourceVO;
    }

    /**
     * Build connection parameters for the datasource.
     */
    private BaseConnectionParam buildConnectionParam(DataSourceVO dataSourceVO) {
        return DataSourceUtils.buildConnectionParams(
                dataSourceVO.getDbType(),
                dataSourceVO.getConnectionParams()
        );
    }

    @Override
    public Integer count(Long datasourceId, Map<String, Object> requestBody) {
        if (datasourceId == null) {
            throw new IllegalArgumentException("Datasource ID must not be empty");
        }
        if (requestBody == null || requestBody.isEmpty()) {
            throw new IllegalArgumentException("Query parameters must not be empty");
        }

        DataSourceVO dataSourceVO = getAndCheckDataSource(datasourceId);
        BaseConnectionParam connectionParam = buildConnectionParam(dataSourceVO);

        try {
            return DataSourceUtils
                    .getDatasourceProcessor(dataSourceVO.getDbType())
                    .getMetadataService(connectionParam)
                    .count(requestBody);

        } catch (Exception e) {
            log.error("Failed to query preview data, datasourceId={}", datasourceId, e);
            throw new RuntimeException("Failed to query preview data");
        }
    }
}
