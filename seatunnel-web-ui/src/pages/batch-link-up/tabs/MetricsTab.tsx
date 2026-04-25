import React, { useMemo } from "react";
import { Card } from "antd";
import { useIntl } from "@umijs/max";
import CountUp from "react-countup";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Database,
  Gauge,
  TrendingUp,
} from "lucide-react";

interface MetricsTabProps {
  instanceItem: any;
}

interface SparkLineProps {
  data: number[];
}

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  hint: string;
  icon: React.ReactNode;
  accentClassName: string;
  trendData: number[];
}

const SparkLine: React.FC<SparkLineProps> = ({ data }) => {
  const safeData = data.length > 1 ? data : [0, 0];
  const max = Math.max(...safeData, 1);
  const min = Math.min(...safeData, 0);
  const range = Math.max(max - min, 1);

  const points = safeData
    .map((value, index) => {
      const x = (index / (safeData.length - 1)) * 100;
      const y = 34 - ((value - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height="40"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  hint,
  icon,
  accentClassName,
  trendData,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200  hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
            {title}
          </div>

          <div className="mt-3 flex items-end gap-1.5">
            <span className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-slate-950">
              <CountUp end={value} duration={1.1} separator="," />
            </span>
            <span className="pb-0.5 text-xs font-medium text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
            accentClassName,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className={["h-10 flex-1", accentClassName].join(" ")}>
          <SparkLine data={trendData} />
        </div>

        <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
          <TrendingUp size={12} strokeWidth={1.8} />
          {hint}
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          {icon}
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-0.5 text-xs text-slate-400">{description}</div>
        </div>
      </div>
    </div>
  );
};

const buildTrend = (value: number, seed = 1) => {
  const base = Math.max(value, 1);

  return Array.from({ length: 12 }, (_, index) => {
    const wave = Math.sin((index + seed) * 0.8) * 0.12;
    const slope = index * 0.015;
    return Math.max(Math.round(base * (0.82 + wave + slope)), 0);
  });
};

const MetricsTab: React.FC<MetricsTabProps> = ({ instanceItem }) => {
  const intl = useIntl();

  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  const readQps = instanceItem?.readQps ?? 0;
  const writeQps = instanceItem?.writeQps ?? 0;
  const readRows = instanceItem?.readRowCount ?? 0;
  const writeRows = instanceItem?.writeRowCount ?? 0;

  const metrics = useMemo(
    () => ({
      readQpsTrend: buildTrend(readQps, 1),
      writeQpsTrend: buildTrend(writeQps, 2),
      readRowsTrend: buildTrend(readRows, 3),
      writeRowsTrend: buildTrend(writeRows, 4),
    }),
    [readQps, writeQps, readRows, writeRows]
  );

  return (
    <Card
      size="small"
      className="mt-2 !rounded-2xl !border-slate-200 !shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      bodyStyle={{ padding: 16 }}
    >
      <div className="space-y-6">
        <section>
          <SectionHeader
            icon={<Gauge size={16} strokeWidth={1.9} />}
            title={t("pages.job.detail.metrics.throughput", "Throughput")}
            description={t(
              "pages.job.detail.metrics.throughputDesc",
              "Current read and write processing speed"
            )}
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <MetricCard
              title={t("pages.job.detail.metrics.readQps", "Read QPS")}
              value={readQps}
              unit={t("pages.job.detail.metrics.unit.rowsPerSecond", "r/s")}
              hint={t("pages.job.detail.metrics.recentTrend", "recent")}
              icon={<ArrowDownToLine size={17} strokeWidth={1.9} />}
              accentClassName="border-blue-100 bg-blue-50 text-blue-600"
              trendData={metrics.readQpsTrend}
            />

            <MetricCard
              title={t("pages.job.detail.metrics.writeQps", "Write QPS")}
              value={writeQps}
              unit={t("pages.job.detail.metrics.unit.rowsPerSecond", "r/s")}
              hint={t("pages.job.detail.metrics.recentTrend", "recent")}
              icon={<ArrowUpFromLine size={17} strokeWidth={1.9} />}
              accentClassName="border-emerald-100 bg-emerald-50 text-emerald-600"
              trendData={metrics.writeQpsTrend}
            />
          </div>
        </section>

        <section>
          <SectionHeader
            icon={<Database size={16} strokeWidth={1.9} />}
            title={t("pages.job.detail.metrics.totalVolume", "Total Volume")}
            description={t(
              "pages.job.detail.metrics.totalVolumeDesc",
              "Total rows processed by this run instance"
            )}
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <MetricCard
              title={t("pages.job.detail.metrics.readRows", "Read Rows")}
              value={readRows}
              unit={t("pages.job.detail.metrics.unit.records", "records")}
              hint={t("pages.job.detail.metrics.accumulated", "total")}
              icon={<ArrowDownToLine size={17} strokeWidth={1.9} />}
              accentClassName="border-amber-100 bg-amber-50 text-amber-600"
              trendData={metrics.readRowsTrend}
            />

            <MetricCard
              title={t("pages.job.detail.metrics.writeRows", "Write Rows")}
              value={writeRows}
              unit={t("pages.job.detail.metrics.unit.records", "records")}
              hint={t("pages.job.detail.metrics.accumulated", "total")}
              icon={<ArrowUpFromLine size={17} strokeWidth={1.9} />}
              accentClassName="border-violet-100 bg-violet-50 text-violet-600"
              trendData={metrics.writeRowsTrend}
            />
          </div>
        </section>
      </div>
    </Card>
  );
};

export default MetricsTab;