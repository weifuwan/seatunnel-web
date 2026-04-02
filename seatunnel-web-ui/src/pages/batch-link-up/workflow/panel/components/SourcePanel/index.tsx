import { BarChart3, Database, Eye, FileCode2, Table2 } from "lucide-react";
import { Button, Input, Segmented, Select, Tooltip } from "antd";
import { memo, useMemo } from "react";
import PanelShell from "../PanelShell";
import ExtraParamsConfig from "./ExtraParamsConfig";

const { TextArea } = Input;

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
}

function SourcePanel({ selectedNode, onClose, onNodeDataChange }: Props) {
  const nodeId = selectedNode?.id;
  const nodeData = selectedNode?.data || {};

  const title = nodeData?.title || "MYSQL";
  const dbType = nodeData?.dbType || "MYSQL";
  const description = nodeData?.description || "读取源端数据";

  const sourceDataSourceId = nodeData?.sourceDataSourceId;
  const readMode = nodeData?.readMode || "table";
  const sourceTable = nodeData?.sourceTable;
  const sql = nodeData?.sql || "";
  const extraParams = nodeData?.extraParams || [];

  const sourceDataSourceOptions = nodeData?.sourceDataSourceOptions || [];
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
      ...(value === "table"
        ? { sql: "" }
        : { sourceTable: undefined }),
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
      desc="配置来源数据源、读取方式、预览能力与额外参数。所有修改直接写回当前节点数据。"
      heroTitle={title}
      heroDesc={description}
      heroTag="SOURCE"
      dbType={dbType}
      onClose={onClose}
    >
      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">数据源</div>
          <div className="workflow-panel__section-tip">Source</div>
        </div>

        <div className="workflow-panel__stack">
          <div className="workflow-panel__field workflow-panel__field--full">
            <div className="workflow-panel__label">来源数据源</div>
            <Select
              value={sourceDataSourceId}
              onChange={handleDataSourceChange}
              options={sourceDataSourceOptions}
              placeholder="请选择来源数据源"
              className="workflow-panel__antd-select"
              popupClassName="workflow-panel__dropdown"
              showSearch
              optionFilterProp="label"
              size="large"
            />
          </div>

          <div className="workflow-panel__meta-card">
            <div className="workflow-panel__meta-icon">
              <Database size={16} />
            </div>
            <div className="workflow-panel__meta-content">
              <div className="workflow-panel__meta-title">
                {currentDataSource?.label || "暂未选择数据源"}
              </div>
              <div className="workflow-panel__meta-desc">
                {currentDataSource?.dbType || dbType || "数据库类型待确定"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">读取方式</div>
          <div className="workflow-panel__section-tip">Table / SQL</div>
        </div>

        <div className="workflow-panel__stack">
          <Segmented
            block
            size="large"
            value={readMode}
            onChange={(value) => handleReadModeChange(String(value))}
            options={[
              {
                label: (
                  <div className="workflow-panel__segmented-item">
                    <Table2 size={15} />
                    <span>表列表</span>
                  </div>
                ),
                value: "table",
              },
              {
                label: (
                  <div className="workflow-panel__segmented-item">
                    <FileCode2 size={15} />
                    <span>自定义 SQL</span>
                  </div>
                ),
                value: "sql",
              },
            ]}
          />

          {readMode === "table" ? (
            <div className="workflow-panel__field workflow-panel__field--full">
              <div className="workflow-panel__label">来源表</div>
              <Select
                value={sourceTable}
                onChange={(value) => updateNode({ sourceTable: value })}
                options={tableOptions}
                placeholder="请选择来源表"
                className="workflow-panel__antd-select"
                popupClassName="workflow-panel__dropdown"
                showSearch
                optionFilterProp="label"
                size="large"
              />
            </div>
          ) : (
            <div className="workflow-panel__field workflow-panel__field--full">
              <div className="workflow-panel__label">SQL 语句</div>
              <TextArea
                value={sql}
                onChange={(e) => updateNode({ sql: e.target.value })}
                placeholder="请输入自定义 SQL，例如：SELECT * FROM user_info"
                autoSize={{ minRows: 6, maxRows: 10 }}
                className="workflow-panel__antd-textarea"
              />
            </div>
          )}
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">数据操作</div>
          <div className="workflow-panel__section-tip">Preview</div>
        </div>

        <div className="workflow-panel__action-grid">
          <Tooltip title="预览读取结果样例数据">
            <Button
              icon={<Eye size={16} />}
              size="large"
              className="workflow-panel__action-btn"
              onClick={handlePreview}
            >
              数据预览
            </Button>
          </Tooltip>

          <Tooltip title="统计当前读取配置下的数据情况">
            <Button
              icon={<BarChart3 size={16} />}
              size="large"
              className="workflow-panel__action-btn"
              onClick={handleStatistics}
            >
              数据统计
            </Button>
          </Tooltip>
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">额外参数</div>
          <div className="workflow-panel__section-tip">Params</div>
        </div>

        <ExtraParamsConfig
          params={extraParams}
          onParamsChange={(params) => updateNode({ extraParams: params })}
          selectedNode={selectedNode}
        />
      </section>
    </PanelShell>
  );
}

export default memo(SourcePanel);