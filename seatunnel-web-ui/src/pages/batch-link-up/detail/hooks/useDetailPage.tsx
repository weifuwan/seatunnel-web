import { history, useParams } from "@umijs/max";
import { Form, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDbLabel } from "../constants";
import type { DetailFormValues, SourceTargetType, StepKey } from "../types";

const defaultSourceType: SourceTargetType = {
  dbType: "MYSQL",
  connectorType: "Jdbc",
  pluginName: "JDBC-MYSQL",
};

const defaultTargetType: SourceTargetType = {
  dbType: "MYSQL",
  connectorType: "Jdbc",
  pluginName: "Jdbc-MYSQL",
};

export default function useDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<DetailFormValues>();

  const [params, setParams] = useState<any>(null);
  const [sourceType, setSourceType] = useState<SourceTargetType>(defaultSourceType);
  const [targetType, setTargetType] = useState<SourceTargetType>(defaultTargetType);
  const [activeStep, setActiveStep] = useState<StepKey>("base");

  const [sourceClientId, setSourceClientId] = useState<string>();
  const [targetClientId, setTargetClientId] = useState<string>();
  const [bridgeClientIds, setBridgeClientIds] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const baseSectionRef = useRef<HTMLDivElement>(null);
  const clientSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const cache = sessionStorage.getItem(`batch-link-up-detail-${id}`);
    if (!cache) return;

    const data = JSON.parse(cache);
    setParams(data);

    if (data?.sourceType) setSourceType(data.sourceType);
    if (data?.targetType) setTargetType(data.targetType);

    form.setFieldsValue({
      jobName: data?.jobName || "",
      description: data?.description || "",
      mode: data?.mode || "GUIDE_SINGLE",
    });

    setSourceClientId(data?.sourceClientId);
    setTargetClientId(data?.targetClientId);
    setBridgeClientIds(data?.bridgeClientIds || []);
  }, [id, form]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const baseTop = baseSectionRef.current?.offsetTop ?? 0;
      const clientTop = clientSectionRef.current?.offsetTop ?? 0;
      const scrollTop = container.scrollTop + 80;

      if (scrollTop >= clientTop) {
        setActiveStep("client");
      } else if (scrollTop >= baseTop) {
        setActiveStep("base");
      }
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const mode = Form.useWatch("mode", form);

  const sourceLabel = useMemo(() => getDbLabel(sourceType), [sourceType]);
  const targetLabel = useMemo(() => getDbLabel(targetType), [targetType]);

  const goBack = () => {
    history.push("/sync/batch-link-up");
  };

  const handleSourceChange = (value: string, option: any) => {
    setSourceType({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleTargetChange = (value: string, option: any) => {
    setTargetType({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      const merged = {
        ...params,
        ...values,
        sourceType,
        targetType,
        sourceClientId,
        targetClientId,
        bridgeClientIds,
      };

      if (id) {
        sessionStorage.setItem(`batch-link-up-detail-${id}`, JSON.stringify(merged));
      }

      message.success("基础配置已保存");
    } catch (error) {
      console.log(error);
    }
  };

  return {
    form,
    params,
    sourceType,
    targetType,
    activeStep,
    sourceClientId,
    targetClientId,
    bridgeClientIds,
    sourceLabel,
    targetLabel,
    mode,
    scrollRef,
    baseSectionRef,
    clientSectionRef,
    setSourceClientId,
    setTargetClientId,
    setBridgeClientIds,
    handleSourceChange,
    handleTargetChange,
    goBack,
    handleNext,
  };
}