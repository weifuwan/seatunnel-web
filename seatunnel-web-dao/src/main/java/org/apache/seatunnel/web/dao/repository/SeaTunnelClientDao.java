package org.apache.seatunnel.web.dao.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.dao.entity.SeaTunnelClient;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;

import java.util.List;

public interface SeaTunnelClientDao extends IDao<SeaTunnelClient> {

    /**
     * 分页查询客户端
     */
    IPage<SeaTunnelClient> pageClients(SeaTunnelClientPageDTO dto);

    /**
     * 查询全部未删除客户端
     */
    List<SeaTunnelClient> listActiveClients();

    /**
     * 统计客户端数量信息
     */
    SeaTunnelClientStatisticsVO statistics();
}