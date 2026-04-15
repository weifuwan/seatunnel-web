import { message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { seatunnelJobDefinitionApi } from "@/pages/batch-link-up/api";
import { hoconTemplateApi } from "../hoconTemplateApi";

type RightPanelTab = "basic" | "schedule" | "mapping" | "advance";

interface UseCustomWorkflowStateProps {
  params: any;
  basicConfig: any;
  scheduleConfig: any;
}

export function useCustomWorkflowState({
  params,
  basicConfig,
  scheduleConfig,
}: UseCustomWorkflowStateProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("basic");
  const [hoconContent, setHoconContent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!params) return;

    const initialContent =
      params?.workflow?.hoconContent ||
      params?.jobDefinitionInfo?.hoconContent ||
      params?.hoconContent ||
      "";

    if (initialContent?.trim()) {
      setHoconContent(initialContent);
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;
    void loadTemplate();
  }, [params]);

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

      const finalPayload = buildFinalPayload();
      await seatunnelJobDefinitionApi.saveOrUpdateScript(finalPayload);
      message.success("保存成功");
    } catch (error) {
      console.error(error);
      message.error("保存失败");
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
    handleSave,
    handlePreview,
    handleReloadTemplate,
  };
}