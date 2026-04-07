import React from "react";
import { Button, Space, Tag, notification } from "antd";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import "./index.less";

type NotifyType = "error" | "success" | "warning" | "info";

interface PrettyNotificationOptions {
  type?: NotifyType;
  title: string;
  description?: React.ReactNode;
  meta?: string;
  btnText?: string;
  onClick?: () => void;
  duration?: number;
  placement?: "topRight" | "topLeft" | "bottomRight" | "bottomLeft";
}

const toneMap = {
  error: {
    icon: <AlertCircle size={18} />,
    color: "#ef4444",
    tag: "Error",
    glow: "rgba(239, 68, 68, 0.12)",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,245,245,0.96))",
  },
  success: {
    icon: <CheckCircle2 size={18} />,
    color: "#22c55e",
    tag: "Success",
    glow: "rgba(34, 197, 94, 0.12)",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,253,244,0.96))",
  },
  warning: {
    icon: <TriangleAlert size={18} />,
    color: "#f59e0b",
    tag: "Warning",
    glow: "rgba(245, 158, 11, 0.12)",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,251,235,0.96))",
  },
  info: {
    icon: <Info size={18} />,
    color: "#3b82f6",
    tag: "Info",
    glow: "rgba(59, 130, 246, 0.12)",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,246,255,0.96))",
  },
};

export function openPrettyNotification({
  type = "info",
  title,
  description,
  meta,
  btnText,
  onClick,
  duration = 4,
  placement = "topRight",
}: PrettyNotificationOptions) {
  const tone = toneMap[type];

  notification.open({
    placement,
    duration,
    message: null,
    closeIcon: false,
    className: "pretty-notification-wrapper",
    style: {
      width: 420,
      background: "transparent",
      boxShadow: "none",
      padding: 0,
    },
    description: (
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          padding: 16,
          background: tone.bg,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.10), 0 2px 10px rgba(15, 23, 42, 0.06)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: tone.color,
          }}
        />

        <Space align="start" size={12} style={{ width: "100%" }}>
          <div
            style={{
              width: 38,
              height: 38,
              minWidth: 38,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              color: tone.color,
              background: tone.glow,
              border: `1px solid ${tone.glow}`,
            }}
          >
            {tone.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#172033",
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>

              <Tag
                bordered={false}
                style={{
                  marginInlineEnd: 0,
                  borderRadius: 999,
                  fontSize: 12,
                  color: tone.color,
                  background: tone.glow,
                }}
              >
                {tone.tag}
              </Tag>
            </div>

            {description ? (
              <div
                style={{
                  fontSize: 13,
                  lineHeight: "22px",
                  color: "rgba(23, 32, 51, 0.72)",
                  wordBreak: "break-word",
                }}
              >
                {description}
              </div>
            ) : null}

            {(meta || btnText) && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(23, 32, 51, 0.45)",
                  }}
                >
                  {meta}
                </span>

                {btnText ? (
                  <Button
                    type="text"
                    size="small"
                    onClick={onClick}
                    style={{
                      paddingInline: 8,
                      height: 28,
                      color: tone.color,
                      fontWeight: 600,
                    }}
                  >
                    <Space size={4}>
                      {btnText}
                      <ArrowRight size={14} />
                    </Space>
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </Space>
      </div>
    ),
  });
}