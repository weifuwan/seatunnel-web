import { Button, Divider } from 'antd';
import CustomPagination from './CustomPagination';
import { PlayCircleOutlined, StarOutlined, StopOutlined } from '@ant-design/icons';

interface BottomActionBarProps {
  onStart: () => void;
  onStop: () => void;
  pagination: {
    total: number;
    current?: number;
    pageSize?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  disabled?: boolean;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ 
  onStart, 
  onStop, 
  pagination, 
  disabled = false 
}) => {
  return (
    <div
      style={{
        width: 'calc(100vw - 224px)',
        padding: '16px 24px',
        background: 'white',
        position: 'fixed',
        border: '1px solid rgba(227,228,230,1)',
        bottom: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Button size="small" style={{ width: 70 }} type='primary' onClick={onStart} disabled={disabled} icon={<PlayCircleOutlined />}>
            Run
          </Button>
          <Divider type="vertical" />
          <Button style={{ width: 70 }} size="small" onClick={onStop} danger type='primary' disabled={disabled} icon={<StopOutlined />}>
            Stop
          </Button>
        </div>
        <div style={{marginRight: 30}}>
          <CustomPagination {...pagination} />
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;