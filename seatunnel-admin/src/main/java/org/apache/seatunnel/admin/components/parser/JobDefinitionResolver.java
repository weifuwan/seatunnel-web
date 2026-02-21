package org.apache.seatunnel.admin.components.parser;

import org.apache.seatunnel.communal.bean.entity.NodeTypes;

public interface JobDefinitionResolver {

    NodeTypes resolveDag(String jobInfo);

    NodeTypes resolveWholeSync(String jobInfo);
}

