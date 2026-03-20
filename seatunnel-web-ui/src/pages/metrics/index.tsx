import { message, Select, Segmented, Spin } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fetchChartData, fetchSummaryData } from "./api";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import "./index.less";
import { ChartData, SummaryData, TaskType, TimeRange } from "./types";
import { transformChartData } from "./utils";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const sectionStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const cardStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const App: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    recordsTrend: { data: [], xAxis: [] },
    bytesTrend: { data: [], xAxis: [] },
    recordsSpeedTrend: { data: [], xAxis: [] },
    bytesSpeedTrend: { data: [], xAxis: [] },
  });

  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalRecords: 0,
    totalBytes: 0,
    totalTasks: 0,
    successTasks: 0,
    totalBytesUnit: "-",
    totalRecordsUnit: "-",
  });

  const [taskType, setTaskType] = useState<TaskType>("BATCH");
  const [timeRange, setTimeRange] = useState<TimeRange>("H24");

  const refreshSummaryData = useCallback(async () => {
    const data = await fetchSummaryData(timeRange, taskType);
    setSummaryData(data);
  }, [timeRange, taskType]);

  const refreshChartData = useCallback(async () => {
    const apiData = await fetchChartData(timeRange, taskType);
    const processedData: ChartData = {
      recordsTrend: transformChartData(apiData.recordsTrend as any, timeRange),
      bytesTrend: transformChartData(apiData.bytesTrend as any, timeRange),
      recordsSpeedTrend: transformChartData(
        apiData.recordsSpeedTrend as any,
        timeRange
      ),
      bytesSpeedTrend: transformChartData(
        apiData.bytesSpeedTrend as any,
        timeRange
      ),
    };
    setChartData(processedData);
  }, [timeRange, taskType]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setPageReady(false);
      await Promise.all([refreshSummaryData(), refreshChartData()]);
      setPageReady(true);
    } catch (error: any) {
      message.error(error?.message || "Load data failed");
    } finally {
      setLoading(false);
    }
  }, [refreshSummaryData, refreshChartData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const successRate = useMemo(() => {
    if (!summaryData.totalTasks) return 0;
    return Math.round((summaryData.successTasks / summaryData.totalTasks) * 100);
  }, [summaryData.totalTasks, summaryData.successTasks]);

  const statCards = [
    {
      title: "Total Syncs",
      value: summaryData.totalRecords || 0,
      subText: `Unit: ${summaryData.totalRecordsUnit || "-"}`,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      ),
    },
    {
      title: "Total Sync Volume",
      value: summaryData.totalBytes || 0,
      subText: `Unit: ${summaryData.totalBytesUnit || "-"}`,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      ),
    },
    {
      title: "Total Executions",
      value: summaryData.totalTasks || 0,
      subText: "Unit: times",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      subText: `${summaryData.successTasks || 0} successful tasks`,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  const summaryList = [
    {
      title: "Overview",
      content: `A total of ${summaryData.totalTasks || 0} tasks were executed in the selected time range.`,
    },
    {
      title: "Volume",
      content: `Processed ${summaryData.totalBytes || 0} ${summaryData.totalBytesUnit || "-"} of data.`,
    },
    {
      title: "Reliability",
      content: `Current success rate is ${successRate}% with ${summaryData.successTasks || 0} successful tasks.`,
    },
  ];

  return (
    <div
      style={{
        height: "calc(100vh - 56px)",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      <main className="h-full overflow-auto p-4 md:p-6">
        <div className="min-h-full rounded-3xl bg-slate-50/60 p-6 md:p-8">
          <div className="mx-auto max-w-[1600px]">
            <motion.div
              initial="hidden"
              animate={pageReady ? "visible" : "hidden"}
              variants={sectionStagger}
            >
              <motion.div
                variants={fadeUp}
                className="mb-8 flex gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7"
                      style={{ color: "hsl(231 48% 48%)" }}
                    >
                      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                      <path d="M18 17V9" />
                      <path d="M13 17V5" />
                      <path d="M8 17v-3" />
                    </svg>
                    任务洞察
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Track sync performance and execution trends
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Segmented
                    value={taskType}
                    onChange={(value) => setTaskType(value as TaskType)}
                    options={[
                      { label: "Batch", value: "BATCH" },
                      { label: "Streaming", value: "STREAMING" },
                    ]}
                  />
                  <Select
                    value={timeRange}
                    onChange={(value) => setTimeRange(value)}
                    style={{ width: 140 }}
                    options={[
                      { label: "Last 1 hour", value: "H1" },
                      { label: "Last 6 hours", value: "H6" },
                      { label: "Last 12 hours", value: "H12" },
                      { label: "Last 24 hours", value: "H24" },
                      { label: "Last 7 days", value: "D7" },
                      { label: "Last 30 days", value: "D30" },
                    ]}
                  />
                </div>
              </motion.div>

              <Spin spinning={loading}>
                <motion.section variants={fadeUp} className="mb-8">
                  <motion.div
                    variants={cardStagger}
                    initial="hidden"
                    animate={pageReady ? "visible" : "hidden"}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                  >
                    {statCards.map((item) => (
                      <motion.div
                        key={item.title}
                        variants={fadeUp}
                        whileHover={{ y: -4, transition: { duration: 0.18 } }}
                        className="rounded-3xl border border-border/50 bg-white shadow-sm"
                      >
                        <div className="p-4 pt-6 md:p-6 md:pt-6">
                          <div className="mb-3 flex items-center justify-between">
                            <div className={`rounded-xl p-2 ${item.iconBg}`}>
                              <div className={item.iconColor}>{item.icon}</div>
                            </div>
                          </div>
                          <p className="text-2xl font-bold">{item.value}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {item.subText}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Sync Overview
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <motion.div variants={fadeUp}>
                      <ChartCard title="Number of Syncs">
                        <BarChart
                          data={chartData.recordsTrend.data}
                          xAxisData={chartData.recordsTrend.xAxis}
                          title="Number of Syncs"
                          unit={String(summaryData.totalRecordsUnit || "")}
                          loading={loading}
                        />
                      </ChartCard>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <ChartCard title="Number of Sync Bytes">
                        <BarChart
                          data={chartData.bytesTrend.data}
                          xAxisData={chartData.bytesTrend.xAxis}
                          title="Number of Sync Bytes"
                          unit={String(summaryData.totalBytesUnit || "")}
                          loading={loading}
                        />
                      </ChartCard>
                    </motion.div>
                  </div>
                </motion.section>

                <motion.section variants={fadeUp} className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Performance Trend
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <motion.div variants={fadeUp}>
                      <ChartCard title="Sync Rate (Number of Syncs)">
                        <LineChart
                          data={chartData.recordsSpeedTrend.data}
                          xAxisData={chartData.recordsSpeedTrend.xAxis}
                          title="Sync Rate (Number of Syncs)"
                          unit="records/s"
                          loading={loading}
                        />
                      </ChartCard>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <ChartCard title="Sync Rate (Bytes)">
                        <LineChart
                          data={chartData.bytesSpeedTrend.data}
                          xAxisData={chartData.bytesSpeedTrend.xAxis}
                          title="Sync Rate (Bytes)"
                          unit="MB/s"
                          loading={loading}
                        />
                      </ChartCard>
                    </motion.div>
                  </div>
                </motion.section>

                <motion.section variants={fadeUp}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Summary
                    </h2>
                  </div>

                  <motion.div
                    variants={cardStagger}
                    initial="hidden"
                    animate={pageReady ? "visible" : "hidden"}
                    className="grid grid-cols-1 gap-6 xl:grid-cols-3"
                  >
                    {summaryList.map((item) => (
                      <motion.div
                        key={item.title}
                        variants={fadeUp}
                        className="rounded-3xl border border-border/50 bg-white shadow-sm"
                      >
                        <div className="p-6">
                          <h3 className="text-base font-semibold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-500">
                            {item.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              </Spin>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="rounded-3xl border border-border/50 bg-white shadow-sm"
    >
      <div className="flex flex-col space-y-1.5 p-4 md:p-6">
        <h3 className="text-base font-semibold tracking-tight md:text-xl">
          {title}
        </h3>
      </div>
      <div className="p-4 pt-0 md:p-6 md:pt-0">{children}</div>
    </motion.div>
  );
};

export default App;