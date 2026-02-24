package org.apache.seatunnel.admin.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobMetricsPO;

import java.util.List;
import java.util.Map;

@Mapper
public interface SeatunnelJobMetricsMapper extends BaseMapper<SeatunnelJobMetricsPO> {

    Map<String, Object> selectOverviewSummary(@Param("startTime") String startTime,
                                              @Param("endTime") String endTime,
                                              @Param("taskType") String taskType);

    List<Map<String, Object>> selectRecordsTrend(@Param("startTime") String startTime,
                                                 @Param("endTime") String endTime,
                                                 @Param("taskType") String taskType,
                                                 @Param("granularity") String granularity);

    List<Map<String, Object>> selectBytesTrend(@Param("startTime") String startTime,
                                               @Param("endTime") String endTime,
                                               @Param("taskType") String taskType,
                                               @Param("granularity") String granularity);

    List<Map<String, Object>> selectRecordsSpeedTrend(@Param("startTime") String startTime,
                                                      @Param("endTime") String endTime,
                                                      @Param("taskType") String taskType,
                                                      @Param("granularity") String granularity);

    List<Map<String, Object>> selectBytesSpeedTrend(@Param("startTime") String startTime,
                                                    @Param("endTime") String endTime,
                                                    @Param("taskType") String taskType,
                                                    @Param("granularity") String granularity);
}
