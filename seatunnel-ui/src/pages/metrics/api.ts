import HttpUtils from '@/utils/HttpUtils';
import { ChartData, SummaryData, TimeRange, TaskType } from './types';

export const fetchSummaryData = async (timeRange: TimeRange, taskType: TaskType) => {
  const taskTypeParam = taskType === 'BATCH' ? null : taskType;
  const response = await HttpUtils.get(
    `/api/v1/job/metrics/summary?timeRange=${timeRange}&taskType=${taskTypeParam}`
  );
  
  if (response?.code === 0) {
    return response.data;
  } else {
    throw new Error(response?.message || '获取汇总数据失败');
  }
};

export const fetchChartData = async (timeRange: TimeRange) => {
  const response = await HttpUtils.get(`/api/v1/job/metrics/charts?timeRange=${timeRange}`);
  
  if (response?.code === 0) {
    return response.data;
  } else {
    throw new Error(response?.message || '获取图表数据失败');
  }
};