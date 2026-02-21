package org.apache.seatunnel.admin.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.DataSourceCatalogService;
import org.apache.seatunnel.communal.QueryResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.ColumnOptionVO;
import org.apache.seatunnel.communal.bean.vo.OptionVO;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * REST endpoints for browsing external data-source metadata.
 * <p>
 * All paths are prefixed with {@code /api/v1/data-source/catalog}.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/data-source/catalog")
@Api(tags = "Data Integration - Data-Source Catalog")
public class DataSourceCatalogController {

    @Resource
    private DataSourceCatalogService dataSourceCatalogService;

    /**
     * Returns all tables (or equivalent objects) available in the requested data source.
     *
     * @param id registered data-source primary key
     * @return list of table descriptors wrapped in a uniform {@link Result}
     */
    @GetMapping("/list/{id}")
    @ApiOperation(value = "List tables",
            notes = "Returns every table that the caller is authorized to see in the given data source.")
    public Result<List<OptionVO>> listTable(@PathVariable("id") Long id) {
        return Result.buildSuc(dataSourceCatalogService.listTable(id));
    }

    /**
     * Get a list of table references from a datasource with optional filtering.
     * <p>
     *
     * @param id        the ID of the datasource
     * @param matchMode the filtering mode:
     *                  "2" - regex match
     *                  "3" - exact match (comma-separated)
     * @param keyword   the filtering keyword (regex or comma-separated list)
     * @return a list of OptionVO objects representing the tables
     */
    @GetMapping("/listByMatchMode/{id}")
    public Result<List<OptionVO>> listTableReference(
            @PathVariable("id") Long id,
            @RequestParam(required = false) String matchMode,
            @RequestParam(required = false) String keyword) {
        return Result.buildSuc(dataSourceCatalogService.listTableReference(id, matchMode, keyword));
    }

    /**
     * Retrieves the column metadata for a specific table.
     *
     * @param id          registered data-source primary key
     * @param requestBody additional parameters
     * @return list of column descriptors wrapped in a uniform {@link Result}
     */
    @PostMapping("/column/{id}")
    @ApiOperation(value = "List columns",
            notes = "Returns every column that belongs to the requested table together with its type and optional constraints.")
    public Result<List<ColumnOptionVO>> listColumn(@PathVariable("id") Long id,
                                                   @RequestBody Map<String, Object> requestBody) {
        return Result.buildSuc(dataSourceCatalogService.listColumn(id, requestBody));
    }

    /**
     * Samples the first 20 rows of the requested table or view.
     * The actual SQL can be influenced by optional filters sent in the request body.
     *
     * @param datasourceId registered data-source primary key
     * @param requestBody  optional filters, column list, or raw SQL fragment
     * @return paginated result containing at most 20 rows
     */
    @PostMapping("/getTop20Data/{id}")
    @ApiOperation(value = "Preview top 20 rows",
            notes = "Executes a limited query against the chosen table and returns the data in a JSON-serializable format.")
    public Result<QueryResult> getTop20Data(@PathVariable("id") Long datasourceId,
                                            @RequestBody Map<String, Object> requestBody) {
        return Result.buildSuc(dataSourceCatalogService.getTop20Data(datasourceId, requestBody));
    }

    /**
     * Count total number of rows from the specified table or query.
     *
     * @param datasourceId primary key of the data source
     * @param requestBody  requestBody query conditions including table name and optional filters
     * @return total count of rows matching the given conditions
     */
    @PostMapping("/count/{id}")
    @ApiOperation(value = "Count the total data")
    public Result<Integer> count(@PathVariable("id") Long datasourceId,
                                 @RequestBody Map<String, Object> requestBody) {
        return Result.buildSuc(dataSourceCatalogService.count(datasourceId, requestBody));
    }

}