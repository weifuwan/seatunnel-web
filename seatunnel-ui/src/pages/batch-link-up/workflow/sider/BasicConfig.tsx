import Header from "@/components/Header";
import { Form, Input, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";

const BasicConfig = () =>  {
  return (
    <>
      <Header title={<span style={{fontSize: 12, fontWeight: 500}}>Basic Setting</span>} />

      <Form.Item
        label="Job name"
        name="jobName"
        rules={[{ required: true, message: "任务名称不能为空" }]}
      >
        <Input size="small" />
      </Form.Item>

      <Form.Item label="Job Description" name="jobDesc">
        <TextArea rows={4} size="small" />
      </Form.Item>

      {/* <Form.Item
        label="Client"
        name="clientId"
        rules={[{ required: true, message: "客户端不能为空" }]}
      >
        <Input size="small" />
      </Form.Item> */}

      <Form.Item
        label="Multi Sync"
        name="wholeSync"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </>
  );
}
export default BasicConfig;
