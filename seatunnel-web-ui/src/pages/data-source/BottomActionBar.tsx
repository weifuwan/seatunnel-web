import { ApiOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Divider } from 'antd';
import CustomPagination from './CustomPagination';
import { useIntl } from '@umijs/max';

interface BottomActionBarProps {
  pagination: {
    total: number;
    pageNo?: number;
    pageSize?: number;
  };
  disabled?: boolean;
  batchConnectTest?: () => void;
  batchDeleteTest?: () => void;
  onChange: (page: number, pageSize: number) => void;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  pagination,
  disabled = false,
  batchConnectTest,
  batchDeleteTest,
  onChange,
}) => {

  const intl = useIntl();

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
          <Button
            onClick={batchConnectTest}
            size="small"
            style={{ width: 110, borderRadius: 4 }}
            disabled={disabled}
            type="primary"
            icon={<ApiOutlined />}
          >
            {intl.formatMessage({
              id: 'pages.datasource.bottom.batchTest',
              defaultMessage: 'Batch Test',
            })}
          </Button>

          <Divider type="vertical" />

          <Button
            onClick={batchDeleteTest}
            style={{ width: 110, borderRadius: 4 }}
            size="small"
            disabled={disabled}
            danger
            type="primary"
            icon={<DeleteOutlined />}
          >
            {intl.formatMessage({
              id: 'pages.datasource.bottom.batchDelete',
              defaultMessage: 'Batch Delete',
            })}
          </Button>
        </div>

        <div style={{ marginRight: 30 }}>
          <CustomPagination
            total={pagination?.total}
            pageSize={pagination?.pageSize}
            current={pagination?.pageNo}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;