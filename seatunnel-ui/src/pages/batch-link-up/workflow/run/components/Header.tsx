// RunLog/components/Header.tsx

import CloseIcon from "../../icon/CloseIcon";
import type { MetricsData } from "../types";

interface HeaderProps {
  connectionStatus: string;
  latestMetrics: MetricsData | null;
  onClose: () => void;
}

export const Header = ({
  connectionStatus,
  latestMetrics,
  onClose,
}: HeaderProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <strong>运行日志</strong>

        <span
          style={{
            fontSize: "11px",
            padding: "0px 4px",
            borderRadius: "4px",
            backgroundColor:
              connectionStatus === "已连接" ? "#f6ffed" : "#fff2e8",
            color: connectionStatus === "已连接" ? "#52c41a" : "#fa8c16",
            border: `1px solid ${
              connectionStatus === "已连接" ? "#b7eb8f" : "#ffd591"
            }`,
          }}
        >
          {connectionStatus}
        </span>

        {latestMetrics && (
          <span style={{ fontSize: "12px", color: "#1890ff" }}>
            同步: {Object.values(latestMetrics.vertices)[0]?.readRowCount || 0}{" "}
            行
          </span>
        )}
      </div>

      <span
        style={{ fontSize: "16px", color: "#999", cursor: "pointer" }}
        onClick={onClose}
      >
        <CloseIcon />
      </span>
    </div>
  );
};
