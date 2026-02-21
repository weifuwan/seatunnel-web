import Header from "@/components/Header";
import { Form, Input } from "antd";

function EnvConfig() {
  return (
    <>
      <Header
        title={<span style={{ fontSize: 12, fontWeight: 500 }}>Env Setting</span>}
      />
      <Form.Item
        label="parallelism"
        name="parallelism"
        rules={[{ required: true, message: "parallelism不能为空" }]}
      >
        <Input size="small" />
      </Form.Item>
    </>
  );
}
export default EnvConfig;
