import {
  CloudServerOutlined,
  EnvironmentOutlined,
  HddOutlined,
  LinkOutlined,
  PlusOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import { Form, Input, message, Progress } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { seatunnelClientApi } from "./api";
import AddClientModal from "./components/AddClientModal";
import { useClientMonitoring } from "./hooks/useClientMonitoring";

const { TextArea } = Input;
const MotionDiv = motion.div;

const contentSwapVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const formatPercent = (value?: number | string) => {
  if (value === undefined || value === null || value === "") return "--";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `${Math.round(n)}%`;
};

const getSafeNumber = (value?: number | string) => {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const getHealthMeta = (health?: { level?: string; label?: string }) => {
  switch (health?.level) {
    case "healthy":
      return {
        dot: "bg-emerald-500",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        label: health?.label || "Healthy",
      };
    case "warning":
      return {
        dot: "bg-amber-500",
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        label: health?.label || "Warning",
      };
    default:
      return {
        dot: "bg-rose-500",
        badge: "border-rose-200 bg-rose-50 text-rose-700",
        label: health?.label || "Critical",
      };
  }
};

const ClientPageTailwind: React.FC = () => {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    reloadClients,
  } = useClientMonitoring();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [form] = Form.useForm();

  // const healthMeta = useMemo(() => getHealthMeta(health), [health]);

  const handleCreateClient = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      const res = await seatunnelClientApi.saveOrUpdate(values);

      if (res.code !== 0) {
        message.error(res.msg || "创建 Client 失败");
        return;
      }

      message.success("Client 创建成功");
      setOpenAddModal(false);
      form.resetFields();
      await reloadClients();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || "创建 Client 失败");
    } finally {
      setConfirmLoading(false);
    }
  };

  const quickStats = [
    {
      key: "memoryUsage",
      label: "Memory Usage",
      value: 45.7,
      type: "progress",
      desc: "节点整体内存使用情况",
      icon: <HddOutlined />,
    },
    {
      key: "heapUsage",
      label: "Heap Usage",
      value: 12,

      type: "progress",
      desc: "JVM Heap 当前使用比例",
      icon: <RadarChartOutlined />,
    },
    {
      key: "version",
      label: "Version",
      value: "2.3.12",
      type: "text",
      desc: "当前接入 Client 版本",
      icon: <CloudServerOutlined />,
    },
    {
      key: "region",
      label: "Region",
      value: "cn-hangzhou",
      type: "text",
      desc: "当前节点所在区域",
      icon: <EnvironmentOutlined />,
    },
  ];

  return (
    <div className="h-full bg-[#FFFFFF] px-6 py-6">
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[1480px] flex-col gap-5 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[22px] text-[#4f46e5]">
                <CloudServerOutlined />
              </div>
              <div>
                <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[#172033]">
                  Client
                </h1>
                <p className="mt-1 text-[14px] leading-7 text-[#667085]">
                  连接 Zeta
                  集群，查看当前节点的基础状态，不把辅助能力做成另一个监控系统。
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpenAddModal(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#4f5bd5] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(79,91,213,0.22)] transition hover:opacity-95"
          >
            <PlusOutlined />
            新建Client
          </button>
        </div>

        <div className="rounded-[24px] border border-[#e9edf3] bg-white px-4 py-3 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
          <div className="flex gap-3 overflow-x-auto">
            {(clients || []).map((client: any) => {
              const active = client.id === selectedClientId;
              const itemHealth = getHealthMeta(
                client.health || { level: "healthy" }
              );

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={[
                    "group inline-flex min-w-[220px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                    active
                      ? "border-[#dbe4ff] bg-[#f6f8ff] shadow-[0_6px_16px_rgba(46,91,255,0.08)]"
                      : "border-[#edf1f5] bg-white hover:border-[#d9e1ea] hover:bg-[#fafcff]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[16px]",
                      active
                        ? "bg-[#e9efff] text-[#355cff]"
                        : "bg-[#f3f4f6] text-[#667085]",
                    ].join(" ")}
                  >
                    <LinkOutlined />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-[#172033]">
                      {client.name}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[12px] text-[#8a94a6]">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${itemHealth.dot}`}
                      />
                      <span>{client.region || "Unknown region"}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {!clients?.length ? (
              <div className="flex min-w-[280px] items-center rounded-2xl border border-dashed border-[#d8dee6] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#6b7280]">
                还没有 Client，先新增一个 URL。
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-[28px] border border-[#e9edf3] bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
          {!selectedClient ? (
            <div className="flex h-full min-h-[420px] items-center justify-center">
              <div className="max-w-[420px] text-center">
                <div className="text-[28px] font-bold tracking-[-0.03em] text-[#172033]">
                  选择一个 Client
                </div>
                <div className="mt-3 text-[14px] leading-8 text-[#667085]">
                  这里展示与同步可用性相关的基础状态，不做成复杂的监控大盘。
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <MotionDiv
                key={selectedClientId}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentSwapVariants}
                className="min-h-full"
              >
                <div className="space-y-5">
                  <div className="rounded-[28px] border border-[#e9edf3] bg-[linear-gradient(180deg,#fbfcff_0%,#f8fafc_100%)] p-6">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div className="min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[22px] text-[#4f46e5]">
                            <CloudServerOutlined />
                          </div>

                          <div className="min-w-0">
                            <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#172033]">
                              {selectedClient?.name || "Prod Cluster A"}
                            </h2>
                            <p className="mt-2 max-w-[840px] text-[14px] leading-7 text-[#667085]">
                              当前节点运行概览。这里仅保留与同步可用性最相关的基础状态，避免让辅助模块抢走主流程的注意力。
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#e9edf3] bg-white px-4 py-2 text-[13px] text-[#475467]">
                            <LinkOutlined />
                            <span>
                              {selectedClient?.url ||
                                "https://zeta.cluster.local"}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-2 rounded-full border border-[#e9edf3] bg-white px-4 py-2 text-[13px] text-[#475467]">
                            <EnvironmentOutlined />
                            <span>
                              {selectedClient?.region || "cn-hangzhou"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* <div
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold ${healthMeta.badge}`}
                      > */}
                      {/* <span
                          className={`inline-block h-2 w-2 rounded-full ${healthMeta.dot}`}
                        /> */}
                      {/* {selectedClient?.statusText || healthMeta.label} */}
                      {/* </div> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                    {quickStats.map((item) => {
                      const progressValue = Math.max(
                        0,
                        Math.min(100, getSafeNumber(item.value))
                      );

                      return (
                        <div
                          key={item.key}
                          className="rounded-[22px] border border-[#e9edf3] bg-white p-5"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                              {item.label}
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f6fb] text-[16px] text-[#44546f]">
                              {item.icon}
                            </div>
                          </div>

                          {item.type === "progress" ? (
                            <>
                              <div className="mb-3 text-[28px] font-bold tracking-[-0.03em] text-[#172033]">
                                {formatPercent(item.value)}
                              </div>

                              <Progress
                                percent={progressValue}
                                showInfo={false}
                                strokeColor="#4f5bd5"
                                trailColor="#eef2f7"
                                size="small"
                              />

                              <div className="mt-3 text-[12px] leading-6 text-[#8a94a6]">
                                {item.desc}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="mb-3 break-words text-[28px] font-bold tracking-[-0.03em] text-[#172033]">
                                {item.value || "--"}
                              </div>

                              <div className="text-[12px] leading-6 text-[#8a94a6]">
                                {item.desc}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </MotionDiv>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AddClientModal
        open={openAddModal}
        form={form}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setOpenAddModal(false);
          form.resetFields();
        }}
        onSubmit={handleCreateClient}
      />
    </div>
  );
};

export default ClientPageTailwind;
