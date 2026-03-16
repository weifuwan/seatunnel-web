package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.seatunnel.web.dao.entity.CdcServerId;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface CdcServerIdMapper extends BaseMapper<CdcServerId> {

//    default List<Integer> selectAllocatedByJob(String jobId) {
//        return this.selectList(new QueryWrapper<CdcServerId>()
//                .eq("job_id", jobId))
//                .stream().map(CdcServerId::getServerId).collect(Collectors.toList());
//    }
//
//    default List<Integer> selectFreeIds(int limit) {
//        return this.selectList(new QueryWrapper<CdcServerId>()
//                .isNull("job_id")
//                .last("LIMIT " + limit + " FOR UPDATE")) // lock for transaction
//                .stream().map(CdcServerId::getServerId).collect(Collectors.toList());
//    }
//
//    default void markAllocated(String jobId, List<Integer> ids) {
//        ids.forEach(id -> {
//            this.update(new CdcServerId(), new UpdateWrapper<CdcServerId>()
//                    .eq("server_id", id)
//                    .set("job_id", jobId)
//                    .set("allocated_at", java.time.LocalDateTime.now()));
//        });
//    }
//
//    default void releaseByJob(String jobId) {
//        this.update(new CdcServerId(), new UpdateWrapper<CdcServerId>()
//                .eq("job_id", jobId)
//                .set("job_id", null)
//                .set("allocated_at", null));
//    }
}

