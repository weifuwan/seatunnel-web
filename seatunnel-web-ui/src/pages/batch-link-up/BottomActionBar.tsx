import { Button, Divider } from "antd";
import CustomPagination from "./CustomPagination";
import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";

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
  disabled = false,
}) => {
  const intl = useIntl();

  return (
    <div
      style={{
        width: "calc(100vw - 224px)",
        padding: "16px 24px",
        background: "white",
        position: "fixed",
        border: "1px solid rgba(227,228,230,1)",
        bottom: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Button
            size="small"
            style={{ width: 70 }}
            type="primary"
            onClick={onStart}
            disabled={disabled}
            icon={<PlayCircleOutlined />}
          >
            {intl.formatMessage({
              id: "pages.common.action.run",
              defaultMessage: "Run",
            })}
          </Button>

          <Divider type="vertical" />

          <Button
            style={{ width: 70 }}
            size="small"
            onClick={onStop}
            danger
            type="primary"
            disabled={disabled}
            icon={<StopOutlined />}
          >
            {intl.formatMessage({
              id: "pages.common.action.stop",
              defaultMessage: "Stop",
            })}
          </Button>
        </div>

        <div style={{ marginRight: 30 }}>
          <CustomPagination {...pagination} />
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;