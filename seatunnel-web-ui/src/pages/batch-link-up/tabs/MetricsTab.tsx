import React from "react";
import { Card, Row, Col, Typography } from "antd";
import { useIntl } from "@umijs/max";
import CountUp from "react-countup";
import "../index.less";

const { Title, Text } = Typography;

interface MetricsTabProps {
  instanceItem: any;
}

// 简易 sparkline 组件
const SparkLine: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data, 1);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - (d / max) * 30;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
};

const MetricBlock: React.FC<{
  title: string;
  value: number;
  unit: string;
  color: string;
}> = ({ title, value, unit, color }) => {
  // mock trend 数据（你以后可以替换成真实历史数据）
  const trend = Array.from({ length: 10 }, () => value * (0.8 + Math.random() * 0.4));

  return (
    <div className="metric-block" style={{ borderLeft: `4px solid ${color}` }}>
      <Text className="metric-title">{title}</Text>

      <div className="metric-value" style={{ color }}>
        <CountUp end={value} duration={1.2} separator="," />
        <span className="metric-unit"> {unit}</span>
      </div>

      <div className="metric-trend" style={{ color }}>
        <SparkLine data={trend} />
      </div>
    </div>
  );
};

const MetricsTab: React.FC<MetricsTabProps> = ({ instanceItem }) => {
  const intl = useIntl();

  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      {/* ===== QPS 区域 ===== */}
      <Title level={5} style={{ marginBottom: 12 }}>
        🚀 {t("pages.job.detail.metrics.throughput", "Throughput (QPS)")}
      </Title>

      <Row gutter={16}>
        <Col span={12}>
          <MetricBlock
            title={t("pages.job.detail.metrics.readQps", "Read QPS")}
            value={instanceItem.readQps ?? 0}
            unit={t("pages.job.detail.metrics.unit.rowsPerSecond", "r/s")}
            color="#1677ff"
          />
        </Col>

        <Col span={12}>
          <MetricBlock
            title={t("pages.job.detail.metrics.writeQps", "Write QPS")}
            value={instanceItem.writeQps ?? 0}
            unit={t("pages.job.detail.metrics.unit.rowsPerSecond", "r/s")}
            color="#52c41a"
          />
        </Col>
      </Row>

      {/* ===== Total Rows 区域 ===== */}
      <Title level={5} style={{ margin: "24px 0 12px 0" }}>
        📦 {t("pages.job.detail.metrics.totalVolume", "Total Volume")}
      </Title>

      <Row gutter={16}>
        <Col span={12}>
          <MetricBlock
            title={t("pages.job.detail.metrics.readRows", "Read Rows")}
            value={instanceItem.readRowCount ?? 0}
            unit={t("pages.job.detail.metrics.unit.records", "records")}
            color="#fa8c16"
          />
        </Col>

        <Col span={12}>
          <MetricBlock
            title={t("pages.job.detail.metrics.writeRows", "Write Rows")}
            value={instanceItem.writeRowCount ?? 0}
            unit={t("pages.job.detail.metrics.unit.records", "records")}
            color="#722ed1"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default MetricsTab;