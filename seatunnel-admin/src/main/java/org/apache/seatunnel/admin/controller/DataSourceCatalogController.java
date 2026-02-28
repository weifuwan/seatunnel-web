package org.apache.seatunnel.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.service.DataSourceCatalogService;
import org.apache.seatunnel.communal.QueryResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.ColumnOptionVO;
import org.apache.seatunnel.communal.bean.vo.OptionVO;
import org.springframework.web.bind.annotation.*;

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
@Tag(name = "Data Source Catalog", description = "Data source metadata browsing APIs including table listing, column info, data sampling, etc.")
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
    @Operation(
            summary = "Get table list",
            description = "Returns all tables (or equivalent objects) from the specified data source"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved table list",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Result.class)
                    )
            ),
            @ApiResponse(responseCode = "404", description = "Data source not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Result<List<OptionVO>> listTable(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable("id") Long id) {
        return Result.buildSuc(dataSourceCatalogService.listTable(id));
    }

    /**
     * Get a list of table references from a datasource with optional filtering.
     *
     * @param id        the ID of the datasource
     * @param matchMode the filtering mode:
     *                  "2" - regex match
     *                  "3" - exact match (comma-separated)
     * @param keyword   the filtering keyword (regex or comma-separated list)
     * @return a list of OptionVO objects representing the tables
     */
    @GetMapping("/listByMatchMode/{id}")
    @Operation(
            summary = "Get tables by match mode",
            description = "Retrieve table references based on filtering mode (regex match or exact match)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved table list"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            @ApiResponse(responseCode = "404", description = "Data source not found")
    })
    public Result<List<OptionVO>> listTableReference(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable("id") Long id,

            @Parameter(
                    description = "Match mode: 2-Regex match, 3-Exact match (comma-separated)",
                    required = false,
                    example = "2",
                    schema = @Schema(allowableValues = {"2", "3"})
            )
            @RequestParam(required = false) String matchMode,

            @Parameter(
                    description = "Filter keyword (regex pattern or comma-separated list)",
                    required = false,
                    example = "user_.*"
            )
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
    @Operation(
            summary = "Get table column information",
            description = "Returns column metadata for the specified table"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved column information"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters, e.g., missing table name"),
            @ApiResponse(responseCode = "404", description = "Data source or table not found")
    })
    public Result<List<ColumnOptionVO>> listColumn(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable("id") Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Request parameters, must include table name",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Sample Request",
                                    value = "{\"tableName\": \"users\", \"schema\": \"public\"}"
                            )
                    )
            )
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
    @Operation(
            summary = "Get top 20 rows",
            description = "Sample the first 20 rows from the specified table, can include filter conditions"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved data"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            @ApiResponse(responseCode = "404", description = "Data source or table not found"),
            @ApiResponse(responseCode = "413", description = "Response data too large")
    })
    public Result<QueryResult> getTop20Data(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable("id") Long datasourceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Query parameters, can include table name, filter conditions, column list, etc.",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = {
                                    @ExampleObject(
                                            name = "Basic Query",
                                            value = "{\"tableName\": \"users\"}"
                                    ),
                                    @ExampleObject(
                                            name = "Query with Filters",
                                            value = "{\"tableName\": \"users\", \"where\": \"age > 18\", \"columns\": [\"id\", \"name\", \"age\"]}"
                                    )
                            }
                    )
            )
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
    @Operation(
            summary = "Count rows",
            description = "Count total number of rows matching the conditions in the specified table"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved count"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
            @ApiResponse(responseCode = "404", description = "Data source or table not found")
    })
    public Result<Integer> count(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable("id") Long datasourceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Count parameters, must include table name, optional filter conditions",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Sample Request",
                                    value = "{\"tableName\": \"users\", \"where\": \"status = 'ACTIVE'\"}"
                            )
                    )
            )
            @RequestBody Map<String, Object> requestBody) {
        return Result.buildSuc(dataSourceCatalogService.count(datasourceId, requestBody));
    }
}