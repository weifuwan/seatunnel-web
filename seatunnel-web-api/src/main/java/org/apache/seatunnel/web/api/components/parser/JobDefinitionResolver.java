package org.apache.seatunnel.web.api.components.parser;

import org.apache.seatunnel.web.common.bean.entity.NodeTypes;

public interface JobDefinitionResolver {

    NodeTypes resolveDag(String jobInfo);

    NodeTypes resolveWholeSync(String jobInfo);
}

