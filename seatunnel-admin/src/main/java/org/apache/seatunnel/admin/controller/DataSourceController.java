package org.apache.seatunnel.admin.controller;


import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.DataSourceService;
import org.apache.seatunnel.communal.bean.dto.DataSourceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.DBOptionVO;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/data-source")
@Api(tags = "Data Integration - Data Source Management")
public class DataSourceController {

    @Resource
    private DataSourceService dataSourceService;

    /**
     * Create data source
     */
    @PostMapping
    @ApiOperation("Create Data Source")
    public Result<DataSourceVO> create(@RequestBody DataSourceDTO dto) {
        return Result.buildSuc(dataSourceService.create(dto));
    }

    /**
     * Update data source
     */
    @PutMapping("/{id}")
    @ApiOperation("Update Data Source")
    public Result<Long> update(@PathVariable Long id, @RequestBody DataSourceDTO dto) {
        return Result.buildSuc(dataSourceService.update(id, dto));
    }

    /**
     * Delete data source
     */
    @DeleteMapping("/{id}")
    @ApiOperation("Delete Data Source")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = dataSourceService.delete(id);
        return Result.buildSuc(result);
    }

    /**
     * Pagination query for data sources
     */
    @ApiOperation(value = "Pagination Query Data Sources")
    @PostMapping(value = "page")
    public PaginationResult<DataSourceVO> paging(@RequestBody DataSourceDTO dto) {
        return dataSourceService.paging(dto);
    }

    /**
     * Query data sources by type
     */
    @ApiOperation(value = "Query Data Source Options")
    @GetMapping(value = "option")
    public Result<List<DBOptionVO>> option(@RequestParam("dbType") String dbType) {
        return Result.buildSuc(dataSourceService.option(dbType));
    }

    /**
     * Connection test
     *
     * @param id Data source ID
     * @return Connection test result
     */
    @GetMapping(value = "/{id}/connect-test")
    @ApiOperation("Connection Test")
    public Result<Boolean> connectionTest(@PathVariable("id") Long id) {
        return Result.buildSuc(dataSourceService.connectionTest(id));
    }

    /**
     * Connection test with param
     *
     * @param requestBody requestBody
     * @return Connection test result
     */
    @PostMapping(value = "/connect-test-with-param")
    @ApiOperation("Connection Test With Param")
    public Result<Boolean> connectionTestWithParam(@RequestBody Map<String, Object> requestBody) {
        String connJson = requestBody.get("connJson").toString();
        return Result.buildSuc(dataSourceService.connectionTestWithParam(connJson));
    }

    /**
     * Batch delete data sources
     */
    @DeleteMapping("/batch")
    @ApiOperation("Batch Delete Data Sources")
    public Result<Boolean> batchDelete(@RequestBody List<Long> ids) {
        boolean result = dataSourceService.batchDelete(ids);
        return Result.buildSuc(result);
    }

    /**
     * Batch connection test
     */
    @PostMapping("/batch-connect-test")
    @ApiOperation("Batch Connection Test")
    public Result<Boolean> batchConnectionTest(@RequestBody List<Long> ids) {
        Boolean results = dataSourceService.batchConnectionTest(ids);
        return Result.buildSuc(results);
    }
}