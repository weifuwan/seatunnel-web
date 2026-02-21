import { Tag } from "antd";

interface ExecutionStatusProps {
  record: any;
}

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ record }) => {
  return (
    <>
      {/* Execution */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 16, fontWeight: 700 }}>Run Mode: </span>
        <Tag color={record?.runMode === "MANUAL" ? "blue" : "purple"}>
          {record?.runMode === "MANUAL" ? "MANUAL" : "SCHEDULED"}
        </Tag>
      </div>

      {/* Time 始终展示 */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>·</span>
        <span style={{ marginRight: 16, fontWeight: 700 }}>Time: </span>
        <span style={{ color: "gray" }}>{record?.duration || "-"} s</span>
      </div>

      <>
        {/* Amount */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>
            ·
          </span>
          <span style={{ marginRight: 16, fontWeight: 700 }}>Amount: </span>
          <span style={{ color: "gray" }}>
            {record?.readRowCount ?? 0} r
          </span>
        </div>

        {/* QPS */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>
            ·
          </span>
          <span style={{ marginRight: 42, fontWeight: 700 }}>QPS: </span>
          <span style={{ color: "gray" }}>{record?.qps ?? 0} r/s</span>
        </div>

        {/* Size */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 19, marginRight: 8 }}>
            ·
          </span>
          <span style={{ marginRight: 16, fontWeight: 700 }}>Size: </span>
          <span style={{ color: "gray" }}>{record?.syncSize || "-"}</span>
        </div>
      </>
    </>
  );
};

export default ExecutionStatus;
