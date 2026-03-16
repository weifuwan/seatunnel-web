package org.apache.seatunnel.web.dao.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.seatunnel.web.dao.entity.JobInstance;
import org.apache.seatunnel.web.spi.bean.dto.SeatunnelJobInstanceDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeatunnelJobInstanceVO;

@Mapper
public interface JobInstanceMapper extends BaseMapper<JobInstance> {
    IPage<SeatunnelJobInstanceVO> pageWithDefinition(
            Page<?> page,
            @Param("dto") SeatunnelJobInstanceDTO dto);

}
