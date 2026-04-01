import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';

interface PageHeaderProps {
  onCreate: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onCreate }) => {
  const intl = useIntl();

  return (
    <div className="datasource-page-header">
      <div>
        <div className="datasource-page-title-row">
          <div className="datasource-page-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="datasource-page-icon"
            >
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4" />
              <path d="M10 10h4" />
              <path d="M10 14h4" />
              <path d="M10 18h4" />
            </svg>
          </div>

          <h1 className="datasource-page-title">
            {intl.formatMessage({
              id: 'pages.datasource.header.title',
              defaultMessage: 'List of Data Sources',
            })}
          </h1>
        </div>

        <p className="datasource-page-description">
          {intl.formatMessage({
            id: 'pages.datasource.header.desc',
            defaultMessage:
              'A unified governance system for data sources, connectivity, access, and security.',
          })}
        </p>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        size="large"
        onClick={onCreate}
        className="datasource-create-button"
      >
        新建数据源
      </Button>
    </div>
  );
};

export default PageHeader;