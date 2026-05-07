import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Space } from "antd";
import React, { useEffect, useState } from "react";

interface SearchToolbarProps {
  keyword: string;
  status?: string;
  direction?: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value?: string) => void;
  onDirectionChange: (value?: string) => void;
  onReset: () => void;
}

interface SearchFormValues {
  keyword?: string;
  status?: string;
  direction?: string;
  minLatency?: string;
  maxLatency?: string;
  checkpoint?: string;
}

const directionOptions = [
  { label: "MySQL → Kafka", value: "MYSQL_KAFKA" },
  { label: "MySQL CDC → StarRocks", value: "MYSQL_STARROCKS" },
  { label: "Kafka → Elasticsearch", value: "KAFKA_ELASTICSEARCH" },
  { label: "PostgreSQL → Kafka", value: "POSTGRESQL_KAFKA" },
];

const statusOptions = [
  { label: "RUNNING", value: "RUNNING" },
  { label: "WARNING", value: "WARNING" },
  { label: "PAUSED", value: "PAUSED" },
  { label: "STOPPED", value: "STOPPED" },
];

const SearchToolbar: React.FC<SearchToolbarProps> = ({
  keyword,
  status,
  direction,
  onKeywordChange,
  onStatusChange,
  onDirectionChange,
  onReset,
}) => {
  const [form] = Form.useForm<SearchFormValues>();
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      keyword,
      status,
      direction,
    });
  }, [form, keyword, status, direction]);

  const handleSearch = (values: SearchFormValues) => {
    onKeywordChange(values.keyword || "");
    onStatusChange(values.status);
    onDirectionChange(values.direction);
  };

  const handleReset = () => {
    form.setFieldsValue({
      keyword: undefined,
      status: undefined,
      direction: undefined,
      minLatency: undefined,
      maxLatency: undefined,
      checkpoint: undefined,
    });

    onReset();
  };

  const fieldLabel = (text: React.ReactNode) => (
    <span className="text-xs font-medium text-slate-600">{text}</span>
  );

  const commonFormItemProps = {
    className: "mb-0",
    labelCol: {
      flex: "86px",
    },
    wrapperCol: {
      flex: 1,
    },
  };

  return (
    <div className="bg-white px-5 py-4">
      <Form form={form} onFinish={handleSearch}>
        <Row gutter={[16, 14]} align="bottom">
          <Col xs={24} md={12} xl={7}>
            <Form.Item
              {...commonFormItemProps}
              name="keyword"
              label={fieldLabel("任务名称")}
            >
              <Input
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="请输入任务名称 / ID"
                className="h-8"
                style={{ borderRadius: 16 }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={7}>
            <Form.Item
              {...commonFormItemProps}
              name="direction"
              label={fieldLabel("同步方向")}
            >
              <Select
                allowClear
                showSearch
                placeholder="请选择同步方向"
                options={directionOptions}
                className="w-full"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={6}>
            <Form.Item
              {...commonFormItemProps}
              name="status"
              label={fieldLabel("任务状态")}
            >
              <Select
                allowClear
                placeholder="全部状态"
                options={statusOptions}
                className="w-full"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={4}>
            <div className="flex h-8 items-center justify-start md:justify-end">
              <Space size={8}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="h-8 rounded-full border-none px-5 font-medium shadow-none"
                >
                  搜索
                </Button>

                <Button
                  onClick={handleReset}
                  className="h-8 rounded-full border-slate-200 px-5 text-slate-600 hover:!border-slate-300 hover:!text-slate-900"
                >
                  重置
                </Button>

                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                  onClick={() => setExpand((prev) => !prev)}
                >
                  {expand ? "收起" : "展开"}
                  <DownOutlined
                    className={[
                      "text-[10px] transition-transform duration-200",
                      expand ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  />
                </button>
              </Space>
            </div>
          </Col>
        </Row>

        {expand && (
          <Row gutter={[16, 14]} className="mt-4" align="bottom">
            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="minLatency"
                label={fieldLabel("最小延迟")}
              >
                <Input
                  allowClear
                  placeholder="例如 100"
                  suffix={<span className="text-xs text-slate-400">ms</span>}
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={7}>
              <Form.Item
                {...commonFormItemProps}
                name="maxLatency"
                label={fieldLabel("最大延迟")}
              >
                <Input
                  allowClear
                  placeholder="例如 500"
                  suffix={<span className="text-xs text-slate-400">ms</span>}
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={6}>
              <Form.Item
                {...commonFormItemProps}
                name="checkpoint"
                label={fieldLabel("检查点")}
              >
                <Input
                  allowClear
                  placeholder="offset / binlog / lsn"
                  className="h-8"
                  style={{ borderRadius: 16 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} xl={4} />
          </Row>
        )}
      </Form>
    </div>
  );
};

export default SearchToolbar;