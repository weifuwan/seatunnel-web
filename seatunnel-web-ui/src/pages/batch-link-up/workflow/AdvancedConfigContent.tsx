import styles from "./index.less";

const formItems = ["并发参数", "脏数据控制", "日志级别", "性能优化"];

export default function AdvancedConfigContent() {
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