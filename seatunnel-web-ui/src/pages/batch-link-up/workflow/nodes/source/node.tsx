import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import type { FC } from "react";
import React, { useState } from "react";
import { Handle, Node, NodeProps, useReactFlow } from "reactflow";
import SuccessIcon from "../../icon/SuccessIcon";
import "./index.less";

const StartNode: FC<NodeProps<any>> = ({ id, data, selected }) => {
  const { addNodes, addEdges, getNode, getNodes } = useReactFlow();
  const [showRightHandle, setShowRightHandle] = useState(false);



  const getBorderColor = () => {
    switch (data?.executionStatus) {
      case "running":
        return "#faad14"; // Blue for running
      case "succeeded":
        return "#17b26a"; // Green for success
      case "failed":
        return "#ff4d4f"; // Red for failed
      case "pending":
        return "#296dff"; // Orange for pending
      default:
        return selected ? "#296dff" : "transparent";
    }
  };

  const getPointColor = () => {
    switch (data?.executionStatus) {
      case "running":
        return "#faad14"; // Blue for running
      case "succeeded":
        return "#17b26a"; // Green for success
      case "failed":
        return "#ff4d4f"; // Red for failed
      case "pending":
        return "#296dff"; // Orange for pending
      default:
        return "#296dff";
    }
  };

  return (
    <div style={{backgroundColor: "#e9ebf0", borderRadius: "0.7rem", cursor: "pointer"}}>
      <div
        style={{
          paddingTop: ".125rem",
          paddingLeft: ".625rem",
          paddingRight: ".625rem",
          display: "flex",
          alignItems: "center",
          marginBottom: "0.125rem",
        }}
      >
        <span
          style={{
            color: "#676f83",
            fontWeight: 600,
            fontSize: "0.625rem",
          }}
        >
          source
        </span>
      </div>

      <div
        className={`start-node-container ${selected ? "selected" : ""}`}
        style={{
          backgroundColor: "#fcfcfd",
          borderColor: getBorderColor(),
          borderWidth: "1px",
          borderStyle: "solid",
        }}
        onMouseEnter={() => setShowRightHandle(true)}
        onMouseLeave={() => setShowRightHandle(false)}
      >
        <div
          className="node-header"
          style={{
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className="icon-wrapper"
              style={{
                backgroundColor: "white",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* <HomeIcon className="home-icon" /> */}

              <DatabaseIcons dbType={data?.dbType} width="16" height="16" />
            </div>
            <div className="node-title">{data.title || "输入端"}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            {data?.executionStatus === "succeeded" ? <SuccessIcon /> : <></>}
          </div>
        </div>

        <Handle
          type="source"
          position="right"
          style={{
            backgroundColor: getPointColor(),
          }}
          className="right-handle"
        />
      </div>
    </div>
  );
};

export default React.memo(StartNode);
