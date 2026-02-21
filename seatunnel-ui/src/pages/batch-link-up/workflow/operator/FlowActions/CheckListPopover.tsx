import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { WarningOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import CheckIcon from "../../icon/CheckIcon";
import CloseIcon from "../../icon/CloseIcon";
import styles from "./index.less";

export const CheckListPopover = ({ checkStat, checkGroups }: any) => (
  <Popover
    content={
      <div style={{ padding: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              color: "#101828",
              fontWeight: 600,
              height: 34,
              fontSize: 16,
            }}
          >
            Checklist({checkStat.total})
          </div>
          <div>
            <CloseIcon />
          </div>
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            lineHeight: "1rem",
            color: "#676f83",
            marginBottom: 8,
          }}
        >
          Make sure all issues are resolved before publishing
        </div>
        <div style={{ maxHeight: 300, overflow: "auto", width: 360 }}>
          {checkGroups.map((group: any) => (
            <div
              key={group.nodeId}
              style={{
                fontSize: 12,
                border: "1px solid rgb(16 24 40/0.08)",
                borderRadius: "0.5rem",
                marginBottom: 8,
              }}
            >
              {/* 节点头部 */}
              <div style={{ padding: "0.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <DatabaseIcons
                      dbType={group.dbType || "MYSQL"}
                      width="20"
                      height="20"
                    />
                    <span style={{ fontWeight: 700, marginLeft: 6 }}>
                      {group.title}
                    </span>
                  </div>
                  <div>{group.nodeType} &nbsp;&nbsp;node</div>
                </div>
              </div>
              {/* 节点检查项 */}
              {group.items.map((item: any, index: any) => (
                <div
                  key={index}
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgb(247 144 9/0.08) , transparent)",
                    borderTop: "1px solid rgb(16 24 40/0.08)",
                  }}
                >
                  <div style={{ padding: "0.375rem 0.75rem" }}>
                    <WarningOutlined style={{ color: "rgb(247 144 9)" }} />
                    <span style={{ color: "#676f83" }}> {item.message} </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    }
    trigger="click"
  >
    <div className={styles["history-button"]}>
      <CheckIcon />
      <div style={{ position: "relative" }}>
        {" "}
        <div
          style={{
            fontWeight: 600,
            fontSize: 11,
            backgroundColor: "rgb(247 144 9)",
            borderColor: "rgb(242 244 247)",
            borderWidth: 1,
            borderRadius: 9999,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 18,
            height: 18,
            top: -24,
            right: -15,
            position: "absolute",
          }}
        >
          {" "}
          {checkStat.total}{" "}
        </div>
      </div>
    </div>
  </Popover>
);
