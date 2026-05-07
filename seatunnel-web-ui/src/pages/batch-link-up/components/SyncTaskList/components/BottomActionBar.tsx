import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button, Divider } from "antd";
import React from "react";
import CustomPagination from "../../../CustomPagination";

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
            type="primary"
            onClick={onStart}
            disabled={disabled}
            className="h-8 min-w-[88px] rounded-full border-none bg-gradient-to-rfont-bold shadow-[0_12px_26px_rgba(53,84,209,0.23)]"
            icon={<PlayCircleOutlined />}
          >
            {intl.formatMessage({
              id: "pages.common.action.run",
              defaultMessage: "Run",
            })}
          </Button>

          <Divider type="vertical" />

          <Button
            size="small"
            onClick={onStop}
            danger
            type="primary"
            disabled={disabled}
            className="h-8 min-w-[88px] rounded-full border-none bg-gradient-to-rfont-bold shadow-[0_12px_26px_rgba(53,84,209,0.23)]"
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
