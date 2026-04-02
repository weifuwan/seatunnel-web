import HttpUtils from "@/utils/HttpUtils";

export const apiPrefix = "/api/v1/devops/client";

export interface SeatunnelClient {
  id?: number;
  clientName: string;
  engineType: "FLINK" | "SPARK" | "ZETA";
  baseUrl: string;
  healthStatus?: number;
  healthStatusName?: string;
  clientVersion?: string;
  heartbeatTime?: string;
  version?: string;
  containerId?: string;
  clientAddress?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface SeatunnelClientMetrics {
  cpuUsage?: number;
  memoryUsage?: number;
  threadCount?: number;
  runningOps?: number;
}

export interface SeatunnelClientPageRequest {
  pageNo?: number;
  pageSize?: number;
  keywords?: string;
  engineTypes?: string[];
  healthStatusList?: number[];
  sortField?: string;
  sortType?: "asc" | "desc";
}

export interface SeatunnelClientStatistics {
  total: number;
  liveCount: number;
  downCount: number;
}

export interface SeatunnelClientLog {
  clientId: number;
  clientName: string;
  content: string;
}

export const seatunnelClientApi = {
  saveOrUpdate: (data: SeatunnelClient) => {
    return HttpUtils.post(`${apiPrefix}/saveOrUpdate`, data);
  },

  selectById: (
    id: number
  ): Promise<{ code: number; data: SeatunnelClient; message?: string }> => {
    return HttpUtils.get(`${apiPrefix}/${id}`);
  },

  delete: (id: number) => {
    return HttpUtils.delete(`${apiPrefix}/${id}`);
  },

  page: (
    data: SeatunnelClientPageRequest
  ): Promise<{ code: number; data: any; message?: string }> => {
    return HttpUtils.post(`${apiPrefix}/page`, data);
  },



  metrics: (
    id: number
  ): Promise<{
    code: number;
    data: SeatunnelClientMetrics;
    msg?: string;
    message?: string;
  }> => {
    return HttpUtils.get(`${apiPrefix}/${id}/metrics`);
  },

  statistics: (): Promise<{
    code: number;
    data: SeatunnelClientStatistics;
    message?: string;
  }> => {
    return HttpUtils.get(`${apiPrefix}/statistics`);
  },

  enable: (id: number) => {
    return HttpUtils.post(`${apiPrefix}/${id}/enable`);
  },

  disable: (id: number) => {
    return HttpUtils.post(`${apiPrefix}/${id}/disable`);
  },

  testConnection: (
    id: number
  ): Promise<{ code: number; data: boolean; message?: string }> => {
    return HttpUtils.post(`${apiPrefix}/${id}/test-connection`);
  },

  logs: (
    id: number
  ): Promise<{ code: number; data: SeatunnelClientLog; message?: string }> => {
    return HttpUtils.get(`${apiPrefix}/${id}/logs`);
  },
};