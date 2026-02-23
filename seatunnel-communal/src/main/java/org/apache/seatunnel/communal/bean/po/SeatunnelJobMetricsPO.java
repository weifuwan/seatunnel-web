package org.apache.seatunnel.communal.bean.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Persistence object representing job-level metrics for a SeaTunnel job instance.
 * <p>
 * This entity maps to table: t_seatunnel_job_metrics
 * <p>
 * It stores aggregated runtime metrics such as throughput, QPS,
 * data volume, delay, and data quality indicators.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("t_seatunnel_job_metrics")
public class SeatunnelJobMetricsPO {

    /**
     * Primary key.
     * Uses INPUT strategy — ID must be manually assigned.
     */
    @TableId(value = "id", type = IdType.INPUT)
    private Long id;

    /**
     * Unique identifier of the job instance.
     */
    private Long jobInstanceId;

    /**
     * Job definition ID
     */
    private Long jobDefinitionId;

    /**
     * Pipeline ID within the job.
     * A single job may contain multiple pipelines.
     */
    private Integer pipelineId;

    /**
     * Total number of rows read from source(s).
     */
    private long readRowCount;

    /**
     * Total number of rows written to sink(s).
     */
    private long writeRowCount;

    /**
     * Current read QPS (rows per second).
     */
    private long readQps;

    /**
     * Current write QPS (rows per second).
     */
    private long writeQps;

    /**
     * End-to-end record delay in milliseconds.
     */
    private long recordDelay;

    /**
     * Record creation timestamp.
     */
    private Date createTime;

    /**
     * Last update timestamp.
     */
    private Date updateTime;

    /**
     * Total bytes read from source(s).
     */
    private Long readBytes;

    /**
     * Total bytes written to sink(s).
     */
    private Long writeBytes;

    /**
     * Read throughput in bytes per second.
     */
    private Long readBps;

    /**
     * Write throughput in bytes per second.
     */
    private Long writeBps;

    /**
     * Size of intermediate processing queue.
     * Indicates buffering/backpressure level.
     */
    private Long intermediateQueueSize;

    /**
     * Lag count (e.g., unprocessed records or backlog).
     */
    private long lagCount;

    /**
     * Data loss rate (0.0 - 1.0).
     */
    private double lossRate;

    /**
     * Average size per row in bytes.
     */
    private long avgRowSize;
}