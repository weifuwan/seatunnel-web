import {
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  MenuProps,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import Search from "antd/es/input/Search";
import type { ColumnsType } from "antd/es/table";
import React, { useMemo, useState } from "react";

const { confirm } = Modal;
const { Title, Text } = Typography;
const { TextArea } = Input;

type MenuKey = "connector" | "time";

interface BaseParamItem {
  id: number;
  paramName: string;
  paramDesc: string;
  defaultValue?: string;
  exampleValue?: string;
}

interface ConnectorParamItem extends BaseParamItem {
  type: "connector";
  connectorName: string;
  paramType: string;
  required: boolean;
}

interface TimeParamItem extends BaseParamItem {
  type: "time";
  timeFormat: string;
  expression?: string;
}

type ParamItem = ConnectorParamItem | TimeParamItem;

interface FormValues {
  connectorName?: string;
  paramName: string;
  paramDesc: string;
  paramType?: string;
  required?: boolean;
  defaultValue?: string;
  exampleValue?: string;
  timeFormat?: string;
  expression?: string;
}

const PRIMARY_COLOR = "hsl(231 48% 48%)";
const PRIMARY_BG = "#eaf2ff";
const INFO_BG = "#f0f6ff";
const INFO_BORDER = "#d6e4ff";

const menuList: { key: MenuKey; label: string }[] = [
  { key: "connector", label: "Connector解释" },
  { key: "time", label: "时间解释" },
];

const initialData: Record<MenuKey, ParamItem[]> = {
  connector: [
    {
      id: 1,
      type: "connector",
      connectorName: "Jdbc",
      paramName: "parallelism",
      paramDesc: "任务并行度，用于控制当前作业执行的并发数量",
      paramType: "number",
      required: false,
      defaultValue: "1",
      exampleValue: "2",
    },
    {
      id: 2,
      type: "connector",
      connectorName: "Jdbc",
      paramName: "query",
      paramDesc: "自定义查询 SQL，用于抽取源端数据",
      paramType: "string",
      required: true,
      defaultValue: "",
      exampleValue:
        "select * from user_info where update_time >= '${start_time}'",
    },
    {
      id: 3,
      type: "connector",
      connectorName: "ClickHouse",
      paramName: "table",
      paramDesc: "目标表名称",
      paramType: "string",
      required: true,
      defaultValue: "",
      exampleValue: "ods_user_info",
    },
  ],
  time: [
    {
      id: 101,
      type: "time",
      paramName: "start_time",
      paramDesc: "任务开始时间，通常用于增量抽取范围下界",
      timeFormat: "yyyy-MM-dd HH:mm:ss",
      defaultValue: "${now-1d}",
      exampleValue: "2026-03-10 00:00:00",
      expression: "当前时间减1天",
    },
    {
      id: 102,
      type: "time",
      paramName: "end_time",
      paramDesc: "任务结束时间，通常用于增量抽取范围上界",
      timeFormat: "yyyy-MM-dd HH:mm:ss",
      defaultValue: "${now}",
      exampleValue: "2026-03-11 00:00:00",
      expression: "当前时间",
    },
    {
      id: 103,
      type: "time",
      paramName: "biz_date",
      paramDesc: "业务日期参数，常用于按天分区同步",
      timeFormat: "yyyy-MM-dd",
      defaultValue: "${today}",
      exampleValue: "2026-03-10",
      expression: "当天日期",
    },
  ],
};

const pageTitleMap: Record<MenuKey, string> = {
  connector: "Connector解释",
  time: "时间解释",
};

const pageDescMap: Record<MenuKey, string> = {
  connector:
    "请维护各类 Connector 的参数解释、类型、必填规则、默认值与示例，帮助系统更准确地生成配置与任务定义。",
  time: "请维护时间变量、格式规则、动态表达式和默认值，帮助系统正确解析时间相关参数并生成可执行配置。",
};

const infoTextMap: Record<MenuKey, string> = {
  connector:
    "示例：Connector：Jdbc，参数名称：parallelism，参数说明：任务并行度，参数类型：number，是否必填：否，默认值：1",
  time: "示例：参数名称：start_time，参数说明：开始时间，时间格式：yyyy-MM-dd HH:mm:ss，默认值：${now-1d}",
};

const connectorTypeOptions = [
  { label: "string", value: "string" },
  { label: "number", value: "number" },
  { label: "boolean", value: "boolean" },
  { label: "array", value: "array" },
  { label: "object", value: "object" },
];

const timeFormatOptions = [
  { label: "yyyy-MM-dd", value: "yyyy-MM-dd" },
  { label: "yyyy-MM-dd HH:mm:ss", value: "yyyy-MM-dd HH:mm:ss" },
  { label: "timestamp", value: "timestamp" },
  { label: "cron", value: "cron" },
  { label: "dynamic-expression", value: "dynamic-expression" },
];

const connectorNameOptions = [
  { label: "Jdbc", value: "Jdbc" },
  { label: "MySQL-CDC", value: "MySQL-CDC" },
  { label: "ClickHouse", value: "ClickHouse" },
  { label: "Hive", value: "Hive" },
  { label: "Doris", value: "Doris" },
  { label: "Kafka", value: "Kafka" },
];

const Index: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("connector");
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] =
    useState<Record<MenuKey, ParamItem[]>>(initialData);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ParamItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const currentList = useMemo(() => {
    const list = tableData[activeMenu] || [];
    const kw = keyword.trim().toLowerCase();
    if (!kw) return list;

    return list.filter((item) => {
      const fields = [
        item.paramName,
        item.paramDesc,
        item.defaultValue,
        item.exampleValue,
        item.type === "connector" ? item.connectorName : "",
        item.type === "connector" ? item.paramType : "",
        item.type === "time" ? item.timeFormat : "",
        item.type === "time" ? item.expression || "" : "",
      ];

      return fields.some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(kw)
      );
    });
  }, [tableData, activeMenu, keyword]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const openAddModal = () => {
    setEditingRecord(null);
    form.resetFields();

    if (activeMenu === "connector") {
      form.setFieldsValue({
        required: false,
        paramType: "string",
      });
    } else {
      form.setFieldsValue({
        timeFormat: "yyyy-MM-dd HH:mm:ss",
      });
    }

    setModalOpen(true);
  };

  const openEditModal = (record: ParamItem) => {
    setEditingRecord(record);

    if (record.type === "connector") {
      form.setFieldsValue({
        connectorName: record.connectorName,
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        paramType: record.paramType,
        required: record.required,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
      });
    } else {
      form.setFieldsValue({
        paramName: record.paramName,
        paramDesc: record.paramDesc,
        timeFormat: record.timeFormat,
        defaultValue: record.defaultValue,
        exampleValue: record.exampleValue,
        expression: record.expression,
      });
    }

    setModalOpen(true);
  };

  const handleDelete = (record: ParamItem) => {
    confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定删除「${record.paramName}」吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk() {
        setTableData((prev) => ({
          ...prev,
          [activeMenu]: prev[activeMenu].filter(
            (item) => item.id !== record.id
          ),
        }));
        setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));
        message.success("删除成功");
      },
    });
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) {
      message.warning("请先选择数据");
      return;
    }

    confirm({
      title: "确认批量删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定删除已选中的 ${selectedRowKeys.length} 条数据吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk() {
        setTableData((prev) => ({
          ...prev,
          [activeMenu]: prev[activeMenu].filter(
            (item) => !selectedRowKeys.includes(item.id)
          ),
        }));
        setSelectedRowKeys([]);
        message.success("批量删除成功");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const nextId = Date.now();

      if (activeMenu === "connector") {
        const payload: ConnectorParamItem = {
          id: editingRecord?.id ?? nextId,
          type: "connector",
          connectorName: values.connectorName || "",
          paramName: values.paramName,
          paramDesc: values.paramDesc,
          paramType: values.paramType || "string",
          required: !!values.required,
          defaultValue: values.defaultValue || "",
          exampleValue: values.exampleValue || "",
        };

        setTableData((prev) => ({
          ...prev,
          connector: editingRecord
            ? prev.connector.map((item) =>
                item.id === editingRecord.id ? payload : item
              )
            : [payload, ...prev.connector],
        }));
      } else {
        const payload: TimeParamItem = {
          id: editingRecord?.id ?? nextId,
          type: "time",
          paramName: values.paramName,
          paramDesc: values.paramDesc,
          timeFormat: values.timeFormat || "yyyy-MM-dd HH:mm:ss",
          defaultValue: values.defaultValue || "",
          exampleValue: values.exampleValue || "",
          expression: values.expression || "",
        };

        setTableData((prev) => ({
          ...prev,
          time: editingRecord
            ? prev.time.map((item) =>
                item.id === editingRecord.id ? payload : item
              )
            : [payload, ...prev.time],
        }));
      }

      message.success(editingRecord ? "编辑成功" : "新增成功");
      resetModal();
    } catch (error) {
      // antd form validate error
    } finally {
      setSubmitting(false);
    }
  };

  const batchMenus: MenuProps["items"] = [
    {
      key: "delete",
      label: "批量删除",
      onClick: handleBatchDelete,
    },
  ];

  const actionColumn = {
    title: "操作",
    key: "action",
    width: 160,
    fixed: "right" as const,
    render: (_: unknown, record: ParamItem) => (
      <Space size={16}>
        <a
          onClick={() => openEditModal(record)}
          style={{ color: PRIMARY_COLOR }}
        >
          编辑
        </a>
        <a onClick={() => handleDelete(record)} style={{ color: "#ff4d4f" }}>
          删除
        </a>
      </Space>
    ),
  };

  const connectorColumns: ColumnsType<ParamItem> = [
    {
      title: "Connector",
      dataIndex: "connectorName",
      key: "connectorName",
      width: 160,
      render: (_, record) =>
        record.type === "connector" ? (
          <Tag color="blue">{record.connectorName}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "参数名称",
      dataIndex: "paramName",
      key: "paramName",
      width: 200,
      ellipsis: true,
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: "参数说明",
      dataIndex: "paramDesc",
      key: "paramDesc",
      ellipsis: true,
    },
    {
      title: "参数类型",
      dataIndex: "paramType",
      key: "paramType",
      width: 120,
      render: (_, record) =>
        record.type === "connector" ? (
          <Tag color="processing">{record.paramType}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "是否必填",
      dataIndex: "required",
      key: "required",
      width: 100,
      render: (_, record) =>
        record.type === "connector" ? (
          record.required ? (
            <Tag color="error">必填</Tag>
          ) : (
            <Tag>非必填</Tag>
          )
        ) : (
          "-"
        ),
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 160,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "示例值",
      dataIndex: "exampleValue",
      key: "exampleValue",
      width: 240,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    actionColumn,
  ];

  const timeColumns: ColumnsType<ParamItem> = [
    {
      title: "参数名称",
      dataIndex: "paramName",
      key: "paramName",
      width: 220,
      ellipsis: true,
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: "参数说明",
      dataIndex: "paramDesc",
      key: "paramDesc",
      ellipsis: true,
    },
    {
      title: "时间格式",
      dataIndex: "timeFormat",
      key: "timeFormat",
      width: 180,
      render: (_, record) =>
        record.type === "time" ? (
          <Tag color="blue">{record.timeFormat}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 180,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "动态表达式",
      dataIndex: "expression",
      key: "expression",
      width: 180,
      ellipsis: true,
      render: (_, record) =>
        record.type === "time" && record.expression ? (
          <Text>{record.expression}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "示例值",
      dataIndex: "exampleValue",
      key: "exampleValue",
      width: 180,
      ellipsis: true,
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : <Text type="secondary">-</Text>,
    },
    actionColumn,
  ];

  const columns = activeMenu === "connector" ? connectorColumns : timeColumns;

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 48px)",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        <div
          style={{
            width: 220,
            borderRight: "1px solid #F0F0F0",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              padding: "14px 16px",
              boxSizing: "border-box",
              borderBottom: "1px solid #F0F0F0",
            }}
          >
            知识管理
          </div>

          <div style={{ padding: "12px 8px" }}>
            {menuList.map((item) => {
              const active = activeMenu === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => {
                    setActiveMenu(item.key);
                    setSelectedRowKeys([]);
                    setKeyword("");
                  }}
                  style={{
                    height: 40,
                    lineHeight: "40px",
                    padding: "0 16px",
                    marginBottom: 4,
                    borderRadius: 8,
                    cursor: "pointer",
                    color: active ? PRIMARY_COLOR : "#262626",
                    background: active ? PRIMARY_BG : "transparent",
                    fontWeight: active ? 500 : 400,
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "20px 20px 16px",
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Title level={2} style={{ margin: 0, fontSize: 28 }}>
              {pageTitleMap[activeMenu]}
            </Title>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {pageDescMap[activeMenu]}
            </Text>
          </div>

          <div
            style={{
              marginBottom: 24,
              minHeight: 30,
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: 6,
              background: INFO_BG,
              border: `1px solid ${INFO_BORDER}`,
              color: PRIMARY_COLOR,
              fontSize: 13,
            }}
          >
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            <span>{infoTextMap[activeMenu]}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Search
              allowClear
              placeholder="搜索参数名称、说明、类型、格式等"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              // prefix={<SearchOutlined />}
              style={{ width: 280 }}
            />

            <Space>
              <Dropdown menu={{ items: batchMenus }} trigger={["click"]}>
                <Button>
                  批量操作
                  <span style={{ marginLeft: 4, fontSize: 12 }}>▼</span>
                </Button>
              </Dropdown>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{ borderRadius: 8 }}
              >
                新增
              </Button>
            </Space>
          </div>

          <div
            style={{
              border: "1px solid #F0F0F0",
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <Table<ParamItem>
              rowKey="id"
              columns={columns}
              dataSource={currentList}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条`,
              }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "48px 0" }}>
                    <Empty description="暂无数据" />
                  </div>
                ),
              }}
              scroll={{ x: 1200, y: "calc(100vh - 360px)" }}
            />
          </div>
        </div>
      </div>

      <Modal
        title={
          <div
            style={{
              padding: "20px 24px 0 24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {editingRecord ? "编辑参数" : "新增参数"}
          </div>
        }
        open={modalOpen}
        onCancel={resetModal}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnClose
        maskClosable={false}
        width={720}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ padding: "0 24px" }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ required: false }}
            style={{ marginTop: 20 }}
          >
            {activeMenu === "connector" ? (
              <>
                <Form.Item
                  label="Connector"
                  name="connectorName"
                  rules={[
                    { required: true, message: "请输入或选择 Connector" },
                  ]}
                >
                  <Select
                    placeholder="请选择 Connector"
                    options={connectorNameOptions}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>

                <Form.Item
                  label="参数名称"
                  name="paramName"
                  rules={[{ required: true, message: "请输入参数名称" }]}
                >
                  <Input placeholder="请输入参数名称，如 parallelism / query / table" />
                </Form.Item>

                <Form.Item
                  label="参数说明"
                  name="paramDesc"
                  rules={[{ required: true, message: "请输入参数说明" }]}
                >
                  <TextArea
                    placeholder="请输入参数说明"
                    rows={4}
                    showCount
                    maxLength={300}
                  />
                </Form.Item>

                <div style={{ display: "flex", gap: 16 }}>
                  <Form.Item
                    label="参数类型"
                    name="paramType"
                    rules={[{ required: true, message: "请选择参数类型" }]}
                    style={{ flex: 1 }}
                  >
                    <Select
                      placeholder="请选择参数类型"
                      options={connectorTypeOptions}
                    />
                  </Form.Item>

                  <Form.Item
                    label="是否必填"
                    name="required"
                    valuePropName="checked"
                    style={{ width: 160 }}
                  >
                    <Switch checkedChildren="必填" unCheckedChildren="非必填" />
                  </Form.Item>
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <Form.Item
                    label="默认值"
                    name="defaultValue"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="请输入默认值" />
                  </Form.Item>

                  <Form.Item
                    label="示例值"
                    name="exampleValue"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="请输入示例值" />
                  </Form.Item>
                </div>
              </>
            ) : (
              <>
                <Form.Item
                  label="参数名称"
                  name="paramName"
                  rules={[{ required: true, message: "请输入参数名称" }]}
                >
                  <Input placeholder="请输入时间参数名称，如 start_time / end_time / biz_date" />
                </Form.Item>

                <Form.Item
                  label="参数说明"
                  name="paramDesc"
                  rules={[{ required: true, message: "请输入参数说明" }]}
                >
                  <TextArea
                    placeholder="请输入参数说明"
                    rows={4}
                    showCount
                    maxLength={300}
                  />
                </Form.Item>

                <Form.Item
                  label="时间格式"
                  name="timeFormat"
                  rules={[{ required: true, message: "请选择时间格式" }]}
                >
                  <Select
                    placeholder="请选择时间格式"
                    options={timeFormatOptions}
                  />
                </Form.Item>

                <div style={{ display: "flex", gap: 16 }}>
                  <Form.Item
                    label="默认值"
                    name="defaultValue"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="如 ${now} / ${today} / ${now-1d}" />
                  </Form.Item>

                  <Form.Item
                    label="示例值"
                    name="exampleValue"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="如 2026-03-10 00:00:00" />
                  </Form.Item>
                </div>

                <Form.Item label="动态表达式说明" name="expression">
                  <Input placeholder="如 当前时间减1天 / 当天日期 / 当前小时整点" />
                </Form.Item>
              </>
            )}
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default Index;
