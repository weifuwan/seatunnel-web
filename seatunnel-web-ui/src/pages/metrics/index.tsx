import { message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { fetchChartData, fetchSummaryData } from "./api";
import "./index.less";
import { ChartData, SummaryData, TaskType, TimeRange } from "./types";
import { transformChartData } from "./utils";

const App: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    recordsTrend: { data: [], xAxis: [] },
    bytesTrend: { data: [], xAxis: [] },
    recordsSpeedTrend: { data: [], xAxis: [] },
    bytesSpeedTrend: { data: [], xAxis: [] },
  });

  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalRecords: 0,
    totalBytes: 0,
    totalTasks: 0,
    successTasks: 0,
    totalBytesUnit: 0,
    totalRecordsUnit: 0,
  });

  const [taskType, setTaskType] = useState<TaskType>("BATCH");
  const [timeRange, setTimeRange] = useState<TimeRange>("H24");
  const ref = useRef(null);

  useEffect(() => {
    refreshData();
  }, [timeRange, taskType]);

  const refreshData = async () => {
    try {
      setLoading(true);
      await Promise.all([refreshChartData(), refreshSummaryData()]);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSummaryData = async () => {
    try {
      const data = await fetchSummaryData(timeRange, taskType);
      setSummaryData(data);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const refreshChartData = async () => {
    try {
      const apiData = await fetchChartData(timeRange);
      processChartData(apiData);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const processChartData = (apiData: ChartData) => {
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
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {/* <Header
        timeRange={timeRange}
        taskType={taskType}
        onTimeRangeChange={setTimeRange}
        onTaskTypeChange={setTaskType}
      />

      <div style={{ overflowY: 'auto', height: 'calc(100vh - 135px)' }}>
        <SummaryCards summaryData={summaryData} />
        <ChartsContainer chartData={chartData} loading={loading} />
      </div> */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="min-h-screen -m-4 md:-m-6 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8" style={{ opacity: 1, transform: "none" }}>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-chart-column h-7 w-7 text-primary"
                >
                  <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                  <path d="M18 17V9"></path>
                  <path d="M13 17V5"></path>
                  <path d="M8 17v-3"></path>
                </svg>
                Insights
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track your application performance and trends
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50">
                  <div className="p-4 md:p-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-blue-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="lucide lucide-briefcase h-4 w-4 text-blue-500"
                        >
                          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          <rect
                            width="20"
                            height="14"
                            x="2"
                            y="6"
                            rx="2"
                          ></rect>
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total Applications
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50">
                  <div className="p-4 md:p-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-emerald-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="lucide lucide-trending-up h-4 w-4 text-emerald-500"
                        >
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                          <polyline points="16 7 22 7 22 13"></polyline>
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">0%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Success Rate
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50">
                  <div className="p-4 md:p-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-amber-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="lucide lucide-clock h-4 w-4 text-amber-500"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      In Progress
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50">
                  <div className="p-4 md:p-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-violet-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="lucide lucide-target h-4 w-4 text-violet-500"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="6"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Interviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50 h-full">
                  <div className="flex flex-col space-y-1.5 p-4 md:p-6">
                    <h3 className="md:text-2xl font-semibold tracking-tight text-base flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-circle-check h-4 w-4 text-primary"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                      Application Status
                    </h3>
                  </div>
                  <div className="p-4 md:p-6 pt-0">
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No applications yet
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50 h-full">
                  <div className="flex flex-col space-y-1.5 p-4 md:p-6">
                    <h3 className="md:text-2xl font-semibold tracking-tight text-base flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-trending-up h-4 w-4 text-primary"
                      >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                        <polyline points="16 7 22 7 22 13"></polyline>
                      </svg>
                      Weekly Activity
                    </h3>
                  </div>
                  <div className="p-4 md:p-6 pt-0">
                    <div
                      className="recharts-responsive-container"
                      style={{ width: "100", height: 180, minWidth: 0 }}
                    >
                      <div
                        className="recharts-wrapper"
                        style={{
                          position: "relative",
                          cursor: "default",
                          width: "100%",
                          height: "100%",
                          maxHeight: 180,
                          maxWidth: 514,
                        }}
                      >
                        <svg
                          className="recharts-surface"
                          width="514"
                          height="180"
                          viewBox="0 0 514 180"
                          style={{ width: "100%", height: "100%" }}
                        >
                          <title></title>
                          <desc></desc>
                          <defs>
                            <clipPath id="recharts10-clip">
                              <rect
                                x="65"
                                y="5"
                                height="140"
                                width="444"
                              ></rect>
                            </clipPath>
                          </defs>
                          <g className="recharts-cartesian-grid">
                            <g className="recharts-cartesian-grid-horizontal">
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="65"
                                y1="145"
                                x2="509"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="65"
                                y1="110"
                                x2="509"
                                y2="110"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="65"
                                y1="75"
                                x2="509"
                                y2="75"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="65"
                                y1="5"
                                x2="509"
                                y2="5"
                              ></line>
                            </g>
                            <g className="recharts-cartesian-grid-vertical">
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="92.75"
                                y1="5"
                                x2="92.75"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="148.25"
                                y1="5"
                                x2="148.25"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="203.75"
                                y1="5"
                                x2="203.75"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="259.25"
                                y1="5"
                                x2="259.25"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="314.75"
                                y1="5"
                                x2="314.75"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="370.25"
                                y1="5"
                                x2="370.25"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="425.75"
                                y1="5"
                                x2="425.75"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="481.25"
                                y1="5"
                                x2="481.25"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="65"
                                y1="5"
                                x2="65"
                                y2="145"
                              ></line>
                              <line
                                stroke-dasharray="3 3"
                                opacity="0.1"
                                stroke="#ccc"
                                fill="none"
                                x="65"
                                y="5"
                                width="444"
                                height="140"
                                x1="509"
                                y1="5"
                                x2="509"
                                y2="145"
                              ></line>
                            </g>
                          </g>
                          <g className="recharts-layer recharts-cartesian-axis recharts-xAxis xAxis">
                            <g className="recharts-cartesian-axis-ticks">
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="92.75"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="92.75" dy="0.71em">
                                    W1
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="148.25"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="148.25" dy="0.71em">
                                    W2
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="203.75"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="203.75" dy="0.71em">
                                    W3
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="259.25"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="259.25" dy="0.71em">
                                    W4
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="314.75"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="314.75" dy="0.71em">
                                    W5
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="370.25"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="370.25" dy="0.71em">
                                    W6
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="425.75"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="425.75" dy="0.71em">
                                    W7
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="bottom"
                                  width="444"
                                  height="30"
                                  stroke="none"
                                  font-size="11"
                                  x="481.25"
                                  y="153"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="middle"
                                  fill="#666"
                                >
                                  <tspan x="481.25" dy="0.71em">
                                    W8
                                  </tspan>
                                </text>
                              </g>
                            </g>
                          </g>
                          <g className="recharts-layer recharts-cartesian-axis recharts-yAxis yAxis">
                            <g className="recharts-cartesian-axis-ticks">
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="left"
                                  width="60"
                                  height="140"
                                  stroke="none"
                                  font-size="11"
                                  x="57"
                                  y="145"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="end"
                                  fill="#666"
                                >
                                  <tspan x="57" dy="0.355em">
                                    0
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="left"
                                  width="60"
                                  height="140"
                                  stroke="none"
                                  font-size="11"
                                  x="57"
                                  y="110"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="end"
                                  fill="#666"
                                >
                                  <tspan x="57" dy="0.355em">
                                    1
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="left"
                                  width="60"
                                  height="140"
                                  stroke="none"
                                  font-size="11"
                                  x="57"
                                  y="75"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="end"
                                  fill="#666"
                                >
                                  <tspan x="57" dy="0.355em">
                                    2
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="left"
                                  width="60"
                                  height="140"
                                  stroke="none"
                                  font-size="11"
                                  x="57"
                                  y="40"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="end"
                                  fill="#666"
                                >
                                  <tspan x="57" dy="0.355em">
                                    3
                                  </tspan>
                                </text>
                              </g>
                              <g className="recharts-layer recharts-cartesian-axis-tick">
                                <text
                                  orientation="left"
                                  width="60"
                                  height="140"
                                  stroke="none"
                                  font-size="11"
                                  x="57"
                                  y="8.25"
                                  className="recharts-text recharts-cartesian-axis-tick-value"
                                  text-anchor="end"
                                  fill="#666"
                                >
                                  <tspan x="57" dy="0.355em">
                                    4
                                  </tspan>
                                </text>
                              </g>
                            </g>
                          </g>
                          <g className="recharts-layer recharts-bar">
                            <g className="recharts-layer recharts-bar-rectangles">
                              <g className="recharts-layer">
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                                <g className="recharts-layer recharts-bar-rectangle"></g>
                              </g>
                            </g>
                            <g className="recharts-layer"></g>
                          </g>
                        </svg>
                        <div
                          className="recharts-tooltip-wrapper recharts-tooltip-wrapper-right recharts-tooltip-wrapper-top"
                          style={{
                            visibility: "hidden",
                            pointerEvents: "none",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            transform: "translate(324.75px, 66px)",
                          }}
                        >
                          <div
                            className="recharts-default-tooltip"
                            style={{
                              margin: 0,
                              padding: 10,
                              backgroundColor: "red",
                              border: "1px solid red",
                              whiteSpace: "nowrap",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                          >
                            <p
                              className="recharts-tooltip-label"
                              style={{ margin: 0 }}
                            >
                              W5
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50">
                  <div className="flex flex-col space-y-1.5 p-4 md:p-6">
                    <h3 className="md:text-2xl font-semibold tracking-tight text-base flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-sparkles h-4 w-4 text-amber-500"
                      >
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                        <path d="M20 3v4"></path>
                        <path d="M22 5h-4"></path>
                        <path d="M4 17v2"></path>
                        <path d="M5 18H3"></path>
                      </svg>
                      Top Skills (from successful apps)
                    </h3>
                  </div>
                  <div className="p-4 md:p-6 pt-0">
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Apply to more jobs to see skill trends
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ opacity: 1, transform: "none" }}>
                <div className="border bg-card text-card-foreground shadow-sm rounded-3xl border-border/50">
                  <div className="flex flex-col space-y-1.5 p-4 md:p-6">
                    <h3 className="md:text-2xl font-semibold tracking-tight text-base flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-target h-4 w-4 text-violet-500"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                      Quick Summary
                    </h3>
                  </div>
                  <div className="p-4 md:p-6 pt-0 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Approved</span>
                      <span className="font-medium text-emerald-500">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium text-amber-500">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rejected</span>
                      <span className="font-medium text-red-500">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        In Interviews
                      </span>
                      <span className="font-medium text-violet-500">0</span>
                    </div>
                    <div className="border-t border-border/50 pt-3 flex justify-between text-sm">
                      <span className="font-medium">Response Rate</span>
                      <span className="font-bold">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
