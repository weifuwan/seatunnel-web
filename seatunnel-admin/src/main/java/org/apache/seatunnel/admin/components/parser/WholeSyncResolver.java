package org.apache.seatunnel.admin.components.parser;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.seatunnel.communal.bean.po.SeatunnelBatchJobDefinitionPO;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class WholeSyncResolver {

    public void resolve(SeatunnelBatchJobDefinitionPO po, JSONObject jobJson) {

        JSONObject source = jobJson.getJSONObject("source");
        JSONObject target = jobJson.getJSONObject("target");
        JSONObject tableMatch = jobJson.getJSONObject("tableMatch");

        if (source == null || target == null || tableMatch == null) {
            throw new IllegalArgumentException("Invalid wholeSync job structure");
        }

        po.setSourceType(source.getString("dbType"));
        po.setSinkType(target.getString("dbType"));

        JSONArray tables = tableMatch.getJSONArray("tables");

        if (tables == null || tables.isEmpty()) {
            return;
        }

        List<String> tableList = IntStream.range(0, tables.size())
                .mapToObj(tables::getString)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        String tablesStr = String.join(",", tableList);

        po.setSourceTable(tablesStr);
        po.setSinkTable(tablesStr);
    }
}

