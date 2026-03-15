import Header from '@/components/Header';
import { Descriptions } from 'antd';
import React from 'react';
import DatabaseIcons from '../data-source/icon/DatabaseIcons';
import IconRightArrow from './IconRightArrow';

interface TaskDetailPanelProps {
  item: any;
}

const BasicInfoSection: React.FC<TaskDetailPanelProps> = ({ item }) => {
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
        <Header title={<span style={{ fontSize: 14 }}>基本信息</span>} />
        <div style={{ width: 150 }}>{/* 预留操作按钮 */}</div>
      </div>
      <Descriptions column={2}>
        <Descriptions.Item label={<span style={{ color: 'rgba(128,128,128,1)' }}>任务编码</span>}>
          <span style={{ color: '#000', paddingLeft: 12 }}>{item?.id || '-'}</span>
        </Descriptions.Item>

        <Descriptions.Item label={<span style={{ color: 'rgba(128,128,128,1)' }}>同步方案</span>}>
          <div style={{ color: '#000', paddingLeft: 12, display: 'flex', alignItems: 'center' }}>
            {item?.sourceType ? <DatabaseIcons dbType={item?.sourceType} width='24' height='24'/> : ''} &nbsp;&nbsp;&nbsp;
            {item?.sourceType}&nbsp;&nbsp;&nbsp; <IconRightArrow /> &nbsp;&nbsp;&nbsp;
            {item?.sinkType ? <DatabaseIcons dbType={item?.sinkType} width='24' height='24'/> : ''}
            &nbsp;&nbsp;&nbsp;{item?.sinkType}
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          span={4}
          label={<span style={{ color: 'rgba(128,128,128,1)' }}>同步方案</span>}
        >
          <span style={{ color: '#000', paddingLeft: 12 }}>{item?.taskExecuteTypeName || '-'}</span>
        </Descriptions.Item>


        <Descriptions.Item
          label={<span style={{ color: 'rgba(128,128,128,1)' }}>开始执行时间</span>}
        >
          <span style={{ color: '#000', paddingLeft: 12 }}>{item?.startTime || '-'}</span>
        </Descriptions.Item>
        <Descriptions.Item
          span={4}
          label={<span style={{ color: 'rgba(128,128,128,1)' }}>结束执行时间</span>}
        >
          <span style={{ color: '#000', paddingLeft: 12 }}>{item?.endTime || '-'}</span>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default BasicInfoSection;
