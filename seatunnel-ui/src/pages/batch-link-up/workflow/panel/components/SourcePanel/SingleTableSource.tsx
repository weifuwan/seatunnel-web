// components/SourceConfigTab/SingleTableSource.tsx
import { FC } from "react";
import { Form, Select } from "antd";
import { TableOutlined } from "@ant-design/icons";

interface SingleTableSourceProps {
  form: any;
  sourceTableOption: any[];
  onTableChange: (value: string) => void;
}

const SingleTableSource: FC<SingleTableSourceProps> = ({
  form,
  sourceTableOption,
  onTableChange,
}) => {
  return (
    <Form.Item
      label="表名"
      name="table_path"
      rules={[{ required: true }]}
    >
      <Select
        prefix={<TableOutlined style={{ color: "orange" }} />}
        size="small"
        placeholder="请选择表名"
        allowClear
        onChange={onTableChange}
        options={sourceTableOption || []}
        showSearch
      />
    </Form.Item>
  );
};

export default SingleTableSource;