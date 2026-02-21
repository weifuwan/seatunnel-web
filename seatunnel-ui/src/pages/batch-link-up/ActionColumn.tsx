import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Modal, Popconfirm, Space, message } from "antd";
// import CreateModal from '../modal/CreateModal';
import { useRef } from "react";
import { seatunnelJobDefinitionApi, seatunnelJobExecuteApi, seatunnelJobScheduleApi } from "./api";
import TaskViewModal from "./TaskViewModal";
import { taskExecutionApi, taskScheduleApi } from "./type";

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
  const ref = useRef<any>(null);

  console.log(record);

  const handleExecute = () => {
    seatunnelJobExecuteApi.execute(record?.id).then((data) => {
      if (data?.code === 0) {
        message.success("提交成功");
        cbk();
      } else {
        message.error(data?.message);
      }
    });
  };

  const handleStop = () => {
    const executionId = record?.executionId;
    if (executionId !== undefined) {
      taskExecutionApi.cancel(executionId).then((data) => {
        if (data?.code === 0) {
          // message.success('提交成功');
          message.success(data?.data);
          cbk();
        } else {
          message.error(data?.message);
          cbk();
        }
      });
    }
  };

  const handleDeleteTask = async (record: any) => {
    confirm({
      title: "Confirm delete ?",
      centered: true,
      content: (
        <span>
          Are you sure you want to delete the task [
          <span style={{ color: "orange" }}> {record.jobName} </span>
          ]?
          <br />
        </span>
      ),
      okText: "Delete",
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
          message.error("id is not exist");
        }
      },
    });
  };

  const doDeleteDataSource = async (id: string) => {
    const response = await seatunnelJobDefinitionApi.delete(id);
    if (response.code === 0) {
      message.success(response.message);
      cbk();
    } else {
      message.error(response.message);
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
    } else if (info?.key === "4") {
    }
  };

  return (
    <>
      <Space size="middle">
        {record?.status === "RUNNING" ? (
          <Popconfirm
            title="Stop Task"
            description={
              <div style={{ marginRight: 12 }}>
                Are you sure stop this task?
              </div>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={handleStop}
          >
            <a style={{ fontWeight: 500 }}>Stop</a>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Run Task"
            description={
              <div style={{ marginRight: 12 }}>
                Are you sure to run this task?
              </div>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={handleExecute}
          >
            <a style={{ fontWeight: 500 }}>Run</a>
          </Popconfirm>
        )}

        {record?.scheduleStatus === "ACTIVE" ? (
          <Popconfirm
            title="Scheduled Task"
            description={
              <div style={{ marginRight: 12 }}>
                Are you sure offline this scheduled task?
              </div>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              if (record?.scheduleId) {
                const response = await seatunnelJobScheduleApi.stopSchedule(
                  record?.scheduleId
                );
                if (response?.code === 0) {
                  cbk();
                  message.success("Offline Success");
                } else {
                  message.error(response?.message);
                }
              } else {
                message.error("任务调度ID不存在");
              }
            }}
          >
            <a style={{ fontWeight: 500 }}>Disable</a>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Scheduled Task"
            description={
              <div style={{ marginRight: 12 }}>
                Are you sure online this scheduled task?
              </div>
            }
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              if (record?.scheduleId) {
                const response = await seatunnelJobScheduleApi.startSchedule(
                  record?.scheduleId
                );
                console.log(response)
                if (response?.code === 0) {
                  cbk();
                  message.success("Online Success");
                } else {
                  message.error(response?.message);
                }
              } else {
                message.error("任务调度ID不存在");
              }
            }}
          >
            <a style={{ fontWeight: 500 }}>Enable</a>
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
            More <DownOutlined style={{ fontSize: 12 }} />
          </a>
        </Dropdown>
        <TaskViewModal ref={ref} />
      </Space>
    </>
  );
};

export default ActionColumn;
