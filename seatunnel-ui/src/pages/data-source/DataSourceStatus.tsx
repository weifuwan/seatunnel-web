import { CheckCircleFilled, CloseOutlined, Loading3QuartersOutlined, MacCommandOutlined } from '@ant-design/icons';

interface DataSourceStatusProps {
  status: string;
}

const DataSourceStatus: React.FC<DataSourceStatusProps> = ({ status }) => {
  const renderStatus = (status: string) => {
    if (status === 'CONNECTED_SUCCESS') {
      return (
        <span style={{ color: 'green' }}>
          <CheckCircleFilled style={{ marginRight: 4 }} /> 连接成功
        </span>
      );
    } else if (status === 'CONNECTING') {
      return (
        <span style={{ color: 'blue' }}>
          <Loading3QuartersOutlined spin style={{ marginRight: 4 }} /> <span>连接中</span>
        </span>
      );
    } else if (status === 'CONNECTED_FAILED') {
      return (
        <span style={{ color: 'red' }}>
          <CloseOutlined style={{ marginRight: 4, fontSize: '90%' }} /> <span>连接失败</span>
        </span>
      );
    } else {
      return (
        <span>
          <MacCommandOutlined style={{ marginRight: 4 }} /> 未测试
        </span>
      );
    }
  };

  return <div>{renderStatus(status)}</div>;
};

export default DataSourceStatus;
