import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

interface DataSourceStatusProps {
  status?: string;
}

type StatusConfigItem = {
  color: 'success' | 'error' | 'processing' | 'default' | 'warning';
  icon: React.ReactNode;
  text: string;
  tooltip?: string;
};

const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  CONNECTED_SUCCESS: {
    color: 'success',
    icon: <CheckCircleFilled />,
    text: '已连接',
    tooltip: '数据源连接正常',
  },
  CONNECTED_FAILED: {
    color: 'error',
    icon: <CloseCircleFilled />,
    text: '连接失败',
    tooltip: '数据源连接测试失败',
  },
  CONNECTING: {
    color: 'processing',
    icon: <LoadingOutlined spin />,
    text: '连接中',
    tooltip: '正在进行连接测试',
  },
  CONNECTED_NONE: {
    color: 'default',
    icon: <MinusCircleOutlined />,
    text: '未连接',
    tooltip: '尚未进行连接测试',
  },
};

const DataSourceStatus: React.FC<DataSourceStatusProps> = ({ status }) => {
  const config = STATUS_CONFIG[status || 'CONNECTED_NONE'] || STATUS_CONFIG.CONNECTED_NONE;

  return (
    <Tooltip title={config.tooltip}>
      <Tag
        color={config.color}
        icon={config.icon}
        style={{
          marginInlineEnd: 0,
          borderRadius: 999,
          paddingInline: 10,
          fontSize: 12,
          lineHeight: '20px',
        }}
      >
        {config.text}
      </Tag>
    </Tooltip>
  );
};

export default DataSourceStatus;