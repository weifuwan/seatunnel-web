import { message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { seatunnelJobDefinitionApi } from "@/pages/batch-link-up/api";
import { hoconTemplateApi } from "../hoconTemplateApi";

interface UseCustomWorkflowStateProps {
  params: any;
  setParams: React.Dispatch<React.SetStateAction<any>>;
  basicConfig: any;
  scheduleConfig: any;
}

export function useCustomWorkflowState({
  params,
  setParams,
  basicConfig,
  scheduleConfig,
}: UseCustomWorkflowStateProps) {
  const [activeTab, setActiveTab] = useState<any>("basic");
  const [hoconContent, setHoconContent] = useState<string>("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const [publishedJobDefineId, setPublishedJobDefineId] = useState<
    number | string | undefined
  >(params?.id);
  const [publishLoading, setPublishLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initializedRef = useRef(false);
  const contentInitializedRef = useRef(false);

  useEffect(() => {
    if (params?.id) {
      setPublishedJobDefineId(params.id);
    }
  }, [params?.id]);

  useEffect(() => {
    if (contentInitializedRef.current) return;
    if (!params) return;

    const initialContent =
      params?.workflow?.hoconContent ||
      params?.jobDefinitionInfo?.hoconContent ||
      params?.hoconContent ||
      "";

    if (initialContent?.trim()) {
      setHoconContent(initialContent);
      contentInitializedRef.current = true;
      return;
    }

    contentInitializedRef.current = true;
    void loadTemplate();
  }, [params]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    setIsDirty(true);
  }, [basicConfig, scheduleConfig, hoconContent]);

  const loadTemplate = async () => {
    const sourceDbType = basicConfig?.sourceType;
    const sourcePluginName = basicConfig?.sourcePluginName;
    const targetDbType = basicConfig?.targetType;
    const targetPluginName = basicConfig?.targetPluginName;

    if (
      !sourceDbType ||
      !sourcePluginName ||
      !targetDbType ||
      !targetPluginName
    ) {
      return;
    }

    try {
      setTemplateLoading(true);

      const res = await hoconTemplateApi.preview({
        sourceDbType,
        sourcePluginName,
        targetDbType,
        targetPluginName,
      });

      setHoconContent(res?.data?.fullTemplate || "");
    } catch (error) {
      console.error(error);
      message.warning("默认 HOCON 模板加载失败，请手动填写");
    } finally {
      setTemplateLoading(false);
    }
  };

  const buildFinalPayload = () => {
    return {
      id: params?.id ?? publishedJobDefineId,
      basic: {
        ...basicConfig,
        mode: "SCRIPT",
      },
      content: {
        scriptType: "HOCON",
        hoconContent,
      },
      schedule: {
        ...scheduleConfig,
      },
      env: {
        jobMode: "BATCH",
        parallelism: 1,
      },
    };
  };

  const validateBeforeSubmit = async () => {
    if (!hoconContent?.trim()) {
      message.warning("请先填写 HOCON 配置");
      return false;
    }
    return true;
  };

  const handleReloadTemplate = async () => {
    if (
      !basicConfig?.sourceType ||
      !basicConfig?.sourcePluginName ||
      !basicConfig?.targetType ||
      !basicConfig?.targetPluginName
    ) {
      message.warning("请先完成来源和目标类型配置");
      return;
    }

    if (!hoconContent?.trim()) {
      await loadTemplate();
      return;
    }

    Modal.confirm({
      title: "重新生成模板",
      content: "重新生成将覆盖当前编辑器内容，是否继续？",
      okText: "覆盖",
      cancelText: "取消",
      onOk: async () => {
        await loadTemplate();
      },
    });
  };

  const handleSave = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      setPublishLoading(true);

      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.saveOrUpdateScript(
        finalPayload
      );

      const jobDefineId = res?.data?.id ?? res?.data ?? finalPayload.id;

      if (jobDefineId) {
        setPublishedJobDefineId(jobDefineId);
        setIsDirty(false);

        setParams((prev: any) => ({
          ...(prev || {}),
          id: jobDefineId,
          workflow: {
            ...(prev?.workflow || {}),
            hoconContent,
          },
          hoconContent,
        }));
      }

      message.success("发布成功");
    } catch (error) {
      console.error(error);
      message.error("发布失败");
    } finally {
      setPublishLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      setPreviewLoading(true);
      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.buildScriptConfig(finalPayload);

      setPreviewContent(res?.data || hoconContent);
      setPreviewOpen(true);
    } catch (error) {
      console.error(error);
      message.error("预览失败");
    } finally {
      setPreviewLoading(false);
    }
  };

  const canRun =
    !!publishedJobDefineId && !isDirty && !publishLoading && !runLoading;

  const runDisabledReason = !publishedJobDefineId
    ? "请先发布任务，再执行"
    : isDirty
    ? "当前内容已变更，请重新发布后再执行"
    : "";

  const handleRun = async () => {
    const pass = await validateBeforeSubmit();
    if (!pass) return;

    if (!publishedJobDefineId) {
      message.warning("请先发布任务，再执行");
      return;
    }

    if (isDirty) {
      message.warning("当前内容已变更，请重新发布后再执行");
      return;
    }

    // 这里先占位，后续接你的 RunLog / execute API
    message.success("运行校验通过，可继续接入执行逻辑");
  };

  return {
    activeTab,
    setActiveTab,

    hoconContent,
    setHoconContent,

    previewOpen,
    setPreviewOpen,
    previewContent,
    previewLoading,
    templateLoading,

    publishedJobDefineId,
    publishLoading,
    runLoading,
    isDirty,
    canRun,
    runDisabledReason,

    handleSave,
    handlePreview,
    handleReloadTemplate,
    handleRun,
  };
}