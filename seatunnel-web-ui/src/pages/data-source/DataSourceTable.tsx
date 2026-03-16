import {
  BugFilled,
  CheckCircleFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Divider, message, Table, Tooltip } from "antd";
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

const envConfigMap: Record<string, any> = {
  PROD: {
    text: "生产",
    color: "#ff4d4f",
    bg: "#fff2f0",
    icon: <SafetyCertificateFilled />,
  },
  TEST: {
    text: "测试",
    color: "#52c41a",
    bg: "#f6ffed",
    icon: <CheckCircleFilled />,
  },
  DEVELOP: {
    text: "开发",
    color: "#1677ff",
    bg: "#e6f4ff",
    icon: <BugFilled />,
  },
};

const DataSourceTable: React.FC<DataSourceTableProps> = ({
  dataSourceList,
  loading,
  handleDeleteDataSource,
  editDataSource,
  setSelectedRowKeys,
  selectedRowKeys,
  cbk,
}) => {
  const intl = useIntl();

  const renderDataSourceInfo = useCallback(
    (_dbName: string, record: DataSource) => (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{record.name}</div>
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
            title={jdbcUrl}
          >
            <span className="dc-lf-clone-label" style={{ fontSize: 12 }}>
              {intl.formatMessage({
                id: "pages.datasource.table.conn.jdbcUrl",
                defaultMessage: "JdbcUrl:",
              })}{" "}
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
              title={jdbcUrl}
            >
              <span className="dc-lf-clone-label" style={{ fontSize: 12 }}>
                {intl.formatMessage({
                  id: "pages.datasource.table.conn.schema",
                  defaultMessage: "Schema:",
                })}{" "}
              </span>
              <span style={{ fontWeight: 400 }}>{schema}</span>
            </div>
          )}
        </>
      );
    },
    [intl]
  );

  // 渲染操作列
  const renderActions = useCallback(
    (record: DataSource) => {
      const handleTestConnection = () => {
        if (record?.id) {
          dataSourceApi.connectTest(record?.id).then((data) => {
            if (data?.code === 0) {
              cbk();
            } else {
              message.error(
                data?.message ||
                  intl.formatMessage({
                    id: "pages.datasource.message.unknownError",
                    defaultMessage: "Unknown error",
                  })
              );
            }
          });
        } else {
          message.error(
            intl.formatMessage({
              id: "pages.datasource.message.unknownError",
              defaultMessage: "Unknown error",
            })
          );
        }
      };

      return (
        <>
          <Tooltip
            title={intl.formatMessage({
              id: "pages.datasource.table.action.edit.tooltip",
              defaultMessage: "Edit Datasource",
            })}
          >
            <a onClick={() => editDataSource(record)}>
              {intl.formatMessage({
                id: "pages.datasource.table.action.edit",
                defaultMessage: "Edit",
              })}
            </a>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip
            title={intl.formatMessage({
              id: "pages.datasource.table.action.delete.tooltip",
              defaultMessage: "Delete Datasource",
            })}
          >
            <a onClick={() => handleDeleteDataSource(record)}>
              {intl.formatMessage({
                id: "pages.datasource.table.action.delete",
                defaultMessage: "Delete",
              })}
            </a>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip
            title={intl.formatMessage({
              id: "pages.datasource.table.action.test.tooltip",
              defaultMessage: "Connection Test",
            })}
          >
            <a onClick={handleTestConnection}>
              {intl.formatMessage({
                id: "pages.datasource.table.action.test",
                defaultMessage: "Test",
              })}
            </a>
          </Tooltip>
        </>
      );
    },
    [cbk, editDataSource, handleDeleteDataSource, intl]
  );

  // 表格列定义
  const columns = [
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.index",
        defaultMessage: "Index",
      }),
      key: "index",
      width: "6%",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.dbInfo",
        defaultMessage: "DataBase Info",
      }),
      dataIndex: "name",
      width: "10%",
      render: renderDataSourceInfo,
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.env",
        defaultMessage: "Env",
      }),
      dataIndex: "environment",
      width: "8%",
      render: (_: any, record: any) => {
        const config = envConfigMap[record?.environment] || {
          text: record?.environmentName || "-",
          color: "#8c8c8c",
          bg: "#fafafa",
          icon: null,
        };

        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: config.bg,
              color: config.color,
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {config.icon}
            {record?.environmentName || config.text}
          </span>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.connInfo",
        defaultMessage: "Connection Info",
      }),
      dataIndex: "jdbcUrl",
      width: "35%",
      render: renderConnectionInfo,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.status",
        defaultMessage: "Status",
      }),
      dataIndex: "connStatus",
      width: "12%",
      render: (_content: any, record: any) => (
        <DataSourceStatus status={record?.connStatus} />
      ),
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.createTime",
        defaultMessage: "Create Time",
      }),
      dataIndex: "createTime",
      width: "10%",
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.updateTime",
        defaultMessage: "Update Time",
      }),
      dataIndex: "updateTime",
      width: "10%",
    },
    {
      title: intl.formatMessage({
        id: "pages.datasource.table.col.operate",
        defaultMessage: "Operate",
      }),
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
      rowKey="id"
      rowSelection={rowSelection}
      pagination={false}
      bordered
      scroll={{ x: 1200, y: "calc(100vh - 350px)" }}
    />
  );
};

export default DataSourceTable;
