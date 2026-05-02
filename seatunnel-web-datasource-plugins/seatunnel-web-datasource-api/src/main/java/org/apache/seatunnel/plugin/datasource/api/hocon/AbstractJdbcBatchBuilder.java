package org.apache.seatunnel.plugin.datasource.api.hocon;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.seatunnel.plugin.datasource.api.hocon.table.*;
import org.apache.seatunnel.plugin.datasource.api.jdbc.AbstractJdbcHoconBuilder;
import org.apache.seatunnel.plugin.datasource.api.jdbc.JdbcConnectionProvider;
import org.apache.seatunnel.web.common.enums.HoconBuildStage;
import org.apache.seatunnel.web.common.modal.JdbcQueryRenderContext;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractJdbcBatchBuilder extends AbstractJdbcHoconBuilder
        implements DataSourceHoconBuilder {

    private final JdbcSourceTargetRouter sourceTargetRouter;
    private final JdbcSinkTargetRouter sinkTargetRouter;
    private final JdbcSourceOptionAppender sourceOptionAppender;
    private final JdbcSinkOptionAppender sinkOptionAppender;
    private final JdbcExtraOptionAppender extraOptionAppender;

    protected String handleQuery(String query, JdbcQueryRenderContext context) {
        return query;
    }

    protected AbstractJdbcBatchBuilder() {
        JdbcTableNameResolver tableNameResolver = new JdbcTableNameResolver();

        JdbcSourceTargetBuilder singleSourceBuilder =
                new JdbcSingleSourceTargetBuilder(
                        tableNameResolver,
                        this::handleQuery);

        JdbcSourceTargetBuilder multiSourceBuilder =
                new JdbcMultiSourceTargetBuilder(tableNameResolver);

        JdbcSinkTargetBuilder singleSinkBuilder =
                new JdbcSingleSinkTargetBuilder(tableNameResolver);

        JdbcSinkTargetBuilder multiSinkBuilder =
                new JdbcMultiSinkTargetBuilder();

        this.sourceTargetRouter = new JdbcSourceTargetRouter(
                tableNameResolver,
                singleSourceBuilder,
                multiSourceBuilder);

        this.sinkTargetRouter = new JdbcSinkTargetRouter(
                tableNameResolver,
                singleSinkBuilder,
                multiSinkBuilder);

        this.sourceOptionAppender = new JdbcSourceOptionAppender();
        this.sinkOptionAppender = new JdbcSinkOptionAppender();
        this.extraOptionAppender = new JdbcExtraOptionAppender();
    }

    @Override
    protected String defaultDriver() {
        return "com.mysql.cj.jdbc.Driver";
    }

    @Override
    public Config buildSourceHocon(String connectionParam,
                                   Config config,
                                   JdbcConnectionProvider jdbcConnectionProvider,
                                   HoconBuildStage stage) {
        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(32);

        putConnCommon(conn, map);

        sourceTargetRouter.build(config, conn, map, stage);
        sourceOptionAppender.append(config, map);
        extraOptionAppender.append(config, map);

        return ConfigFactory.parseMap(map);
    }

    @Override
    public Config buildSinkHocon(String connectionParam, Config config) {
        Config conn = ConfigFactory.parseString(connectionParam);
        Map<String, Object> map = new HashMap<>(32);

        putConnCommon(conn, map);

        sinkTargetRouter.build(config, conn, map);
        sinkOptionAppender.append(config, map);
        extraOptionAppender.append(config, map);

        return ConfigFactory.parseMap(map);
    }

    protected String handleQueryByStage(String query, HoconBuildStage stage) {
        return query;
    }

    public abstract String pluginName();

    @Override
    public String sourceTemplate() {
        return ""
                + "  Jdbc {\n"
                + "    url = \"jdbc:mysql://127.0.0.1:3306/demo\"\n"
                + "    user = \"root\"\n"
                + "    password = \"******\"\n"
                + "    driver = \"" + defaultDriver() + "\"\n"
                + "    table_path = \"demo.demo_table\"\n"
                + "    fetch_size = 1000\n"
                + "  }\n";
    }

    @Override
    public String sinkTemplate() {
        return ""
                + "  Jdbc {\n"
                + "    url = \"jdbc:mysql://127.0.0.1:3306/demo\"\n"
                + "    user = \"root\"\n"
                + "    password = \"******\"\n"
                + "    driver = \"" + defaultDriver() + "\"\n"
                + "    table = \"sink_table\"\n"
                + "    generate_sink_sql = true\n"
                + "    data_save_mode = \"APPEND_DATA\"\n"
                + "    schema_save_mode = \"CREATE_SCHEMA_WHEN_NOT_EXIST\"\n"
                + "    batch_size = 1000\n"
                + "  }\n";
    }
}