import { Button, Divider, Popover } from "antd";
import DownIcon from "../../icon/DownIcon";
import styles from "./index.less";

export const PublishPopover = ({ onPublish }: any) => (
  <Popover
    content={
      <>
        <div className={styles["publish-popover"]}>
          <div className={styles["latest-publish"]}>最新发布</div>
          <div className={styles["publish-time"]}> 发布于 16 小时前 </div>
          <Button
            className={styles["update-button"]}
            type="primary"
            style={{ borderRadius: "0.5rem" }}
            onClick={() => {
              onPublish();
            }}
          >
            Publish & Update
          </Button>
          <Divider className={styles.divider} />
          <div>
            <a></a>
          </div>
        </div>
      </>
    }
    trigger="click"
  >
    <Button type="primary" style={{borderRadius: "0.5rem"}}>
      Publish <DownIcon />
    </Button>
  </Popover>
);
