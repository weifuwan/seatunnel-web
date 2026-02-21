import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  Loading3QuartersOutlined,
} from '@ant-design/icons';
import { Alert, List, message, Select, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { HistoryItem, taskExecutionApi } from './type';
import { seatunnelJobInstanceApi } from './api';

interface TaskHistoryPanelProps {
  selectedItem: any;
  statusFilter: string;
  onItemSelect: (id: number) => void;
  onStatusFilterChange: (status: string) => void;
  instanceItem: any;
  setInstanceItem: (item: any) => void;
}

const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({
  selectedItem,
  statusFilter,
  onItemSelect,
  onStatusFilterChange,
  instanceItem,
  setInstanceItem,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (selectedItem && selectedItem?.id) {
      seatunnelJobInstanceApi.page({
        jobDefinitionId: selectedItem?.id
      }).then((data) => {
        if (data?.code === 0) {
          setHistoryItems(data?.data?.bizData);
        } else {
          message.error(data?.message);
        }
      });
    }
  }, [selectedItem]);

  const filteredItems =
    statusFilter === 'all'
      ? historyItems
      : historyItems.filter((item) => item.jobStatus === statusFilter);

  const getBadgeStatus = (status: HistoryItem['jobStatus']) => {
    switch (status) {
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: 'red' }} />;
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 'RUNNING':
        return <Loading3QuartersOutlined style={{ color: 'blue' }} spin />;
      default:
        return 'default';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 4,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div style={{ borderBottom: '1px solid #f0f0f0' }}>
        <Alert
          message="Only show your run history from the past three days 😊"
          type="info"
          showIcon
          style={{
            fontSize: 12,
            margin: '4px 6px',
            padding: '1px 8px',
            borderRadius: 6,
          }}
        />
        <div style={{ padding: 6 }}>
          <Select
            style={{ width: '100%' }}
            value={statusFilter}
            size="small"
            onChange={onStatusFilterChange}
            allowClear
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'success', label: '成功' },
              { value: 'failed', label: '失败' },
              { value: 'running', label: '运行中' },
              { value: 'pending', label: '等待中' },
            ]}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          dataSource={filteredItems}
          renderItem={(item) => (
            <List.Item
              onClick={() => setInstanceItem(item)}
              style={{
                cursor: 'pointer',
                borderRadius: 0,
                padding: '4px 6px',
                backgroundColor: instanceItem?.id === item.id ? '#f5f5f5' : 'transparent',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <List.Item.Meta
                avatar={getBadgeStatus(item.jobStatus)}
                title={<Typography.Text strong>{item.jobName || "123"}</Typography.Text>}
                description={<div style={{ fontSize: 12 }}>{item.startTime}</div>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default TaskHistoryPanel;
