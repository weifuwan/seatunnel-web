// import type { FC } from "react";
// import { memo, useEffect, useState } from "react";

// import { Tabs } from "antd";
// import { useReactFlow } from "reactflow";
// import FieldMapperTransform from "./FieldMapperTransform";
// import "./index.less";

// interface AppProps {
//   selectedNode: {
//     id: string;
//     data: any;
//   };
//   onNodeDataChange: (nodeId: string, newData: any) => void;
// }

// const App: FC<AppProps> = ({ selectedNode, onNodeDataChange }) => {
//   const { getNodes, getEdges } = useReactFlow();
//   const [sourceColumns, setSourceColumns] = useState<any[]>([]);
//   useEffect(() => {
//     if (selectedNode) {
//       const allNodes = getNodes();
//       const allEdges = getEdges();

//       const edges = Array.isArray(allEdges) ? allEdges : [];
//       const nodes = Array.isArray(allNodes) ? allNodes : [];

//       const incomingEdges = edges.filter(
//         (edge) => edge?.target === selectedNode.id
//       );

//       const previousNodeIds = incomingEdges
//         .map((edge) => edge?.source)
//         .filter((id): id is string => !!id);
//       const previousNodes = nodes.filter(
//         (node) => node?.id && previousNodeIds.includes(node.id)
//       );

//       const upstreamNode = previousNodes[0];
//       const upstreamFields = upstreamNode?.data?.sourceFields || [];
//       const isUpstreamChanged = () => {
//         const transformColumns = selectedNode?.data?.transformColumns;

//         if (!transformColumns || transformColumns.length === 0) {
//           return false;
//         }

//         const upstreamFieldSet = new Set(
//           upstreamFields.map((f: any) => f.fieldName)
//         );

//         return transformColumns.some(
//           (col: any) => !upstreamFieldSet.has(col.fieldName)
//         );
//       };
//       if (previousNodes && previousNodes.length > 0) {
//         if (
//           selectedNode?.data?.transformColumns !== undefined &&
//           selectedNode?.data?.transformColumns?.length > 0
//         ) {
//           if (isUpstreamChanged()) {
//             const newColumns = upstreamFields.map((item: any) => ({
//               ...item,
//               targetFieldName: item.fieldName,
//               targetFieldType: item.fieldType,
//             }));
//             setSourceColumns(newColumns);
//           } else {
//             setSourceColumns(selectedNode?.data?.transformColumns || []);
//           }
//         } else {
//           const leftNodeData = previousNodes[0];
//           const sourceFields = leftNodeData?.data?.sourceFields;
//           const addTargetFields = sourceFields?.map((item: any) => {
//             return {
//               ...item,
//               targetFieldName: item?.fieldName,
//               targetFieldType: item?.fieldType,
//             };
//           });
//           setSourceColumns(addTargetFields || []);
//         }
//       }
//     }
//   }, [selectedNode]);

//   useEffect(() => {
//     if (!selectedNode || !onNodeDataChange) return;
//     const nodes = getNodes() || [];
//     const edges = getEdges() || [];
//     const incomingEdge = edges.find((e) => e.target === selectedNode.id);
//     const upstreamNode = nodes.find((n) => n.id === incomingEdge?.source);
//     const upstreamPluginOutput = upstreamNode?.data?.plugin_output;
//     const outgoingEdge = edges.find((e) => e.source === selectedNode.id);
//     const downstreamNode = nodes.find((n) => n.id === outgoingEdge?.target);
//     const downstreamPluginInput = downstreamNode?.data?.plugin_input;
//     onNodeDataChange(selectedNode.id, {
//       ...selectedNode.data,
//       pluginInput: upstreamPluginOutput,
//       pluginOutput: downstreamPluginInput,
//     });
//   }, [selectedNode]);

//   const items = [
//     {
//       key: "1",
//       label: "Mapper Setting",
//       children: (
//         <FieldMapperTransform
//           selectedNode={selectedNode}
//           onNodeDataChange={onNodeDataChange}
//           sourceColumns={sourceColumns || []}
//           setSourceColumns={setSourceColumns}
//         />
//       ),
//     },
//   ];

//   return (
//     <>
//       <div style={{ padding: "0 16px" }}>
//         <Tabs defaultActiveKey="1" items={items} />
//       </div>
//     </>
//   );
// };

// export default memo(App);

import { memo } from "react";
import PanelShell from "../PanelShell";

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

function TransformPanel({ selectedNode, onClose }: Props) {
  const title = selectedNode?.data?.title || "SQL 脚本";
  const description =
    selectedNode?.data?.description || "支持自定义查询逻辑";

  return (
    <PanelShell
      eyebrow="Transform Config"
      title="转换配置"
      badge="处理节点"
      desc="当前节点用于中间转换处理，先展示转换配置面板骨架。"
      heroTitle={title}
      heroDesc={description}
      heroTag="TRANSFORM"
      onClose={onClose}
      icon={<span className="workflow-panel__transform-mark">{`{ }`}</span>}
    >
      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">基础信息</div>
          <div className="workflow-panel__section-tip">Transform</div>
        </div>

        <div className="workflow-panel__form-grid">
          <div className="workflow-panel__field workflow-panel__field--full">
            <div className="workflow-panel__label">节点名称</div>
            <div className="workflow-panel__control">{title}</div>
          </div>

          <div className="workflow-panel__field workflow-panel__field--full">
            <div className="workflow-panel__label">节点说明</div>
            <div className="workflow-panel__textarea">{description}</div>
          </div>
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">脚本配置</div>
          <div className="workflow-panel__section-tip">占位</div>
        </div>

        <div className="workflow-panel__textarea" style={{ minHeight: 140 }}>
          SELECT * FROM source_table
          <br />
          WHERE status = 'ACTIVE'
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">能力标签</div>
          <div className="workflow-panel__section-tip">占位</div>
        </div>

        <div className="workflow-panel__chips">
          <span className="workflow-panel__chip">SQL</span>
          <span className="workflow-panel__chip">过滤</span>
          <span className="workflow-panel__chip">字段转换</span>
        </div>
      </section>
    </PanelShell>
  );
}

export default memo(TransformPanel);