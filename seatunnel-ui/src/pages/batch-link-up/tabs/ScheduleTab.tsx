import { Card, Descriptions, DescriptionsProps } from "antd";
import React from "react";
import "../index.less";

interface ScheduleTabProps {
  instanceItem: any;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ instanceItem }) => {
  const itemsSchedule: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Schedule Status",
      children: instanceItem?.scheduleStatus || "-",
    },
    {
      key: "2",
      label: "Next Schedule Time",
      children: instanceItem?.nextScheduleTime || "-",
    },
    {
      key: "3",
      label: "Last Schedule Time",
      children: instanceItem?.lastScheduleTime || "-",
      span: 2,
    },
    {
      key: "4",
      label: "Cron Expression",
      children: instanceItem?.cronExpression || "-",
      span: 3,
    },
    {
      key: "10",
      label: "Schedule Info",
      children: <></>,
    },
  ];

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Descriptions bordered items={itemsSchedule} />
    </Card>
  );
};

export default ScheduleTab;
