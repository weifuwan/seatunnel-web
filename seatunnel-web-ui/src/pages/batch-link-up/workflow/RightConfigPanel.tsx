import { useState } from "react";
import { getTabDefinitions } from "./configDefinition";
import styles from "./index.less";
import type { TabKey } from "./types";

interface RightConfigPanelProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  params?: any;
}

export default function RightConfigPanel({
  activeTab = "basic",
  onTabChange,
  params,
}: RightConfigPanelProps) {
  const tabDefinitions = getTabDefinitions(params);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const currentContent =
    tabDefinitions.find((item: any) => item.key === activeTab)?.content ??
    tabDefinitions[0]?.content ??
    null;

  return (
    <div className={styles.sidePanel}>
      <div className={styles.sidePanelHeader}>
        <div className={styles.sidePanelTitle}>配置面板</div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "auto",
            padding: 16,
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.55) 0%, #ffffff 100%)",
          }}
        >
          {currentContent}
        </div>

        <div
          style={{
            width: 58,
            flexShrink: 0,
            borderLeft: "1px solid #eef2f7",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            padding: "10px 6px",
            gap: 8,
          }}
        >
          {tabDefinitions.map((item: any) => {
            const active = activeTab === item.key;
            const hovered = hoveredTab === item.key;

            return (
              <div
                key={item.key}
                onClick={() => onTabChange?.(item.key)}
                onMouseEnter={() => setHoveredTab(item.key)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  textAlign: "center",
                  padding: "10px 4px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#315efb" : hovered ? "#475467" : "#667085",
                  background: active
                    ? "#eef3ff"
                    : hovered
                    ? "#f8fafc"
                    : "transparent",
                  border: active
                    ? "1px solid #d9e4ff"
                    : hovered
                    ? "1px solid #e4e7ec"
                    : "1px solid transparent",
                  boxShadow: active
                    ? "0 1px 2px rgba(16,24,40,0.06)"
                    : hovered
                    ? "0 1px 2px rgba(16,24,40,0.04)"
                    : "none",
                  transition: "all 0.2s ease",
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}