import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Select, Tag } from "antd";
import React, { useMemo, useState } from "react";
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

type ConnectivityStatus = "idle" | "loading" | "success" | "error";

const mockSourceDataSources = [
  { id: "src-1", name: "influxdb_prod_east", status: "ready" },
  { id: "src-2", name: "influxdb_metrics_cn", status: "ready" },
  { id: "src-3", name: "influxdb_backup_old", status: "offline" },
];

const mockTargetDataSources = [
  { id: "tar-1", name: "clickhouse_dw_prod", status: "ready" },
  { id: "tar-2", name: "clickhouse_ods_dev", status: "ready" },
  { id: "tar-3", name: "clickhouse_archive", status: "offline" },
];

const statusConfig: Record<
  ConnectivityStatus,
  {
    text: string;
    wrapper: string;
    textClass: string;
    icon: React.ReactNode;
  }
> = {
  idle: {
    text: "未测试",
    wrapper: "border border-dashed border-[#D0D5DD] bg-[#FCFCFD]",
    textClass: "text-[#667085]",
    icon: <div className="h-2.5 w-2.5 rounded-full bg-[#D0D5DD]" />,
  },
  loading: {
    text: "测试中",
    wrapper: "border border-[#B2DDFF] bg-[#F8FBFF]",
    textClass: "text-[#175CD3]",
    icon: <LoadingOutlined className="text-[#175CD3]" />,
  },
  success: {
    text: "测试通过",
    wrapper: "border border-[#ABEFC6] bg-[#ECFDF3]",
    textClass: "text-[#067647]",
    icon: <CheckCircleOutlined className="text-[#17B26A]" />,
  },
  error: {
    text: "测试失败",
    wrapper: "border border-[#FECDCA] bg-[#FEF3F2]",
    textClass: "text-[#B42318]",
    icon: <CloseCircleOutlined className="text-[#F04438]" />,
  },
};

const StatusPill: React.FC<{
  label: string;
  status: ConnectivityStatus;
}> = ({ label, status }) => {
  const config = statusConfig[status];
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium",
        config.wrapper,
      ].join(" ")}
    >
      {config.icon}
      <span className={config.textClass}>
        {label}：{config.text}
      </span>
    </div>
  );
};

