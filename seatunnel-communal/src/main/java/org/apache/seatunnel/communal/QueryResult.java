package org.apache.seatunnel.communal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class QueryResult implements Serializable {
    private List<FrontedTableColumn> columns;
    private List<Map<String, Object>> data;

}

