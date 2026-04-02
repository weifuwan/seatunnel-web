package org.apache.seatunnel.web.api.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientLogVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientMetricsVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientVO;

public interface SeaTunnelClientService {

    void saveOrUpdate(SeaTunnelClientDTO dto);

    SeaTunnelClientVO selectById(Long id);

    void delete(Long id);

    IPage<SeaTunnelClientVO> page(SeaTunnelClientPageDTO dto);

    SeaTunnelClientStatisticsVO statistics();

    void enable(Long id);

    void disable(Long id);

    boolean testConnection(Long id);

    SeaTunnelClientLogVO logs(Long id);

    void reportHeartbeat(SeaTunnelClientDTO dto);

    SeaTunnelClientMetricsVO metrics(Long id);
}