import ZetaIcon from "@/pages/batch-link-up/workflow/sider/icon/ZetaIcon";
import { SmileOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select } from "antd";
import React, { useEffect, useRef } from "react";

const { TextArea } = Input;

export interface SeaTunnelClientFormValues {
  id?: number;
  clientName: string;
  engineType: string;
  clientAddress: string;
  clientPort: string | number;
  remark?: string;
}

interface AddClientModalProps {
  open: boolean;
  form: any;
  confirmLoading?: boolean;
  mode?: "create" | "edit";
  initialValues?: Partial<SeaTunnelClientFormValues>;
  onCancel: () => void;
  onSubmit: () => void;
}

const engineOptions = [
  {
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <ZetaIcon height="20" width="20" /> &nbsp;
        ZETA
      </div>
    ),
    value: "ZETA",
  },
];

const remarkPresets = [
  "这位客户端已准备就绪，随时可以开始干活 ✨",
  "连接信息已备好，接下来就看它的表现了。",
  "今天也请多多关照啦，这位客户端已经就位 🚀",
  "先把位置占好，等你来安排任务 👀",
  "已完成基础连接配置，可用于后续任务绑定与调度。",
  "小伙伴已上线，等你给它派任务。",
  "这台客户端状态不错，随时待命中。",
  "先连上，再一起看看它能跑多稳。",
  "新的客户端已经入场，准备开始表演。",
  "这里先打个卡，后面的任务慢慢来。",
  "连接成功只是开始，真正的表现还在后面。",
  "它已经站好位置了，就等你一声令下。",
  "新的连接位已解锁，可以继续往下配置啦。",
  "客户端已就绪，今天也要稳定发挥呀。",
  "先把基础信息安顿好，后面就顺很多了。",
  "欢迎加入调度小分队，准备开始干活吧。",
  "这个客户端已经安排上了，接下来继续。",
  "已完成入场准备，随时接受任务分配。",
  "先把门票给它，后面才能正式上场。",
  "新的客户端已接入，期待它接下来的表现 🌟",
];

const clientNamePresets = [
  "九阴真经",
  "九阳神功",
  "太玄经",
  "易筋经",
  "神照经",
  "北冥神功",
  "小无相功",
  "凌波微步",
  "斗转星移",
  "乾坤大挪移",
  "降龙十八掌",
  "独孤九剑",
  "六脉神剑",
  "黯然销魂掌",
  "玉女心经",
  "左右互搏术",
  "蛤蟆功",
  "弹指神通",
  "空明拳",
  "龙象般若功",
];

const getRandomItem = (list: string[], lastValue?: string) => {
  if (!list.length) return "";
  if (list.length === 1) return list[0];

  let next = list[Math.floor(Math.random() * list.length)];
  while (next === lastValue) {
    next = list[Math.floor(Math.random() * list.length)];
  }
  return next;
};

const getRandomRemark = (lastValue?: string) => {
  return getRandomItem(remarkPresets, lastValue);
};

const getRandomClientName = (lastValue?: string) => {
  const preset = getRandomItem(clientNamePresets, lastValue);
  return `ZETA-${preset}`;
};

const AddClientModal: React.FC<AddClientModalProps> = ({
  open,
  form,
  confirmLoading = false,
  mode = "create",
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const lastRemarkRef = useRef<string>();
  const lastClientNameRef = useRef<string>();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      form.setFieldsValue({
        id: initialValues?.id,
        clientName: initialValues?.clientName,
        engineType: initialValues?.engineType || "ZETA",
        clientAddress: initialValues?.clientAddress,
        clientPort: initialValues?.clientPort || 8080,
        remark: initialValues?.remark,
      });
      return;
    }

    const nextRemark = getRandomRemark(lastRemarkRef.current);
    const nextClientName = getRandomClientName(
      lastClientNameRef.current?.replace(/^ZETA-/, "")
    );

    lastRemarkRef.current = nextRemark;
    lastClientNameRef.current = nextClientName;

    form.setFieldsValue({
      engineType: "ZETA",
      clientPort: 8080,
      remark: nextRemark,
      clientName: nextClientName,
    });
  }, [open, isEdit, initialValues, form]);

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
        <div className="flex items-center justify-between gap-3 pr-6">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEF4FF]">
                <SmileOutlined style={{ color: "#3B82F6", fontSize: 18 }} />
              </div>

              <div className="min-w-0">
                <div className="text-[18px] font-semibold leading-7 text-[#101828]">
                  {isEdit ? "编辑 Client" : "新增 Client"}
                </div>

                <div className="mt-0.5 text-[13px] leading-5 text-[#667085]">
                  {isEdit
                    ? "调整 Client 的基础连接信息，保存后会用于后续任务绑定与调度。"
                    : "录入 Client 的基础连接信息，用于后续任务绑定与调度。"}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#98A2B3]" />

          <div className="flex gap-2.5">
            <Button onClick={onCancel} style={{ height: 34, borderRadius: 16 }}>
              取消
            </Button>

            <Button
              type="primary"
              loading={confirmLoading}
              onClick={onSubmit}
              style={{ height: 34, borderRadius: 16, paddingInline: 18 }}
            >
              {isEdit ? "保存修改" : "创建 Client"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="rounded-2xl border border-[#EAF0F6] bg-white p-5">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            engineType: "ZETA",
            clientPort: 8080,
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="clientName"
            label="客户端名称"
            rules={[{ required: true, message: "请输入 Client Name" }]}
          >
            <Input
              placeholder="例如：ZETA-独孤九剑"
              style={{ height: 32, borderRadius: 16 }}
            />
          </Form.Item>

          <Form.Item
            name="engineType"
            label="引擎类型"
            rules={[{ required: true, message: "请选择 Engine Type" }]}
          >
            <Select
              placeholder="请选择引擎类型"
              options={engineOptions}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <div className="grid grid-cols-[1fr_160px] gap-4">
            <Form.Item
              name="clientAddress"
              label="客户端地址"
              rules={[{ required: true, message: "请输入 Client Address" }]}
            >
              <Input
                placeholder="例如：192.168.1.10"
                style={{ height: 32, borderRadius: 16 }}
              />
            </Form.Item>

            <Form.Item
              name="clientPort"
              label="客户端端口"
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
                style={{ height: 32, borderRadius: 16 }}
              />
            </Form.Item>
          </div>

          <Form.Item name="remark" label="备注">
            <TextArea
              placeholder="补充说明这个 Client 的用途、环境或备注信息"
              autoSize={{ minRows: 4, maxRows: 5 }}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddClientModal;