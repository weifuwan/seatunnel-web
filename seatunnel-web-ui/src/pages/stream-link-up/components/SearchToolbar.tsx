import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select, Space } from "antd";
import React, { useEffect } from "react";

interface SearchToolbarProps {
  keyword: string;
  releaseState?: string;
  sourceType?: string;
  sinkType?: string;

  onKeywordChange: (value: string) => void;
  onReleaseStateChange: (value?: string) => void;
  onSourceTypeChange: (value?: string) => void;
  onSinkTypeChange: (value?: string) => void;
  onReset: () => void;
}

interface SearchFormValues {
  keyword?: string;
  releaseState?: string;
  sourceType?: string;
  sinkType?: string;
}

const releaseStateOptions = [
  { label: "已上线", value: "ONLINE" },
  { label: "已下线", value: "OFFLINE" },
];

const datasourceTypeOptions = [
  { label: "MySQL", value: "MYSQL" },
  { label: "MySQL-CDC", value: "MYSQL-CDC" },
  { label: "Oracle", value: "ORACLE" },
  { label: "PostgreSQL", value: "POSTGRE_SQL" },
  { label: "SQL Server", value: "SQLSERVER" },
  { label: "Kafka", value: "KAFKA" },
  { label: "Doris", value: "DORIS" },
  { label: "StarRocks", value: "STARROCKS" },
  { label: "Elasticsearch", value: "ELASTICSEARCH" },
];

const SearchToolbar: React.FC<SearchToolbarProps> = ({
  keyword,
  releaseState,
  sourceType,
  sinkType,
  onKeywordChange,
  onReleaseStateChange,
  onSourceTypeChange,
  onSinkTypeChange,
  onReset,
}) => {
  const [form] = Form.useForm<SearchFormValues>();

  useEffect(() => {
    form.setFieldsValue({
      keyword,
      releaseState,
      sourceType,
      sinkType,
    });
  }, [form, keyword, releaseState, sourceType, sinkType]);

  const handleSearch = (values: SearchFormValues) => {
    onKeywordChange(values.keyword || "");
    onReleaseStateChange(values.releaseState);
    onSourceTypeChange(values.sourceType);
    onSinkTypeChange(values.sinkType);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const fieldLabel = (text: React.ReactNode) => (
    <span className="text-xs font-medium text-slate-600">{text}</span>
  );

  const commonFormItemProps = {
    className: "mb-0",
    labelCol: {
      flex: "76px",
    },
    wrapperCol: {
      flex: 1,
    },
  };

  return (
    <div className="bg-white px-5 py-4">
      <Form form={form} onFinish={handleSearch}>
        <Row gutter={[16, 14]} align="bottom">
          <Col xs={24} md={12} xl={6}>
            <Form.Item
              {...commonFormItemProps}
              name="keyword"
              label={fieldLabel("任务名称")}
            >
              <Input
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="请输入任务名称"
                className="h-8"
                style={{ borderRadius: 16 }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={5}>
            <Form.Item
              {...commonFormItemProps}
              name="sourceType"
              label={fieldLabel("来源类型")}
            >
              <Select
                allowClear
                showSearch
                placeholder="全部来源"
                options={datasourceTypeOptions}
                className="w-full"
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={5}>
            <Form.Item
              {...commonFormItemProps}
              name="sinkType"
              label={fieldLabel("去向类型")}
            >
              <Select
                allowClear
                showSearch
                placeholder="全部去向"
                options={datasourceTypeOptions}
                className="w-full"
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} xl={4}>
            <Form.Item
              {...commonFormItemProps}
              name="releaseState"
              label={fieldLabel("发布状态")}
            >
              <Select
                allowClear
                placeholder="全部状态"
                options={releaseStateOptions}
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
              </Space>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SearchToolbar;