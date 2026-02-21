import type { FC } from "react";
import { memo, useEffect, useState } from "react";

import { Tabs } from "antd";
import { useReactFlow } from "reactflow";
import FieldMapperTransform from "./FieldMapperTransform";
import "./index.less";

interface AppProps {
  selectedNode: {
    id: string;
    data: any;
  };
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const App: FC<AppProps> = ({ selectedNode, onNodeDataChange }) => {
  const { getNodes, getEdges } = useReactFlow();
  const [sourceColumns, setSourceColumns] = useState<any[]>([]);
  useEffect(() => {
    if (selectedNode) {
      const allNodes = getNodes();
      const allEdges = getEdges();

      const edges = Array.isArray(allEdges) ? allEdges : [];
      const nodes = Array.isArray(allNodes) ? allNodes : [];

      const incomingEdges = edges.filter(
        (edge) => edge?.target === selectedNode.id
      );

      const previousNodeIds = incomingEdges
        .map((edge) => edge?.source)
        .filter((id): id is string => !!id);
      const previousNodes = nodes.filter(
        (node) => node?.id && previousNodeIds.includes(node.id)
      );

      const upstreamNode = previousNodes[0];
      const upstreamFields = upstreamNode?.data?.sourceFields || [];
      const isUpstreamChanged = () => {
        const transformColumns = selectedNode?.data?.transformColumns;

        if (!transformColumns || transformColumns.length === 0) {
          return false;
        }

        const upstreamFieldSet = new Set(
          upstreamFields.map((f: any) => f.fieldName)
        );

        return transformColumns.some(
          (col: any) => !upstreamFieldSet.has(col.fieldName)
        );
      };
      if (previousNodes && previousNodes.length > 0) {
        if (
          selectedNode?.data?.transformColumns !== undefined &&
          selectedNode?.data?.transformColumns?.length > 0
        ) {
          if (isUpstreamChanged()) {
            const newColumns = upstreamFields.map((item: any) => ({
              ...item,
              targetFieldName: item.fieldName,
              targetFieldType: item.fieldType,
            }));
            setSourceColumns(newColumns);
          } else {
            setSourceColumns(selectedNode?.data?.transformColumns || []);
          }
        } else {
          const leftNodeData = previousNodes[0];
          const sourceFields = leftNodeData?.data?.sourceFields;
          const addTargetFields = sourceFields?.map((item: any) => {
            return {
              ...item,
              targetFieldName: item?.fieldName,
              targetFieldType: item?.fieldType,
            };
          });
          setSourceColumns(addTargetFields || []);
        }
      }
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!selectedNode || !onNodeDataChange) return;
    const nodes = getNodes() || [];
    const edges = getEdges() || [];
    const incomingEdge = edges.find((e) => e.target === selectedNode.id);
    const upstreamNode = nodes.find((n) => n.id === incomingEdge?.source);
    const upstreamPluginOutput = upstreamNode?.data?.plugin_output;
    const outgoingEdge = edges.find((e) => e.source === selectedNode.id);
    const downstreamNode = nodes.find((n) => n.id === outgoingEdge?.target);
    const downstreamPluginInput = downstreamNode?.data?.plugin_input;
    onNodeDataChange(selectedNode.id, {
      ...selectedNode.data,
      pluginInput: upstreamPluginOutput,
      pluginOutput: downstreamPluginInput,
    });
  }, [selectedNode]);

  const items = [
    {
      key: "1",
      label: "Mapper Setting",
      children: (
        <FieldMapperTransform
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
          sourceColumns={sourceColumns || []}
          setSourceColumns={setSourceColumns}
        />
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "0 16px" }}>
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </>
  );
};

export default memo(App);
