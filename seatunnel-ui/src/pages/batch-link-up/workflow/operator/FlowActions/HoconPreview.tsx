import { FileSearchOutlined } from "@ant-design/icons";
import { Popover, Tooltip, message } from "antd";
import { useState } from "react";

import CloseIcon from "../../icon/CloseIcon";
import CodeBlockWithCopy from "../CodeBlockWithCopy";
import { CheckListPopover } from "./CheckListPopover";
import styles from "./index.less";

export const HoconPreview = ({ onGenerate, checkStat, checkGroups }: any) => {
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    if (checkStat.total > 0) {
      message.warning("Resolve all issues first 😊");
      return;
    }
    setLoading(true);
    try {
      const data = await onGenerate();
      if (data?.code === 0) {
        setContent(data.data);
        setOpen(true);
      } else {
        setOpen(false);
        message.error(data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["run-container"]}>
      <Popover
        open={open}
        content={
          <div className={styles["publish-popover"]} style={{ width: 600 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6
              }}
            >
              <div className={styles["latest-publish"]} style={{fontWeight: 500}}>Seatunnel Hocon</div>
              <div
                onClick={() => {
                  setOpen(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <CloseIcon />
              </div>
            </div>
            <Tooltip title="hocon模拟生成">
              <CodeBlockWithCopy content={content} />
            </Tooltip>
          </div>
        }
      >
        <div className={styles["history-button"]} onClick={handleClick}>
          <FileSearchOutlined />
        </div>
      </Popover>
      <div className={styles.divider}></div>
      <CheckListPopover checkStat={checkStat} checkGroups={checkGroups} />
    </div>
  );
};
