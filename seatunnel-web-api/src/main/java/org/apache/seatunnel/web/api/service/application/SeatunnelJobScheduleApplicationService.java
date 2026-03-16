package org.apache.seatunnel.web.api.service.application;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.service.SeaTunnelJobScheduleService;
import org.apache.seatunnel.web.common.enums.ScheduleStatusEnum;
import org.apache.seatunnel.web.dao.entity.JobSchedule;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelJobScheduleDTO;
import org.quartz.SchedulerException;
import org.springframework.stereotype.Service;

@Service
public class SeatunnelJobScheduleApplicationService {

    @Resource
    private SeaTunnelJobScheduleService seatunnelJobScheduleService;

    public void saveOrUpdateSchedule(Long jobDefinitionId, SeatunnelBatchJobDefinitionDTO dto) {
        if (dto.getScheduleStatus() == null || StringUtils.isBlank(dto.getCronExpression())) {
            return;
        }

        JobSchedule existing =
                seatunnelJobScheduleService.getByTaskDefinitionId(jobDefinitionId);

        SeatunnelJobScheduleDTO scheduleDTO = new SeatunnelJobScheduleDTO();
        scheduleDTO.setJobDefinitionId(jobDefinitionId);
        scheduleDTO.setCronExpression(dto.getCronExpression());
        scheduleDTO.setScheduleStatus(dto.getScheduleStatus());
        scheduleDTO.setScheduleConfig(dto.getScheduleConfig());

        try {
            Long scheduleId;
            if (existing == null) {
                scheduleId = seatunnelJobScheduleService.createTaskSchedule(scheduleDTO);
            } else {
                scheduleDTO.setId(existing.getId());
                seatunnelJobScheduleService.updateTaskSchedule(scheduleDTO);
                scheduleId = existing.getId();
            }

            if (ScheduleStatusEnum.ACTIVE.equals(dto.getScheduleStatus())) {
                seatunnelJobScheduleService.stopSchedule(scheduleId);
                seatunnelJobScheduleService.startSchedule(scheduleId);
            }
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to save or update schedule", e);
        }
    }

    public void removeSchedule(Long jobDefinitionId) {
        seatunnelJobScheduleService.removeByDefinitionId(jobDefinitionId);
    }

    public JobSchedule getByTaskDefinitionId(Long jobDefinitionId) {
        return seatunnelJobScheduleService.getByTaskDefinitionId(jobDefinitionId);
    }
}