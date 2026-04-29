import HttpUtils from "@/utils/HttpUtils";
import { ConnectorParamQuery, ConnectorParamVO, PageResult } from "./types";

export interface SaveConnectorParamPayload {
  id?: number;
  type: string;
  connectorName: string;
  paramName: string;
  paramDesc: string;
  paramType: string;
  requiredFlag: number;
  defaultValue?: string;
  exampleValue?: string;
  paramContext?: string;
  remark?: string;
}

export interface ConnectorParamListQuery {
  connectorName?: string;
  type?: string;
}

export async function fetchConnectorParamPage(params: ConnectorParamQuery) {
  return HttpUtils.post<PageResult<ConnectorParamVO>>(
    "/api/v1/connector-param-meta/page",
    params
  );
}

export async function fetchConnectorParamDetail(id: number) {
  return HttpUtils.get<ConnectorParamVO>(`/api/v1/connector-param-meta/${id}`);
}

export async function createConnectorParam(data: SaveConnectorParamPayload) {
  return HttpUtils.post<number>("/api/v1/connector-param-meta", data);
}

export async function updateConnectorParam(data: SaveConnectorParamPayload) {
  if (!data.id) {
    throw new Error("更新 Connector 参数时 id 不能为空");
  }

  return HttpUtils.put<boolean>(
    `/api/v1/connector-param-meta/${data.id}`,
    data
  );
}

export async function deleteConnectorParam(id: number) {
  return HttpUtils.delete<boolean>(`/api/v1/connector-param-meta/${id}`);
}

export async function fetchConnectorParamList(
  params?: ConnectorParamListQuery
) {
  return HttpUtils.get<ConnectorParamVO[]>(
    "/api/v1/connector-param-meta/list",
    params
  );
}