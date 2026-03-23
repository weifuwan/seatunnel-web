import { Card } from "antd";
import React from "react";
import { panelStyle } from "../constants";
import { ClientMonitoring, HealthInfo } from "../types";

type Props = {
  selectedClient: ClientMonitoring;
  health: HealthInfo;
};

const getProgressColor = (score: number) => {
  if (score >= 85) return "#52c41a";
  if (score >= 70) return "#faad14";
  return "#ff4d4f";
};

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const color = getProgressColor(score);

  return (
    <div
      style={{
        width: 86,
        height: 86,
        borderRadius: "50%",
        background: `conic-gradient(${color} ${score * 3.6}deg, #edf2f7 0deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: "#9aa4b2",
            letterSpacing: 0.3,
          }}
        >
          SCORE
        </div>
      </div>
    </div>
  );
};

const HeroPanel: React.FC<Props> = ({ selectedClient, health }) => {
  const headerBg =
    health.level === "critical"
      ? "linear-gradient(135deg, #fff6f7 0%, #fff1f3 100%)"
      : health.level === "warning"
      ? "linear-gradient(135deg, #fffaf2 0%, #fff7ed 100%)"
      : "linear-gradient(135deg, #f7fcf5 0%, #f2fbf0 100%)";

  const badgeBg =
    health.level === "critical"
      ? "#ffe8ee"
      : health.level === "warning"
      ? "#fff1db"
      : "#eaf7e8";

  const badgeColor =
    health.level === "critical"
      ? "#e11d48"
      : health.level === "warning"
      ? "#d97706"
      : "#2f9e44";
  return (
    <Card
      bordered={false}
      style={{
        ...panelStyle,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f7faff 0%, #f8f7ff 42%, #fffdf8 100%)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          position: "relative",
          padding: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(96, 126, 255, 0.10)",
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: -70,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(82, 196, 26, 0.08)",
            filter: "blur(10px)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 260, flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(226,232,240,0.9)",
                color: "#5b6472",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: health.color,
                }}
              />
              Client heartbeat
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 30,
                lineHeight: 1.15,
                fontWeight: 800,
                color: "#162033",
                letterSpacing: "-0.03em",
              }}
            >
              {selectedClient.region} 节点今天状态
              <span style={{ color: "#5b7cff", marginLeft: 8 }}>还不错</span>
              {health.level === "critical" ? "，但要盯一下 👀" : " ✨"}
            </div>

            <div
              style={{
                marginTop: 10,
                maxWidth: 620,
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.7,
              }}
            >
              已接入 {selectedClient.engineType} 引擎，当前版本{" "}
              {selectedClient.version}，节点状态为「{selectedClient.statusText}
              」。
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label: "活跃连接",
                  value: selectedClient.monitoring.connectionActiveCount,
                },
                {
                  label: "线程数",
                  value: selectedClient.monitoring.threadCount,
                },
                {
                  label: "运行任务",
                  value: selectedClient.overview.runningJobs,
                },
                {
                  label: "失败任务",
                  value: selectedClient.overview.failedJobs,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    minWidth: 112,
                    borderRadius: 18,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid #edf2f7",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.03)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#8a94a6" }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#162033",
                      lineHeight: 1,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                borderRadius: 24,
                padding: 18,
                background: headerBg,
                border: "1px solid #edf1f5",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: badgeBg,
                      color: badgeColor,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span>
                      {health.level === "healthy"
                        ? "💚"
                        : health.level === "warning"
                        ? "🧡"
                        : "❤️"}
                    </span>
                    <span>{health.title}</span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 14,
                      color: "#6b7280",
                      lineHeight: 1.7,
                    }}
                  >
                    {health.subtitle}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(226,232,240,0.9)",
                      fontSize: 12,
                      color: "#7b8794",
                    }}
                  >
                    <span>当前 Client</span>
                    <span style={{ color: "#111827", fontWeight: 700 }}>
                      {selectedClient.name}
                    </span>
                  </div>
                </div>

                <ScoreRing score={health.score} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HeroPanel;
