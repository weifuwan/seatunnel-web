import { Form, Row, Col, Select, Radio, Input } from "antd";
import { FormInstance } from "antd/es/form";
import Header from "@/components/Header";

import { DbType, DataSourceOption } from "../types";
import SyncTitle from "../SyncTitle";

const { TextArea } = Input;

interface SyncFormProps {
  form: FormInstance;
  sourceType: DbType;
  targetType: DbType;
  sourceOption: DataSourceOption[];
  targetOption: DataSourceOption[];
  matchMode: string;
  tableKeyword: string;
  dataSourceIdK: string;
  loading: boolean;
  onSourceIdChange: (value: string) => void;
  onMatchModeChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onDebouncedFetch: (keyword: string) => void;
  onClearTables: () => void;
}

const SyncForm: React.FC<SyncFormProps> = ({
  form,
  sourceType,
  targetType,
  sourceOption,
  targetOption,
  matchMode,
  tableKeyword,
  dataSourceIdK,
  loading,
  onSourceIdChange,
  onMatchModeChange,
  onKeywordChange,
  onDebouncedFetch,
  onClearTables,
}) => {
  return (
    <div style={{ backgroundColor: "white", padding: "16px 24px 0 24px" }}>
      <Header title={"表配置"} />
      <SyncTitle />
      <Form form={form} initialValues={{ matchMode: "1" }}>
        <Row gutter={24} style={{ marginBottom: 4 }}>
          <Col span={12}>
            <Form.Item
              label="来源数据源"
              name="sourceId"
              rules={[{ required: true, message: "请选择来源数据源" }]}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              className="custom-form-item"
            >
              <Select
                size="small"
                style={{ width: "99%" }}
                placeholder="请选择来源数据源"
                showSearch
                options={sourceOption}
                onChange={onSourceIdChange}
              />
            </Form.Item>

            <Form.Item
              name="matchMode"
              label="匹配方式"
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              className="custom-form-item"
            >
              <Radio.Group
                size="small"
                value={matchMode}
                onChange={(e) => onMatchModeChange(e.target.value)}
              >
                <Radio value="1">自定义选择</Radio>
                <Radio value="2">正则匹配</Radio>
                <Radio value="4">整库同步</Radio>
              </Radio.Group>
            </Form.Item>

            {matchMode === "2" && (
              <Form.Item
                label={null}
                name="sourceTable"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                className="custom-form-item"
              >
                <TextArea
                  placeholder="请输入表名匹配规则"
                  rows={4}
                  style={{
                    width: "99%",
                    marginBottom: 8,
                    marginLeft: "14%",
                  }}
                  value={tableKeyword}
                  onChange={(e) => {
                    const keyword = e.target.value.trim();
                    onKeywordChange(keyword);
                    if (keyword) {
                      onDebouncedFetch(keyword);
                    } else {
                      onClearTables();
                    }
                  }}
                />
              </Form.Item>
            )}
          </Col>

          <Col span={12}>
            <Form.Item
              label="目标数据源"
              name="sinkId"
              rules={[{ required: true, message: "请选择目标数据源" }]}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 18 }}
              className="custom-form-item"
            >
              <Select
                size="small"
                style={{ width: "99%" }}
                placeholder="请选择目标数据源"
                showSearch
                options={targetOption}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SyncForm;