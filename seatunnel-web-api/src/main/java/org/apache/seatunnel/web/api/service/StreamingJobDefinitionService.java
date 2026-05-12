package org.apache.seatunnel.web.api.service;

import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.spi.bean.dto.StreamingJobDefinitionQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.command.JobDefinitionSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideMultiJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingGuideSingleJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.dto.streaming.StreamingScriptJobSaveCommand;
import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
import org.apache.seatunnel.web.spi.bean.vo.StreamingJobDefinitionVO;

public interface StreamingJobDefinitionService {

    Long saveOrUpdate(StreamingScriptJobSaveCommand command);

    Long saveOrUpdate(StreamingGuideSingleJobSaveCommand command);

    Long saveOrUpdate(StreamingGuideMultiJobSaveCommand command);

    StreamingJobDefinitionVO selectById(Long id);

    PaginationResult<StreamingJobDefinitionVO> paging(StreamingJobDefinitionQueryDTO dto);

    Boolean delete(Long id);

    String buildHoconConfig(StreamingScriptJobSaveCommand command);

    String buildHoconConfig(StreamingGuideSingleJobSaveCommand command);

    String buildHoconConfig(StreamingGuideMultiJobSaveCommand command);

    JobDefinitionSaveCommand selectEditDetail(Long id);

    Boolean updateReleaseState(Long id, ReleaseState releaseState);
}