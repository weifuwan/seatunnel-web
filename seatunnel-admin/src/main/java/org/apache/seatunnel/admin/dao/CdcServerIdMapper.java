package org.apache.seatunnel.admin.dao;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.communal.bean.po.CdcServerIdPO;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface CdcServerIdMapper extends BaseMapper<CdcServerIdPO> {

    default List<Integer> selectAllocatedByJob(String jobId) {
        return this.selectList(new QueryWrapper<CdcServerIdPO>()
                .eq("job_id", jobId))
                .stream().map(CdcServerIdPO::getServerId).collect(Collectors.toList());
    }

    default List<Integer> selectFreeIds(int limit) {
        return this.selectList(new QueryWrapper<CdcServerIdPO>()
                .isNull("job_id")
                .last("LIMIT " + limit + " FOR UPDATE")) // lock for transaction
                .stream().map(CdcServerIdPO::getServerId).collect(Collectors.toList());
    }

    default void markAllocated(String jobId, List<Integer> ids) {
        ids.forEach(id -> {
            this.update(new CdcServerIdPO(), new UpdateWrapper<CdcServerIdPO>()
                    .eq("server_id", id)
                    .set("job_id", jobId)
                    .set("allocated_at", java.time.LocalDateTime.now()));
        });
    }

    default void releaseByJob(String jobId) {
        this.update(new CdcServerIdPO(), new UpdateWrapper<CdcServerIdPO>()
                .eq("job_id", jobId)
                .set("job_id", null)
                .set("allocated_at", null));
    }
}

