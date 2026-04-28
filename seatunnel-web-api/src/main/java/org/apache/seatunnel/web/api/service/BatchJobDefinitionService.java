package org.apache.seatunnel.web.api.service;


import org.apache.seatunnel.web.common.enums.ReleaseState;
import org.apache.seatunnel.web.spi.bean.dto.*;
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

    JobDefinitionSaveCommand  selectEditDetail(Long id);

    Boolean updateReleaseState(Long id, ReleaseState releaseState);
}
