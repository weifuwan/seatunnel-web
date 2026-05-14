import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, message, Popover, Row, Space } from "antd";
import {
  Blocks,
  Braces,
  Database,
  Eye,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { seatunnelJobDefinitionApi } from "../api";
import FlowCanvas from "./FlowCanvas";
import RightConfigPanel from "./RightConfigPanel";
import { CheckListPopover } from "./components/CheckListPopover";
import {
  BasicConfig,
  EnvConfig,
} from "./components/ScheduleConfigContent/types";
import { useFlowChecks } from "./hooks/useFlowChecks";
import "./index.less";
import CodeBlockWithCopy from "./operator/CodeBlockWithCopy";
import RunLog from "./run";

interface WorkflowProps {
  params: any;
  goBack: () => void;
  sourceType: any;
  setSourceType: (value: any) => void;
  targetType: any;
  setTargetType: (value: any) => void;
  basicConfig: BasicConfig;
  setBasicConfig: React.Dispatch<React.SetStateAction<BasicConfig>>;
  setParams: React.Dispatch<React.SetStateAction<any>>;
  envConfig: EnvConfig;
  setEnvConfig: React.Dispatch<React.SetStateAction<EnvConfig>>;
}

const getInitialWorkflowGraph = (params?: any) => {
  const workflow = params?.workflow || {};

  return {
    nodes: Array.isArray(workflow?.nodes) ? workflow.nodes : [],
    edges: Array.isArray(workflow?.edges) ? workflow.edges : [],
  };
};

const buildDirtySignature = (data: {
  basicConfig: BasicConfig;
  envConfig: EnvConfig;
  workflowGraph: {
    nodes: any[];
    edges: any[];
  };
}) => {
  return JSON.stringify({
    basic: data.basicConfig,
    env: data.envConfig,
    workflow: {
      nodes: data.workflowGraph?.nodes || [],
      edges: data.workflowGraph?.edges || [],
    },
  });
};

export default function Workflow({
  params,
  goBack,
  sourceType,
  targetType,
  basicConfig,
  setBasicConfig,
  setParams,
  envConfig,
  setEnvConfig,
}: WorkflowProps) {
  const [form] = Form.useForm();

  const [rightWidth, setRightWidth] = useState(540);
  const [activeTab, setActiveTab] = useState<
    "basic" | "mapping" | "env" | null
  >(null);

  const draggingRef = useRef(false);

  const [workflowGraph, setWorkflowGraph] = useState<{
    nodes: any[];
    edges: any[];
  }>(() => getInitialWorkflowGraph(params));

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const [runVisible, setRunVisible] = useState(false);

  const [publishedJobDefineId, setPublishedJobDefineId] = useState<
    number | undefined
  >(params?.id);

  const [publishLoading, setPublishLoading] = useState(false);
  const [runLoading] = useState(false);

  const currentSignature = useMemo(() => {
    return buildDirtySignature({
      basicConfig,
      envConfig,
      workflowGraph,
    });
  }, [basicConfig, envConfig, workflowGraph]);

  /**
   * baselineSignature 表示“已发布版本”的配置快照。
   *
   * 编辑页首次进入：
   * baseline = 当前回显数据
   * current = 当前回显数据
   * 所以 isDirty = false，运行按钮可用。
   *
   * 用户修改后：
   * current !== baseline
   * 所以 isDirty = true，需要重新发布。
   */
  const [baselineSignature, setBaselineSignature] =
    useState<string>(currentSignature);

  const isDirty =
    !!publishedJobDefineId && currentSignature !== baselineSignature;

  const { checkStat, checkGroups } = useFlowChecks(workflowGraph.nodes || []);

  const canRun =
    !!publishedJobDefineId && !isDirty && !publishLoading && !runLoading;

  const runDisabledReason = !publishedJobDefineId
    ? "请先发布任务，再执行"
    : isDirty
      ? "当前内容已变更，请重新发布后再执行"
      : "";

  const validateChecklistBeforeAction = () => {
    const total =
      (checkStat as any)?.total ??
      (checkStat as any)?.count ??
      (checkStat as any)?.checklistCount ??
      0;

    if (total !== 0) {
      message.warning("请先完成 Checklist 检查后，再进行预览或同步");
      return false;
    }

    return true;
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;

      const viewportWidth = window.innerWidth;
      const nextWidth = viewportWidth - event.clientX - 18;
      const clampedWidth = Math.max(320, Math.min(520, nextWidth));

      setRightWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /**
   * params.id 变化时，说明进入了一个新的任务上下文。
   * 这里只同步发布 id 和 workflow 初始数据。
   */
  useEffect(() => {
    if (!params?.id) return;

    setPublishedJobDefineId(params.id);

    const nextWorkflowGraph = getInitialWorkflowGraph(params);
    setWorkflowGraph(nextWorkflowGraph);
  }, [params?.id]);

  /**
   * 编辑页刚进来时，等当前 props + workflowGraph 形成当前快照后，
   * 把这份快照作为 baseline。
   */
  useEffect(() => {
    if (!params?.id) return;

    setBaselineSignature(currentSignature);
  }, [params?.id, currentSignature]);

  const buildEnvData = () => {
    return {
      ...envConfig,
    };
  };

  const handleResizeStart = () => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const buildWorkflowData = () => {
    return {
      nodes: workflowGraph.nodes,
      edges: workflowGraph.edges,
    };
  };

  const buildBasicData = () => {
    return {
      ...basicConfig,
    };
  };

  const buildFinalPayload = () => {
    return {
      id: params?.id ?? publishedJobDefineId,
      basic: buildBasicData(),
      workflow: buildWorkflowData(),
      env: buildEnvData(),
    };
  };

  const handlePreview = async () => {
    try {
      if (!validateChecklistBeforeAction()) {
        return;
      }

      setPreviewLoading(true);

      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.buildGuideSingleConfig(
        finalPayload
      );

      setPreviewContent(res?.data || "");
      setPreviewOpen(true);
    } catch (error: any) {
      message.error(error?.message || "预览失败");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!validateChecklistBeforeAction()) {
        return;
      }

      setPublishLoading(true);

      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.saveOrUpdateGuideSingle(
        finalPayload
      );

      const jobDefineId = res?.data?.id ?? res?.data ?? finalPayload.id;

      if (jobDefineId) {
        setPublishedJobDefineId(jobDefineId);

        const nextSignature = buildDirtySignature({
          basicConfig,
          envConfig,
          workflowGraph,
        });

        setBaselineSignature(nextSignature);

        setParams((prev: any) => ({
          ...prev,
          id: jobDefineId,
        }));
      }

      message.success("发布成功");
    } catch (error: any) {
      
    } finally {
      setPublishLoading(false);
    }
  };

  const handleWorkflowChange = (nextGraph: { nodes: any[]; edges: any[] }) => {
    setWorkflowGraph((prev) => {
      const prevSignature = JSON.stringify({
        nodes: prev?.nodes || [],
        edges: prev?.edges || [],
      });

      const nextSignature = JSON.stringify({
        nodes: nextGraph?.nodes || [],
        edges: nextGraph?.edges || [],
      });

      if (prevSignature === nextSignature) {
        return prev;
      }

      return {
        nodes: nextGraph?.nodes || [],
        edges: nextGraph?.edges || [],
      };
    });
  };

  const actionChipClass =
    "inline-flex h-[34px] cursor-pointer select-none items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3.5 text-[13px] font-medium leading-none text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-white/80 hover:text-slate-700 hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] active:translate-y-0";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-slate-100 bg-white px-6 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-indigo-50 text-indigo-600">
              <Blocks size={18} />
            </div>

            <div>
              <div className="mb-0 text-[20px] font-bold leading-[1.2] text-slate-900">
                单表实时任务
              </div>
              <div className="text-[14px] leading-6 text-slate-500">
                配置同步链路、字段映射与运行参数，在一个页面完成创建与调试。
              </div>
            </div>
          </div>

          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={goBack}
              className="!h-10 !rounded-full !border !border-slate-200 !bg-white !px-4 !text-slate-700 !shadow-sm hover:!border-slate-300 hover:!bg-slate-50 hover:!text-slate-800"
            >
              返回上一步
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-[18px]">
        <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white via-white to-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex h-full min-w-0 items-stretch">
            <div className="h-full min-w-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 px-[18px]">
                  <div className="text-[15px] font-semibold text-slate-800">
                    同步编排
                  </div>

                  <Space size={10}>
                    <CheckListPopover
                      checkStat={checkStat}
                      checkGroups={checkGroups}
                      triggerClassName={actionChipClass}
                    />

                    <Popover
                      open={previewOpen}
                      placement="leftTop"
                      trigger="click"
                      overlayClassName="st-hocon-popover"
                      content={
                        <div className="w-[700px]">
                          <CodeBlockWithCopy
                            content={previewContent}
                            height={670}
                            title="HOCON Preview"
                            onClose={() => setPreviewOpen(false)}
                          />
                        </div>
                      }
                    >
                      <div
                        className={actionChipClass}
                        onClick={handlePreview}
                        role="button"
                        tabIndex={0}
                      >
                        <Eye
                          size={15}
                          strokeWidth={1.9}
                          className={previewLoading ? "animate-spin" : ""}
                        />
                        <span className="ml-1">预览</span>
                      </div>
                    </Popover>

                    <Button
                      type="default"
                      icon={<Upload size={15} strokeWidth={1.9} />}
                      onClick={handleSave}
                      loading={publishLoading}
                      className="!inline-flex !h-[34px] !items-center !justify-center !rounded-full !border !border-slate-200 !bg-slate-50 !px-3.5 !text-[13px] !font-medium !text-slate-500 transition-colors duration-200 hover:!border-slate-300 hover:!bg-white/80 hover:!text-slate-700 hover:!shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
                    >
                      发布
                    </Button>
                  </Space>
                </div>

                <div className="min-h-0 flex-1 bg-white p-[18px] [background:radial-gradient(circle_at_top_left,rgba(78,116,248,0.04),transparent_22%),#ffffff]">
                  <Row gutter={24} style={{ height: "100%" }}>
                    <Col span={4}>
                      <div className="flex h-full flex-col gap-3 overflow-auto border-r border-slate-100 p-3">
                        <div className="px-0.5 pb-2 pt-1 text-[13px] font-semibold text-slate-700">
                          节点组件
                        </div>

                        <div
                          className="flex cursor-grab select-none items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.99] active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData(
                              "application/reactflow",
                              JSON.stringify({
                                nodeType: "transform",
                                componentType: "FIELDMAPPER",
                                iconType: "braces",
                                label: "字段映射",
                              })
                            );
                            event.dataTransfer.effectAllowed = "move";
                          }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-50 to-indigo-100 text-indigo-600">
                            <Braces size={16} />
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-[1.2] text-slate-900">
                              字段映射
                            </div>
                            <div className="mt-1 text-[12px] leading-[1.4] text-slate-500">
                              配置字段对应关系
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex cursor-grab select-none items-center gap-3 rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.99] active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData(
                              "application/reactflow",
                              JSON.stringify({
                                nodeType: "transform",
                                componentType: "SQL",
                                iconType: "database",
                                label: "SQL 脚本",
                              })
                            );
                            event.dataTransfer.effectAllowed = "move";
                          }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-violet-50 to-violet-100 text-violet-600">
                            <Database size={16} />
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-[1.2] text-slate-900">
                              SQL
                            </div>
                            <div className="mt-1 text-[12px] leading-[1.4] text-slate-500">
                              支持自定义查询
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col span={20}>
                      <div className="h-full overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-[14px] text-slate-400">
                        <ReactFlowProvider>
                          <FlowCanvas
                            form={form}
                            params={params}
                            goBack={goBack}
                            sourceType={sourceType}
                            targetType={targetType}
                            onWorkflowChange={handleWorkflowChange}
                          />
                        </ReactFlowProvider>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              {runVisible && (
                <RunLog
                  runVisible={runVisible}
                  setRunVisible={setRunVisible}
                  baseForm={form}
                  params={params}
                />
              )}
            </div>

            {activeTab && (
              <div
                className="relative flex w-[20px] shrink-0 cursor-col-resize items-center justify-center bg-transparent transition-colors duration-100 hover:bg-[rgba(49,94,251,0.04)]"
                onMouseDown={handleResizeStart}
                role="separator"
                aria-orientation="vertical"
                aria-label="调整左右面板宽度"
              >
                <div className="h-full w-px bg-slate-200 transition-colors duration-100" />
                <div className="absolute left-1/2 top-1/2 flex h-[46px] w-5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-slate-200 bg-white opacity-90 shadow-sm transition-all duration-200 hover:scale-100 hover:opacity-100 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)]">
                  <span className="block h-1 w-1 rounded-full bg-slate-400" />
                  <span className="block h-1 w-1 rounded-full bg-slate-400" />
                </div>
              </div>
            )}

            <div
              className="h-full shrink-0 overflow-hidden"
              style={{ width: activeTab ? rightWidth : 58 }}
            >
              <RightConfigPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                params={params}
                basicConfig={basicConfig}
                setBasicConfig={setBasicConfig}
                envConfig={envConfig}
                setEnvConfig={setEnvConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}