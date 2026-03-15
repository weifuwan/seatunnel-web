import React, { useState, useEffect } from "react";
import { message, Tabs } from "antd";
import { useIntl } from "@umijs/max";
import TaskHeader from "./TaskHeader";
import BasicInfoSection from "./BasicInfoSection";
import LogTab from "./tabs/LogTab";
import HoconTab from "./tabs/HoconTab";
import MetricsTab from "./tabs/MetricsTab";
import ScheduleTab from "./tabs/ScheduleTab";
import TableTab from "./tabs/TableTab";
import { seatunnelJobInstanceApi } from "./api";
import "./index.less";

interface TaskDetailPanelProps {
  instanceItem: any;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ instanceItem }) => {
  const intl = useIntl();

  const [logContent, setLogContent] = useState<any>("");
  const [logLoading, setLogLoading] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>("log");

  const fetchLog = async () => {
    try {
      setLogLoading(true);
      const res = await seatunnelJobInstanceApi.getLog(instanceItem?.id);
      setLogContent(
        res?.data ||
          intl.formatMessage({
            id: "pages.job.detail.noLog",
            defaultMessage: "No log available",
          })
      );
    } catch (err) {
      message.error(
        intl.formatMessage({
          id: "pages.job.detail.loadLogFailed",
          defaultMessage: "Failed to load log",
        })
      );

      setLogContent(
        intl.formatMessage({
          id: "pages.job.detail.loadLogFailed",
          defaultMessage: "Failed to load log",
        })
      );
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    if (instanceItem?.id) {
      fetchLog();
    }
  }, [instanceItem?.id]);

  if (!instanceItem?.jobStatus) {
    return (
      <div className="task-detail-empty">
        {intl.formatMessage({
          id: "pages.job.detail.empty",
          defaultMessage: "Please select a run record on the left to view details",
        })}{" "}
        😊
      </div>
    );
  }

  console.log(instanceItem);
  console.log(instanceItem.runtimeConfig);

  const tabs = [
    {
      key: "log",
      label: intl.formatMessage({
        id: "pages.job.detail.tabs.log",
        defaultMessage: "Log",
      }),
      children: <LogTab content={logContent} loading={logLoading} />,
    },
    {
      key: "hocon",
      label: intl.formatMessage({
        id: "pages.job.detail.tabs.hocon",
        defaultMessage: "Hocon",
      }),
      children: <HoconTab config={instanceItem.runtimeConfig} />,
    },
    {
      key: "metrics",
      label: intl.formatMessage({
        id: "pages.job.detail.tabs.metrics",
        defaultMessage: "Metrics",
      }),
      children: <MetricsTab instanceItem={instanceItem} />,
    },
    {
      key: "schedule",
      label: intl.formatMessage({
        id: "pages.job.detail.tabs.schedule",
        defaultMessage: "Scheduled",
      }),
      children: <ScheduleTab instanceItem={instanceItem} />,
    },
    {
      key: "table",
      label: intl.formatMessage({
        id: "pages.job.detail.tabs.table",
        defaultMessage: "Table",
      }),
      children: <TableTab instanceItem={instanceItem} />,
    },
  ];

  return (
    <div>
      <TaskHeader item={instanceItem} />

      <div className="task-detail-content">
        <BasicInfoSection item={instanceItem} />

        <div className="task-detail-tabs">
          <Tabs
            activeKey={activeKey}
            items={tabs}
            onChange={(key) => setActiveKey(key)}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;