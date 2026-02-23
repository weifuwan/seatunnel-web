import React from "react";
import { Card } from "antd";
import "../index.less"

interface LogTabProps {
  content: string;
  loading: boolean;
}

const LogTab: React.FC<LogTabProps> = ({ content, loading }) => {
  return (
    <Card size="small" style={{ marginTop: 8, borderRadius: 4 }} loading={loading}>
      <pre className="log-content">{content}</pre>
    </Card>
  );
};

export default LogTab;