import { Card } from "antd";
import React from "react";
import { panelStyle } from "../constants";
import { ClientMonitoring, HealthInfo } from "../types";

type Props = {
  selectedClient: ClientMonitoring;
  health: HealthInfo;
};

const formatPercent = (value: number) => `${Math.round(value)}%`;

const clampPercent = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

const parseMemoryToGB = (text: string) => {
  const value = Number(String(text).replace(/[^\d.]/g, ""));
  if (Number.isNaN(value)) return text;

  // 这里假设后端如果传的是 MB / MiB 这类值，统一转一下展示
  // 若你后端本身已经是 GB 字符串，可直接返回原文
  if (/gb/i.test(text)) return `${value.toFixed(1)} GB`;
  if (/mb|mib/i.test(text)) return `${(value / 1024).toFixed(1)} GB`;

  return text;
};

const buildProgressWidth = (value: number) => `${clampPercent(value)}%`;

const getMemoryComment = (health: HealthInfo, heapUsedPercent: number) => {
  if (health.level === "critical" || heapUsedPercent >= 85) {
    return "内存压力有点明显了哟，Heap 这一块已经比较靠近警戒线啦。";
  }

  if (health.level === "warning" || heapUsedPercent >= 70) {
    return "今天稍微有点忙，但整体还顶得住，记得继续观察内存波动。";
  }

  return "现在状态蛮轻盈，内存呼吸感不错，哈哈哈哈哈。";
};

const StatPill: React.FC<{
  label: string;
  value: React.ReactNode;
  softColor?: string;
}> = ({ label, value, softColor = "rgba(99,102,241,0.10)" }) => {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 18,
        padding: "12px 14px",
        background: softColor,
        border: "1px solid rgba(255,255,255,0.55)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#7b8794",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#162033",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
};

