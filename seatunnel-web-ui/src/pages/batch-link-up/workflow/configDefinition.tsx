import BasicConfigContent from "./BasicConfigContent";
import ScheduleConfigContent from "./ScheduleConfigContent";
import MappingConfigContent from "./MappingConfigContent";
import AdvancedConfigContent from "./AdvancedConfigContent";
import type { TabDefinition } from "./types";

export const getTabDefinitions = (params?: any): TabDefinition[] => [
  {
    key: "basic",
    label: "基础",
    content: <BasicConfigContent params={params} />,
  },
  {
    key: "schedule",
    label: "调度",
    content: <ScheduleConfigContent />,
  },
  // {
  //   key: "mapping",
  //   label: "映射",
  //   content: <MappingConfigContent />,
  // },
  // {
  //   key: "advanced",
  //   label: "高级",
  //   content: <AdvancedConfigContent />,
  // },
];