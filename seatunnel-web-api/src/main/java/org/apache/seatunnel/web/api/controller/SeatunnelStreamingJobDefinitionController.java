//package org.apache.seatunnel.web.api.controller;
//
//import jakarta.annotation.Resource;
//import org.apache.seatunnel.web.api.service.StreamingJobDefinitionService;
//import org.apache.seatunnel.web.spi.bean.dto.BatchJobDefinitionQueryDTO;
//import org.apache.seatunnel.web.spi.bean.dto.SeatunnelStreamingJobDefinitionDTO;
//import org.apache.seatunnel.web.spi.bean.entity.PaginationResult;
//import org.apache.seatunnel.web.spi.bean.vo.BatchJobDefinitionVO;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/seatunnel/streaming/job-definition")
//public class SeatunnelStreamingJobDefinitionController {
//
//    @Resource
//    private StreamingJobDefinitionService batchJobDefinitionService;
//
//    @PostMapping("/saveOrUpdate")
//    public Long saveOrUpdate(@RequestBody SeatunnelStreamingJobDefinitionDTO dto) {
//        return batchJobDefinitionService.saveOrUpdate(dto);
//    }
//
//    @GetMapping("/{id}")
//    public BatchJobDefinitionVO selectById(@PathVariable Long id) {
//        return batchJobDefinitionService.selectById(id);
//    }
//
//    @PostMapping("/page")
//    public PaginationResult<BatchJobDefinitionVO> paging(@RequestBody BatchJobDefinitionQueryDTO dto) {
//        return batchJobDefinitionService.paging(dto);
//    }
//
//    @DeleteMapping("/{id}")
//    public Boolean delete(@PathVariable Long id) {
//        return batchJobDefinitionService.delete(id);
//    }
//
//    @PostMapping("/buildHoconConfig")
//    public String buildHoconConfig(@RequestBody SeatunnelStreamingJobDefinitionDTO dto) {
//        return batchJobDefinitionService.buildHoconConfig(dto);
//    }
//
//    @PostMapping("/{id}/deploy")
//    public void deploy(@PathVariable Long id) {
//        batchJobDefinitionService.deploy(id);
//    }
//
//    @PostMapping("/{id}/start")
//    public void start(@PathVariable Long id) {
//        batchJobDefinitionService.start(id);
//    }
//
//    @PostMapping("/{id}/stop")
//    public void stop(@PathVariable Long id) {
//        applicationService.stop(id);
//    }
//
//    @PostMapping("/{id}/restart")
//    public void restart(@PathVariable Long id) {
//        applicationService.restart(id);
//    }
//}
