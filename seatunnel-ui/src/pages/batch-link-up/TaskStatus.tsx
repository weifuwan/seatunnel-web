import {
  CheckCircleFilled,
  CloseOutlined,
  Loading3QuartersOutlined,
  MacCommandOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Popover } from "antd";
import React from "react";

interface TaskStatusProps {
  status?: string;
  errorMessage?: string;
}

const statusConfig: Record<
  string,
  {
    color: string;
    icon: React.ReactNode;
    text: string;
  }
> = {
  COMPLETED: {
    color: "#52c41a",
    icon: <CheckCircleFilled />,
    text: "COMPLETED",
  },
  RUNNING: {
    color: "#1677ff",
    icon: <SyncOutlined spin />,
    text: "RUNNING",
  },
  FAILED: {
    color: "#ff4d4f",
    icon: <CloseOutlined />,
    text: "FAILED",
  },
  CANCELED: {
    color: "#8c8c8c",
    icon: <StopOutlined />,
    text: "CANCELED",
  },
  PAUSED: {
    color: "#faad14",
    icon: <PauseCircleOutlined />,
    text: "PAUSED",
  },
};

const TaskStatus: React.FC<TaskStatusProps> = ({ status, errorMessage }) => {
  const config = status ? statusConfig[status] : undefined;

  // 默认状态
  if (!config) {
    return (
      <span style={{ color: "#999" }}>
        <MacCommandOutlined style={{ marginRight: 6 }} />
        <span style={{ fontWeight: 500 }}>NOT STARTED</span>
      </span>
    );
  }

  const content = (
    <span style={{ color: config.color }}>
      <span style={{ marginRight: 6 }}>{config.icon}</span>
      <span style={{ fontWeight: 500 }}>{config.text}</span>
    </span>
  );

  // 失败时才包 Popover
  if (status === "FAILED" && errorMessage) {
    const lines = errorMessage.split("\n");

    return (
      <Popover
        placement="right"
        content={
          <div
            style={{
              maxWidth: "60vh",
              height: 400,
              overflow: "auto",
              backgroundColor: "#0f172a",
              padding: "12px",
              fontFamily: "Menlo, Monaco, Consolas, monospace",
              fontSize: 13,
              lineHeight: 1.6,
              borderRadius: 6,
            }}
          >
            {lines.map((line, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 40,
                    textAlign: "right",
                    paddingRight: 12,
                    color: "#64748b",
                    userSelect: "none",
                  }}
                >
                  {index + 1}
                </span>
                <span
                  style={{
                    color: "#e2e8f0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    flex: 1,
                  }}
                >
                  {line || " "}
                </span>
              </div>
            ))}
          </div>
        }
        title={
          <div style={{ padding: "4px 12px", fontSize: 15 }}>
            <CloseOutlined style={{ color: "#ff4d4f", marginRight: 6 }} />
            Error Message
          </div>
        }
        trigger="hover"
      >
        <span style={{ cursor: "pointer" }}>{content}</span>
      </Popover>
    );
  }

  return content;
};

export default TaskStatus;
