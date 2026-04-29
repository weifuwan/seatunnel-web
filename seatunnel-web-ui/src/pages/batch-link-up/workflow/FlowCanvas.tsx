import { Dropdown } from "antd";
import { useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  SelectionMode,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { ControlMode } from "./config";
import CustomEdge from "./edge";
import useFlowBuilder from "./hooks/useFlowBuilder";
import useNodePlacement from "./hooks/useNodePlacement";
import CustomNode from "./nodes";
import WorkflowPanel from "./panel";

const nodeTypesConfig = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1;

interface FlowCanvasProps {
  form: any;
  params: any;
  goBack: () => void;
  sourceType?: any;
  targetType?: any;
  onWorkflowChange?: (value: { nodes: any[]; edges: any[] }) => void;
}

function buildInitialGraph(
  params?: any,
  sourceType?: any,
  targetType?: any
): {
  nodes: Node[];
  edges: Edge[];
} {
  if (params?.workflow?.nodes?.length) {
    return {
      nodes: params.workflow.nodes || [],
      edges: params.workflow.edges || [],
    };
  }

  const timestamp = Date.now();
  const sourceId = `source-${timestamp}`;
  const sinkId = `sink-${timestamp}`;

  const sourceDbType = sourceType?.dbType || "MYSQL";
  const targetDbType = targetType?.dbType || "MYSQL";

  const sourceTitle =
    sourceType?.dbType ||
    sourceType?.pluginName ||
    sourceType?.connectorType ||
    "输入端";

  const sinkTitle =
    targetType?.dbType ||
    targetType?.pluginName ||
    targetType?.connectorType ||
    "输出端";

  const nodes: Node[] = [
    {
      id: sourceId,
      type: "custom",
      position: { x: 100, y: 180 },
      data: {
        nodeType: "source",
        title: sourceTitle,
        description: "读取源端数据",
        dbType: sourceDbType,
        connectorType: sourceType?.connectorType,
        pluginName: sourceType?.pluginName,
        config: {
          dataSourceId: params?.sourceDataSourceId || "",
          dbType: sourceType?.dbType,
          connectorType: sourceType?.connectorType,
          pluginName: sourceType?.pluginName,
          pluginOutput: sourceId,
          readMode: "table",
          table: undefined,
          sql: "",
          extraParams: [],
        },
        meta: {
          outputSchema: [],
          schemaStatus: "idle",
          schemaError: "",
        },
      },
    },
    {
      id: sinkId,
      type: "custom",
      position: { x: 460, y: 180 },
      data: {
        nodeType: "sink",
        title: sinkTitle,
        description: "写入目标端数据",
        dbType: targetDbType,
        connectorType: targetType?.connectorType,
        pluginName: targetType?.pluginName,
        config: {
          dataSourceId: params?.targetDataSourceId || "",
          autoCreateTable: false,
          targetMode: "table",
          table: undefined,
          targetTableName: "",
          sql: "",
          writeMode: "append",
          primaryKey: "",
          batchSize: "",
          pluginInput: sinkId,
          extraParams: [],
        },
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: `${sourceId}-${sinkId}`,
      source: sourceId,
      target: sinkId,
      type: "custom",
      data: {},
    },
  ];

  return { nodes, edges };
}

export default function FlowCanvas({
  form,
  params,
  goBack,
  sourceType,
  targetType,
  onWorkflowChange,
}: FlowCanvasProps) {
  const flow = useFlowBuilder({ form, params });
  const placement = useNodePlacement({
    setNodes: flow.setNodes,
    setControlMode: flow.setControlMode,
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    onWorkflowChange?.({
      nodes: flow.nodes,
      edges: flow.edges,
    });
  }, [flow.nodes, flow.edges, onWorkflowChange]);

  useEffect(() => {
    if (!params || initializedRef.current) return;

    const hasNodes = Array.isArray(flow.nodes) && flow.nodes.length > 0;
    if (hasNodes) {
      initializedRef.current = true;
      return;
    }

    const { nodes, edges } = buildInitialGraph(params, sourceType, targetType);

    flow.setNodes(nodes);
    flow.setEdges(edges);
    initializedRef.current = true;
  }, [
    params,
    sourceType,
    targetType,
    flow.nodes,
    flow.setNodes,
    flow.setEdges,
  ]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const raw = event.dataTransfer.getData("application/reactflow");
    if (!raw) return;

    const data = JSON.parse(raw);

    const bounds = placement.reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = flow.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    flow.addNode({
      position,
      nodeType: data.nodeType,
      componentType: data.componentType,
      label: data.label,
    });
  };

  return (
    <div
      className="relative h-full w-full min-w-[960px]"
      style={{
        height: "100%",
        width: "100%",
        cursor: flow.controlMode === ControlMode.Hand ? "grab" : "default",
      }}
      ref={placement.reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypesConfig}
        edgeTypes={edgeTypes}
        onNodesChange={flow.onNodesChange}
        onEdgesChange={flow.onEdgesChange}
        onConnect={flow.onConnect}
        onNodeClick={flow.onNodeClick}
        onNodeContextMenu={flow.onNodeContextMenu}
        onPaneClick={flow.onPaneClick}
        onSelectionChange={flow.onSelectionChange}
        onSelectionContextMenu={flow.onSelectionContextMenu}
        onNodeMouseEnter={flow.onNodeMouseEnter}
        onNodeMouseLeave={flow.onNodeMouseLeave}
        onPaneContextMenu={flow.onPaneContextMenu}
        isValidConnection={flow.isValidConnection}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        nodesDraggable={
          !flow.nodesReadOnly && flow.interactionMode === ControlMode.Pointer
        }
        nodesConnectable={!flow.nodesReadOnly}
        nodesFocusable={!flow.nodesReadOnly}
        edgesFocusable={!flow.nodesReadOnly}
        panOnDrag={flow.controlMode === ControlMode.Hand}
        zoomOnPinch={!flow.workflowReadOnly}
        zoomOnScroll={!flow.workflowReadOnly}
        zoomOnDoubleClick={!flow.workflowReadOnly}
        selectionOnDrag={
          flow.interactionMode === ControlMode.Pointer && !flow.workflowReadOnly
        }
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.25,
          maxZoom: 0.75,
        }}
        className={`reactflow-wrapper ${
          flow.controlMode === ControlMode.Hand ? "hand-mode" : "pointer-mode"
        }`}
      >
        <Background gap={[14, 14]} size={2} color="#8585ad26" />

        <MiniMap
          position="bottom-left"
          style={{ width: 102, height: 72 }}
          maskColor="#E9EBF0"
        />
      </ReactFlow>

      <Dropdown
        overlay={flow.renderContextMenu()}
        open={flow.menuVisible}
        onOpenChange={flow.closeContextMenu}
        trigger={["contextMenu"]}
      >
        <div
          style={{
            position: "fixed",
            left: flow.menuPosition.x,
            top: flow.menuPosition.y,
            width: "1px",
            height: "1px",
          }}
        />
      </Dropdown>

      {flow.drawerVisible && (
        <WorkflowPanel
          selectedNode={flow.selectedNode}
          onClose={flow.onCloseDrawer}
          onNodeDataChange={flow.handleNodeDataChange}
          getDirectUpstreamSchema={flow.getDirectUpstreamSchema}
          refreshNodeSchema={flow.refreshNodeSchema}
          refreshDownstreamSchemas={flow.refreshDownstreamSchemas}
        />
      )}
    </div>
  );
}
