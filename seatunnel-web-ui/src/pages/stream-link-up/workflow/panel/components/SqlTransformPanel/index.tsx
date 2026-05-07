import { Button, Input } from "antd";
import { memo, useEffect, useMemo } from "react";
import PanelShell from "../PanelShell";

const { TextArea } = Input;

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;
}

function SqlTransformPanel({
  selectedNode,
  onClose,
  onNodeDataChange,
  getDirectUpstreamSchema,
  refreshNodeSchema,
  refreshDownstreamSchemas,
}: Props) {
  const nodeId = selectedNode?.id;
  const title = selectedNode?.data?.title || selectedNode?.data?.label || "SQL 脚本";
  const description =
    selectedNode?.data?.description || "支持自定义转换 SQL";

  const sql = selectedNode?.data?.config?.sql || "";

  const upstreamSchema = useMemo(() => {
    if (!nodeId) return [];
    return getDirectUpstreamSchema(nodeId) || [];
  }, [nodeId, getDirectUpstreamSchema]);

  useEffect(() => {
    if (!nodeId) return;

    onNodeDataChange(nodeId, {
      meta: {
        inputSchema: upstreamSchema,
      },
    });
  }, [nodeId, upstreamSchema, onNodeDataChange]);

  const handleApply = () => {
    refreshNodeSchema(nodeId);
    refreshDownstreamSchemas(nodeId);
  };

  return (
    <PanelShell
      eyebrow="Transform Config"
      title="SQL 转换"
      badge="处理节点"
      desc="基于上游字段编写自定义转换逻辑"
      heroTitle={title}
      heroDesc={description}
      heroTag="SQL"
      onClose={onClose}
    >
      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">上游字段</div>
          <div className="workflow-panel__section-tip">
            共 {upstreamSchema.length} 个
          </div>
        </div>

        <div className="workflow-panel__chips">
          {upstreamSchema.map((field: any) => (
            <span key={field.name} className="workflow-panel__chip">
              {field.name}
              {field.type ? ` · ${field.type}` : ""}
            </span>
          ))}
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">脚本配置</div>
          <div className="workflow-panel__section-tip">SQL</div>
        </div>

        <TextArea
          value={sql}
          onChange={(e) =>
            onNodeDataChange(nodeId, {
              config: {
                sql: e.target.value,
              },
            })
          }
          placeholder="请输入 SQL 转换脚本"
          autoSize={{ minRows: 8, maxRows: 16 }}
        />

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={handleApply}>
            应用脚本
          </Button>
        </div>
      </section>
    </PanelShell>
  );
}

export default memo(SqlTransformPanel);