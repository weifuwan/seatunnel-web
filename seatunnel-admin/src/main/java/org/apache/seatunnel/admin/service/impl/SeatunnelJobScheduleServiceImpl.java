package org.apache.seatunnel.admin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.dao.TaskScheduleMapper;
import org.apache.seatunnel.admin.quartz.QuartzJob;
import org.apache.seatunnel.admin.service.SeatunnelJobScheduleService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobScheduleDTO;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobSchedulePO;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;
import org.apache.seatunnel.communal.utils.ConvertUtil;
import org.apache.seatunnel.communal.utils.Utils;
import org.quartz.*;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Task Schedule Service Implementation
 */
@Slf4j
@Service
public class SeatunnelJobScheduleServiceImpl extends ServiceImpl<TaskScheduleMapper, SeatunnelJobSchedulePO> implements SeatunnelJobScheduleService {

    private final Scheduler scheduler;

    public SeatunnelJobScheduleServiceImpl(Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    @Override
    public Long createTaskSchedule(SeatunnelJobScheduleDTO seatunnelJobScheduleDTO) throws SchedulerException {
        log.info("Creating job schedule: {}", seatunnelJobScheduleDTO);

        if (existsByTaskDefinitionId(seatunnelJobScheduleDTO.getJobDefinitionId())) {
            throw new RuntimeException("Schedule configuration already exists for this job definition");
        }

        SeatunnelJobSchedulePO po = ConvertUtil.sourceToTarget(seatunnelJobScheduleDTO, SeatunnelJobSchedulePO.class);
        po.initInsert();
        boolean saveResult = save(po);
        if (!saveResult) {
            throw new RuntimeException("Failed to save job schedule configuration");
        }

        log.info("Task schedule created successfully, ID: {}", po.getId());
        return po.getId();
    }

    @Override
    public boolean updateTaskSchedule(SeatunnelJobScheduleDTO seatunnelJobScheduleDTO) throws SchedulerException {
        log.info("Updating task schedule: {}", seatunnelJobScheduleDTO);

        SeatunnelJobSchedulePO existingSchedule = getById(seatunnelJobScheduleDTO.getId());
        if (existingSchedule == null) {
            throw new RuntimeException("Task schedule configuration does not exist");
        }

        // Convert DTO to PO
        SeatunnelJobSchedulePO seatunnelJobSchedulePO = new SeatunnelJobSchedulePO();
        BeanUtils.copyProperties(seatunnelJobScheduleDTO, seatunnelJobSchedulePO);

        // Update database
        boolean updateResult = updateById(seatunnelJobSchedulePO);
        if (!updateResult) {
            throw new RuntimeException("Failed to update task schedule configuration");
        }

        log.info("Task schedule updated successfully, ID: {}", seatunnelJobScheduleDTO.getId());
        return true;
    }

    @Override
    public boolean deleteByTaskDefinitionId(Long taskDefinitionId) {
        log.info("Deleting schedule by task definition ID: {}", taskDefinitionId);

        SeatunnelJobSchedulePO taskSchedule = getByTaskDefinitionId(taskDefinitionId);
        if (taskSchedule == null) {
            log.warn("Schedule configuration not found for task definition ID: {}", taskDefinitionId);
            return true;
        }

        stopSchedule(taskSchedule.getId());

        LambdaQueryWrapper<SeatunnelJobSchedulePO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SeatunnelJobSchedulePO::getJobDefinitionId, taskDefinitionId);
        boolean removeResult = remove(queryWrapper);

        log.info("Schedule deletion by task definition ID completed: {}, Result: {}", taskDefinitionId, removeResult);
        return removeResult;
    }

