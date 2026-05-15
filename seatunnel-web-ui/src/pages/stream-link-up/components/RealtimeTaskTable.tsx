import { Empty, Table, Tooltip } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import React from "react";

import RealtimeSyncPlan from "./RealtimeSyncPlan";
import RealtimeTaskActionColumn, {
  StreamingJobDefinitionVO,
} from "./RealtimeTaskActionColumn";

interface RealtimeTaskTableProps {
  loading?: boolean;
  dataSource: StreamingJobDefinitionVO[];
  selectedRowKeys: React.Key[];
  onSelectedRowKeysChange: (keys: React.Key[]) => void;
  pagination?: false | TablePaginationConfig;

  onView?: (record: StreamingJobDefinitionVO) => void;
  onEdit?: (record: StreamingJobDefinitionVO) => void;
  onRun?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onStop?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onOnline?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onOffline?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onDelete?: (record: StreamingJobDefinitionVO) => Promise<void> | void;
  onLog?: (record: StreamingJobDefinitionVO) => void;
  onCheckpoint?: (record: StreamingJobDefinitionVO) => void;
}

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  return String(value).replace("T", " ").slice(0, 19);
};

const RealtimeTaskTable: React.FC<RealtimeTaskTableProps> = ({
  loading,
  dataSource,
  selectedRowKeys,
  onSelectedRowKeysChange,
  pagination,
  onView,
  onEdit,
  onRun,
  onStop,
  onOnline,
  onOffline,
  onDelete,
  onLog,
  onCheckpoint,
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
      width: 260,
      fixed: "right",
      render: (_, record) => (
        <RealtimeTaskActionColumn
          record={record}
          onView={onView}
          onEdit={onEdit}
          onRun={onRun}
          onStop={onStop}
          onOnline={onOnline}
          onOffline={onOffline}
          onDelete={onDelete}
          onLog={onLog}
          onCheckpoint={onCheckpoint}
        />
      ),
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