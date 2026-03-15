export const Footer = ({
  total,
  metricCount,
}: {
  total: number;
  metricCount: number;
}) => (
  <div
    style={{
      fontSize: "11px",
      color: "#999",
      marginTop: "4px",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <span>总日志数: {total}</span>
    <span>去重后指标数: {metricCount} 个实例</span>
  </div>
);
