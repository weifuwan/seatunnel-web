import { history, useParams } from "@umijs/max";
import { Empty } from "antd";
import { useEffect, useState } from "react";
import Workflow from "../../workflow";
import { ScheduleConfig } from "../../workflow/components/ScheduleConfigContent/types";

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

export default function SingleConfigPage() {
  const { id } = useParams<{ id: string }>();

  const [params, setParams] = useState<any>(null);
  const [sourceType, setSourceType] = useState<any>(null);
  const [targetType, setTargetType] = useState<any>(null);
  const [scheduleConfig, setScheduleConfig] =
    useState<ScheduleConfig>(defaultScheduleConfig);

  useEffect(() => {
    if (!id) return;

    const cache = sessionStorage.getItem(`batch-link-up-detail-${id}`);
    if (!cache) return;

    const data = JSON.parse(cache);
    setParams(data);
    setSourceType(data?.sourceType || null);
    setTargetType(data?.targetType || null);
    console.log(buildInitialScheduleConfig(data));
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
      <Workflow
        params={params}
        goBack={goBack}
        sourceType={sourceType}
        setSourceType={setSourceType}
        targetType={targetType}
        setTargetType={setTargetType}
        setParams={setParams}
        scheduleConfig={scheduleConfig}
        setScheduleConfig={setScheduleConfig}
      />
    </div>
  );
}