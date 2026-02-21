package org.apache.seatunnel.communal;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;

import static java.util.stream.Collectors.toMap;

@Getter
public enum DbType {

    MYSQL("MYSQL", "MYSQL", "MYSQL"),
    POSTGRESQL("POSTGRESQL", "POSTGRESQL", "POSTGRESQL"),
    HIVE("HIVE", "HIVE", "HIVE"),
    HIVE3("HIVE3", "HIVE3", "HIVE3"),
    SPARK("SPARK", "SPARK", "SPARK"),
    ELASTICSEARCH("ELASTICSEARCH", "ELASTICSEARCH", "ELASTICSEARCH"),
    OPENGAUSS("OPENGAUSS", "OPENGAUSS", "OPENGAUSS"),
    CLICKHOUSE("CLICKHOUSE", "CLICKHOUSE", "CLICKHOUSE"),
    ORACLE("ORACLE", "ORACLE", "ORACLE"),
    SQLSERVER("SQLSERVER", "SQLSERVER", "SQLSERVER"),
    DB2("DB2", "DB2", "DB2"),
    PRESTO("PRESTO", "PRESTO", "PRESTO"),
    H2("H2", "H2", "H2"),
    REDSHIFT("REDSHIFT", "REDSHIFT", "REDSHIFT"),
    ATHENA("ATHENA", "ATHENA", "ATHENA"),
    TRINO("TRINO", "TRINO", "TRINO"),
    STARROCKS("STARROCKS", "STARROCKS", "STARROCKS"),
    AZURESQL("AZURESQL", "AZURESQL", "AZURESQL"),
    DAMENG("DAMENG", "DAMENG", "DAMENG"),
    OCEANBASE("OCEANBASE", "OCEANBASE", "OCEANBASE"),
    SSH("SSH", "SSH", "SSH"),
    KYUUBI("KYUUBI", "KYUUBI", "KYUUBI"),
    DATABEND("DATABEND", "DATABEND", "DATABEND"),
    SNOWFLAKE("SNOWFLAKE", "SNOWFLAKE", "SNOWFLAKE"),
    VERTICA("VERTICA", "VERTICA", "VERTICA"),
    HANA("HANA", "HANA", "HANA"),
    DORIS("DORIS", "DORIS", "DORIS"),
    ZEPPELIN("ZEPPELIN", "ZEPPELIN", "ZEPPELIN"),
    SAGEMAKER("SAGEMAKER", "SAGEMAKER", "SAGEMAKER"),
    OPENGUASS("OPENGUASS", "OPENGUASS", "OPENGUASS"),
    SQLITE("SQLITE", "SQLITE", "SQLITE"),
    CONSOLE("CONSOLE", "CONSOLE", "CONSOLE"),
    PAIMON("PAIMON", "PAIMON", "PAIMON"),
    CACHE("CACHE", "CACHE", "CACHE"),
    MONGODB("MONGODB", "MONGODB", "MONGODB"),
    LOCALFILE("LOCALFILE", "LOCALFILE", "LOCALFILE"),
    KINGBASE("KINGBASE", "KINGBASE", "KINGBASE"),
    TIDB("TIDB", "TIDB", "TIDB"),

    K8S("K8S", "K8S", "K8S"),

    ALIYUN_SERVERLESS_SPARK("ALIYUN_SERVERLESS_SPARK", "ALIYUN_SERVERLESS_SPARK", "ALIYUN SERVERLESS SPARK");

    private static final Map<String, DbType> DB_TYPE_MAP =
            Arrays.stream(DbType.values()).collect(toMap(DbType::getCode, Function.identity()));

    @EnumValue
    private final String code;
    private final String name;
    private final String descp;

    DbType(String code, String name, String descp) {
        this.code = code;
        this.name = name;
        this.descp = descp;
    }

    public static DbType of(String type) {
        if (DB_TYPE_MAP.containsKey(type)) {
            return DB_TYPE_MAP.get(type);
        }
        return null;
    }

    public static DbType ofName(String name) {
        return Arrays.stream(DbType.values()).filter(e -> e.name().equals(name)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("no such db type"));
    }
}

