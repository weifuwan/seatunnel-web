import React, { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import Header from './Header';
import SummaryCards from './SummaryCards';
import ChartsContainer from './ChartsContainer';
import { fetchSummaryData, fetchChartData } from './api';
import { transformChartData } from './utils';
import { ChartData, SummaryData, TimeRange, TaskType } from './types';
import './index.less';

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
  });
  
  const [taskType, setTaskType] = useState<TaskType>('BATCH');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
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
      recordsSpeedTrend: transformChartData(apiData.recordsSpeedTrend as any, timeRange),
      bytesSpeedTrend: transformChartData(apiData.bytesSpeedTrend as any, timeRange),
    };
    setChartData(processedData);
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <Header
        timeRange={timeRange}
        taskType={taskType}
        onTimeRangeChange={setTimeRange}
        onTaskTypeChange={setTaskType}
      />

      <div style={{ overflowY: 'auto', height: 'calc(100vh - 135px)' }}>
        <SummaryCards summaryData={summaryData} />
        <ChartsContainer chartData={chartData} loading={loading} />
      </div>
    </div>
  );
};

export default App;