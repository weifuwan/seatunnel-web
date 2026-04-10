import React from "react";
import { Input, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { ParamRow } from "../types";

interface ParamTableProps {
  dataSource: ParamRow[];
}

const ParamTable: React.FC<ParamTableProps> = ({ dataSource }) => {
  const columns: ColumnsType<ParamRow> = [
    {
      title: <span style={{ fontSize: 13, fontWeight: 500 }}>参数名</span>,
      dataIndex: "paramName",
      key: "paramName",
      width: "28%",
      render: (value: string) => (
        <Input
          size="small"
          value={value}
          placeholder="请输入参数名"
          className="rounded-md"
        />
      ),
    },
    {
      title: (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          参数值{" "}
          <Tooltip title="支持使用时间表达式，例如 ${add_months(yyyymmdd,-1)}">
            <InfoCircleOutlined className="text-[12px] text-[#98A2B3]" />
          </Tooltip>
        </span>
      ),
      dataIndex: "paramValue",
      key: "paramValue",
      width: "52%",
      render: (value: string) => (
        <Input
          size="small"
          value={value}
          placeholder="请输入参数值或表达式"
          className="rounded-md"
        />
      ),
    },
    {
      title: <span style={{ fontSize: 13, fontWeight: 500 }}>操作</span>,
      key: "action",
      width: "20%",
      render: () => <a className="schedule-table-action">删除</a>,
    },
  ];

  return (
    <div className="schedule-table-card">
      <Table<ParamRow>
        rowKey="key"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default ParamTable;