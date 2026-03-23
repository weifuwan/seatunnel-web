import { Card } from "antd";
import React from "react";
import { panelStyle } from "../constants";
import { RecentEventItem } from "../types";

type Props = {
  recentEvents: RecentEventItem[];
};

const RecentEventsPanel: React.FC<Props> = ({ recentEvents }) => {
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
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#162033",
          }}
        >
          Recent Events
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#8a94a6",
          }}
        >
          写死几条也能把页面撑得很完整
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {recentEvents.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                index === recentEvents.length - 1
                  ? "none"
                  : "1px dashed #edf2f7",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: item.color,
                marginTop: 6,
                flexShrink: 0,
                boxShadow: `0 0 0 6px ${item.shadow}`,
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#162033",
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                {item.desc}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentEventsPanel;