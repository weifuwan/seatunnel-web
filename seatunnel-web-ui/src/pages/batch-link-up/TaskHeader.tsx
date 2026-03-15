import { ProductOutlined } from '@ant-design/icons';
import React from 'react';
interface TaskDetailPanelProps {
  item: any;
}

const TaskHeader: React.FC<TaskDetailPanelProps> = ({ item }) => {

  return (
    <div className="dc-nav-header">
      <div className="dc-nav-header-content">
        <div className="dc-nav-header-title-group22">
          <ProductOutlined
            style={{
              fontSize: 20,
              color: '#5664ff',
              marginRight: 8,
              fontWeight: 600,
            }}
          />
          <p className="dc-nav-header-title22">{item?.jobName || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
