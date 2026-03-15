package org.apache.seatunnel.web.api.controller;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.application.streaming.SeatunnelStreamingJobDefinitionApplicationService;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelBatchJobDefinitionQueryDTO;
import org.apache.seatunnel.web.common.bean.dto.SeatunnelStreamingJobDefinitionDTO;
import org.apache.seatunnel.web.common.bean.entity.PaginationResult;
import org.apache.seatunnel.web.common.bean.vo.SeatunnelBatchJobDefinitionVO;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/seatunnel/streaming/job-definition")
public class SeatunnelStreamingJobDefinitionController {

    @Resource
    private SeatunnelStreamingJobDefinitionApplicationService applicationService;

    @PostMapping("/saveOrUpdate")
    public Long saveOrUpdate(@RequestBody SeatunnelStreamingJobDefinitionDTO dto) {
        return applicationService.saveOrUpdate(dto);
    }

    @GetMapping("/{id}")
    public SeatunnelBatchJobDefinitionVO selectById(@PathVariable Long id) {
        return applicationService.selectById(id);
    }

    @PostMapping("/page")
    public PaginationResult<SeatunnelBatchJobDefinitionVO> paging(@RequestBody SeatunnelBatchJobDefinitionQueryDTO dto) {
        return applicationService.paging(dto);
    }

    @DeleteMapping("/{id}")
    public Boolean delete(@PathVariable Long id) {
        return applicationService.delete(id);
    }

    @PostMapping("/buildHoconConfig")
    public String buildHoconConfig(@RequestBody SeatunnelStreamingJobDefinitionDTO dto) {
        return applicationService.buildHoconConfig(dto);
    }

    @PostMapping("/{id}/deploy")
    public void deploy(@PathVariable Long id) {
        applicationService.deploy(id);
    }

    @PostMapping("/{id}/start")
    public void start(@PathVariable Long id) {
        applicationService.start(id);
    }

    @PostMapping("/{id}/stop")
    public void stop(@PathVariable Long id) {
        applicationService.stop(id);
    }

    @PostMapping("/{id}/restart")
    public void restart(@PathVariable Long id) {
        applicationService.restart(id);
    }
}
