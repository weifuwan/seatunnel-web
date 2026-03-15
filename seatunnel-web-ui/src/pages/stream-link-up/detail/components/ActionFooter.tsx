import CloseIcon from "@/pages/batch-link-up/workflow/icon/CloseIcon";
import CodeBlockWithCopy from "@/pages/batch-link-up/workflow/operator/CodeBlockWithCopy";
import {
  FileTextOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, ConfigProvider, Divider, Popover, Space, Tooltip } from "antd";
import { createStyles } from "antd-style";
import { FormInstance } from "antd/es/form";

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
  form,
  baseForm,
  matchMode,
  multiTableList,
  sourceType,
  targetType,
  onSave,
  onHocon,
  open,
  content,
  onOpenChange,
  goBack,
}) => {
  const isEdit = !!baseForm?.getFieldValue("id");
  const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(
          .${prefixCls}-btn-dangerous
        ) {
        > span {
          position: relative;
        }

        &::before {
          position: absolute;
          background: linear-gradient(135deg, #6253e1, #04befe);
          border-radius: inherit;
          opacity: 1;
          transition: all 0.3s;
          content: "";
          inset: -1px;
        }

        &:hover::before {
          opacity: 0;
        }
      }
    `,
  }));

  const { styles } = useStyle();
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
            icon={<SaveOutlined />}
            onClick={onSave}
          >
            {isEdit ? "Update" : "Save"}
          </Button>
          <Divider type="vertical" />
<ConfigProvider
              button={{
                className: styles.linearGradientButton,
              }}
            >
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
            
          </Popover></ConfigProvider>
        </div>
        <div>
          <Button
            style={{ width: 75, marginRight: "4vh" }}
            size="small"
            // type="text"
            icon={<RollbackOutlined />}
            onClick={goBack}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionFooter;
