package org.apache.seatunnel.admin.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.components.parser.JobDefinitionResolver;
import org.apache.seatunnel.admin.dao.SeatunnelJobDefinitionMapper;
import org.apache.seatunnel.admin.service.SeatunnelBatchJobDefinitionService;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.service.SeatunnelJobScheduleService;
import org.apache.seatunnel.admin.utils.DagUtil;
import org.apache.seatunnel.communal.bean.dto.SeatunnelBatchJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.dto.SeatunnelJobScheduleDTO;
import org.apache.seatunnel.communal.bean.entity.NodeTypes;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.SeatunnelBatchJobDefinitionPO;
import org.apache.seatunnel.communal.bean.po.SeatunnelJobSchedulePO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.apache.seatunnel.communal.enums.ScheduleStatusEnum;
import org.apache.seatunnel.communal.utils.ConvertUtil;
import org.quartz.SchedulerException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

@Service
public class SeatunnelBatchJobDefinitionServiceImpl
        extends ServiceImpl<SeatunnelJobDefinitionMapper, SeatunnelBatchJobDefinitionPO>
        implements SeatunnelBatchJobDefinitionService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();


    @Resource
    private SeatunnelJobInstanceService seatunnelJobInstanceService;

    @Resource
    private JobDefinitionResolver jobDefinitionResolver;

    @Resource
    private SeatunnelJobScheduleService seatunnelJobScheduleService;


    @Override
    public Long saveOrUpdate(SeatunnelBatchJobDefinitionDTO dto) {
        return upsert(dto);
    }

    public Long upsert(SeatunnelBatchJobDefinitionDTO dto) {

        if (dto == null || dto.getId() == null) {
            throw new IllegalArgumentException("DTO or ID cannot be null");
        }

        Long id = dto.getId();
        Date now = new Date();

        SeatunnelBatchJobDefinitionPO existing = getById(id);

        SeatunnelBatchJobDefinitionPO po;

        if (existing == null) {


            po = ConvertUtil.sourceToTarget(dto, SeatunnelBatchJobDefinitionPO.class);

            po.setId(id);
            po.setJobVersion(1);
            po.setCreateTime(now);
            po.setUpdateTime(now);

        } else {

            po = existing;

            if (StringUtils.isNotBlank(dto.getJobName())) {
                po.setJobName(dto.getJobName());
            }

            po.setJobDefinitionInfo(dto.getJobDefinitionInfo());
            po.setJobVersion(po.getJobVersion() + 1);
            po.setUpdateTime(now);
        }

        fillNodeInfo(po, dto);

        saveOrUpdate(po);

        handleSchedule(id, dto);

        return id;
    }


    @Override
    public SeatunnelBatchJobDefinitionVO selectById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        SeatunnelBatchJobDefinitionPO po = getById(id);

        if (po == null) {
            return null;
        }

        SeatunnelBatchJobDefinitionVO seatunnelBatchJobDefinitionVO = ConvertUtil.sourceToTarget(
                po,
                SeatunnelBatchJobDefinitionVO.class
        );
        SeatunnelJobSchedulePO byTaskDefinitionId = seatunnelJobScheduleService.getByTaskDefinitionId(id);
        seatunnelBatchJobDefinitionVO.setCronExpression(byTaskDefinitionId.getCronExpression());
        seatunnelBatchJobDefinitionVO.setScheduleStatus(byTaskDefinitionId.getScheduleStatus());
        return seatunnelBatchJobDefinitionVO;
    }


    @Override
    public PaginationResult<SeatunnelBatchJobDefinitionVO> paging(
            SeatunnelBatchJobDefinitionDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Job definition DTO cannot be null");
        }

        int offset = (dto.getPageNo() - 1) * dto.getPageSize();

        List<SeatunnelBatchJobDefinitionVO> voList =
                this.getBaseMapper()
                        .selectPageWithLatestInstance(
                                dto,
                                offset,
                                dto.getPageSize()
                        );

        Long total =
                this.getBaseMapper()
                        .selectDefinitionCount(dto.getJobName());

        return PaginationResult.buildSuc(
                voList,
                dto.getPageNo(),
                dto.getPageSize(),
                total
        );
    }


    @Override
    public Boolean delete(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Job definition ID cannot be null");
        }

        SeatunnelBatchJobDefinitionPO definition = getById(id);
        if (definition == null) {
            return false;
        }

        validateDelete(id);

        seatunnelJobScheduleService.removeByDefinitionId(id);

        seatunnelJobInstanceService.removeAllByDefinitionId(id);

        return removeById(id);
    }


    @Override
    public String buildHoconConfig(SeatunnelBatchJobDefinitionDTO dto) {

        if (dto == null || StringUtils.isBlank(dto.getJobDefinitionInfo())) {
            throw new IllegalArgumentException("Job definition info cannot be null");
        }

        if (dto.getWholeSync()) {
            return seatunnelJobInstanceService
                    .buildHoconConfigByWholeSync(dto);
        } else {
            return seatunnelJobInstanceService
                    .buildHoconConfig(dto);
        }
    }

    /**
     * Validate whether the job definition can be deleted.
     * <p>
     * Rules:
     * 1. The job cannot be deleted if there is any running instance.
     * 2. The job cannot be deleted if the schedule is still ACTIVE.
     *
     * @param id Job definition ID
     */
    private void validateDelete(Long id) {

        if (seatunnelJobInstanceService.existsRunningInstance(id)) {
            throw new IllegalStateException(
                    "Cannot delete job definition: running instance exists.");
        }

        SeatunnelJobSchedulePO schedule =
                seatunnelJobScheduleService.getByTaskDefinitionId(id);

        if (schedule != null
                && ScheduleStatusEnum.ACTIVE.equals(schedule.getScheduleStatus())) {

            throw new IllegalStateException(
                    "Please offline the schedule before deleting.");
        }
    }

    /**
     * Parse job definition and extract node metadata information.
     * <p>
     * This method:
     * 1. Parses DAG structure for normal jobs
     * 2. Resolves source/sink plugin types
     * 3. Extracts source and sink table mappings
     * 4. Serializes table mappings into JSON for persistence
     *
     * @param po  Persistent object to be filled
     * @param dto Job definition DTO
     */
    private void fillNodeInfo(SeatunnelBatchJobDefinitionPO po,
                              SeatunnelBatchJobDefinitionDTO dto) {

        String jobInfo = dto.getJobDefinitionInfo();

        NodeTypes nodeTypes;

        if (!Boolean.TRUE.equals(dto.getWholeSync())) {
            // Validate DAG structure before resolving
            DagUtil.parseAndCheck(jobInfo);
            nodeTypes = jobDefinitionResolver.resolveDag(jobInfo);

        } else {
            // Whole sync job resolution
            nodeTypes = jobDefinitionResolver.resolveWholeSync(jobInfo);
        }

        po.setSourceType(nodeTypes.getSourceTypes());
        po.setSinkType(nodeTypes.getSinkTypes());

        po.setSourceTable(toJson(nodeTypes.getSourceTableMap()));
        po.setSinkTable(toJson(nodeTypes.getSinkTableMap()));
    }

    /**
     * Serialize an object to JSON string.
     * <p>
     * If the object is null, return empty JSON object "{}".
     *
     * @param obj Object to serialize
     * @return JSON string
     */
    private String toJson(Object obj) {
        try {
            return obj == null ? "{}" : OBJECT_MAPPER.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize object to JSON", e);
        }
    }

    /**
     * Create or update schedule configuration for the job definition.
     * <p>
     * Logic:
     * 1. Skip if schedule status or cron expression is missing
     * 2. Create new schedule if not exists
     * 3. Update existing schedule if exists
     * 4. Restart scheduler if status is ACTIVE
     *
     * @param id  Job definition ID
     * @param dto Job definition DTO
     */
    private void handleSchedule(Long id, SeatunnelBatchJobDefinitionDTO dto) {

        if (dto.getScheduleStatus() == null
                || StringUtils.isBlank(dto.getCronExpression())) {
            return;
        }

        SeatunnelJobSchedulePO existing =
                seatunnelJobScheduleService.getByTaskDefinitionId(id);

        SeatunnelJobScheduleDTO scheduleDTO = new SeatunnelJobScheduleDTO();
        scheduleDTO.setJobDefinitionId(id);
        scheduleDTO.setCronExpression(dto.getCronExpression());
        scheduleDTO.setScheduleStatus(dto.getScheduleStatus());
        scheduleDTO.setScheduleConfig(dto.getScheduleConfig());

        try {

            Long scheduleId;

            if (existing == null) {
                scheduleId = seatunnelJobScheduleService
                        .createTaskSchedule(scheduleDTO);
            } else {
                scheduleDTO.setId(existing.getId());
                seatunnelJobScheduleService
                        .updateTaskSchedule(scheduleDTO);
                scheduleId = existing.getId();
            }

            if (ScheduleStatusEnum.ACTIVE.equals(dto.getScheduleStatus())) {

                seatunnelJobScheduleService.stopSchedule(scheduleId);
                seatunnelJobScheduleService.startSchedule(scheduleId);
            }

        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to handle schedule", e);
        }
    }
}
