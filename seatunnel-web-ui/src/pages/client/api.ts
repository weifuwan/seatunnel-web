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

export interface SeatunnelClientOption {
  value: string | number;
  label: string;
  description?: string;
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

  option: (): Promise<{
    code: number;
    data: SeatunnelClientOption[];
    msg?: string;
    message?: string;
  }> => {
    return HttpUtils.get(`${apiPrefix}/option`);
  },

  verifyDatasource: (
    clientId: number | string,
    datasourceId: number | string
  ): Promise<{
    code: number;
    data?: {
      success?: boolean;
      message?: string;
      errorMessage?: string;
      finalJobStatus?: string;
      durationMs?: number;
      testJobId?: string;
    };
    msg?: string;
    message?: string;
  }> => {
    return HttpUtils.post(`/api/v1/devops/client/${clientId}/verify-datasource`, {
      datasourceId,
      timeoutMs: 15000,
      pollIntervalMs: 1000,
    });
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


};