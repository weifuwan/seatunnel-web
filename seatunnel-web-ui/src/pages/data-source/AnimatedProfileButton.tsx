import React from "react";
import { Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import "./index.less";

const AnimatedProfileButton: React.FC = () => {
  return (
    <Button className="animated-profile-btn-v2" block type="default">
      <span className="default-layer" style={{fontWeight: 700, fontSize: 16}}>View Profile</span>

      <span className="hover-layer">
        <span className="hover-label"  style={{fontWeight: 700, fontSize: 16}}>View Profile</span>
        <span className="hover-icon">
          <ArrowRightOutlined />
        </span>
      </span>
    </Button>
  );
};

export default AnimatedProfileButton;