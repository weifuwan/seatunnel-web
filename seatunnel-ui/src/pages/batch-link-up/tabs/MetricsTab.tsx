import React from "react";
import { Card } from "antd";
import MetricCard from "../components/MetricCard";
import "../index.less"

interface MetricsTabProps {
  instanceItem: any;
}

const MetricsTab: React.FC<MetricsTabProps> = ({ instanceItem }) => {
  const cards = [
    { title: "Read Rows", value: instanceItem.readRowCount ?? 0, unit: "record" },
    { title: "Write Rows", value: instanceItem.writeRowCount ?? 0, unit: "record" },
    { title: "Read QPS", value: instanceItem.readQps ?? 0, unit: "record/seconds" },
    { title: "Write QPS", value: instanceItem.writeQps ?? 0, unit: "record/seconds" },
  ];

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <div className="metrics-container">
        <div className="metrics-grid">
          {cards.map((item, index) => (
            <MetricCard key={index} {...item} />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MetricsTab;