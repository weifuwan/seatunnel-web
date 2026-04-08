import { Button, Space } from "antd";
import { getTabDefinitions } from "./configDefinition";
import styles from "./index.less";
import type { TabKey } from "./types";

interface RightConfigPanelProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  params?: any;
}

export default function RightConfigPanel({
  activeTab = "basic",
  onTabChange,
  params,
}: RightConfigPanelProps) {
  const tabDefinitions = getTabDefinitions(params);

  const activeConfig =
    tabDefinitions.find((item: any) => item.key === activeTab) ??
    tabDefinitions[0];

  return (
    <div className={styles.sidePanel}>
      <div className={styles.sidePanelHeader}>
        <div className={styles.sidePanelTitle}>配置面板</div>
      </div>

      <div className={styles.tabs}>
        {tabDefinitions.map((item: any) => (
          <div
            key={item.key}
            className={`${styles.tab} ${
              activeTab === item.key ? styles.tabActive : ""
            }`}
            onClick={() => onTabChange?.(item.key)}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className={styles.formArea}>{activeConfig.content}</div>

      {/* <div className={styles.sidePanelFooter}>
        <Space className={styles.footerActions}>
          <Button className={styles.footerButton}>重置</Button>
          <Button type="primary" className={styles.footerPrimaryButton}>
            应用配置
          </Button>
        </Space>
      </div> */}
    </div>
  );
}