import React from "react";
import { Empty, Space, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig, ColumnsType } from "antd/es/table";
import { MenuKey, ParamItem } from "../../types";
import { BLUE, BORDER_COLOR } from "../../constants/ui";

const { Text } = Typography;

interface Props {
  activeMenu: MenuKey;
  dataSource: ParamItem[];
  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  onEdit: (record: ParamItem) => void;
  onDelete: (record: ParamItem) => void;
}

const ConnectorParamTable: React.FC<Props> = ({
  dataSource,
  loading = false,
  pagination,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnsType<ParamItem> = [
    {
      title: "Connector",
      dataIndex: "connectorName",
      key: "connectorName",
      width: 160,
      render: (_, record) =>
        record.type === "connector" ? (
          <Tag
            className="rounded-full px-[10px]"
            style={{
              borderColor: "#cdd8ff",
              color: BLUE,
              background: "#f7f9ff",
            }}
          >
            {record.connectorName}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "参数",
      dataIndex: "paramName",
      key: "paramName",
      width: 220,
      render: (value: string) => (
        <div>
          <div className="text-[14px] font-semibold leading-[1.4] text-[#101828]">
            {value}
          </div>
          <div className="mt-1 text-[12px] text-[#98A2B3]">
            Connector 参数
          </div>
        </div>
      ),
    },
    {
      title: "说明",
      dataIndex: "paramDesc",
      key: "paramDesc",
      ellipsis: true,
      render: (value: string) => (
        <Text className="text-[#475467]">{value || "-"}</Text>
      ),
    },
    {
      title: "类型",
      dataIndex: "paramType",
      key: "paramType",
      width: 130,
      render: (_, record) =>
        record.type === "connector" ? (
          <Tag
            className="rounded-[8px]"
            style={{
              color: "#3478f6",
              background: "#eff6ff",
              borderColor: "#bfdbfe",
            }}
          >
            {record.paramType}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "是否必填",
      dataIndex: "required",
      key: "required",
      width: 120,
      render: (_, record) =>
        record.type === "connector" ? (
          record.required ? (
            <Tag
              className="rounded-[8px]"
              style={{
                color: "#ef4444",
                background: "#fef2f2",
                borderColor: "#fecaca",
              }}
            >
              必填
            </Tag>
          ) : (
            <Tag
              className="rounded-[8px]"
              style={{
                color: "#475467",
                background: "#f8fafc",
                borderColor: "#e4e7ec",
              }}
            >
              非必填
            </Tag>
          )
        ) : (
          <Text type="secondary">-</Text>
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
      title: "示例值",
      dataIndex: "exampleValue",
      key: "exampleValue",
      width: 260,
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
      className="overflow-hidden rounded-[14px] bg-white"
      style={{
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <Table<ParamItem>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={
          pagination ?? {
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }
        }
        locale={{
          emptyText: (
            <div className="py-14">
              <Empty description="暂无 Connector 参数" />
            </div>
          ),
        }}
        scroll={{ x: 1250, y: "calc(100vh - 430px)" }}
      />
    </div>
  );
};

export default ConnectorParamTable;