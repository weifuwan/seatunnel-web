package org.apache.seatunnel.web.api.components.parser;



import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.RequiredArgsConstructor;
import org.apache.seatunnel.web.common.bean.po.SeatunnelBatchJobDefinitionPO;

import java.util.Set;

@RequiredArgsConstructor
public class JobDefinitionParser {

    private final WholeSyncResolver wholeSyncResolver;
    private final NodeExtractor nodeExtractor;
    private final JobDefinitionValidator validator;

    public JSONObject parse(String jobInfo) {
        JSONObject jobJson = JSON.parseObject(jobInfo);
        validator.validate(jobJson);
        return jobJson;
    }

    public void resolveWholeSync(SeatunnelBatchJobDefinitionPO po, JSONObject jobJson) {
        wholeSyncResolver.resolve(po, jobJson);
    }

    public Set<String> extractNodeTypes(JSONObject jobJson) {
        return nodeExtractor.extractNodeTypes(jobJson);
    }
}
