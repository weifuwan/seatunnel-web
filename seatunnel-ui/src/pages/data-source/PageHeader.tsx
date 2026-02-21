import React from 'react';
import styles from './index.less';

const PageHeader: React.FC = () => {
  return (
    <div className={styles.headerSection}>
      <div
        style={{
          flex: 1,
        }}
      >
        <div className={styles.headerSectionTitle}>数据源列表</div>
        <p className={styles.headerDescription}>
          对数据的来源、连接、访问和安全等进行统一集中管控的体系。
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
