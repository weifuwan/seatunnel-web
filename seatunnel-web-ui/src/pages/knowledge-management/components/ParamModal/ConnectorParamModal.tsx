import React from "react";
import { SettingOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Select, Switch } from "antd";
import {
  connectorNameOptions,
  connectorTypeOptions,
  TEXT_SECONDARY,
} from "../../constants";
import { FormValues, MenuKey, ParamItem } from "../../types";

const { TextArea } = Input;

interface Props {
  activeMenu: MenuKey;
  open: boolean;
  editingRecord: ParamItem | null;
  submitting: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const ConnectorParamModal: React.FC<Props> = ({
  open,
  editingRecord,
  submitting,
  form,
  onCancel,
  onSubmit,
}) => {
  const isEdit = !!editingRecord;

  return (
    <Modal
      width={920}
      open={open}
      centered
      maskClosable={false}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={submitting}
      destroyOnClose
      okText="保存"
      cancelText="取消"
      styles={{
        header: {
          padding: "20px 24px 16px",
          borderBottom: "1px solid #EEF2F6",
          marginBottom: 0,
        },
        body: {
          padding: "20px 24px 16px",
          background: "#F8FAFC",
          maxHeight: "72vh",
          overflowY: "auto",
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
        <div className="flex min-w-0 items-center gap-3 pr-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[16px] text-[#3B82F6]">
            <SettingOutlined />
          </div>

          <div className="min-w-0">
            <div className="text-[18px] font-semibold leading-7 text-[#101828]">
              {isEdit ? "编辑 Connector 参数" : "新增 Connector 参数"}
            </div>

            <div className="mt-[2px] text-[13px] leading-5 text-[#667085]">
              维护 Connector 参数的名称、说明、类型与默认规则
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div
            className="text-[13px] leading-5"
            style={{ color: TEXT_SECONDARY || "#667085" }}
          >
            建议补充默认值与示例值，方便后续配置复用
          </div>
        </div>
      }
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{ required: false }}
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              基础信息
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              先定义参数归属、名称和用途说明，便于后续统一维护
            </div>

            <Form.Item
              label="Connector"
              name="connectorName"
              rules={[{ required: true, message: "请选择 Connector" }]}
            >
              <Select
                placeholder="请选择 Connector"
                options={connectorNameOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              label="参数名称"
              name="paramName"
              rules={[{ required: true, message: "请输入参数名称" }]}
            >
              <Input placeholder="如 parallelism / query / table" />
            </Form.Item>

            <Form.Item
              label="参数说明"
              name="paramDesc"
              rules={[{ required: true, message: "请输入参数说明" }]}
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={4}
                showCount
                maxLength={300}
                placeholder="请输入参数用途、适用场景或填写说明"
              />
            </Form.Item>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              参数规则
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              配置参数类型、是否必填等核心规则，帮助使用者快速理解输入要求
            </div>

            <div className="flex items-start gap-4">
              <Form.Item
                label="参数类型"
                name="paramType"
                rules={[{ required: true, message: "请选择参数类型" }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select
                  placeholder="请选择参数类型"
                  options={connectorTypeOptions}
                />
              </Form.Item>

              <Form.Item
                label="是否必填"
                name="required"
                valuePropName="checked"
                style={{ width: 180, marginBottom: 0 }}
              >
                <Switch checkedChildren="必填" unCheckedChildren="非必填" />
              </Form.Item>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              默认值与示例
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              可选填写，适合沉淀通用配置，减少重复输入
            </div>

            <div className="flex gap-4">
              <Form.Item
                label="默认值"
                name="defaultValue"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="请输入默认值" />
              </Form.Item>

              <Form.Item
                label="示例值"
                name="exampleValue"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="请输入示例值" />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ConnectorParamModal;