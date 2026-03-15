import type { MetricsData } from "../types";

export const MetricsSummary = ({ data }: { data: MetricsData }) => {
  const metricsMap = data?.metrics || {};
  const entries = Object.entries(metricsMap); // ✅ 永远是对象，不会报错

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

      {entries.map(([key, v]) => {
        // ✅ status 可能不存在：给一个默认值
        const status = (v as any)?.status ?? "RUNNING";

        return (
          <span
            key={key}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <strong>{key}:</strong>
            <span>读 {v.readRowCount ?? 0}</span>
            <span>写 {v.writeRowCount ?? 0}</span>
            <span>(QPS: {v.readQps ?? 0}/{v.writeQps ?? 0})</span>
            <span
              style={{
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "10px",
                backgroundColor:
                  status === "RUNNING" ? "#f6ffed" : "#fff1f0",
                color: status === "RUNNING" ? "#52c41a" : "#ff4d4f",
              }}
            >
              {status}
            </span>
          </span>
        );
      })}
    </div>
  );
};