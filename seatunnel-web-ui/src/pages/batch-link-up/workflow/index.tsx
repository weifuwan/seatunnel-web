import { Form } from "antd";
import { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./FlowCanvas";
import { SyncOutlined } from "@ant-design/icons";
import CloseIcon from "./icon/CloseIcon";

type RightPanelTab = "attribute" | "runtime" | "schedule" | "version";

interface WorkflowProps {
  params: any;
  goBack: () => void;
  sourceType: any;
  setSourceType: (value: any) => void;
  targetType: any;
  setTargetType: (value: any) => void;
  setParams: React.Dispatch<React.SetStateAction<any>>;
}

const PANEL_TABS: Array<{ key: RightPanelTab; label: string }> = [
  { key: "attribute", label: "属性" },
  { key: "runtime", label: "运行配置" },
  { key: "schedule", label: "调度配置" },
  { key: "version", label: "版本" },
];

export default function Workflow({ params, goBack }: WorkflowProps) {
  const [form] = Form.useForm();
  const [panelOpen, setPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<RightPanelTab>("attribute");

  const activeTabLabel =
    PANEL_TABS.find((item) => item.key === activeTab)?.label || "属性";

  return (
    <div className="h-[calc(100vh-12px)] bg-[#FFFFFF] p-5">
      <div className="flex h-full overflow-hidden rounded-[8px] border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.02)]">
        {/* 左侧主工作区 */}
        <main className="min-w-0 flex-1 bg-[#FCFCFD]">
          <ReactFlowProvider>
            <FlowCanvas form={form} params={params} goBack={goBack} />
          </ReactFlowProvider>
        </main>

        {/* 右侧面板区 */}
        <aside className="flex h-full shrink-0 border-l border-[#F2F4F7] bg-white">
          {/* 内容面板 */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              panelOpen ? "w-[360px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="flex h-full w-[360px] flex-col bg-[#FFFFFF]">
              <div className="flex h-[46px] items-center justify-between border-b border-[#F2F4F7] px-5">
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold text-[#101828]">
                    {activeTabLabel}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[13px] text-[#667085]">
                  <button
                    type="button"
                    className="transition hover:text-[#344054]"
                  >
                   <SyncOutlined /> 刷新
                  </button>

                  <div className="h-4 w-px bg-[#E4E7EC]" />

                  <button
                    type="button"
                    className="transition hover:text-[#344054]"
                    onClick={() => setPanelOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#FCFCFD] p-4">
                {activeTab === "attribute" && (
                  <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-white p-5 text-sm text-[#667085]">
                    属性区域占位
                  </div>
                )}

                {activeTab === "runtime" && (
                  <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-white p-5 text-sm text-[#667085]">
                    运行配置区域占位
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-white p-5 text-sm text-[#667085]">
                    调度配置区域占位
                  </div>
                )}

                {activeTab === "version" && (
                  <div className="rounded-[10px] border border-dashed border-[#D0D5DD] bg-white p-5 text-sm text-[#667085]">
                    版本区域占位
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧竖向 tabs */}
          <div className="flex h-full w-[38px] flex-col border-l border-[#F2F4F7] bg-[#FCFCFD]">
            <div className="flex-1">
              {PANEL_TABS.map((item) => {
                const active = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      setPanelOpen(true);
                    }}
                    className={`group relative flex h-[96px] w-full items-center justify-center border-b border-[#F2F4F7] px-1 transition ${
                      active
                        ? "bg-[#EEF4FF] text-[#3559E0]"
                        : "bg-transparent text-[#667085] hover:bg-[#F9FAFB] hover:text-[#344054]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-0 h-full w-[2px] bg-[#3559E0]" />
                    )}

                    <span className="text-[13px] leading-5 [writing-mode:vertical-rl] [text-orientation:mixed]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {!panelOpen && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="flex h-[56px] items-center justify-center border-t border-[#F2F4F7] text-[12px] text-[#667085] transition hover:bg-white hover:text-[#344054]"
              >
                展开
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}