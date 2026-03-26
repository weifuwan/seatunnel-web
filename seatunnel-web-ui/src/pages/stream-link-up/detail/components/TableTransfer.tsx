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
        <div style={{ fontSize: 12, padding: "8px 12px" }}>
          {`共 ${totalTables} 张表`}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", fontSize: 12, padding: "8px 12px" }}>
        <span>{`已选择 ${selectedTables} 张表`}</span>
        <span style={{ color: "red", marginLeft: 16 }}>
          最多支持 100 张表
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
        locale={{
          itemUnit: "张表",
          itemsUnit: "张表",
          searchPlaceholder: "搜索表名",
          notFoundContent: "暂无数据",
        }}
        filterOption={(inputValue, item) =>
          item.value?.toLowerCase().includes(inputValue.toLowerCase())
        }
      />
    </Spin>
  );
};

export default TableTransfer;