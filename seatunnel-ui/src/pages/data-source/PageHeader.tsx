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
        <div className={styles.headerSectionTitle}>List of Data Sources</div>
        <p className={styles.headerDescription}>
          A unified governance system for data sources, connectivity, access, and security.
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
