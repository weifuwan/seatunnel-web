import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Col, Form, InputNumber, message, Popover, Row, Select, Space, Spin, Switch } from "antd";
import { Blocks } from "lucide-react";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from "./index.less";
import "./index.less";
import { dataSourceCatalogApi, fetchDataSourceOptions } from "@/pages/data-source/service";
import { BasicConfig, ScheduleConfig } from "../../workflow/components/ScheduleConfigContent/types";
import { seatunnelJobDefinitionApi } from "../../api";
import CodeBlockWithCopy from "../../workflow/operator/CodeBlockWithCopy";
import WholeSyncForm from "./components/WholeSyncForm";
import TableTransferPanel from "./components/TableTransferPanel";
import ReferenceTablePanel from "./components/ReferenceTablePanel";
import RightConfigPanel from "../../workflow/RightConfigPanel";

interface DbTypeValue {
  dbType?: string;
  connectorType?: string;
  pluginName?: string;
}

interface TableItem {
  key: string;
  title: string;
  rawTitle: string;
}

interface MultiWorkflowProps {
  params: any;
  goBack: () => void;
  basicConfig: BasicConfig;
  setBasicConfig: React.Dispatch<React.SetStateAction<BasicConfig>>;
  scheduleConfig: ScheduleConfig;
  setScheduleConfig: (value: any) => void;
}

const DEFAULT_DB_TYPE: DbTypeValue = {
  dbType: "MYSQL",
  connectorType: "Jdbc",
};

const buildDataSourceOptions = (list: any[] = []) => {
  return list.map((item) => ({
    label: item.name || item.dataSourceName || item.id,
    value: String(item.id),
    ...item,
  }));
};

const buildTableItems = (list: any[] = []): TableItem[] => {
  return list.map((item: any) => {
    const tableName = typeof item === "string" ? item : item.value ;
    return {
      key: String(tableName),
      title: String(item.label),
      rawTitle: String(tableName).toLowerCase(),
    };
  });
};

