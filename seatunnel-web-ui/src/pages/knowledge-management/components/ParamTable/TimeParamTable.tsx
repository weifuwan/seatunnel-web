import React from "react";
import { Empty, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MenuKey, ParamItem } from "../../types";
import { BLUE, BORDER_COLOR } from "../../constants/ui";

const { Text } = Typography;

interface Props {
  activeMenu: MenuKey;
  dataSource: ParamItem[];
  onEdit: (record: ParamItem) => void;
  onDelete: (record: ParamItem) => void;
}

const TimeParamTable: React.FC<Props> = ({
  dataSource,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<ParamItem> = [
    {
      title: "参数",
      dataIndex: "paramName",
      key: "paramName",
      width: 220,
      render: (value: string) => (
        <div>
          <div style={{ fontWeight: 600, color: "#101828", lineHeight: 1.4 }}>
            {value}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#98a2b3",
            }}
          >
            时间变量
          </div>
        </div>
      ),
    },
    {
      title: "说明",
      dataIndex: "paramDesc",
      key: "paramDesc",
      ellipsis: true,
      render: (value: string) => <Text style={{ color: "#475467" }}>{value}</Text>,
    },
    {
      title: "格式",
      dataIndex: "timeFormat",
      key: "timeFormat",
      width: 180,
      render: (_, record) =>
        record.type === "time" ? (
          <Tag
            style={{
              borderRadius: 8,
              color: "#3478f6",
              background: "#eff6ff",
              borderColor: "#bfdbfe",
            }}
          >
            {record.timeFormat}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 180,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "动态表达式",
      dataIndex: "expression",
      key: "expression",
      width: 180,
      ellipsis: true,
      render: (_, record) =>
        record.type === "time" && record.expression ? (
          <Text>{record.expression}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "示例值",
      dataIndex: "exampleValue",
      key: "exampleValue",
      width: 180,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_: unknown, record: ParamItem) => (
        <Space size={16}>
          <a onClick={() => onEdit(record)} style={{ color: BLUE }}>
            编辑
          </a>
          <a onClick={() => onDelete(record)} style={{ color: "#ff4d4f" }}>
            删除
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <Table<ParamItem>
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "56px 0" }}>
              <Empty description="暂无时间变量" />
            </div>
          ),
        }}
        scroll={{ x: 1200, y: "calc(100vh - 430px)" }}
      />
    </div>
  );
};

export default TimeParamTable;