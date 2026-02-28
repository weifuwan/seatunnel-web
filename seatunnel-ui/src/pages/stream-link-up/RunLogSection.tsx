import Header from '@/components/Header';
import { SyncOutlined } from '@ant-design/icons';
import { Alert, message, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';

import { taskExecutionApi } from './type';

interface TaskDetailPanelProps {
  item: any;
}

const RunLogSection: React.FC<TaskDetailPanelProps> = ({ item }) => {
  const [logContent, setLogContent] = useState('');

  const getTaskLog = (id: string) => {
    taskExecutionApi.taskLog(item?.id).then((data) => {
      if (data?.code === 0) {
        setLogContent(data?.data);
      } else {
        message.error(data?.message);
      }
    });
  };

  const renderAlert = () => {
    if (item?.status === 'RUNNING') {
      return (
        <Alert
          message="运行中"
          style={{
            padding: '4px 4px 4px 12px',
            fontSize: 12,
            borderRadius: 6,
            marginBottom: 12,
          }}
          type="info"
          showIcon
        />
      );
    } else if (item?.status === 'COMPLETED') {
      return (
        <Alert
          message="运行成功"
          style={{
            padding: '4px 4px 4px 12px',
            fontSize: 12,
            borderRadius: 6,
            marginBottom: 12,
          }}
          type="success"
          showIcon
        />
      );
    } else if (item?.status === 'FAILED') {
      return (
        <Alert
          message="运行失败"
          style={{
            padding: '4px 4px 4px 12px',
            fontSize: 12,
            borderRadius: 6,
            marginBottom: 12,
          }}
          type="error"
          showIcon
        />
      );
    }
  };

  useEffect(() => {
    if (item?.id) {
      getTaskLog(item?.id);
    }
  }, [item]);

  return (
    <div
      style={{
        margin: 16,
        padding: 16,
        background: '#fff',
        borderRadius: 4,
        boxShadow: '0 2px 6px #0000000d',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Header title={<span style={{ fontSize: 14 }}>运行日志</span>} />
        <div style={{ cursor: 'pointer' }}>
          <Tooltip title="刷新">
            <SyncOutlined
              onClick={() => {
                getTaskLog(item?.id);
              }}
            />
          </Tooltip>
        </div>
      </div>

      {renderAlert()}

      <div>
        good
      </div>
    </div>
  );
};

export default RunLogSection;
