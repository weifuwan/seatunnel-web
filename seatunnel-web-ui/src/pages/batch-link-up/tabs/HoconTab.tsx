import { Card } from "antd";
import React from "react";
import "../index.less";
import CodeBlockWithCopy from "../workflow/operator/CodeBlockWithCopy";

interface HoconTabProps {
  config: string;
}

const HoconTab: React.FC<HoconTabProps> = ({ config }) => {
  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <pre className="hocon-content">
        <CodeBlockWithCopy content={config} />
      </pre>
    </Card>
  );
};

export default HoconTab;
