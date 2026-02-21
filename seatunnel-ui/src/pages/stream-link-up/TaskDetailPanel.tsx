import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import BasicInfoSection from './BasicInfoSection';
import RunLogSection from './RunLogSection';
import TaskHeader from './TaskHeader';
import { taskExecutionApi } from './type';

interface TaskDetailPanelProps {
  selectId: string;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ selectId }) => {
  if (!selectId || selectId === '') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: '#999',
        }}
      >
        请选择左侧的运行记录查看详情
      </div>
    );
  }

  const [item, setItem] = useState<any>([]);
  useEffect(() => {
    if (selectId !== '' && selectId !== undefined) {
      taskExecutionApi.get(selectId).then((data) => {
        if (data?.code === 0) {
          setItem(data?.data);
        } else {
          message.error(data?.message);
        }
      });
    }
  }, [selectId]);
  return (
    <div>
      <TaskHeader item={item} />
      <div
        style={{
          backgroundColor: '#f6f6f6',
          height: 'calc(100vh - 46px)',
          overflowY: 'auto',
        }}
      >
        <BasicInfoSection item={item} />
        <RunLogSection item={item} />
        {/* <StructureMigrationSection item={item} /> */}
      </div>
    </div>
  );
};

export default TaskDetailPanel;
