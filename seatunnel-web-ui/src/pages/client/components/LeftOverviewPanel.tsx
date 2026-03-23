import React, { useMemo } from "react";
import type { ClientMonitoring, HealthInfo } from "./types";

type LeftOverviewPanelProps = {
  selectedClient: ClientMonitoring;
  health: HealthInfo;
};

type SummaryItem = {
  label: string;
  value: string;
  emoji: string;
  tone: "green" | "amber" | "rose" | "blue";
};

const toneMap = {
  green: {
    bg: "linear-gradient(180deg, #f7fdf7 0%, #f2fbf2 100%)",
    border: "#e4f4e4",
    text: "#166534",
    subText: "#6b7280",
    softBg: "#eefaf0",
  },
  amber: {
    bg: "linear-gradient(180deg, #fffaf3 0%, #fff7ed 100%)",
    border: "#f7e7c6",
    text: "#b45309",
    subText: "#7c6f64",
    softBg: "#fff3df",
  },
  rose: {
    bg: "linear-gradient(180deg, #fff7f8 0%, #fff1f3 100%)",
    border: "#f7dbe3",
    text: "#be123c",
    subText: "#7f6a72",
    softBg: "#ffe8ee",
  },
  blue: {
    bg: "linear-gradient(180deg, #f7fbff 0%, #f1f7ff 100%)",
    border: "#dce9f8",
    text: "#2563eb",
    subText: "#6b7280",
    softBg: "#eaf3ff",
  },
};

const getProgressColor = (score: number) => {
  if (score >= 85) return "#52c41a";
  if (score >= 70) return "#faad14";
  return "#ff4d4f";
};

const buildSummaryItems = (
  selectedClient: ClientMonitoring,
  health: HealthInfo
): SummaryItem[] => {
  const heapPercent = Number(selectedClient.monitoring.heapMemoryUsedTotalPercent || 0);
  const systemLoad = Number(selectedClient.monitoring.loadSystemPercent || 0);
  const failedJobs = Number(selectedClient.overview.failedJobs || 0);
  const runningJobs = Number(selectedClient.overview.runningJobs || 0);
  const eventQSize = Number(selectedClient.monitoring.eventQSize || 0);
  const threadCount = Number(selectedClient.monitoring.threadCount || 0);

  const runtimeStatus =
    health.level === "critical"
      ? { value: "现在需要优先关注", emoji: "🚨", tone: "rose" as const }
      : health.level === "warning"
      ? { value: "有一点点压力", emoji: "🌤️", tone: "amber" as const }
      : { value: "整体运行很平稳", emoji: "🌿", tone: "green" as const };

  let focusItem: SummaryItem = {
    label: "最关注项",
    value: "资源状态都还舒服",
    emoji: "✨",
    tone: "blue",
  };

  if (heapPercent >= 75) {
    focusItem = {
      label: "最关注项",
      value: `Heap 使用率 ${heapPercent}%`,
      emoji: "🧠",
      tone: "amber",
    };
  } else if (systemLoad >= 80) {
    focusItem = {
      label: "最关注项",
      value: `系统负载 ${systemLoad}%`,
      emoji: "⚙️",
      tone: "rose",
    };
  } else if (eventQSize >= 100) {
    focusItem = {
      label: "最关注项",
      value: `事件堆积 ${eventQSize}`,
      emoji: "📦",
      tone: "amber",
    };
  } else if (threadCount >= 120) {
    focusItem = {
      label: "最关注项",
      value: `线程数 ${threadCount}`,
      emoji: "🧵",
      tone: "blue",
    };
  }

  const taskRhythm =
    failedJobs > 0
      ? {
          label: "任务节奏",
          value: `失败任务 ${failedJobs} 个`,
          emoji: "🫣",
          tone: "rose" as const,
        }
      : runningJobs > 0
      ? {
          label: "任务节奏",
          value: `运行中 ${runningJobs} 个任务`,
          emoji: "🏃",
          tone: "blue" as const,
        }
      : {
          label: "任务节奏",
          value: "今天很安静，暂无运行任务",
          emoji: "☁️",
          tone: "green" as const,
        };

  return [
    {
      label: "运行状态",
      ...runtimeStatus,
    },
    focusItem,
    taskRhythm,
  ];
};

const buildWarmNote = (selectedClient: ClientMonitoring, health: HealthInfo) => {
  const heapPercent = Number(selectedClient.monitoring.heapMemoryUsedTotalPercent || 0);
  const systemLoad = Number(selectedClient.monitoring.loadSystemPercent || 0);
  const failedJobs = Number(selectedClient.overview.failedJobs || 0);
  const majorGcCount = Number(selectedClient.monitoring.majorGcCount || 0);

  if (health.level === "critical") {
    return "现在有点忙碌，建议先看看 Heap、系统负载和最近失败任务的变化喔。";
  }

  if (heapPercent >= 75) {
    return "Heap 稍微有点高，可以顺手看看 GC 波动，别让它偷偷变重啦。";
  }

  if (systemLoad >= 80) {
    return "CPU / 系统负载有点赶，注意一下是不是最近任务更密了。";
  }

  if (failedJobs > 0) {
    return "发现了一点失败任务，建议翻一下最近事件列表，通常能很快定位到原因。";
  }

  if (majorGcCount > 3) {
    return "Major GC 次数略多，虽然还稳，但可以留意下内存回收节奏。";
  }

  return "现在状态蛮轻盈，系统呼吸感不错，今天看起来挺稳定。";
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

const LeftOverviewPanel: React.FC<LeftOverviewPanelProps> = ({
  selectedClient,
  health,
}) => {
  const summaryItems = useMemo(
    () => buildSummaryItems(selectedClient, health),
    [selectedClient, health]
  );

  const warmNote = useMemo(
    () => buildWarmNote(selectedClient, health),
    [selectedClient, health]
  );

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
    <div
      style={{
        borderRadius: 28,
        background: "rgba(255,255,255,0.82)",
        border: "1px solid #edf1f5",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.05)",
        overflow: "hidden",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          padding: "16px 18px 12px",
          borderBottom: "1px solid #edf1f5",
          background: "linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.2,
          }}
        >
          Overview
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#8b95a7",
          }}
        >
          看看它现在是不是还元气满满 ✨
        </div>
      </div>

      <div style={{ padding: 16 }}>
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
                <span>{health.level === "healthy" ? "💚" : health.level === "warning" ? "🧡" : "❤️"}</span>
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

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 10,
          }}
        >
          {summaryItems.map((item) => {
            const tone = toneMap[item.tone];

            return (
              <div
                key={item.label}
                style={{
                  borderRadius: 20,
                  padding: "14px 14px 13px",
                  background: tone.bg,
                  border: `1px solid ${tone.border}`,
                  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 12,
                      background: tone.softBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {item.emoji}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: tone.subText,
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: tone.text,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 20,
            padding: 14,
            background: "linear-gradient(180deg, #fcfdfd 0%, #f8fafc 100%)",
            border: "1px dashed #dbe5f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: "#5b6b7f",
              marginBottom: 8,
              letterSpacing: 0.2,
            }}
          >
            <span style={{ color: "#52c41a" }}>●</span>
            <span>小提醒</span>
            <span>🌷</span>
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#607086",
              lineHeight: 1.8,
            }}
          >
            {warmNote}
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          <span>{selectedClient.version}</span>
          <span>Commit · {selectedClient.commit}</span>
        </div>
      </div>
    </div>
  );
};

export default LeftOverviewPanel;