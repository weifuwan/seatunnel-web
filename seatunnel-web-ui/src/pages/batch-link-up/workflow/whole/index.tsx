import Header from "@/components/Header";
import { useLocation } from "@umijs/max";
import { Col, Form, InputNumber, Row, Select, Switch } from "antd";
import { FC } from "react";
import SyncTitle from "./SyncTitle";
import ReferenceTablePanel from "./components/ReferenceTablePanel";
import TableTransferPanel from "./components/TableTransferPanel";
import WholeSyncActions from "./components/WholeSyncActions";
import WholeSyncForm from "./components/WholeSyncForm";
import WholeSyncHeader from "./components/WholeSyncHeader";
import { useWholeSync } from "./hooks/useWholeSync";
import "./index.less";

interface WholeSyncProps {
  goBack: () => void;
  baseForm: any;
}

interface TooltipConfig {
  title: React.ReactNode;
  defaultText?: React.ReactNode;
  sectionTitle?: React.ReactNode;
  items?: React.ReactNode[];
  footer?: React.ReactNode;
  width?: number;
}

const renderTooltip = ({
  title,
  defaultText,
  sectionTitle,
  items = [],
  footer,
  width = 250,
}: TooltipConfig) => (
  <div
    style={{
      fontSize: 12,
      lineHeight: 1.6,
      color: "rgba(0,0,0,0.7)",
      padding: 6,
      // width: width
    }}
  >
    <div style={{ marginBottom: 4, fontSize: 14, color: "black" }}>{title}</div>

    {defaultText && (
      <div style={{ color: "#999", marginBottom: 6 }}>{defaultText}</div>
    )}

    {sectionTitle && (
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{sectionTitle}</div>
    )}

    {items.length > 0 && (
      <ul
        style={{
          paddingLeft: 16,
          margin: 0,
          marginBottom: footer ? 6 : 0,
        }}
      >
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )}

    {footer && <div style={{ color: "#999" }}>{footer}</div>}
  </div>
);

