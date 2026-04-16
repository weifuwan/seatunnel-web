import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { Button, Space, Upload } from "antd";
import { FileCode2, PlayCircle } from "lucide-react";

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
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-slate-100 bg-white px-6 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-indigo-50 text-indigo-600">
              <FileCode2 size={18} />
            </div>

            <div>
              <div className="mb-0 text-[20px] font-bold leading-[1.2] text-slate-900">
                自定义编排任务
              </div>
              <div className="text-[14px] leading-6 text-slate-500">
                通过自定义 HOCON 配置任务内容，并在右侧补充基础信息与调度参数。
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
                    自定义编排
                  </div>

                  <Space size={10}>
                    <div className="inline-flex h-[34px] cursor-pointer select-none items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3.5 text-[13px] font-medium leading-none text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-white/80 hover:text-slate-700 hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] active:translate-y-0">
                      <PlayCircle size={15} strokeWidth={1.9} />
                      <span className="ml-1">运行</span>
                    </div>

                    <div
                      className="inline-flex h-[34px] cursor-pointer select-none items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 text-[13px] font-medium leading-none text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-white/80 hover:text-slate-700 hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] active:translate-y-0"
                      onClick={handleSave}
                      role="button"
                      tabIndex={0}
                    >
                      <SendOutlined />
                      <span>发布</span>
                    </div>
                  </Space>
                </div>

                <div className="min-h-0 flex-1 bg-white p-[18px] [background:radial-gradient(circle_at_top_left,rgba(78,116,248,0.04),transparent_22%),#ffffff]">
                  <div className="h-full">
                    <HoconEditorPanel
                      value={hoconContent}
                      onChange={setHoconContent}
                    />
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
