import Header from "@/components/Header";
import { useIntl } from "@umijs/max";
import { Alert, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactFlow } from "reactflow";

const { Text } = Typography;

interface Props {
  selectedNode: any;
  sinkColumns: any[];
  onNodeDataChange: (nodeId: string, newData: any) => void;
  sinkForm: any;
  autoCreateTable: boolean;
}

interface FieldInfo {
  fieldName?: string;
}

interface MatrixRow {
  key: string;
  index: number;
  sourceField?: string;
  targetField?: string;
  status: "mapped" | "nameMismatch" | "unmapped";
}

const normalizeText = (value?: string) => (value || "").trim().toUpperCase();

const getFieldName = (field: any) =>
  field?.fieldName ||
  field?.name ||
  field?.targetFieldName ||
  field?.sourceFieldName ||
  "";

const getNodeFields = (node: any): FieldInfo[] => {
  if (!node?.data) return [];

  if (node?.data?.nodeType === "transform") {
    return (node?.data?.transformColumns || []).map((item: any) => ({
      fieldName: item?.targetFieldName || item?.fieldName || item?.name,
    }));
  }

  return (node?.data?.sourceFields || []).map((item: any) => ({
    fieldName: item?.fieldName || item?.name,
  }));
};

const getStatus = (
  sourceField?: string,
  targetField?: string
): MatrixRow["status"] => {
  if (!sourceField || !targetField) return "unmapped";

  const fieldMatched =
    normalizeText(sourceField) === normalizeText(targetField);

  if (fieldMatched) return "mapped";
  return "nameMismatch";
};

const renderStatusTag = (status: MatrixRow["status"], intl: any) => {
  switch (status) {
    case "mapped":
      return (
        <Tag color="success">
          {intl.formatMessage({
            id: "pages.job.node.sink.fieldsValidate.status.mapped",
            defaultMessage: "已映射",
          })}
        </Tag>
      );
    case "nameMismatch":
      return (
        <Tag color="error">
          {intl.formatMessage({
            id: "pages.job.node.sink.fieldsValidate.status.nameMismatch",
            defaultMessage: "字段名不一致",
          })}
        </Tag>
      );
    default:
      return (
        <Tag>
          {intl.formatMessage({
            id: "pages.job.node.sink.fieldsValidate.status.unmapped",
            defaultMessage: "未映射",
          })}
        </Tag>
      );
  }
};

const UpstreamFieldMatrixTable = ({
  selectedNode,
  sinkColumns,
  onNodeDataChange,
  sinkForm,
  autoCreateTable,
}: Props) => {
  const intl = useIntl();
  const { getEdges, getNode } = useReactFlow();

  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [upstreamNodes, setUpstreamNodes] = useState<any[]>([]);
  const prevAllPassRef = useRef<boolean | null>(null);

  const getPrevNodes = (currentNodeId: string) => {
    const edges = getEdges();
    return edges
      .filter((e) => e.target === currentNodeId)
      .map((e) => getNode(e.source))
      .filter(Boolean);
  };

  useEffect(() => {
    if (!selectedNode?.id) return;

    const prevNodes = getPrevNodes(selectedNode.id);
    setUpstreamNodes(prevNodes);

    const primaryUpstreamNode = prevNodes[0];
    const sourceFields = getNodeFields(primaryUpstreamNode);

    const targetFields: FieldInfo[] = autoCreateTable
      ? sourceFields.map((item) => ({
          fieldName: item?.fieldName,
        }))
      : (sinkColumns || []).map((item) => ({
          fieldName: getFieldName(item),
        }));

    const maxLen = Math.max(targetFields.length, sourceFields.length, 0);

    const nextRows: MatrixRow[] = Array.from({ length: maxLen }).map((_, i) => {
      const sourceField = sourceFields[i]?.fieldName;
      const targetField = targetFields[i]?.fieldName;

      return {
        key: `${selectedNode.id}_${i}`,
        index: i,
        sourceField,
        targetField,
        status: getStatus(sourceField, targetField),
      };
    });

    setRows(nextRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id, sinkColumns, autoCreateTable]);

  const summary = useMemo(() => {
    const total = rows.length;
    const mapped = rows.filter((row) => row.status === "mapped").length;
    const unmapped = rows.filter((row) => row.status !== "mapped").length;
    const nameMismatch = rows.filter(
      (row) => row.status === "nameMismatch"
    ).length;

    return {
      total,
      mapped,
      unmapped,
      nameMismatch,
    };
  }, [rows]);

  const allPass = useMemo(() => {
    if (!rows.length) return false;
    return rows.every((row) => row.status === "mapped");
  }, [rows]);

  useEffect(() => {
    if (!selectedNode?.id) return;

    if (prevAllPassRef.current !== allPass) {
      prevAllPassRef.current = allPass;
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        fieldCheck: allPass,
        table: sinkForm?.getFieldValue?.("table"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPass, selectedNode?.id]);

  const columns: ColumnsType<MatrixRow> = useMemo(
    () => [
      {
        title: intl.formatMessage({
          id: "pages.job.node.sink.fieldsValidate.col.index",
          defaultMessage: "#",
        }),
        dataIndex: "index",
        width: 40,
        fixed: "left",
        align: "center",
        render: (_, row) => row.index + 1,
      },
      {
        title: intl.formatMessage({
          id: "pages.job.node.sink.fieldsValidate.col.sourceField",
          defaultMessage: "源字段",
        }),
        dataIndex: "sourceField",
        width: 140,
        ellipsis: true,
        render: (value, row) => (
          <Text
            type={
              row.status === "nameMismatch" || row.status === "unmapped"
                ? "danger"
                : undefined
            }
          >
            {value || "-"}
          </Text>
        ),
      },
      {
        title: intl.formatMessage({
          id: "pages.job.node.sink.fieldsValidate.col.targetField",
          defaultMessage: "目标字段",
        }),
        dataIndex: "targetField",
        width: 140,
        ellipsis: true,
        render: (value) => value || "-",
      },
      {
        title: intl.formatMessage({
          id: "pages.job.node.sink.fieldsValidate.col.status",
          defaultMessage: "映射状态",
        }),
        dataIndex: "status",
        width: 100,
        fixed: "right",
        render: (status) => renderStatusTag(status, intl),
      },
    ],
    [intl]
  );

  if (!selectedNode) return null;

  if (!upstreamNodes.length) {
    return (
      <Alert
        type="info"
        showIcon
        message={intl.formatMessage({
          id: "pages.job.node.sink.fieldsValidate.noUpstream",
          defaultMessage: "暂无上游节点",
        })}
        description={intl.formatMessage({
          id: "pages.job.node.sink.fieldsValidate.noUpstream.desc",
          defaultMessage: "请先连接上游节点后再进行字段映射校验。",
        })}
      />
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <Header
        title={
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {intl.formatMessage({
              id: "pages.job.node.sink.fieldsValidate.title",
              defaultMessage: "字段映射",
            })}
          </div>
        }
      />

      <Space size={16} wrap style={{ marginBottom: 12 }}>
        <Text>
          {intl.formatMessage(
            {
              id: "pages.job.node.sink.fieldsValidate.summary.total",
              defaultMessage: "共 {count} 个字段",
            },
            { count: summary.total }
          )}
        </Text>
        <Text type="success">
          {intl.formatMessage(
            {
              id: "pages.job.node.sink.fieldsValidate.summary.mapped",
              defaultMessage: "已映射 {count}",
            },
            { count: summary.mapped }
          )}
        </Text>
        <Text type="danger">
          {intl.formatMessage(
            {
              id: "pages.job.node.sink.fieldsValidate.summary.unmapped",
              defaultMessage: "未通过 {count}",
            },
            { count: summary.unmapped }
          )}
        </Text>
        {summary.nameMismatch > 0 && (
          <Text type="danger">
            {intl.formatMessage(
              {
                id: "pages.job.node.sink.fieldsValidate.summary.nameMismatch",
                defaultMessage: "字段名不一致 {count}",
              },
              { count: summary.nameMismatch }
            )}
          </Text>
        )}

        {allPass ? (
          <Tag color="green">
            {intl.formatMessage({
              id: "pages.job.node.sink.fieldsValidate.allMatched",
              defaultMessage: "全部匹配",
            })}
          </Tag>
        ) : (
          <Tag color="red">
            {intl.formatMessage({
              id: "pages.job.node.sink.fieldsValidate.partialMismatch",
              defaultMessage: "存在异常",
            })}
          </Tag>
        )}
      </Space>

      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        scroll={{ x: 400, y: "60vh" }}
        columns={columns}
        dataSource={rows}
      />
    </div>
  );
};

export default UpstreamFieldMatrixTable;
