export type MenuKey = "connector" | "time";

export interface PaginationInfo {
  total: number;
  pageNo: number;
  pageSize: number;
}

export interface PaginationData<T> {
  bizData: T[];
  pagination: PaginationInfo;
}

export interface PageResult<T> {
  code: number;
  message: string;
  data: PaginationData<T>;
}

export interface ConnectorParamQuery {
  type?: string;
  connectorName?: string;
  paramName?: string;
  pageNo: number;
  pageSize: number;
}

export interface ConnectorParamVO {
  id: number;
  type: string;
  connectorName: string;
  connectorType?: string;
  paramName: string;
  paramDesc: string;
  paramType: string;
  requiredFlag: number;
  defaultValue?: string;
  exampleValue?: string;
  paramContext?: string;
  remark?: string;
}

export interface ConnectorParamItem {
  id: number;
  type: "connector";
  connectorName: string;
  connectorType?: string;
  paramName: string;
  paramDesc: string;
  paramType: string;
  required: boolean;
  defaultValue: string;
  exampleValue: string;
  paramContext?: string;
}

export interface TimeParamItem {
  id: number;
  type: "time";
  paramName: string;
  paramDesc: string;
  timeFormat: string;
  defaultValue: string;
  exampleValue: string;
  expression?: string;
}

export type ParamItem = ConnectorParamItem | TimeParamItem;

export interface FormValues {
  connectorName?: string;
  connectorType?: string;
  paramName: string;
  paramDesc: string;
  paramType?: string;
  required?: boolean;
  defaultValue?: string;
  exampleValue?: string;
  paramContext?: string;

  timeFormat?: string;
  expression?: string;
}