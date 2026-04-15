import { message } from "antd";
import { useEffect, useState } from "react";
import { seatunnelJobDefinitionApi } from "@/pages/batch-link-up/api";

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

  useEffect(() => {
    const initialContent =
      params?.workflow?.hoconContent ||
      params?.jobDefinitionInfo?.hoconContent ||
      params?.hoconContent ||
      "";

    setHoconContent(initialContent);
  }, [params]);

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
    handleSave,
    handlePreview,
  };
}