const MemoryCard: React.FC<{
  title: string;
  subtitle: string;
  usedLabel: string;
  totalLabel: string;
  percent: number;
  accent: string;
  glow: string;
}> = ({ title, subtitle, usedLabel, totalLabel, percent, accent, glow }) => {
  const safePercent = clampPercent(percent);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 24,
        padding: 18,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.92) 100%)",
        border: "1px solid rgba(226,232,240,0.85)",
        boxShadow: "0 12px 30px rgba(148,163,184,0.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -24,
          right: -18,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: glow,
          filter: "blur(10px)",
          opacity: 0.9,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#162033",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#8a94a6",
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 94,
              height: 94,
              borderRadius: "50%",
              position: "relative",
              flexShrink: 0,
              background: `conic-gradient(${accent} 0% ${safePercent}%, rgba(226,232,240,0.7) ${safePercent}% 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.65)",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                boxShadow: "0 6px 18px rgba(148,163,184,0.12)",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#162033",
                  lineHeight: 1,
                }}
              >
                {Math.round(safePercent)}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                %
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                marginBottom: 10,
              }}
            >
              <span style={{ color: "#64748b" }}>Used</span>
              <span style={{ color: "#162033", fontWeight: 700 }}>
                {usedLabel}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#64748b" }}>Total</span>
              <span style={{ color: "#162033", fontWeight: 700 }}>
                {totalLabel}
              </span>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(226,232,240,0.75)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: buildProgressWidth(safePercent),
                  height: "100%",
                  borderRadius: 999,
                  background: accent,
                  boxShadow: `0 0 18px ${accent}`,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickGlancePanel: React.FC<Props> = ({ selectedClient, health }) => {
  const monitoring = selectedClient.monitoring;

  const physicalFreeMB = monitoring.physicalMemoryFreeMB || 0;
  const physicalTotalText = parseMemoryToGB(monitoring.physicalMemoryTotal);
  const physicalFreeText = parseMemoryToGB(monitoring.physicalMemoryFree);

  const physicalUsedPercent =
    monitoring.physicalMemoryFreeMB > 0
      ? 100 -
        (monitoring.physicalMemoryFreeMB /
          (monitoring.physicalMemoryFreeMB /
            Math.max(1 - monitoring.loadSystemPercent / 100, 0.01))) *
          100
      : 100 - clampPercent((physicalFreeMB / Math.max(physicalFreeMB, 1)) * 100);

  // 更稳妥一点：物理内存使用率如果当前结构不好准确反推，就优先用一个温和估算
  const safePhysicalPercent =
    physicalFreeMB > 0 && /mb|mib/i.test(monitoring.physicalMemoryTotal)
      ? clampPercent(
          100 -
            (physicalFreeMB /
              Number(
                String(monitoring.physicalMemoryTotal).replace(/[^\d.]/g, ""),
              )) *
              100,
        )
      : clampPercent(100 - (monitoring.loadSystemPercent || 0) * 0.35);

  const heapUsedPercent = clampPercent(monitoring.heapMemoryUsedMaxPercent);

  return (
    <Card
      bordered={false}
      style={{
        ...panelStyle,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(246,249,252,0.98) 100%)",
        boxShadow: "0 20px 48px rgba(148,163,184,0.14)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(226,232,240,0.72)",
          background:
            "linear-gradient(135deg, rgba(240,244,255,0.72) 0%, rgba(248,250,252,0.92) 42%, rgba(255,244,248,0.68) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#162033",
                lineHeight: 1.2,
              }}
            >
              内存小宇宙 ✨
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#8a94a6",
              }}
            >
              这一块专门看看物理内存和 Heap 内存，轻轻扫一眼就知道状态啦
            </div>
          </div>

          <div
            style={{
              borderRadius: 999,
              padding: "8px 14px",
              background:
                health.level === "critical"
                  ? "rgba(255,77,79,0.12)"
                  : health.level === "warning"
                  ? "rgba(250,173,20,0.14)"
                  : "rgba(82,196,26,0.12)",
              color:
                health.level === "critical"
                  ? "#cf1322"
                  : health.level === "warning"
                  ? "#d48806"
                  : "#389e0d",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Memory Score · {health.score}
          </div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            borderRadius: 26,
            padding: 18,
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(96,165,250,0.12) 48%, rgba(255,255,255,0.82) 100%)",
            border: "1px solid rgba(226,232,240,0.85)",
            boxShadow: "0 14px 36px rgba(148,163,184,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#7c8aa0",
            }}
          >
            当前 Client
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 800,
              color: "#162033",
              lineHeight: 1.25,
            }}
          >
            {selectedClient.name}
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <StatPill
              label="物理内存空闲"
              value={physicalFreeText}
              softColor="rgba(96,165,250,0.12)"
            />
            <StatPill
              label="Heap 使用率"
              value={formatPercent(heapUsedPercent)}
              softColor="rgba(167,139,250,0.12)"
            />
            <StatPill
              label="系统负载"
              value={formatPercent(monitoring.loadSystemPercent)}
              softColor="rgba(244,114,182,0.12)"
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <MemoryCard
            title="Physical Memory"
            subtitle="系统物理内存状态"
            usedLabel={formatPercent(safePhysicalPercent)}
            totalLabel={physicalTotalText}
            percent={safePhysicalPercent}
            accent="linear-gradient(90deg, #60a5fa 0%, #818cf8 100%)"
            glow="radial-gradient(circle, rgba(96,165,250,0.28) 0%, rgba(129,140,248,0.12) 45%, rgba(255,255,255,0) 70%)"
          />

          <MemoryCard
            title="Heap Memory"
            subtitle="JVM Heap 使用情况"
            usedLabel={monitoring.heapMemoryUsed}
            totalLabel={monitoring.heapMemoryMax || monitoring.heapMemoryTotal}
            percent={heapUsedPercent}
            accent="linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)"
            glow="radial-gradient(circle, rgba(244,114,182,0.24) 0%, rgba(167,139,250,0.14) 45%, rgba(255,255,255,0) 70%)"
          />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "Swap Free",
              value: monitoring.swapSpaceFree,
            },
            {
              label: "Minor GC",
              value: `${monitoring.minorGcCount} 次`,
            },
            {
              label: "Major GC",
              value: `${monitoring.majorGcCount} 次`,
            },
            {
              label: "Threads",
              value: monitoring.threadCount,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: 18,
                padding: "14px 14px 12px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.9) 100%)",
                border: "1px solid rgba(226,232,240,0.75)",
                boxShadow: "0 10px 24px rgba(148,163,184,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#8a94a6",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#162033",
                  lineHeight: 1.2,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 20,
            padding: 16,
            background:
              health.level === "critical"
                ? "linear-gradient(135deg, rgba(255,77,79,0.12) 0%, rgba(255,244,244,0.96) 100%)"
                : health.level === "warning"
                ? "linear-gradient(135deg, rgba(250,173,20,0.12) 0%, rgba(255,249,235,0.96) 100%)"
                : "linear-gradient(135deg, rgba(82,196,26,0.10) 0%, rgba(245,255,240,0.96) 100%)",
            border: "1px solid rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "0.04em",
            }}
          >
            小提醒 🌷
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#334155",
              lineHeight: 1.75,
            }}
          >
            {getMemoryComment(health, heapUsedPercent)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuickGlancePanel;