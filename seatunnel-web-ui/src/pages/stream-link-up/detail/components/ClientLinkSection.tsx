import { seatunnelClientApi } from "@/pages/client/api";
import AddClientModal from "@/pages/client/components/AddClientModal";
import AddOrEditDataSourceModal from "@/pages/data-source/components/AddOrEditDataSourceModal";
import { fetchDataSourceOptions } from "@/pages/data-source/service";
import {
  DataSourceModalRef,
  DataSourceOperateType,
} from "@/pages/data-source/types";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Form, message, Popover, Select } from "antd";
import { PlusCircleIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { generateCDCDataSourceOptions } from "@/pages/batch-link-up/DataSourceSelect";
import "./client-link.less";

export type ConnectivityStatus = "idle" | "loading" | "success" | "error";

interface Props {
  activeStep: "base" | "client";
  sourceType: any;
  targetType: any;
  sourceLabel: string;
  targetLabel: string;
  sourceClientId?: string;
  targetClientId?: string;
  clientId: any;
  setSourceClientId: (id?: string) => void;
  setTargetClientId: (id?: string) => void;
  setClientId: (ids: string) => void;
  handleSourceChange: (value: string, option: any) => void;
  handleTargetChange: (value: string, option: any) => void;

  sourceDataSourceId?: string;
  targetDataSourceId?: string;
  setSourceDataSourceId: (id?: string) => void;
  setTargetDataSourceId: (id?: string) => void;

  sourceTestStatus: ConnectivityStatus;
  targetTestStatus: ConnectivityStatus;
  setSourceTestStatus: (status: ConnectivityStatus) => void;
  setTargetTestStatus: (status: ConnectivityStatus) => void;

  sectionRef?: React.RefObject<HTMLDivElement>;
}

interface SelectOption {
  label: string;
  value: string;
}

interface VerifyItem {
  code?: string;
  name?: string;
  success?: boolean;
  actualValue?: string;
  expectedValue?: string;
  message?: string;
}

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

const VerifyItemsPopoverContent: React.FC<{ items?: VerifyItem[] }> = ({
  items = [],
}) => {
  if (!items.length) {
    return (
      <div className="w-[260px] rounded-2xl bg-white p-1">
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          暂无检查项详情，点击测试后可查看。
        </div>
      </div>
    );
  }

  const passedCount = items.filter((item) => item.success).length;

  return (
    <div className="w-[360px] max-w-[72vw]">
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            连通性检查详情
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            已通过 {passedCount}/{items.length} 项
          </div>
        </div>

        <div
          className={[
            "rounded-full px-2.5 py-1 text-xs font-medium",
            passedCount === items.length
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600",
          ].join(" ")}
        >
          {passedCount === items.length ? "全部通过" : "存在异常"}
        </div>
      </div>

      <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {items.map((item, index) => {
          const success = !!item.success;

          return (
            <div
              key={`${item.code || item.name || "verify-item"}-${index}`}
              className={[
                "rounded-2xl border px-3 py-2.5",
                success
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-rose-100 bg-rose-50/60",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                <span
                  className={[
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    success ? "bg-emerald-500" : "bg-rose-500",
                  ].join(" ")}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-xs font-semibold text-slate-800">
                      {item.name || "未命名检查项"}
                    </div>
                    <div
                      className={[
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        success
                          ? "bg-white text-emerald-600"
                          : "bg-white text-rose-600",
                      ].join(" ")}
                    >
                      {success ? "通过" : "失败"}
                    </div>
                  </div>

                  {item.message ? (
                    <div className="mt-1 text-xs leading-5 text-slate-600">
                      {item.message}
                    </div>
                  ) : null}

                  {(item.actualValue || item.expectedValue) && (
                    <div className="mt-2 grid gap-1 rounded-xl bg-white/70 px-2 py-2 text-[11px] text-slate-500">
                      {item.expectedValue ? (
                        <div className="flex gap-1">
                          <span className="shrink-0 text-slate-400">
                            期望：
                          </span>
                          <span className="break-all text-slate-600">
                            {item.expectedValue}
                          </span>
                        </div>
                      ) : null}

                      {item.actualValue ? (
                        <div className="flex gap-1">
                          <span className="shrink-0 text-slate-400">
                            实际：
                          </span>
                          <span className="break-all text-slate-600">
                            {item.actualValue}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SimpleStatus: React.FC<{
  status: ConnectivityStatus;
  items?: VerifyItem[];
}> = ({ status, items = [] }) => {
  const config = statusMap[status];
  const showPopover = status !== "idle" && items.length > 0;

  const content = (
    <div
      className={[
        "inline-flex cursor-default items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
        config.bgClass,
        config.textClass,
        showPopover ? "transition hover:shadow-sm" : "",
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", config.dot].join(" ")} />
      <span>{config.text}</span>

      {items.length > 0 ? (
        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px]">
          {items.length}项
        </span>
      ) : null}
    </div>
  );

  if (!showPopover) {
    return content;
  }

  return (
    <Popover
      trigger="hover"
      placement="right"
      content={<VerifyItemsPopoverContent items={items} />}
      overlayInnerStyle={{
        borderRadius: 18,
        padding: 12,
      }}
    >
      {content}
    </Popover>
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
        {config.icon ? (
          <span className="text-[12px]">{config.icon}</span>
        ) : null}
        <span>{config.text}</span>
      </div>
    </div>
  );
};

const SectionCard: React.FC<{
  title: string;
  status?: ConnectivityStatus;
  verifyItems?: VerifyItem[];
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, status, verifyItems, headerExtra, children, footer }) => {
  return (
    <section className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          {status ? <SimpleStatus status={status} items={verifyItems} /> : null}
        </div>
        {headerExtra}
      </div>

      <div className="flex h-[320px] flex-col px-4 py-4">
        <div className="flex-1">{children}</div>
        {footer ? <div className="pt-4">{footer}</div> : null}
      </div>
    </section>
  );
};

const normalizeClientOptions = (data: any[]): SelectOption[] => {
  return data.map((item: any) => ({
    label: item.label ?? item.clientName ?? item.name ?? "",
    value: String(item.value ?? item.id ?? ""),
  }));
};

const ClientLinkSection: React.FC<Props> = ({
  sourceType,
  targetType,
  sourceLabel,
  targetLabel,
  clientId,
  setClientId,
  handleSourceChange,
  handleTargetChange,
  sectionRef,

  sourceDataSourceId,
  targetDataSourceId,
  setSourceDataSourceId,
  setTargetDataSourceId,

  sourceTestStatus,
  targetTestStatus,
  setSourceTestStatus,
  setTargetTestStatus,
}) => {
  const [form] = Form.useForm();
  const [clientForm] = Form.useForm();

  const modalRef = useRef<DataSourceModalRef>(null);

  const dataSourceTypeOptions = useMemo(
    () => generateCDCDataSourceOptions(),
    []
  );

  const [sourceDataSources, setSourceDataSources] = useState<any[]>([]);
  const [targetDataSources, setTargetDataSources] = useState<any[]>([]);

  const [sourceLoading, setSourceLoading] = useState(false);
  const [targetLoading, setTargetLoading] = useState(false);

  const [sourceVerifyItems, setSourceVerifyItems] = useState<VerifyItem[]>([]);
  const [targetVerifyItems, setTargetVerifyItems] = useState<VerifyItem[]>([]);

  const [clientOptions, setClientOptions] = useState<SelectOption[]>([]);
  const [clientLoading, setClientLoading] = useState(false);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const resetSourceTestStatus = useCallback(() => {
    setSourceTestStatus("idle");
    setSourceVerifyItems([]);
  }, [setSourceTestStatus]);

  const resetTargetTestStatus = useCallback(() => {
    setTargetTestStatus("idle");
    setTargetVerifyItems([]);
  }, [setTargetTestStatus]);

  const loadClientOptions = useCallback(async () => {
    try {
      setClientLoading(true);

      const res = await seatunnelClientApi.option();

      const options = Array.isArray(res?.data)
        ? normalizeClientOptions(res.data)
        : [];

      setClientOptions(options);

      return options;
    } catch (error) {
      console.error("加载客户端节点失败:", error);
      setClientOptions([]);
      message.error("加载客户端节点失败");
      return [];
    } finally {
      setClientLoading(false);
    }
  }, []);

  const loadSourceOptions = useCallback(
    async (dbType?: string) => {
      if (!dbType) {
        setSourceDataSources([]);
        setSourceDataSourceId(undefined);
        form.setFieldValue("sourceId", undefined);
        return [];
      }

      try {
        setSourceLoading(true);
        const res = await fetchDataSourceOptions(dbType);
        const nextData = Array.isArray(res?.data) ? res.data : [];
        setSourceDataSources(nextData);
        return nextData;
      } catch (error) {
        console.error("加载来源数据源失败:", error);
        setSourceDataSources([]);
        message.error("加载来源数据源失败");
        return [];
      } finally {
        setSourceLoading(false);
      }
    },
    [form, setSourceDataSourceId]
  );

  const loadTargetOptions = useCallback(
    async (dbType?: string) => {
      if (!dbType) {
        setTargetDataSources([]);
        setTargetDataSourceId(undefined);
        form.setFieldValue("targetId", undefined);
        return [];
      }

      try {
        setTargetLoading(true);
        const res = await fetchDataSourceOptions(dbType);
        const nextData = Array.isArray(res?.data) ? res.data : [];
        setTargetDataSources(nextData);
        return nextData;
      } catch (error) {
        console.error("加载目标数据源失败:", error);
        setTargetDataSources([]);
        message.error("加载目标数据源失败");
        return [];
      } finally {
        setTargetLoading(false);
      }
    },
    [form, setTargetDataSourceId]
  );

  const handleCreateClient = async () => {
    try {
      const values = await clientForm.validateFields();
      setConfirmLoading(true);

      const res = await seatunnelClientApi.saveOrUpdate(values);

      if (res?.code !== 0) {
        message.error(res?.msg || "创建 Client 失败");
        return;
      }

      message.success("Client 创建成功");
      setOpenAddModal(false);
      clientForm.resetFields();

      const options = await loadClientOptions();

      const newClientId =
        res?.data?.id ??
        res?.data?.value ??
        (typeof res?.data === "string" || typeof res?.data === "number"
          ? res.data
          : undefined);

      if (newClientId) {
        const nextClientId = String(newClientId);
        const exists = options.some((item) => item.value === nextClientId);

        if (exists) {
          setClientId(nextClientId);
          resetSourceTestStatus();
          resetTargetTestStatus();
          return;
        }
      }

      if (!clientId && options.length) {
        setClientId(options[0].value);
      }
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || "创建 Client 失败");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCreateDataSource = (side: "source" | "target") => {
    const dbType = side === "source" ? sourceType?.dbType : targetType?.dbType;

    if (!dbType) {
      message.warning(
        side === "source" ? "请先选择来源类型" : "请先选择去向类型"
      );
      return;
    }

    modalRef.current?.open({
      operateType: "CREATE" as DataSourceOperateType,
      dbType,
      hideBack: true,
      onSuccess: async () => {
        const nextData =
          side === "source"
            ? await loadSourceOptions(dbType)
            : await loadTargetOptions(dbType);

        const createdValue = nextData?.[0]?.id ?? nextData?.[0]?.value;

        if (!createdValue) {
          return;
        }

        const nextValue = String(createdValue);

        if (side === "source") {
          setSourceDataSourceId(nextValue);
          form.setFieldValue("sourceId", nextValue);
          resetSourceTestStatus();
        } else {
          setTargetDataSourceId(nextValue);
          form.setFieldValue("targetId", nextValue);
          resetTargetTestStatus();
        }
      },
    });
  };

  useEffect(() => {
    loadSourceOptions(sourceType?.dbType);
  }, [sourceType?.dbType, loadSourceOptions]);

  useEffect(() => {
    loadTargetOptions(targetType?.dbType);
  }, [targetType?.dbType, loadTargetOptions]);

  useEffect(() => {
    loadClientOptions();
  }, [loadClientOptions]);

  useEffect(() => {
    if (!clientOptions.length) return;

    if (!clientId) {
      setClientId(clientOptions[0].value);
    }
  }, [clientOptions, clientId, setClientId]);

  const sourceOptions = useMemo(
    () =>
      sourceDataSources.map((item) => ({
        label: item.name ?? item.label ?? "",
        value: String(item.id ?? item.value ?? ""),
      })),
    [sourceDataSources]
  );

  const targetOptions = useMemo(
    () =>
      targetDataSources.map((item) => ({
        label: item.name ?? item.label ?? "",
        value: String(item.id ?? item.value ?? ""),
      })),
    [targetDataSources]
  );

  useEffect(() => {
    if (!sourceOptions.length) {
      setSourceDataSourceId(undefined);
      form.setFieldValue("sourceId", undefined);
      return;
    }

    const hasCurrentValue = sourceOptions.some(
      (item) => item.value === sourceDataSourceId
    );

    if (!sourceDataSourceId || !hasCurrentValue) {
      const firstValue = sourceOptions[0]?.value;
      setSourceDataSourceId(firstValue);
      form.setFieldValue("sourceId", firstValue);
    }
  }, [sourceOptions, sourceDataSourceId, form, setSourceDataSourceId]);

  useEffect(() => {
    if (!targetOptions.length) {
      setTargetDataSourceId(undefined);
      form.setFieldValue("targetId", undefined);
      return;
    }

    const hasCurrentValue = targetOptions.some(
      (item) => item.value === targetDataSourceId
    );

    if (!targetDataSourceId || !hasCurrentValue) {
      const firstValue = targetOptions[0]?.value;
      setTargetDataSourceId(firstValue);
      form.setFieldValue("targetId", firstValue);
    }
  }, [targetOptions, targetDataSourceId, form, setTargetDataSourceId]);

  useEffect(() => {
    form.setFieldsValue({
      sourceType: sourceType?.dbType,
      targetType: targetType?.dbType,
      sourceId: sourceDataSourceId,
      targetId: targetDataSourceId,
      clientId,
    });
  }, [
    form,
    sourceType,
    targetType,
    sourceDataSourceId,
    targetDataSourceId,
    clientId,
  ]);

  const runConnectivityTest = async (
    type: "source" | "target",
    datasourceId?: string | number
  ) => {
    if (!clientId) {
      message.warning("请先选择客户端节点");
      return;
    }

    if (
      datasourceId === undefined ||
      datasourceId === null ||
      datasourceId === ""
    ) {
      message.warning(
        type === "source" ? "请先选择来源数据源" : "请先选择目标数据源"
      );
      return;
    }

    if (type === "source") {
      setSourceTestStatus("loading");
      setSourceVerifyItems([]);
    } else {
      setTargetTestStatus("loading");
      setTargetVerifyItems([]);
    }

    try {
      const res = await seatunnelClientApi.verifyDatasource(clientId, {
        datasourceId,
        pluginName:
          type === "source" ? sourceType?.pluginName : targetType?.pluginName,
        connectorType:
          type === "source"
            ? sourceType?.connectorType
            : targetType?.connectorType,
        role: type === "source" ? "SOURCE" : "SINK",
      });

      const success = !!res?.data?.success;
      const items = Array.isArray(res?.data?.items) ? res.data.items : [];

      if (type === "source") {
        setSourceTestStatus(success ? "success" : "error");
        setSourceVerifyItems(items);
      } else {
        setTargetTestStatus(success ? "success" : "error");
        setTargetVerifyItems(items);
      }
    } catch (error) {
      console.error("连通性测试失败:", error);

      const errorItem: VerifyItem = {
        code: "REQUEST_ERROR",
        name: "请求异常",
        success: false,
        actualValue: "接口请求失败",
        expectedValue: "接口正常返回",
        message: "连通性测试失败，请稍后重试",
      };

      if (type === "source") {
        setSourceTestStatus("error");
        setSourceVerifyItems([errorItem]);
      } else {
        setTargetTestStatus("error");
        setTargetVerifyItems([errorItem]);
      }

      message.error("连通性测试失败，请稍后重试");
    }
  };

  return (
    <>
      <div ref={sectionRef} className="bg-white px-8 py-8">
        <div className="mx-auto space-y-6">
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
                    onTest={() =>
                      runConnectivityTest("source", sourceDataSourceId)
                    }
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
                    onTest={() =>
                      runConnectivityTest("target", targetDataSourceId)
                    }
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

          <div className="flex gap-6">
            <SectionCard
              title="来源"
              status={sourceTestStatus}
              verifyItems={sourceVerifyItems}
              footer={
                <Button
                  className="w-full !rounded-full"
                  onClick={() =>
                    runConnectivityTest("source", sourceDataSourceId)
                  }
                  loading={sourceTestStatus === "loading"}
                  disabled={!sourceDataSourceId || !clientId}
                  type="primary"
                >
                  测试连通性
                </Button>
              }
            >
              <Form form={form} layout="vertical">
                <div className="space-y-4">
                  <Form.Item name="sourceType" label="数据源类型" required>
                    <Select
                      value={sourceType?.dbType}
                      onChange={(value, option) => {
                        handleSourceChange(value, option);
                        setSourceDataSourceId(undefined);
                        resetSourceTestStatus();
                      }}
                      className="w-full"
                      showSearch
                      placeholder="请选择来源类型"
                      options={dataSourceTypeOptions}
                    />
                  </Form.Item>

                  <Form.Item name="sourceId" label="数据源名称" required>
                    <Select
                      value={sourceDataSourceId}
                      onChange={(value) => {
                        setSourceDataSourceId(value);
                        resetSourceTestStatus();
                      }}
                      className="w-full"
                      placeholder="请选择来源数据源"
                      loading={sourceLoading}
                      showSearch
                      options={sourceOptions}
                      dropdownRender={(menu) => (
                        <>
                          {menu}

                          <div className="border-t border-slate-100 bg-white px-2 py-1">
                            <Button
                              block
                              type="default"
                              style={{ marginTop: 8 }}
                              className={[
                                "group/detail relative h-[32px] overflow-hidden rounded-full p-0",
                                "border border-[#D9D9D9] bg-white font-bold",
                                "transition-all duration-300 ease-out",
                                "hover:!border-[hsl(231_48%_48%)]",
                              ].join(" ")}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={() => {
                                handleCreateDataSource("source");
                              }}
                            >
                              <span
                                className={[
                                  "absolute inset-0 z-[1] flex items-center justify-center rounded-full bg-white",
                                  "transition-all duration-300 ease-out",
                                  "group-hover/detail:translate-y-1.5 group-hover/detail:opacity-0",
                                ].join(" ")}
                              >
                                <span style={{ fontWeight: 400, fontSize: 13 }}>
                                  新建来源数据源
                                </span>
                              </span>

                              <span
                                className={[
                                  "absolute inset-0 z-[2] flex items-center justify-center gap-2 rounded-full",
                                  "bg-[hsl(231_48%_48%)] text-white opacity-0",
                                  "transition-all duration-300 ease-out",
                                  "group-hover/detail:opacity-100",
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "translate-x-[-4px] transition-transform duration-300 ease-out",
                                    "group-hover/detail:translate-x-0",
                                  ].join(" ")}
                                >
                                  <span
                                    style={{ fontWeight: 400, fontSize: 13 }}
                                  >
                                    新建来源数据源
                                  </span>
                                </span>

                                <span
                                  className={[
                                    "translate-x-[-8px] opacity-0 transition-all duration-300 ease-out",
                                    "group-hover/detail:translate-x-0 group-hover/detail:opacity-100",
                                  ].join(" ")}
                                >
                                  <PlusCircleIcon
                                    size={16}
                                    className="mr-1.5"
                                  />
                                </span>
                              </span>
                            </Button>
                          </div>
                        </>
                      )}
                    />
                  </Form.Item>
                </div>
              </Form>
            </SectionCard>

            <SectionCard
              title="客户端"
              footer={
                <Button
                  className="w-full !rounded-full"
                  onClick={() => {
                    setOpenAddModal(true);
                  }}
                >
                  新建客户端
                </Button>
              }
            >
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    客户端节点
                  </div>

                  <Select
                    value={clientId}
                    onChange={(value) => {
                      setClientId(value);
                      resetSourceTestStatus();
                      resetTargetTestStatus();
                    }}
                    className="w-full"
                    showSearch
                    placeholder="请选择 Zeta 客户端节点"
                    loading={clientLoading}
                    options={clientOptions}
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-sm font-medium text-slate-800">
                    当前已选择 {clientId ? "1" : "0"} 个节点
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    任务会在你选中的客户端节点上运行，我们会用它来做连接测试和正式执行。
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="去向"
              status={targetTestStatus}
              verifyItems={targetVerifyItems}
              footer={
                <Button
                  className="w-full !rounded-full"
                  onClick={() =>
                    runConnectivityTest("target", targetDataSourceId)
                  }
                  loading={targetTestStatus === "loading"}
                  disabled={!targetDataSourceId || !clientId}
                  type="primary"
                >
                  测试连通性
                </Button>
              }
            >
              <Form form={form} layout="vertical">
                <div className="space-y-4">
                  <Form.Item name="targetType" label="数据去向类型" required>
                    <Select
                      value={targetType?.dbType}
                      onChange={(value, option) => {
                        handleTargetChange(value, option);
                        setTargetDataSourceId(undefined);
                        resetTargetTestStatus();
                      }}
                      className="w-full"
                      showSearch
                      placeholder="请选择去向类型"
                      options={dataSourceTypeOptions}
                    />
                  </Form.Item>

                  <Form.Item name="targetId" label="数据源名称" required>
                    <Select
                      value={targetDataSourceId}
                      onChange={(value) => {
                        setTargetDataSourceId(value);
                        resetTargetTestStatus();
                      }}
                      showSearch
                      className="w-full"
                      loading={targetLoading}
                      placeholder="请选择目标数据源"
                      options={targetOptions}
                      dropdownRender={(menu) => (
                        <>
                          {menu}

                          <div className="border-t border-slate-100 bg-white px-3 py-2">
                            <Button
                              block
                              type="default"
                              style={{ marginTop: 8 }}
                              className={[
                                "group/detail relative h-[32px] overflow-hidden rounded-full p-0",
                                "border border-[#D9D9D9] bg-white font-bold",
                                "transition-all duration-300 ease-out",
                                "hover:!border-[hsl(231_48%_48%)]",
                              ].join(" ")}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={() => {
                                handleCreateDataSource("target");
                              }}
                            >
                              <span
                                className={[
                                  "absolute inset-0 z-[1] flex items-center justify-center rounded-full bg-white",
                                  "transition-all duration-300 ease-out",
                                  "group-hover/detail:translate-y-1.5 group-hover/detail:opacity-0",
                                ].join(" ")}
                              >
                                新建去向数据源
                              </span>

                              <span
                                className={[
                                  "absolute inset-0 z-[2] flex items-center justify-center gap-2 rounded-full",
                                  "bg-[hsl(231_48%_48%)] text-white opacity-0",
                                  "transition-all duration-300 ease-out",
                                  "group-hover/detail:opacity-100",
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "translate-x-[-4px] transition-transform duration-300 ease-out",
                                    "group-hover/detail:translate-x-0",
                                  ].join(" ")}
                                >
                                  新建去向数据源
                                </span>

                                <span
                                  className={[
                                    "translate-x-[-8px] opacity-0 transition-all duration-300 ease-out",
                                    "group-hover/detail:translate-x-0 group-hover/detail:opacity-100",
                                  ].join(" ")}
                                >
                                  <PlusCircleIcon
                                    size={16}
                                    className="mr-1.5"
                                  />
                                </span>
                              </span>
                            </Button>
                          </div>
                        </>
                      )}
                    />
                  </Form.Item>
                </div>
              </Form>
            </SectionCard>
          </div>
        </div>
      </div>

      <AddClientModal
        open={openAddModal}
        form={clientForm}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setOpenAddModal(false);
          clientForm.resetFields();
        }}
        onSubmit={handleCreateClient}
      />

      <AddOrEditDataSourceModal ref={modalRef} />
    </>
  );
};

export default ClientLinkSection;
