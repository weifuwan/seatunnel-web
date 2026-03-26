import CloseIcon from "@/pages/batch-link-up/workflow/icon/CloseIcon";
import CodeBlockWithCopy from "@/pages/batch-link-up/workflow/operator/CodeBlockWithCopy";
import { FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button, Divider, Popover, Space, Tooltip } from "antd";
import { FormInstance } from "antd/es/form";
import React from "react";

interface ActionFooterProps {
  form: FormInstance;
  baseForm?: FormInstance;
  matchMode: string;
  multiTableList: string[];
  sourceType: { dbType: string };
  targetType: { dbType: string };
  onSave: () => Promise<void>;
  onHocon: () => Promise<void>;
  open: boolean;
  content: string;
  onOpenChange: (open: boolean) => void;
  goBack: () => void;
}

const ActionFooter: React.FC<ActionFooterProps> = ({
  baseForm,
  onSave,
  onHocon,
  open,
  content,
  onOpenChange,
  goBack,
}) => {
  const isEdit = !!baseForm?.getFieldValue("id");

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
            onClick={onSave}
            icon={<PlayCircleOutlined />}
          >
            {isEdit ? "Update" : "Save"}
          </Button>

          <Divider type="vertical" />
          <Popover
            open={open}
            content={
              <div className={"publish-popover"} style={{ width: 600 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div className={"latest-publish"} style={{ fontWeight: 500 }}>
                    Seatunnel Streaming Hocon
                  </div>
                  <div
                    onClick={() => onOpenChange(false)}
                    style={{ cursor: "pointer" }}
                  >
                    <CloseIcon />
                  </div>
                </div>
                <Tooltip title="hocon模拟生成">
                  <CodeBlockWithCopy content={content} />
                </Tooltip>
              </div>
            }
          >
            <Space>
              <Button
                style={{ width: 75 }}
                size="small"
                type="primary"
                icon={<FileTextOutlined />}
                onClick={onHocon}
              >
                Hocon
              </Button>
            </Space>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ActionFooter;
