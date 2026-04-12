import {
  dataSourceCatalogApi,
  fetchDataSourceOptions,
} from "@/pages/data-source/service";
import { message } from "antd";
import { Table2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface SourcePanelLogicProps {
  selectedNode: any;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  qualityDetailRef: any;
}

export function useSourcePanelLogic({
  selectedNode,
  onNodeDataChange,
  qualityDetailRef,
}: SourcePanelLogicProps) {
  const nodeId = selectedNode?.id;
  const nodeData = selectedNode?.data || {};
  const config = nodeData?.config || {};

  const title = nodeData?.title || "来源节点";
  const dbType = nodeData?.dbType;
  const description = nodeData?.description || "";
  const sourceDataSourceId = config?.sourceDataSourceId || "";
  const readMode = config?.readMode || "table";
  const sourceTable = config?.sourceTable || undefined;
  const sql = config?.sql || "";
  const extraParams = config?.extraParams || [];

  const [sourceDataSourceOptions, setSourceDataSourceOptions] = useState<any[]>(
    []
  );
  const [tableOptions, setTableOptions] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [sqlPopoverOpen, setSqlPopoverOpen] = useState(false);
  const [resolvePopoverOpen, setResolvePopoverOpen] = useState(false);
  const [selectedSqlTable, setSelectedSqlTable] = useState<string>();
  const [generateSqlLoading, setGenerateSqlLoading] = useState(false);
  const [resolveSqlLoading, setResolveSqlLoading] = useState(false);
  const [resolvedSqlPreview, setResolvedSqlPreview] = useState("");
  const [viewLoading, setViewLoading] = useState(false);

  const updateNode = useCallback(
    (patch: Record<string, any>) => {
      if (!nodeId) return;
      onNodeDataChange(nodeId, {
        ...nodeData,
        ...patch,
      });
    },
    [nodeId, nodeData, onNodeDataChange]
  );

  const currentDataSource = useMemo(() => {
    return sourceDataSourceOptions.find(
      (item: any) => String(item.value) === String(sourceDataSourceId)
    );
  }, [sourceDataSourceId, sourceDataSourceOptions]);

  useEffect(() => {
    const loadDataSourceOptions = async () => {
      if (!dbType) {
        setSourceDataSourceOptions([]);
        return;
      }

      try {
        const res = await fetchDataSourceOptions(dbType);
        const list = Array.isArray(res?.data) ? res.data : [];
        const options = list.map((item: any) => ({
          label: item?.label,
          value: String(item?.value),
          dbType: item?.dbType,
        }));
        setSourceDataSourceOptions(options);
      } catch (error) {
        console.error("load data source options error", error);
        setSourceDataSourceOptions([]);
      }
    };

    loadDataSourceOptions();
  }, [dbType]);

  useEffect(() => {
    if (!sourceDataSourceId || sourceDataSourceOptions.length === 0) return;

    const matched = sourceDataSourceOptions.find(
      (item: any) => String(item.value) === String(sourceDataSourceId)
    );

    if (!matched) return;

    const nextTitle = matched?.label || nodeData?.title;
    const nextDbType = matched?.dbType || nodeData?.dbType || "MYSQL";

    if (nodeData?.title === nextTitle && nodeData?.dbType === nextDbType) {
      return;
    }

    updateNode({
      title: nextTitle,
      dbType: nextDbType,
    });
  }, [sourceDataSourceId, sourceDataSourceOptions, nodeData, updateNode]);

  useEffect(() => {
    const loadTableOptions = async () => {
      if (!sourceDataSourceId) {
        setTableOptions([]);
        return;
      }

      setTableLoading(true);
      try {
        const res = await dataSourceCatalogApi.listTable(sourceDataSourceId);
        const list = Array.isArray(res?.data) ? res.data : [];

        const options = list.map((item: any) => {
          const text = item?.label ?? String(item?.value ?? "");

          return {
            label: (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: "rgba(148, 163, 184, 0.12)",
                    color: "#64748B",
                    flexShrink: 0,
                  }}
                >
                  <Table2 size={12} />
                </span>
                <span style={{ color: "#344054" }}>{text}</span>
              </div>
            ),
            value: String(item?.value ?? ""),
            rawLabel: text,
            description: item?.description,
          };
        });

        setTableOptions(options);

        if (
          sourceTable &&
          !options.some(
            (item: any) => String(item.value) === String(sourceTable)
          )
        ) {
          updateNode({ sourceTable: undefined });
        }
      } catch (error) {
        console.error("load table options error", error);
        setTableOptions([]);
      } finally {
        setTableLoading(false);
      }
    };

    loadTableOptions();
  }, [sourceDataSourceId]);

  const handleDataSourceChange = useCallback(
    (value: string, option: any) => {
      setSelectedSqlTable(undefined);
      setResolvedSqlPreview("");

      updateNode({
        title: option?.label || nodeData?.title,
        dbType: option?.dbType || nodeData?.dbType || "MYSQL",
        config: {
          sourceDataSourceId: value,
          sourceTable: "",
          sql: "",
        },
        meta: {
          outputSchema: [],
          schemaStatus: "idle",
          schemaError: "",
        },
      });
    },
    [nodeData, updateNode]
  );

  const resolveSourceOutputSchema = useCallback(async () => {
    const sourceId = sourceDataSourceId;
    const readModeValue = readMode;
    const tablePath = sourceTable;
    const sqlText = sql?.trim();

    if (!sourceId) {
      message.warning("请先选择来源数据源");
      return [];
    }

    if (readModeValue === "table" && !tablePath) {
      message.warning("请先选择来源表");
      return [];
    }

    if (readModeValue === "sql" && !sqlText) {
      message.warning("请先输入 SQL");
      return [];
    }

    try {
      setTableLoading(true);

      updateNode({
        meta: {
          schemaStatus: "loading",
          schemaError: "",
        },
      });

      const params = {
        taskExecuteType: readModeValue === "sql" ? "SQL" : "SINGLE_TABLE",
        table_path: readModeValue === "table" ? tablePath : "",
        query: readModeValue === "sql" ? sqlText : "",
      };

      const resp = await dataSourceCatalogApi.listColumn(sourceId, params);

      if (resp?.code !== 0) {
        const errorMsg = resp?.message || "字段解析失败";

        updateNode({
          meta: {
            outputSchema: [],
            schemaStatus: "error",
            schemaError: errorMsg,
          },
        });

        message.error(errorMsg);
        return [];
      }

      const rawColumns = resp?.data || [];

      const outputSchema = rawColumns.map((item: any) => ({
        name: item?.columnName || item?.name || "",
        type: item?.dataType || item?.type || "",
        nullable: item?.nullable,
        comment: item?.comment || item?.columnComment || "",
        originFieldName: item?.columnName || item?.name || "",
      }));

      updateNode({
        meta: {
          outputSchema,
          schemaStatus: "success",
          schemaError: "",
        },
      });

      return outputSchema;
    } catch (error: any) {
      updateNode({
        meta: {
          outputSchema: [],
          schemaStatus: "error",
          schemaError: "字段解析失败",
        },
      });

      message.error("字段解析失败");
      return [];
    } finally {
      setTableLoading(false);
    }
  }, [
    sourceDataSourceId,
    readMode,
    sourceTable,
    sql,
    updateNode,
    setTableLoading,
  ]);

