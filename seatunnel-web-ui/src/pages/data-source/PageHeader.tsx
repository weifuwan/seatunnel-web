import { useIntl } from "@umijs/max";
import React from "react";
import styles from "./index.less";

const PageHeader: React.FC = () => {
  const intl = useIntl();

  return (
    <div className={styles.headerSection}>
      <div
        style={{
          flex: 1,
        }}
      >
        <div className={styles.headerSectionTitle}>
          {intl.formatMessage({
            id: "pages.datasource.header.title",
            defaultMessage: "List of Data Sources",
          })}
        </div>

        <p className={styles.headerDescription}>
          {intl.formatMessage({
            id: "pages.datasource.header.desc",
            defaultMessage:
              "A unified governance system for data sources, connectivity, access, and security.",
          })}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
