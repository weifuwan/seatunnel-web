import Header from "@/components/Header";
import { Table, Tag } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactFlow } from "reactflow";

interface Props {
  selectedNode: any;
  sinkColumns: any[];
  onNodeDataChange: (nodeId: string, newData: any) => void;
  sinkForm: any;
}

interface MatrixRow {
  key: number;
  index: number;
  fieldsByNode: Record<string, string | undefined>;
  target?: string;
}

const UpstreamFieldMatrixTable = ({
  selectedNode,
  sinkColumns,
  onNodeDataChange,
  sinkForm
}: Props) => {
  const { getEdges, getNode } = useReactFlow();
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [upstreamNodes, setUpstreamNodes] = useState<any[]>([]);
  const prevAllPassRef = useRef<boolean>(null);

  /** 获取上游节点 */
  const getPrevNodes = (currentNodeId: string) => {
    const edges = getEdges();
    return edges
      .filter((e) => e.target === currentNodeId)
      .map((e) => getNode(e.source))
      .filter(Boolean);
  };

  useEffect(() => {
    if (!selectedNode) return;
    const prevNodes = getPrevNodes(selectedNode.id);
    const targetFields = sinkColumns || [];
    setUpstreamNodes(prevNodes);

    const maxLen = Math.max(
      targetFields.length,
      ...prevNodes.map((n) => n?.data?.sourceFields?.length || 0)
    );

    const matrix: MatrixRow[] = Array.from({ length: maxLen }).map((_, i) => {
      const row: MatrixRow = {
        key: i,
        index: i,
        fieldsByNode: {},
        target: targetFields[i]?.fieldName,
      };

      prevNodes.forEach((node: any) => {
        if (node?.data?.nodeType === "transform") {
          row.fieldsByNode[node.id] =
            node?.data?.transformColumns?.[i]?.targetFieldName;
        } else {
          row.fieldsByNode[node.id] = node?.data?.sourceFields?.[i]?.fieldName;
        }
      });

      return row;
    });

    setRows(matrix);
  }, [selectedNode?.id, sinkColumns]); // 只依赖 id 和 sinkColumns

  const columns = useMemo(() => {
    const baseColumns: any[] = [
      {
        title: "序号",
        width: 60,
        fixed: "left",
        render: (_: any, row: MatrixRow) => row.index + 1,
      },
    ];

    const upstreamColumns = upstreamNodes.map((node) => ({
      title: node.data?.title || node.id,
      dataIndex: ["fieldsByNode", node.id],
      width: 100,
      ellipsis: true,
      render: (value: string | undefined, row: MatrixRow) => {
        const match = value === row.target;
        return (
          <span
            style={{
              color: match ? undefined : "#f5222d",
              fontWeight: match ? "normal" : 500,
            }}
          >
            {value ?? "-"}
          </span>
        );
      },
    }));

    const targetColumn = {
      title: "目标字段",
      dataIndex: "target",
      fixed: "right",
    };

    return [...baseColumns, ...upstreamColumns, targetColumn];
  }, [upstreamNodes]);

 
  const allPass = rows.every((row) =>
    upstreamNodes.every((node) => row.fieldsByNode[node.id] === row.target)
  );

  useEffect(() => {
    if (prevAllPassRef.current !== allPass) {
      prevAllPassRef.current = allPass;
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        fieldCheck: allPass,
        table: sinkForm.getFieldValue("table")
      });
    }
  }, [allPass, selectedNode.id]); 

  if (!upstreamNodes.length) {
    return <div>No upstream node</div>;
  }

  return (
    <div style={{ marginTop: 8 }}>
      <Header
        title={<div style={{ fontSize: 13, fontWeight: 500 }}>Match Result</div>}
      />
      <div style={{ marginBottom: 8 }}>
        {allPass ? (
          <Tag color="green">All Matched</Tag>
        ) : (
          <Tag color="red">Partial Mismatch</Tag>
        )}
      </div>

      <Table
        size="small"
        bordered
        pagination={false}
        scroll={{ x: "max-content", y: "60vh" }}
        columns={columns}
        dataSource={rows}
      />
    </div>
  );
};

export default UpstreamFieldMatrixTable;
