import { SendOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { useMemo } from "react";
import MysqlIcon from "../data-source/icon/MysqlIcon";
import OracleIcon from "../data-source/icon/OracleIcon";
import PostgreSQL from "../data-source/icon/PsSqlIcon";
// 类型定义
interface DataSourceType {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  connectorType?: string;
}
// 生成数据源选项配置
const generateDataSourceOptions = (): DataSourceType[] => [
  {
    value: "MYSQL",
    connectorType: "Jdbc",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <MysqlIcon height="24px" width="24px" />
        <span style={{ marginLeft: 8 }}>MYSQL</span>
      </div>
    ),
  },
  {
    value: "ORACLE",
    connectorType: "Jdbc",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <OracleIcon />
        <span style={{ marginLeft: 8 }}>ORACLE</span>
      </div>
    ),
  },
  {
    value: "POSTGRESQL",
    connectorType: "Jdbc",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <PostgreSQL />
        <span style={{ marginLeft: 8 }}>POSTGRESQL</span>
      </div>
    ),
  },
];

// 数据源选择器组件
interface DataSourceSelectProps {
  value: any;
  onChange: (value: string, option: any) => void;
  placeholder: string;
  prefix: string;
  width?: string;
  dataSourceOptions?: any[]
}

const DataSourceSelect: React.FC<DataSourceSelectProps> = ({
  value,
  onChange,
  placeholder,
  prefix,
  width = "42%",
  dataSourceOptions
}) => {
  return (
    <Select
      showSearch
      placeholder={placeholder}
      value={value?.dbType}
      optionFilterProp="label"
      onChange={onChange}
      suffixIcon={<SendOutlined />}
      style={{ width: width }}
      prefix={<span style={{ fontSize: 12,fontWeight: 500 }}>{prefix}</span>}
      filterOption={(input, option) => {
        const labelText =
          typeof option?.label === "string" ? option.label : "MYSQL";
        return labelText.toLowerCase().includes(input.toLowerCase());
      }}
      options={dataSourceOptions}
    />
  );
};

export default DataSourceSelect;
