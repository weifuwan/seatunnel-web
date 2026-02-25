import { ClockCircleOutlined } from "@ant-design/icons";
import HandIcon from "./icon/HandIcon";

interface ExecutionStatusProps {
  record: any;
}

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ record }) => {
  return (
    <>
      {/* Execution */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: 19,
            marginRight: 8,
            color: "#1890ff",
          }}
        >
          ·
        </span>
        <span style={{ marginRight: 16, fontWeight: 700, color: "#333" }}>
          Run Mode:{" "}
        </span>
        {record?.runMode === "MANUAL" ? (
          <div
            style={{
              display: "inline-block",
              transition: "transform 0.3s",
              animation: "bounce 1.2s infinite",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.3)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <HandIcon width={20} height={20} fill="#fa8c16" />
          </div>
        ) : (
          <ClockCircleOutlined
            style={{
              fontSize: 20,
              color: "#52c41a",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.2)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        )}
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
          <span style={{ color: "gray" }}>{record?.readRowCount ?? 0} r</span>
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
