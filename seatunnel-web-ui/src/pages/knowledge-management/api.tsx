import { request } from "@umijs/max";
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

export async function fetchConnectorParamPage(params: ConnectorParamQuery) {
  return request<PageResult<ConnectorParamVO>>(
    "/api/v1/connector-param-meta/page",
    {
      method: "GET",
      params,
    }
  );
}

export async function fetchConnectorParamDetail(id: number) {
  return request<ConnectorParamVO>(`/api/v1/connector-param-meta/${id}`, {
    method: "GET",
  });
}

export async function createConnectorParam(data: SaveConnectorParamPayload) {
  return request<number>("/api/v1/connector-param-meta", {
    method: "POST",
    data,
  });
}

export async function updateConnectorParam(data: SaveConnectorParamPayload) {
  return request<boolean>("/api/v1/connector-param-meta", {
    method: "PUT",
    data,
  });
}

export async function deleteConnectorParam(id: number) {
  return request<boolean>(`/api/v1/connector-param-meta/${id}`, {
    method: "DELETE",
  });
}

export async function fetchConnectorParamList(params?: {
  connectorName?: string;
  type?: string;
}) {
  return request<ConnectorParamVO[]>("/api/v1/connector-param-meta/list", {
    method: "GET",
    params,
  });
}