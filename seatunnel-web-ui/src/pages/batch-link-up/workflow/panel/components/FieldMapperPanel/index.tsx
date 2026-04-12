import { Button, Checkbox, Empty, Input, Select, Table } from "antd";
import { memo, useEffect, useMemo } from "react";
import PanelShell from "../PanelShell";

interface Props {
  selectedNode: any;
  onClose: () => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  getDirectUpstreamSchema: (nodeId: string) => any[];
  refreshNodeSchema: (nodeId: string) => void;
  refreshDownstreamSchemas: (nodeId: string) => void;
}

function FieldMapperPanel({
  selectedNode,
  onClose,
  onNodeDataChange,
  getDirectUpstreamSchema,
  refreshNodeSchema,
  refreshDownstreamSchemas,
}: Props) {
  const nodeId = selectedNode?.id;
  const title = selectedNode?.data?.title || selectedNode?.data?.label || "字段映射";
  const description =
    selectedNode?.data?.description || "配置输入字段与输出字段的对应关系";

  const mappings = selectedNode?.data?.config?.mappings || [];
  const passThroughUnmapped =
    selectedNode?.data?.config?.passThroughUnmapped ?? true;

  const upstreamSchema = useMemo(() => {
    if (!nodeId) return [];
    return getDirectUpstreamSchema(nodeId) || [];
  }, [nodeId, getDirectUpstreamSchema]);

  const inputSchema = selectedNode?.data?.meta?.inputSchema?.length
    ? selectedNode?.data?.meta?.inputSchema
    : upstreamSchema;

  const outputSchema = selectedNode?.data?.meta?.outputSchema || [];

  useEffect(() => {
    if (!nodeId) return;

    onNodeDataChange(nodeId, {
      meta: {
        inputSchema: upstreamSchema,
      },
    });
  }, [nodeId, upstreamSchema, onNodeDataChange]);

  const sourceFieldOptions = inputSchema.map((field: any) => ({
    label: field.type ? `${field.name} (${field.type})` : field.name,
    value: field.name,
  }));

  const handleAddMapping = () => {
    const nextMappings = [
      ...mappings,
      {
        id: `${Date.now()}`,
        sourceField: "",
        targetField: "",
        targetType: "",
        expression: "",
        enabled: true,
      },
    ];

    onNodeDataChange(nodeId, {
      config: {
        mappings: nextMappings,
      },
    });
  };

  const handleMappingChange = (id: string, patch: any) => {
    const nextMappings = mappings.map((item: any) =>
      item.id === id ? { ...item, ...patch } : item
    );

    onNodeDataChange(nodeId, {
      config: {
        mappings: nextMappings,
      },
    });
  };

  const handleDeleteMapping = (id: string) => {
    const nextMappings = mappings.filter((item: any) => item.id !== id);

    onNodeDataChange(nodeId, {
      config: {
        mappings: nextMappings,
      },
    });
  };

  const handleSyncUpstreamFields = () => {
    onNodeDataChange(nodeId, {
      meta: {
        inputSchema: upstreamSchema,
      },
    });
    refreshNodeSchema(nodeId);
  };

  const handleApplyMapping = () => {
    refreshNodeSchema(nodeId);
    refreshDownstreamSchemas(nodeId);
  };

  const columns = [
    {
      title: "启用",
      dataIndex: "enabled",
      width: 72,
      render: (_: any, record: any) => (
        <Checkbox
          checked={record.enabled !== false}
          onChange={(e) =>
            handleMappingChange(record.id, { enabled: e.target.checked })
          }
        />
      ),
    },
    {
      title: "来源字段",
      dataIndex: "sourceField",
      render: (_: any, record: any) => (
        <Select
          value={record.sourceField}
          onChange={(value) => {
            const sourceField = inputSchema.find((f: any) => f.name === value);
            handleMappingChange(record.id, {
              sourceField: value,
              targetField: record.targetField || value,
              targetType: record.targetType || sourceField?.type || "",
            });
          }}
          options={sourceFieldOptions}
          placeholder="请选择来源字段"
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="label"
        />
      ),
    },
    {
      title: "目标字段",
      dataIndex: "targetField",
      render: (_: any, record: any) => (
        <Input
          value={record.targetField}
          onChange={(e) =>
            handleMappingChange(record.id, { targetField: e.target.value })
          }
          placeholder="请输入目标字段名"
        />
      ),
    },
    {
      title: "目标类型",
      dataIndex: "targetType",
      width: 140,
      render: (_: any, record: any) => (
        <Input
          value={record.targetType}
          onChange={(e) =>
            handleMappingChange(record.id, { targetType: e.target.value })
          }
          placeholder="如 STRING"
        />
      ),
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 80,
      render: (_: any, record: any) => (
        <Button danger type="link" onClick={() => handleDeleteMapping(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <PanelShell
      eyebrow="Transform Config"
      title="字段映射"
      badge="处理节点"
      desc="基于上游输出字段配置映射关系"
      heroTitle={title}
      heroDesc={description}
      heroTag="FIELDMAPPER"
      onClose={onClose}
    >
      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">输入字段</div>
          <div className="workflow-panel__section-tip">
            共 {inputSchema.length} 个
          </div>
        </div>

        {inputSchema.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="未获取到上游字段，请先配置来源节点或同步上游字段"
          />
        ) : (
          <div className="workflow-panel__chips">
            {inputSchema.map((field: any) => (
              <span key={field.name} className="workflow-panel__chip">
                {field.name}
                {field.type ? ` · ${field.type}` : ""}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button onClick={handleSyncUpstreamFields}>同步上游字段</Button>
          <Checkbox
            checked={passThroughUnmapped}
            onChange={(e) =>
              onNodeDataChange(nodeId, {
                config: {
                  passThroughUnmapped: e.target.checked,
                },
              })
            }
          >
            透传未映射字段
          </Checkbox>
        </div>
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">映射关系</div>
          <div className="workflow-panel__section-tip">Field Mapper</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Button type="dashed" onClick={handleAddMapping}>
            添加映射
          </Button>
        </div>

        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={mappings}
          pagination={false}
        />
      </section>

      <section className="workflow-panel__section">
        <div className="workflow-panel__section-head">
          <div className="workflow-panel__section-title">输出字段预览</div>
          <div className="workflow-panel__section-tip">
            共 {outputSchema.length} 个
          </div>
        </div>

        <div className="workflow-panel__chips">
          {outputSchema.map((field: any) => (
            <span key={field.name} className="workflow-panel__chip">
              {field.name}
              {field.type ? ` · ${field.type}` : ""}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <Button type="primary" onClick={handleApplyMapping}>
            应用映射
          </Button>
        </div>
      </section>
    </PanelShell>
  );
}

export default memo(FieldMapperPanel);