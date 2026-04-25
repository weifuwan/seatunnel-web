import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Form, Popover, Space, Tooltip } from "antd";
import { Blocks, Eye, PlayCircle } from "lucide-react";

import CodeBlockWithCopy from "../../workflow/operator/CodeBlockWithCopy";
import RightConfigPanel from "../../workflow/RightConfigPanel";
import WholeSyncForm from "./components/MultiSyncForm";
import MultiWorkflowParamConfig from "./components/MultiWorkflowParamConfig";
import ReferenceTablePanel from "./components/ReferenceTablePanel";
import TableTransferPanel from "./components/TableTransferPanel";
import { useMultiWorkflowState } from "./hooks/useMultiWorkflowState";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { MultiWorkflowProps } from "./types";

type EnhancedMultiWorkflowProps = MultiWorkflowProps & {
  setParams: React.Dispatch<React.SetStateAction<any>>;
};

export default function MultiWorkflow({
  params,
  setParams,
  goBack,
  basicConfig,
  setBasicConfig,
  scheduleConfig,
  setScheduleConfig,
}: EnhancedMultiWorkflowProps) {
  const [form] = Form.useForm();

  const { rightWidth, handleResizeStart } = useResizablePanel(520);

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

    publishLoading,
    canRun,
    runDisabledReason,

    handleSourceIdChange,
    handleMatchModeChange,
    handleKeywordChange,
    handleSave,
    handlePreview,
    handleRun,
  } = useMultiWorkflowState({
    form,
    params,
    setParams,
    basicConfig,
    scheduleConfig,
  });

  const actionButtonClass =
    "!inline-flex !h-[34px] !items-center !justify-center !rounded-full !border !border-slate-200 !bg-slate-50 !px-3.5 !text-[13px] !font-medium !text-slate-500 transition-colors duration-200 hover:!border-slate-300 hover:!bg-white/80 hover:!text-slate-700 hover:!shadow-[0_4px_12px_rgba(15,23,42,0.05)] disabled:!cursor-not-allowed disabled:!border-slate-200 disabled:!bg-slate-100 disabled:!text-slate-400 disabled:!shadow-none";

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
                多表离线任务
              </div>
              <div className="text-[14px] leading-6 text-slate-500">
                配置多表同步链路、表匹配规则与运行参数，在一个页面完成创建与调试。
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
                    多表同步编排
                  </div>

                  <Space size={10}>
                    <Tooltip title={runDisabledReason}>
                      <Button
                        type="default"
                        icon={<PlayCircle size={15} strokeWidth={1.9} />}
                        onClick={handleRun}
                        disabled={!canRun}
                        className={actionButtonClass}
                      >
                        运行
                      </Button>
                    </Tooltip>

                    <Button
                      type="default"
                      icon={<SendOutlined />}
                      onClick={handleSave}
                      loading={publishLoading}
                      className={actionButtonClass}
                    >
                      发布
                    </Button>

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
                  </Space>
                </div>

                <div className="min-h-0 flex-1 bg-white p-[18px] [background:radial-gradient(circle_at_top_left,rgba(78,116,248,0.04),transparent_22%),#ffffff]">
                  <div className="h-full overflow-auto px-3 py-2">
                    <Form form={form} layout="vertical">
                      <div className="rounded-2xl">
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
                          <ReferenceTablePanel
                            loading={loading}
                            data={readOnlyTables}
                          />
                        )}
                      </div>

                      <MultiWorkflowParamConfig />
                    </Form>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative flex w-[14px] shrink-0 cursor-col-resize items-center justify-center bg-transparent transition-colors duration-200 hover:bg-[rgba(49,94,251,0.04)]"
              onMouseDown={handleResizeStart}
              role="separator"
              aria-orientation="vertical"
              aria-label="调整左右面板宽度"
            >
              <div className="h-full w-px bg-slate-200 transition-colors duration-200" />
              <div className="absolute left-1/2 top-1/2 flex h-[46px] w-5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-slate-200 bg-white opacity-90 shadow-sm transition-all duration-200 hover:scale-100 hover:opacity-100 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)]">
                <span className="block h-1 w-1 rounded-full bg-slate-400" />
                <span className="block h-1 w-1 rounded-full bg-slate-400" />
              </div>
            </div>

            <div
              className="h-full min-w-[320px] max-w-[520px] shrink-0 overflow-hidden"
              style={{ width: rightWidth }}
            >
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
