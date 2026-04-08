import { fetchDataSourceOptions } from "@/pages/data-source/service";
import { Divider, Input, Segmented, Select, Tooltip } from "antd";
import { BarChart3, Database, Eye, FileCode2, Table2 } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import PanelShell from "../PanelShell";
import ExtraParamsConfig from "./ExtraParamsConfig";
import "./index.less";

const { TextArea } = Input;

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

function SourcePanel({ selectedNode, onClose, onNodeDataChange }: Props) {
  const nodeId = selectedNode?.id;
  const nodeData = selectedNode?.data || {};
  console.log(selectedNode);

  const title = nodeData?.title || "MYSQL";
  const dbType = nodeData?.dbType || "MYSQL";
  const description = nodeData?.description || "读取源端数据";

  const sourceDataSourceId = nodeData?.sourceDataSourceId;
  const readMode = nodeData?.readMode || "table";
  const sourceTable = nodeData?.sourceTable;
  const sql = nodeData?.sql || "";
  const extraParams = nodeData?.extraParams || [];

  const [sourceDataSourceOptions, setSourceDataSourceOptions] = useState<any[]>(
    []
  );
  const tableOptions = nodeData?.tableOptions || [];

  const currentDataSource = useMemo(() => {
    return sourceDataSourceOptions.find(
      (item: any) => item.value === sourceDataSourceId
    );
  }, [sourceDataSourceId, sourceDataSourceOptions]);

  const updateNode = (patch: Record<string, any>) => {
    if (!nodeId) return;
    onNodeDataChange(nodeId, {
      ...nodeData,
      ...patch,
    });
  };

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
          value: item?.value + "",
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
      (item: any) => item.value === sourceDataSourceId
    );

    if (!matched) return;

    const nextTitle = matched?.label || nodeData?.title;
    const nextDbType = matched?.dbType || nodeData?.dbType || "MYSQL";

    // 避免无意义重复更新
    if (nodeData?.title === nextTitle && nodeData?.dbType === nextDbType)
      return;

    updateNode({
      title: nextTitle,
      dbType: nextDbType,
    });
  }, [sourceDataSourceId, sourceDataSourceOptions]);

  const handleDataSourceChange = (value: string, option: any) => {
    updateNode({
      sourceDataSourceId: value,
      title: option?.label || nodeData?.title,
      dbType: option?.dbType || nodeData?.dbType || "MYSQL",
      sourceTable: undefined,
      sql: "",
    });
  };

  const handleReadModeChange = (value: string) => {
    updateNode({
      readMode: value,
      ...(value === "table" ? { sql: "" } : { sourceTable: undefined }),
    });
  };

  const handlePreview = () => {
    console.log("preview source data", {
      nodeId,
      sourceDataSourceId,
      readMode,
      sourceTable,
      sql,
      extraParams,
    });
  };

  const handleStatistics = () => {
    console.log("statistics source data", {
      nodeId,
      sourceDataSourceId,
      readMode,
      sourceTable,
      sql,
      extraParams,
    });
  };

  return (
    <PanelShell
      eyebrow="Source Config"
      title="来源配置"
      badge="输入节点"
      desc="修改后会实时同步到当前画布节点"
      heroTitle={title}
      heroDesc={description}
      heroTag="SOURCE"
      dbType={dbType}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="workflow-panel__btn workflow-panel__btn--ghost"
          onClick={onClose}
        >
          关闭
        </button>
      }
    >
      <section className="workflow-panel__section">
        <div className="workflow-panel__group">
          <div className="workflow-panel__group-head">
            <div className="workflow-panel__group-kicker">数据源</div>
          </div>


          {sourceDataSourceId && (
            <div className="workflow-panel__meta-card workflow-panel__meta-card--compact">
              <div className="workflow-panel__meta-icon">
                <Database size={16} />
              </div>
              <Select
                value={sourceDataSourceId}
                onChange={handleDataSourceChange}
                options={sourceDataSourceOptions}
                placeholder="请选择来源数据源"
                showSearch
                optionFilterProp="label"
                className="workflow-panel__antd-select"
                style={{ width: "100%" }}
                popupClassName="workflow-panel__dropdown"
              />
            </div>
          )}
        </div>

        <div className="workflow-panel__divider" />

        <div className="workflow-panel__group">
          <div
            className="workflow-panel__group-head"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div className="workflow-panel__group-kicker">读取方式</div>
            <div style={{ display: "flex" }}>
              <Tooltip title="预览读取结果样例数据">
                <Eye size={15} onClick={handlePreview} style={{cursor: "pointer"}}/>
              </Tooltip>{" "}
              <Divider type="vertical" />
              <Tooltip title="统计当前读取配置下的数据情况">
                <BarChart3 size={15} onClick={handleStatistics} style={{cursor: "pointer"}}/>
              </Tooltip>
            </div>
          </div>

          <Segmented
            block
            value={readMode}
            onChange={(value) => handleReadModeChange(String(value))}
            options={[
              {
                label: (
                  <div className="workflow-panel__segmented-item">
                    <Table2 size={14} />
                    <span>表列表</span>
                  </div>
                ),
                value: "table",
              },
              {
                label: (
                  <div className="workflow-panel__segmented-item">
                    <FileCode2 size={14} />
                    <span>自定义 SQL</span>
                  </div>
                ),
                value: "sql",
              },
            ]}
          />
          {readMode === "table" ? (
            <div className="workflow-panel__field workflow-panel__field--full">
              {/* <div className="workflow-panel__label">来源表</div> */}
              <Select
                value={sourceTable}
                onChange={(value) => updateNode({ sourceTable: value })}
                options={tableOptions}
                placeholder="请选择来源表"
                className="workflow-panel__antd-select"
                style={{ width: "100%" }}
                popupClassName="workflow-panel__dropdown"
                showSearch
                optionFilterProp="label"
              />
            </div>
          ) : (
            <div className="workflow-panel__field workflow-panel__field--full">
              {/* <div className="workflow-panel__label">SQL 语句</div> */}
              <TextArea
                value={sql}
                onChange={(e) => updateNode({ sql: e.target.value })}
                placeholder="请输入自定义 SQL，例如：SELECT * FROM user_info"
                autoSize={{ minRows: 5, maxRows: 12 }}
                className="workflow-panel__antd-textarea"
              />
            </div>
          )}
        </div>

        <div className="workflow-panel__divider" />

        <div className="workflow-panel__group">
          <ExtraParamsConfig
            params={extraParams}
            onParamsChange={(params) => updateNode({ extraParams: params })}
            selectedNode={selectedNode}
            hideHeader
          />
        </div>
      </section>
    </PanelShell>
  );
}

export default memo(SourcePanel);
