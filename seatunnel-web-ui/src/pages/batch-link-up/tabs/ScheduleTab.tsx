import { Card, Descriptions, DescriptionsProps } from "antd";
import React from "react";
import { useIntl } from "@umijs/max";
import "../index.less";

interface ScheduleTabProps {
  instanceItem: any;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ instanceItem }) => {
  const intl = useIntl();

  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  const itemsSchedule: DescriptionsProps["items"] = [
    {
      key: "1",
      label: t("pages.job.detail.schedule.status", "Schedule Status"),
      children: instanceItem?.scheduleStatus || "-",
    },
    {
      key: "2",
      label: t("pages.job.detail.schedule.nextTime", "Next Schedule Time"),
      children: instanceItem?.nextScheduleTime || "-",
    },
    {
      key: "3",
      label: t("pages.job.detail.schedule.lastTime", "Last Schedule Time"),
      children: instanceItem?.lastScheduleTime || "-",
      span: 2,
    },
    {
      key: "4",
      label: t("pages.job.detail.schedule.cron", "Cron Expression"),
      children: instanceItem?.cronExpression || "-",
      span: 3,
    },
    {
      key: "10",
      label: t("pages.job.detail.schedule.info", "Schedule Info"),
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