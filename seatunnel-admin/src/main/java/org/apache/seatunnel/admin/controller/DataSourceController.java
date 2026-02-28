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
import org.apache.seatunnel.admin.service.DataSourceService;
import org.apache.seatunnel.communal.bean.dto.DataSourceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.entity.Result;
import org.apache.seatunnel.communal.bean.vo.DBOptionVO;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing data sources.
 * Provides CRUD operations, connection testing, and pagination queries for data sources.
 * All paths are prefixed with {@code /api/v1/data-source}.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/data-source")
@Tag(name = "Data Source Management", description = "APIs for managing data sources including create, update, delete, query, and connection testing")
public class DataSourceController {

    @Resource
    private DataSourceService dataSourceService;

    /**
     * Creates a new data source.
     *
     * @param dto Data source creation parameters
     * @return Created data source information
     */
    @PostMapping
    @Operation(
            summary = "Create data source",
            description = "Creates a new data source with the provided configuration"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Data source created successfully",
                    content = @Content(schema = @Schema(implementation = Result.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input parameters"),
            @ApiResponse(responseCode = "409", description = "Data source with same name already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Result<DataSourceVO> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Data source creation parameters",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "MySQL Data Source Example",
                                    value = """
                        {
                            "name": "MySQL-ProductDB",
                            "type": "MYSQL",
                            "host": "localhost",
                            "port": 3306,
                            "database": "product_db",
                            "username": "root",
                            "password": "******",
                            "properties": {
                                "useSSL": "false",
                                "serverTimezone": "UTC"
                            }
                        }
                        """
                            )
                    )
            )
            @RequestBody DataSourceDTO dto) {
        log.info("Creating new data source: {}", dto.getDbName());
        return Result.buildSuc(dataSourceService.create(dto));
    }

