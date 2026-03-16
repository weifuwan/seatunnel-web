package org.apache.seatunnel.web.api.components;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.seatunnel.web.dao.entity.CdcServerId;
import org.apache.seatunnel.web.dao.mapper.CdcServerIdMapper;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class MysqlServerIdInitializer extends ServiceImpl<CdcServerIdMapper, CdcServerId> {

    private final CdcServerIdMapper mapper;

    public MysqlServerIdInitializer(CdcServerIdMapper mapper) {
        this.mapper = mapper;
    }

    public void initializeRange(int min, int max) {
        Date date = new Date();
        for (int i = min; i <= max; i++) {
            CdcServerId existing = mapper.selectById(i);
            if (existing == null) {
                CdcServerId po = new CdcServerId();
                po.setServerId(i);
                po.setAllocatedAt(date);
                mapper.insert(po);
            }
        }
    }

    public void release(String jobId) {
        mapper.releaseByJob(jobId);
    }
}