const SectionTitle: React.FC<{
  color: string;
  title: string;
  extra?: React.ReactNode;
}> = ({ color, title, extra }) => {
  return (
    <div className="flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full" style={{ backgroundColor: color }} />
        <div className="text-[15px] font-semibold text-[#101828]">{title}</div>
      </div>
      {extra}
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value?: React.ReactNode;
}> = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-[#F9FAFB] px-4 py-3">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="mt-1 text-[14px] font-medium text-[#101828]">{value || "--"}</div>
    </div>
  );
};

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
  const [sourceDataSourceId, setSourceDataSourceId] = useState<string>();
  const [targetDataSourceId, setTargetDataSourceId] = useState<string>();

  const [sourceTestStatus, setSourceTestStatus] = useState<ConnectivityStatus>("idle");
  const [targetTestStatus, setTargetTestStatus] = useState<ConnectivityStatus>("idle");
  const [sourceTestMessage, setSourceTestMessage] = useState("请选择来源数据源与 Zeta 执行引擎后发起测试");
  const [targetTestMessage, setTargetTestMessage] = useState("请选择目标数据源与 Zeta 执行引擎后发起测试");
  const [sourceTestDuration, setSourceTestDuration] = useState<number | null>(null);
  const [targetTestDuration, setTargetTestDuration] = useState<number | null>(null);

  const selectedSourceClient = useMemo(
    () => mockSourceClients.find((item) => item.id === sourceClientId),
    [sourceClientId]
  );

  const selectedTargetClient = useMemo(
    () => mockTargetClients.find((item) => item.id === targetClientId),
    [targetClientId]
  );

  const selectedSourceDataSource = useMemo(
    () => mockSourceDataSources.find((item) => item.id === sourceDataSourceId),
    [sourceDataSourceId]
  );

  const selectedTargetDataSource = useMemo(
    () => mockTargetDataSources.find((item) => item.id === targetDataSourceId),
    [targetDataSourceId]
  );

  const selectedZetaClients = useMemo(
    () =>
      bridgeClientIds
        .map((id) => mockBridgeClients.find((item) => item.id === id))
        .filter(Boolean),
    [bridgeClientIds]
  );

  const zetaPrimary = selectedZetaClients[0];
  const zetaReady = selectedZetaClients.length > 0;
  const zetaAllHealthy = selectedZetaClients.every((item: any) => item?.status !== "offline");

  const runSourceConnectivityTest = () => {
    if (!sourceDataSourceId) {
      setSourceTestStatus("error");
      setSourceTestDuration(null);
      setSourceTestMessage("请先选择来源数据源");
      return;
    }

    if (!zetaReady) {
      setSourceTestStatus("error");
      setSourceTestDuration(null);
      setSourceTestMessage("请先选择 Zeta 执行引擎");
      return;
    }

    setSourceTestStatus("loading");
    setSourceTestDuration(null);
    setSourceTestMessage("Zeta 正在验证对来源端数据源的访问能力...");

    const start = Date.now();

    setTimeout(() => {
      const duration = Date.now() - start;

      if (!zetaAllHealthy) {
        setSourceTestStatus("error");
        setSourceTestDuration(duration);
        setSourceTestMessage("测试失败：当前 Zeta 执行引擎不在线，无法探测来源端");
        return;
      }

      if (selectedSourceDataSource?.status === "offline") {
        setSourceTestStatus("error");
        setSourceTestDuration(duration);
        setSourceTestMessage("测试失败：来源数据源当前不可达或未响应");
        return;
      }

      setSourceTestStatus("success");
      setSourceTestDuration(duration);
      setSourceTestMessage("测试通过：Zeta 可以正常访问来源数据源");
    }, 900);
  };

  const runTargetConnectivityTest = () => {
    if (!targetDataSourceId) {
      setTargetTestStatus("error");
      setTargetTestDuration(null);
      setTargetTestMessage("请先选择目标数据源");
      return;
    }

    if (!zetaReady) {
      setTargetTestStatus("error");
      setTargetTestDuration(null);
      setTargetTestMessage("请先选择 Zeta 执行引擎");
      return;
    }

    setTargetTestStatus("loading");
    setTargetTestDuration(null);
    setTargetTestMessage("Zeta 正在验证对目标端数据源的访问能力...");

    const start = Date.now();

    setTimeout(() => {
      const duration = Date.now() - start;

      if (!zetaAllHealthy) {
        setTargetTestStatus("error");
        setTargetTestDuration(duration);
        setTargetTestMessage("测试失败：当前 Zeta 执行引擎不在线，无法探测目标端");
        return;
      }

      if (selectedTargetDataSource?.status === "offline") {
        setTargetTestStatus("error");
        setTargetTestDuration(duration);
        setTargetTestMessage("测试失败：目标数据源当前不可达或未响应");
        return;
      }

      setTargetTestStatus("success");
      setTargetTestDuration(duration);
      setTargetTestMessage("测试通过：Zeta 可以正常访问目标数据源");
    }, 900);
  };

  const runAllTests = () => {
    runSourceConnectivityTest();
    runTargetConnectivityTest();
  };

  const canSubmit =
    sourceTestStatus === "success" &&
    targetTestStatus === "success" &&
    zetaReady &&
    zetaAllHealthy;

  return (
    <div ref={sectionRef} className="px-8 py-7">
      <div className="mb-6 rounded-[28px] border border-[#E4E7EC] bg-[linear-gradient(135deg,#F8FAFC_0%,#FFFFFF_45%,#F5F8FF_100%)] px-6 py-6">
        <div className="text-[20px] font-semibold text-[#101828]">
          执行环境连通性校验
        </div>
        <div className="mt-2 max-w-4xl text-[14px] leading-6 text-[#667085]">
          在提交任务到 Zeta 执行引擎前，先验证它是否能够正常访问来源端与目标端数据源。
          只有双端测试都通过，任务才建议继续提交。
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <StatusPill label="来源访问" status={sourceTestStatus} />
          <StatusPill label="目标访问" status={targetTestStatus} />
          <StatusPill
            label="任务提交"
            status={canSubmit ? "success" : activeStep === "client" ? "idle" : "idle"}
          />
        </div>
      </div>

      <div
        className={[
          "mb-6 flex items-center justify-center gap-3 overflow-x-auto rounded-2xl border px-6 py-4 text-sm transition-all duration-200",
          activeStep === "client"
            ? "border-[#B2DDFF] bg-[#F8FBFF]"
            : "border-[#EAECF0] bg-[#FCFCFD]",
        ].join(" ")}
      >
        <div className="whitespace-nowrap font-medium text-[#101828]">来源数据源</div>
        <div className="text-[#98A2B3]">○ - - - - -</div>

        <div className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[#667085] ring-1 ring-[#EAECF0]">
          {sourceTestStatus === "success"
            ? "已通过"
            : sourceTestStatus === "error"
            ? "失败"
            : sourceTestStatus === "loading"
            ? "测试中"
            : "未测试"}
        </div>

        <div className="text-[#98A2B3]">→</div>

        <div className="whitespace-nowrap font-medium text-[#101828]">Zeta 执行引擎</div>
        <div className="text-[#98A2B3]">○ - - - - -</div>

        <div className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[#667085] ring-1 ring-[#EAECF0]">
          {zetaReady ? `${bridgeClientIds.length} 个引擎节点` : "未选择"}
        </div>

        <div className="text-[#98A2B3]">→</div>

        <div className="whitespace-nowrap font-medium text-[#101828]">目标数据源</div>

        <div className="ml-3 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[#667085] ring-1 ring-[#EAECF0]">
          {targetTestStatus === "success"
            ? "已通过"
            : targetTestStatus === "error"
            ? "失败"
            : targetTestStatus === "loading"
            ? "测试中"
            : "未测试"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* 左：来源数据源 */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white">
          <SectionTitle
            color="#1570EF"
            title="来源数据源"
            extra={<div className="text-xs text-[#667085]">{sourceLabel}</div>}
          />

          <div className="space-y-4 p-5">
            <div>
              <div className="mb-2 text-[13px] text-[#344054]">数据源类型</div>
              <Select
                value={sourceType?.dbType}
                onChange={handleSourceChange}
                options={generateDataSourceOptions()}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] text-[#344054]">数据源名称</div>
              <Select
                value={sourceDataSourceId}
                onChange={setSourceDataSourceId}
                className="w-full"
                placeholder="请选择来源数据源"
                options={mockSourceDataSources.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </div>

            <InfoRow label="当前来源客户端" value={selectedSourceClient?.name || "未选择"} />

            {sourceDataSourceId ? (
              <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#475467]">
                当前来源数据源：
                <span className="ml-1 font-medium text-[#101828]">
                  {selectedSourceDataSource?.name}
                </span>
                <span className="ml-2">
                  {selectedSourceDataSource?.status === "offline" ? (
                    <Tag color="error" className="!m-0">离线</Tag>
                  ) : (
                    <Tag color="success" className="!m-0">可用</Tag>
                  )}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 py-3 text-[13px] text-[#667085]">
                请选择一个需要被 Zeta 访问的来源数据源。
              </div>
            )}

            <div className={`rounded-xl px-4 py-3 text-[13px] ${statusConfig[sourceTestStatus].wrapper}`}>
              <div className={`font-medium ${statusConfig[sourceTestStatus].textClass}`}>
                来源访问结果
                {sourceTestDuration !== null ? ` · ${sourceTestDuration} ms` : ""}
              </div>
              <div className={`mt-1 leading-6 ${statusConfig[sourceTestStatus].textClass}`}>
                {sourceTestMessage}
              </div>
            </div>

            <Button
              block
              type="primary"
              className="!h-10 !rounded-xl"
              loading={sourceTestStatus === "loading"}
              onClick={runSourceConnectivityTest}
            >
              测试 Zeta 到来源端
            </Button>
          </div>
        </div>

        {/* 中：Zeta 执行引擎 */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white">
          <SectionTitle
            color="#7F56D9"
            title="Zeta 执行引擎"
            extra={<div className="text-xs text-[#667085]">任务执行主体</div>}
          />

          <div className="space-y-4 p-5">
            <div>
              <div className="mb-2 text-[13px] text-[#344054]">执行引擎 / 资源组</div>
              <Select
                mode="multiple"
                value={bridgeClientIds}
                onChange={setBridgeClientIds}
                className="w-full"
                placeholder="请选择一个或多个 Zeta 节点"
                options={mockBridgeClients.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <InfoRow
                label="主执行节点"
                value={
                  zetaPrimary ? (
                    <div className="flex items-center gap-2">
                      <span>{zetaPrimary.name}</span>
                      <span>{getStatusTag(zetaPrimary.status)}</span>
                    </div>
                  ) : (
                    "未选择"
                  )
                }
              />
              <InfoRow label="已选节点数" value={zetaReady ? `${bridgeClientIds.length} 个` : "0 个"} />
            </div>

            <div className="min-h-[172px] rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-4">
              {selectedZetaClients.length > 0 ? (
                <div className="space-y-3">
                  {selectedZetaClients.map((client: any) => (
                    <div
                      key={client.id}
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
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-[#98A2B3]">
                  暂未选择 Zeta 执行引擎
                </div>
              )}
            </div>

            <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#475467]">
              <div className="font-medium text-[#101828]">执行结果判断</div>
              <div className="mt-1 leading-6">
                Zeta 是本页的执行主体。它需要分别验证自己对来源端和目标端的数据访问能力，双端通过后才建议提交任务。
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="primary"
                block
                className="!h-10 !rounded-xl"
                onClick={runAllTests}
                loading={
                  sourceTestStatus === "loading" || targetTestStatus === "loading"
                }
              >
                一键测试双端
              </Button>

              <Button
                icon={<PlusOutlined />}
                className="!h-10 !rounded-xl"
              >
                新增节点
              </Button>
            </div>
          </div>
        </div>

        {/* 右：目标数据源 */}
        <div className="rounded-2xl border border-[#E4E7EC] bg-white">
          <SectionTitle
            color="#F79009"
            title="目标数据源"
            extra={<div className="text-xs text-[#667085]">{targetLabel}</div>}
          />

          <div className="space-y-4 p-5">
            <div>
              <div className="mb-2 text-[13px] text-[#344054]">数据源类型</div>
              <Select
                value={targetType?.dbType}
                onChange={handleTargetChange}
                options={generateDataSourceOptions()}
                className="w-full"
              />
            </div>

            <div>
              <div className="mb-2 text-[13px] text-[#344054]">数据源名称</div>
              <Select
                value={targetDataSourceId}
                onChange={setTargetDataSourceId}
                className="w-full"
                placeholder="请选择目标数据源"
                options={mockTargetDataSources.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </div>

            <InfoRow label="当前目标客户端" value={selectedTargetClient?.name || "未选择"} />

            {targetDataSourceId ? (
              <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#475467]">
                当前目标数据源：
                <span className="ml-1 font-medium text-[#101828]">
                  {selectedTargetDataSource?.name}
                </span>
                <span className="ml-2">
                  {selectedTargetDataSource?.status === "offline" ? (
                    <Tag color="error" className="!m-0">离线</Tag>
                  ) : (
                    <Tag color="success" className="!m-0">可用</Tag>
                  )}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 py-3 text-[13px] text-[#667085]">
                请选择一个需要被 Zeta 写入的目标数据源。
              </div>
            )}

            <div className={`rounded-xl px-4 py-3 text-[13px] ${statusConfig[targetTestStatus].wrapper}`}>
              <div className={`font-medium ${statusConfig[targetTestStatus].textClass}`}>
                目标访问结果
                {targetTestDuration !== null ? ` · ${targetTestDuration} ms` : ""}
              </div>
              <div className={`mt-1 leading-6 ${statusConfig[targetTestStatus].textClass}`}>
                {targetTestMessage}
              </div>
            </div>

            <Button
              block
              type="primary"
              className="!h-10 !rounded-xl"
              loading={targetTestStatus === "loading"}
              onClick={runTargetConnectivityTest}
            >
              测试 Zeta 到目标端
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E4E7EC] bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4 max-[1100px]:flex-col max-[1100px]:items-start">
          <div>
            <div className="text-[15px] font-semibold text-[#101828]">提交前校验结果</div>
            <div className="mt-1 text-[13px] leading-6 text-[#667085]">
              当 Zeta 对来源端和目标端的访问都测试通过后，说明当前执行环境具备提交任务的基本条件。
            </div>
          </div>

          <div
            className={[
              "rounded-full px-4 py-2 text-[13px] font-medium",
              canSubmit
                ? "bg-[#ECFDF3] text-[#067647] ring-1 ring-[#ABEFC6]"
                : "bg-[#F9FAFB] text-[#667085] ring-1 ring-[#EAECF0]",
            ].join(" ")}
          >
            {canSubmit ? "可以提交任务" : "暂不可提交"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLinkSection;