import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  Loading3QuartersOutlined,
} from '@ant-design/icons';
import { Alert, List, message, Select, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { HistoryItem, taskExecutionApi } from './type';

interface TaskHistoryPanelProps {
  selectedItem: any;
  statusFilter: string;
  onItemSelect: (id: number) => void;
  onStatusFilterChange: (status: string) => void;
  selectId: string;
  setSelectId: (id: string) => void;
}

const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({
  selectedItem,
  statusFilter,
  onItemSelect,
  onStatusFilterChange,
  selectId,
  setSelectId,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (selectedItem && selectedItem?.id) {
      taskExecutionApi.getExecutionInfo(selectedItem?.id).then((data) => {
        if (data?.code === 0) {
          setHistoryItems(data?.data);
        } else {
          message.error(data?.message);
        }
      });
    }
  }, [selectedItem]);

  const filteredItems =
    statusFilter === 'all'
      ? historyItems
      : historyItems.filter((item) => item.status === statusFilter);

  const getBadgeStatus = (status: HistoryItem['status']) => {
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
          message="运行历史只展示您最近三天的运行数据"
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
              onClick={() => setSelectId(item.id)}
              style={{
                cursor: 'pointer',
                borderRadius: 0,
                padding: '4px 6px',
                backgroundColor: selectId === item.id ? '#f5f5f5' : 'transparent',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <List.Item.Meta
                avatar={getBadgeStatus(item.status)}
                title={<Typography.Text strong>{item.taskName}</Typography.Text>}
                description={<div style={{ fontSize: 12 }}>{item.createTime}</div>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default TaskHistoryPanel;
