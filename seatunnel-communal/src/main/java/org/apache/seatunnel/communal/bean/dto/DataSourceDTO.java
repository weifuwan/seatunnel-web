package org.apache.seatunnel.communal.bean.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.communal.DbType;
import org.apache.seatunnel.communal.bean.dto.pagination.PaginationBaseDTO;
import org.apache.seatunnel.communal.enums.ConnStatus;
import org.apache.seatunnel.communal.enums.EnvironmentEnum;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Data source DTO for creating and updating data sources")
public class DataSourceDTO extends PaginationBaseDTO {

    @Schema(
            description = "Data source ID (auto-generated for create, required for update)",
            example = "1001",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Long id;

    /**
     * Data source name
     */
    @Schema(
            description = "Data source name",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "MySQL-ProductDB"
    )
    private String dbName;

    /**
     * Data source type
     */
    @Schema(
            description = "Data source type",
            requiredMode = Schema.RequiredMode.REQUIRED,
            example = "MYSQL",
            allowableValues = {"MYSQL", "POSTGRESQL", "ORACLE", "SQLSERVER", "CLICKHOUSE", "KAFKA", "ELASTICSEARCH", "REDIS", "MONGODB", "HIVE", "HDFS", "S3"}
    )
    private DbType dbType;

    /**
     * Environment
     */
    @Schema(
            description = "Environment (DEV, TEST, PROD, etc.)",
            example = "PROD",
            allowableValues = {"DEV", "TEST", "PROD", "STAGING"}
    )
    private EnvironmentEnum environment;

    /**
     * Original JSON configuration
     */
    @Schema(
            description = "Original JSON configuration of the data source",
            example = """
            {
                "host": "localhost",
                "port": 3306,
                "database": "product_db",
                "username": "root",
                "password": "******",
                "properties": {
                    "useSSL": "false",
                    "serverTimezone": "UTC"
                }
            }
            """,
            nullable = true
    )
    private String originalJson;

    /**
     * Connection parameters
     */
    @Schema(
            description = "Connection parameters in key-value format",
            example = "{\"connectTimeout\":\"30000\",\"socketTimeout\":\"60000\"}",
            nullable = true
    )
    private String connectionParams;

    /**
     * Description/Remark
     */
    @Schema(
            description = "Data source description or remarks",
            example = "Main production database for user data",
            nullable = true
    )
    private String remark;

    /**
     * Connection status
     */
    @Schema(
            description = "Connection status (ACTIVE, INACTIVE, ERROR, etc.)",
            example = "ACTIVE",
            allowableValues = {"ACTIVE", "INACTIVE", "ERROR", "TESTING"}
    )
    private ConnStatus connStatus;
}