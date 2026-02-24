import { Divider, message, Table, Tag, Tooltip } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { useCallback } from "react";
import DataSourceStatus from "./DataSourceStatus";
import DatabaseIcons from "./icon/DatabaseIcons";
import { DataSource, dataSourceApi } from "./type";

interface DataSourceTableProps {
  dataSourceList: DataSource[];
  loading: boolean | undefined;
  handleDeleteDataSource: (record: DataSource) => void;
  editDataSource: (record: DataSource) => void;
  setSelectedRowKeys: (keys: React.Key[]) => void;
  selectedRowKeys: any;
  cbk: () => void;
}

const DataSourceTable: React.FC<DataSourceTableProps> = ({
  dataSourceList,
  loading,
  handleDeleteDataSource,
  editDataSource,
  setSelectedRowKeys,
  selectedRowKeys,
  cbk,
}) => {
  const renderDataSourceInfo = useCallback(
    (dbName: string, record: DataSource) => (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{record.dbName}</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.dbType != null && (
            <DatabaseIcons dbType={record.dbType} width="24" height="24" />
          )}
          <span style={{ marginLeft: 4, color: "#9ca1ba" }}>
            {record.dbType}
          </span>
        </div>
      </div>
    ),
    []
  );

  const renderConnectionInfo = useCallback(
    (jdbcUrl: string, record: DataSource) => {
      let schema;
      if (record?.originalJson) {
        const ojson = JSON.parse(record?.originalJson);
        if (ojson?.schema) {
          schema = ojson?.schema;
        }
      }

      return (
        <>
          <div
            style={{
              width: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
            title={jdbcUrl} // 添加鼠标悬停显示完整URL
          >
            <span className="dc-lf-clone-label" style={{ fontSize: 12 }}>
              JdbcUrl:{" "}
            </span>
            <span style={{ fontWeight: 400 }}>{jdbcUrl}</span>
          </div>
          {schema && (
            <div
              style={{
                width: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
              }}
              title={jdbcUrl} // 添加鼠标悬停显示完整URL
            >
              <span className="dc-lf-clone-label" style={{ fontSize: 12 }}>
                Schema:{" "}
              </span>
              <span style={{ fontWeight: 400 }}>{schema}</span>
            </div>
          )}
        </>
      );
    },
    []
  );

  // 渲染操作列
  const renderActions = useCallback(
    (record: DataSource) => {
      const handleTestConnection = () => {
        console.log(record);
        if (record?.id) {
          dataSourceApi.connectTest(record?.id).then((data) => {
            if (data?.code === 0) {
              cbk();
            } else {
              message.error(data?.message || "Unknown error");
            }
          });
        } else {
          message.error("Unknown error");
        }
      };

      return (
        <>
          <Tooltip title="Edit Datasource">
            <a onClick={() => editDataSource(record)}>Edit</a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="Delete Datasource">
            <a onClick={() => handleDeleteDataSource(record)}>Delete</a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="Connection Test">
            <a onClick={handleTestConnection}>Test</a>
          </Tooltip>
        </>
      );
    },
    [editDataSource, handleDeleteDataSource]
  );

  // 表格列定义
  const columns = [
    {
      title: "Index",
      key: "index",
      width: "6%",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "DataBase Info",
      dataIndex: "dbName",
      width: "10%",
      render: renderDataSourceInfo,
    },
    {
      title: "Env",
      dataIndex: "environment",
      width: "7%",
      render: (_: any, record: any) => {
        if (record?.environment === "PROD") {
          return <Tag color="#f50">{record?.environment}</Tag>;
        } else if (record?.environment === "TEST") {
          return <Tag color="#87d068">{record?.environment}</Tag>;
        } else {
          return <Tag color="#108ee9">{record?.environment}</Tag>;
        }
      },
    },
    {
      title: "Connection Info",
      dataIndex: "jdbcUrl",
      width: "35%",
      render: renderConnectionInfo,
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "connStatus",
      width: "12%",
      render: (content: any, record: any) => (
        <DataSourceStatus status={record?.connStatus} />
      ),
    },
    {
      title: "Create Time",
      dataIndex: "createTime",
      width: "10%",
    },
    {
      title: "Update Time",
      dataIndex: "updateTime",
      width: "10%",
    },
    {
      title: "Operate",
      key: "actions",
      width: "13%",
      render: renderActions,
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Table
      columns={columns}
      dataSource={dataSourceList}
      loading={loading}
      rowKey="id" // 添加rowKey提高性能
      rowSelection={rowSelection}
      pagination={false}
      bordered
      scroll={{ x: 1200, y: "calc(100vh - 350px)" }}
    />
  );
};

export default DataSourceTable;
