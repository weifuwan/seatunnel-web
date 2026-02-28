package org.apache.seatunnel.admin.builder;

import com.typesafe.config.Config;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.seatunnel.admin.builder.sink.SinkNodeConfigBuilder;
import org.apache.seatunnel.admin.builder.source.SourceNodeConfigBuilder;
import org.apache.seatunnel.admin.builder.transform.TransformNodeConfigBuilder;
import org.apache.seatunnel.admin.dag.DagGraph;
import org.apache.seatunnel.admin.utils.SeaTunnelConfigUtil;
import org.apache.seatunnel.communal.bean.dto.BaseSeatunnelJobDefinitionDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Builds a complete SeaTunnel job configuration in HOCON format.
 *
 * <p>
 * This class performs the following steps:
 * </p>
 * <ol>
 *     <li>Classify DAG nodes into sources, transforms, and sinks.</li>
 *     <li>Use appropriate NodeConfigBuilder to generate individual node configs.</li>
 *     <li>Group nodes into NodeGroup and render each category as HOCON text.</li>
 *     <li>Combine environment, sources, transforms, and sinks into a full job configuration.</li>
 * </ol>
 */
@Component
@Slf4j
public class HoconConfigBuilder {

    @Resource
    private NodeConfigBuilderRegistry registry; // Registry for retrieving builders by nodeType

    @Resource
    private EnvConfigBuilder envConfigBuilder; // Builds the environment section of the config

    /**
     * Build the full SeaTunnel HOCON configuration for a DAG graph.
     *
     * @param dagGraph the DAG representation of the job
     * @return HOCON string representing the full job configuration
     */
    public String build(DagGraph dagGraph, BaseSeatunnelJobDefinitionDTO dto) {
        NodeGroup group = groupNodes(dagGraph.getNodesAsConfig());
        return SeaTunnelConfigUtil.generateConfig(
                envConfigBuilder.build(dto),       // env section
                render(group.sources()),        // source section
                render(group.transforms()),     // transform section
                render(group.sinks()));         // sink section
    }

    /**
     * Classify raw node configs into sources, transforms, and sinks.
     *
     * @param nodes list of node Config objects from the DAG
     * @return NodeGroup containing grouped nodes
     */
    private NodeGroup groupNodes(List<Config> nodes) {
        NodeGroup nodeGroup = new NodeGroup();
        nodes.stream()
                .filter(n -> n.hasPath("data"))      // Only process nodes that have "data"
                .map(n -> n.getConfig("data"))       // Extract the "data" block
                .forEach(data -> classify(data, nodeGroup));
        return nodeGroup;
    }

    /**
     * Classify a single node's data into the appropriate category in NodeGroup.
     *
     * @param data node configuration
     * @param g    NodeGroup to populate
     */
    private void classify(Config data, NodeGroup g) {
        String nodeType = data.getString("nodeType");
        NodeConfigBuilder<?> b = registry.get(nodeType);

        if (b instanceof SourceNodeConfigBuilder) {
            SourceNodeConfigBuilder sb = (SourceNodeConfigBuilder) b;
            g.addSource(sb.connectorName(data), sb.build(data));
        } else if (b instanceof SinkNodeConfigBuilder) {
            SinkNodeConfigBuilder kb = (SinkNodeConfigBuilder) b;
            g.addSink(kb.connectorName(data), kb.build(data));
        } else if (b instanceof TransformNodeConfigBuilder) {
            g.addTransform(((TransformNodeConfigBuilder) b).build(data));
        } else {
            log.warn("Unknown builder type: {}", b.getClass());
        }
    }

    /**
     * Render a list of {@link RenderedItem} as HOCON text.
     *
     * @param items list of rendered items
     * @return concatenated HOCON string
     */
    private String render(List<RenderedItem> items) {
        return items.stream()
                .map(RenderedItem::toHocon)
                .collect(Collectors.joining("\n"));
    }
}
