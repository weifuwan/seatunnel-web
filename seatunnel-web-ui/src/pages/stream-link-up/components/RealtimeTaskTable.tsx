import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Dropdown, Empty, Space, Table, Tooltip } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import React from "react";

import RealtimeSyncPlan from "./RealtimeSyncPlan";

interface StreamingJobDefinitionVO {
  id: string | number;
  jobName?: string;
  jobDesc?: string;
  mode?: string;
  jobType?: string;
  clientId?: string | number;
  jobVersion?: number;
  releaseState?: "ONLINE" | "OFFLINE" | string;
  sourceType?: string;
  sinkType?: string;
  sourceTable?: string;
  sinkTable?: string;
  sourceDatasourceId?: string | number;
  sinkDatasourceId?: string | number;
  createTime?: string;
  updateTime?: string;
  checkpointConfig?: string;
}

interface RealtimeTaskTableProps {
  loading?: boolean;
  dataSource: StreamingJobDefinitionVO[];
  selectedRowKeys: React.Key[];
  onSelectedRowKeysChange: (keys: React.Key[]) => void;
  pagination?: false | TablePaginationConfig;

  onView?: (record: StreamingJobDefinitionVO) => void;
  onEdit?: (record: StreamingJobDefinitionVO) => void;
  onOnline?: (record: StreamingJobDefinitionVO) => void;
  onOffline?: (record: StreamingJobDefinitionVO) => void;
  onDelete?: (record: StreamingJobDefinitionVO) => void;
}

const formatEmpty = (value?: React.ReactNode) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return value;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  /**
   * 后端如果直接返回 Date 的字符串，这里先做轻量兼容。
   * 如果你项目里有 dayjs，也可以统一改成 dayjs(value).format("YYYY-MM-DD HH:mm:ss")
   */
  return String(value).replace("T", " ").slice(0, 19);
};

const getConnectorLabel = (type?: string) => {
  if (!type) return "-";

  const map: Record<string, string> = {
    MYSQL: "MySQL",
    ORACLE: "Oracle",
    POSTGRE_SQL: "PostgreSQL",
    POSTGRESQL: "PostgreSQL",
    SQLSERVER: "SQL Server",
    DORIS: "Doris",
    STARROCKS: "StarRocks",
    ELASTICSEARCH: "Elasticsearch",
  };

  return map[type] || type;
};

const normalizeConnectorType = (type?: string) => {
  if (!type) return "UNKNOWN";
  return type;
};

const RealtimeTaskTable: React.FC<RealtimeTaskTableProps> = ({
  loading,
  dataSource,
  selectedRowKeys,
  onSelectedRowKeysChange,
  pagination,
  onView,
  onEdit,
  onOnline,
  onOffline,
  onDelete,
}) => {
  const columns: ColumnsType<StreamingJobDefinitionVO> = [
    {
      title: "名称/ID",
      dataIndex: "jobName",
      width: 240,
      render: (_, record) => (
        <div>
          <div className="max-w-[190px] truncate font-bold leading-6 text-slate-950">
            <Tooltip title={record.jobName || record.id}>
              <span>{record.jobName || "未命名实时任务"}</span>
            </Tooltip>
          </div>

          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <span>ID: {record.id}</span>
            <span className="text-slate-300">⧉</span>
          </div>

          {record.jobDesc ? (
            <div className="mt-1 max-w-[200px] truncate text-xs text-slate-400">
              {record.jobDesc}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: "数据同步方案",
      dataIndex: "syncPlan",
      width: 360,
      render: (_, record) => <RealtimeSyncPlan record={record} />,
    },
    {
      title: "最近更新时间",
      dataIndex: "updateTime",
      width: 180,
      render: (value) => (
        <span className="text-sm text-slate-600">{formatDateTime(value)}</span>
      ),
    },
    {
      title: "操作",
      dataIndex: "operate",
      width: 220,
      fixed: "right",
      render: (_, record) => {
        const isOnline = record.releaseState === "ONLINE";

        return (
          <Space size={6} className="whitespace-nowrap">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-full bg-transparent px-2.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900"
              onClick={(event) => {
                event.stopPropagation();
                onView?.(record);
              }}
            >
              <EyeOutlined />
              查看
            </button>

            {isOnline ? (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-xs font-medium text-amber-700 transition-all duration-150 hover:bg-amber-100 hover:text-amber-800"
                onClick={(event) => {
                  event.stopPropagation();
                  onOffline?.(record);
                }}
              >
                <PauseCircleOutlined />
                下线
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-full bg-indigo-50 px-2.5 text-xs font-medium text-indigo-600 transition-all duration-150 hover:bg-indigo-100 hover:text-indigo-700"
                onClick={(event) => {
                  event.stopPropagation();
                  onOnline?.(record);
                }}
              >
                <PlayCircleOutlined />
                上线
              </button>
            )}

            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "edit",
                    icon: <EditOutlined />,
                    label: "编辑配置",
                  },
                  {
                    key: "checkpoint",
                    label: "查看检查点",
                    disabled: !record.checkpointConfig,
                  },
                  {
                    key: "log",
                    label: "运行日志",
                  },
                  {
                    key: "delete",
                    icon: <DeleteOutlined />,
                    label: "删除任务",
                    danger: true,
                  },
                ],
                onClick: (info) => {
                  info.domEvent.stopPropagation();

                  if (info.key === "edit") {
                    onEdit?.(record);
                    return;
                  }

                  if (info.key === "checkpoint") {
                    /**
                     * 这里后续可以弹 Modal 展示 record.checkpointConfig。
                     */
                    return;
                  }

                  if (info.key === "log") {
                    /**
                     * 这里后续可以跳转到实例/日志页。
                     */
                    return;
                  }

                  if (info.key === "delete") {
                    onDelete?.(record);
                  }
                },
              }}
            >
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800"
                onClick={(event) => event.stopPropagation()}
              >
                更多
                <DownOutlined className="text-[10px]" />
              </button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      scroll={{ x: 1480 }}
      bordered
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectedRowKeysChange,
      }}
      className={[
        "[&_.ant-table]:!rounded-xl",
        "[&_.ant-table-thead>tr>th]:!bg-slate-50",
        "[&_.ant-table-thead>tr>th]:!font-bold",
        "[&_.ant-table-thead>tr>th]:!text-slate-700",
        "[&_.ant-table-tbody>tr>td]:!border-slate-100",
        "[&_.ant-table-tbody>tr:hover>td]:!bg-slate-50/70",
        "[&_.ant-pagination]:!px-1",
      ].join(" ")}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无实时同步任务"
          />
        ),
      }}
    />
  );
};

export default RealtimeTaskTable;
