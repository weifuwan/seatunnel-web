package org.apache.seatunnel.communal.bean.dto.pagination;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.apache.seatunnel.communal.constant.PaginationConstant;

import javax.validation.constraints.NotNull;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Base pagination DTO with page number and page size")
public class PaginationBaseDTO {

    @NotNull(message = "Page number cannot be empty")
    @Schema(
            description = "Page number (starting from 1)",
            example = "1",
            defaultValue = "1",
            minimum = "1"
    )
    private Integer pageNo = PaginationConstant.DEFAULT_PAGE_NO;

    @NotNull(message = "Page size cannot be empty")
    @Schema(
            description = "Number of items per page",
            example = "10",
            defaultValue = "10",
            minimum = "1",
            maximum = "1000"
    )
    private Integer pageSize = PaginationConstant.DEFAULT_PAGE_SIZE;
}