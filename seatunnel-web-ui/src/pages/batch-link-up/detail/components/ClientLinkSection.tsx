import { PlusOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import {
  getStatusTag,
  mockBridgeClients,
  mockSourceClients,
  mockTargetClients,
} from "../constants";
import { generateDataSourceOptions } from "../../DataSourceSelect";

interface Props {
  activeStep: "base" | "client";
  sourceType: any;
  targetType: any;
  sourceLabel: string;
  targetLabel: string;
  sourceClientId?: string;
  targetClientId?: string;
  bridgeClientIds: string[];
  setSourceClientId: (id?: string) => void;
  setTargetClientId: (id?: string) => void;
  setBridgeClientIds: (ids: string[]) => void;
  handleSourceChange: (value: string, option: any) => void;
  handleTargetChange: (value: string, option: any) => void;
  sectionRef?: React.RefObject<HTMLDivElement>;
}

const ClientLinkSection: React.FC<Props> = ({
  activeStep,
  sourceType,
  targetType,
  sourceLabel,
  targetLabel,
  sourceClientId,
  targetClientId,
  bridgeClientIds,
  setSourceClientId,
  setTargetClientId,
  setBridgeClientIds,
  handleSourceChange,
  handleTargetChange,
  sectionRef,
}) => {
  return (
    <div ref={sectionRef} className="px-8 py-7">
      {/* 这里保留你原来的大部分 JSX */}
      {/* 后面如果你愿意，我建议再拆成 SourceClientPanel / BridgePanel / TargetClientPanel */}
      <div className="mb-6">
        <div className="text-[18px] font-semibold text-[#101828]">
          客户端链接配置
        </div>
        <div className="mt-1 text-[14px] leading-6 text-[#667085]">
          为来源端与目标端选择可用客户端，并配置中间执行链路。
        </div>
      </div>

      <div
        className={[
          "mb-6 flex items-center justify-center gap-3 overflow-x-auto rounded-2xl border px-6 py-4 text-sm transition-all duration-200",
          activeStep === "client"
            ? "border-[#B2DDFF] bg-[#F8FBFF] text-[#175CD3]"
            : "border-[#EAECF0] bg-[#FCFCFD] text-[#475467]",
        ].join(" ")}
      >
        <div className="whitespace-nowrap font-medium text-[#101828]">数据来源</div>
        <div className="text-[#98A2B3]">○ - - - - -</div>
        <div className="whitespace-nowrap rounded-full bg-[#F9FAFB] px-3 py-1 text-[#667085]">
          {sourceClientId
            ? mockSourceClients.find((item) => item.id === sourceClientId)?.name
            : "未选择"}
        </div>
        <div className="text-[#98A2B3]">→</div>
        <div className="whitespace-nowrap font-medium text-[#101828]">客户端链路</div>
        <div className="text-[#98A2B3]">○ - - - - -</div>
        <div className="whitespace-nowrap rounded-full bg-[#F9FAFB] px-3 py-1 text-[#667085]">
          {bridgeClientIds.length > 0 ? `${bridgeClientIds.length} 个客户端` : "未选择"}
        </div>
        <div className="text-[#98A2B3]">→</div>
        <div className="whitespace-nowrap font-medium text-[#101828]">数据去向</div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* 左 */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#1570EF]" />
              <div className="text-[15px] font-semibold text-[#101828]">来源客户端</div>
            </div>
            <div className="text-xs text-[#667085]">{sourceLabel}</div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <div className="mb-2 text-[13px] text-[#344054]">客户端类型</div>
              <Select
                value={sourceType?.dbType}
                onChange={handleSourceChange}
                options={generateDataSourceOptions()}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] text-[#344054]">客户端名称</div>
              <Select
                value={sourceClientId}
                onChange={setSourceClientId}
                className="w-full"
                placeholder="请选择来源客户端"
                options={mockSourceClients.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </div>

            {sourceClientId ? (
              <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#475467]">
                当前来源客户端：
                <span className="ml-1 font-medium text-[#101828]">
                  {mockSourceClients.find((item) => item.id === sourceClientId)?.name}
                </span>
                <span className="ml-2">
                  {getStatusTag(
                    mockSourceClients.find((item) => item.id === sourceClientId)?.status
                  )}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 py-3 text-[13px] text-[#667085]">
                请选择一个可用于读取数据的来源客户端。
              </div>
            )}

            <Button block className="!h-10 !rounded-xl">
              测试连通性
            </Button>
          </div>
        </div>

        {/* 中 */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#7F56D9]" />
              <div className="text-[15px] font-semibold text-[#101828]">客户端链路</div>
            </div>
            <div className="text-xs text-[#667085]">执行链路配置</div>
          </div>

          <div className="space-y-4 p-5">
            <Select
              mode="multiple"
              value={bridgeClientIds}
              onChange={setBridgeClientIds}
              className="w-full"
              placeholder="请选择一个或多个执行客户端"
              options={mockBridgeClients.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />

            <div className="min-h-[172px] rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-4">
              {bridgeClientIds.length > 0 ? (
                <div className="space-y-3">
                  {bridgeClientIds.map((id) => {
                    const client = mockBridgeClients.find((item) => item.id === id);
                    if (!client) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-xl border border-[#EAECF0] bg-white px-4 py-3"
                      >
                        <div>
                          <div className="text-[14px] font-medium text-[#101828]">
                            {client.name}
                          </div>
                          <div className="mt-1 text-xs text-[#667085]">{client.type}</div>
                        </div>
                        <div>{getStatusTag(client.status)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-[#98A2B3]">
                  暂未选择执行客户端
                </div>
              )}
            </div>

            <Button
              type="primary"
              block
              icon={<PlusOutlined />}
              className="!h-10 !rounded-xl"
            >
              新增客户端
            </Button>
          </div>
        </div>

        {/* 右 */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-[#F79009]" />
              <div className="text-[15px] font-semibold text-[#101828]">目标客户端</div>
            </div>
            <div className="text-xs text-[#667085]">{targetLabel}</div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <div className="mb-2 text-[13px] text-[#344054]">客户端类型</div>
              <Select
                value={targetType?.dbType}
                onChange={handleTargetChange}
                options={generateDataSourceOptions()}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] text-[#344054]">客户端名称</div>
              <Select
                value={targetClientId}
                onChange={setTargetClientId}
                className="w-full"
                placeholder="请选择目标客户端"
                options={mockTargetClients.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </div>

            {targetClientId ? (
              <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#475467]">
                当前目标客户端：
                <span className="ml-1 font-medium text-[#101828]">
                  {mockTargetClients.find((item) => item.id === targetClientId)?.name}
                </span>
                <span className="ml-2">
                  {getStatusTag(
                    mockTargetClients.find((item) => item.id === targetClientId)?.status
                  )}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 py-3 text-[13px] text-[#667085]">
                请选择一个可用于写入数据的目标客户端。
              </div>
            )}

            <Button block className="!h-10 !rounded-xl">
              测试连通性
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLinkSection;