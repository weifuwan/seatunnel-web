CREATE DATABASE IF NOT EXISTS seatunnel_web;

use seatunnel_web;

CREATE TABLE IF NOT EXISTS `t_seatunnel_datasource`
(
    `id`                bigint NOT NULL COMMENT '主键',
    `db_name`           varchar(64)   DEFAULT NULL COMMENT '数据源名称',
    `db_type`           varchar(64)   DEFAULT NULL COMMENT '数据源类型',
    `original_json`     text COMMENT '原始JSON',
    `connection_params` text COMMENT '数据库连接参数',
    `environment`       varchar(200)  DEFAULT NULL COMMENT '环境',
    `remark`            varchar(2048) DEFAULT NULL COMMENT '描述',
    `conn_status`       varchar(24)   DEFAULT NULL COMMENT '连接状态',
    `create_time`       datetime      DEFAULT NULL COMMENT '创建时间',
    `update_time`       datetime      DEFAULT NULL COMMENT '最后更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据集成-数据源';


CREATE TABLE IF NOT EXISTS `t_seatunnel_datasource_plugin_config`
(
    `id`            varchar(32) NOT NULL COMMENT '主键',
    `plugin_type`   varchar(50) NOT NULL COMMENT '插件类型: mysql, postgresql, oracle, etc',
    `config_schema` text        NOT NULL COMMENT '配置字段的JSON schema',
    `create_time`   datetime DEFAULT NULL COMMENT '创建时间',
    `update_time`   datetime DEFAULT NULL COMMENT '最后更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据同步-数据源插件动态配置表';



CREATE TABLE IF NOT EXISTS `t_seatunnel_job_definition`
(
    `id`                  bigint                                  NOT NULL COMMENT '主键ID',
    `job_name`            varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '作业名称',
    `job_desc`            varchar(500) COLLATE utf8mb4_unicode_ci                        DEFAULT NULL COMMENT '作业描述',
    `job_definition_info` longtext COLLATE utf8mb4_unicode_ci     NOT NULL COMMENT '作业定义信息(JSON格式)',
    `job_version`         int                                     NOT NULL               DEFAULT '1' COMMENT '作业版本号',
    `client_id`           bigint                                                         DEFAULT NULL COMMENT '客户端ID',
    `create_time`         datetime                                NOT NULL               DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`         datetime                                NOT NULL               DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `whole_sync`          tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether to perform a full data synchronization (1: full, 0: incremental)',
    `source_type`         varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  DEFAULT NULL COMMENT '作业的源类型（逗号分隔）',
    `sink_type`           varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  DEFAULT NULL COMMENT '作业的目标类型（逗号分隔）',
    `parallelism`         int                                                            DEFAULT '1' COMMENT 'Parallelism level of the job execution',
    `source_table`        varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作业的源表（逗号分隔）',
    `sink_table`          varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '作业的目标表（逗号分隔）',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SeaTunnel作业定义表';



CREATE TABLE IF NOT EXISTS `t_seatunnel_job_instance`
(
    `id`                bigint   NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
    `job_definition_id` bigint   NOT NULL COMMENT 'Job definition ID, foreign key to t_seatunnel_job_definition.id',
    `job_config`        longtext COMMENT 'job configuration',
    `start_time`        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    `end_time`          datetime          DEFAULT NULL COMMENT 'End timestamp',
    `job_type`          varchar(10)       DEFAULT NULL COMMENT 'job type: BATCH,STREAMING',
    `job_status`        varchar(255)      DEFAULT NULL COMMENT 'job_status',
    `job_engine_id`     varchar(255)      DEFAULT NULL COMMENT 'job_engine_id',
    `log_path`          varchar(512)      DEFAULT NULL COMMENT '日志文件路径',
    `error_message`     longtext,
    `run_mode`          varchar(100)      DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20810177123553 DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `t_seatunnel_job_metrics`
(
    `id`                      bigint NOT NULL COMMENT '主键ID',
    `job_instance_id`         bigint NOT NULL COMMENT '任务实例ID',
    `pipeline_id`             int      DEFAULT NULL COMMENT 'pipeline ID',
    `read_row_count`          bigint   DEFAULT '0' COMMENT '读取行数',
    `write_row_count`         bigint   DEFAULT '0' COMMENT '写入行数',
    `read_qps`                bigint   DEFAULT '0' COMMENT '读取QPS',
    `write_qps`               bigint   DEFAULT '0' COMMENT '写入QPS',
    `read_bytes`              bigint   DEFAULT '0' COMMENT '读取字节数',
    `write_bytes`             bigint   DEFAULT '0' COMMENT '写入字节数',
    `read_bps`                bigint   DEFAULT '0' COMMENT '读取BPS(字节/秒)',
    `write_bps`               bigint   DEFAULT '0' COMMENT '写入BPS(字节/秒)',
    `intermediate_queue_size` bigint   DEFAULT '0' COMMENT '中间队列大小',
    `lag_count`               bigint   DEFAULT '0' COMMENT '滞后计数',
    `loss_rate`               double   DEFAULT '0' COMMENT '丢失率',
    `avg_row_size`            bigint   DEFAULT '0' COMMENT '平均行大小(字节)',
    `record_delay`            bigint   DEFAULT '0' COMMENT '数据延迟(ms)',
    `create_time`             datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`             datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `job_definition_id`       bigint   DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_instance_pipeline` (`job_instance_id`,`pipeline_id`),
    KEY                       `idx_job_instance_id` (`job_instance_id`),
    KEY                       `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Seatunnel任务运行指标表';



CREATE TABLE IF NOT EXISTS `t_seatunnel_job_schedule`
(
    `id`                 varchar(32)                                                  NOT NULL COMMENT '主键',
    `job_definition_id`  varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务定义ID',
    `cron_expression`    varchar(50)                                                  NOT NULL COMMENT 'Cron表达式',
    `schedule_status`    varchar(20) DEFAULT 'STOPPED' COMMENT '调度状态: STOPPED, RUNNING, PAUSED',
    `last_schedule_time` datetime    DEFAULT NULL COMMENT '最后调度时间',
    `next_schedule_time` datetime    DEFAULT NULL COMMENT '下次调度时间',
    `schedule_config`    text COMMENT '调度配置信息',
    `create_time`        datetime    DEFAULT NULL COMMENT '创建时间',
    `update_time`        datetime    DEFAULT NULL COMMENT '最后更新时间',
    KEY                  `idx_task_definition_id` (`job_definition_id`),
    KEY                  `idx_schedule_status` (`schedule_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='任务调度关联表';



CREATE TABLE IF NOT EXISTS `t_seatunnel_stream_job_definition`
(
    `id`                  bigint       NOT NULL COMMENT 'Primary key ID',
    `job_name`            varchar(255) NOT NULL COMMENT 'Job name',
    `job_desc`            varchar(512)                                                  DEFAULT NULL COMMENT 'Job description',
    `job_definition_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT 'Stream job definition JSON/HOCON',
    `job_type`            varchar(50)  NOT NULL COMMENT 'Job type (STREAM/BATCH)',
    `job_version`         int          NOT NULL                                         DEFAULT '1' COMMENT 'Job version',
    `client_id`           bigint       NOT NULL COMMENT 'Client ID',
    `parallelism`         int          NOT NULL                                         DEFAULT '1' COMMENT 'Parallelism level',
    `schedule_status`     varchar(50)                                                   DEFAULT 'OFFLINE' COMMENT 'Schedule status (ONLINE/OFFLINE/RUNNING/STOPPED)',
    `source_type`         varchar(100)                                                  DEFAULT NULL COMMENT 'Source type (mysql/kafka/etc)',
    `source_table`        varchar(255)                                                  DEFAULT NULL COMMENT 'Source table',
    `sink_type`           varchar(100)                                                  DEFAULT NULL COMMENT 'Sink type (mysql/hive/etc)',
    `sink_table`          varchar(255)                                                  DEFAULT NULL COMMENT 'Sink table',
    `create_time`         datetime     NOT NULL                                         DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`         datetime     NOT NULL                                         DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `plugin_name`         varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY                   `idx_client_id` (`client_id`),
    KEY                   `idx_job_name` (`job_name`),
    KEY                   `idx_schedule_status` (`schedule_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Seatunnel stream job definition table';

CREATE TABLE IF NOT EXISTS `t_seatunnel_cdc_server_ids`
(
    `server_id`    int NOT NULL,
    `job_id`       varchar(64) DEFAULT NULL,
    `allocated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`server_id`),
    UNIQUE KEY `uq_job_jobid_server` (`job_id`,`server_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for qrtz_blob_triggers
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_BLOB_TRIGGERS`;
CREATE TABLE `QRTZ_BLOB_TRIGGERS`
(
    `sched_name`    varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_name`  varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `blob_data`     blob NULL,
    PRIMARY KEY (`sched_name`, `trigger_name`, `trigger_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_calendars
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_CALENDARS`;
CREATE TABLE `QRTZ_CALENDARS`
(
    `sched_name`    varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `calendar_name` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `calendar`      blob                                                    NOT NULL,
    PRIMARY KEY (`sched_name`, `calendar_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_cron_triggers
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_CRON_TRIGGERS`;
CREATE TABLE `QRTZ_CRON_TRIGGERS`
(
    `sched_name`      varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_name`    varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group`   varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `cron_expression` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `time_zone_id`    varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    PRIMARY KEY (`sched_name`, `trigger_name`, `trigger_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_fired_triggers
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_FIRED_TRIGGERS`;
CREATE TABLE `QRTZ_FIRED_TRIGGERS`
(
    `sched_name`        varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `entry_id`          varchar(95) CHARACTER SET utf8 COLLATE utf8_general_ci  NOT NULL,
    `trigger_name`      varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group`     varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `instance_name`     varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `fired_time`        bigint(0) NOT NULL,
    `sched_time`        bigint(0) NOT NULL,
    `priority`          int(0) NOT NULL,
    `state`             varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci  NOT NULL,
    `job_name`          varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `job_group`         varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `is_nonconcurrent`  varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `requests_recovery` varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    PRIMARY KEY (`sched_name`, `entry_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_job_details
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_JOB_DETAILS`;
CREATE TABLE `QRTZ_JOB_DETAILS`
(
    `sched_name`        varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `job_name`          varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `job_group`         varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `description`       varchar(250) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `job_class_name`    varchar(250) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `is_durable`        varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci   NOT NULL,
    `is_nonconcurrent`  varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci   NOT NULL,
    `is_update_data`    varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci   NOT NULL,
    `requests_recovery` varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci   NOT NULL,
    `job_data`          blob NULL,
    PRIMARY KEY (`sched_name`, `job_name`, `job_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_locks
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_LOCKS`;
CREATE TABLE `QRTZ_LOCKS`
(
    `sched_name` varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `lock_name`  varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci  NOT NULL,
    PRIMARY KEY (`sched_name`, `lock_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_paused_trigger_grps
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_PAUSED_TRIGGER_GRPS`;
CREATE TABLE `QRTZ_PAUSED_TRIGGER_GRPS`
(
    `sched_name`    varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    PRIMARY KEY (`sched_name`, `trigger_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_scheduler_state
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_SCHEDULER_STATE`;
CREATE TABLE `QRTZ_SCHEDULER_STATE`
(
    `sched_name`        varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `instance_name`     varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `last_checkin_time` bigint(0) NOT NULL,
    `checkin_interval`  bigint(0) NOT NULL,
    PRIMARY KEY (`sched_name`, `instance_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_simple_triggers
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_SIMPLE_TRIGGERS`;
CREATE TABLE `QRTZ_SIMPLE_TRIGGERS`
(
    `sched_name`      varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_name`    varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group`   varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `repeat_count`    bigint(0) NOT NULL,
    `repeat_interval` bigint(0) NOT NULL,
    `times_triggered` bigint(0) NOT NULL,
    PRIMARY KEY (`sched_name`, `trigger_name`, `trigger_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_simprop_triggers
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_SIMPROP_TRIGGERS`;
CREATE TABLE `QRTZ_SIMPROP_TRIGGERS`
(
    `sched_name`    varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_name`  varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `str_prop_1`    varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `str_prop_2`    varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `str_prop_3`    varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `int_prop_1`    int(0) NULL DEFAULT NULL,
    `int_prop_2`    int(0) NULL DEFAULT NULL,
    `long_prop_1`   bigint(0) NULL DEFAULT NULL,
    `long_prop_2`   bigint(0) NULL DEFAULT NULL,
    `dec_prop_1`    decimal(13, 4) NULL DEFAULT NULL,
    `dec_prop_2`    decimal(13, 4) NULL DEFAULT NULL,
    `bool_prop_1`   varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `bool_prop_2`   varchar(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    PRIMARY KEY (`sched_name`, `trigger_name`, `trigger_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for qrtz_triggers
-- ----------------------------
DROP TABLE IF EXISTS `QRTZ_TRIGGERS`;
CREATE TABLE `QRTZ_TRIGGERS`
(
    `sched_name`     varchar(120) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_name`   varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `trigger_group`  varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `job_name`       varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `job_group`      varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    `description`    varchar(250) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `next_fire_time` bigint(0) NULL DEFAULT NULL,
    `prev_fire_time` bigint(0) NULL DEFAULT NULL,
    `priority`       int(0) NULL DEFAULT NULL,
    `trigger_state`  varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci  NOT NULL,
    `trigger_type`   varchar(8) CHARACTER SET utf8 COLLATE utf8_general_ci   NOT NULL,
    `start_time`     bigint(0) NOT NULL,
    `end_time`       bigint(0) NULL DEFAULT NULL,
    `calendar_name`  varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    `misfire_instr`  smallint(0) NULL DEFAULT NULL,
    `job_data`       blob NULL,
    PRIMARY KEY (`sched_name`, `trigger_name`, `trigger_group`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;
