import { Button, Divider, Input, InputNumber, Segmented, Select, Tooltip } from "antd";
import { BarChart3, Clock3, Database, Eye } from "lucide-react";
import { memo, useMemo, useRef } from "react";
import PanelShell from "../PanelShell";
import ExtraParamsConfig from "./ExtraParamsConfig";

import QualityDetail from "@/pages/batch-link-up/DataViewSQL";
import { useSourcePanelLogic } from "./hooks/useSourcePanelLogic";
import "./index.less";

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  scheduleConfig: any;
}

const STARTUP_MODE_OPTIONS = [
  {
    label: "initial",
    value: "initial",
    shortDesc: "全量 + 增量",
    desc: "先同步历史全量数据，再继续同步增量 binlog",
  },
  {
    label: "latest",
    value: "latest",
    shortDesc: "仅新增变更",
    desc: "从最新 binlog 位点开始，只同步启动后的新增变更",
  },
  {
    label: "specific",
    value: "specific",
    shortDesc: "指定 binlog",
    desc: "从指定 binlog 文件和 position 开始同步",
  },
  {
    label: "timestamp",
    value: "timestamp",
    shortDesc: "指定时间戳",
    desc: "从指定时间戳开始同步",
  },
];

function SourcePanel({
  selectedNode,
  onClose,
  onNodeDataChange,
  scheduleConfig,
}: Props) {
  const qualityDetailRef = useRef<any>(null);

  const {
    title,
    dbType,
    description,
    dataSourceId,
    table,
    extraParams,

    dataSourceOptions,
    tableOptions,
    tableLoading,

    updateNode,
    handleDataSourceChange,
    handlePreview,
    viewLoading,
    handleResolveColumns,
  } = useSourcePanelLogic({
    selectedNode,
    onNodeDataChange,
    qualityDetailRef,
    scheduleConfig,
  });

  const sourceConfig = selectedNode?.data?.config || {};

  const startupMode = sourceConfig.startupMode || "initial";
  const startupSpecificOffsetFile = sourceConfig.startupSpecificOffsetFile || "";
  const startupSpecificOffsetPos = sourceConfig.startupSpecificOffsetPos;
  const startupTimestamp = sourceConfig.startupTimestamp;

  const startupModeDesc = useMemo(() => {
    return (
      STARTUP_MODE_OPTIONS.find((item) => item.value === startupMode)?.desc ||
      "配置 CDC 启动读取位点"
    );
  }, [startupMode]);

  const resetSchemaMeta = {
    outputSchema: [],
    schemaStatus: "idle",
    schemaError: "",
  };

  const handleStartupModeChange = (value: string) => {
    updateNode(
      {
        startupMode: value,

        // 切换模式时清理无关字段，避免 HOCON 误带参数
        startupSpecificOffsetFile:
          value === "specific" ? startupSpecificOffsetFile : undefined,
        startupSpecificOffsetPos:
          value === "specific" ? startupSpecificOffsetPos : undefined,
        startupTimestamp: value === "timestamp" ? startupTimestamp : undefined,
      },
      undefined,
      resetSchemaMeta
    );
  };

  return (
    <>
      <PanelShell
        eyebrow="Source Config"
        title="来源配置"
        badge="CDC 输入节点"
        desc="修改后会实时同步到当前画布节点"
        heroTitle={title}
        heroDesc={description}
        heroTag="CDC SOURCE"
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

            <div className="workflow-panel__meta-card workflow-panel__meta-card--compact">
              <div className="workflow-panel__meta-icon">
                <Database size={16} />
              </div>

              <Select
                value={dataSourceId}
                onChange={handleDataSourceChange}
                options={dataSourceOptions}
                placeholder="请选择来源数据源"
                showSearch
                optionFilterProp="label"
                className="workflow-panel__antd-select"
                style={{ width: "100%" }}
                popupClassName="workflow-panel__dropdown"
              />
            </div>
          </div>

          <div className="workflow-panel__divider" />

          <div className="workflow-panel__group">
            <div
              className="workflow-panel__group-head"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <div className="workflow-panel__group-kicker">读取方式</div>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <Tooltip title="预览读取结果样例数据">
                  <Button
                    size="small"
                    type="text"
                    icon={<Eye size={14} />}
                    onClick={handlePreview}
                    loading={viewLoading}
                  >
                    预览
                  </Button>
                </Tooltip>

                <Divider
                  type="vertical"
                  style={{ padding: 0, margin: "0 4px" }}
                />

                <Tooltip title="解析当前 CDC 表结构字段">
                  <Button
                    onClick={handleResolveColumns}
                    size="small"
                    type="text"
                    icon={<BarChart3 size={14} />}
                  >
                    字段解析
                  </Button>
                </Tooltip>
              </div>
            </div>

            <Select
              value={table}
              onChange={(value) =>
                updateNode(
                  {
                    table: value,
                    tableNames: value ? [value] : [],
                  },
                  undefined,
                  resetSchemaMeta
                )
              }
              options={tableOptions}
              loading={tableLoading}
              placeholder="请选择需要 CDC 订阅的来源表"
              className="workflow-panel__antd-select"
              style={{ width: "100%" }}
              popupClassName="workflow-panel__dropdown"
              showSearch
              optionFilterProp="rawLabel"
            />
          </div>

          <div className="workflow-panel__divider" />

          <div className="workflow-panel__group">
            <div className="workflow-panel__group-head">
              <div>
                <div className="workflow-panel__group-kicker">启动模式</div>
                <div className="mt-1 text-xs text-slate-400">
                  {startupModeDesc}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-1">
                <Segmented
                  block
                  value={startupMode}
                  onChange={(value) => handleStartupModeChange(String(value))}
                  options={STARTUP_MODE_OPTIONS.map((item) => ({
                    value: item.value,
                    label: (
                      <div className="flex h-[54px] flex-col items-center justify-center px-1">
                        <span className="text-[13px] font-semibold leading-5">
                          {item.label}
                        </span>
                        <span className="mt-0.5 max-w-[92px] truncate text-[11px] leading-4 text-slate-400">
                          {item.shortDesc}
                        </span>
                      </div>
                    ),
                  }))}
                  className="workflow-panel__startup-segmented"
                />
              </div>

              {startupMode === "specific" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-slate-500">
                      Binlog 文件
                    </div>
                    <Input
                      value={startupSpecificOffsetFile}
                      placeholder="如 mysql-bin.000001"
                      onChange={(event) =>
                        updateNode({
                          startupSpecificOffsetFile: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 text-xs font-medium text-slate-500">
                      Binlog Position
                    </div>
                    <InputNumber
                      value={startupSpecificOffsetPos}
                      min={0}
                      placeholder="请输入 position"
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        updateNode({
                          startupSpecificOffsetPos: value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {startupMode === "timestamp" && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock3 size={13} />
                    启动时间戳
                  </div>

                  <InputNumber
                    value={startupTimestamp}
                    min={0}
                    placeholder="请输入毫秒时间戳，如 1714521600000"
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      updateNode({
                        startupTimestamp: value,
                      })
                    }
                  />
                </div>
              )}
            </div>
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

      <QualityDetail ref={qualityDetailRef} />
    </>
  );
}

export default memo(SourcePanel);