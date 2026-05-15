import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Dropdown, Popconfirm, Space, message } from "antd";
import React, { useState } from "react";

export interface StreamingJobDefinitionVO {
  id: string | number;
  jobName?: string;
  jobDesc?: string;
  mode?: string;
  jobType?: string;
  clientId?: string | number;
  jobVersion?: number;
  releaseState?: "ONLINE" | "OFFLINE" | string | number;
  lastJobStatus?: string;
  instanceId?: string | number;
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

interface RealtimeTaskActionColumnProps {
  record: StreamingJobDefinitionVO;

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

const actionBaseClass =
  "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-all duration-150";

const primaryActionClass = `${actionBaseClass} bg-[#eef3ff] text-[#3157d5] hover:bg-[#e1e9ff] hover:text-[#2448c2]`;

const dangerActionClass = `${actionBaseClass} bg-[#fff1f0] text-[#cf1322] hover:bg-[#ffe1de] hover:text-[#a8071a]`;

const secondaryActionClass = `${actionBaseClass} bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

const disabledActionClass = `${actionBaseClass} cursor-not-allowed bg-slate-100 text-slate-400`;

const moreActionClass =
  "inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800";

const isReleaseOnline = (releaseState?: string | number) => {
  return releaseState === "ONLINE" || releaseState === 1;
};

const RealtimeTaskActionColumn: React.FC<RealtimeTaskActionColumnProps> = ({
  record,
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
  const [runOpen, setRunOpen] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const isOnline = isReleaseOnline(record.releaseState);
  const isRunning = record.lastJobStatus === "RUNNING";

  const canRun = isOnline;

  const stopPropagation = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleRun = async () => {
    if (!canRun) {
      message.warning("请先上线任务，再执行运行操作");
      return;
    }

    try {
      setRunLoading(true);
      await onRun?.(record);
      setRunOpen(false);
    } finally {
      setRunLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setStopLoading(true);
      await onStop?.(record);
    } finally {
      setStopLoading(false);
    }
  };

  const handleOnline = async () => {
    try {
      setOnlineLoading(true);
      await onOnline?.(record);
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleOffline = async () => {
    try {
      setOfflineLoading(true);
      await onOffline?.(record);
    } finally {
      setOfflineLoading(false);
    }
  };

  return (
    <Space size={6} className="whitespace-nowrap">
      {isRunning ? (
        <Popconfirm
          title="停止实时任务"
          description={
            <div className="mr-3">
              停止后当前运行实例会被暂停，
              <br />
              确认停止该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            danger: true,
            size: "small",
            loading: stopLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleStop}
        >
          <button
            type="button"
            className={dangerActionClass}
            onClick={stopPropagation}
          >
            <PauseCircleOutlined />
            停止
          </button>
        </Popconfirm>
      ) : (
        <Popconfirm
          title="运行实时任务"
          open={canRun ? runOpen : false}
          onOpenChange={(open) => {
            if (!canRun) {
              message.warning("请先上线任务，再执行运行操作");
              return;
            }

            if (!runLoading) {
              setRunOpen(open);
            }
          }}
          description={
            <div className="mr-3">
              实时任务会持续运行，
              <br />
              确认立即启动该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            size: "small",
            loading: runLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleRun}
        >
          <button
            type="button"
            disabled={!canRun}
            className={canRun ? primaryActionClass : disabledActionClass}
            onClick={(event) => {
              event.stopPropagation();

              if (!canRun) {
                message.warning("请先上线任务，再执行运行操作");
              }
            }}
          >
            <PlayCircleOutlined />
            运行
          </button>
        </Popconfirm>
      )}

      {isOnline ? (
        <Popconfirm
          title="任务下线"
          description={
            <div className="mr-3">
              下线后任务将不会再被调度触发，
              <br />
              确认下线该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            size: "small",
            loading: offlineLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleOffline}
        >
          <button
            type="button"
            className={secondaryActionClass}
            onClick={stopPropagation}
          >
            <CloudDownloadOutlined />
            下线
          </button>
        </Popconfirm>
      ) : (
        <Popconfirm
          title="任务上线"
          description={
            <div className="mr-3">
              上线后任务将恢复可运行状态，并同步恢复调度，
              <br />
              确认上线该任务吗？
            </div>
          }
          okText="确认"
          cancelText="取消"
          okButtonProps={{
            size: "small",
            loading: onlineLoading,
          }}
          cancelButtonProps={{ size: "small" }}
          onConfirm={handleOnline}
        >
          <button
            type="button"
            className={secondaryActionClass}
            onClick={stopPropagation}
          >
            <CloudUploadOutlined />
            上线
          </button>
        </Popconfirm>
      )}

      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            {
              key: "view",
              icon: <EyeOutlined />,
              label: "查看详情",
            },
            {
              key: "edit",
              icon: <EditOutlined />,
              label: "编辑配置",
              disabled: isRunning,
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
              type: "divider",
            },
            {
              key: "delete",
              icon: <DeleteOutlined />,
              label: "删除任务",
              danger: true,
              disabled: isRunning,
            },
          ],
          onClick: (info) => {
            info.domEvent.stopPropagation();

            if (info.key === "view") {
              onView?.(record);
              return;
            }

            if (info.key === "edit") {
              onEdit?.(record);
              return;
            }

            if (info.key === "checkpoint") {
              onCheckpoint?.(record);
              return;
            }

            if (info.key === "log") {
              onLog?.(record);
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
          className={moreActionClass}
          onClick={stopPropagation}
        >
          更多
          <DownOutlined className="text-[10px]" />
        </button>
      </Dropdown>
    </Space>
  );
};

export default RealtimeTaskActionColumn;