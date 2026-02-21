import { Spin, Transfer, TransferProps } from "antd";

import { TableItem } from "../types";

interface TableTransferProps {
  data: TableItem[];
  targetKeys: string[];
  loading: boolean;
  matchMode: string;
  onChange: (nextKeys: string[]) => void;
}

const TableTransfer: React.FC<TableTransferProps> = ({
  data,
  targetKeys,
  loading,
  matchMode,
  onChange,
}) => {
  const renderFooter: TransferProps["footer"] = (_, info) => {
    const totalTables = data.length;
    const selectedTables = targetKeys.length;
    if (info?.direction === "left") {
      return (
        <div
          style={{ fontSize: 12, padding: "8px 12px" }}
        >{`Total: ${totalTables} tables`}</div>
      );
    }
    return (
      <div style={{ display: "flex", fontSize: 12, padding: "8px 12px" }}>
        <span>{`Selected: ${selectedTables} tables`}</span>
        <span style={{ color: "red", marginLeft: 16 }}>
          Supports up to 100 tables
        </span>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <Transfer
        dataSource={data}
        listStyle={{ width: "100%", height: 400 }}
        operations={["", ""]}
        targetKeys={targetKeys}
        onChange={(nextKeys: any[]) => {
          if (matchMode === "4") return;
          onChange(nextKeys);
        }}
        render={(item) => item.title}
        footer={renderFooter}
        showSearch
        filterOption={(inputValue, item) =>
          item.value?.toLowerCase().includes(inputValue.toLowerCase())
        }
      />
    </Spin>
  );
};

export default TableTransfer;