    @Override
    public SeatunnelJobSchedulePO getByTaskDefinitionId(Long taskDefinitionId) {
        LambdaQueryWrapper<SeatunnelJobSchedulePO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SeatunnelJobSchedulePO::getJobDefinitionId, taskDefinitionId);
        return getOne(queryWrapper);
    }

    @Override
    public Boolean startSchedule(Long taskScheduleId) {
        log.info("Starting task schedule: {}", taskScheduleId);

        SeatunnelJobSchedulePO taskSchedule = getById(taskScheduleId);
        if (taskSchedule == null) {
            throw new RuntimeException("Task schedule configuration does not exist");
        }
        try {
            JobKey jobKey = JobKey.jobKey(taskScheduleId + "");

            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
                log.info("Deleted existing Job: {}", taskScheduleId);
            }

            JobDetail jobDetail = createJobDetail(taskSchedule);
            Trigger trigger = createTrigger(taskSchedule);

            scheduler.scheduleJob(jobDetail, trigger);
        } catch (SchedulerException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to start schedule");
        }

        Date nextExecutionTime = Utils.getNextExecutionTime(taskSchedule.getCronExpression());
        updateNextScheduleTime(taskScheduleId, nextExecutionTime);
        updateScheduleStatus(taskScheduleId, ScheduleStatusEnum.ACTIVE);

        log.info("Task schedule started successfully: {}", taskScheduleId);
        return true;
    }

    @Override
    public Boolean stopSchedule(Long taskScheduleId) {
        log.info("Stopping task schedule: {}", taskScheduleId);

        SeatunnelJobSchedulePO taskSchedule = getById(taskScheduleId);
        if (taskSchedule == null) {
            throw new RuntimeException("Task schedule configuration does not exist");
        }

        JobKey jobKey = JobKey.jobKey(taskScheduleId + "");
        try {
            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
            }
        } catch (SchedulerException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to stop schedule");
        }

        updateScheduleStatus(taskScheduleId, ScheduleStatusEnum.PAUSED);

        log.info("Task schedule stopped successfully: {}", taskScheduleId);
        return Boolean.TRUE;
    }

    @Override
    public boolean triggerSchedule(Long taskScheduleId) throws SchedulerException {
        log.info("Triggering task schedule immediately: {}", taskScheduleId);

        SeatunnelJobSchedulePO taskSchedule = getById(taskScheduleId);
        if (taskSchedule == null) {
            throw new RuntimeException("Task schedule configuration does not exist");
        }

        JobKey jobKey = JobKey.jobKey(taskScheduleId + "");
        scheduler.triggerJob(jobKey);

        log.info("Task schedule triggered successfully: {}", taskScheduleId);
        return true;
    }

    @Override
    public boolean updateScheduleTime(Long taskScheduleId, String cronExpression) throws SchedulerException {
        log.info("Updating schedule time: {}, Cron: {}", taskScheduleId, cronExpression);

        SeatunnelJobSchedulePO taskSchedule = getById(taskScheduleId);
        if (taskSchedule == null) {
            throw new RuntimeException("Task schedule configuration does not exist");
        }

        taskSchedule.setCronExpression(cronExpression);
        updateById(taskSchedule);

        if (ScheduleStatusEnum.ACTIVE.equals(taskSchedule.getScheduleStatus())) {
            stopSchedule(taskScheduleId);
            startSchedule(taskScheduleId);
        }

        log.info("Schedule time updated successfully: {}", taskScheduleId);
        return true;
    }

    @Override
    public List<SeatunnelJobSchedulePO> getRunningSchedules() {
        LambdaQueryWrapper<SeatunnelJobSchedulePO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SeatunnelJobSchedulePO::getScheduleStatus, "RUNNING");
        return list(queryWrapper);
    }

    @Override
    public boolean existsByTaskDefinitionId(Long taskDefinitionId) {
        LambdaQueryWrapper<SeatunnelJobSchedulePO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SeatunnelJobSchedulePO::getJobDefinitionId, taskDefinitionId);
        return count(queryWrapper) > 0;
    }

    @Override
    public boolean updateScheduleStatus(Long taskScheduleId, ScheduleStatusEnum status) {
        LambdaUpdateWrapper<SeatunnelJobSchedulePO> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.set(SeatunnelJobSchedulePO::getScheduleStatus, status)
                .eq(SeatunnelJobSchedulePO::getId, taskScheduleId);
        return update(updateWrapper);
    }

    @Override
    public boolean updateLastScheduleTime(Long taskScheduleId) {
        LambdaUpdateWrapper<SeatunnelJobSchedulePO> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.set(SeatunnelJobSchedulePO::getLastScheduleTime, new Date())
                .eq(SeatunnelJobSchedulePO::getId, taskScheduleId);
        return update(updateWrapper);
    }

    @Override
    public boolean updateNextScheduleTime(Long taskScheduleId, Date nextScheduleTime) {
        LambdaUpdateWrapper<SeatunnelJobSchedulePO> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.set(SeatunnelJobSchedulePO::getNextScheduleTime, nextScheduleTime)
                .eq(SeatunnelJobSchedulePO::getId, taskScheduleId);
        return update(updateWrapper);
    }

    /**
     * Get the last 5 execution times based on Cron expression
     *
     * @param cronExpression Cron expression
     * @return List of the last 5 execution time strings
     */
    @Override
    public List<String> getLast5ExecutionTimesByCron(String cronExpression) {
        if (StringUtils.isBlank(cronExpression)) {
            throw new RuntimeException("Cron expression cannot be empty");
        }

        String cleanedCron = cronExpression.trim().replaceAll("\\s+", " ");

        if (!isValidCronExpression(cleanedCron)) {
            throw new RuntimeException("Invalid cron expression format: " + cleanedCron);
        }

        SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        CronExpression expression = null;
        try {
            expression = new CronExpression(cleanedCron);
        } catch (ParseException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to parse cron expression: " + cleanedCron + ", Error: " + e.getMessage());
        }

        Date now = new Date();
        List<String> executionTimes = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            now = expression.getNextValidTimeAfter(now);
            if (now == null) {
                break;
            }
            executionTimes.add(DATE_FORMAT.format(now));
        }
        return executionTimes;
    }

    @Override
    public void removeByDefinitionId(Long definitionId) {

        if (definitionId == null) {
            return;
        }

        SeatunnelJobSchedulePO schedule =
                getByTaskDefinitionId(definitionId);

        if (schedule == null) {
            return;
        }

        try {

            // 如果是 ACTIVE 先停止
            if (ScheduleStatusEnum.ACTIVE.equals(schedule.getScheduleStatus())) {
                stopSchedule(schedule.getId());
            }

            removeById(schedule.getId());

        } catch (Exception e) {
            throw new RuntimeException("Failed to remove schedule", e);
        }
    }


    private boolean isValidCronExpression(String cronExpression) {
        String[] parts = cronExpression.split(" ");
        return parts.length == 5 || parts.length == 6;
    }

    private JobDetail createJobDetail(SeatunnelJobSchedulePO taskSchedule) {
        return JobBuilder.newJob(QuartzJob.class)
                .withIdentity(taskSchedule.getId() + "")
                .usingJobData("jobScheduleId", taskSchedule.getId())
                .usingJobData("jobDefinitionId", taskSchedule.getJobDefinitionId())
                .build();
    }

    private Trigger createTrigger(SeatunnelJobSchedulePO taskSchedule) {
        return TriggerBuilder.newTrigger()
                .withIdentity(taskSchedule.getId() + "")
                .withSchedule(CronScheduleBuilder.cronSchedule(taskSchedule.getCronExpression()))
                .build();
    }
}