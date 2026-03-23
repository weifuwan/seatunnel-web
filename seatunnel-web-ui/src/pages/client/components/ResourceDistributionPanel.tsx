import { Card } from "antd";
import React from "react";
import { panelStyle } from "../constants";
import { ResourceUsageItem } from "../types";

type Props = {
  resourceUsageData: ResourceUsageItem[];
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value || 0));

const getStatusText = (value: number) => {
  if (value < 35) return "轻盈";
  if (value < 70) return "平稳";
  if (value < 85) return "忙碌";
  return "偏高";
};

const ResourceDistributionPanel: React.FC<Props> = ({ resourceUsageData }) => {
  return (
    <Card
      bordered={false}
      style={{
        ...panelStyle,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)",
        boxShadow: "0 18px 40px rgba(148,163,184,0.10)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <style>
        {`
          @keyframes resourceBarIn {
            from {
              width: 0%;
              opacity: 0.75;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes resourceGlow {
            0% {
              transform: translateX(-10px);
              opacity: 0.65;
            }
            50% {
              transform: translateX(10px);
              opacity: 1;
            }
            100% {
              transform: translateX(-10px);
              opacity: 0.65;
            }
          }

          @keyframes resourceFloat {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-2px);
            }
            100% {
              transform: translateY(0px);
            }
          }
        `}
      </style>

      <div
        style={{
          padding: "18px 20px 16px",
          borderBottom: "1px solid rgba(226,232,240,0.72)",
          background:
            "linear-gradient(135deg, rgba(240,244,255,0.72) 0%, rgba(248,250,252,0.92) 45%, rgba(255,247,250,0.72) 100%)",
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
                fontSize: 18,
                fontWeight: 800,
                color: "#162033",
                lineHeight: 1.2,
              }}
            >
              资源呼吸感 ✨
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#8a94a6",
              }}
            >
              看看 CPU、内存和磁盘，现在是不是忙得刚刚好
            </div>
          </div>

          <div
            style={{
              borderRadius: 999,
              padding: "7px 12px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.10)",
              color: "#6366f1",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Live Snapshot
          </div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {resourceUsageData.map((item, index) => {
          const percent = clampPercent(item.value);
          const statusText = getStatusText(percent);

          return (
            <div
              key={item.key}
              style={{
                marginBottom: index === resourceUsageData.length - 1 ? 0 : 14,
                padding: 16,
                borderRadius: 22,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)",
                border: "1px solid rgba(226,232,240,0.78)",
                boxShadow: "0 12px 30px rgba(148,163,184,0.08)",
                // animation: `resourceFloat ${3.6 + index * 0.4}s ease-in-out infinite`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: item.trackColor,
                      color: "#334155",
                      flexShrink: 0,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "#94a3b8",
                        lineHeight: 1.45,
                      }}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#111827",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {percent}%
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      padding: "3px 9px",
                      background: item.trackColor,
                      color: "#64748b",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {statusText}
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  height: 14,
                  borderRadius: 999,
                  background: item.trackColor,
                  overflow: "hidden",
                  boxShadow: "inset 0 1px 3px rgba(15,23,42,0.06)",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: item.gradient,
                    boxShadow: `0 8px 22px ${item.glowColor}`,
                    position: "relative",
                    animation: `resourceBarIn ${
                      0.72 + index * 0.12
                    }s cubic-bezier(.22,1,.36,1)`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 3,
                      width: 24,
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.38)",
                      filter: "blur(1px)",
                      animation: "resourceGlow 2.8s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  {item.totalText}
                </div>

                <div
                  style={{
                    maxWidth: "70%",
                    borderRadius: 999,
                    padding: "5px 10px",
                    background: "rgba(248,250,252,0.95)",
                    border: "1px solid rgba(226,232,240,0.85)",
                    fontSize: 12,
                    color: "#7c8aa0",
                    lineHeight: 1.5,
                  }}
                >
                  {item.tip}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 16,
          borderRadius: 20,
          padding: 16,
            margin: "0 16px",
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
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#334155",
              lineHeight: 1.75,
            }}
          >
            今天整体状态还不错 ✨ 资源有一点点起伏，但还在舒服区间里。
            记得偶尔看看内存和事件堆积，不要让系统悄悄累到啦。
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "#7c3aed",
                background: "rgba(124,58,237,0.08)",
              }}
            >
              温柔巡检中
            </span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "#0891b2",
                background: "rgba(8,145,178,0.08)",
              }}
            >
              负载还不错
            </span>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: "#f59e0b",
                background: "rgba(245,158,11,0.08)",
              }}
            >
              记得留点余量
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResourceDistributionPanel;
