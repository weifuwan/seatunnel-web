import BasicConfigContent from "./BasicConfigContent";
import MappingConfigContent from "./MappingConfigContent";
import AdvancedConfigContent from "./AdvancedConfigContent";
import type { TabDefinition } from "./types";
import ScheduleConfigContent from "./components/ScheduleConfigContent";
import { BasicConfig } from "./components/ScheduleConfigContent/types";

export const getTabDefinitions = (
  params?: any,
  basicConfig?: BasicConfig,
  setBasicConfig?: React.Dispatch<React.SetStateAction<BasicConfig>>,
  scheduleConfig?: any,
  setScheduleConfig?: React.Dispatch<React.SetStateAction<any>>
): TabDefinition[] => [
  {
    key: "basic",
    label: "基础",
    content: (
      <BasicConfigContent
        value={basicConfig}
        onChange={setBasicConfig}
      />
    ),
  },
  {
    key: "schedule",
    label: "调度",
    content: (
      <ScheduleConfigContent
        value={scheduleConfig}
        onChange={setScheduleConfig}
      />
    ),
  },
  {
    key: "mapping",
    label: "映射",
    content: <MappingConfigContent />,
  },
  {
    key: "advanced",
    label: "高级",
    content: <AdvancedConfigContent />,
  },
];