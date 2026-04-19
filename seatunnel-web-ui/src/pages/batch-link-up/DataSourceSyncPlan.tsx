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

  const safeParse = (value: any) => {
    if (!value) return null;

    if (typeof value === "object") {
      return value;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    return null;
  };

  const formatTables = (tableValue: any, fallback?: string) => {
    if (!tableValue) return fallback || "-";

    if (typeof tableValue === "string") {
      const trimmed = tableValue.trim();

      if (!trimmed) return fallback || "-";

      // 普通单表名，直接返回
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return trimmed;
      }

      const parsed = safeParse(trimmed);
      if (!parsed) return fallback || trimmed;
      tableValue = parsed;
    }

    // 数组格式：["t1", "t2"]
    if (Array.isArray(tableValue)) {
      if (tableValue.length === 0) return fallback || "-";
      if (tableValue.length === 1) return tableValue[0];
      return `${tableValue[0]} +${tableValue.length - 1} more`;
    }

    // 对象格式：{schema1:["t1","t2"], schema2:["t3"]}
    if (typeof tableValue === "object") {
      const allTables: string[] = [];

      Object.values(tableValue).forEach((value: any) => {
        if (Array.isArray(value)) {
          allTables.push(...value);
        } else if (typeof value === "string" && value.trim()) {
          allTables.push(value.trim());
        }
      });

      if (allTables.length === 0) return fallback || "-";
      if (allTables.length === 1) return allTables[0];
      return `${allTables[0]} +${allTables.length - 1} more`;
    }

    return fallback || "-";
  };

  const getPlanTitle = () => {
    if (record?.jobType === "BATCH") {
      if (record?.mode === "GUIDE_SINGLE") return "Single Table";
      if (record?.mode === "GUIDE_MULTI") return "Multi Table";
      if (record?.mode === "SCRIPT") return "Script Mode";
      return "Batch Sync";
    }

    return "Data Sync";
  };

  const sourceTableText = formatTables(
    record?.sourceTable,
    record?.mode === "GUIDE_SINGLE" ? "Single Table" : "Not Configured"
  );

  const sinkTableText = formatTables(
    record?.sinkTable,
    record?.mode === "GUIDE_SINGLE" ? "Single Table" : "Not Configured"
  );

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
        <span>{getPlanTitle()}</span>
      </div>

      <div style={{ margin: "4px 0" }}>
        {/* SOURCE */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.sourceType ? (
            <>
              <DatabaseIcons
                dbType={record.sourceType}
                width="24"
                height="24"
              />
              <span style={{ marginLeft: 8 }}>{record.sourceType}</span>
            </>
          ) : (
            <span>-</span>
          )}

          <span style={{ margin: "0 6px", color: "green" }}>·</span>

          <span
            style={{
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
            title={String(sourceTableText)}
          >
            {sourceTableText}
          </span>
        </div>

        {/* ARROW */}
        <div style={{ margin: "8px 0", paddingLeft: 7 }}>
          <DoubleRightOutlined style={animatedIconStyle} />
        </div>

        {/* SINK */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.sinkType ? (
            <>
              <DatabaseIcons
                dbType={record.sinkType}
                width="24"
                height="24"
              />
              <span style={{ marginLeft: 8 }}>{record.sinkType}</span>
            </>
          ) : (
            <span>-</span>
          )}

          <span style={{ margin: "0 6px" }}>·</span>

          <span
            style={{
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
            title={String(sinkTableText)}
          >
            {sinkTableText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSyncPlan;