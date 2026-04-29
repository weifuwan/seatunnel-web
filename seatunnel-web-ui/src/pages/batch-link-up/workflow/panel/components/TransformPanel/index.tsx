import { memo } from "react";
import FieldMapperPanel from "../FieldMapperPanel";
import SqlTransformPanel from "../SqlTransformPanel";

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;
}

function TransformPanel(props: Props) {
  const componentType = props.selectedNode?.data?.componentType;

  if (componentType === "FIELDMAPPER") {
    return <FieldMapperPanel {...props} />;
  }

  if (componentType === "SQL") {
    return <SqlTransformPanel {...props} />;
  }

  return <div>good</div>;
}

export default memo(TransformPanel);
