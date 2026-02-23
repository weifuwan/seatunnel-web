import { ChartDataItem, TimeRange } from './types';


export const transformChartData = (trendData: ChartDataItem[], timeRange: TimeRange) => {
  return {
    data: trendData.map((item) => item.value),
    xAxis: trendData.map((item) => item.date),
  };
};

export const timeRangeMap = {
  '最近一周': 'week' as TimeRange,
  '最近48小时': '48h' as TimeRange,
  '最近24小时': '24h' as TimeRange,
};

export const taskTypeOptions = [
  {
    label: '单表同步',
    value: 'SINGLE_TABLE',
  },
];