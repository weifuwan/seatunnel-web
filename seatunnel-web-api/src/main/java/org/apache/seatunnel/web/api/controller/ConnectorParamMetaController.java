package org.apache.seatunnel.web.api.controller;


import com.baomidou.mybatisplus.core.metadata.IPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.seatunnel.web.api.service.ConnectorParamMetaService;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaUpdateDTO;
import org.apache.seatunnel.web.spi.bean.vo.ConnectorParamMetaVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/connector-param-meta")
@RequiredArgsConstructor
public class ConnectorParamMetaController {

    private final ConnectorParamMetaService connectorParamMetaService;

    /**
     * 新增参数元数据
     */
    @PostMapping
    public Long create(@Valid @RequestBody ConnectorParamMetaCreateDTO dto) {
        return connectorParamMetaService.create(dto);
    }

    /**
     * 更新参数元数据
     */
    @PutMapping
    public Boolean update(@Valid @RequestBody ConnectorParamMetaUpdateDTO dto) {
        return connectorParamMetaService.updateById(dto);
    }

    /**
     * 根据ID查询详情
     */
    @GetMapping("/{id}")
    public ConnectorParamMetaVO getById(@PathVariable("id") Long id) {
        return connectorParamMetaService.getById(id);
    }

    /**
     * 分页查询
     */
    @GetMapping("/page")
    public IPage<ConnectorParamMetaVO> pageQuery(ConnectorParamMetaQueryDTO dto) {
        return connectorParamMetaService.pageQuery(dto);
    }

    /**
     * 根据 connectorName/type 获取参数列表
     */
    @GetMapping("/list")
    public List<ConnectorParamMetaVO> list(
            @RequestParam(required = false) String connectorName,
            @RequestParam(required = false) String type
    ) {
        return connectorParamMetaService.listByConnectorName(connectorName, type);
    }

    /**
     * 删除
     */
    @DeleteMapping("/{id}")
    public Boolean delete(@PathVariable("id") Long id) {
        return connectorParamMetaService.deleteById(id);
    }
}