const WholeSync: FC<WholeSyncProps> = ({ goBack, baseForm }) => {
  const [form] = Form.useForm();

  const {
    loading,
    data,
    multiTableList,
    setMultiTableList,
    readOnlyTables,
    sourceType,
    targetType,
    sourceOption,
    targetOption,
    matchMode,
    tableKeyword,
    handleSourceTypeChange,
    handleTargetTypeChange,
    handleSourceIdChange,
    handleMatchModeChange,
    handleKeywordChange,
    buildTaskDraft,
  } = useWholeSync({ baseForm, form });

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const idFromUrl = query.get("id");

  return (
    <>
      <WholeSyncHeader
        sourceType={sourceType}
        targetType={targetType}
        onSourceChange={handleSourceTypeChange}
        onTargetChange={handleTargetTypeChange}
        goBack={goBack}
      />

      <div style={{ overflow: "auto", height: "calc(100vh - 190px)" }}>
        <div style={{ margin: 16 }}>
          <div style={{ backgroundColor: "white", padding: "16px 24px" }}>
            <Header title="数据表设置" />
            <SyncTitle />

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
                data={data}
                targetKeys={multiTableList}
                matchMode={matchMode}
                onChange={setMultiTableList}
              />
            )}

            {(matchMode === "2" || matchMode === "3") && (
              <ReferenceTablePanel loading={loading} data={readOnlyTables} />
            )}
          </div>
        </div>

        <div
          style={{
            margin: "16px 16px 0 16px",
            backgroundColor: "white",
            padding: "16px 24px",
            marginBottom: "4vh",
          }}
        >
          <Header title="参数设置" />
          <SyncTitle />

          <div>
            <Row gutter={24}>
              <Col span={12}>
                <Form
                  form={form}
                  initialValues={{
                    fetchSize: 8000,
                    splitSize: 8096,
                    dataSaveMode: "APPEND_DATA",
                    schemaSaveMode: "CREATE_SCHEMA_WHEN_NOT_EXIST",
                    enableUpsert: true,
                  }}
                  layout="vertical"
                >
                  <Form.Item
                    label="每次拉取行数（Fetch Size）"
                    name="fetchSize"
                    rules={[{ required: true, message: "请输入每次拉取行数" }]}
                    tooltip={renderTooltip({
                      title: "每次从数据库读取的记录数量",
                      defaultText: "默认值：0（使用 JDBC 默认值）",
                      sectionTitle: "推荐设置",
                      items: [
                        "小表（<10万行）：500 - 1000",
                        "中表（10万 ~ 1000万）：2000 - 5000",
                        "大表（>1000万）：5000 - 10000",
                      ],
                    })}
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
                    tooltip={renderTooltip({
                      title: "读取表数据时每个分片包含的行数",
                      defaultText: "默认值：8096",
                      sectionTitle: "推荐设置",
                      items: [
                        "小表（<10万行）：2000",
                        "中表（10万 ~ 1000万）：8000",
                        "大表（>1000万）：20000",
                      ],
                    })}
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
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    schemaSaveMode: "CREATE_SCHEMA_WHEN_NOT_EXIST",
                    dataSaveMode: "APPEND_DATA",
                    batchSize: 10000,
                    enableUpsert: true,
                    fieldIde: "ORIGINAL",
                  }}
                >
                  <Row gutter={[16, 4]}>
                    <Col span={12}>
                      <Form.Item
                        label="Schema 保存模式"
                        name="schemaSaveMode"
                        rules={[
                          { required: true, message: "请选择 Schema 保存模式" },
                        ]}
                        tooltip={renderTooltip({
                          title: "控制目标表结构不存在或需要调整时的处理方式",
                          defaultText: "默认值：不存在则创建",
                          sectionTitle: "可选说明",
                          items: [
                            "不存在则创建：目标表不存在时自动创建",
                            "重新创建：先删除再重建目标表结构",
                            "不存在则报错：目标表不存在时任务失败",
                            "忽略：不处理表结构",
                          ],
                        })}
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
                        rules={[
                          { required: true, message: "请选择数据保存模式" },
                        ]}
                        tooltip={renderTooltip({
                          title: "控制写入目标表时对已有数据的处理方式",
                          defaultText: "默认值：追加数据",
                          sectionTitle: "可选说明",
                          items: [
                            "追加数据：保留已有数据，在后面继续写入",
                            "清空后写入：先删除目标表数据，再重新写入",
                          ],
                        })}
                      >
                        <Select
                          size="small"
                          placeholder="请选择"
                          options={[
                            {
                              label: "追加数据",
                              value: "APPEND_DATA",
                            },
                            {
                              label: "清空后写入",
                              value: "DROP_DATA",
                            },
                          ]}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="启用 Upsert"
                        name="enableUpsert"
                        valuePropName="checked"
                        rules={[{ required: true, message: "请选择Upsert" }]}
                        tooltip={renderTooltip({
                          title:
                            "开启后，目标端存在相同主键或唯一键时执行更新，否则插入",
                          defaultText: "默认值：开启",
                          sectionTitle: "适用场景",
                          items: ["需要按主键更新已有数据", "需要避免重复插入"],
                          footer:
                            "使用前请确认目标表支持主键、唯一键或对应的 Upsert 能力。",
                        })}
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
                        tooltip={renderTooltip({
                          title: "每批次写入目标端的数据条数",
                          defaultText: "默认值：10000",
                          sectionTitle: "推荐设置",
                          items: [
                            "小表（<10万行）：1000 - 5000",
                            "中表（10万 ~ 1000万）：5000 - 10000",
                            "大表（>1000万）：10000 - 50000",
                          ],
                          footer:
                            "数值越大，吞吐通常越高，但也会增加内存和写入压力。",
                        })}
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
                      <Form.Item
                        label="字段标识格式"
                        name="fieldIde"
                        tooltip={renderTooltip({
                          title: "控制字段名写入目标端时的大小写格式",
                          defaultText: "默认值：保持原样",
                          sectionTitle: "可选说明",
                          items: [
                            "保持原样：按源字段名原样写入",
                            "转大写：字段名统一转为大写",
                            "转小写：字段名统一转为小写",
                          ],
                          footer:
                            "适用于跨库同步时字段大小写敏感或命名规范不一致的场景。",
                        })}
                      >
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
    </>
  );
};

export default WholeSync;
