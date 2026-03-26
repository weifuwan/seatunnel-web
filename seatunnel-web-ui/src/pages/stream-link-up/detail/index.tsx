import {
  Col,
  Divider,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { seatunnelStreamJobDefinitionApi } from "../api";

import ActionFooter from "./components/ActionFooter";
import RegexMatchTable from "./components/RegexMatchTable";
import SyncForm from "./components/SyncForm";
import TableTransfer from "./components/TableTransfer";
import WholeSyncHeader from "./components/WholeSyncHeader";

import { useDataSource } from "./hooks/useDataSource";
import { useTableData } from "./hooks/useTableData";
import { useTaskDraft } from "./hooks/useTaskDraft";

import ExtraParamsConfig from "./components/ExtraParamsConfig";
import SectionCard from "./components/SectionCard";
import TaskBasicInfoForm from "./components/TaskBasicInfoForm";
import SyncTitle from "./SyncTitle";

interface WholeSyncProps {
  goBack: () => void;
  detail: boolean;
  form: any;
}

const WholeSync: React.FC<WholeSyncProps> = ({ goBack, detail, form }) => {
  const [matchMode, setMatchMode] = useState<string>("1");
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<any>("");

  const {
    data,
    multiTableList,
    readOnlyTables,
    loading,
    tableKeyword,
    setMultiTableList,
    setTableKeyword,
    setReadOnlyTables,
    fetchTables,
    fetchReferenceTables,
    debouncedFetchReferenceTables,
  } = useTableData();

  const {
    sourceType,
    targetType,
    sourceOption,
    targetOption,
    dataSourceIdK,
    setDataSourceIdK,
    setSourceType,
    setTargetType,
    handleSourceChange,
    handleTargetChange,
  } = useDataSource(form, fetchTables);

  const { buildTaskDraft, restoreFromDraft } = useTaskDraft();
  const [showTopShadow, setShowTopShadow] = useState(false);
  useEffect(() => {
    if (form?.getFieldValue("id")) {
      try {
        const draft = JSON.parse(form?.getFieldValue("jobDefinitionInfo"));
        restoreFromDraft(draft, {
          setSourceType,
          setTargetType,
          setMatchMode,
          setDataSourceIdK,
          setMultiTableList,
          setTableKeyword,
          form,
          fetchTables,
          fetchReferenceTables,
        });
      } catch (error) {
        console.error("恢复草稿失败：", error);
      }
    }
  }, [form]);

  const handleSourceIdChange = (value: string) => {
    form.setFieldValue("sourceId", value);
    fetchTables(value);
  };

  const handleMatchModeChange = (value: string) => {
    if (value === "4" || value === "1") {
      fetchTables(dataSourceIdK, value, true);
    }
    setMatchMode(value);
  };

  const handleKeywordChange = (value: string) => {
    setTableKeyword(value);
  };

  const handleClearTables = () => {
    setReadOnlyTables([]);
  };

  const handleSave = async () => {
    try {
      await form.validateFields();

      if (matchMode === "1" && multiTableList.length === 0) {
        message.warning("table_list 不能为空");
        return;
      }

      const sourceId = form?.getFieldValue("sourceId");
      const sinkId = form?.getFieldValue("sinkId");
      if (sourceId === sinkId) {
        message.warning("来源和去向的数据源不能相同！");
        return;
      }

      const draft = buildTaskDraft({
        form,
        sourceType,
        targetType,
        matchMode,
        multiTableList,
        tableKeyword,
      });

      const leftSideParam = form?.getFieldsValue();
      const isEdit = !!form?.getFieldValue("id");

      const params = {
        ...(isEdit ? { id: form.getFieldValue("id") } : {}),
        jobDefinitionInfo: JSON.stringify(draft),
        ...leftSideParam,
        sourceType: sourceType?.dbType,
        sinkType: targetType?.dbType,
      };

      let res;
      if (isEdit) {
        res = await seatunnelStreamJobDefinitionApi.update(
          form?.getFieldValue("id"),
          params
        );
      } else {
        res = await seatunnelStreamJobDefinitionApi.create(params);
      }

      if (res?.code === 0) {
        goBack();
        form.resetFields();
        message.success("保存成功");
      } else {
        message.error(res?.message || "保存失败");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHocon = async () => {
    try {
      await form.validateFields();

      if (matchMode === "1" && multiTableList.length === 0) {
        message.warning("[表配置] 你还没有选择需要同步的表哦 😊");
        return;
      }

      const sourceId = form?.getFieldValue("sourceId");
      const sinkId = form?.getFieldValue("sinkId");
      if (sourceId === sinkId) {
        message.warning("[表配置] 来源和去向的数据源不能相同哦 😊");
        return;
      }

      const draft = buildTaskDraft({
        form,
        sourceType,
        targetType,
        matchMode,
        multiTableList,
        tableKeyword,
      });

      const leftSideParam = form?.getFieldsValue();
      const params = {
        jobDefinitionInfo: JSON.stringify(draft),
        ...leftSideParam,
      };

      const data = await seatunnelStreamJobDefinitionApi.hocon(params);
      if (data?.code === 0) {
        setOpen(true);
        setContent(data?.data);
      } else {
        message.error(data?.message || "生成 HOCON 失败");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 pb-28 max-h-[calc(100vh-64px)]"
      style={{ backgroundColor: "white" }}
    >
      <WholeSyncHeader
        goBack={() => {
          form.resetFields();
          goBack();
        }}
        sourceType={sourceType}
        targetType={targetType}
        onSourceChange={handleSourceChange}
        onTargetChange={handleTargetChange}
      />

      <div
        className="max-h-[calc(100vh-120px)] overflow-auto pb-8"
        onScroll={(e) => {
          setShowTopShadow(e.currentTarget.scrollTop > 4);
        }}
      >
        <div
          className={`pointer-events-none sticky top-0 z-10 h-4 transition-all duration-200 ${
            showTopShadow ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,23,42,0.08), rgba(15,23,42,0.04), transparent)",
          }}
        />

        <SectionCard
          title="基础配置"
          desc="填写任务名称、运行模式与基础描述信息"
        >
          <TaskBasicInfoForm
            sourceType={sourceType.dbType}
            sinkType={targetType.dbType}
            form={form}
          />
        </SectionCard>

        <SectionCard title="表配置" desc="配置同步数据源、匹配模式与表选择范围">
          <SyncForm
            form={form}
            sourceType={sourceType}
            targetType={targetType}
            sourceOption={sourceOption}
            targetOption={targetOption}
            matchMode={matchMode}
            tableKeyword={tableKeyword}
            dataSourceIdK={dataSourceIdK}
            loading={loading}
            onSourceIdChange={handleSourceIdChange}
            onMatchModeChange={handleMatchModeChange}
            onKeywordChange={handleKeywordChange}
            onDebouncedFetch={(keyword) =>
              debouncedFetchReferenceTables(dataSourceIdK, matchMode, keyword)
            }
            onClearTables={handleClearTables}
          />

          {(matchMode === "1" || matchMode === "4") && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <TableTransfer
                data={data}
                targetKeys={multiTableList}
                loading={loading}
                matchMode={matchMode}
                onChange={setMultiTableList}
              />
            </div>
          )}

          {matchMode === "2" && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <RegexMatchTable data={readOnlyTables} loading={loading} />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="参数配置"
          desc="设置启动模式、Schema/Data 保存策略及额外参数"
          className="mb-6"
        >
          <div className="mb-5">
            <SyncTitle />
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} xl={12}>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="mb-4 text-sm font-semibold text-slate-800">
                  来源参数
                </div>
                <Form
                  form={form}
                  initialValues={{
                    startupMode: "INITIAL",
                    stopMode: "NEVER",
                    schemaChange: true,
                    batchSize: 10000,
                    exactlyOnce: false,
                    dataSaveMode: "APPEND_DATA",
                    schemaSaveMode: "CREATE_SCHEMA_WHEN_NOT_EXIST",
                    enableUpsert: true,
                  }}
                  layout="vertical"
                >
                  <Form.Item
                    label="启动模式"
                    name="startupMode"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="请选择"
                      size="small"
                      options={[
                        { label: "最早位置（EARLIEST）", value: "EARLIEST" },
                        { label: "最新位置（LATEST）", value: "LATEST" },
                        { label: "初始位置（INITIAL）", value: "INITIAL" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="停止模式"
                    name="stopMode"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="请选择"
                      size="small"
                      options={[
                        { label: "最新位置（LATEST）", value: "LATEST" },
                        { label: "永不停止（NEVER）", value: "NEVER" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Schema 变更同步"
                    name="schemaChange"
                    rules={[{ required: true }]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Divider className="my-4" />

                  <Form.Item label="额外参数" name="sourceExtraParams">
                    <ExtraParamsConfig pluginName={sourceType?.pluginName} />
                  </Form.Item>
                </Form>
              </div>
            </Col>

            <Col xs={24} xl={12}>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="mb-4 text-sm font-semibold text-slate-800">
                  去向参数
                </div>
                <Form form={form} layout="vertical">
                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <Form.Item
                        label="Schema 保存策略"
                        name="schemaSaveMode"
                        rules={[{ required: true }]}
                      >
                        <Select
                          showSearch
                          placeholder="请选择"
                          size="small"
                          options={[
                            {
                              label: "不存在时创建",
                              value: "CREATE_SCHEMA_WHEN_NOT_EXIST",
                            },
                            { label: "重建 Schema", value: "RECREATE_SCHEMA" },
                            {
                              label: "不存在时报错",
                              value: "ERROR_WHEN_SCHEMA_NOT_EXIST",
                            },
                            { label: "忽略", value: "IGNORE" },
                          ]}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="数据保存策略"
                        name="dataSaveMode"
                        rules={[{ required: true }]}
                      >
                        <Select
                          showSearch
                          placeholder="请选择"
                          size="small"
                          options={[
                            { label: "追加数据", value: "APPEND_DATA" },
                            { label: "清空后写入", value: "DROP_DATA" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <Form.Item
                        label="批大小"
                        name="batchSize"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          placeholder="请输入"
                          style={{ width: "40%" }}
                          size="small"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="启用 Upsert"
                        name="enableUpsert"
                        rules={[{ required: true }]}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-4" />

                  <Form.Item label="额外参数" name="sinkExtraParams">
                    <ExtraParamsConfig pluginName={targetType?.pluginName} />
                  </Form.Item>
                </Form>
              </div>
            </Col>
          </Row>
        </SectionCard>
        <div style={{height: "100px"}}></div>
      </div>

      <ActionFooter
        form={form}
        matchMode={matchMode}
        multiTableList={multiTableList}
        sourceType={sourceType}
        targetType={targetType}
        onSave={handleSave}
        onHocon={handleHocon}
        open={open}
        content={content}
        onOpenChange={setOpen}
        goBack={() => {
          goBack();
        }}
      />
    </div>
  );
};

export default WholeSync;
