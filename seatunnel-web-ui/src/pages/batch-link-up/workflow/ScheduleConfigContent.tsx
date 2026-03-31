import styles from "./index.less";

const formItems = ["调度方式", "执行周期", "开始时间", "失败重试"];

export default function ScheduleConfigContent() {
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