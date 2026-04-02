import React from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import { SmileOutlined } from "@ant-design/icons";


const { TextArea } = Input;

export interface SeaTunnelClientFormValues {
  clientName: string;
  engineType: string;
  clientAddress: string;
  clientPort: string;
  remark?: string;
}

interface AddClientModalProps {
  open: boolean;
  form: any;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const engineOptions = [
  { label: "Zeta", value: "ZETA" },
  { label: "SeaTunnel Engine", value: "SEATUNNEL" },
];

const AddClientModal: React.FC<AddClientModalProps> = ({
  open,
  form,
  confirmLoading = false,
  onCancel,
  onSubmit,
}) => {
  const selectedEngineType = Form.useWatch("engineType", form);

  return (
    <Modal
      width={760}
      open={open}
      centered
      maskClosable={false}
      onCancel={onCancel}
      destroyOnClose
      styles={{
        header: {
          padding: "20px 24px 16px",
          borderBottom: "1px solid #EEF2F6",
          marginBottom: 0,
        },
        body: {
          padding: "20px 24px 16px",
          background: "#F8FAFC",
        },
        footer: {
          padding: "14px 24px 18px",
          borderTop: "1px solid #EEF2F6",
          background: "#FFFFFF",
          marginTop: 0,
        },
        content: {
          borderRadius: 20,
          overflow: "hidden",
        },
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingRight: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#EEF4FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <SmileOutlined style={{ color: "#3B82F6", fontSize: 18 }} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#101828",
                    lineHeight: "28px",
                  }}
                >
                  新增 Client
                </div>

                <div
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    color: "#667085",
                    lineHeight: "20px",
                  }}
                >
                  录入 Client 的基础连接信息，用于后续任务绑定与调度。
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#98A2B3",
            }}
          >
            创建后可用于任务配置中的 Client 选择
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button
              onClick={onCancel}
              style={{ height: 38, borderRadius: 10 }}
            >
              取消
            </Button>

            <Button
              type="primary"
              loading={confirmLoading}
              onClick={onSubmit}
              style={{ height: 38, borderRadius: 10, paddingInline: 18 }}
            >
              创建 Client
            </Button>
          </div>
        </div>
      }
    >
      <div
        style={{
          border: "1px solid #EAF0F6",
          borderRadius: 16,
          background: "#FFFFFF",
          padding: 20,
        }}
      >
        <div
          style={{
            marginBottom: 16,
            padding: "10px 12px",
            borderRadius: 12,
            background: "#F8FAFC",
            border: "1px solid #EEF2F6",
            fontSize: 13,
            color: "#667085",
            lineHeight: "22px",
          }}
        >
          这里只保留最必要的信息，不堆叠复杂配置。后续如需扩展能力，可以在详情页继续补充。
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="clientName"
            label="Client Name"
            rules={[{ required: true, message: "请输入 Client Name" }]}
          >
            <Input
              placeholder="例如：Prod Cluster A"
              style={{ height: 32, borderRadius: 16 }}
            />
          </Form.Item>

          <Form.Item
            name="engineType"
            label="Engine Type"
            rules={[{ required: true, message: "请选择 Engine Type" }]}
          >
            <Select
              placeholder="请选择引擎类型"
              options={engineOptions}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px",
              gap: 16,
            }}
          >
            <Form.Item
              name="clientAddress"
              label="Client Address"
              rules={[{ required: true, message: "请输入 Client Address" }]}
            >
              <Input
                placeholder="例如：192.168.1.10"
                style={{ height: 40, borderRadius: 10 }}
              />
            </Form.Item>

            <Form.Item
              name="clientPort"
              label="Client Port"
              rules={[
                { required: true, message: "请输入 Client Port" },
                {
                  pattern: /^\d+$/,
                  message: "端口必须为数字",
                },
              ]}
            >
              <Input
                placeholder="例如：8080"
                style={{ height: 40, borderRadius: 10 }}
              />
            </Form.Item>
          </div>

          <Form.Item name="remark" label="Remark">
            <TextArea
              placeholder="补充说明这个 Client 的用途、环境或备注信息"
              autoSize={{ minRows: 4, maxRows: 5 }}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddClientModal;