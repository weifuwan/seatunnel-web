package org.apache.seatunnel.web.core.job.handler.multi;

import jakarta.annotation.Resource;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.utils.JSONUtils;
import org.apache.seatunnel.web.core.builder.HoconConfigBuilder;
import org.apache.seatunnel.web.core.dag.DagGraph;
import org.apache.seatunnel.web.core.utils.DagUtil;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobContent;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Guide multi hocon build service.
 *
 * <p>
 * GuideMultiJobContent 本身不是 ReactFlow workflow，
 * 但当前 HOCON 构建链路已经基于 workflow / DagGraph 完成。
 * </p>
 *
 * <p>
 * 因此这里负责把：
 * source / target / tableMatch
 * 转换成一个虚拟 workflow，然后复用：
 * DagUtil.parseAndCheck + HoconConfigBuilder
 * </p>
 */
@Service
public class GuideMultiHoconBuildService {

    private static final String SOURCE_NODE_ID = "guide-multi-source";
    private static final String SINK_NODE_ID = "guide-multi-sink";
    private static final String EDGE_ID = "guide-multi-source-to-sink";

    private static final String NODE_TYPE_SOURCE = "source";
    private static final String NODE_TYPE_SINK = "sink";

    private static final String KEY_MULTI_TABLE = "multiTable";
    private static final String KEY_TABLE_LIST = "table_list";
    private static final String KEY_SOURCE_TABLE_LIST = "source_table_list";
    private static final String KEY_SINK_TABLE_LIST = "sink_table_list";

    @Resource
    private HoconConfigBuilder hoconConfigBuilder;

    @Resource
    private GuideMultiTableMatchResolver tableMatchResolver;

    public String build(GuideMultiJobSaveCommand command) {
        validateCommand(command);

        Map<String, Object> workflow = buildWorkflow(command);

        String dagJson = JSONUtils.toJsonString(workflow);
        if (StringUtils.isBlank(dagJson)) {
            throw new IllegalArgumentException("guide multi workflow can not be blank");
        }

        DagGraph dagGraph = DagUtil.parseAndCheck(dagJson);
        return hoconConfigBuilder.build(dagGraph, command.getBasic());
    }

    private Map<String, Object> buildWorkflow(GuideMultiJobSaveCommand command) {
        GuideMultiJobContent content = command.getContent();

        List<String> sourceTables = tableMatchResolver.resolveSourceTables(content);
        List<String> sinkTables = tableMatchResolver.resolveSinkTables(content);

        validateTables(sourceTables, sinkTables);

        Map<String, Object> sourceNode = buildSourceNode(content.getSource(), sourceTables);
        Map<String, Object> sinkNode = buildSinkNode(content.getTarget(), sinkTables);

        Map<String, Object> edge = new LinkedHashMap<>();
        edge.put("id", EDGE_ID);
        edge.put("source", SOURCE_NODE_ID);
        edge.put("target", SINK_NODE_ID);

        Map<String, Object> workflow = new LinkedHashMap<>();
        workflow.put("nodes", Arrays.asList(sourceNode, sinkNode));
        workflow.put("edges", Collections.singletonList(edge));

        return workflow;
    }

    private Map<String, Object> buildSourceNode(
            GuideMultiJobContent.WorkflowSourceConfig source,
            List<String> sourceTables) {

        boolean multiTable = sourceTables.size() > 1;
        String firstSourceTable = firstTable(sourceTables);

        Map<String, Object> config = new LinkedHashMap<>();

        /*
         * 注意：
         * DTO 里是 datasourceId，
         * 但现有 JdbcSourceBuilder 读取的是 dataSourceId。
         */
        putIfNotBlank(config, "dataSourceId", source.getDatasourceId());
        putIfNotBlank(config, "dbType", source.getDbType());
        putIfNotBlank(config, "connectorType", source.getConnectorType());
        putIfNotBlank(config, "pluginName", source.getPluginName());

        /*
         * 单表兼容字段。
         * 当前 AbstractJdbcBatchBuilder 在 sql 为空时会读取 table。
         */
        config.put("readMode", "table");
        config.put("table", firstSourceTable);
        config.put("table_path", firstSourceTable);

        /*
         * 多表上下文字段。
         * AbstractJdbcBatchBuilder 兼容 table_list 后可以识别。
         */
        config.put(KEY_MULTI_TABLE, multiTable);
        config.put(KEY_TABLE_LIST, sourceTables);
        config.put(KEY_SOURCE_TABLE_LIST, sourceTables);

        if (source.getFetchSize() != null) {
            config.put("fetchSize", source.getFetchSize());
        }

        if (source.getSplitSize() != null) {
            config.put("splitSize", source.getSplitSize());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("nodeType", NODE_TYPE_SOURCE);
        data.put("title", defaultIfBlank(source.getDbType(), "Source"));

        /*
         * 关键字段放在 data 根上。
         * connectorName(data) 会从 data.connectorType 读取连接器名称。
         */
        data.put("dataSourceId", source.getDatasourceId());
        data.put("dbType", source.getDbType());
        data.put("connectorType", source.getConnectorType());
        data.put("pluginName", source.getPluginName());

        /*
         * 同时把 config 展开到 data 根上，并保留 data.config。
         * 这样兼容不同 NodeConfigBuilder 的读取方式。
         */
        data.putAll(config);
        data.put("config", config);

        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", SOURCE_NODE_ID);
        node.put("type", NODE_TYPE_SOURCE);
        node.put("data", data);

        return node;
    }

    private Map<String, Object> buildSinkNode(
            GuideMultiJobContent.WorkflowTargetConfig target,
            List<String> sinkTables) {

        boolean multiTable = sinkTables.size() > 1;
        String firstSinkTable = firstTable(sinkTables);

        Map<String, Object> config = new LinkedHashMap<>();

        putIfNotBlank(config, "dataSourceId", target.getDatasourceId());
        putIfNotBlank(config, "dbType", target.getDbType());
        putIfNotBlank(config, "connectorType", target.getConnectorType());
        putIfNotBlank(config, "pluginName", target.getPluginName());

        /*
         * 单表兼容字段。
         * 当前 AbstractJdbcBatchBuilder sink 侧会读取：
         * sql / targetTableName / table。
         */
        config.put("table", firstSinkTable);
        config.put("table_path", firstSinkTable);
        config.put("targetTableName", firstSinkTable);

        /*
         * 多表上下文字段。
         */
        config.put(KEY_MULTI_TABLE, multiTable);
        config.put(KEY_TABLE_LIST, sinkTables);
        config.put(KEY_SINK_TABLE_LIST, sinkTables);

        /*
         * 前端字段命名。
         */
        putIfNotBlank(config, "dataSaveMode", target.getDataSaveMode());
        putIfNotBlank(config, "schemaSaveMode", target.getSchemaSaveMode());
        putIfNotBlank(config, "fieldIde", target.getFieldIde());

        /*
         * 兼容偏 HOCON / builder 的字段命名。
         */
        putIfNotBlank(config, "data_save_mode", target.getDataSaveMode());
        putIfNotBlank(config, "schema_save_mode", target.getSchemaSaveMode());
        putIfNotBlank(config, "field_ide", target.getFieldIde());

        if (target.getBatchSize() != null) {
            config.put("batchSize", target.getBatchSize());
            config.put("batch_size", target.getBatchSize());
        }

        if (target.getEnableUpsert() != null) {
            config.put("enableUpsert", target.getEnableUpsert());
            config.put("enable_upsert", target.getEnableUpsert());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("nodeType", NODE_TYPE_SINK);
        data.put("title", defaultIfBlank(target.getDbType(), "Sink"));

        data.put("dataSourceId", target.getDatasourceId());
        data.put("dbType", target.getDbType());
        data.put("connectorType", target.getConnectorType());
        data.put("pluginName", target.getPluginName());

        data.putAll(config);
        data.put("config", config);

        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", SINK_NODE_ID);
        node.put("type", NODE_TYPE_SINK);
        node.put("data", data);

        return node;
    }

    private void validateCommand(GuideMultiJobSaveCommand command) {
        if (command == null) {
            throw new IllegalArgumentException("command can not be null");
        }

        if (command.getBasic() == null) {
            throw new IllegalArgumentException("basic can not be null");
        }

        if (command.getContent() == null) {
            throw new IllegalArgumentException("content can not be null");
        }

        GuideMultiJobContent content = command.getContent();

        if (content.getSource() == null) {
            throw new IllegalArgumentException("content.source can not be null");
        }

        if (content.getTarget() == null) {
            throw new IllegalArgumentException("content.target can not be null");
        }

        if (content.getTableMatch() == null) {
            throw new IllegalArgumentException("content.tableMatch can not be null");
        }

        validateSource(content.getSource());
        validateTarget(content.getTarget());
    }

    private void validateSource(GuideMultiJobContent.WorkflowSourceConfig source) {
        if (StringUtils.isBlank(source.getDatasourceId())) {
            throw new IllegalArgumentException("source.datasourceId can not be blank");
        }

        if (StringUtils.isBlank(source.getDbType())) {
            throw new IllegalArgumentException("source.dbType can not be blank");
        }

        if (StringUtils.isBlank(source.getConnectorType())) {
            throw new IllegalArgumentException("source.connectorType can not be blank");
        }

        if (StringUtils.isBlank(source.getPluginName())) {
            throw new IllegalArgumentException("source.pluginName can not be blank");
        }
    }

    private void validateTarget(GuideMultiJobContent.WorkflowTargetConfig target) {
        if (StringUtils.isBlank(target.getDatasourceId())) {
            throw new IllegalArgumentException("target.datasourceId can not be blank");
        }

        if (StringUtils.isBlank(target.getDbType())) {
            throw new IllegalArgumentException("target.dbType can not be blank");
        }

        if (StringUtils.isBlank(target.getConnectorType())) {
            throw new IllegalArgumentException("target.connectorType can not be blank");
        }

        if (StringUtils.isBlank(target.getPluginName())) {
            throw new IllegalArgumentException("target.pluginName can not be blank");
        }
    }

    private void validateTables(List<String> sourceTables, List<String> sinkTables) {
        if (CollectionUtils.isEmpty(sourceTables)) {
            throw new IllegalArgumentException("source tables can not be empty");
        }

        if (CollectionUtils.isEmpty(sinkTables)) {
            throw new IllegalArgumentException("sink tables can not be empty");
        }

        if (sourceTables.size() != sinkTables.size()) {
            throw new IllegalArgumentException("source tables and sink tables size must be equal");
        }

        /*
         * 这里不再限制 size > 1。
         *
         * 因为 AbstractJdbcBatchBuilder 已经会兼容：
         * - multiTable
         * - table_list
         * - source_table_list
         * - sink_table_list
         *
         * 但当前仍然会补 table / targetTableName 作为单表兜底。
         * 后续真正多表执行时，可以根据 multiTable 和 table_list 展开子任务。
         */
    }

    private String firstTable(List<String> tables) {
        if (CollectionUtils.isEmpty(tables)) {
            return "";
        }

        for (String table : tables) {
            if (StringUtils.isNotBlank(table)) {
                return table.trim();
            }
        }

        return "";
    }

    private void putIfNotBlank(Map<String, Object> map, String key, String value) {
        if (StringUtils.isNotBlank(value)) {
            map.put(key, value.trim());
        }
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return StringUtils.isBlank(value) ? defaultValue : value.trim();
    }
}