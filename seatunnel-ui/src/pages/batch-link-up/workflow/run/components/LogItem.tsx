import type { LogEntry } from "../types";

export const LogItem = ({ entry }: { entry: LogEntry }) => {
  return (
    <div
      style={{
        padding: "4px 8px",
        marginBottom: "4px",
        background:
          entry.type === "metric"
            ? "rgba(24, 144, 255, 0.1)"
            : "transparent",
        borderLeft: `3px solid ${
          entry.type === "metric" ? "#1890ff" : "#52c41a"
        }`,
        display: "flex",
        gap: "8px",
      }}
    >
      <span style={{ color: "#6a9955", minWidth: "70px" }}>
        [{entry.timestamp}]
      </span>
      <span
        style={{
          color: entry.type === "metric" ? "#4ec9b0" : "#dcdcaa",
        }}
      >
        {entry.content}
      </span>
    </div>
  );
};
