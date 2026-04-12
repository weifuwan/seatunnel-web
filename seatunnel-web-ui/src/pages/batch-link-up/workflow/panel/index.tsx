import type { FC } from "react";
import { memo } from "react";

import SinkPanel from "./components/SinkPanel";
import SourcePanel from "./components/SourcePanel";
import TransformPanel from "./components/TransformPanel";
import "./index.less";

interface WorkflowPanelProps {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;
}
const WorkflowPanel: FC<WorkflowPanelProps> = ({
  selectedNode,
  onClose,
  onNodeDataChange,
  getDirectUpstreamSchema,
  refreshNodeSchema,
  refreshDownstreamSchemas
}) => {
  const nodeType = selectedNode?.data?.nodeType;

  if (!selectedNode || !nodeType) return null;

  if (nodeType === "source") {
    return (
      <SourcePanel
        selectedNode={selectedNode}
        onClose={onClose}
        onNodeDataChange={onNodeDataChange}
      />
    );
  }

  if (nodeType === "sink") {
    return (
      <SinkPanel
        selectedNode={selectedNode}
        onClose={onClose}
        onNodeDataChange={onNodeDataChange}
      />
    );
  }

 if (nodeType === "transform") {
  return (
    <TransformPanel
      selectedNode={selectedNode}
      onClose={onClose}
      onNodeDataChange={onNodeDataChange}
      getDirectUpstreamSchema={getDirectUpstreamSchema}
      refreshNodeSchema={refreshNodeSchema}
      refreshDownstreamSchemas={refreshDownstreamSchemas}
    />
  );
}

  return null;
};

export default memo(WorkflowPanel);