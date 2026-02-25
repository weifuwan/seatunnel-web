import { Badge, message, Popover } from "antd";
import { useState } from "react";
import { seatunnelJobScheduleApi } from "./api";

interface ExecutionStatusProps {
  record: any;
}

const ScheduleInfo: React.FC<ExecutionStatusProps> = ({ record }) => {
  const renderStatus = (status: string) => {
    if (status === "ACTIVE") {
      return <span style={{ color: "green" }}>{status}</span>;
    } else {
      return <span style={{ color: "red" }}>{status}</span>;
    }
  };
  const [cronExpression, setCronExpression] = useState<any[]>([]);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 58, fontWeight: 700 }}>Cron: </span>
        <Popover
          content={
            <div style={{padding: "0 0 0 6px"}}>
              {cronExpression.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                  }}
                >
                  <Badge status="success" text={item || '-'} />
                </div>
              ))}
            </div>
          }
          title="⏰ Last 5 Run Times"
          trigger="click"
        >
          <a
            onClick={() => {
              if (record?.cronExpression) {
                seatunnelJobScheduleApi
                  .getLast5ExecutionTimes(record?.cronExpression)
                  .then((data) => {
                    if (data?.code === 0) {
                      setCronExpression(data?.data || []);
                    } else {
                      message.error(data?.message);
                    }
                  });
              } else {
                message.error("Unkonw Error");
              }
            }}
            style={{
              fontSize: 12,
              marginLeft: 8,
              color: "#1890ff",
              cursor: "pointer",
            }}
            type="text"
          >
            {record?.cronExpression || "-"}
          </a>
        </Popover>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 56, fontWeight: 700 }}>Status: </span>
        <span style={{ color: "gray" }}>
          {renderStatus(record?.scheduleStatus)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 12, fontWeight: 700 }}>
          Last Run Time:{" "}
        </span>
        <span style={{ color: "gray" }}>{record?.lastScheduleTime || "-"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 9, fontWeight: 700 }}>Next Run Time: </span>
        <span style={{ color: "gray" }}>{record?.nextScheduleTime || "-"}</span>
      </div>
    </>
  );
};

export default ScheduleInfo;
