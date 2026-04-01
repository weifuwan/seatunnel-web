import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Form, Select } from "antd";
import React, { useMemo, useState } from "react";
import { generateDataSourceOptions } from "../../DataSourceSelect";
import { mockBridgeClients } from "../constants";
import "./client-link.less";

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

const statusMap: Record<
  ConnectivityStatus,
  {
    text: string;
    dot: string;
    textClass: string;
    bgClass: string;
    icon?: React.ReactNode;
  }
> = {
  idle: {
    text: "未测试",
    dot: "bg-slate-300",
    textClass: "text-slate-500",
    bgClass: "bg-slate-50",
  },
  loading: {
    text: "测试中",
    dot: "bg-blue-500",
    textClass: "text-blue-600",
    bgClass: "bg-blue-50",
    icon: <LoadingOutlined spin />,
  },
  success: {
    text: "已通过",
    dot: "bg-emerald-500",
    textClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    icon: <CheckCircleOutlined />,
  },
  error: {
    text: "失败",
    dot: "bg-rose-500",
    textClass: "text-rose-600",
    bgClass: "bg-rose-50",
    icon: <CloseCircleOutlined />,
  },
};

const SimpleStatus: React.FC<{ status: ConnectivityStatus }> = ({ status }) => {
  const config = statusMap[status];
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
        config.bgClass,
        config.textClass,
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", config.dot].join(" ")} />
      <span>{config.text}</span>
    </div>
  );
};

const LinkStatusAction: React.FC<{
  status: ConnectivityStatus;
  onTest?: () => void;
  reverse?: boolean;
}> = ({ status, onTest, reverse = false }) => {
  const config = statusMap[status];

  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm",
        reverse ? "flex-row-reverse" : "",
      ].join(" ")}
    >
      <Button
        type="text"
        size="small"
        className="!h-7 !rounded-full !px-3 !text-slate-700 hover:!bg-slate-100"
        onClick={onTest}
        loading={status === "loading"}
      >
        测试
      </Button>

      <div
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          config.bgClass,
          config.textClass,
        ].join(" ")}
      >
        <span className={["h-2 w-2 rounded-full", config.dot].join(" ")} />
        <span>{config.text}</span>
      </div>
    </div>
  );
};

const SectionCard: React.FC<{
  title: string;
  status?: ConnectivityStatus;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, status, headerExtra, children, footer }) => {
  return (
    <section className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {status ? <SimpleStatus status={status} /> : null}
        </div>
        {headerExtra}
      </div>

      <div
        className="flex flex-col px-4 py-4"
        style={{ minHeight: 320, height: 320 }}
      >
        <div className="flex-1">{children}</div>
        {footer ? <div className="pt-4">{footer}</div> : null}
      </div>
    </section>
  );
};

