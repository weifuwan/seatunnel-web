package org.apache.seatunnel.web.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.seatunnel.web.common.enums.JobStatus;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.dao.mapper.JobInstanceMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.JobInstanceDao;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.vo.JobInstanceVO;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public class JobInstanceDaoImpl
        extends BaseDao<JobInstance, JobInstanceMapper>
        implements JobInstanceDao {

    @Resource
    private JobInstanceMapper jobInstanceMapper;

    public JobInstanceDaoImpl(@NonNull JobInstanceMapper jobInstanceMapper) {
        super(jobInstanceMapper);
    }

    @Override
    public IPage<JobInstanceVO> pageWithDefinition(SeaTunnelJobInstanceDTO dto) {
        long pageNo = dto.getPageNo() == null || dto.getPageNo() < 1 ? 1 : dto.getPageNo();
        long pageSize = dto.getPageSize() == null || dto.getPageSize() < 1 ? 10 : dto.getPageSize();

        Page<JobInstanceVO> page = new Page<>(pageNo, pageSize);
        return jobInstanceMapper.pageWithDefinition(page, dto);
    }

    @Override
    public boolean existsRunningInstance(Long definitionId) {
        LambdaQueryWrapper<JobInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobInstance::getJobDefinitionId, definitionId)
                .in(JobInstance::getJobStatus,
                        JobStatus.INITIALIZING,
                        JobStatus.CREATED,
                        JobStatus.PENDING,
                        JobStatus.SCHEDULED,
                        JobStatus.RUNNING,
                        JobStatus.FAILING,
                        JobStatus.DOING_SAVEPOINT,
                        JobStatus.CANCELING);

        Long count = jobInstanceMapper.selectCount(wrapper);
        return count != null && count > 0;
    }

    @Override
    public void deleteByDefinitionId(Long definitionId) {
        LambdaQueryWrapper<JobInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobInstance::getJobDefinitionId, definitionId);
        jobInstanceMapper.delete(wrapper);
    }

    @Override
    public void updateStatus(Long instanceId, JobStatus status, String errorMessage) {
        boolean endState = status.isEndState();
        Date now = new Date();

        LambdaUpdateWrapper<JobInstance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(JobInstance::getId, instanceId)
                .set(JobInstance::getJobStatus, status)
                .set(JobInstance::getUpdateTime, now);

        if (errorMessage != null && !errorMessage.isBlank()) {
            wrapper.set(JobInstance::getErrorMessage, truncate(errorMessage, 2000));
        }
        if (endState) {
            wrapper.set(JobInstance::getEndTime, now);
        }

        jobInstanceMapper.update(null, wrapper);
    }

    @Override
    public void updateStatusAndEngineId(Long instanceId, JobStatus status, String engineJobId) {
        boolean endState = status.isEndState();
        Date now = new Date();

        LambdaUpdateWrapper<JobInstance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(JobInstance::getId, instanceId)
                .set(JobInstance::getJobStatus, status)
                .set(JobInstance::getUpdateTime, now);

        if (engineJobId != null && !engineJobId.isBlank()) {
            wrapper.set(JobInstance::getEngineJobId, engineJobId);
        }
        if (endState) {
            wrapper.set(JobInstance::getEndTime, now);
        }

        jobInstanceMapper.update(null, wrapper);
    }

    @Override
    public void updateSubmitResult(Long instanceId, Long engineJobId, JobStatus submitStatus, Date submitTime) {
        JobInstance update = new JobInstance();
        update.setId(instanceId);
        update.setEngineJobId(engineJobId);
        update.setJobStatus(submitStatus);
        update.setSubmitTime(submitTime);
        update.setUpdateTime(new Date());

        if (JobStatus.RUNNING.equals(submitStatus)
                || JobStatus.INITIALIZING.equals(submitStatus)
                || JobStatus.PENDING.equals(submitStatus)
                || JobStatus.SCHEDULED.equals(submitStatus)) {
            update.setStartTime(submitTime);
        }

        jobInstanceMapper.updateById(update);
    }

    private String truncate(String text, int maxLength) {
        if (text == null) {
            return null;
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }
}