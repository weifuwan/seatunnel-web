import { HealthStateEnum } from "./components/HealthState";


export const bootstrapServersErrCodes = [10, 11, 12];
export const zkErrCodes = [20, 21];
export const jmxErrCodes = [30, 31];

export const statusFilters = [
  {
    label: 'Live',
    value: 1,
  },
  {
    label: 'Down',
    value: 2,
  },
];

export const sortFieldList = [
  {
    label: '接入时间',
    value: 'createTime',
  },
  {
    label: '健康状态',
    value: 'HealthState',
  },
  {
    label: 'Messages',
    value: 'LeaderMessages',
  },
  {
    label: 'MessageSize',
    value: 'TotalLogSize',
  },
  {
    label: 'BytesIn',
    value: 'BytesIn',
  },
  {
    label: 'BytesOut',
    value: 'BytesOut',
  },
  {
    label: 'Brokers',
    value: 'Brokers',
  },
];

export const sortTypes = [
  {
    label: '升序',
    value: 'asc',
  },
  {
    label: '降序',
    value: 'desc',
  },
];

export const linesMetric = ['cpuUsage', 'memoryUsage'];
export const pointsMetric = ['HealthScore', 'HealthCheckPassed', 'HealthCheckTotal', 'Brokers', 'Zookeepers', ...linesMetric].concat(
  process.env.BUSINESS_VERSION
    ? ['LoadReBalanceCpu', 'LoadReBalanceDisk', 'LoadReBalanceEnable', 'LoadReBalanceNwIn', 'LoadReBalanceNwOut']
    : []
);

export const metricNameMap = {
  LeaderMessages: 'Messages',
  TotalLogSize: 'LogSize',
} as {
  [key: string]: string;
};

export const sliderValueMap = {
  1: {
    code: HealthStateEnum.GOOD,
    key: 'goodCount',
    name: '好',
  },
  2: {
    code: HealthStateEnum.MEDIUM,
    key: 'mediumCount',
    name: '中',
  },
  3: {
    code: HealthStateEnum.POOR,
    key: 'poorCount',
    name: '差',
  },
  4: {
    code: HealthStateEnum.DOWN,
    key: 'deadCount',
    name: 'Down',
  },
  5: {
    code: HealthStateEnum.UNKNOWN,
    key: 'unknownCount',
    name: 'Unknown',
  },
};

export const healthSorceList = {
  0: '',
  1: '好',
  2: '中',
  3: '差',
  4: 'Down',
  5: 'Unknown',
};

export interface IMetricPoint {
  aggType: string;
  createTime: number;
  metricName: string;
  timeStamp: number;
  unit: string;
  updateTime: number;
  value: number;
  metricLines?: {
    name: string;
    data: [number | string, number | string];
  };
}