export default function MultiWorkflow({
  params,
  goBack,
  basicConfig,
  setBasicConfig,
  scheduleConfig,
  setScheduleConfig,
}: MultiWorkflowProps) {
  const [form] = Form.useForm();

  const [rightWidth, setRightWidth] = useState(380);
  const [activeTab, setActiveTab] = useState<
    "basic" | "schedule" | "mapping" | "advanced"
  >("basic");
  const draggingRef = useRef(false);

  const [loading, setLoading] = useState(false);

  const [sourceType, setSourceType] = useState<DbTypeValue>(
    params?.sourceType || DEFAULT_DB_TYPE
  );
  const [targetType, setTargetType] = useState<DbTypeValue>(
    params?.targetType || DEFAULT_DB_TYPE
  );

  const [sourceOption, setSourceOption] = useState<any[]>([]);
  const [targetOption, setTargetOption] = useState<any[]>([]);
  const [currentSourceId, setCurrentSourceId] = useState("");

  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [readOnlyTables, setReadOnlyTables] = useState<TableItem[]>([]);
  const [multiTableList, setMultiTableList] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<string>("1");
  const [tableKeyword, setTableKeyword] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      const viewportWidth = window.innerWidth;
      const nextWidth = viewportWidth - event.clientX - 18;
      const clampedWidth = Math.max(320, Math.min(520, nextWidth));
      setRightWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleResizeStart = () => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const fetchDataSourceOptionsU = useCallback(async (dbType: string) => {
    const res = await fetchDataSourceOptions(dbType);
    if (res?.code === 0 && Array.isArray(res?.data)) {
      return buildDataSourceOptions(res.data);
    }
    return [];
  }, []);

  const fetchTables = useCallback(async (dataSourceId: string, mode?: string) => {
    if (!dataSourceId) return;

    try {
      setLoading(true);
      setCurrentSourceId(dataSourceId);

      const res = await dataSourceCatalogApi.listTable(dataSourceId);
      if (res?.code === 0) {
        const nextTables = buildTableItems(res.data || []);
        setTableData(nextTables);

        if (mode === "4") {
          setMultiTableList(nextTables.map((item) => item.key));
        } else if (mode === "1") {
          setMultiTableList([]);
        }
      } else {
        message.error(res?.message || "获取表列表失败");
      }
    } catch (error) {
      console.error(error);
      message.error("获取表列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferenceTables = useCallback(
    async (dataSourceId: string, mode: string, keyword?: string) => {
      if (!dataSourceId) return;

      try {
        setLoading(true);
        const res = await dataSourceCatalogApi.listTableReference(
          dataSourceId,
          mode,
          keyword
        );
        if (res?.code === 0) {
          setReadOnlyTables(buildTableItems(res.data || []));
        } else {
          message.error(res?.message || "获取参考表失败");
        }
      } catch (error) {
        console.error(error);
        message.error("获取参考表失败");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetchReferenceTables = useMemo(
    () =>
      debounce((dataSourceId: string, mode: string, keyword: string) => {
        fetchReferenceTables(dataSourceId, mode, keyword);
      }, 400),
    [fetchReferenceTables]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const sourceDbType = params?.sourceType?.dbType || sourceType.dbType || "MYSQL";
      const targetDbType = params?.targetType?.dbType || targetType.dbType || "MYSQL";

      const [sourceOptions, targetOptions] = await Promise.all([
        fetchDataSourceOptionsU(sourceDbType),
        fetchDataSourceOptionsU(targetDbType),
      ]);

      if (!mounted) return;

      setSourceOption(sourceOptions);
      setTargetOption(targetOptions);

      const rawWorkflow = params?.workflow || params?.jobDefinitionInfo || null;

      const sourceId =
        params?.sourceDataSourceId ||
        params?.sourceId ||
        sourceOptions?.[0]?.value ||
        "";
      const sinkId =
        params?.targetDataSourceId ||
        params?.targetId ||
        targetOptions?.[0]?.value ||
        "";

      const nextMatchMode = rawWorkflow?.tableMatch?.mode || "1";
      const nextKeyword = rawWorkflow?.tableMatch?.keyword || "";
      const nextMultiTableList = rawWorkflow?.tableMatch?.tables || [];

      setMatchMode(nextMatchMode);
      setTableKeyword(nextKeyword);
      setCurrentSourceId(String(sourceId || ""));

      form.setFieldsValue({
        sourceId: sourceId,
        sinkId,
        matchMode: nextMatchMode,
        sourceTable: nextKeyword,
        fetchSize: rawWorkflow?.source?.fetchSize ?? 8000,
        splitSize: rawWorkflow?.source?.splitSize ?? 8096,
        schemaSaveMode:
          rawWorkflow?.target?.schemaSaveMode ?? "CREATE_SCHEMA_WHEN_NOT_EXIST",
        dataSaveMode: rawWorkflow?.target?.dataSaveMode ?? "APPEND_DATA",
        batchSize: rawWorkflow?.target?.batchSize ?? 10000,
        enableUpsert: rawWorkflow?.target?.enableUpsert ?? true,
        fieldIde: rawWorkflow?.target?.fieldIde ?? "ORIGINAL",
      });

      if (sourceId) {
        if (nextMatchMode === "1") {
          await fetchTables(String(sourceId), "1");
          setMultiTableList(nextMultiTableList);
        } else if (nextMatchMode === "4") {
          await fetchTables(String(sourceId), "4");
        } else if (nextMatchMode === "2" || nextMatchMode === "3") {
          if (nextKeyword) {
            await fetchReferenceTables(String(sourceId), nextMatchMode, nextKeyword);
          }
        }
      }
    };

    init();

    return () => {
      mounted = false;
      debouncedFetchReferenceTables.cancel();
    };
  }, [
    params,
    fetchDataSourceOptionsU,
    fetchTables,
    fetchReferenceTables,
    debouncedFetchReferenceTables,
    form,
    sourceType.dbType,
    targetType.dbType,
  ]);

  const handleSourceIdChange = async (value: string) => {
    setCurrentSourceId(value);

    if (matchMode === "1" || matchMode === "4") {
      await fetchTables(value, matchMode);
      setReadOnlyTables([]);
      return;
    }

    if (tableKeyword) {
      await fetchReferenceTables(value, matchMode, tableKeyword);
    }
  };

  const handleMatchModeChange = async (value: string) => {
    setMatchMode(value);
    form.setFieldValue("matchMode", value);

    if (!currentSourceId) return;

    if (value === "1" || value === "4") {
      setReadOnlyTables([]);
      await fetchTables(currentSourceId, value);
      return;
    }

    setTableData([]);
    setMultiTableList([]);

    if (tableKeyword) {
      await fetchReferenceTables(currentSourceId, value, tableKeyword);
    } else {
      setReadOnlyTables([]);
    }
  };

  const handleKeywordChange = (value: string) => {
    const keyword = value.trim();
    setTableKeyword(keyword);

    if (!keyword) {
      setReadOnlyTables([]);
      return;
    }

    if (!currentSourceId) return;
    debouncedFetchReferenceTables(currentSourceId, matchMode, keyword);
  };

  const buildWorkflowData = () => {
    const formValues = form.getFieldsValue();

    return {
      type: "GUIDE_MULTI",
      source: {
        dbType: sourceType?.dbType,
        connectorType: sourceType?.connectorType,
        datasourceId: formValues.sourceId,
        pluginName: sourceType?.pluginName,
        fetchSize: formValues.fetchSize,
        splitSize: formValues.splitSize,
      },
      target: {
        dbType: targetType?.dbType,
        connectorType: targetType?.connectorType,
        datasourceId: formValues.sinkId,
        pluginName: targetType?.pluginName,
        dataSaveMode: formValues.dataSaveMode,
        batchSize: formValues.batchSize,
        schemaSaveMode: formValues.schemaSaveMode,
        enableUpsert: formValues.enableUpsert,
        fieldIde: formValues.fieldIde,
      },
      tableMatch: {
        mode: matchMode,
        tables: matchMode === "1" || matchMode === "4" ? multiTableList : undefined,
        keyword: matchMode === "2" || matchMode === "3" ? tableKeyword : undefined,
      },
    };
  };

  const buildBasicData = () => {
    return {
      ...basicConfig,
      mode: "GUIDE_MULTI",
      jobMode: "BATCH",
      parallelism: 1,
    };
  };

  const buildScheduleData = () => {
    return {
      ...scheduleConfig,
    };
  };

  const buildFinalPayload = () => {
    return {
      basic: buildBasicData(),
      workflow: buildWorkflowData(),
      schedule: buildScheduleData(),
      env: {
        "job.mode": "BATCH",
        parallelism: 1,
      },
    };
  };

  const validateBeforeSubmit = async () => {
    await form.validateFields();

    if (matchMode === "1" && (!multiTableList || multiTableList.length === 0)) {
      message.warning("请选择至少一个表");
      return false;
    }

    const sourceId = form.getFieldValue("sourceId");
    const sinkId = form.getFieldValue("sinkId");

    if (sourceId && sinkId && sourceId === sinkId) {
      message.warning("来源和目标数据源不能相同");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      const finalPayload = buildFinalPayload();
      await seatunnelJobDefinitionApi.saveOrUpdateGuideMulti(finalPayload);
      message.success("保存成功");
    } catch (error) {
      console.error(error);
      message.error("保存失败");
    }
  };

  const handlePreview = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      setPreviewLoading(true);
      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.buildGuideMultiConfig(finalPayload);

      setPreviewContent(res?.data || "");
      setPreviewOpen(true);
    } catch (error) {
      console.error(error);
      message.error("预览失败");
    } finally {
      setPreviewLoading(false);
    }
  };

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
                    <div className="rounded-2xl ">
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

                    <div className="mt-6 rounded-2xl bg-white">
                      <div className="mb-5 text-base font-semibold text-slate-800">
                        参数设置
                      </div>

                      <Row gutter={24}>
                        <Col span={12}>
                          <Form form={form} layout="vertical">
                            <Form.Item
                              label="每次拉取行数（Fetch Size）"
                              name="fetchSize"
                              rules={[{ required: true, message: "请输入每次拉取行数" }]}
                            >
                              <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                size="small"
                                placeholder="0"
                              />
                            </Form.Item>

                            <Form.Item
                              label="读取分片大小（Split Size）"
                              name="splitSize"
                              rules={[{ required: true, message: "请输入读取分片大小" }]}
                            >
                              <InputNumber
                                min={1}
                                style={{ width: "100%" }}
                                size="small"
                                placeholder="8096"
                              />
                            </Form.Item>
                          </Form>
                        </Col>

                        <Col span={12}>
                          <Form form={form} layout="vertical">
                            <Row gutter={[16, 4]}>
                              <Col span={12}>
                                <Form.Item
                                  label="Schema 保存模式"
                                  name="schemaSaveMode"
                                  rules={[{ required: true, message: "请选择 Schema 保存模式" }]}
                                >
                                  <Select
                                    size="small"
                                    placeholder="请选择"
                                    options={[
                                      {
                                        label: "不存在则创建",
                                        value: "CREATE_SCHEMA_WHEN_NOT_EXIST",
                                      },
                                      {
                                        label: "重新创建",
                                        value: "RECREATE_SCHEMA",
                                      },
                                      {
                                        label: "不存在则报错",
                                        value: "ERROR_WHEN_SCHEMA_NOT_EXIST",
                                      },
                                      {
                                        label: "忽略",
                                        value: "IGNORE",
                                      },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>

                              <Col span={12}>
                                <Form.Item
                                  label="数据保存模式"
                                  name="dataSaveMode"
                                  rules={[{ required: true, message: "请选择数据保存模式" }]}
                                >
                                  <Select
                                    size="small"
                                    placeholder="请选择"
                                    options={[
                                      { label: "追加数据", value: "APPEND_DATA" },
                                      { label: "清空后写入", value: "DROP_DATA" },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>

                              <Col span={12}>
                                <Form.Item
                                  label="启用 Upsert"
                                  name="enableUpsert"
                                  valuePropName="checked"
                                >
                                  <Switch />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={[16, 4]}>
                              <Col span={12}>
                                <Form.Item
                                  label="批次大小"
                                  name="batchSize"
                                  rules={[{ required: true, message: "请输入批次大小" }]}
                                >
                                  <InputNumber
                                    min={1}
                                    placeholder="默认 10000"
                                    size="small"
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              </Col>

                              <Col span={12}>
                                <Form.Item label="字段标识格式" name="fieldIde">
                                  <Select
                                    size="small"
                                    placeholder="请选择"
                                    options={[
                                      { label: "保持原样", value: "ORIGINAL" },
                                      { label: "转大写", value: "UPPERCASE" },
                                      { label: "转小写", value: "LOWERCASE" },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form>
                        </Col>
                      </Row>
                    </div>
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