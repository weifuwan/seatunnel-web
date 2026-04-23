import React from "react";
import { LinkOutlined } from "@ant-design/icons";
import { BLUE, BLUE_LIGHT, BORDER_COLOR } from "../constants";
import { getHealthMeta } from "../utils";

interface Props {
  clients: any[];
  selectedClientId?: number;
  onSelect: (id: number) => void;
}

const ClientListPanel: React.FC<Props> = ({
  clients,
  selectedClientId,
  onSelect,
}) => {
  return (
    <div
      style={{
        borderRight: `1px solid ${BORDER_COLOR}`,
        background: "#FCFCFD",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div className="mb-3 text-[13px] font-semibold text-[#344054]">
        Client 列表
      </div>

      <div className="flex flex-col gap-3">
        {(clients || []).map((client) => {
          const active = client.id === selectedClientId;
          const itemHealth = getHealthMeta(client.healthStatus);

          return (
            <div
              key={client.id}
              onClick={() => onSelect(client.id)}
              style={{
                borderRadius: 16,
                padding: "14px 14px",
                cursor: "pointer",
                border: active ? "1px solid #C7D7FE" : "1px solid #EAECF0",
                background: active ? BLUE_LIGHT : "#fff",
                transition: "all 0.2s ease",
              }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active ? "#DFE6FF" : "#F2F4F7",
                    color: active ? BLUE : "#667085",
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  <LinkOutlined />
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-[14px] font-semibold"
                    style={{ color: active ? BLUE : "#101828" }}
                  >
                    {client.clientName || "--"}
                  </div>

                </div>
              </div>

              <div
                className="flex items-center gap-2 pl-[42px] text-[12px] leading-7"
                style={{ color: active ? "#5B6B8A" : "#98A2B3" }}
              >
                <span className={`inline-block h-2 w-2 rounded-full ${itemHealth.dot}`} />
                {/* <span>{itemHealth.label}</span> */}
                {client?.remark ? (
                  <span className="truncate">{client.remark}</span>
                ) : null}
              </div>
            </div>
          );
        })}

        {!clients?.length ? (
          <div className="rounded-2xl border border-dashed border-[#D8DEE6] bg-[#FBFCFE] px-4 py-5 text-[13px] leading-6 text-[#6B7280]">
            还没有 Client，先新增一个地址吧。
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClientListPanel;