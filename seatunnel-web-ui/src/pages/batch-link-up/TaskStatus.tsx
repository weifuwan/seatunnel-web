import {
  CheckCircleFilled,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  MacCommandOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { message, Popover } from "antd";
import React, { useEffect, useRef, useState } from "react";

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
  FINISHED: {
    color: "#52c41a",
    icon: <CheckCircleFilled />,
    text: "FINISHED",
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
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!errorMessage) return;

    try {
      await navigator.clipboard.writeText(errorMessage);
      setCopied(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  };

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
      <>
        <style>
          {`
            @keyframes copySuccessPop {
              0% {
                transform: scale(0.92);
                opacity: 0.75;
              }
              60% {
                transform: scale(1.06);
                opacity: 1;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}
        </style>

        <Popover
          placement="right"
          trigger="hover"
          content={
            <div
              style={{
                maxWidth: "80vh",
                height: "50vh",
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
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    style={{
                      color: "rgb(0, 255, 136)",
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
            <div
              style={{
                padding: "4px 12px",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <CloseOutlined style={{ color: "#ff4d4f", marginRight: 6 }} />
                <span>Error Message</span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  minWidth: 76,
                  padding: "4px 8px",
                  fontSize: 12,
                  color: copied ? "#16a34a" : "#475569",
                  background: copied ? "#f0fdf4" : "#fff",
                  border: `1px solid ${copied ? "#86efac" : "#d9d9d9"}`,
                  borderRadius: 16,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: copied
                    ? "0 0 0 2px rgba(34,197,94,0.08)"
                    : "none",
                  animation: copied ? "copySuccessPop 0.28s ease" : "none",
                }}
              >
                {copied ? <CheckOutlined /> : <CopyOutlined />}
                <span>{copied ? "已复制" : "复制"}</span>
              </button>
            </div>
          }
        >
          <span style={{ cursor: "pointer" }}>{content}</span>
        </Popover>
      </>
    );
  }

  return content;
};

export default TaskStatus;