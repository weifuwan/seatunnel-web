import Header from "@/components/Header";
import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { dataSourceApi, dataSourceCatalogApi } from "@/pages/data-source/type";
import {
  FileTextOutlined,
  SaveOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useLocation } from "@umijs/max";
import {
  Breadcrumb,
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Popover,
  Radio,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
  Transfer,
  TransferProps,
} from "antd";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import DataSourceSelect, { generateDataSourceOptions } from "../../DataSourceSelect";
import IconRightArrow from "../../IconRightArrow";
import { seatunnelJobDefinitionApi } from "../../api";
import CloseIcon from "../icon/CloseIcon";
import CodeBlockWithCopy from "../operator/CodeBlockWithCopy";
import SyncTitle from "./SyncTitle";
import "./index.less";

const { TextArea } = Input;

interface WholeSyncTaskDraft {
  source: {
    dbType: string;
    connectorType: string;
    datasourceId: string;
  };
  target: {
    dbType: string;
    connectorType: string;
    datasourceId: string;
  };
  tableMatch: {
    mode: "1" | "2" | "3" | "4";
    keyword?: string;
    tables?: string[];
  };
}

interface TableItem {
  key: string;
  title: any;
  chosen?: boolean;
}

interface DbType {
  dbType: string;
  connectorType: string;
}

