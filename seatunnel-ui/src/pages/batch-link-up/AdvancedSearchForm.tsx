import {
  CheckSquareOutlined,
  CloseOutlined,
  DownOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  theme,
} from "antd";
import moment from "moment";
import { useState } from "react";
import DatabaseIcons from "../data-source/icon/DatabaseIcons";

interface AdvancedSearchFormProps {
  onSearch: (values: any) => void;
  onReset: () => void;
}
const { RangePicker } = DatePicker;
const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
  onReset,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

  const formStyle: React.CSSProperties = {
    maxWidth: "none",
    background: "white",
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const handleFinish = (values: any) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const createDataSourceOption = (dbType: any, value: any) => ({
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <DatabaseIcons dbType={dbType} width={"14"} height={"14"} />
        {dbType}
      </div>
    ),
    value: value || dbType.toUpperCase(),
  });

  const dataSourceOption = [
    createDataSourceOption("MySql", "MYSQL"),
    createDataSourceOption("Oracle", "ORACLE"),
    createDataSourceOption("PgSQL", "PGSQL"),
  ];

  const defaultTimeRange = [
    moment().subtract(4, "days"),
    moment().add(1, "days"),
  ];

  const initialValues = {
    createTime: defaultTimeRange,
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item
            name="jobName"
            label="Job Name"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
          >
            <Input size="small" placeholder="Enter job name" allowClear />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="createTime"
            label="Create Time"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
          >
            <RangePicker size="small" style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={8} style={{ paddingTop: 4, paddingLeft: 42 }}>
          <Space size="small">
            <Button
              type="primary"
              htmlType="submit"
              size="small"
              style={{ width: 70 }}
            >
              Search
            </Button>
            <Button onClick={handleReset} size="small" style={{ width: 70 }}>
              Reset
            </Button>

            <a
              style={{
                fontSize: 12,
                cursor: "pointer",
                color: token.colorPrimary,
              }}
              onClick={() => setExpand(!expand)}
            >
              <DownOutlined rotate={expand ? 180 : 0} />{" "}
              {expand ? "Collapse" : "Expand"}
            </a>
          </Space>
        </Col>
      </Row>

      {/* 第二行：展开内容 */}
      {expand && (
        <>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="id"
                label="Job ID"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <Input size="small" placeholder="Enter job id" allowClear />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <Select
                  placeholder="Select..."
                  size="small"
                  showSearch
                  allowClear
                  options={[
                    {
                      label: (
                        <span>
                          <SyncOutlined spin style={{ color: "blue" }} />
                          &nbsp;&nbsp; RUNNING
                        </span>
                      ),
                      value: "RUNNING",
                    },
                    {
                      label: (
                        <span>
                          <CheckSquareOutlined style={{ color: "green" }} />
                          &nbsp;&nbsp; COMPLETED
                        </span>
                      ),
                      value: "COMPLETED",
                    },
                    {
                      label: (
                        <span>
                          <CloseOutlined style={{ color: "red" }} />
                          &nbsp;&nbsp; FAILED
                        </span>
                      ),
                      value: "FAILED",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="sourceType"
                label="Source"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <Select
                  placeholder="Select..."
                  size="small"
                  options={dataSourceOption}
                  allowClear
                  showSearch
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="sinkType"
                label="Sink"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <Select
                  placeholder="Select..."
                  size="small"
                  options={dataSourceOption}
                  allowClear
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sourceTable"
                label="Source Table"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <Input size="small" placeholder="Fuzzy match..." allowClear />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="sinkTable"
                label="Sink Table"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                <Input size="small" placeholder="Fuzzy match..." allowClear />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </Form>
  );
};

export default AdvancedSearchForm;
