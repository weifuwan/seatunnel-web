import { Tag } from "antd";
import type { ClientItem } from "./types";

export const STEP_THEME = {
  base: {
    pill: "bg-[#F5F9FF] text-[#175CD3]",
    pillInactive: "bg-[#F9FAFB] text-[#667085]",
    dot: "bg-[#1570EF] text-white",
    dotInactive: "bg-[#D0D5DD] text-white",
  },
  client: {
    pill: "bg-[#F5F9FF] text-[#175CD3]",
    pillInactive: "bg-[#F9FAFB] text-[#667085]",
    dot: "bg-[#1570EF] text-white",
    dotInactive: "bg-[#D0D5DD] text-white",
  },
} as const;

export const mockSourceClients: ClientItem[] = [
  { id: "s1", name: "InfluxDB-Client-01", type: "InfluxDB", status: "online" },
  { id: "s2", name: "InfluxDB-Client-02", type: "InfluxDB", status: "untested" },
];

export const mockBridgeClients: ClientItem[] = [
  { id: "b1", name: "Client-Bridge-A", type: "执行客户端", status: "online" },
  { id: "b2", name: "Client-Bridge-B", type: "执行客户端", status: "online" },
  { id: "b3", name: "Client-Bridge-C", type: "执行客户端", status: "untested" },
];

export const mockTargetClients: ClientItem[] = [
  { id: "t1", name: "ClickHouse-Client-01", type: "ClickHouse", status: "online" },
  { id: "t2", name: "ClickHouse-Client-02", type: "ClickHouse", status: "untested" },
];

export const getStatusTag = (status?: ClientItem["status"]) => {
  switch (status) {
    case "online":
      return <Tag color="success">已连通</Tag>;
    case "offline":
      return <Tag color="error">不可用</Tag>;
    default:
      return <Tag>未测试</Tag>;
  }
};

export const getDbLabel = (item: any) => {
  if (!item) return "-";
  return item?.dbType || item?.pluginName || item?.connectorType || "-";
};