import { ApiOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import { ClientMonitoring } from "../types";
import { getHealthInfo } from "../utils";

type Props = {
  clients: ClientMonitoring[];
  selectedClientId: string;
  onChange: (id: string) => void;
};

const ClientTabs: React.FC<Props> = ({
  clients,
  selectedClientId,
  onChange,
}) => {
  return (
    <div
      style={{
        background: "hsl(210 40% 96.1%)",
        borderRadius: 28,
        padding: 4,
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflowX: "auto",
        flexShrink: 0,
      }}
    >
      {clients.map((client) => {
        const itemHealth = getHealthInfo(client);
        const active = selectedClientId === client.id;

        return (
          <button
            key={client.id}
            onClick={() => onChange(client.id)}
            style={{
              border: "none",
              background: active ? "#fff" : "transparent",
              color: active ? "#233078" : "#556070",
              borderRadius: 24,
              padding: "4px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: active ? "0 6px 18px rgba(31,35,41,0.08)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  itemHealth.level === "healthy"
                    ? "#52c41a"
                    : itemHealth.level === "warning"
                    ? "#faad14"
                    : "#ff4d4f",
                boxShadow: "0 0 0 4px rgba(255,255,255,0.65)",
              }}
            />
            <ApiOutlined />
            <span style={{ fontWeight: 600 }}>{client.name}</span>
          </button>
        );
      })}

      <Button
        type="text"
        icon={<PlusOutlined />}
        style={{
          borderRadius: 22,
          color: "#6b7280",
          height: 30,
          paddingInline: 16,
          marginLeft: 4,
        }}
      >
        新增 Client
      </Button>
    </div>
  );
};

export default ClientTabs;