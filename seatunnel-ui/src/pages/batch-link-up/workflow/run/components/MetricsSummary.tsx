import type { MetricsData } from "../types";

export const MetricsSummary = ({ data }: { data: MetricsData }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        marginBottom: "8px",
        padding: "8px",
        background: "#f0f5ff",
        borderRadius: "4px",
        fontSize: "12px",
        flexWrap: "wrap",
      }}
    >
      <span>实例ID: {data.instanceId}</span>
      <span>引擎ID: {data.engineId}</span>

      {Object.entries(data.vertices).map(([key, v]) => (
        <span
          key={key}
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <strong>{key}:</strong>
          <span>读 {v.readRowCount}</span>
          <span>写 {v.writeRowCount}</span>
          <span>(QPS: {v.readQps}/{v.writeQps})</span>
          <span
            style={{
              padding: "1px 6px",
              borderRadius: "10px",
              fontSize: "10px",
              backgroundColor:
                v.status === "RUNNING" ? "#f6ffed" : "#fff1f0",
              color: v.status === "RUNNING" ? "#52c41a" : "#ff4d4f",
            }}
          >
            {v.status}
          </span>
        </span>
      ))}
    </div>
  );
};
