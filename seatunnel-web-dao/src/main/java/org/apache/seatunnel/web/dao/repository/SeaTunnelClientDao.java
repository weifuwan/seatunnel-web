package org.apache.seatunnel.web.dao.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;

import java.util.List;

public interface SeaTunnelClientDao extends IDao<SeaTunnelClient> {


    SeaTunnelClient selectById(Long clientId);
}