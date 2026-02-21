import {
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Divider,
  message,
  Popover,
  Row,
  Statistic,
  StatisticProps,
  Table,
  Tabs,
  theme,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import BasicInfoSection from "./BasicInfoSection";
import TaskHeader from "./TaskHeader";
import { seatunnelJobInstanceApi } from "./api";

import { TableOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { dataSourceCatalogApi } from "../data-source/type";
import IconRightArrow from "./IconRightArrow";
import "./index.less";

const { Text } = Typography;

interface TaskDetailPanelProps {
  instanceItem: any;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ instanceItem }) => {
  if (!instanceItem?.jobStatus) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#999",
          fontSize: 16,
        }}
      >
        Please select a run record on the left to view details 😊
      </div>
    );
  }

  const [logContent, setLogContent] = useState<any>("");
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState("log");

  const fetchLog = async () => {
    try {
      setLoading(true);
      const res = await seatunnelJobInstanceApi.getLog(instanceItem?.id);
      setLogContent(res?.data || "No log available");
    } catch (err) {
      message.error("Failed to load log");
      setLogContent("Failed to load log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instanceItem?.id) {
      fetchLog();
    }
  }, [instanceItem?.id]);

  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  const { token } = theme.useToken();

  const itemsSchedule: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Schedule Status",
      children: instanceItem?.scheduleStatus || "-",
    },
    {
      key: "2",
      label: "Next Schedule Time",
      children: instanceItem?.nextScheduleTime || "-",
    },
    {
      key: "3",
      label: "Last Schedule Time",
      children: instanceItem?.lastScheduleTime || "-",
      span: 2,
    },
    {
      key: "4",
      label: "Cron Expression",
      children: instanceItem?.cronExpression || "-",
      span: 3,
    },
    {
      key: "10",
      label: "Schedule Info",
      children: (
        <>
          Data disk type: MongoDB
          <br />
          Database version: 3.4
          <br />
          Package: dds.mongo.mid
          <br />
          Storage space: 10 GB
          <br />
          Replication factor: 3
          <br />
          Region: East China 1
          <br />
        </>
      ),
    },
  ];

  const parseTableMap = (tableStr?: string) => {
    if (!tableStr) return [];

    try {
      const obj = JSON.parse(tableStr);

      const result: { sourceId: string; table: string }[] = [];

      Object.entries(obj).forEach(([id, tables]) => {
        (tables as string[]).forEach((table) => {
          result.push({
            sourceId: id,
            table,
          });
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

  const [sourceColumns, setSourceColumns] = useState<any[]>([]);
  const [sourceLoading, setSourceLoading] = useState<boolean>(false);
  const [sinkColumns, setSinkColumns] = useState<any[]>([]);
  const [sinkLoading, setSinkLoading] = useState<boolean>(false);
  const columns = [
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
      title: " Comment",
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

  const items = [
    {
      key: "log",
      label: "Log",
      children: (
        <Card
          size="small"
          style={{ marginTop: 8, borderRadius: 4 }}
          loading={loading}
        >
          <pre
            style={{
              background: "#1e1e1e",
              color: "#00ff88",
              padding: 16,
              borderRadius: 6,
              maxHeight: 500,
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {logContent}
          </pre>
        </Card>
      ),
    },
    {
      key: "hocon",
      label: "Hocon",
      children: (
        <Card size="small" style={{ marginTop: 8 }}>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 6,
              maxHeight: "500px",
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {instanceItem.jobConfig}
          </pre>
        </Card>
      ),
    },
    {
      key: "metrics",
      label: "Metrics",
      children: (
        <Card size="small" style={{ marginTop: 8 }}>
          <Row gutter={24}>
            <Col span={6}>
              <Statistic
                title="Read Rows"
                value={instanceItem.readRowCount ?? 0}
                formatter={formatter}
                suffix={<span style={{ fontSize: 13 }}>rows</span>}
              />
            </Col>

            <Col span={6}>
              <Statistic
                title="Write Rows"
                value={instanceItem.writeRowCount ?? 0}
                formatter={formatter}
                suffix={<span style={{ fontSize: 13 }}>rows</span>}
              />
            </Col>

            <Col span={6}>
              <Statistic
                title="Read QPS"
                value={instanceItem.readQps ?? 0}
                precision={2}
                formatter={formatter}
                suffix={<span style={{ fontSize: 13 }}>rows/s</span>}
              />
            </Col>

            <Col span={6}>
              <Statistic
                title="Write QPS"
                value={instanceItem.writeQps ?? 0}
                precision={2}
                formatter={formatter}
                suffix={<span style={{ fontSize: 13 }}>rows/s</span>}
              />
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "schedule",
      label: "Scheduled",
      children: (
        <Card size="small" style={{ marginTop: 8 }}>
          <Descriptions bordered items={itemsSchedule} />
        </Card>
      ),
    },
    {
      key: "table",
      label: "Table",
      children: (
        <Card size="small" style={{ marginTop: 8 }}>
          <Row gutter={24} align="middle" style={{ padding: "4px 12px" }}>
            <Col span={11}>
              {sourceTableList.map(({ sourceId, table }) => (
                <Popover
                  content={
                    <div style={{ width: "60vh" }}>
                      <Table
                        dataSource={sourceColumns}
                        columns={columns}
                        pagination={false}
                        bordered
                        scroll={{ y: "35vh" }}
                      />
                    </div>
                  }
                  placement="bottomLeft"
                  title="Column Info"
                  trigger="click"
                >
                  <div
                    key={table}
                    className="custom-table-row"
                    style={{ paddingTop: 4, paddingLeft: 4 }}
                    onClick={() => {
                      const params = {
                        taskExecuteType: "SINGLE_TABLE",
                        table_path: table,
                        query: "",
                      };
                      setSourceLoading(true);
                      dataSourceCatalogApi
                        .listColumn(sourceId, params)
                        .then((data) => {
                          if (data?.code === 0) {
                            console.log(data);
                            setSourceColumns(data?.data);
                            setSourceLoading(false);
                          } else {
                            message.error(data?.message);
                            setSourceLoading(false);
                          }
                        });
                    }}
                  >
                    <TableOutlined style={{ color: "orange" }} /> {table}
                    <Divider style={{ padding: 0, margin: "8px 0" }} />
                  </div>
                </Popover>
              ))}
            </Col>

            <Col
              span={2}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconRightArrow />
            </Col>

            <Col
              span={11}
              style={{
                textAlign: "right",
              }}
            >
              {sinkTableList.map(({ sourceId, table }) => (
                <Popover
                  content={
                    <div style={{ width: "60vh" }}>
                      <Table
                        dataSource={sinkColumns}
                        columns={columns}
                        pagination={false}
                        loading={sourceLoading}
                        bordered
                        scroll={{ x: "max-content", y: "35vh" }}
                      />
                    </div>
                  }
                  placement="bottomRight"
                  title="Column Info"
                  trigger="click"
                >
                  <div
                    key={table}
                    className="custom-table-row"
                    style={{ paddingTop: 4, paddingRight: 4 }}
                    onClick={() => {
                      const params = {
                        taskExecuteType: "SINGLE_TABLE",
                        table_path: table,
                        query: "",
                      };
                      setSinkLoading(true);
                      dataSourceCatalogApi
                        .listColumn(sourceId, params)
                        .then((data) => {
                          if (data?.code === 0) {
                            setSinkColumns(data?.data || []);
                            setSinkLoading(false);
                          } else {
                            message.error(data?.message);
                            setSinkLoading(false);
                          }
                        });
                    }}
                  >
                    {table} <TableOutlined style={{ color: "orange" }} />
                    <Divider style={{ padding: 0, margin: "8px 0" }} />
                  </div>
                </Popover>
              ))}
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <TaskHeader item={instanceItem} />

      <div
        style={{
          backgroundColor: "#f6f6f6",
          height: "calc(100vh - 46px)",
          overflowY: "auto",
        }}
      >
        <BasicInfoSection item={instanceItem} />

        <div
          style={{
            margin: "16px",
            padding: "16px",
            backgroundColor: "white",
            borderRadius: 6,
          }}
        >
          <Tabs
            activeKey={activeKey}
            items={items}
            onChange={(key) => setActiveKey(key)}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
