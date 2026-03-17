package org.apache.seatunnel.web.api.controller;


import org.apache.seatunnel.web.api.service.SeaTunnelClientService;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientDTO;
import org.apache.seatunnel.web.spi.bean.dto.SeaTunnelClientPageDTO;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientLogVO;
import org.apache.seatunnel.web.spi.bean.vo.SeaTunnelClientStatisticsVO;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;

@RestController
@RequestMapping("/api/v1/devops/client")
public class SeatunnelClientController {

    @Resource
    private SeaTunnelClientService seatunnelClientService;

    @PostMapping("/saveOrUpdate")
    public Result<Void> saveOrUpdate(@RequestBody SeaTunnelClientDTO dto) {
        seatunnelClientService.saveOrUpdate(dto);
        return Result.buildSuc();
    }

    @GetMapping("/{id}")
    public Result<Object> selectById(@PathVariable("id") Long id) {
        return Result.buildSuc(seatunnelClientService.selectById(id));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        seatunnelClientService.delete(id);
        return Result.buildSuc();
    }

    @PostMapping("/page")
    public Result<Object> page(@RequestBody SeaTunnelClientPageDTO dto) {
        return Result.buildSuc(seatunnelClientService.page(dto));
    }

    @GetMapping("/statistics")
    public Result<SeaTunnelClientStatisticsVO> statistics() {
        return Result.buildSuc(seatunnelClientService.statistics());
    }

    @PostMapping("/{id}/enable")
    public Result<Void> enable(@PathVariable("id") Long id) {
        seatunnelClientService.enable(id);
        return Result.buildSuc();
    }

    @PostMapping("/{id}/disable")
    public Result<Void> disable(@PathVariable("id") Long id) {
        seatunnelClientService.disable(id);
        return Result.buildSuc();
    }

    @PostMapping("/{id}/test-connection")
    public Result<Boolean> testConnection(@PathVariable("id") Long id) {
        return Result.buildSuc(seatunnelClientService.testConnection(id));
    }

    @GetMapping("/{id}/logs")
    public Result<SeaTunnelClientLogVO> logs(@PathVariable("id") Long id) {
        return Result.buildSuc(seatunnelClientService.logs(id));
    }

    @PostMapping("/heartbeat/report")
    public Result<Void> reportHeartbeat(@RequestBody SeaTunnelClientDTO dto) {
        seatunnelClientService.reportHeartbeat(dto);
        return Result.buildSuc();
    }
}