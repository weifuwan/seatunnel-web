import {
  CheckCircleFilled,
  CloseOutlined,
  Loading3QuartersOutlined,
  MacCommandOutlined,
} from '@ant-design/icons';

interface TaskStatusProps {
  status: string;
}

const TaskStatus: React.FC<TaskStatusProps> = ({ status }) => {
  const renderStatus = (status: string) => {
    if (status === 'COMPLETED') {
      return (
        <span style={{ color: 'green' }}>
          <CheckCircleFilled style={{ marginRight: 4 }} /> <span style={{fontWeight: 500}}>COMPLETED</span>
        </span>
      );
    } else if (status === 'RUNNING') {
      return (
        <span style={{ color: 'blue' }}>
          <Loading3QuartersOutlined spin style={{ marginRight: 4 }} /> <span style={{fontWeight: 500}}>RUNNING</span>
        </span>
      );
    } else if (status === 'FAILED') {
      return (
        <span style={{ color: 'red' }}>
          <CloseOutlined style={{ marginRight: 4, fontSize: '90%' }} /> <span style={{fontWeight: 500}}>FAILED</span>
        </span>
      );
    } else {
      return (
        <span>
          <MacCommandOutlined style={{ marginRight: 4 }} /> <span style={{fontWeight: 500}}>Not Started</span>
        </span>
      );
    }
  };

  return <div>{renderStatus(status)}</div>;
};

export default TaskStatus;
