import {
  dataSourceCatalogApi,
  fetchDataSourceOptions,
} from "@/pages/data-source/service";
import { message } from "antd";
import { Table2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface SinkPanelLogicProps {
  selectedNode: any;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

export function useSinkPanelLogic({
  selectedNode,
  onNodeDataChange,
}: SinkPanelLogicProps) {
  const nodeId = selectedNode?.id;
  const nodeData = selectedNode?.data || {};

  const title = nodeData?.title || "MYSQL";
  const dbType = nodeData?.dbType || "MYSQL";
  const description = nodeData?.description || "写入目标端数据";

  const sinkDataSourceId = nodeData?.sinkDataSourceId
    ? String(nodeData.sinkDataSourceId)
    : undefined;

  const autoCreateTable = Boolean(nodeData?.autoCreateTable);
  const writeMode = nodeData?.writeMode || "append";
  const sinkReadMode = nodeData?.sinkReadMode || "table";

  const sinkTable = nodeData?.sinkTable;
  const sinkTableName = nodeData?.sinkTableName || "";
  const sinkSql = nodeData?.sinkSql || "";
  const primaryKey = nodeData?.primaryKey || "";
  const batchSize = nodeData?.batchSize || "";
  const extraParams = nodeData?.extraParams || [];

  const [sinkDataSourceOptions, setSinkDataSourceOptions] = useState<any[]>([]);
  const [tableOptions, setTableOptions] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [sqlPopoverOpen, setSqlPopoverOpen] = useState(false);
  const [selectedSqlTable, setSelectedSqlTable] = useState<string>();
  const [generateSqlLoading, setGenerateSqlLoading] = useState(false);

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
    return sinkDataSourceOptions.find(
      (item: any) => String(item.value) === String(sinkDataSourceId)
    );
  }, [sinkDataSourceId, sinkDataSourceOptions]);

  useEffect(() => {
    const loadDataSourceOptions = async () => {
      if (!dbType) {
        setSinkDataSourceOptions([]);
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
        setSinkDataSourceOptions(options);
      } catch (error) {
        console.error("load sink data source options error", error);
        setSinkDataSourceOptions([]);
      }
    };

    loadDataSourceOptions();
  }, [dbType]);

  useEffect(() => {
    if (!sinkDataSourceId || sinkDataSourceOptions.length === 0) return;

    const matched = sinkDataSourceOptions.find(
      (item: any) => String(item.value) === String(sinkDataSourceId)
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
  }, [sinkDataSourceId, sinkDataSourceOptions, nodeData, updateNode]);

  useEffect(() => {
    const loadTableOptions = async () => {
      if (!sinkDataSourceId || autoCreateTable) {
        setTableOptions([]);
        return;
      }

      setTableLoading(true);
      try {
        const res = await dataSourceCatalogApi.listTable(sinkDataSourceId);
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
          sinkTable &&
          !options.some((item: any) => String(item.value) === String(sinkTable))
        ) {
          updateNode({ sinkTable: undefined });
        }
      } catch (error) {
        console.error("load sink table options error", error);
        setTableOptions([]);
      } finally {
        setTableLoading(false);
      }
    };

    loadTableOptions();
  }, [sinkDataSourceId, autoCreateTable, sinkTable, updateNode]);

  const handleDataSourceChange = useCallback(
    (value: string, option: any) => {
      setSelectedSqlTable(undefined);
      setSqlPopoverOpen(false);

      updateNode({
        sinkDataSourceId: value,
        title: option?.label || nodeData?.title,
        dbType: option?.dbType || nodeData?.dbType || "MYSQL",
        sinkTable: undefined,
        sinkTableName: "",
        sinkSql: "",
        primaryKey: "",
      });
    },
    [nodeData, updateNode]
  );

  const handleAutoCreateTableChange = useCallback(
    (checked: boolean) => {
      setSelectedSqlTable(undefined);
      setSqlPopoverOpen(false);

      updateNode({
        autoCreateTable: checked,
        sinkReadMode: "table",
        sinkTable: undefined,
        sinkTableName: "",
        sinkSql: "",
      });
    },
    [updateNode]
  );

  const handleWriteModeChange = useCallback(
    (value: string) => {
      const patch: Record<string, any> = { writeMode: value };

      if (value !== "upsert") {
        patch.primaryKey = "";
      }

      updateNode(patch);
    },
    [updateNode]
  );

  const handleSinkReadModeChange = useCallback(
    (value: string) => {
      updateNode({
        sinkReadMode: value,
        ...(value === "table" ? { sinkSql: "" } : { sinkTable: undefined }),
      });
    },
    [updateNode]
  );

  const handleGenerateSinkSql = useCallback(async () => {
    if (!sinkDataSourceId) {
      message.warning("请先选择目标数据源");
      return;
    }

    if (!selectedSqlTable) {
      message.warning("请选择目标表");
      return;
    }

    try {
      setGenerateSqlLoading(true);

      const res = await dataSourceCatalogApi.buildSqlTemplate(
        sinkDataSourceId,
        {
          read_mode: "table",
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

      updateNode({ sinkSql: nextSql });
      setSqlPopoverOpen(false);
      message.success("SQL 生成成功");
    } catch (error) {
      console.error("generate sink sql error", error);
      message.error("SQL 生成失败");
    } finally {
      setGenerateSqlLoading(false);
    }
  }, [sinkDataSourceId, selectedSqlTable, updateNode]);

  return {
    title,
    dbType,
    description,

    sinkDataSourceId,
    autoCreateTable,
    writeMode,
    sinkReadMode,
    sinkTable,
    sinkTableName,
    sinkSql,
    primaryKey,
    batchSize,
    extraParams,

    currentDataSource,
    sinkDataSourceOptions,
    tableOptions,
    tableLoading,

    sqlPopoverOpen,
    setSqlPopoverOpen,
    selectedSqlTable,
    setSelectedSqlTable,
    generateSqlLoading,

    updateNode,
    handleDataSourceChange,
    handleAutoCreateTableChange,
    handleWriteModeChange,
    handleSinkReadModeChange,
    handleGenerateSinkSql,
  };
}