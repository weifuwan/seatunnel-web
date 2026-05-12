package org.apache.seatunnel.web.api.service;


import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.spi.bean.dto.*;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchGuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchGuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.batch.BatchScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;

public interface BatchJobDefinitionService {

    Long saveOrUpdate(BatchScriptJobSaveCommand command);

    Long saveOrUpdate(BatchGuideSingleJobSaveCommand command);

    Long saveOrUpdate(BatchGuideMultiJobSaveCommand command);

    BatchJobDefinitionVO selectById(Long id);

    PaginationResult<BatchJobDefinitionVO> paging(BatchJobDefinitionQueryDTO dto);

    Boolean delete(Long id);

    String buildHoconConfig(BatchScriptJobSaveCommand command);

    String buildHoconConfig(BatchGuideSingleJobSaveCommand command);

    String buildHoconConfig(BatchGuideMultiJobSaveCommand command);

    JobDefinitionSaveCommand selectEditDetail(Long id);

    Boolean updateReleaseState(Long id, ReleaseState releaseState);
}
