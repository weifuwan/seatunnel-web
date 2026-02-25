import React from "react";
import { SummaryData } from "./types";

interface SummaryCardsProps {
  summaryData: SummaryData;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summaryData }) => {
  const cards = [
    {
      title: "Total Syncs",
      value: summaryData.totalRecords,
      unit: "10K records",
    },
    { title: "Total Sync Volume", value: summaryData.totalBytes, unit: "MB" },
    { title: "Total Executions", value: summaryData.totalTasks, unit: "times" },
    {
      title: "Successful Executions",
      value: summaryData.successTasks,
      unit: "times",
    },
  ];

  return (
    <div
      style={{
        margin: "16px 16px 0 16px",
        padding: 12,
        background: "white",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "nowrap",
          width: "100%",
        }}
      >
        {cards.map((item, index) => (
          <div key={index} style={{ flex: "1", width: "100%" }}>
            <div className="css-1qqgizd">
              <div className="title">{item.title}</div>
              <div className="big-number">{item.value || 0}</div>
              <div>
                <div className="small-number">Unit: {item.unit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
