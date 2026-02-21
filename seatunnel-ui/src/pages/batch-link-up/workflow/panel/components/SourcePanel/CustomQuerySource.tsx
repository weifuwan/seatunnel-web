// components/SourceConfigTab/CustomQuerySource.tsx
import { FC } from "react";
import { Form } from "antd";
import TextArea from "antd/es/input/TextArea";

interface CustomQuerySourceProps {
  form: any;
  onTableChange: (value: any) => void
}

const CustomQuerySource: FC<CustomQuerySourceProps> = ({ form, onTableChange }) => {
  return (
    <Form.Item
      label="自定义查询"
      name="query"
      rules={[{ required: true }]}
    >
      <TextArea rows={9} maxLength={40000} showCount onChange={onTableChange}/>
    </Form.Item>
  );
};

export default CustomQuerySource;