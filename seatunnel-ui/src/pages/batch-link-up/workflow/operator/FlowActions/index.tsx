import { message } from "antd";
import { HoconPreview } from "./HoconPreview";
import styles from "./index.less";
import { PublishPopover } from "./PublishPopover";
import { RunActions } from "./RunActions";
import { useFlowChecks } from "./useFlowChecks";
import { useFlowPublish } from "./useFlowPublish";
import { AIActions } from "./AIActions";

export const FlowActions = ({
  nodes,
  edges,
  baseForm,
  goBack,
  setRunVisible,
  runVisible,
}: any) => {
  const { publish, generateHocon } = useFlowPublish(nodes, edges, baseForm);
  const { checkStat, checkGroups } = useFlowChecks(nodes);

  return (
    <div>
      <div className={styles["content"]}>
        <div className={styles["flow-container"]}>
          <div className={styles["flow-wrapper"]}>
            <div className={styles["header"]}>
              <div className={styles["actions"]}>
                <AIActions />

                <RunActions
                  onBack={() => goBack()}
                  onRun={() => {
                    if (checkStat.total > 0) {
                      message.warning("Resolve all issues first 😊");
                      return;
                    }
                    setRunVisible(true);
                  }}
                  runVisible={runVisible}
                />

                <HoconPreview
                  onGenerate={generateHocon}
                  checkStat={checkStat}
                  checkGroups={checkGroups}
                />

                <PublishPopover onPublish={publish} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
