import { Divider, Table, message } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import moment from "moment";
import { useEffect, useState } from "react";
import ActionColumn from "./ActionColumn";
import AdvancedSearchForm from "./AdvancedSearchForm";
import { seatunnelJobDefinitionApi } from "./api";
import BottomActionBar from "./BottomActionBar";
import DataSourceSyncPlan from "./DataSourceSyncPlan";
import ExecutionStatus from "./ExecutionStatus";
import Footer from "./Footer";
import "./index.less";
import ScheduleInfo from "./ScheduleInfo";
import TaskStatus from "./TaskStatus";
import { taskExecutionApi } from "./type";
import { useIntl } from "@umijs/max";

interface Props {
  goDetail: (value: any, item?: any) => void;
}

const DEFAULT_TIME_RANGE = [moment().subtract(4, "days"), moment().add(1, "days")];

const App: React.FC<Props> = ({ goDetail }) => {
  const intl = useIntl();

  const [taskList, setTaskList] = useState([]);
  const [searchParams, setSearchParams] = useState<any>({
    createTime: DEFAULT_TIME_RANGE,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    fetchTaskList();
  }, [searchParams, pagination.current, pagination.pageSize]);

  const fetchTaskList = () => {
    setLoading(true);
    const transformedParams = { ...searchParams };

    if (transformedParams?.createTime) {
      transformedParams.createTimeStart = moment(transformedParams.createTime[0]).format(
        "YYYY-MM-DD HH:mm:ss",
      );
      transformedParams.createTimeEnd = moment(transformedParams.createTime[1]).format(
        "YYYY-MM-DD HH:mm:ss",
      );
      delete transformedParams.createTime;
    }

    seatunnelJobDefinitionApi.page({ ...transformedParams }).then((data) => {
      if (data?.code === 0) {
        setTaskList(data?.data?.bizData);
        setPagination((prev) => ({
          ...prev,
          total: data?.data?.pagination?.total || 0,
        }));
        setLoading(false);
      } else {
        message.error(data?.message);
        setLoading(false);
      }
    });
  };

  const menuItems = [
    {
      key: "view",
      label: (
        <span style={{ fontWeight: 500 }}>
          {intl.formatMessage({ id: "pages.job.menu.view", defaultMessage: "View" })}
        </span>
      ),
    },
    {
      key: "edit",
      label: (
        <span style={{ fontWeight: 500 }}>
          {intl.formatMessage({ id: "pages.job.menu.edit", defaultMessage: "Edit" })}
        </span>
      ),
    },
    {
      key: "delete",
      label: (
        <span style={{ fontWeight: 500 }}>
          {intl.formatMessage({ id: "pages.job.menu.delete", defaultMessage: "Delete" })}
        </span>
      ),
    },
  ];

  const baseColumns = [
    {
      title: intl.formatMessage({ id: "pages.job.table.col.name", defaultMessage: "Name" }),
      dataIndex: "jobName",
      width: "12%",
      ellipsis: true,
      render: (_content: any, record: any) => (
        <div>
          <em style={{ fontWeight: 500 }}>
            {intl.formatMessage({ id: "pages.job.table.label.jobId", defaultMessage: "JobId" })}
          </em>
          : <span style={{ fontSize: "12px", color: "gray" }}>{record?.id}</span> <br />
          <em style={{ fontWeight: 500 }}>
            {intl.formatMessage({ id: "pages.job.table.label.jobName", defaultMessage: "JobName" })}
          </em>
          : {record?.jobName}
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: "pages.job.table.col.syncPlan", defaultMessage: "Sync Plan" }),
      dataIndex: "",
      width: "20%",
      render: (_content: any, record: any) => <DataSourceSyncPlan record={record} />,
    },
    {
      title: intl.formatMessage({ id: "pages.job.table.col.status", defaultMessage: "Status" }),
      dataIndex: "taskParams",
      width: "10%",
      render: (_content: any, record: any) => (
        <TaskStatus status={record?.lastJobStatus} errorMessage={record?.errorMessage} />
      ),
    },
    {
      title: intl.formatMessage({ id: "pages.job.table.col.execution", defaultMessage: "Execution" }),
      dataIndex: "执行概况",
      width: "15%",
      render: (_content: any, record: any) => <ExecutionStatus record={record} />,
    },
    {
      title: intl.formatMessage({ id: "pages.job.table.col.schedule", defaultMessage: "Schedule" }),
      dataIndex: "taskName",
      width: "20%",
      render: (_content: any, record: any) => <ScheduleInfo record={record} />,
    },
    {
      title: intl.formatMessage({ id: "pages.job.table.col.createTime", defaultMessage: "CreateTime" }),
      dataIndex: "createTime",
      width: "10%",
    },
    {
      title: intl.formatMessage({ id: "pages.job.table.col.operate", defaultMessage: "Operate" }),
      dataIndex: "",
      width: "16%",
      fixed: "right",
      render: (record: any) => (
        <ActionColumn
          record={record}
          menuItems={menuItems}
          cbk={fetchTaskList}
          goDetail={goDetail}
        />
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleSearch = (values: any) => {
    setSearchParams(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const hasSelected = selectedRowKeys.length > 0;

  const onStartAll = () => {
    taskExecutionApi.batchExecute(selectedRowKeys).then((data) => {
      if (data?.code === 0) {
        message.success(
          intl.formatMessage({ id: "pages.job.batch.start.success", defaultMessage: "Start all succeeded" }),
        );
        setSelectedRowKeys([]);
        fetchTaskList();
      } else {
        message.error(
          intl.formatMessage({ id: "pages.job.batch.start.fail", defaultMessage: "Start all failed" }),
        );
      }
    });
  };

  const onStopAll = () => {
    taskExecutionApi.batchCancel(selectedRowKeys).then((data) => {
      if (data?.code === 0) {
        message.success(
          intl.formatMessage({ id: "pages.job.batch.stop.success", defaultMessage: "Stop all succeeded" }),
        );
        setSelectedRowKeys([]);
        fetchTaskList();
      } else {
        message.error(
          intl.formatMessage({ id: "pages.job.batch.stop.fail", defaultMessage: "Stop all failed" }),
        );
      }
    });
  };

  return (
    <>
      <div
        style={{
          margin: 16,
          background: "white",
          padding: 16,
        }}
      >
        <div>
          <div className="config-manage-page">
            <div className="operate-bar">
              <div className="left">
                <AdvancedSearchForm onSearch={handleSearch} onReset={handleReset} />
              </div>
            </div>
            <Divider style={{ margin: "0 0 24px" }} />
            <Table
              columns={baseColumns as any}
              dataSource={taskList}
              rowKey={"id"}
              bordered
              pagination={false}
              loading={loading}
              rowSelection={{ type: "checkbox", ...rowSelection }}
              scroll={{ x: "max-content", y: "calc(100vh - 450px)" }}
            />
          </div>
        </div>
        {taskList && taskList?.length > 1 ? "" : <Footer />}
      </div>

      <BottomActionBar
        onStart={onStartAll}
        onStop={onStopAll}
        pagination={{
          ...pagination,
          onChange: handlePaginationChange,
        }}
        disabled={!hasSelected}
      />
    </>
  );
};

export default App;