import React from "react";
import { Button } from "antd";
import { CloudServerOutlined, PlusOutlined } from "@ant-design/icons";
import { BLUE, TEXT_SECONDARY } from "../constants";

interface Props {
  onAdd: () => void;
}

const ClientPageHeader: React.FC<Props> = ({ onAdd }) => {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[20px]"
          style={{ background: "#EEF4FF", color: BLUE }}
        >
          <CloudServerOutlined />
        </div>

        <div>
          <div className="text-[20px] font-bold leading-8 text-[#101828]">
            Client 管理
          </div>
          <div
            className="mt-1 text-[14px] leading-7"
            style={{ color: TEXT_SECONDARY }}
          >
            统一管理 SeaTunnel / Zeta Client，查看节点健康状态与核心资源指标，
            让任务提交与运行监控更清晰。
          </div>
        </div>
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        size="large"
        onClick={onAdd}
        className="h-10 rounded-full px-5 shadow-[0_6px_16px_rgba(63,92,214,0.18)]"
        style={{ background: "hsl(231 48% 48%)", borderColor: BLUE }}
      >
        新建 Client
      </Button>
    </div>
  );
};

export default ClientPageHeader;