import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Popover, Space, Upload } from "antd";
import { Eye, FileCode2, PlayCircle } from "lucide-react";

import "./index.less";
import styles from "./index.less";

import CodeBlockWithCopy from "../../workflow/operator/CodeBlockWithCopy";
import RightConfigPanel from "../../workflow/RightConfigPanel";

import { useResizablePanel } from "../multi/hooks/useResizablePanel";
import HoconEditorPanel from "./HoconEditorPanel";
import { useCustomWorkflowState } from "./hooks/useCustomWorkflowState";

interface CustomWorkflowProps {
  params: any;
  goBack: () => void;
  basicConfig: any;
  setBasicConfig: (value: any) => void;
  scheduleConfig: any;
  setScheduleConfig: (value: any) => void;
}

export default function CustomWorkflow({
  params,
  goBack,
  basicConfig,
  setBasicConfig,
  scheduleConfig,
  setScheduleConfig,
}: CustomWorkflowProps) {
  const { rightWidth, handleResizeStart } = useResizablePanel(380);

  const {
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
  } = useCustomWorkflowState({
    params,
    basicConfig,
    scheduleConfig,
  });

  return (
    <div className={styles.workflow}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.titleWrap}>
            <div className={styles.titleIcon}>
              <FileCode2 size={18} />
            </div>

            <div>
              <div className={styles.title}>自定义编排任务</div>
              <div className={styles.subtitle}>
                通过自定义 HOCON 配置任务内容，并在右侧补充基础信息与调度参数。
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
                  <div className={styles.mainPanelTitle}>自定义编排</div>

                  <Space size={10}>
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
                        className={`${styles.actionChip} ${styles.actionChipGhost}`}
                        onClick={handlePreview}
                        role="button"
                        tabIndex={0}
                      >
                        <Eye size={15} strokeWidth={1.9} />
                        <span style={{ marginLeft: 4 }}>
                          {previewLoading ? "生成中..." : "预览"}
                        </span>
                      </div>
                    </Popover>
                    <div
                      className={`${styles.actionChip} ${styles.actionChipGhost}`}
                    >
                      <PlayCircle size={15} strokeWidth={1.9} />
                      <span style={{ marginLeft: 4 }}>运行</span>
                    </div>

                    <div
                      className={`${styles.actionChip} ${styles.actionChipGhost}`}
                      onClick={handleSave}
                      role="button"
                      tabIndex={0}
                    >
                      <Upload size={15} strokeWidth={1.9} />
                      <span>发布</span>
                    </div>
                  </Space>
                </div>

                <div className={styles.mainPanelContent}>
                  <div className="h-full overflow-auto">
                    <HoconEditorPanel
                      value={hoconContent}
                      onChange={setHoconContent}
                    />
                  </div>
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
