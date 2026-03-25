import React from "react";
import { Button, Divider } from "antd";
import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import CustomPagination from "./CustomPagination";

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
        position: "fixed",
        left: "var(--pro-sider-current-width)",
        right: 0,
        bottom: 0,
        padding: "12px 20px",
        background: "#fff",
        borderTop: "1px solid rgba(227,228,230,1)",
        zIndex: 99,
        transition: "left var(--pro-sider-transition-duration) ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
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

        <div style={{ marginRight: 8 }}>
          <CustomPagination {...pagination} />
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;