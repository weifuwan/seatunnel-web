import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Modal, Popconfirm, Space, message } from "antd";
import { useRef, useState } from "react";
import {
  seatunnelJobDefinitionApi,
  seatunnelJobExecuteApi,
  seatunnelJobScheduleApi,
} from "../../../api";
import TaskViewModal from "../../../TaskViewModal";
import { taskExecutionApi } from "../../../type";
import { useIntl } from "@umijs/max";

interface ActionColumnProps {
  record: any;
  menuItems: any[];
  cbk: () => void;
  goDetail: (value: any, item: any) => void;
}

const { confirm } = Modal;

const ActionColumn: React.FC<ActionColumnProps> = ({
  record,
  menuItems,
  cbk,
  goDetail,
}) => {
  const intl = useIntl();

  const ref = useRef<any>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const handleStop = () => {
    const executionId = record?.executionId;
    if (executionId !== undefined) {
      taskExecutionApi.cancel(executionId).then((data) => {
        if (data?.code === 0) {
          cbk();
        } else {
          message.error(data?.msg);
          cbk();
        }
      });
    }
  };

  const handleDeleteTask = async (record: any) => {
    confirm({
      title: intl.formatMessage({
        id: "pages.job.action.delete.confirmTitle",
        defaultMessage: "Confirm delete?",
      }),
      centered: true,
      content: (
        <span>
          {intl.formatMessage(
            {
              id: "pages.job.action.delete.confirmContent",
              defaultMessage: "Are you sure you want to delete the task [{name}]?",
            },
            {
              name: <span style={{ color: "orange" }}>{record.jobName}</span>,
            },
          )}
          <br />
        </span>
      ),
      okText: intl.formatMessage({
        id: "pages.job.action.delete.okText",
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
          doDeleteTask(record?.id);
        } else {
          message.error(
            intl.formatMessage({
              id: "pages.job.message.idNotExist",
              defaultMessage: "id is not exist",
            }),
          );
        }
      },
    });
  };

  const doDeleteTask = async (id: string) => {
    const response = await seatunnelJobDefinitionApi.delete(id);
    if (response.code === 0) {
      message.success(response.msg);
      cbk();
    } else {
      message.error(response.msg);
    }
  };

  const handleMenuClick = (info: any, item: any) => {
    info.domEvent.stopPropagation();
    if (info?.key === "delete") {
      handleDeleteTask(record);
    } else if (info?.key === "view") {
      ref.current.onOpen(true, record, cbk);
    } else if (info?.key === "edit") {
      goDetail(item?.id, item);
    }
  };

  const yesText = intl.formatMessage({ id: "pages.common.yes", defaultMessage: "Yes" });
  const noText = intl.formatMessage({ id: "pages.common.no", defaultMessage: "No" });

  return (
    <>
      <Space size="middle">
        {record?.lastJobStatus === "RUNNING" ? (
          <Popconfirm
            title={intl.formatMessage({
              id: "pages.job.action.stop.title",
              defaultMessage: "Stop Task",
            })}
            description={
              <div style={{ marginRight: 12 }}>
                {intl.formatMessage({
                  id: "pages.job.action.stop.desc",
                  defaultMessage: "Are you sure stop this job?",
                })}
              </div>
            }
            okText={yesText}
            cancelText={noText}
            onConfirm={handleStop}
          >
            <a style={{ fontWeight: 500 }}>
              {intl.formatMessage({
                id: "pages.job.action.stop",
                defaultMessage: "Stop",
              })}
            </a>
          </Popconfirm>
        ) : (
          <Popconfirm
            title={intl.formatMessage({
              id: "pages.job.action.run.title",
              defaultMessage: "Run Task",
            })}
            open={runOpen}
            onOpenChange={(open) => {
              if (!runLoading) {
                setRunOpen(open);
              }
            }}
            okButtonProps={{ loading: runLoading }}
            description={
              <div style={{ marginRight: 12 }}>
                {intl.formatMessage({
                  id: "pages.job.action.run.desc",
                  defaultMessage: "Are you sure to run this job?",
                })}
              </div>
            }
            okText={yesText}
            cancelText={noText}
            onConfirm={async () => {
              try {
                setRunLoading(true);
                const data = await seatunnelJobExecuteApi.execute(record?.id);
                if (data?.code === 0) {
                  message.success(
                    intl.formatMessage({
                      id: "pages.common.success",
                      defaultMessage: "Success",
                    }),
                  );
                  cbk();
                  setRunOpen(false);
                } else {
                  message.error(data?.msg);
                }
              } finally {
                setRunLoading(false);
              }
            }}
          >
            <a style={{ fontWeight: 500 }}>
              {intl.formatMessage({
                id: "pages.job.action.run",
                defaultMessage: "Run",
              })}
            </a>
          </Popconfirm>
        )}

        {record?.scheduleStatus === "NORMAL" ? (
          <Popconfirm
            title={intl.formatMessage({
              id: "pages.job.action.schedule.title",
              defaultMessage: "Scheduled Task",
            })}
            description={
              <div style={{ marginRight: 12 }}>
                {intl.formatMessage({
                  id: "pages.job.action.schedule.offline.desc",
                  defaultMessage: "Are you sure offline this scheduled task?",
                })}
              </div>
            }
            okText={yesText}
            cancelText={noText}
            onConfirm={async () => {
              if (record?.scheduleId) {
                const response = await seatunnelJobScheduleApi.stopSchedule(record?.scheduleId);
                if (response?.code === 0) {
                  cbk();
                  message.success(
                    intl.formatMessage({
                      id: "pages.job.action.schedule.offline.success",
                      defaultMessage: "Offline Success",
                    }),
                  );
                } else {
                  message.error(response?.msg);
                }
              } else {
                message.error(
                  intl.formatMessage({
                    id: "pages.job.message.scheduleIdNotExist",
                    defaultMessage: "Schedule ID does not exist",
                  }),
                );
              }
            }}
          >
            <a style={{ fontWeight: 500 }}>
              {intl.formatMessage({
                id: "pages.job.action.schedule.disable",
                defaultMessage: "Disable",
              })}
            </a>
          </Popconfirm>
        ) : (
          <Popconfirm
            title={intl.formatMessage({
              id: "pages.job.action.schedule.title",
              defaultMessage: "Scheduled Task",
            })}
            description={
              <div style={{ marginRight: 12 }}>
                {intl.formatMessage({
                  id: "pages.job.action.schedule.online.desc",
                  defaultMessage: "Are you sure online this scheduled task?",
                })}
              </div>
            }
            okText={yesText}
            cancelText={noText}
            onConfirm={async () => {
              if (record?.scheduleId) {
                const response = await seatunnelJobScheduleApi.startSchedule(record?.scheduleId);
                if (response?.code === 0) {
                  cbk();
                  message.success(
                    intl.formatMessage({
                      id: "pages.job.action.schedule.online.success",
                      defaultMessage: "Online Success",
                    }),
                  );
                } else {
                  message.error(response?.msg);
                }
              } else {
                message.error(
                  intl.formatMessage({
                    id: "pages.job.message.unknownError",
                    defaultMessage: "Unknown Error",
                  }),
                );
              }
            }}
          >
            <a style={{ fontWeight: 500 }}>
              {intl.formatMessage({
                id: "pages.job.action.schedule.enable",
                defaultMessage: "Enable",
              })}
            </a>
          </Popconfirm>
        )}

        <Dropdown
          menu={{
            items: menuItems.map((menuItem) => ({
              ...menuItem,
              onClick: (info) => handleMenuClick(info, record),
            })),
          }}
        >
          <a style={{ fontWeight: 500 }}>
            {intl.formatMessage({ id: "pages.job.action.more", defaultMessage: "More" })}{" "}
            <DownOutlined style={{ fontSize: 12 }} />
          </a>
        </Dropdown>

        <TaskViewModal ref={ref} />
      </Space>
    </>
  );
};

export default ActionColumn;