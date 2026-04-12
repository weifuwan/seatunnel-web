package org.apache.seatunnel.web.api.service.application;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.JobScheduleService;
import org.apache.seatunnel.web.common.enums.ScheduleStatusEnum;
import org.apache.seatunnel.web.dao.entity.JobSchedule;
import org.apache.seatunnel.web.spi.bean.dto.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.JobScheduleConfig;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelJobScheduleDTO;
import org.quartz.SchedulerException;
import org.springframework.stereotype.Service;

@Service
public class JobScheduleApplicationService {

    @Resource
    private JobScheduleService jobScheduleService;

    public void saveOrUpdateSchedule(Long jobDefinitionId, JobDefinitionSaveCommand command) {
        if (jobDefinitionId == null || command == null) {
            return;
        }

        JobScheduleConfig scheduleConfig = command.getSchedule();
        if (scheduleConfig == null) {
            removeSchedule(jobDefinitionId);
            return;
        }

        String cronExpression = scheduleConfig.getCronExpression();
        ScheduleStatusEnum scheduleStatus = scheduleConfig.getScheduleStatus();

        if (StringUtils.isBlank(cronExpression) || scheduleStatus == null) {
            removeSchedule(jobDefinitionId);
            return;
        }

        JobSchedule existing = jobScheduleService.getByTaskDefinitionId(jobDefinitionId);

        SeaTunnelJobScheduleDTO scheduleDTO = new SeaTunnelJobScheduleDTO();
        scheduleDTO.setJobDefinitionId(jobDefinitionId);
        scheduleDTO.setCronExpression(cronExpression);
        scheduleDTO.setScheduleStatus(scheduleStatus);
        scheduleDTO.setScheduleConfig(scheduleConfig);

        try {
            Long scheduleId;
            if (existing == null) {
                scheduleId = jobScheduleService.createTaskSchedule(scheduleDTO);
            } else {
                scheduleDTO.setId(existing.getId());
                jobScheduleService.updateTaskSchedule(scheduleDTO);
                scheduleId = existing.getId();
            }

            if (ScheduleStatusEnum.ACTIVE == scheduleStatus) {
                jobScheduleService.stopSchedule(scheduleId);
                jobScheduleService.startSchedule(scheduleId);
            } else {
                jobScheduleService.stopSchedule(scheduleId);
            }
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to save or update schedule", e);
        }
    }

    public void removeSchedule(Long jobDefinitionId) {
        jobScheduleService.removeByDefinitionId(jobDefinitionId);
    }

    public JobSchedule getByTaskDefinitionId(Long jobDefinitionId) {
        return jobScheduleService.getByTaskDefinitionId(jobDefinitionId);
    }
}