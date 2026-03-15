import { FC } from "react";
import { Form, Select } from "antd";
import { TableOutlined } from "@ant-design/icons";

interface OptionItem {
  label: string;
  value: string;
  [key: string]: any;
}

interface SingleTableSourceProps {
  sourceTableOption: OptionItem[];
  tableLoading?: boolean;
  columnLoading?: boolean;
  onTableChange: (value: string) => Promise<void> | void;
}

const SingleTableSource: FC<SingleTableSourceProps> = ({
  sourceTableOption,
  tableLoading = false,
  columnLoading = false,
  onTableChange,
}) => {
  const loading = tableLoading || columnLoading;

  return (
    <Form.Item
      label="表名"
      name="table_path"
      rules={[{ required: true, message: "请选择表名" }]}
      extra={columnLoading ? "正在同步表字段，请稍候..." : undefined}
    >
      <Select
        prefix={<TableOutlined style={{ color: "orange" }} />}
        size="small"
        allowClear
        showSearch
        loading={loading}
        disabled={tableLoading}
        placeholder={
          tableLoading
            ? "正在加载表列表..."
            : columnLoading
            ? "正在加载字段..."
            : "请选择表名"
        }
        onChange={onTableChange}
        options={sourceTableOption || []}
        optionFilterProp="label"
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        notFoundContent={tableLoading ? "表列表加载中..." : "暂无表"}
      />
    </Form.Item>
  );
};

export default SingleTableSource;