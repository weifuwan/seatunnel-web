import { Card } from "antd";
import React from "react";
import { panelStyle } from "../constants";
import { ClientMonitoring, TrendBar } from "../types";

type Props = {
  selectedClient: ClientMonitoring;
  trendBars: TrendBar[];
};

const RuntimeTrendPanel: React.FC<Props> = ({ selectedClient, trendBars }) => {
  return (
    <Card
      bordered={false}
      style={{
        ...panelStyle,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          padding: "16px 18px 14px",
          borderBottom: "1px solid rgba(226,232,240,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#162033",
            }}
          >
            Runtime Trend
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#8a94a6",
            }}
          >
            最近 7 个采样点的小趋势，看个大概就够了
          </div>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #edf2f7",
            fontSize: 12,
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          sample · live
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            height: 200,
            borderRadius: 22,
            padding: 14,
            background: "linear-gradient(180deg, #fbfdff 0%, #f7faff 100%)",
            border: "1px solid #edf2f7",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: 10,
              height: "100%",
            }}
          >
            {trendBars.map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "end",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 48,
                    height: `${item.value}%`,
                    minHeight: 24,
                    borderRadius: 18,
                    background: item.gradient,
                    boxShadow: "0 12px 24px rgba(91,124,255,0.12)",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -26,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "#162033",
                      color: "#fff",
                      fontSize: 11,
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.tip}
                  </span>
                </div>

                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          {[
            {
              label: "Finished",
              value: selectedClient.overview.finishedJobs,
              bg: "linear-gradient(180deg, #f0fdf4 0%, #ecfdf3 100%)",
              border: "#dcfce7",
              color: "#16a34a",
            },
            {
              label: "Running",
              value: selectedClient.overview.runningJobs,
              bg: "linear-gradient(180deg, #eff6ff 0%, #eef4ff 100%)",
              border: "#dbeafe",
              color: "#2563eb",
            },
            {
              label: "Pending",
              value: selectedClient.overview.pendingJobs,
              bg: "linear-gradient(180deg, #fffaf0 0%, #fff7e8 100%)",
              border: "#fde7c7",
              color: "#d97706",
            },
            {
              label: "Failed",
              value: selectedClient.overview.failedJobs,
              bg: "linear-gradient(180deg, #fff5f5 0%, #fff1f2 100%)",
              border: "#ffe0e0",
              color: "#ef4444",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: 18,
                padding: "12px 12px 10px",
                background: item.bg,
                border: `1px solid ${item.border}`,
              }}
            >
              <div style={{ fontSize: 12, color: "#7b8794" }}>{item.label}</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 20,
                  fontWeight: 800,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RuntimeTrendPanel;