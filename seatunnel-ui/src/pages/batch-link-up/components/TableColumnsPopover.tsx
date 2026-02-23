import React, { useState } from "react";
import { Popover, Table, message } from "antd";
import { TableOutlined } from "@ant-design/icons";
import { dataSourceCatalogApi } from "../../data-source/type";
import "../index.less"

interface TableColumnsPopoverProps {
  sourceId: string;
  table: string;
  type: "source" | "sink";
  children: React.ReactNode;
}

const TABLE_COLUMNS = [
  {
    title: "Index",
    dataIndex: "key",
    key: "key",
  },
  {
    title: "Name",
    dataIndex: "fieldName",
    key: "name",
    width: "18%",
    ellipsis: true,
  },
  {
    title: "Type",
    dataIndex: "fieldType",
    key: "fieldType",
    width: "18%",
    ellipsis: true,
  },
  {
    title: "Comment",
    dataIndex: "fieldComment",
    key: "fieldComment",
    width: "18%",
    ellipsis: true,
  },
  {
    title: "Nullable",
    dataIndex: "isNullable",
    key: "isNullable",
    width: "18%",
    ellipsis: true,
  },
  {
    title: "Key",
    dataIndex: "fieldKey",
    key: "fieldKey",
    width: "15%",
  },
];

const TableColumnsPopover: React.FC<TableColumnsPopoverProps> = ({
  sourceId,
  table,
  type,
  children,
}) => {
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchColumns = async () => {
    try {
      setLoading(true);
      const params = {
        taskExecuteType: "SINGLE_TABLE",
        table_path: table,
        query: "",
      };
      const data = await dataSourceCatalogApi.listColumn(sourceId, params);
      if (data?.code === 0) {
        setColumns(data?.data || []);
      } else {
        message.error(data?.message);
      }
    } catch (error) {
      message.error("Failed to load column info");
    } finally {
      setLoading(false);
    }
  };

  const popoverContent = (
    <div style={{ width: "60vh" }}>
      <Table
        dataSource={columns}
        columns={TABLE_COLUMNS}
        pagination={false}
        loading={loading}
        bordered
        scroll={{ y: "35vh" }}
      />
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      title="Column Info"
      trigger="click"
      placement={type === "source" ? "bottomLeft" : "bottomRight"}
    >
      <div onClick={fetchColumns}>{children}</div>
    </Popover>
  );
};

export default TableColumnsPopover;