const WholeSync = ({ goBack, baseForm }) => {
  const [data, setData] = useState<TableItem[]>([]);
  const [multiTableList, setMultiTableList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const [tableKeyword, setTableKeyword] = useState("");

  const [form] = Form.useForm();

  const [sourceType, setSourceType] = useState<DbType>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
  });
  const [targetType, setTargetType] = useState<DbType>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
  });

  const [readOnlyTables, setReadOnlyTables] = useState<TableItem[]>([]);

  const [dataSourceIdK, setDataSourceIdK] = useState("");

  const [sourceOption, setSourceOption] = useState<any[]>([]);
  const [targetOption, setTargetOption] = useState<any[]>([]);
  const [matchMode, setMatchMode] = useState<string>("1");

  useEffect(() => {
    const draftStr = baseForm?.getFieldValue("jobDefinitionInfo");
    let draft: WholeSyncTaskDraft = JSON.parse(draftStr);
    if ("nodes" in draft) {
      dataSourceApi.option(sourceType.dbType).then((res) => {
        if (res?.code === 0 && res?.data?.length) {
          const options = res.data.map((item) => ({
            label: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <DatabaseIcons dbType={item?.label} width="18" height="18" />
                &nbsp;&nbsp;{item?.label}
              </div>
            ),
            value: item.value,
          }));
          setSourceOption(options);
          const firstSourceId = options[0].value;
          form.setFieldValue("sourceId", firstSourceId);
          fetchTables(firstSourceId);
        } else {
          setSourceOption([]);
        }
      });
    } else {
      dataSourceApi.option(sourceType.dbType).then((res) => {
        if (res?.code === 0 && res?.data?.length) {
          const options = res.data.map((item) => ({
            label: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <DatabaseIcons dbType={item?.label} width="18" height="18" />
                &nbsp;&nbsp;{item?.label}
              </div>
            ),
            value: item.value,
          }));
          setSourceOption(options);
        } else {
          setSourceOption([]);
        }
      });
      restoreFromDraft(draft);
    }
  }, []);

  useEffect(() => {
    const draftStr = baseForm?.getFieldValue("jobDefinitionInfo");
    let draft: WholeSyncTaskDraft = JSON.parse(draftStr);
    if ("nodes" in draft) {
      dataSourceApi.option(targetType.dbType).then((res) => {
        if (res?.code === 0 && res?.data?.length) {
          const options = res.data.map((item) => ({
            label: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <DatabaseIcons dbType={item?.label} width="18" height="18" />
                &nbsp;&nbsp;{item?.label}
              </div>
            ),
            value: item.value,
          }));
          setTargetOption(options);
          const firstSourceId = options[0].value;
          form.setFieldValue("sinkId", firstSourceId);
        } else {
          setTargetOption([]);
        }
      });
    } else {
      dataSourceApi.option(targetType.dbType).then((res) => {
        if (res?.code === 0 && res?.data?.length) {
          const options = res.data.map((item) => ({
            label: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <DatabaseIcons dbType={item?.label} width="18" height="18" />
                &nbsp;&nbsp;{item?.label}
              </div>
            ),
            value: item.value,
          }));
          setTargetOption(options);
        } else {
          setTargetOption([]);
        }
      });
    }
  }, []);

  const handleSourceChange = (value: string, option: any) => {
    setSourceType({ dbType: value, connectorType: option?.connectorType });
  };

  const handleTargetChange = (value: string, option: any) => {
    setTargetType({ dbType: value, connectorType: option?.connectorType });
  };

  const renderFooter: TransferProps["footer"] = (_, info) => {
    const totalTables = data.length;
    const selectedTables = multiTableList.length;
    if (info?.direction === "left") {
      return (
        <div
          style={{ fontSize: 12, padding: "8px 12px" }}
        >{`Total: ${totalTables} tables`}</div>
      );
    }
    return (
      <div style={{ display: "flex", fontSize: 12, padding: "8px 12px" }}>
        <span>{`已选 ${selectedTables} 个表`}</span>
        <span style={{ color: "red", marginLeft: 16 }}>
          Supports up to 100 tables
        </span>
      </div>
    );
  };

  const debouncedFetchReferenceTables = useCallback(
    debounce((keyword: string) => {
      fetchReferenceTables(dataSourceIdK, matchMode, keyword);
    }, 500),
    [dataSourceIdK, matchMode]
  );

  const fetchTables = async (dataSourceId: string, currentMatchMode?: any) => {
    try {
      setDataSourceIdK(dataSourceId);
      setLoading(true);
      const res = await dataSourceCatalogApi.listTable(dataSourceId);
      if (res?.code === 0) {
        const tmp: TableItem[] = res.data.map((item: any) => ({
          key: item.value,
          title: (
            <div>
              <TableOutlined style={{ color: "orange" }} /> &nbsp;&nbsp;
              {item.label}
            </div>
          ),
        }));
        if (currentMatchMode === "4") {
          setData(tmp);
          setMultiTableList(tmp.map((t) => t.key));
        } else if (currentMatchMode === "1") {
          setData(tmp);
          setMultiTableList([]);
        } else {
          setData(tmp);
        }
      } else {
        message.error(res?.message || "Failed to fetch tables");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceTables = async (
    dataSourceId: string,
    matchMode: string,
    keyword?: string
  ) => {
    try {
      setLoading(true);
      const res = await dataSourceCatalogApi.listTableReference(
        dataSourceId,
        matchMode,
        keyword
      );
      if (res?.code === 0) {
        const tmp: TableItem[] = res.data.map((item: any) => ({
          key: item.value,
          title: (
            <div>
              <TableOutlined style={{ color: "orange" }} />
              &nbsp;&nbsp;
              {item.label}
            </div>
          ),
        }));
        setReadOnlyTables(tmp);
      }
    } catch (err) {
      message.error("获取参考表失败");
    } finally {
      setLoading(false);
    }
  };

  const buildTaskDraft = (): WholeSyncTaskDraft => {
    const formValues = form.getFieldsValue();
    const draft: WholeSyncTaskDraft = {
      source: {
        dbType: sourceType.dbType,
        connectorType: sourceType.connectorType,
        datasourceId: formValues.sourceId,
      },
      target: {
        dbType: targetType.dbType,
        connectorType: targetType.connectorType,
        datasourceId: formValues.sinkId,
      },
      tableMatch: {
        mode: matchMode as any,
      },
    };

    if (matchMode === "1" || matchMode === "4") {
      draft.tableMatch.tables = multiTableList;
    }

    if (matchMode === "2" || matchMode === "3") {
      draft.tableMatch.keyword = tableKeyword;
    }

    return draft;
  };

  const restoreFromDraft = async (draft: WholeSyncTaskDraft) => {
    setSourceType(draft.source);
    setTargetType(draft.target);

    form.setFieldsValue({
      sourceId: draft.source.datasourceId,
      sinkId: draft.target.datasourceId,
      matchMode: draft.tableMatch.mode,
      sourceTable: draft.tableMatch.keyword,
    });

    setMatchMode(draft.tableMatch.mode);
    setDataSourceIdK(draft.source.datasourceId);

    // 表策略恢复
    if (draft.tableMatch.mode === "1") {
      await fetchTables(draft.source.datasourceId, "1");
      setMultiTableList(draft.tableMatch.tables || []);
    }

    if (draft.tableMatch.mode === "4") {
      await fetchTables(draft.source.datasourceId, "4");
    }

    if (draft.tableMatch.mode === "2" || draft.tableMatch.mode === "3") {
      setTableKeyword(draft.tableMatch.keyword || "");
      fetchReferenceTables(
        draft.source.datasourceId,
        draft.tableMatch.mode,
        draft.tableMatch.keyword
      );
    }
  };

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const idFromUrl = query.get("id");

  return (
    <>
      <div className="jy-dc-ui-pro-header">
        <div style={{ padding: "8px 16px 0 16px" }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <a
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      goBack();
                    }}
                  >
                    List of job
                  </a>
                ),
              },
              { title: <span style={{ fontSize: 12 }}>Multi Sync</span> },
            ]}
          />
        </div>

        <div
          className="jy-dc-ui-pro-header-footer"
          style={{ padding: "12px 16px 16px" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <DataSourceSelect
              value={sourceType}
              onChange={handleSourceChange}
              placeholder="SOURCE"
              prefix="SOURCE: "
              width="48%"
              dataSourceOptions={generateDataSourceOptions()}
            />
            <div
              style={{ display: "flex", alignItems: "center", margin: "0 8px" }}
            >
              <IconRightArrow />
            </div>
            <DataSourceSelect
              value={targetType}
              onChange={handleTargetChange}
              placeholder="SINK"
              prefix="SINK: "
              width="48%"
              dataSourceOptions={generateDataSourceOptions()}
            />
          </div>
        </div>
      </div>

      <div style={{ margin: 16, overflow: "hidden" }}>
        <div style={{ backgroundColor: "white", padding: "16px 24px" }}>
          <Header title={"Sync Table"} />
          <SyncTitle />
          <Form form={form} initialValues={{ matchMode: "1" }}>
            <Row gutter={24} style={{ marginBottom: 4 }}>
              <Col span={12}>
                <Form.Item
                  label="数据源"
                  name="sourceId"
                  rules={[{ required: true }]}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  className="custom-form-item"
                >
                  <Select
                    size="small"
                    style={{ width: "99%" }}
                    placeholder="请选择库名"
                    showSearch
                    options={sourceOption}
                    onChange={fetchTables}
                  />
                </Form.Item>

                <Form.Item
                  name="matchMode"
                  label="表名匹配"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  className="custom-form-item"
                >
                  <Radio.Group
                    size="small"
                    value={matchMode}
                    onChange={(e) => {
                      const currentMatchMode = e.target.value;
                      if (
                        currentMatchMode === "4" ||
                        currentMatchMode === "1"
                      ) {
                        fetchTables(dataSourceIdK, currentMatchMode);
                      }
                      setMatchMode(currentMatchMode);
                    }}
                  >
                    <Radio value="1">自定义</Radio>
                    <Radio value="2">正则匹配</Radio>
                    <Radio value="3">精准匹配</Radio>
                    <Radio value="4">整库</Radio>
                  </Radio.Group>
                </Form.Item>

                {/* Conditional rendering based on match mode */}
                {(matchMode === "2" || matchMode === "3") && (
                  <Form.Item
                    label={null}
                    name="sourceTable"
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                    className="custom-form-item"
                  >
                    <TextArea
                      placeholder="请输入表名关键字（最大1000个匹配）"
                      rows={4}
                      style={{
                        width: "99%",
                        marginBottom: 8,
                        marginLeft: "14%",
                      }}
                      value={tableKeyword}
                      onChange={(e) => {
                        const keyword = e.target.value.trim();
                        setTableKeyword(keyword);
                        if (keyword) {
                          debouncedFetchReferenceTables(keyword);
                        } else {
                          setReadOnlyTables([]);
                        }
                      }}
                    />
                  </Form.Item>
                )}
              </Col>

              <Col span={12}>
                <Form.Item
                  label="数据源"
                  name="sinkId"
                  rules={[{ required: true }]}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 18 }}
                  className="custom-form-item"
                >
                  <Select
                    size="small"
                    style={{ width: "99%" }}
                    placeholder="请选择库名"
                    showSearch
                    options={targetOption}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {(matchMode === "1" || matchMode === "4") && (
            <div style={{ padding: "0 6.1%" }}>
              <Spin spinning={loading}>
                <Transfer
                  dataSource={data}
                  listStyle={{ width: "100%", height: 400 }}
                  operations={["", ""]}
                  targetKeys={multiTableList}
                  onChange={(nextKeys: any[], direction, moveKeys) => {
                    if (matchMode === "4") return;
                    setMultiTableList(nextKeys);
                  }}
                  render={(item) => item.title}
                  footer={renderFooter}
                  showSearch
                  filterOption={(inputValue, item) =>
                    item.title.toLowerCase().includes(inputValue.toLowerCase())
                  }
                />
              </Spin>
            </div>
          )}

          {(matchMode === "2" || matchMode === "3") && (
            <div
              style={{ width: "58.8vh", marginLeft: "6%", marginBottom: 12 }}
            >
              <Spin spinning={loading}>
                <Table
                  dataSource={readOnlyTables}
                  loading={loading}
                  bordered
                  scroll={{ x: "max-content", y: 300 }}
                  pagination={false}
                  columns={[
                    {
                      title: "表名",
                      dataIndex: "title",
                      key: "title",
                    },
                  ]}
                />
              </Spin>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          width: "calc(100vw - 224px)",
          padding: "16px 24px",
          background: "white",
          position: "fixed",
          border: "1px solid rgba(227,228,230,1)",
          bottom: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <Button
              size="small"
              style={{ width: 70 }}
              type="primary"
              icon={<SaveOutlined />}
              onClick={async () => {
                try {
                  await form.validateFields();
                  if (
                    matchMode === "1" &&
                    multiTableList &&
                    multiTableList.length === 0
                  ) {
                    message.warning("table_list 不能为空");
                    return;
                  }

                  const sourceId = form?.getFieldValue("sourceId");
                  const sinkId = form?.getFieldValue("sinkId");
                  if (sourceId === sinkId) {
                    message.warning("来源和去向的数据源不能相同！");
                    return;
                  }

                  const draft = buildTaskDraft();
                  const leftSideParam = baseForm?.getFieldsValue();

                  const isEdit = !!baseForm?.getFieldValue("id");

                  const params = {
                    jobDefinitionInfo: JSON.stringify(draft),
                    ...leftSideParam,
                    sourceType: sourceType?.dbType,
                    sinkType: targetType?.dbType,
                    id: idFromUrl,
                  };

                  const res = await seatunnelJobDefinitionApi.saveOrUpdate(params);
                  if (res?.code === 0) {
                    goBack();
                    message.success(isEdit ? "更新成功" : "发布成功");
                  } else {
                    message.error(
                      res?.message || (isEdit ? "更新失败" : "发布失败")
                    );
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Save
            </Button>
            <Divider type="vertical" />

            <Popover
              open={open}
              content={
                <div className={"publish-popover"} style={{ width: 600 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      className={"latest-publish"}
                      style={{ fontWeight: 500 }}
                    >
                      Seatunnel Hocon
                    </div>
                    <div
                      onClick={() => {
                        setOpen(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <CloseIcon />
                    </div>
                  </div>
                  <Tooltip title="hocon模拟生成">
                    <CodeBlockWithCopy content={content} />
                  </Tooltip>
                </div>
              }
            >
              <Button
                style={{ width: 75 }}
                size="small"
                type="primary"
                icon={<FileTextOutlined />}
                onClick={async () => {
                  await form.validateFields();
                  if (
                    matchMode === "1" &&
                    multiTableList &&
                    multiTableList.length === 0
                  ) {
                    message.warning("table_list 不能为空");
                    return;
                  }

                  const sourceId = form?.getFieldValue("sourceId");
                  const sinkId = form?.getFieldValue("sinkId");
                  if (sourceId === sinkId) {
                    message.warning("来源和去向的数据源不能相同！");
                    return;
                  }

                  const draft = buildTaskDraft();
                  const leftSideParam = baseForm?.getFieldsValue();
                  const params = {
                    jobDefinitionInfo: JSON.stringify(draft),
                    ...leftSideParam,
                  };

                  seatunnelJobDefinitionApi.hocon(params).then((data) => {
                    if (data?.code === 0) {
                      setOpen(true);
                      setContent(data?.data);
                    } else {
                      message.error(data?.message || "生成hcon失败");
                    }
                  });
                }}
              >
                Hocon
              </Button>
            </Popover>
          </div>
        </div>
      </div>
    </>
  );
};

export default WholeSync;
