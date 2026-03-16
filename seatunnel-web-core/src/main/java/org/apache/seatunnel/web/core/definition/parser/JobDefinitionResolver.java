package org.apache.seatunnel.web.core.definition.parser;


import org.apache.seatunnel.web.spi.bean.entity.NodeTypes;

public interface JobDefinitionResolver {

    NodeTypes resolveDag(String jobInfo);

    NodeTypes resolveWholeSync(String jobInfo);
}

