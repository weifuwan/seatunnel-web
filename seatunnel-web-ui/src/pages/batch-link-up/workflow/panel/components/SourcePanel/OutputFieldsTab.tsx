// components/OutputFieldsTab/index.tsx
import { FC } from "react";
import DragTable from "./DragTable";

interface SourceConfigTabProps {
  onNodeDataChange?: (nodeId: string, newData: any) => void;

  selectedNode: {
    id: string;
    data: any;
  };
  setSourceColumns: (value: any) => void;
  sourceColumns: any;
}

const OutputFieldsTab: FC<SourceConfigTabProps> = ({
  onNodeDataChange,
  setSourceColumns,
  sourceColumns,
  selectedNode,
}) => {
  return (
    <div>
      <DragTable
        onNodeDataChange={onNodeDataChange}
        selectedNode={selectedNode}
        sourceColumns={sourceColumns}
        setSourceColumns={setSourceColumns}
      />
    </div>
  );
};

export default OutputFieldsTab;
