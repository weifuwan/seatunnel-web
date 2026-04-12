import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, Row, Space } from "antd";
import { Blocks, Braces, Database } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./FlowCanvas";
import RightConfigPanel from "./RightConfigPanel";
import {
  BasicConfig,
  ScheduleConfig,
} from "./components/ScheduleConfigContent/types";
import styles from "./index.less";

interface WorkflowProps {
  params: any;
  goBack: () => void;
  sourceType: any;
  setSourceType: (value: any) => void;
  targetType: any;
  setTargetType: (value: any) => void;
  basicConfig: BasicConfig;
  setBasicConfig: React.Dispatch<React.SetStateAction<BasicConfig>>;
  scheduleConfig: ScheduleConfig;
  setScheduleConfig: (value: any) => void;
  setParams: React.Dispatch<React.SetStateAction<any>>;
}

export default function Workflow({
  params,
  goBack,
  sourceType,
  targetType,
  basicConfig,
  setBasicConfig,
  scheduleConfig,
  setScheduleConfig,
}: WorkflowProps) {
  const [form] = Form.useForm();
  const [rightWidth, setRightWidth] = useState(380);
  const [activeTab, setActiveTab] = useState<
    "basic" | "schedule" | "mapping" | "advanced"
  >("basic");
  const draggingRef = useRef(false);

  const [workflowGraph, setWorkflowGraph] = useState<{
    nodes: any[];
    edges: any[];
  }>({
    nodes: [],
    edges: [],
  });

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

  const buildScheduleData = () => {
    return {
      ...scheduleConfig,
    };
  };

  const buildFinalPayload = () => {
    return {
      basic: buildBasicData(),
      workflow: buildWorkflowData(),
      schedule: buildScheduleData(),
      env: {
        "job.mode": "BATCH",
        "parallelism": 1
      }
      // 后续扩展放这里
      // runtime: runtimeConfig,
      // alert: alertConfig,
      // retry: retryConfig,
    };
  };

  const handleSave = () => {
    const finalPayload = buildFinalPayload();

    console.log("最终保存数据 finalPayload =", finalPayload);
    console.log("basic 数据 =", finalPayload.basic);
    console.log("workflow 数据 =", finalPayload.workflow);
    console.log("schedule 数据 =", finalPayload.schedule);
  };

  return (
    <div className={styles.workflow}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.titleWrap}>
            <div className={styles.titleIcon}>
              <Blocks size={18} />
            </div>

            <div>
              <div className={styles.title}>单表离线任务</div>
              <div className={styles.subtitle}>
                配置同步链路、字段映射与运行参数，在一个页面完成创建与调试。
              </div>
            </div>
          </div>

          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className={styles.backButton}
              onClick={goBack}
            >
              返回上一步
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.workspaceCard}>
          <div className={styles.resizeLayout}>
            <div className={styles.leftPane}>
              <div className={styles.mainPanel}>
                <div className={styles.mainPanelHeader}>
                  <div className={styles.mainPanelTitle}>同步编排</div>

                  <Space size={10}>
                    <div className={styles.actionChip}>运行</div>
                    <div
                      className={styles.actionChip}
                      onClick={handleSave}
                      role="button"
                      tabIndex={0}
                    >
                      发布
                    </div>
                    <div className={styles.actionChip}>预览</div>
                  </Space>
                </div>

                <div className={styles.mainPanelContent}>
                  <Row gutter={24} style={{ height: "100%" }}>
                    <Col span={4}>
                      <div className={styles.nodePalette}>
                        <div className={styles.paletteTitle}>节点组件</div>

                        <div
                          className={styles.paletteNode}
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
                          <div
                            className={`${styles.paletteIcon} ${styles.mappingIcon}`}
                          >
                            <Braces size={16} />
                          </div>

                          <div className={styles.paletteContent}>
                            <div className={styles.paletteName}>字段映射</div>
                            <div className={styles.paletteDesc}>
                              配置字段对应关系
                            </div>
                          </div>
                        </div>

                        <div
                          className={styles.paletteNode}
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
                          <div
                            className={`${styles.paletteIcon} ${styles.sqlIcon}`}
                          >
                            <Database size={16} />
                          </div>

                          <div className={styles.paletteContent}>
                            <div className={styles.paletteName}>SQL</div>
                            <div className={styles.paletteDesc}>
                              支持自定义查询
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col span={20}>
                      <div className={styles.canvasShell}>
                        <ReactFlowProvider>
                          <FlowCanvas
                            form={form}
                            params={params}
                            goBack={goBack}
                            sourceType={sourceType}
                            targetType={targetType}
                            onWorkflowChange={setWorkflowGraph}
                          />
                        </ReactFlowProvider>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            <div
              className={styles.resizeBar}
              onMouseDown={handleResizeStart}
              role="separator"
              aria-orientation="vertical"
              aria-label="调整左右面板宽度"
            >
              <div className={styles.resizeBarLine} />
              <div className={styles.resizeBarHandle}>
                <span />
                <span />
              </div>
            </div>

            <div className={styles.rightPane} style={{ width: rightWidth }}>
              <RightConfigPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                params={params}
                basicConfig={basicConfig}
                setBasicConfig={setBasicConfig}
                scheduleConfig={scheduleConfig}
                setScheduleConfig={setScheduleConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
