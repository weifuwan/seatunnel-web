import {
  CalendarOutlined,
  CaretRightOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { CollapseProps } from "antd";
import {
  Alert,
  Checkbox,
  Collapse,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import "./index.less";
import StepNumberInput from "./StepNumberInput";

const { Text, Link } = Typography;

interface ParamRow {
  key: string;
  paramName: string;
  paramValue: string;
}

const paramData: ParamRow[] = [
  {
    key: "1",
    paramName: "bizdate",
    paramValue: "${add_months(yyyymmdd,-1)}",
  },
];

const labelNodeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  color: "#475467",
  lineHeight: "20px",
};

const formItemStyle: React.CSSProperties = {
  marginBottom: 14,
};

const timeoutUnitOptions = [
  { label: "分钟", value: "minute" },
  { label: "小时", value: "hour" },
];

const SectionLabel: React.FC<{
  title: string;
  tooltip?: string;
}> = ({ title, tooltip }) => {
  return (
    <div className="schedule-section-label">
      <span className="schedule-section-label__text">{title}</span>
      {tooltip ? (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined className="schedule-section-label__icon" />
        </Tooltip>
      ) : null}
    </div>
  );
};

export default function ScheduleConfigContent() {
  const paramColumns: ColumnsType<ParamRow> = [
    {
      title: <span style={{ fontSize: 13, fontWeight: 500 }}>参数名</span>,
      dataIndex: "paramName",
      key: "paramName",
      width: "28%",
      render: (value: string) => (
        <Input
          size="small"
          value={value}
          placeholder="请输入参数名"
          className="rounded-md"
        />
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          参数值{" "}
          <Tooltip title="支持使用时间表达式，例如 ${add_months(yyyymmdd,-1)}">
            <InfoCircleOutlined className="text-[12px] text-[#98A2B3]" />
          </Tooltip>
        </span>
      ),
      dataIndex: "paramValue",
      width: "52%",
      key: "paramValue",
      render: (value: string) => (
        <Input
          size="small"
          value={value}
          placeholder="请输入参数值或表达式"
          className="rounded-md"
        />
      ),
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 500 }}>操作</span>,
      key: "action",
      width: "20%",
      render: () => <a className="schedule-table-action">删除</a>,
    },
  ];

  const items: CollapseProps["items"] = [
    {
      key: "scheduleParams",
      label: (
        <SectionLabel title="调度参数" tooltip="配置任务运行时使用的调度参数" />
      ),
      children: (
        <div className="schedule-section-body">
          <div className="schedule-link-row">
            <Space size={16}>
              <Link className="schedule-link">
                <PlusOutlined />
                添加参数
              </Link>
              <Link className="schedule-link">参数预览</Link>
            </Space>
          </div>

          <div className="schedule-table-card">
            <Table<ParamRow>
              rowKey="key"
              columns={paramColumns}
              dataSource={paramData}
              pagination={false}
              size="small"
            />
          </div>
        </div>
      ),
    },
    {
      key: "scheduleStrategy",
      label: (
        <SectionLabel
          title="调度策略"
          tooltip="配置实例生成、资源组和重跑策略"
        />
      ),
      children: (
        <div className="schedule-section-body">
          <div className="schedule-inner-panel">
            <Form
              layout="horizontal"
              component={false}
              labelCol={{ flex: "118px" }}
              wrapperCol={{ flex: "1" }}
              labelAlign="left"
              initialValues={{
                timeoutMode: "system",
                timeoutValue: 1,
                timeoutUnit: "hour",
                rerunPolicy: "success_or_fail",
                autoRetry: true,
                retryTimes: 1,
                retryInterval: 1,
              }}
            >
              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>实例生成方式</span>}
                required
              >
                <Radio.Group defaultValue="nextDay">
                  <Space size={16} wrap>
                    <Radio value="nextDay">T+1次日生成</Radio>
                    <Radio value="immediately">发布后即时生成</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>调度类型</span>}
                required
              >
                <Radio.Group defaultValue="normal">
                  <Space size={16} wrap>
                    <Radio value="normal">正常调度</Radio>
                    <Radio value="pause">暂停调度</Radio>
                    <Radio value="empty">空跑调度</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>超时定义</span>}
                required
              >
                <Space size={12} wrap align="center">
                  <Form.Item name="timeoutMode" noStyle>
                    <Radio.Group>
                      <Space size={16} wrap>
                        <Radio value="system">系统默认</Radio>
                        <Radio value="custom">自定义</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) =>
                      prev.timeoutMode !== cur.timeoutMode
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue("timeoutMode") === "custom" ? (
                        <Space size={8} align="center">
                          <Form.Item name="timeoutValue" noStyle>
                            <InputNumber
                              min={1}
                              precision={0}
                              controls
                              size="small"
                              style={{ width: 72 }}
                            />
                          </Form.Item>

                          <Form.Item name="timeoutUnit" noStyle>
                            <Select
                              options={timeoutUnitOptions}
                              style={{ width: 88 }}
                              size="small"
                            />
                          </Form.Item>
                        </Space>
                      ) : null
                    }
                  </Form.Item>
                </Space>
              </Form.Item>

              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>重跑属性</span>}
                required
                name="rerunPolicy"
              >
                <Select
                  size="small"
                  className="w-[380px] max-w-full"
                  options={[
                    {
                      label: "运行成功或失败后皆可重跑",
                      value: "success_or_fail",
                    },
                    {
                      label: "仅运行失败后可重跑",
                      value: "fail_only",
                    },
                    {
                      label: "禁止重跑",
                      value: "disabled",
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>失败自动重跑</span>}
                name="autoRetry"
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.autoRetry !== cur.autoRetry}
              >
                {({ getFieldValue }) =>
                  getFieldValue("autoRetry") ? (
                    <>
                      <Form.Item
                        style={formItemStyle}
                        label={<span style={labelNodeStyle}>重跑次数</span>}
                      >
                        <Space size={8} align="center">
                          <Form.Item name="retryTimes" noStyle>
                            <StepNumberInput min={1} width={48} />
                          </Form.Item>
                          <span style={{ color: "#667085", fontSize: 13 }}>次</span>
                        </Space>
                      </Form.Item>

                      <Form.Item
                        style={formItemStyle}
                        label={<span style={labelNodeStyle}>重跑间隔</span>}
                      >
                        <Space size={8} align="center">
                          <Form.Item name="retryInterval" noStyle>
                            <StepNumberInput min={1} width={48} />
                          </Form.Item>
                          <span style={{ color: "#667085", fontSize: 13 }}>分钟</span>
                        </Space>
                      </Form.Item>
                    </>
                  ) : null
                }
              </Form.Item>
            </Form>
          </div>
        </div>
      ),
    },
    {
      key: "scheduleTime",
      label: (
        <SectionLabel title="调度时间" tooltip="配置周期、时间和生效规则" />
      ),
      children: (
        <div className="schedule-section-body">
          <div className="schedule-inner-panel">
            <Alert
              className="mb-4 rounded-lg"
              type="info"
              showIcon
              message={
                <span className="text-[13px]">调度时区为 Asia/Shanghai</span>
              }
            />

            <Form
              layout="horizontal"
              component={false}
              labelCol={{ flex: "118px" }}
              wrapperCol={{ flex: "1" }}
              labelAlign="left"
            >
              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>调度周期</span>}
                required
              >
                <Select
                  size="small"
                  className="w-[140px]"
                  defaultValue="day"
                  options={[
                    { label: "日", value: "day" },
                    { label: "周", value: "week" },
                    { label: "月", value: "month" },
                    { label: "小时", value: "hour" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>调度时间</span>}
                required
              >
                <Input
                  size="small"
                  className="w-[180px]"
                  defaultValue="00:17"
                  suffix={<CalendarOutlined className="text-[#98A2B3]" />}
                />
              </Form.Item>

              <Form.Item
                style={formItemStyle}
                label={<span style={labelNodeStyle}>生效日期</span>}
                required
              >
                <Radio.Group defaultValue="forever">
                  <Space size={16} wrap>
                    <Radio value="forever">永久生效</Radio>
                    <Radio value="assign">指定时间</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                style={{ marginBottom: 2 }}
                label={<span style={labelNodeStyle}>Cron表达式</span>}
              >
                <div className="inline-flex min-h-8 items-center gap-3">
                  <Text className="text-[13px] text-[#344054]">
                    00 17 00 * * ?
                  </Text>
                  <a className="text-[12px]">复制</a>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="schedule-config-content">
      <div className="schedule-config-content__scroll">
        <Collapse
          ghost
          defaultActiveKey={[
            "scheduleParams",
            "scheduleStrategy",
            "scheduleTime",
          ]}
          expandIconPosition="start"
          className="schedule-config-collapse"
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              className={`schedule-config-collapse__arrow ${
                isActive ? "is-active" : ""
              }`}
            />
          )}
          items={items}
        />
      </div>
    </div>
  );
}
