import { DoubleRightOutlined } from "@ant-design/icons";
import { CSSProperties } from "react";
import DatabaseIcons from "../data-source/icon/DatabaseIcons";
import IncrementalIcon from "./detail/components/icon/IncrementalIcon";
import StreamIcon from "./detail/components/icon/StreamIcon";

interface DataSourceSyncPlanProps {
  record: any;
}

const DataSourceSyncPlan: React.FC<DataSourceSyncPlanProps> = ({ record }) => {
  // 动画样式
  const animatedIconStyle: CSSProperties = {
    fontSize: 10,
    animation: "float 2s ease-in-out infinite",
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
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.jobType === "STREAMING" ? (
            <StreamIcon width="14" height="14" />
          ) : (
            <IncrementalIcon width="14" height="14"/>
          )}
          &nbsp;&nbsp;{record?.jobType}
        </div>
      </div>
      <div style={{ margin: "4px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.sourceType !== undefined ? (
            <>
              <DatabaseIcons
                dbType={record?.sourceType}
                width="24"
                height="24"
              />{" "}
              &nbsp;&nbsp;
              <a>{record?.sourceType}</a>
            </>
          ) : (
            ""
          )}
          {/* <span style={{ marginLeft: 4 }}>{''}</span> */}
          <span style={{ margin: "0 4px", marginRight: 4, color: "green" }}>
            ·
          </span>
          <span
            style={{
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {record?.sourceTable}
          </span>
        </div>

        <div style={{ margin: "8px 0", paddingLeft: 7 }}>
          <DoubleRightOutlined style={animatedIconStyle} />
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {record?.sinkType !== undefined ? (
            <>
              <DatabaseIcons dbType={record?.sinkType} width="24" height="24" />{" "}
              &nbsp;&nbsp;
              <a>{record?.sinkType}</a>
            </>
          ) : (
            ""
          )}
          <span style={{ marginLeft: 4 }}>{""}</span>
          <span style={{ margin: "0 4px" }}>·</span>
          <span
            style={{
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {record?.sinkTable}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSyncPlan;
