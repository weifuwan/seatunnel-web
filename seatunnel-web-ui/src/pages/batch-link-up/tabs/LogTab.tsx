import {
  AppstoreOutlined,
  BarsOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Card, Segmented } from "antd";
import React from "react";
import "../index.less";

interface LogTabProps {
  content: string;
  loading: boolean;
}

const LogTab: React.FC<LogTabProps> = ({ content, loading }) => {
  return (
    <Card
      size="small"
      style={{ marginTop: 8, borderRadius: 4 }}
      loading={loading}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }}
      >
        <div>
          <Segmented
            options={[
              {
                value: "List",
                icon: <BarsOutlined />,
                label: "SeaTunnel Web Log",
              },
              {
                value: "Kanban",
                icon: <AppstoreOutlined />,
                label: "SeaTunnel Log",
              },
            ]}
          />
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            backgroundColor: "rgba(0,0,0,0.07)",
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DownloadOutlined />
        </div>
      </div>

      <pre className="log-content">{content}</pre>
    </Card>
  );
};

export default LogTab;
