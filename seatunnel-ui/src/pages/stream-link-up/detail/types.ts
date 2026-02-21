export interface WholeSyncTaskDraft {
  source: {
    dbType: string;
    connectorType: string;
    datasourceId: string;
    pluginName: string;
    extraParams: any[];
    startupMode: any;
    stopMode: any;
    schemaChange: boolean
  };
  target: {
    dbType: string;
    connectorType: string;
    datasourceId: string;
    pluginName: string;
    extraParams: any[];
    dataSaveMode: any;
    batchSize: any;
    exactlyOnce: boolean;
    schemaSaveMode: any;
    enableUpsert: boolean;
  };
  tableMatch: {
    mode: "1" | "2" | "4";
    keyword?: string;
    tables?: string[];
  };
}

export interface TableItem {
  key: string;
  title: any;
  value?: string;
  chosen?: boolean;
}

export interface DbType {
  dbType: string;
  connectorType: string;
  pluginName: string;
}

export interface DataSourceOption {
  label: React.ReactNode;
  value: string;
  connectorType?: string;
  pluginName: string;
}