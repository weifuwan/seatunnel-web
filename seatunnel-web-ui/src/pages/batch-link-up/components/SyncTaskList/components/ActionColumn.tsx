import { DownOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Dropdown, Modal, Popconfirm, Space, message } from "antd";
import { useRef, useState } from "react";
import {
  seatunnelJobDefinitionApi,
  seatunnelJobExecuteApi,
} from "../../../api";
import TaskViewModal from "../../../TaskViewModal";


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

  const isOnline =
    record?.releaseState === "ONLINE" || record?.releaseState === 1;

  const handleStop = () => {

    console.log(record)

    const instanceId = record?.instanceId;

    if (instanceId !== undefined) {
      seatunnelJobExecuteApi.pause(instanceId).then((data) => {
        if (data?.code === 0) {
          cbk();
        } else {
          message.error(data?.msg || "停止失败");
          cbk();
        }
      });
    }
  };

  const handleOnline = async () => {
    if (!record?.id) {
      message.error("任务 ID 不存在");
      return;
    }

    const response = await seatunnelJobDefinitionApi.online(record.id);

    if (response?.code === 0) {
      message.success("上线成功");
      cbk();
      return;
    }

    message.error(response?.msg || response?.message || "上线失败");
  };

  const handleOffline = async () => {
    if (!record?.id) {
      message.error("任务 ID 不存在");
      return;
    }

    const response = await seatunnelJobDefinitionApi.offline(record.id);

    if (response?.code === 0) {
      message.success("下线成功");
      cbk();
      return;
    }

    message.error(response?.msg || response?.message || "下线失败");
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
              defaultMessage:
                "Are you sure you want to delete the task [{name}]?",
            },
            {
              name: <span style={{ color: "orange" }}>{record.jobName}</span>,
            }
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
            })
          );
        }
      },
    });
  };

  const doDeleteTask = async (id: string) => {
    const response = await seatunnelJobDefinitionApi.delete(id);

    if (response.code === 0) {
      message.success(response.msg || "删除成功");
      cbk();
    } else {
      message.error(response.msg || "删除失败");
    }
  };

  const handleMenuClick = (info: any, item: any) => {
    info.domEvent.stopPropagation();

    if (info?.key === "delete") {
      handleDeleteTask(record);
      return;
    }

    if (info?.key === "view") {
      ref.current?.onOpen(true, record, cbk);
      return;
    }

    if (info?.key === "edit") {
      seatunnelJobDefinitionApi.selectEditDetail(item?.id).then((data) => {
        if (data?.code === 0) {
          goDetail(item?.id, item);
        }
      });
    }
  };

  const yesText = intl.formatMessage({
    id: "pages.common.yes",
    defaultMessage: "Yes",
  });

  const noText = intl.formatMessage({
    id: "pages.common.no",
    defaultMessage: "No",
  });

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
            <a style={{ fontWeight: 500 }}>停止</a>
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
                    })
                  );
                  cbk();
                  setRunOpen(false);
                } else {
                  message.error(data?.msg || "运行失败");
                }
              } finally {
                setRunLoading(false);
              }
            }}
          >
            <a style={{ fontWeight: 500 }}>运行</a>
          </Popconfirm>
        )}

        {isOnline ? (
          <Popconfirm
            title="任务下线"
            description={
              <div style={{ marginRight: 12 }}>
                下线后任务将不会再被调度触发，<br />确认下线该任务吗？
              </div>
            }
            okText="确认"
            cancelText="取消"
            onConfirm={handleOffline}
          >
            <a style={{ fontWeight: 500 }}>下线</a>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="任务上线"
            description={
              <div style={{ marginRight: 12 }}>
                上线后任务将恢复可运行状态，并同步恢复调度，<br />确认上线该任务吗？
              </div>
            }
            okText="确认"
            cancelText="取消"
            onConfirm={handleOnline}
          >
            <a style={{ fontWeight: 500 }}>上线</a>
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
            {intl.formatMessage({
              id: "pages.job.action.more",
              defaultMessage: "More",
            })}{" "}
            <DownOutlined style={{ fontSize: 12 }} />
          </a>
        </Dropdown>

        <TaskViewModal ref={ref} />
      </Space>
    </>
  );
};

export default ActionColumn;
