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
}

const WorkflowPanel: FC<WorkflowPanelProps> = ({
  selectedNode,
  onClose,
  onNodeDataChange,
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
      />
    );
  }

  return null;
};

export default memo(WorkflowPanel);