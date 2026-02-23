import React from "react";
import { Card } from "antd";
import "../index.less"

interface HoconTabProps {
  config: string;
}

const HoconTab: React.FC<HoconTabProps> = ({ config }) => {
  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <pre className="hocon-content">{config}</pre>
    </Card>
  );
};

export default HoconTab;