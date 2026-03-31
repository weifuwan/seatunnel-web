import styles from "./index.less";

const formItems = ["任务名称", "数据源", "目标源", "运行参数", "高级设置"];

export default function BasicConfigContent() {
  return (
    <div className={styles.formGrid}>
      {formItems.map((item) => (
        <div key={item} className={styles.formCard}>
          <div className={styles.formCardTitle}>{item}</div>
          <div className={styles.formPlaceholder} />
        </div>
      ))}
    </div>
  );
}