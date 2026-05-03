import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DownOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
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

const actionBaseClass =
  "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-all duration-150";

const primaryActionClass = `${actionBaseClass} bg-[#eef3ff] text-[#3157d5] hover:bg-[#e1e9ff] hover:text-[#2448c2]`;

const dangerActionClass = `${actionBaseClass} bg-[#fff1f0] text-[#cf1322] hover:bg-[#ffe1de] hover:text-[#a8071a]`;

const secondaryActionClass = `${actionBaseClass} bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

const moreActionClass =
  "inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-800";

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
    const instanceId = record?.instanceId;

    if (instanceId !== undefined) {
      seatunnelJobExecuteApi.pause(instanceId).then((data) => {
        if (data?.code === 0) {
          message.success("停止成功");
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

  const canRun = isOnline;

  return (
    <>
      <Space size={6} className="whitespace-nowrap">
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
            <button
              type="button"
              className={dangerActionClass}
              onClick={(event) => event.stopPropagation()}
            >
              <PauseCircleOutlined />
              停止
            </button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title={intl.formatMessage({
              id: "pages.job.action.run.title",
              defaultMessage: "Run Task",
            })}
            open={canRun ? runOpen : false}
            onOpenChange={(open) => {
              if (!canRun) {
                message.warning("请先上线任务，再执行运行操作");
                return;
              }

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
              if (!canRun) {
                message.warning("请先上线任务，再执行运行操作");
                return;
              }

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
            <button
              type="button"
              disabled={!canRun}
              className={
                canRun
                  ? primaryActionClass
                  : `${actionBaseClass} cursor-not-allowed bg-slate-100 text-slate-400`
              }
              onClick={(event) => {
                event.stopPropagation();

                if (!canRun) {
                  message.warning("请先上线任务，再执行运行操作");
                }
              }}
            >
              <PlayCircleOutlined />
              运行
            </button>
          </Popconfirm>
        )}

        {isOnline ? (
          <Popconfirm
            title="任务下线"
            description={
              <div style={{ marginRight: 12 }}>
                下线后任务将不会再被调度触发，
                <br />
                确认下线该任务吗？
              </div>
            }
            okText="确认"
            cancelText="取消"
            onConfirm={handleOffline}
          >
            <button
              type="button"
              className={secondaryActionClass}
              onClick={(event) => event.stopPropagation()}
            >
              <CloudDownloadOutlined />
              下线
            </button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="任务上线"
            description={
              <div style={{ marginRight: 12 }}>
                上线后任务将恢复可运行状态，并同步恢复调度，
                <br />
                确认上线该任务吗？
              </div>
            }
            okText="确认"
            cancelText="取消"
            onConfirm={handleOnline}
          >
            <button
              type="button"
              className={secondaryActionClass}
              onClick={(event) => event.stopPropagation()}
            >
              <CloudUploadOutlined />
              上线
            </button>
          </Popconfirm>
        )}

        <Dropdown
          trigger={["click"]}
          menu={{
            items: menuItems.map((menuItem) => ({
              ...menuItem,
              onClick: (info) => handleMenuClick(info, record),
            })),
          }}
        >
          <button
            type="button"
            className={moreActionClass}
            onClick={(event) => event.stopPropagation()}
          >
            更多
            <DownOutlined style={{ fontSize: 10 }} />
          </button>
        </Dropdown>
      </Space>

      <TaskViewModal ref={ref} />
    </>
  );
};

export default ActionColumn;
