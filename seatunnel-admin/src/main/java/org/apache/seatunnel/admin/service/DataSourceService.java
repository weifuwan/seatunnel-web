package org.apache.seatunnel.admin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.communal.bean.dto.DataSourceDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.DataSourcePO;
import org.apache.seatunnel.communal.bean.vo.DBOptionVO;
import org.apache.seatunnel.communal.bean.vo.DataSourceVO;

import java.util.List;

public interface DataSourceService extends IService<DataSourcePO> {

    /**
     * Persists a new data-source instance after validating its connectivity
     * and plugin-specific parameters.
     *
     * @param dto creation request containing plugin name, connection params, etc.
     * @return complete data-source descriptor including generated primary key
     * @throws RuntimeException if validation or connectivity test fails
     */
    DataSourceVO create(DataSourceDTO dto);

    /**
     * Updates an existing data-source instance.
     * <p>
     * Re-checks connectivity if connection parameters are modified.
     * </p>
     *
     * @param id  primary key of the data source to update
     * @param dto new values (only non-null fields are applied)
     * @return the updated primary key
     * @throws RuntimeException if the data source does not exist or validation fails
     */
    Long update(Long id, DataSourceDTO dto);

    /**
     * Retrieves a single data-source instance by its primary key.
     *
     * @param id primary key
     * @return complete descriptor, never {@code null}
     * @throws RuntimeException if the data source does not exist
     */
    DataSourceVO selectById(Long id);

    /**
     * Returns a paginated list of data sources that match the optional filters
     * contained in the DTO (name, type, creator, etc.).
     *
     * @param dto search criteria and pagination parameters
     * @return paginated result with total count and current page items
     */
    PaginationResult<DataSourceVO> paging(DataSourceDTO dto);

    /**
     * Soft-deletes a data-source instance.
     *
     * @param id primary key
     * @return {@code true} if the record was deleted; {@code false} otherwise
     */
    Boolean delete(Long id);

    /**
     * Tests connectivity for an already persisted data source.
     *
     * @param id primary key
     * @return {@code true} if a connection can be established; {@code false} otherwise
     */
    Boolean connectionTest(Long id);

    /**
     * Returns a lightweight list of data sources filtered by database type.
     * <p>
     * Typically used to populate drop-down selectors in the UI.
     * </p>
     *
     * @param dbType database type (e.g. MySQL, Oracle, Kafka)
     * @return list of options containing id and display name
     */
    List<DBOptionVO> option(String dbType);

    /**
     * Batch soft-delete for multiple data sources.
     *
     * @param ids list of primary keys
     * @return {@code true} if all records were deleted; {@code false} otherwise
     */
    boolean batchDelete(List<Long> ids);

    /**
     * Batch connectivity test for multiple data sources.
     *
     * @param ids list of primary keys
     * @return {@code true} only if <strong>all</strong> data sources pass the test
     */
    Boolean batchConnectionTest(List<Long> ids);

    /**
     * Tests connectivity using the provided JSON-serialized connection parameters
     * <strong>without</strong> persisting anything.
     * <p>
     * Useful for validating parameters during the creation or editing wizard.
     * </p>
     *
     * @param connJson plugin-specific connection JSON
     * @return {@code true} if a connection can be established; {@code false} otherwise
     */
    Boolean connectionTestWithParam(String connJson);

}