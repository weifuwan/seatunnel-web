import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import { dataSourceApi } from "@/pages/data-source/type";
import { useEffect, useState } from "react";
import { DataSourceOption, DbType } from "../types";

export const useDataSource = (form, fetchTables) => {
  const [sourceType, setSourceType] = useState<DbType>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "MySQL-CDC",
  });
  const [targetType, setTargetType] = useState<DbType>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });

  const [sourceOption, setSourceOption] = useState<DataSourceOption[]>([]);
  const [targetOption, setTargetOption] = useState<DataSourceOption[]>([]);
  const [dataSourceIdK, setDataSourceIdK] = useState("");

  useEffect(() => {
    fetchSourceOptions();
    fetchTargetOptions();
  }, []);

  const fetchSourceOptions = async () => {
    const res = await dataSourceApi.option(sourceType.dbType);
    if (res?.code === 0 && res?.data?.length) {
      const options = res.data.map((item) => ({
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <DatabaseIcons dbType={item?.label} width="18" height="18" />
            &nbsp;&nbsp;{item?.label}
          </div>
        ),
        value: item.value,
        connectorType: item?.connectorType,
      }));
      setSourceOption(options);

      const isEdit = !!form?.getFieldValue("id");
      if (!isEdit && options?.length > 0) {
        const firstSourceId = options[0].value;
        form.setFieldValue("sourceId", firstSourceId);
        setDataSourceIdK(firstSourceId);
        fetchTables(firstSourceId, "1");
      }
    } else {
      setSourceOption([]);
    }
  };

  const fetchTargetOptions = async () => {
    const res = await dataSourceApi.option(targetType.dbType);
    if (res?.code === 0 && res?.data?.length) {
      const options = res.data.map((item) => ({
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <DatabaseIcons dbType={item?.label} width="18" height="18" />
            &nbsp;&nbsp;{item?.label}
          </div>
        ),
        value: item.value,
        connectorType: item?.connectorType,
      }));
      setTargetOption(options);
      const isEdit = !!form?.getFieldValue("id");
      if (!isEdit && options?.length > 0) {
        const firstSourceId = options[0].value;
        form.setFieldValue("sinkId", firstSourceId);
      }
    } else {
      setTargetOption([]);
    }
  };

  const handleSourceChange = (value: string, option: any) => {
    setSourceType({ dbType: value, connectorType: option?.connectorType, pluginName: option?.pluginName });
  };

  const handleTargetChange = (value: string, option: any) => {
    setTargetType({ dbType: value, connectorType: option?.connectorType, pluginName: option?.pluginName });
  };

  return {
    sourceType,
    targetType,
    sourceOption,
    targetOption,
    dataSourceIdK,
    setDataSourceIdK,
    setSourceType,
    setTargetType,
    handleSourceChange,
    handleTargetChange,
  };
};
