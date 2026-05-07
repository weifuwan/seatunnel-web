import {
  ArrowRightOutlined,
  DownOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Dropdown, Empty, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import type { RealtimeTask, StreamStatus } from "../types";
import ConnectorPill from "./ConnectorPill";
import MiniSparkline from "./MiniSparkline";
import StatusBadge from "./StatusBadge";

interface RealtimeTaskTableProps {
  dataSource: RealtimeTask[];
  selectedRowKeys: React.Key[];
  onSelectedRowKeysChange: (keys: React.Key[]) => void;
}

const RealtimeTaskTable: React.FC<RealtimeTaskTableProps> = ({
  dataSource,
  selectedRowKeys,
  onSelectedRowKeysChange,
}) => {
  const columns: ColumnsType<RealtimeTask> = [
    {
      title: "名称/ID",
      dataIndex: "name",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-bold leading-6 text-slate-950">
            {record.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-400">
            ID: {record.id}
            <span className="ml-1 text-slate-300">⧉</span>
          </div>
        </div>
      ),
    },
    {
      title: "实时同步方案",
      dataIndex: "syncPlan",
      width: 280,
      render: (_, record) => (
        <div className="flex min-w-[240px] items-center gap-3">
          <ConnectorPill type={record.sourceType} label={record.sourceLabel} />
          <ArrowRightOutlined className="text-xs text-slate-400" />
          <ConnectorPill type={record.sinkType} label={record.sinkLabel} />
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 130,
      render: (value: StreamStatus) => <StatusBadge status={value} />,
    },
    {
      title: "吞吐",
      dataIndex: "throughput",
      width: 170,
      render: (_, record) => (
        <div className="flex items-center gap-2 font-bold text-slate-950">
          <span>{record.throughput}</span>
          {record.throughput !== "-" && (
            <span className="text-xs font-medium text-slate-500">events/s</span>
          )}
          {record.throughput !== "-" && <MiniSparkline type="blue" />}
        </div>
      ),
    },
    {
      title: "延迟",
      dataIndex: "latency",
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2 font-bold text-slate-950">
          <span>{record.latency}</span>
          {record.latency !== "-" && <MiniSparkline type={record.trendType} />}
        </div>
      ),
    },
    {
      title: "检查点",
      dataIndex: "checkpoint",
      width: 190,
      render: (value: string[]) => (
        <div className="font-mono text-xs leading-5 text-slate-600">
          {value.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      ),
    },
    {
      title: "最近更新时间",
      dataIndex: "updateTime",
      width: 180,
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
    {
      title: "操作",
      dataIndex: "operate",
      width: 190,
      fixed: "right",
      render: (_, record) => {
        const canPause =
          record.status === "RUNNING" || record.status === "WARNING";
        const canRun =
          record.status === "PAUSED" || record.status === "STOPPED";

        return (
          <Space size={6} className="whitespace-nowrap">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-full bg-transparent px-2.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900"
              onClick={(event) => {
                event.stopPropagation();
                // TODO: 查看详情
              }}
            >
              <EyeOutlined />
              查看
            </button>

            {canPause && (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-xs font-medium text-amber-700 transition-all duration-150 hover:bg-amber-100 hover:text-amber-800"
                onClick={(event) => {
                  event.stopPropagation();
                  // TODO: 暂停任务
                }}
              >
                <PauseCircleOutlined />
                暂停
              </button>
            )}

            {canRun && (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-full bg-indigo-50 px-2.5 text-xs font-medium text-indigo-600 transition-all duration-150 hover:bg-indigo-100 hover:text-indigo-700"
                onClick={(event) => {
                  event.stopPropagation();
                  // TODO: 运行任务
                }}
              >
                <PlayCircleOutlined />
                运行
              </button>
            )}

            {!canPause && !canRun && (
              <button
                type="button"
                disabled
                className="inline-flex h-7 cursor-not-allowed items-center gap-1 rounded-full bg-slate-100 px-2.5 text-xs font-medium text-slate-400"
                onClick={(event) => event.stopPropagation()}
              >
                <PlayCircleOutlined />
                运行
              </button>
            )}

            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: "edit", label: "编辑配置" },
                  { key: "checkpoint", label: "查看检查点" },
                  { key: "log", label: "运行日志" },
                  { key: "delete", label: "删除任务", danger: true },
                ],
                onClick: (info) => {
                  info.domEvent.stopPropagation();

                  if (info.key === "edit") {
                    // TODO: 编辑配置
                    return;
                  }

                  if (info.key === "checkpoint") {
                    // TODO: 查看检查点
                    return;
                  }

                  if (info.key === "log") {
                    // TODO: 运行日志
                    return;
                  }

                  if (info.key === "delete") {
                    // TODO: 删除任务
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
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: 1380 }}
      bordered
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectedRowKeysChange,
      }}
      className={[
        "[&_.ant-table-thead>tr>th]:!bg-slate-50",
        "[&_.ant-table-thead>tr>th]:!font-bold",
        "[&_.ant-table-thead>tr>th]:!text-slate-700",
        "[&_.ant-table-tbody>tr>td]:!border-slate-100",
        "[&_.ant-table-tbody>tr:hover>td]:!bg-slate-50/70",
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
