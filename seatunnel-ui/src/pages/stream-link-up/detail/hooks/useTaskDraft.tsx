import { DbType, WholeSyncTaskDraft } from "../types";

interface BuildDraftParams {
  form: any;
  sourceType: DbType;
  targetType: DbType;
  matchMode: string;
  multiTableList: string[];
  tableKeyword: string;
}

export const useTaskDraft = () => {
  const buildTaskDraft = ({
    form,
    sourceType,
    targetType,
    matchMode,
    multiTableList,
    tableKeyword,
  }: BuildDraftParams): WholeSyncTaskDraft => {
    const formValues = form.getFieldsValue();
    const draft: WholeSyncTaskDraft = {
      source: {
        dbType: sourceType.dbType,
        connectorType: sourceType.connectorType,
        datasourceId: formValues.sourceId,
        pluginName: sourceType.pluginName,
        extraParams: formValues.sourceExtraParams,
        startupMode: formValues.startupMode,
        stopMode: formValues.stopMode,
        schemaChange:formValues.schemaChange,
      },
      target: {
        dbType: targetType.dbType,
        connectorType: targetType.connectorType,
        datasourceId: formValues.sinkId,
        pluginName: targetType.pluginName,
        extraParams: formValues.sinkExtraParams,
        dataSaveMode: formValues.dataSaveMode,
        batchSize: formValues.batchSize,
        exactlyOnce: formValues.exactlyOnce,
        schemaSaveMode: formValues.schemaSaveMode,
        enableUpsert: formValues.enableUpsert
      },
      tableMatch: {
        mode: matchMode as any,
      },
    };

    if (matchMode === "1" || matchMode === "4") {
      draft.tableMatch.tables = multiTableList;
    }

    if (matchMode === "2") {
      draft.tableMatch.keyword = tableKeyword;
    }

    return draft;
  };

  const restoreFromDraft = async (
    draft: WholeSyncTaskDraft,
    {
      setSourceType,
      setTargetType,
      setMatchMode,
      setDataSourceIdK,
      setMultiTableList,
      setTableKeyword,
      form,
      fetchTables,
      fetchReferenceTables,
    }: any
  ) => {
    setSourceType(draft.source);
    setTargetType(draft.target);

    console.log(draft);

    form.setFieldsValue({
      sourceId: draft.source.datasourceId,
      sinkId: draft.target.datasourceId,
      matchMode: draft.tableMatch.mode,
      sourceTable: draft.tableMatch.keyword,
      startupMode: draft.source.startupMode,
      stopMode: draft.source.stopMode,
      schemaChange: draft.source.schemaChange,
      sourceExtraParams: draft.source.extraParams,
      sinkExtraParams: draft.target.extraParams,
      batchSize: draft.target.batchSize,
      dataSaveMode: draft.target.dataSaveMode,
      enableUpsert: draft.target.enableUpsert,
      exactlyOnce: draft.target.exactlyOnce,
      schemaSaveMode: draft.target.schemaSaveMode,
    });

    setMatchMode(draft.tableMatch.mode);
    setDataSourceIdK(draft.source.datasourceId);

    if (draft.tableMatch.mode === "1") {
      await fetchTables(draft.source.datasourceId, "1");
      setMultiTableList(draft.tableMatch.tables || []);
    }

    if (draft.tableMatch.mode === "4") {
      await fetchTables(draft.source.datasourceId, "4");
    }

    if (draft.tableMatch.mode === "2") {
      setTableKeyword(draft.tableMatch.keyword || "");
      fetchReferenceTables(
        draft.source.datasourceId,
        draft.tableMatch.mode,
        draft.tableMatch.keyword
      );
    }
  };

  return { buildTaskDraft, restoreFromDraft };
};
