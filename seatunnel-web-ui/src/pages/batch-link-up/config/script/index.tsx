import { history, useLocation, useParams } from "@umijs/max";
import { Empty, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { seatunnelJobDefinitionApi } from "../../api";
import {
  BasicConfig,
  ScheduleConfig,
} from "../../workflow/components/ScheduleConfigContent/types";
import CustomWorkflow from "./CustomWorkflow";

type CustomBasicConfig = BasicConfig & {
  sourcePluginName?: string;
  targetPluginName?: string;
};

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

const defaultBasicConfig: CustomBasicConfig = {
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

const buildInitialScheduleConfigForCreate = (
  rawData?: any
): ScheduleConfig => {
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

const buildInitialBasicConfigForCreate = (
  rawData?: any
): CustomBasicConfig => {
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

const buildInitialScheduleConfigForEdit = (
  editData?: any
): ScheduleConfig => {
  const schedule = editData?.schedule || {};

  return {
    ...defaultScheduleConfig,
    ...schedule,
    hourlyRangeValue: {
      ...defaultScheduleConfig.hourlyRangeValue,
      ...(schedule?.hourlyRangeValue || {}),
    },
    hourlyAppointValue: {
      ...defaultScheduleConfig.hourlyAppointValue,
      ...(schedule?.hourlyAppointValue || {}),
    },
    dailyValue: {
      ...defaultScheduleConfig.dailyValue,
      ...(schedule?.dailyValue || {}),
    },
    weeklyValue: {
      ...defaultScheduleConfig.weeklyValue,
      ...(schedule?.weeklyValue || {}),
    },
  };
};

const buildInitialBasicConfigForEdit = (
  editData?: any
): CustomBasicConfig => {
  const basic = editData?.basic || {};
  const workflow = editData?.workflow || {};
  const content = editData?.content || {};

  return {
    ...defaultBasicConfig,
    jobName: basic?.jobName || "",
    description: basic?.jobDesc || basic?.description || "",
    clientId: basic?.clientId ? String(basic.clientId) : "",
    mode: basic?.mode || editData?.mode || "SCRIPT",
    sourceType: workflow?.sourceType?.dbType || "SOURCE",
    targetType: workflow?.targetType?.dbType || "SINK",
    sourcePluginName: workflow?.sourceType?.pluginName || "",
    targetPluginName: workflow?.targetType?.pluginName || "",
    sourceDataSourceId:
      workflow?.sourceDataSourceId || workflow?.sourceId || "",
    targetDataSourceId:
      workflow?.targetDataSourceId || workflow?.targetId || "",
  };
};

const buildPageParamsForEdit = (editData?: any) => {
  const basic = editData?.basic || {};
  const workflow = editData?.workflow || {};
  const schedule = editData?.schedule || {};
  const content = editData?.content || {};

  return {
    id: editData?.id,
    mode: editData?.mode || basic?.mode || "SCRIPT",
    jobName: basic?.jobName || "",
    description: basic?.jobDesc || basic?.description || "",
    clientId: basic?.clientId || "",
    sourceType: workflow?.sourceType || null,
    targetType: workflow?.targetType || null,
    sourceDataSourceId:
      workflow?.sourceDataSourceId || workflow?.sourceId || "",
    targetDataSourceId:
      workflow?.targetDataSourceId || workflow?.targetId || "",
    scheduleConfig: schedule,
    workflow,
    basic,
    content,
    hoconContent:
      workflow?.hoconContent ||
      content?.hoconContent ||
      editData?.hoconContent ||
      "",
  };
};

export default function CustomConfigPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [params, setParams] = useState<any>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(
    defaultScheduleConfig
  );
  const [basicConfig, setBasicConfig] =
    useState<CustomBasicConfig>(defaultBasicConfig);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const searchParams = new URLSearchParams(location.search);
    const scene = searchParams.get("scene");
    const cacheKey = `batch-link-up-detail-${id}`;

    const initCreate = () => {
      const cache = sessionStorage.getItem(cacheKey);
      if (!cache) {
        setParams(null);
        return;
      }

      try {
        const data = JSON.parse(cache);
        setParams(data);
        setBasicConfig(buildInitialBasicConfigForCreate(data));
        setScheduleConfig(buildInitialScheduleConfigForCreate(data));
      } catch (error) {
        console.error("解析缓存失败:", error);
        message.error("读取缓存配置失败");
        setParams(null);
      }
    };

    const initEdit = async () => {
      try {
        setLoading(true);

        const res = await seatunnelJobDefinitionApi.selectEditDetail(id);
        if (res?.code !== 0 || !res?.data) {
          message.error(res?.message || res?.msg || "获取编辑详情失败");
          setParams(null);
          return;
        }

        const data = res.data;
        setParams(buildPageParamsForEdit(data));
        setBasicConfig(buildInitialBasicConfigForEdit(data));
        setScheduleConfig(buildInitialScheduleConfigForEdit(data));
      } catch (error) {
        console.error(error);
        message.error("获取编辑详情失败");
        setParams(null);
      } finally {
        setLoading(false);
      }
    };

    if (scene === "edit") {
      initEdit();
      return;
    }

    if (scene === "create") {
      initCreate();
      return;
    }

    const cache = sessionStorage.getItem(cacheKey);
    if (cache) {
      initCreate();
    } else {
      initEdit();
    }
  }, [id, location.search]);

  const goBack = () => {
    const searchParams = new URLSearchParams(location.search);
    const scene = searchParams.get("scene");

    if (scene === "edit") {
      history.push(`/sync/batch-link-up`);
      return;
    }

    history.push(`/sync/batch-link-up/${id}/detail`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Spin />
      </div>
    );
  }

  if (!params) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Empty description="未找到配置数据，请检查任务是否存在" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <CustomWorkflow
        params={params}
        setParams={setParams}
        goBack={goBack}
        basicConfig={basicConfig}
        setBasicConfig={setBasicConfig}
        scheduleConfig={scheduleConfig}
        setScheduleConfig={setScheduleConfig}
      />
    </div>
  );
}