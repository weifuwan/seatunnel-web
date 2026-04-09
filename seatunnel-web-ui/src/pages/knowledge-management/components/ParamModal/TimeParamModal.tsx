import React from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Select } from "antd";
import { TEXT_SECONDARY, timeFormatOptions } from "../../constants";
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

const TimeParamModal: React.FC<Props> = ({
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
            <ClockCircleOutlined />
          </div>

          <div className="min-w-0">
            <div className="text-[18px] font-semibold leading-7 text-[#101828]">
              {isEdit ? "编辑时间变量" : "新增时间变量"}
            </div>

            <div className="mt-[2px] text-[13px] leading-5 text-[#667085]">
              维护时间变量的格式、默认值与动态表达式
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
            建议同时填写默认值与示例，便于理解变量行为
          </div>
        </div>
      }
    >
      <Form<FormValues> form={form} layout="vertical">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              基础信息
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              先定义时间变量名称与用途，保证含义清晰、易于复用
            </div>

            <Form.Item
              label="参数名称"
              name="paramName"
              rules={[{ required: true, message: "请输入参数名称" }]}
            >
              <Input placeholder="如 start_time / end_time / biz_date" />
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
                placeholder="请输入时间变量的用途说明"
              />
            </Form.Item>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              格式与取值
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              先确定输出格式，再补充默认值和示例，便于时间变量统一使用
            </div>

            <Form.Item
              label="时间格式"
              name="timeFormat"
              rules={[{ required: true, message: "请选择时间格式" }]}
            >
              <Select
                placeholder="请选择时间格式"
                options={timeFormatOptions}
              />
            </Form.Item>

            <div className="flex gap-4">
              <Form.Item
                label="默认值"
                name="defaultValue"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="如 ${now} / ${today} / ${now-1d}" />
              </Form.Item>

              <Form.Item
                label="示例值"
                name="exampleValue"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="如 2026-03-10 00:00:00" />
              </Form.Item>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EEF2F6] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="m-0 text-[15px] font-semibold leading-6 text-[#101828]">
              表达式说明
            </h3>
            <div className="mb-4 mt-1 text-[13px] leading-5 text-[#667085]">
              用自然语言补充这个变量的动态规则，方便阅读和维护
            </div>

            <Form.Item
              label="动态表达式说明"
              name="expression"
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="如 当前时间减 1 天 / 当天日期 / 当前小时整点" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default TimeParamModal;