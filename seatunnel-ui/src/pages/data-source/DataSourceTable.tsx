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
  // 渲染数据源信息列
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

  // 渲染连接信息列
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
              message.error("连接失败");
            }
          });
        } else {
          message.error("数据源id不存在");
        }
      };

      return (
        <>
          <Tooltip title="编辑数据源">
            <a onClick={() => editDataSource(record)}>编辑</a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="删除数据源">
            <a onClick={() => handleDeleteDataSource(record)}>删除</a>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="测试连接">
            <a onClick={handleTestConnection}>测试连接</a>
          </Tooltip>
        </>
      );
    },
    [editDataSource, handleDeleteDataSource]
  );

  // 表格列定义
  const columns = [
    {
      title: "编号",
      key: "index",
      width: "6%",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "数据源信息",
      dataIndex: "dbName",
      width: "10%",
      render: renderDataSourceInfo,
    },
    {
      title: "所属环境",
      dataIndex: "environmentName",
      width: "10%",
      render: (_: any, record: any) => {
        if (record?.environment === "PROD") {
          return <Tag color="#f50">{record?.environmentName}</Tag>;
        } else if (record?.environment === "TEST") {
          return <Tag color="#87d068">{record?.environmentName}</Tag>;
        } else {
          return <Tag color="#108ee9">{record?.environmentName}</Tag>;
        }
      },
    },
    {
      title: "连接信息",
      dataIndex: "jdbcUrl",
      width: "35%",
      render: renderConnectionInfo,
      ellipsis: true,
    },
    {
      title: "连接状态",
      dataIndex: "connStatus",
      width: "7%",
      render: (content: any, record: any) => (
        <DataSourceStatus status={record?.connStatus} />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: "10%",
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      width: "10%",
    },
    {
      title: "操作",
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
