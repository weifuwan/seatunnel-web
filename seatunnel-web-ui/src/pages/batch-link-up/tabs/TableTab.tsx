import React from "react";
import { Card, Row, Col, Divider } from "antd";
import { TableOutlined } from "@ant-design/icons";
import TableColumnsPopover from "../components/TableColumnsPopover";
import IconRightArrow from "../IconRightArrow";
import "../index.less"

interface TableTabProps {
  instanceItem: any;
}

const TableTab: React.FC<TableTabProps> = ({ instanceItem }) => {
  const parseTableMap = (tableStr?: string) => {
    if (!tableStr) return [];

    try {
      const obj = JSON.parse(tableStr);
      const result: { sourceId: string; table: string }[] = [];

      Object.entries(obj).forEach(([id, tables]) => {
        (tables as string[]).forEach((table) => {
          result.push({ sourceId: id, table });
        });
      });

      return result;
    } catch (e) {
      console.error("table parse error", e);
      return [];
    }
  };

  const sourceTableList = parseTableMap(instanceItem?.sourceTable);
  const sinkTableList = parseTableMap(instanceItem?.sinkTable);

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <Row gutter={24} align="middle" style={{ padding: "4px 12px" }}>
        <Col span={11}>
          {sourceTableList.map(({ sourceId, table }) => (
            <TableColumnsPopover
              key={`source-${table}`}
              sourceId={sourceId}
              table={table}
              type="source"
            >
              <div className="custom-table-row" style={{ paddingTop: 4, paddingLeft: 4 }}>
                <TableOutlined style={{ color: "orange" }} /> {table}
                <Divider style={{ padding: 0, margin: "8px 0" }} />
              </div>
            </TableColumnsPopover>
          ))}
        </Col>

        <Col span={2} className="table-tab-arrow">
          <IconRightArrow />
        </Col>

        <Col span={11} className="table-tab-sink">
          {sinkTableList.map(({ sourceId, table }) => (
            <TableColumnsPopover
              key={`sink-${table}`}
              sourceId={sourceId}
              table={table}
              type="sink"
            >
              <div className="custom-table-row" style={{ paddingTop: 4, paddingRight: 4 }}>
                {table} <TableOutlined style={{ color: "orange" }} />
                <Divider style={{ padding: 0, margin: "8px 0" }} />
              </div>
            </TableColumnsPopover>
          ))}
        </Col>
      </Row>
    </Card>
  );
};

export default TableTab;