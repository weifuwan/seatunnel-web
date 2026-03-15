import ZetaIcon from "@/pages/batch-link-up/workflow/sider/icon/ZetaIcon";
import { Col, Form, Input, Row, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import IncrementalIcon from "./icon/IncrementalIcon";
import StreamIcon from "./icon/StreamIcon";
type TaskBasicInfoFormProps = {
  form: any;
  sourceType: any;
  sinkType: any;
};

const TaskBasicInfoForm = ({
  form,
  sourceType,
  sinkType,
}: TaskBasicInfoFormProps) => {
  const useTaskGenerator = (sourceType: any, targetType: any) => {
    return `streaming_${sourceType.toLowerCase()}_to_${targetType.toLowerCase()}`;
  };

  return (
    <>
      <Form
        form={form}
        initialValues={{
          jobName: useTaskGenerator(sourceType, sinkType),
          jobType: "STREAMING",
          jobDesc: "stream sync",
          checkpointInterval: "30000",
          checkpointTimeout: "30000",
          parallelism: 1,
          clientId: "123456",
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Job Name"
              name="jobName"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
              rules={[{ required: true }]}
            >
              <Input placeholder="Input..." maxLength={100} size="small" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Job Type"
              name="jobType"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
              rules={[{ required: true }]}
            >
              <Select
                size="small"
                options={[
                  {
                    value: "STREAMING",
                    label: (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <StreamIcon height="12" width="12" /> &nbsp;&nbsp;STREAMING
                      </div>
                    ),
                  },
                  {
                    value: "INCREMENT",
                    label: (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IncrementalIcon height="12" width="12" />{" "}
                        &nbsp;&nbsp;INCREMENT
                      </div>
                    ),
                  },
                ]}
                placeholder="Select..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="ck.interval"
              name="checkpointInterval"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
              rules={[{ required: true }]}
            >
              <Input placeholder="Input..." maxLength={100} size="small" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ck.timeout"
              name="checkpointTimeout"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
              rules={[{ required: true }]}
            >
              <Input size="small" placeholder="Input..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginBottom: 4 }}>
          <Col span={12}>
            <Form.Item
              label="Client"
              name="clientId"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
            >
              <Select
                size="small"
                placeholder="Select..."
                options={[
                  {
                    label: (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <ZetaIcon width="13" height="13" /> &nbsp; ZETA
                      </div>
                    ),
                    value: "123456",
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="parallelism"
              name="parallelism"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
              rules={[{ required: true }]}
            >
              <Input placeholder="Input..." maxLength={100} size="small" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Form.Item
              label="Description"
              name="jobDesc"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
            >
              <TextArea
                showCount
                rows={4}
                placeholder="Input..."
                size="small"
                maxLength={1024}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default TaskBasicInfoForm;