const handleReadModeChange = useCallback(
  (value: string) => {
    updateNode({
      config: {
        readMode: value,
        ...(value === "table" ? { sql: "" } : { sourceTable: "" }),
      },
      meta: {
        outputSchema: [],
        schemaStatus: "idle",
        schemaError: "",
      },
    });
  },
  [updateNode]
);

  const handlePreview = useCallback(async () => {
    if (!sourceDataSourceId) {
      message.warning("请选择数据源");
      return;
    }

    const getRequestParams = () => ({
      read_mode: readMode,
      ...(readMode === "table" ? { table_path: sourceTable } : { query: sql }),
      extra_params: extraParams,
    });

    try {
      if (readMode === "table" && !sourceTable) {
        message.warning("请选择来源表");
        return;
      }

      if (readMode === "sql" && !sql?.trim()) {
        message.warning("请输入 SQL");
        return;
      }

      setViewLoading(true);

      const data = await dataSourceCatalogApi.getTop20Data(
        sourceDataSourceId,
        getRequestParams()
      );

      if (data?.code === 0) {
        qualityDetailRef.current?.onOpen(true, data);
      } else {
        message.error(data?.message || "数据预览失败");
      }
    } catch (error) {
      console.error("preview source data error", error);
      message.error("数据预览失败");
    } finally {
      setViewLoading(false);
    }
  }, [
    sourceDataSourceId,
    readMode,
    sourceTable,
    sql,
    extraParams,
    qualityDetailRef,
  ]);

  const handleStatistics = useCallback(() => {
    console.log("statistics source data", {
      nodeId,
      sourceDataSourceId,
      readMode,
      sourceTable,
      sql,
      extraParams,
    });
  }, [nodeId, sourceDataSourceId, readMode, sourceTable, sql, extraParams]);

  const handleGenerateSql = useCallback(async () => {
    if (!sourceDataSourceId) {
      message.warning("请先选择数据源");
      return;
    }

    if (!selectedSqlTable) {
      message.warning("请选择表");
      return;
    }

    try {
      setGenerateSqlLoading(true);

      const res = await dataSourceCatalogApi.buildSqlTemplate(
        sourceDataSourceId,
        {
          read_mode: readMode,
          table_path: selectedSqlTable,
        }
      );

      if (res?.code !== 0) {
        message.error(res?.message || "SQL 生成失败");
        return;
      }

      const nextSql = res?.data || "";
      if (!nextSql) {
        message.warning("未生成有效 SQL");
        return;
      }

      updateNode({ sql: nextSql });
      setSqlPopoverOpen(false);
      message.success("SQL 生成成功");
    } catch (error) {
      console.error("generate sql error", error);
      message.error("SQL 生成失败");
    } finally {
      setGenerateSqlLoading(false);
    }
  }, [sourceDataSourceId, selectedSqlTable, updateNode]);

  const handleResolveSqlPreview = useCallback(async () => {
    if (!sourceDataSourceId) {
      message.warning("请先选择数据源");
      return;
    }

    if (!sql) {
      message.warning("请先输入 SQL");
      return;
    }

    try {
      setResolveSqlLoading(true);

      const res = await dataSourceCatalogApi.resolveSql(sourceDataSourceId, {
        query: sql,
      });

      if (res?.code !== 0) {
        message.error(res?.message || "SQL 变量解析失败");
        return;
      }

      setResolvedSqlPreview(res?.data || "");
    } catch (error) {
      console.error("resolve sql error", error);
      message.error("SQL 变量解析失败");
    } finally {
      setResolveSqlLoading(false);
    }
  }, [sourceDataSourceId, sql]);

  const handleOpenResolvePopover = useCallback(
    async (open: boolean) => {
      setResolvePopoverOpen(open);
      if (open && sql) {
        await handleResolveSqlPreview();
      }
    },
    [sql, handleResolveSqlPreview]
  );

  const handleResolveColumns = useCallback(async () => {
  await resolveSourceOutputSchema();
}, [resolveSourceOutputSchema]);

  return {
    nodeData,
    title,
    dbType,
    description,
    sourceDataSourceId,
    readMode,
    sourceTable,
    sql,
    extraParams,
    currentDataSource,

    sourceDataSourceOptions,
    tableOptions,
    tableLoading,

    sqlPopoverOpen,
    setSqlPopoverOpen,
    resolvePopoverOpen,
    selectedSqlTable,
    setSelectedSqlTable,
    generateSqlLoading,
    resolveSqlLoading,
    resolvedSqlPreview,
    viewLoading,

    updateNode,
    handleDataSourceChange,
    handleReadModeChange,
    handlePreview,
    handleStatistics,
    handleGenerateSql,
    handleResolveSqlPreview,
    handleOpenResolvePopover,

    handleResolveColumns
  };
}
