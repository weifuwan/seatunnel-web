import { history, useParams } from "@umijs/max";
import { Empty } from "antd";
import { useEffect, useState } from "react";

import {
  BasicConfig,
  ScheduleConfig,
} from "../../workflow/components/ScheduleConfigContent/types";
import CustomWorkflow from "./CustomWorkflow";

const defaultScheduleConfig: ScheduleConfig = {
  paramsList: [],
  instanceGenerateMode: "nextDay",
  scheduleRunType: "normal",
  timeoutMode: "system",
  timeoutValue: 1,
  timeoutUnit: "hour",
  rerunPolicy: "success_or_fail",
  autoRetry: true,
  retryTimes: 1,
  retryInterval: 1,
  scheduleType: "day",
  hourMode: "range",
  hourlyRangeValue: {
    startTime: "00:00",
    intervalHour: 1,
    endTime: "23:59",
  },
  hourlyAppointValue: {
    hours: [0],
    minute: "00",
  },
  dailyValue: {
    time: "00:17",
  },
  weeklyValue: {
    weekdays: ["MON"],
    time: "00:17",
  },
  effectType: "forever",
  cronExpression: "0 17 0 * * ?",
};

const defaultBasicConfig: BasicConfig & {
  sourcePluginName?: string;
  targetPluginName?: string;
} = {
  jobName: "",
  description: "",
  clientId: "",
  mode: "SCRIPT",
  sourceType: "SOURCE",
  targetType: "SINK",
  sourceDataSourceId: "",
  targetDataSourceId: "",
  sourcePluginName: "",
  targetPluginName: "",
};

const buildInitialScheduleConfig = (rawData?: any): ScheduleConfig => {
  return {
    ...defaultScheduleConfig,
    ...(rawData?.scheduleConfig || {}),
    hourlyRangeValue: {
      ...defaultScheduleConfig.hourlyRangeValue,
      ...(rawData?.scheduleConfig?.hourlyRangeValue || {}),
    },
    hourlyAppointValue: {
      ...defaultScheduleConfig.hourlyAppointValue,
      ...(rawData?.scheduleConfig?.hourlyAppointValue || {}),
    },
    dailyValue: {
      ...defaultScheduleConfig.dailyValue,
      ...(rawData?.scheduleConfig?.dailyValue || {}),
    },
    weeklyValue: {
      ...defaultScheduleConfig.weeklyValue,
      ...(rawData?.scheduleConfig?.weeklyValue || {}),
    },
  };
};

const buildInitialBasicConfig = (rawData?: any) => {
  return {
    ...defaultBasicConfig,
    jobName: rawData?.jobName || "",
    description: rawData?.description || "",
    clientId: rawData?.clientId || "",
    mode: rawData?.mode || "SCRIPT",
    sourceType: rawData?.sourceType?.dbType || "SOURCE",
    targetType: rawData?.targetType?.dbType || "SINK",
    sourcePluginName: rawData?.sourceType?.pluginName || "",
    targetPluginName: rawData?.targetType?.pluginName || "",
    sourceDataSourceId: rawData?.sourceDataSourceId || rawData?.sourceId || "",
    targetDataSourceId: rawData?.targetDataSourceId || rawData?.targetId || "",
  };
};

export default function CustomConfigPage() {
  const { id } = useParams<{ id: string }>();

  const [params, setParams] = useState<any>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(
    defaultScheduleConfig
  );
  const [basicConfig, setBasicConfig] =
    useState<BasicConfig>(defaultBasicConfig);

  useEffect(() => {
    if (!id) return;

    const cache = sessionStorage.getItem(`batch-link-up-detail-${id}`);
    if (!cache) return;

    const data = JSON.parse(cache);
    setParams(data);
    setBasicConfig(buildInitialBasicConfig(data));
    setScheduleConfig(buildInitialScheduleConfig(data));
  }, [id]);

  const goBack = () => {
    history.push(`/sync/batch-link-up/${id}/detail`);
  };

  if (!params) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Empty description="未找到配置数据，请先完成上一步配置" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <CustomWorkflow
        params={params}
        goBack={goBack}
        basicConfig={basicConfig}
        setBasicConfig={setBasicConfig}
        scheduleConfig={scheduleConfig}
        setScheduleConfig={setScheduleConfig}
      />
    </div>
  );
}