import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { Divider } from "antd";
import type { FC } from "react";
import { memo, useEffect, useState } from "react";
import CloseIcon from "../icon/CloseIcon";

import HttpPanel from "./components/HttpPanel";
import SinkPanel from "./components/SinkPanel";
import SourcePanel from "./components/SourcePanel";
import TransformPanel from "./components/TransformPanel";
import "./index.less";

interface WorkflowPanelProps {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

const WorkflowPanel: FC<WorkflowPanelProps> = ({
  selectedNode,
  onClose,
  onNodeDataChange,
}) => {
  const [localData, setLocalData] = useState({
    title: "",
    desc: "",
    dbType: "",
  });

  // 当selectedNode变化时，更新本地状态
  useEffect(() => {
    if (selectedNode) {
      setLocalData({
        title: selectedNode.data?.title || "",
        desc: selectedNode.data?.desc || "",
        dbType: selectedNode.data?.dbType || "",
      });
    }
  }, [selectedNode]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalData((prev) => ({ ...prev, title: newTitle }));

    // 更新节点数据
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        title: newTitle,
      });
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDesc = e.target.value;
    setLocalData((prev) => ({ ...prev, desc: newDesc }));

    // 更新节点数据
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        desc: newDesc,
      });
    }
  };

  const renderNodePanel = (selectedNode: any) => {
    if (selectedNode?.data?.nodeType === "source") {
      return (
        <SourcePanel
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
        />
      );
    } else if (selectedNode?.data?.nodeType === "sink") {
      return (
        <SinkPanel
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
        />
      );
    } else if (selectedNode?.data?.nodeType === "transform") {
      return (
        <TransformPanel
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
        />
      );
    } else {
      return (
        <HttpPanel
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
        />
      );
    }
  };

  return (
    <div tabIndex={-1} className="workflowPanel">
      <div className="workflowPanel-container">
        {/* header */}
        <div className="workflowPanel-header">
          <div className="workflowPanel-headerContent">
            <div
              className="workflowPanel-iconContainer"
              style={{ border: "1px solid rgba(0,0,0,0.1)", padding: 3 }}
            >
              <DatabaseIcons dbType={localData?.dbType} width="20" height="20" />
            </div>
            <input
              className="workflowPanel-titleInput"
              placeholder="添加标题..."
              value={localData.title}
              onChange={handleTitleChange}
            ></input>

            <div className="workflowPanel-actions">
              <div className="workflowPanel-actionButton" style={{width: "5.2rem"}}>
                {selectedNode?.data?.nodeType}&nbsp;&nbsp;node
              </div>

              <Divider type="vertical" style={{ margin: "0 4px" }} />
              <div className="workflowPanel-actionButton" onClick={onClose}>
                <CloseIcon />
              </div>
            </div>
          </div>

          {/* level 2 */}
          <div className="workflowPanel-descriptionContainer">
            <div
              style={{
                borderRadius: "0.5rem",
                overflowY: "hidden",
                maxHeight: 70,
                display: "flex",
              }}
            >
              <textarea
                placeholder="add desc..."
                className="workflowPanel-descriptionTextarea"
                value={localData.desc}
                onChange={handleDescChange}
              ></textarea>
            </div>
          </div>
        </div>
        {selectedNode && renderNodePanel(selectedNode)}
      </div>
    </div>
  );
};

export default memo(WorkflowPanel);
