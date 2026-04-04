package org.apache.seatunnel.web.api.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.vo.*;

import java.util.List;

public interface SeaTunnelClientService {

    void saveOrUpdate(SeaTunnelClientDTO dto);

    SeaTunnelClientMetricsVO metrics(Long id);

     List<OptionVO> option();
}