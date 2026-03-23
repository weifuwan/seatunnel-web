import React from 'react';
import { Button, Card } from 'antd';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import DatabaseIcons from '../icon/DatabaseIcons';
import DataSourceStatus from './DataSourceStatus';
import { environmentTagConfigMap } from '../constants';
import type { DataSourceRecord } from '../types';

interface DataSourceCardProps {
  record: DataSourceRecord;
  onEdit: (record: DataSourceRecord) => void;
  onDelete: (record: DataSourceRecord) => void;
  onTestConnection: (record: DataSourceRecord) => void;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({
  record,
  onEdit,
  onDelete,
  onTestConnection,
}) => {
  const environmentConfig = environmentTagConfigMap[record.environment || ''] || {
    text: record.environmentName || '-',
    color: '#8c8c8c',
    backgroundColor: '#fafafa',
    icon: null,
  };

  return (
    <Card hoverable bodyStyle={{ padding: 0 }} className="datasource-card">
      <div className="datasource-card-cover">
        <div className="datasource-card-logo">
          <DatabaseIcons dbType={record.dbType} width="28" height="28" />
        </div>

        <div className="datasource-card-env-tag">
          <span
            className="datasource-card-env-tag-inner"
            style={{
              background: environmentConfig.backgroundColor,
              color: environmentConfig.color,
            }}
          >
            {environmentConfig.icon}
            {record.environmentName || environmentConfig.text}
          </span>
        </div>

        <div className="datasource-card-actions">
          <div
            className="datasource-card-action-btn datasource-card-action-btn-danger"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(record);
            }}
          >
            <DeleteOutlined />
          </div>

          <div
            className="datasource-card-action-btn"
            onClick={(event) => {
              event.stopPropagation();
              onTestConnection(record);
            }}
          >
            <DisconnectOutlined />
          </div>
        </div>
      </div>

      <div className="datasource-card-content">
        <div className="datasource-card-title">{record.name || '-'}</div>

        <div className="datasource-card-jdbc-url" title={record.jdbcUrl}>
          {record.jdbcUrl || '-'}
        </div>

        <div className="datasource-card-status">
          <DataSourceStatus status={record.connStatus} />
        </div>

        <div className="datasource-card-update-time">
          <span className="datasource-card-update-time-value">{record.updateTime || '-'}</span>
        </div>

        <Button
          className="animated-profile-btn-v2"
          block
          type="default"
          onClick={() => onEdit(record)}
        >
          <span className="default-layer">Edit DataSource</span>

          <span className="hover-layer">
            <span className="hover-label">Edit DataSource</span>
            <span className="hover-icon">
              <ArrowRightOutlined />
            </span>
          </span>
        </Button>
      </div>
    </Card>
  );
};

export default DataSourceCard;