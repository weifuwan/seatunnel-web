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
import TaskBasicInfoForm from "./components/TaskBasicInfoForm";
import SyncTitle from "./SyncTitle";
import SectionCard from "./components/SectionCard";

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
        console.error("Failed to restore draft:", error);
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
        message.success("Success");
      } else {
        message.error(res?.message || "Fail");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHocon = async () => {
    try {
      await form.validateFields();

      if (matchMode === "1" && multiTableList.length === 0) {
        message.warning("[Table Setting] You didn't select any tables 😊");
        return;
      }

      const sourceId = form?.getFieldValue("sourceId");
      const sinkId = form?.getFieldValue("sinkId");
      if (sourceId === sinkId) {
        message.warning(
          "[Table Setting] The data source for 'Source' and 'Sink' cannot be the same! 😊"
        );
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
        message.error(data?.message || "生成 hocon 失败");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 max-h-[calc(100vh-64px)]" style={{backgroundColor: "white",}}>
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

      <div className="max-h-[calc(100vh-120px)] overflow-auto pb-8">
        {/* <div className="max-h-[calc(100vh-120px)] overflow-auto pb-8"></div> */}
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

        <SectionCard
          title="表配置"
          desc="配置同步数据源、匹配模式与表选择范围"
        >
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
          title="参数"
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
                  Source Params
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
                    label="Startup Mode"
                    name="startupMode"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Select..."
                      options={[
                        { label: "EARLIEST", value: "EARLIEST" },
                        { label: "LATEST", value: "LATEST" },
                        { label: "INITIAL", value: "INITIAL" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Stoptup Mode"
                    name="stopMode"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Select..."
                      options={[
                        { label: "LATEST", value: "LATEST" },
                        { label: "NEVER", value: "NEVER" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Schema Change"
                    name="schemaChange"
                    rules={[{ required: true }]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Divider className="my-4" />

                  <Form.Item label="Extra Params" name="sourceExtraParams">
                    <ExtraParamsConfig pluginName={sourceType?.pluginName} />
                  </Form.Item>
                </Form>
              </div>
            </Col>

            <Col xs={24} xl={12}>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <div className="mb-4 text-sm font-semibold text-slate-800">
                  Sink Params
                </div>
                <Form form={form} layout="vertical">
                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <Form.Item
                        label="Schema Save Mode"
                        name="schemaSaveMode"
                        rules={[{ required: true }]}
                      >
                        <Select
                          showSearch
                          placeholder="Select..."
                          options={[
                            {
                              label: "CREATE IF MISSING",
                              value: "CREATE_SCHEMA_WHEN_NOT_EXIST",
                            },
                            { label: "RECREATE", value: "RECREATE_SCHEMA" },
                            {
                              label: "ERROR IF MISSING",
                              value: "ERROR_WHEN_SCHEMA_NOT_EXIST",
                            },
                            { label: "IGNORE", value: "IGNORE" },
                          ]}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Data Save Mode"
                        name="dataSaveMode"
                        rules={[{ required: true }]}
                      >
                        <Select
                          showSearch
                          placeholder="Select..."
                          options={[
                            { label: "APPEND DATA", value: "APPEND_DATA" },
                            { label: "DROP DATA", value: "DROP_DATA" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Batch Size"
                    name="batchSize"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      placeholder="Input..."
                      className="w-full"
                    />
                  </Form.Item>

                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <Form.Item
                        label="Exactly Once"
                        name="exactlyOnce"
                        rules={[{ required: true }]}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Upsert"
                        name="enableUpsert"
                        rules={[{ required: true }]}
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-4" />

                  <Form.Item label="Extra Params" name="sinkExtraParams">
                    <ExtraParamsConfig pluginName={targetType?.pluginName} />
                  </Form.Item>
                </Form>
              </div>
            </Col>
          </Row>
        </SectionCard>
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