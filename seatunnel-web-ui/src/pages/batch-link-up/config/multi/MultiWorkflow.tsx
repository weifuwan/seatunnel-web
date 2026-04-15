import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, Popover, Space } from "antd";
import { Blocks } from "lucide-react";

import styles from "./index.less";
import "./index.less";

import CodeBlockWithCopy from "../../workflow/operator/CodeBlockWithCopy";
import RightConfigPanel from "../../workflow/RightConfigPanel";
import ReferenceTablePanel from "./components/ReferenceTablePanel";
import TableTransferPanel from "./components/TableTransferPanel";
import WholeSyncForm from "./components/MultiSyncForm";
import MultiWorkflowParamConfig from "./components/MultiWorkflowParamConfig";
import { useMultiWorkflowState } from "./hooks/useMultiWorkflowState";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { MultiWorkflowProps } from "./types";

export default function MultiWorkflow({
  params,
  goBack,
  basicConfig,
  setBasicConfig,
  scheduleConfig,
  setScheduleConfig,
}: MultiWorkflowProps) {
  const [form] = Form.useForm();

  const { rightWidth, handleResizeStart } = useResizablePanel(380);

  const {
    activeTab,
    setActiveTab,
    loading,
    sourceOption,
    targetOption,
    tableData,
    readOnlyTables,
    multiTableList,
    setMultiTableList,
    matchMode,
    tableKeyword,
    previewOpen,
    setPreviewOpen,
    previewContent,
    previewLoading,
    handleSourceIdChange,
    handleMatchModeChange,
    handleKeywordChange,
    handleSave,
    handlePreview,
  } = useMultiWorkflowState({
    form,
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
              <Blocks size={18} />
            </div>

            <div>
              <div className={styles.title}>多表离线任务</div>
              <div className={styles.subtitle}>
                配置多表同步链路、表匹配规则与运行参数，在一个页面完成创建与调试。
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
                  <div className={styles.mainPanelTitle}>多表同步编排</div>

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
                        className={styles.actionChip}
                        onClick={handlePreview}
                        role="button"
                        tabIndex={0}
                      >
                        {previewLoading ? "生成中..." : "预览"}
                      </div>
                    </Popover>
                  </Space>
                </div>

                <div className={styles.mainPanelContent}>
                  <div className="h-full overflow-auto px-3 py-2">
                    <Form form={form} layout="vertical">
                      <div className="rounded-2xl">
                        <div className="mb-5 text-base font-semibold text-slate-800">
                          数据表设置
                        </div>

                        <WholeSyncForm
                          form={form}
                          sourceOption={sourceOption}
                          targetOption={targetOption}
                          matchMode={matchMode}
                          tableKeyword={tableKeyword}
                          onSourceIdChange={handleSourceIdChange}
                          onMatchModeChange={handleMatchModeChange}
                          onKeywordChange={handleKeywordChange}
                        />

                        {(matchMode === "1" || matchMode === "4") && (
                          <TableTransferPanel
                            loading={loading}
                            data={tableData}
                            targetKeys={multiTableList}
                            matchMode={matchMode}
                            onChange={setMultiTableList}
                          />
                        )}

                        {(matchMode === "2" || matchMode === "3") && (
                          <ReferenceTablePanel loading={loading} data={readOnlyTables} />
                        )}
                      </div>

                      <MultiWorkflowParamConfig />
                    </Form>
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