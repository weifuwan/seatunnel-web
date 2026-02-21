import { DoubleRightOutlined } from "@ant-design/icons";
import { CSSProperties } from "react";
import DatabaseIcons from "../data-source/icon/DatabaseIcons";

interface DataSourceSyncPlanProps {
  record: any;
}

const DataSourceSyncPlan: React.FC<DataSourceSyncPlanProps> = ({ record }) => {
  const animatedIconStyle: CSSProperties = {
    fontSize: 10,
    animation: "float 2s ease-in-out infinite",
  };

  const safeParse = (jsonStr: any) => {
    if (!jsonStr) return null;

    if (typeof jsonStr === "object") return jsonStr;

    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("JSON parse failed:", jsonStr);
      return null;
    }
  };

  const formatTables = (tableStr: any) => {
    const tableObj = safeParse(tableStr);
    if (!tableObj || typeof tableObj !== "object") return "-";

    const allTables: string[] = [];

    Object.values(tableObj).forEach((value: any) => {
      if (Array.isArray(value)) {
        allTables.push(...value);
      }
    });

    if (allTables.length === 0) return "-";

    if (allTables.length === 1) {
      return allTables[0];
    }

    return `${allTables[0]} +${allTables.length - 1} more`;
  };

  return (
    <div style={{ color: "rgba(0,0,0,0.74)", fontWeight: 500 }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(90deg); }
            50% { transform: translateY(-8px) rotate(90deg); }
          }
        `}
      </style>

      <div>
        <span>
          {record?.wholeSync === true
            ? "Full DB Sync / Multi-Table Sync"
            : "Batch Sync"}
        </span>
      </div>

      <div style={{ margin: "4px 0" }}>
        {/* SOURCE */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.sourceType && (
            <>
              <DatabaseIcons
                dbType={record?.sourceType}
                width="24"
                height="24"
              />
              &nbsp;&nbsp;
              <a>{record?.sourceType}</a>
            </>
          )}

          <span style={{ margin: "0 4px", color: "green" }}>·</span>

          <span
            style={{
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
            title={JSON.stringify(record?.sourceTable)}
          >
            {formatTables(record?.sourceTable)}
          </span>
        </div>

        {/* ARROW */}
        <div style={{ margin: "8px 0", paddingLeft: 7 }}>
          <DoubleRightOutlined style={animatedIconStyle} />
        </div>

        {/* SINK */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.sinkType && (
            <>
              <DatabaseIcons dbType={record?.sinkType} width="24" height="24" />
              &nbsp;&nbsp;
              <a>{record?.sinkType}</a>
            </>
          )}

          <span style={{ margin: "0 4px" }}>·</span>

          <span
            style={{
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
            title={JSON.stringify(record?.sinkTable)}
          >
            {formatTables(record?.sinkTable)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSyncPlan;
