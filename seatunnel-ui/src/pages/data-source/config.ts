export enum ConfigOperate {
  Add,
  Edit,
}

export type ConfigProps = {
  id?: number;
  dsType?: string;
  valueName?: string;
  value?: string;
  status?: 1 | 2;
  url?: string;
  customParams?: string;
  dsName?: string;
};

export type AddConfigProps = Omit<ConfigProps, 'id' | 'operator'>;
export type EditConfigProps = Omit<ConfigProps, 'operator'>;


export const sourceList = [
  {
    groupName: "Relational Databases",
    datasourceList: [

      {
        onlyDiScript: false,
        dbType: "MYSQL",
        type: "MYSQL",
        connectorType: "Jdbc"
      },
      {
        onlyDiScript: false,
        dbType: "ORACLE",
        type: "ORACLE",
        connectorType: "Jdbc"
      },
      {
        onlyDiScript: false,
        dbType: "POSTGRESQL",
        type: "POSTGRESQL",
        connectorType: "Jdbc"
      },

    ],
  }
];