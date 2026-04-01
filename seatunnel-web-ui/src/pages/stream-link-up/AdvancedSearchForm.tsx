import {
  CheckSquareOutlined,
  CloseOutlined,
  DownOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useIntl } from "@umijs/max";
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
  const intl = useIntl();
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
            label={intl.formatMessage({
              id: "pages.job.search.jobName",
              defaultMessage: "Job Name",
            })}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
          >
            <Input
              size="small"
              placeholder={intl.formatMessage({
                id: "pages.job.search.jobName.placeholder",
                defaultMessage: "Enter job name",
              })}
              allowClear
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name="createTime"
            label={intl.formatMessage({
              id: "pages.job.search.createTime",
              defaultMessage: "Create Time",
            })}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
          >
            <RangePicker size="small" style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={8} style={{ paddingLeft: 42 }}>
          <Space size="small">
            <Button
              type="primary"
              htmlType="submit"
              size="small"
              style={{ width: 70 }}
            >
              {intl.formatMessage({
                id: "pages.job.search.button.search",
                defaultMessage: "Search",
              })}
            </Button>

            <Button onClick={handleReset} size="small" style={{ width: 70 }}>
              {intl.formatMessage({
                id: "pages.job.search.button.reset",
                defaultMessage: "Reset",
              })}
            </Button>

            <a
              style={{
                fontSize: 12,
                cursor: "pointer",
                color: token.colorPrimary,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.25s ease",
              }}
              onClick={() => setExpand(!expand)}
            >
              <span
                style={{
                  display: "inline-flex",
                  transition: "transform 0.25s ease",
                  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <DownOutlined />
              </span>

              <span
                style={{
                  transition: "opacity 0.2s ease, transform 0.25s ease",
                  opacity: 1,
                  transform: expand ? "translateY(0)" : "translateY(0)",
                }}
              >
                {expand
                  ? intl.formatMessage({
                      id: "pages.job.search.collapse",
                      defaultMessage: "Collapse",
                    })
                  : intl.formatMessage({
                      id: "pages.job.search.expand",
                      defaultMessage: "Expand",
                    })}
              </span>
            </a>
          </Space>
        </Col>
      </Row>

      {expand && (
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              name="id"
              label={intl.formatMessage({
                id: "pages.job.search.jobId",
                defaultMessage: "Job ID",
              })}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Input
                size="small"
                placeholder={intl.formatMessage({
                  id: "pages.job.search.jobId.placeholder",
                  defaultMessage: "Enter job id",
                })}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="status"
              label={intl.formatMessage({
                id: "pages.job.search.status",
                defaultMessage: "Status",
              })}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Select
                placeholder={intl.formatMessage({
                  id: "pages.job.search.selectPlaceholder",
                  defaultMessage: "Select...",
                })}
                size="small"
                showSearch
                allowClear
                options={[
                  {
                    label: (
                      <span>
                        <SyncOutlined spin style={{ color: "blue" }} />
                        &nbsp;&nbsp;
                        {intl.formatMessage({
                          id: "pages.job.status.running",
                          defaultMessage: "RUNNING",
                        })}
                      </span>
                    ),
                    value: "RUNNING",
                  },
                  {
                    label: (
                      <span>
                        <CheckSquareOutlined style={{ color: "green" }} />
                        &nbsp;&nbsp;
                        {intl.formatMessage({
                          id: "pages.job.status.completed",
                          defaultMessage: "COMPLETED",
                        })}
                      </span>
                    ),
                    value: "COMPLETED",
                  },
                  {
                    label: (
                      <span>
                        <CloseOutlined style={{ color: "red" }} />
                        &nbsp;&nbsp;
                        {intl.formatMessage({
                          id: "pages.job.status.failed",
                          defaultMessage: "FAILED",
                        })}
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
              label={intl.formatMessage({
                id: "pages.job.search.source",
                defaultMessage: "Source",
              })}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Select
                placeholder={intl.formatMessage({
                  id: "pages.job.search.selectPlaceholder",
                  defaultMessage: "Select...",
                })}
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
              label={intl.formatMessage({
                id: "pages.job.search.sink",
                defaultMessage: "Sink",
              })}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Select
                placeholder={intl.formatMessage({
                  id: "pages.job.search.selectPlaceholder",
                  defaultMessage: "Select...",
                })}
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
              label={intl.formatMessage({
                id: "pages.job.search.sourceTable",
                defaultMessage: "Source Table",
              })}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Input
                size="small"
                placeholder={intl.formatMessage({
                  id: "pages.job.search.fuzzyPlaceholder",
                  defaultMessage: "Fuzzy match...",
                })}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="sinkTable"
              label={intl.formatMessage({
                id: "pages.job.search.sinkTable",
                defaultMessage: "Sink Table",
              })}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              <Input
                size="small"
                placeholder={intl.formatMessage({
                  id: "pages.job.search.fuzzyPlaceholder",
                  defaultMessage: "Fuzzy match...",
                })}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default AdvancedSearchForm;