const ClientLinkSection: React.FC<Props> = ({
  sourceLabel,
  targetLabel,
  bridgeClientIds,
  setBridgeClientIds,
  sectionRef,
}) => {
  const [form] = Form.useForm();

  const [sourceDataSourceType, setSourceDataSourceType] = useState<string>();
  const [sourceDataSourceId, setSourceDataSourceId] = useState<string>();

  const [targetDataSourceType, setTargetDataSourceType] = useState<string>();
  const [targetDataSourceId, setTargetDataSourceId] = useState<string>();

  const [sourceTestStatus, setSourceTestStatus] =
    useState<ConnectivityStatus>("idle");
  const [targetTestStatus, setTargetTestStatus] =
    useState<ConnectivityStatus>("idle");

  const sourceOptions = useMemo(
    () =>
      mockSourceDataSources.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [],
  );

  const targetOptions = useMemo(
    () =>
      mockTargetDataSources.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [],
  );

  const runMockTest = async (
    type: "source" | "target",
    selectedId?: string,
  ) => {
    if (!selectedId) return;

    if (type === "source") {
      setSourceTestStatus("loading");
    } else {
      setTargetTestStatus("loading");
    }

    setTimeout(() => {
      const success = !selectedId.endsWith("3");
      if (type === "source") {
        setSourceTestStatus(success ? "success" : "error");
      } else {
        setTargetTestStatus(success ? "success" : "error");
      }
    }, 1000);
  };

  return (
    <div ref={sectionRef} className="bg-white px-8 py-8">
      <div className="mx-auto space-y-6">
        {/* 顶部链路 */}
        <div className="rounded-[28px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
            <div className="flex min-w-0 flex-1 items-center justify-center gap-4">
              <span className="shrink-0 font-medium text-slate-900">
                {sourceLabel || "数据来源"}
              </span>

              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-slate-300" />
                <LinkStatusAction
                  status={sourceTestStatus}
                  onTest={() => runMockTest("source", sourceDataSourceId)}
                />
                <div className="h-px w-10 bg-slate-300" />
              </div>

              <span className="shrink-0 font-medium text-slate-900">
                我的客户端
              </span>

              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-slate-300" />
                <LinkStatusAction
                  status={targetTestStatus}
                  onTest={() => runMockTest("target", targetDataSourceId)}
                  reverse
                />
                <div className="h-px w-10 bg-slate-300" />
              </div>

              <span className="shrink-0 font-medium text-slate-900">
                {targetLabel || "数据去向"}
              </span>
            </div>
          </div>
        </div>

        {/* 三列内容 */}
        <div className="flex gap-6">
          {/* 来源 */}
          <SectionCard
            title="来源"
            status={sourceTestStatus}
            footer={
              <Button
                className="w-full !rounded-full"
                onClick={() => runMockTest("source", sourceDataSourceId)}
                loading={sourceTestStatus === "loading"}
              >
                测试连通性
              </Button>
            }
          >
            <Form form={form} layout="vertical">
              <div className="space-y-4">
                <Form.Item name="sourceType" label="数据源类型" required>
                  <Select
                    value={sourceDataSourceType}
                    onChange={setSourceDataSourceType}
                    className="w-full"
                    showSearch
                    placeholder="请选择来源类型"
                    options={generateDataSourceOptions()}
                  />
                </Form.Item>

                <Form.Item name="sourceId" label="数据源名称" required>
                  <Select
                    value={sourceDataSourceId}
                    onChange={(value) => {
                      setSourceDataSourceId(value);
                      setSourceTestStatus("idle");
                    }}
                    className="w-full"
                    placeholder="请选择来源数据源"
                    options={sourceOptions}
                  />
                </Form.Item>
              </div>
            </Form>
          </SectionCard>

          {/* 客户端 / 客户端 */}
          <SectionCard
            title="客户端"
            footer={<Button className="w-full !rounded-full">新建客户端</Button>}
          >
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">
                  客户端节点
                </div>
                <Select
                  value={bridgeClientIds}
                  onChange={setBridgeClientIds}
                  className="w-full"
                  showSearch
                  placeholder="请选择客户端节点"
                  options={mockBridgeClients.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                />
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-sm font-medium text-slate-800">
                  当前已选择 {bridgeClientIds.length} 个节点
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  任务会提交到所选客户端节点执行，用于连通性验证与实际运行。
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 去向 */}
          <SectionCard
            title="去向"
            status={targetTestStatus}
            footer={
              <Button
                className="w-full !rounded-full"
                onClick={() => runMockTest("target", targetDataSourceId)}
                loading={targetTestStatus === "loading"}
              >
                测试连通性
              </Button>
            }
          >
            <Form form={form} layout="vertical">
              <div className="space-y-4">
                <Form.Item name="targetType" label="数据去向类型" required>
                  <Select
                    value={targetDataSourceType}
                    onChange={setTargetDataSourceType}
                    className="w-full"
                    showSearch
                    placeholder="请选择去向类型"
                    options={generateDataSourceOptions()}
                  />
                </Form.Item>

                <Form.Item name="targetId" label="数据源名称" required>
                  <Select
                    value={targetDataSourceId}
                    onChange={(value) => {
                      setTargetDataSourceId(value);
                      setTargetTestStatus("idle");
                    }}
                    className="w-full"
                    placeholder="请选择目标数据源"
                    options={targetOptions}
                  />
                </Form.Item>
              </div>
            </Form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default ClientLinkSection;