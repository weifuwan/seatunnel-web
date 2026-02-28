import DeepSeekIcon from "../../icon/DeepSeekIcon";
import styles from "./index.less";

export const AIActions = ({ onBack, onRun, runVisible }: any) => (
  <>
    <div className={styles["run-container"]}>
      <div
        className={styles["run-button"]}
        style={{
          width: 46,
        }}
        onClick={onRun}
      >
        <DeepSeekIcon />
      </div>
    </div>
  </>
);
