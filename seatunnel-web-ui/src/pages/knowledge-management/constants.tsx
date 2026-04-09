import { AppstoreAddOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { MenuItemConfig, MenuKey, ParamItem } from "./types";

export const PAGE_BG = "#ffffff";
export const CARD_BG = "#ffffff";
export const BORDER_COLOR = "#e7eaf3";
export const TEXT_SECONDARY = "#667085";
export const BLUE = "#4b5fd1";
export const BLUE_LIGHT = "#eef2ff";

export const menuList: MenuItemConfig[] = [
  {
    key: "connector",
    label: "连接器参数",
    desc: "维护参数名称、类型与使用规则",
    icon: <AppstoreAddOutlined />,
  },
  {
    key: "time",
    label: "时间变量",
    desc: "维护时间变量与替换表达式规则",
    icon: <ClockCircleOutlined />,
  },
];

export const pageTitleMap: Record<MenuKey, string> = {
  connector: "Connector 参数知识",
  time: "时间变量知识",
};

export const infoTextMap: Record<MenuKey, string> = {
  connector:
    "例如：Jdbc / parallelism / 任务并行度 / number / 非必填 / 默认值 1",
  time: "例如：start_time / 开始时间 / yyyy-MM-dd HH:mm:ss / 默认值 ${now-1d}",
};

export const connectorTypeOptions = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
  { label: "boolean", value: "boolean" },
  { label: "array", value: "array" },
  { label: "object", value: "object" },
];

export const timeFormatOptions = [
  { label: "yyyy-MM-dd", value: "yyyy-MM-dd" },
  { label: "yyyy-MM-dd HH:mm:ss", value: "yyyy-MM-dd HH:mm:ss" },
  { label: "timestamp", value: "timestamp" },
  { label: "cron", value: "cron" },
  { label: "dynamic-expression", value: "dynamic-expression" },
];

export const connectorNameOptions = [
  { label: "Jdbc", value: "Jdbc" },
  { label: "MySQL-CDC", value: "MySQL-CDC" },
  { label: "ClickHouse", value: "ClickHouse" },
  { label: "Hive", value: "Hive" },
  { label: "Doris", value: "Doris" },
  { label: "Kafka", value: "Kafka" },
];

export const initialData: Record<MenuKey, ParamItem[]> = {
  connector: [
    {
      id: 1,
      type: "connector",
      connectorName: "Jdbc",
      paramName: "parallelism",
      paramDesc: "任务并行度，用于控制当前作业执行时的并发数量",
      paramType: "number",
      required: false,
      defaultValue: "1",
      exampleValue: "2",
    },
    {
      id: 2,
      type: "connector",
      connectorName: "Jdbc",
      paramName: "query",
      paramDesc: "自定义查询 SQL，用于抽取源端数据",
      paramType: "string",
      required: true,
      defaultValue: "",
      exampleValue:
        "select * from user_info where update_time >= '${start_time}'",
    },
    {
      id: 3,
      type: "connector",
      connectorName: "ClickHouse",
      paramName: "table",
      paramDesc: "目标表名称",
      paramType: "string",
      required: true,
      defaultValue: "",
      exampleValue: "ods_user_info",
    },
  ],
  time: [
    {
      id: 101,
      type: "time",
      paramName: "start_time",
      paramDesc: "任务开始时间，通常用于增量抽取范围下界",
      timeFormat: "yyyy-MM-dd HH:mm:ss",
      defaultValue: "${now-1d}",
      exampleValue: "2026-03-10 00:00:00",
      expression: "当前时间减 1 天",
    },
    {
      id: 102,
      type: "time",
      paramName: "end_time",
      paramDesc: "任务结束时间，通常用于增量抽取范围上界",
      timeFormat: "yyyy-MM-dd HH:mm:ss",
      defaultValue: "${now}",
      exampleValue: "2026-03-11 00:00:00",
      expression: "当前时间",
    },
    {
      id: 103,
      type: "time",
      paramName: "biz_date",
      paramDesc: "业务日期参数，常用于按天分区同步",
      timeFormat: "yyyy-MM-dd",
      defaultValue: "${today}",
      exampleValue: "2026-03-10",
      expression: "当天日期",
    },
  ],
};
