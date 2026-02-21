package org.apache.seatunnel.admin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobScheduleDTO;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobSchedulePO;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;
import org.quartz.SchedulerException;

import java.util.List;

/**
 * Service interface for managing SeaTunnel job schedules.
 * <p>
 * This service provides operations for creating, updating, triggering,
 * starting, stopping, and querying Quartz-based job schedules.
 */
public interface SeatunnelJobScheduleService extends IService<SeatunnelJobSchedulePO> {

    /**
     * Create a new task schedule.
     *
     * @param seatunnelJobScheduleDTO schedule definition data
     * @return the generated task schedule ID
     * @throws SchedulerException if scheduler creation fails
     */
    Long createTaskSchedule(SeatunnelJobScheduleDTO seatunnelJobScheduleDTO)
            throws SchedulerException;

    /**
     * Update an existing task schedule.
     *
     * @param seatunnelJobScheduleDTO updated schedule definition data
     * @return true if update is successful, false otherwise
     * @throws SchedulerException if scheduler update fails
     */
    boolean updateTaskSchedule(SeatunnelJobScheduleDTO seatunnelJobScheduleDTO)
            throws SchedulerException;

    /**
     * Delete a task schedule by task definition ID.
     *
     * @param taskDefinitionId the task definition ID
     * @return true if deletion is successful, false otherwise
     */
    boolean deleteByTaskDefinitionId(Long taskDefinitionId);

    /**
     * Get a task schedule by task definition ID.
     *
     * @param taskDefinitionId the task definition ID
     * @return the task schedule persistent object
     */
    SeatunnelJobSchedulePO getByTaskDefinitionId(Long taskDefinitionId);

    /**
     * Start a scheduled task.
     *
     * @param taskScheduleId the task schedule ID
     * @return true if the schedule is started successfully
     */
    Boolean startSchedule(Long taskScheduleId);

    /**
     * Stop a scheduled task.
     *
     * @param taskScheduleId the task schedule ID
     * @return true if the schedule is stopped successfully
     */
    Boolean stopSchedule(Long taskScheduleId);

    /**
     * Trigger a schedule to execute immediately.
     *
     * @param taskScheduleId the task schedule ID
     * @return true if triggered successfully
     * @throws SchedulerException if trigger execution fails
     */
    boolean triggerSchedule(Long taskScheduleId)
            throws SchedulerException;

    /**
     * Update the cron expression of a schedule.
     *
     * @param taskScheduleId the task schedule ID
     * @param cronExpression the new cron expression
     * @return true if update is successful
     * @throws SchedulerException if scheduler update fails
     */
    boolean updateScheduleTime(Long taskScheduleId, String cronExpression)
            throws SchedulerException;

    /**
     * Get all currently running schedules.
     *
     * @return list of running task schedules
     */
    List<SeatunnelJobSchedulePO> getRunningSchedules();

    /**
     * Check whether a schedule exists for the given task definition ID.
     *
     * @param taskDefinitionId the task definition ID
     * @return true if the schedule exists, false otherwise
     */
    boolean existsByTaskDefinitionId(Long taskDefinitionId);

    /**
     * Update the status of a schedule.
     *
     * @param taskScheduleId the task schedule ID
     * @param status         the new schedule status
     * @return true if update is successful
     */
    boolean updateScheduleStatus(Long taskScheduleId, ScheduleStatusEnum status);

    /**
     * Update the last execution time of a schedule.
     *
     * @param taskScheduleId the task schedule ID
     * @return true if update is successful
     */
    boolean updateLastScheduleTime(Long taskScheduleId);

    /**
     * Update the next execution time of a schedule.
     *
     * @param taskScheduleId   the task schedule ID
     * @param nextScheduleTime the next scheduled execution time
     * @return true if update is successful
     */
    boolean updateNextScheduleTime(Long taskScheduleId, java.util.Date nextScheduleTime);

    /**
     * Calculate the last 5 execution times based on a cron expression.
     *
     * @param cronExpression the cron expression
     * @return list of formatted execution times
     */
    List<String> getLast5ExecutionTimesByCron(String cronExpression);

    void removeByDefinitionId(Long id);
}
