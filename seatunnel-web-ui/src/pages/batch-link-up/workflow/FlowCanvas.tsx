import { Dropdown } from "antd";
import ReactFlow, {
  Background,
  MiniMap,
  SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomEdge from "./edge";
import CustomNode from "./nodes";
import WorkflowPanel from "./panel";
import RunLog from "./run";
import { ControlMode } from "./config";
import { ControlPanel } from "./operator/ControlPanel";
import useFlowBuilder from "./hooks/useFlowBuilder";
import useNodePlacement from "./hooks/useNodePlacement";

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
}

export default function FlowCanvas({
  form,
  params,
  goBack,
}: FlowCanvasProps) {
  const flow = useFlowBuilder({ form, params });
  const placement = useNodePlacement({
    setNodes: flow.setNodes,
    setControlMode: flow.setControlMode,
  });

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
          !flow.nodesReadOnly &&
          flow.interactionMode === ControlMode.Pointer
        }
        nodesConnectable={!flow.nodesReadOnly}
        nodesFocusable={!flow.nodesReadOnly}
        edgesFocusable={!flow.nodesReadOnly}
        panOnDrag={flow.controlMode === ControlMode.Hand}
        zoomOnPinch={!flow.workflowReadOnly}
        zoomOnScroll={!flow.workflowReadOnly}
        zoomOnDoubleClick={!flow.workflowReadOnly}
        selectionOnDrag={
          flow.interactionMode === ControlMode.Pointer &&
          !flow.workflowReadOnly
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

        {/* <ControlPanel ... /> */}
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
        />
      )}

      {/* {flow.runVisible && ... } */}
    </div>
  );
}