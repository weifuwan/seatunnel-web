import React from "react";

export type MenuKey = "connector" | "time";

export interface BaseParamItem {
  id: number;
  paramName: string;
  paramDesc: string;
  defaultValue?: string;
  exampleValue?: string;
}

export interface ConnectorParamItem extends BaseParamItem {
  type: "connector";
  connectorName: string;
  paramType: string;
  required: boolean;
}

export interface TimeParamItem extends BaseParamItem {
  type: "time";
  timeFormat: string;
  expression?: string;
}



export interface FormValues {
  connectorName?: string;
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

export interface MenuItemConfig {
  key: MenuKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export interface MenuItemConfig {
  key: MenuKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export interface BaseParamItem {
  id: number;
  type: MenuKey;
  paramName: string;
  paramDesc: string;
  defaultValue?: string;
  exampleValue?: string;
}

export interface ConnectorParamItem extends BaseParamItem {
  type: "connector";
  connectorName: string;
  paramType: string;
  required: boolean;
  paramContext?: string;
}

export interface TimeParamItem extends BaseParamItem {
  type: "time";
  timeFormat: string;
  expression?: string;
}

export type ParamItem = ConnectorParamItem | TimeParamItem;

export interface FormValues {
  connectorName?: string;
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

export interface ConnectorParamQuery {
  type?: string;
  connectorName?: string;
  paramName?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface ConnectorParamVO {
  id: number;
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
  createTime?: string;
  updateTime?: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}