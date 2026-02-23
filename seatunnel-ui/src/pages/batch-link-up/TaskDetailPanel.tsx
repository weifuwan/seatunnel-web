import React, { useState, useEffect } from "react";
import { message, Tabs } from "antd";
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
  const [logContent, setLogContent] = useState<any>("");
  const [logLoading, setLogLoading] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>("log");

  const fetchLog = async () => {
    try {
      setLogLoading(true);
      const res = await seatunnelJobInstanceApi.getLog(instanceItem?.id);
      setLogContent(res?.data || "No log available");
    } catch (err) {
      message.error("Failed to load log");
      setLogContent("Failed to load log");
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
        Please select a run record on the left to view details 😊
      </div>
    );
  }

  const tabs = [
    {
      key: "log",
      label: "Log",
      children: <LogTab content={logContent} loading={logLoading} />,
    },
    {
      key: "hocon",
      label: "Hocon",
      children: <HoconTab config={instanceItem.jobConfig} />,
    },
    {
      key: "metrics",
      label: "Metrics",
      children: <MetricsTab instanceItem={instanceItem} />,
    },
    {
      key: "schedule",
      label: "Scheduled",
      children: <ScheduleTab instanceItem={instanceItem} />,
    },
    {
      key: "table",
      label: "Table",
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