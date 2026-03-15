// components/OutputFieldsTab/index.tsx
import { FC } from "react";
import DragTable from "./DragTable";

interface SinkConfigTabProps {
  onNodeDataChange?: (nodeId: string, newData: any) => void;

  selectedNode: {
    id: string;
    data: any;
  };
  setSinkColumns: (value: any) => void;
  sinkColumns: any;
}

const OutputFieldsTab: FC<SinkConfigTabProps> = ({
  onNodeDataChange,
  setSinkColumns,
  sinkColumns,
  selectedNode,
}) => {
  return (
    <div>
      <DragTable
        onNodeDataChange={onNodeDataChange}
        selectedNode={selectedNode}
        sinkColumns={sinkColumns}
        setSinkColumns={setSinkColumns}
      />
    </div>
  );
};

export default OutputFieldsTab;