    /**
     * Updates an existing data source.
     *
     * @param id  Data source ID
     * @param dto Data source update parameters
     * @return Updated data source ID
     */
    @PutMapping("/{id}")
    @Operation(
            summary = "Update data source",
            description = "Updates an existing data source by ID with the provided configuration"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Data source updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input parameters"),
            @ApiResponse(responseCode = "404", description = "Data source not found"),
            @ApiResponse(responseCode = "409", description = "Data source name conflict"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Result<Long> update(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Data source update parameters",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Update Example",
                                    value = """
                        {
                            "name": "MySQL-ProductDB-Updated",
                            "host": "192.168.1.100",
                            "port": 3307,
                            "password": "new_password",
                            "properties": {
                                "useSSL": "true"
                            }
                        }
                        """
                            )
                    )
            )
            @RequestBody DataSourceDTO dto) {
        log.info("Updating data source with id: {}", id);
        return Result.buildSuc(dataSourceService.update(id, dto));
    }

    /**
     * Deletes a data source by ID.
     *
     * @param id Data source ID
     * @return true if deletion was successful
     */
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete data source",
            description = "Deletes a data source by ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Data source deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Data source not found"),
            @ApiResponse(responseCode = "409", description = "Data source is in use and cannot be deleted"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Result<Boolean> delete(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable Long id) {
        log.info("Deleting data source with id: {}", id);
        boolean result = dataSourceService.delete(id);
        return Result.buildSuc(result);
    }

    /**
     * Performs pagination query for data sources.
     *
     * @param dto Query parameters including pagination info and filters
     * @return Paginated list of data sources
     */
    @PostMapping("/page")
    @Operation(
            summary = "Pagination query",
            description = "Retrieves a paginated list of data sources with optional filtering"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved data sources",
                    content = @Content(schema = @Schema(implementation = PaginationResult.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid query parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public PaginationResult<DataSourceVO> paging(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Pagination and filter parameters",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Pagination Example",
                                    value = """
                        {
                            "pageNo": 1,
                            "pageSize": 10,
                            "type": "MYSQL",
                            "name": "test",
                            "sortField": "createTime",
                            "sortOrder": "DESC"
                        }
                        """
                            )
                    )
            )
            @RequestBody DataSourceDTO dto) {
        log.info("Executing pagination query with params: pageNum={}, pageSize={}",
                dto.getPageNo(), dto.getPageSize());
        return dataSourceService.paging(dto);
    }

    /**
     * Retrieves data source options filtered by database type.
     *
     * @param dbType Database type (e.g., MYSQL, POSTGRESQL, ORACLE)
     * @return List of data source options for dropdown/select components
     */
    @GetMapping("/option")
    @Operation(
            summary = "Get data source options",
            description = "Retrieves a list of data source options filtered by database type for dropdown components"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved options"),
            @ApiResponse(responseCode = "400", description = "Invalid database type"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Result<List<DBOptionVO>> option(
            @Parameter(
                    description = "Database type",
                    required = true,
                    example = "MYSQL",
                    schema = @Schema(allowableValues = {"MYSQL", "POSTGRESQL", "ORACLE", "SQLSERVER", "CLICKHOUSE"})
            )
            @RequestParam("dbType") String dbType) {
        log.info("Retrieving data source options for dbType: {}", dbType);
        return Result.buildSuc(dataSourceService.option(dbType));
    }

    /**
     * Tests connection for an existing data source.
     *
     * @param id Data source ID
     * @return true if connection is successful
     */
    @GetMapping("/{id}/connect-test")
    @Operation(
            summary = "Test data source connection",
            description = "Tests the connection to an existing data source by ID"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Connection test completed (check response value)"),
            @ApiResponse(responseCode = "404", description = "Data source not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error or connection failed")
    })
    public Result<Boolean> connectionTest(
            @Parameter(description = "Data source ID", required = true, example = "1")
            @PathVariable("id") Long id) {
        log.info("Testing connection for data source id: {}", id);
        return Result.buildSuc(dataSourceService.connectionTest(id));
    }

    /**
     * Tests connection with provided parameters without saving.
     *
     * @param requestBody Connection parameters in JSON format
     * @return true if connection is successful
     */
    @PostMapping("/connect-test-with-param")
    @Operation(
            summary = "Test connection with parameters",
            description = "Tests database connection using provided parameters without creating/updating a data source"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Connection test completed (check response value)"),
            @ApiResponse(responseCode = "400", description = "Invalid connection parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error or connection failed")
    })
    public Result<Boolean> connectionTestWithParam(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Connection parameters in JSON format",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "MySQL Connection Test Example",
                                    value = """
                        {
                            "connJson": {
                                "type": "MYSQL",
                                "host": "localhost",
                                "port": 3306,
                                "database": "test_db",
                                "username": "root",
                                "password": "password",
                                "properties": {
                                    "useSSL": "false"
                                }
                            }
                        }
                        """
                            )
                    )
            )
            @RequestBody Map<String, Object> requestBody) {
        String connJson = requestBody.get("connJson").toString();
        log.info("Testing connection with parameters");
        return Result.buildSuc(dataSourceService.connectionTestWithParam(connJson));
    }

    /**
     * Batch deletes multiple data sources.
     *
     * @param ids List of data source IDs to delete
     * @return true if all deletions were successful
     */
    @DeleteMapping("/batch")
    @Operation(
            summary = "Batch delete data sources",
            description = "Deletes multiple data sources by their IDs"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch deletion completed"),
            @ApiResponse(responseCode = "400", description = "Invalid ID list"),
            @ApiResponse(responseCode = "404", description = "One or more data sources not found"),
            @ApiResponse(responseCode = "409", description = "One or more data sources are in use"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Result<Boolean> batchDelete(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "List of data source IDs to delete",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Batch Delete Example",
                                    value = "[1, 2, 3, 4, 5]"
                            )
                    )
            )
            @RequestBody List<Long> ids) {
        log.info("Batch deleting data sources with ids: {}", ids);
        boolean result = dataSourceService.batchDelete(ids);
        return Result.buildSuc(result);
    }

    /**
     * Batch tests connections for multiple data sources.
     *
     * @param ids List of data source IDs to test
     * @return true if all connections are successful
     */
    @PostMapping("/batch-connect-test")
    @Operation(
            summary = "Batch test connections",
            description = "Tests connections for multiple data sources by their IDs"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch connection test completed (check response value)"),
            @ApiResponse(responseCode = "400", description = "Invalid ID list"),
            @ApiResponse(responseCode = "404", description = "One or more data sources not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error or some connections failed")
    })
    public Result<Boolean> batchConnectionTest(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "List of data source IDs to test connections",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "Batch Test Example",
                                    value = "[1, 2, 3, 4, 5]"
                            )
                    )
            )
            @RequestBody List<Long> ids) {
        log.info("Batch testing connections for data sources: {}", ids);
        Boolean results = dataSourceService.batchConnectionTest(ids);
        return Result.buildSuc(results);
    }
}