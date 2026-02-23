export interface ChartDataItem {
  date: string;
  value: any;
}

export interface ChartDataSet {
  data: any[];
  xAxis: string[];
}

export interface ChartData {
  recordsTrend: ChartDataSet;
  bytesTrend: ChartDataSet;
  recordsSpeedTrend: ChartDataSet;
  bytesSpeedTrend: ChartDataSet;
}

export interface SummaryData {
  totalRecords: number;
  totalBytes: number;
  totalTasks: number;
  successTasks: number;
}

export type TimeRange = '24h' | '48h' | 'week';
export type TaskType = 'STREAMING' | 'BATCH';