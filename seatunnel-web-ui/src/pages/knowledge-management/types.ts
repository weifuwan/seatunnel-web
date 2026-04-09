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

export type ParamItem = ConnectorParamItem | TimeParamItem;

export interface FormValues {
  connectorName?: string;
  paramName: string;
  paramDesc: string;
  paramType?: string;
  required?: boolean;
  defaultValue?: string;
  exampleValue?: string;
  timeFormat?: string;
  expression?: string;
}

export interface MenuItemConfig {
  key: MenuKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
}