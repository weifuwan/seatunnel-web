package org.apache.seatunnel.web.api.service;


import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.GuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.GuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.ScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

public interface BatchJobDefinitionService {

    Long saveOrUpdate(ScriptJobSaveCommand command);

    Long saveOrUpdate(GuideSingleJobSaveCommand command);

    Long saveOrUpdate(GuideMultiJobSaveCommand command);

    BatchJobDefinitionVO selectById(Long id);

    PaginationResult<BatchJobDefinitionVO> paging(BatchJobDefinitionQueryDTO dto);

    Boolean delete(Long id);

    String buildHoconConfig(ScriptJobSaveCommand command);

    String buildHoconConfig(GuideSingleJobSaveCommand command);

    String buildHoconConfig(GuideMultiJobSaveCommand command);

}
