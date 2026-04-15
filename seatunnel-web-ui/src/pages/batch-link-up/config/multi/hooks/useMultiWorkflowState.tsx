import { FormInstance, message } from "antd";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

import { dataSourceCatalogApi, fetchDataSourceOptions } from "@/pages/data-source/service";

import {
  buildDataSourceOptions,
  buildTableItems,
  DEFAULT_DB_TYPE,
  DEFAULT_FORM_VALUES,
} from "../config";
import { DbTypeValue, RightPanelTab, TableItem } from "../types";
import { seatunnelJobDefinitionApi } from "@/pages/batch-link-up/api";

interface UseMultiWorkflowStateProps {
  form: FormInstance;
  params: any;
  basicConfig: any;
  scheduleConfig: any;
}

export function useMultiWorkflowState({
  form,
  params,
  basicConfig,
  scheduleConfig,
}: UseMultiWorkflowStateProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("basic");

  const [loading, setLoading] = useState(false);

  const [sourceType] = useState<DbTypeValue>(params?.sourceType || DEFAULT_DB_TYPE);
  const [targetType] = useState<DbTypeValue>(params?.targetType || DEFAULT_DB_TYPE);

  const [sourceOption, setSourceOption] = useState<any[]>([]);
  const [targetOption, setTargetOption] = useState<any[]>([]);
  const [currentSourceId, setCurrentSourceId] = useState("");

  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [readOnlyTables, setReadOnlyTables] = useState<TableItem[]>([]);
  const [multiTableList, setMultiTableList] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<string>(DEFAULT_FORM_VALUES.matchMode);
  const [tableKeyword, setTableKeyword] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchDataSourceOptionsU = useCallback(async (dbType: string) => {
    const res = await fetchDataSourceOptions(dbType);
    if (res?.code === 0 && Array.isArray(res?.data)) {
      return buildDataSourceOptions(res.data);
    }
    return [];
  }, []);

  const fetchTables = useCallback(async (dataSourceId: string, mode?: string) => {
    if (!dataSourceId) return;

    try {
      setLoading(true);
      setCurrentSourceId(dataSourceId);

      const res = await dataSourceCatalogApi.listTable(dataSourceId);
      if (res?.code === 0) {
        const nextTables = buildTableItems(res.data || []);
        setTableData(nextTables);

        if (mode === "4") {
          setMultiTableList(nextTables.map((item) => item.key));
        } else if (mode === "1") {
          setMultiTableList([]);
        }
      } else {
        message.error(res?.message || "获取表列表失败");
      }
    } catch (error) {
      console.error(error);
      message.error("获取表列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferenceTables = useCallback(
    async (dataSourceId: string, mode: string, keyword?: string) => {
      if (!dataSourceId) return;

      try {
        setLoading(true);
        const res = await dataSourceCatalogApi.listTableReference(
          dataSourceId,
          mode,
          keyword
        );

        if (res?.code === 0) {
          setReadOnlyTables(buildTableItems(res.data || []));
        } else {
          message.error(res?.message || "获取参考表失败");
        }
      } catch (error) {
        console.error(error);
        message.error("获取参考表失败");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetchReferenceTables = useMemo(
    () =>
      debounce((dataSourceId: string, mode: string, keyword: string) => {
        fetchReferenceTables(dataSourceId, mode, keyword);
      }, 400),
    [fetchReferenceTables]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const sourceDbType = params?.sourceType?.dbType || sourceType.dbType || "MYSQL";
      const targetDbType = params?.targetType?.dbType || targetType.dbType || "MYSQL";

      const [sourceOptions, targetOptions] = await Promise.all([
        fetchDataSourceOptionsU(sourceDbType),
        fetchDataSourceOptionsU(targetDbType),
      ]);

      if (!mounted) return;

      setSourceOption(sourceOptions);
      setTargetOption(targetOptions);

      const rawWorkflow = params?.workflow || params?.jobDefinitionInfo || null;

      const sourceId =
        params?.sourceDataSourceId ||
        params?.sourceId ||
        sourceOptions?.[0]?.value ||
        "";

      const sinkId =
        params?.targetDataSourceId ||
        params?.targetId ||
        targetOptions?.[0]?.value ||
        "";

      const nextMatchMode = rawWorkflow?.tableMatch?.mode || DEFAULT_FORM_VALUES.matchMode;
      const nextKeyword = rawWorkflow?.tableMatch?.keyword || "";
      const nextMultiTableList = rawWorkflow?.tableMatch?.tables || [];

      setMatchMode(nextMatchMode);
      setTableKeyword(nextKeyword);
      setCurrentSourceId(String(sourceId || ""));

      form.setFieldsValue({
        sourceId,
        sinkId,
        matchMode: nextMatchMode,
        sourceTable: nextKeyword,
        fetchSize: rawWorkflow?.source?.fetchSize ?? DEFAULT_FORM_VALUES.fetchSize,
        splitSize: rawWorkflow?.source?.splitSize ?? DEFAULT_FORM_VALUES.splitSize,
        schemaSaveMode:
          rawWorkflow?.target?.schemaSaveMode ?? DEFAULT_FORM_VALUES.schemaSaveMode,
        dataSaveMode:
          rawWorkflow?.target?.dataSaveMode ?? DEFAULT_FORM_VALUES.dataSaveMode,
        batchSize: rawWorkflow?.target?.batchSize ?? DEFAULT_FORM_VALUES.batchSize,
        enableUpsert:
          rawWorkflow?.target?.enableUpsert ?? DEFAULT_FORM_VALUES.enableUpsert,
        fieldIde: rawWorkflow?.target?.fieldIde ?? DEFAULT_FORM_VALUES.fieldIde,
      });

      if (sourceId) {
        if (nextMatchMode === "1") {
          await fetchTables(String(sourceId), "1");
          setMultiTableList(nextMultiTableList);
        } else if (nextMatchMode === "4") {
          await fetchTables(String(sourceId), "4");
        } else if (nextMatchMode === "2" || nextMatchMode === "3") {
          if (nextKeyword) {
            await fetchReferenceTables(String(sourceId), nextMatchMode, nextKeyword);
          }
        }
      }
    };

    init();

    return () => {
      mounted = false;
      debouncedFetchReferenceTables.cancel();
    };
  }, [
    params,
    form,
    sourceType.dbType,
    targetType.dbType,
    fetchDataSourceOptionsU,
    fetchTables,
    fetchReferenceTables,
    debouncedFetchReferenceTables,
  ]);

  const handleSourceIdChange = async (value: string) => {
    setCurrentSourceId(value);

    if (matchMode === "1" || matchMode === "4") {
      await fetchTables(value, matchMode);
      setReadOnlyTables([]);
      return;
    }

    if (tableKeyword) {
      await fetchReferenceTables(value, matchMode, tableKeyword);
    }
  };

  const handleMatchModeChange = async (value: string) => {
    setMatchMode(value);
    form.setFieldValue("matchMode", value);

    if (!currentSourceId) return;

    if (value === "1" || value === "4") {
      setReadOnlyTables([]);
      await fetchTables(currentSourceId, value);
      return;
    }

    setTableData([]);
    setMultiTableList([]);

    if (tableKeyword) {
      await fetchReferenceTables(currentSourceId, value, tableKeyword);
    } else {
      setReadOnlyTables([]);
    }
  };

  const handleKeywordChange = (value: string) => {
    const keyword = value.trim();
    setTableKeyword(keyword);

    if (!keyword) {
      setReadOnlyTables([]);
      return;
    }

    if (!currentSourceId) return;
    debouncedFetchReferenceTables(currentSourceId, matchMode, keyword);
  };

  const buildWorkflowData = () => {
    const formValues = form.getFieldsValue();

    return {
      type: "GUIDE_MULTI",
      source: {
        dbType: sourceType?.dbType,
        connectorType: sourceType?.connectorType,
        datasourceId: formValues.sourceId,
        pluginName: sourceType?.pluginName,
        fetchSize: formValues.fetchSize,
        splitSize: formValues.splitSize,
      },
      target: {
        dbType: targetType?.dbType,
        connectorType: targetType?.connectorType,
        datasourceId: formValues.sinkId,
        pluginName: targetType?.pluginName,
        dataSaveMode: formValues.dataSaveMode,
        batchSize: formValues.batchSize,
        schemaSaveMode: formValues.schemaSaveMode,
        enableUpsert: formValues.enableUpsert,
        fieldIde: formValues.fieldIde,
      },
      tableMatch: {
        mode: matchMode,
        tables: matchMode === "1" || matchMode === "4" ? multiTableList : undefined,
        keyword: matchMode === "2" || matchMode === "3" ? tableKeyword : undefined,
      },
    };
  };

  const buildFinalPayload = () => {
    return {
      basic: {
        ...basicConfig,
        mode: "GUIDE_MULTI",
      },
      content: buildWorkflowData(),
      schedule: {
        ...scheduleConfig,
      },
      env: {
        jobMode: "BATCH",
        parallelism: 1,
      },
    };
  };

  const validateBeforeSubmit = async () => {
    await form.validateFields();

    if (matchMode === "1" && (!multiTableList || multiTableList.length === 0)) {
      message.warning("请选择至少一个表");
      return false;
    }

    const sourceId = form.getFieldValue("sourceId");
    const sinkId = form.getFieldValue("sinkId");

    if (sourceId && sinkId && sourceId === sinkId) {
      message.warning("来源和目标数据源不能相同");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      const finalPayload = buildFinalPayload();
      await seatunnelJobDefinitionApi.saveOrUpdateGuideMulti(finalPayload);
      message.success("保存成功");
    } catch (error) {
      console.error(error);
      message.error("保存失败");
    }
  };

  const handlePreview = async () => {
    try {
      const pass = await validateBeforeSubmit();
      if (!pass) return;

      setPreviewLoading(true);
      const finalPayload = buildFinalPayload();
      const res = await seatunnelJobDefinitionApi.buildGuideMultiConfig(finalPayload);
      setPreviewContent(res?.data || "");
      setPreviewOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setPreviewLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,

    loading,

    sourceOption,
    targetOption,

    tableData,
    readOnlyTables,
    multiTableList,
    setMultiTableList,

    matchMode,
    tableKeyword,

    previewOpen,
    setPreviewOpen,
    previewContent,
    previewLoading,

    handleSourceIdChange,
    handleMatchModeChange,
    handleKeywordChange,
    handleSave,
    handlePreview,
  };
}