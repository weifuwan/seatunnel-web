import React from "react";
import { Card, Descriptions, DescriptionsProps } from "antd";
import "../index.less"

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
      children: (
        <>
          Data disk type: MongoDB
          <br />
          Database version: 3.4
          <br />
          Package: dds.mongo.mid
          <br />
          Storage space: 10 GB
          <br />
          Replication factor: 3
          <br />
          Region: East China 1
          <br />
        </>
      ),
    },
  ];

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Descriptions bordered items={itemsSchedule} />
    </Card>
  );
};

export default ScheduleTab;