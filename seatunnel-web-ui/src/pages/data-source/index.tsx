import {
  ArrowRightOutlined,
  BugFilled,
  CheckCircleFilled,
  DeleteOutlined,
  DisconnectOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button, Card, Col, message, Modal, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useRef, useState } from "react";
import AddAndEditModal from "./AddAndEditModal";
import DataSourceStatus from "./DataSourceStatus";
import DatabaseIcons from "./icon/DatabaseIcons";
import "./index.less";
import { AddOrEditModalRef, DataSource, dataSourceApi, Operate } from "./type";

const { confirm } = Modal;

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

const Index = () => {
  const intl = useIntl();

  const [dataSourceList, setDataSourceList] = useState<DataSource[]>([]);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const ref = useRef<AddOrEditModalRef>(null);
  const [form] = useForm();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const hasSelected = selectedRowKeys.length > 0;

  const fetchDataSourceData = async (data?: any) => {
    setLoading(true);
    const result = await dataSourceApi.page(data);
    if (result.code === 0) {
      setDataSourceList(result?.data?.bizData || []);
      setPagination(result?.data?.pagination || {});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDataSourceData({ ...pagination });
  }, []);

  const cbk = () => {
    fetchDataSourceData({ ...pagination });
  };

  const createDataSource = () => {
    ref.current?.setVisible(
      true,
      Operate.Add,
      {},
      cbk,
      intl.formatMessage({
        id: "pages.datasource.common.title",
        defaultMessage: "Data Source",
      })
    );
  };

  const editDataSource = (data: DataSource) => {
    ref.current?.setVisible(
      true,
      Operate.Edit,
      data,
      cbk,
      intl.formatMessage({
        id: "pages.datasource.common.title",
        defaultMessage: "Data Source",
      })
    );
  };

  const handleDeleteDataSource = async (record: DataSource) => {
    confirm({
      title: intl.formatMessage({
        id: "pages.datasource.delete.confirmTitle",
        defaultMessage: "Are you sure you want to delete it ?",
      }),
      centered: true,
      content: (
        <span>
          {intl.formatMessage(
            {
              id: "pages.datasource.delete.confirmContentLine1",
              defaultMessage: "Are you sure you delete datasource [{name}] ?",
            },
            {
              name: <span style={{ color: "orange" }}>{record.name}</span>,
            }
          )}
          <br />
          {intl.formatMessage({
            id: "pages.datasource.delete.confirmContentLine2",
            defaultMessage:
              "Once a data source is deleted, it cannot be recovered. Please proceed with caution.",
          })}
        </span>
      ),
      okText: intl.formatMessage({
        id: "pages.datasource.delete.okText",
        defaultMessage: "Delete",
      }),
      okType: "primary",
      okButtonProps: {
        size: "small",
        danger: true,
      },
      cancelButtonProps: {
        size: "small",
      },
      maskClosable: true,
      onOk() {
        if (record?.id) {
          doDeleteDataSource(record?.id);
        } else {
          message.error(
            intl.formatMessage({
              id: "pages.datasource.message.idNotExist",
              defaultMessage: "id does not exist",
            })
          );
        }
      },
    });
  };

  const doDeleteDataSource = async (id: string) => {
    const response = await dataSourceApi.delete(id);
    if (response.code === 0) {
      message.success(response.message);
      fetchDataSourceData({ ...pagination });
    } else {
      message.error(response.message);
    }
  };

  const handleTestConnection = (record: DataSource) => {
    if (record?.id) {
      dataSourceApi.connectTest(record?.id).then((data) => {
        if (data?.code === 0) {
          message.success(
            intl.formatMessage({
              id: "pages.datasource.message.connectSuccess",
              defaultMessage: "Connected Success",
            })
          );
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
      <div
        className="flex-1 p-4 md:p-6 overflow-auto"
        style={{
          height: "calc(100vh - 56px)",
          backgroundColor: "white",
          borderBottomLeftRadius: 24,
        }}
      >
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "hsl(231 48% 48% / 0.1)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-building2 h-6 w-6 text-primary"
                  style={{ color: "hsl(231 48% 48%)" }}
                >
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  <path d="M10 6h4"></path>
                  <path d="M10 10h4"></path>
                  <path d="M10 14h4"></path>
                  <path d="M10 18h4"></path>
                </svg>
              </div>
              <h1
                className="font-bold tracking-tight"
                style={{
                  fontSize: "1.875rem",
                  lineHeight: "2.25rem",
                }}
              >
                {intl.formatMessage({
                  id: "pages.datasource.header.title",
                  defaultMessage: "List of Data Sources",
                })}
              </h1>
            </div>
            <p
              className="text-muted-foreground"
              style={{
                color: "hsl(215.4 16.3% 46.9%)",
                marginTop: 8,
                fontSize: 16,
              }}
            >
              {intl.formatMessage({
                id: "pages.datasource.header.desc",
                defaultMessage:
                  "A unified governance system for data sources, connectivity, access, and security.",
              })}
            </p>
          </div>

          <div className="relative mb-8 max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input
              className="flex h-10 w-full border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none md:text-sm pl-10 rounded-full"
              placeholder="Search by datasource name..."
            />
          </div>

          <p className="text-sm text-muted-foreground mb-4" style={{marginBottom: 12}}>
            {pagination.total || dataSourceList.length} data sources found
          </p>

          <Row gutter={[24, 24]}>
            {dataSourceList.map((record) => {
              const envConfig = envConfigMap[record?.environment] || {
                text: record?.environmentName || "-",
                color: "#8c8c8c",
                bg: "#fafafa",
                icon: null,
              };

              return (
                <Col xs={24} md={12} lg={8} key={record.id}>
                  <Card
                    hoverable
                    loading={loading}
                    bodyStyle={{ padding: 0 }}
                    className="datasource-card"
                    style={{
                      borderRadius: 24,
                      overflow: "hidden",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      className="datasource-card-cover"
                      style={{
                        height: 88,
                        background: "hsl(210 40% 96.1%)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 24,
                          bottom: -24,
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: "#fff",
                          border: "4px solid #fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        }}
                      >
                        <DatabaseIcons
                          dbType={record.dbType}
                          width="28"
                          height="28"
                        />
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          right: 20,
                          top: 16,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: envConfig.bg,
                            color: envConfig.color,
                            fontSize: 12,
                            fontWeight: 500,
                            lineHeight: 1,
                          }}
                        >
                          {envConfig.icon}
                          {record?.environmentName || envConfig.text}
                        </span>
                      </div>
                      <div className="datasource-card-actions">
                        <div
                          className="datasource-card-action-btn datasource-card-action-btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDataSource(record);
                          }}
                        >
                          <DeleteOutlined />
                        </div>

                        <div
                          className="datasource-card-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(record);
                          }}
                        >
                          <DisconnectOutlined />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "36px 24px 20px" }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          marginBottom: 8,
                          color: "#1f1f1f",
                        }}
                      >
                        {record.name}
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div
                          title={record.jdbcUrl}
                          style={{
                            fontSize: 13,
                            color: "#262626",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {record.jdbcUrl || "-"}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <DataSourceStatus status={record?.connStatus} />
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          marginBottom: 16,
                          fontSize: 12,
                          color: "#8c8c8c",
                        }}
                      >
                        <span style={{ color: "#595959", fontWeight: 500 }}>
                          {record.updateTime || "-"}
                        </span>
                      </div>
                      <div
                        style={{ marginTop: 16 }}
                        onClick={() => {
                          editDataSource(record);
                        }}
                      >
                        <Button
                          className="animated-profile-btn-v2"
                          block
                          type="default"
                        >
                          <span
                            className="default-layer"
                            style={{ fontWeight: 700, fontSize: 16 }}
                          >
                            Edit DataSource
                          </span>

                          <span className="hover-layer">
                            <span
                              className="hover-label"
                              style={{ fontWeight: 700, fontSize: 16 }}
                            >
                              Edit DataSource
                            </span>
                            <span className="hover-icon">
                              <ArrowRightOutlined />
                            </span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
      <AddAndEditModal
        ref={ref}
        setVisible={function (
          status: boolean,
          type: Operate,
          content: any,
          cbk: () => void,
          title: string
        ): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
};

export default Index;
