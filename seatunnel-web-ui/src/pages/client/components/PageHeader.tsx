import { CloudServerOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import React from "react";
import { iconWrapStyle } from "../constants";

const { Title, Text } = Typography;

const PageHeader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 4px 0",
      }}
    >
      <div style={iconWrapStyle}>
        <CloudServerOutlined style={{ fontSize: 20 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Title level={4} style={{ margin: 0, color: "#162033" }}>
          SeaTunnel Client
        </Title>
        <Text style={{ color: "#7b8794" }}>看看它今天过得怎么样 🌿</Text>
      </div>
    </div>
  );
};

export default PageHeader;