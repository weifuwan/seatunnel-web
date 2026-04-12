import { Menu, message } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import { ControlMode } from "../config";

interface Props {
  form: any;
  params: any;
}

export default function useFlowBuilder({ form, params }: Props) {
  const { getNodes, getEdges, fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const [controlMode, setControlMode] = useState<string>(ControlMode.Pointer);
  const [nodesReadOnly] = useState(false);
  const [workflowReadOnly] = useState(false);
  const [interactionMode] = useState(ControlMode.Pointer);

  const [runVisible, setRunVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<any[]>([]);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const didFitViewRef = useRef(false);

  useEffect(() => {
    if (params?.jobDefinitionInfo !== undefined) {
      form.setFieldsValue({
        jobName: params?.jobName,
        jobDesc: params?.jobDesc,
        clientId: params?.clientId,
        syncMode: "DAG",
      });

      const contentInfo = JSON.parse(params?.jobDefinitionInfo || "{}");
      setNodes(contentInfo?.nodes || []);
      setEdges(contentInfo?.edges || []);
    }
  }, [params, form, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length > 0 && !didFitViewRef.current) {
      didFitViewRef.current = true;
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 0 });
      }, 0);
    }
  }, [nodes, fitView]);

  useEffect(() => {
    const styleId = "reactflow-cursor-override";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.innerHTML =
      controlMode === ControlMode.Hand
        ? `
          .react-flow__pane { cursor: grab !important; }
          .react-flow__pane:active { cursor: grabbing !important; }
        `
        : `
          .react-flow__pane { cursor: default !important; }
        `;

    return () => {
      styleElement?.remove();
    };
  }, [controlMode]);

  const addNode = useCallback(
    ({
      position,
      nodeType,
      label,
      componentType,
    }: {
      position: { x: number; y: number };
      nodeType: string;
      label: string;
      componentType: string;
    }) => {
      const id = `${nodeType}-${Date.now()}`;

      const buildTransformData = () => {
        if (componentType === "FIELDMAPPER") {
          return {
            label,
            title: label,
            description: "配置字段映射关系",
            nodeType,
            componentType,
            config: {
              mappings: [],
              passThroughUnmapped: true,
            },
            meta: {
              inputSchema: [],
              outputSchema: [],
              schemaStatus: "idle",
              schemaError: "",
            },
          };
        }

        if (componentType === "SQL") {
          return {
            label,
            title: label,
            description: "支持自定义查询逻辑",
            nodeType,
            componentType,
            config: {
              sql: "",
            },
            meta: {
              inputSchema: [],
              outputSchema: [],
              schemaStatus: "idle",
              schemaError: "",
            },
          };
        }

        return {
          label,
          nodeType,
          componentType,
          config: {},
          meta: {
            inputSchema: [],
            outputSchema: [],
            schemaStatus: "idle",
            schemaError: "",
          },
        };
      };

      const newNode = {
        id,
        type: "custom",
        position,
        data:
          nodeType === "transform"
            ? buildTransformData()
            : {
                label,
                nodeType,
                componentType,
              },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const toggleControlMode = useCallback((mode: string) => {
    setControlMode(mode);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "#296dff";
      case "succeeded":
        return "#17b26a";
      case "failed":
        return "#ff4d4f";
      case "pending":
        return "#faad14";
      default:
        return undefined;
    }
  };

  const onNodeMouseEnter = useCallback(
    (_: any, node: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            if (!edge.data?.originalStroke) {
              edge.data = {
                ...edge.data,
                originalStroke:
                  edge.style?.stroke ||
                  getStatusColor(edge.data?.executionStatus) ||
                  "#d0d5dc",
              };
            }
            return {
              ...edge,
              style: { ...edge.style, stroke: "hsl(231 48% 48%)" },
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  const onNodeMouseLeave = useCallback(
    (_: any, node: any) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke:
                  edge.data?.originalStroke ||
                  getStatusColor(edge.data?.executionStatus) ||
                  "#d0d5dc",
              },
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  const isValidConnection = useCallback(() => true, []);

  const onConnect = useCallback(
    (connection: any) => {
      const nodes = getNodes();
      const edges = getEdges();

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      const isTransform =
        (sourceNode && sourceNode.data.nodeType === "transform") ||
        (targetNode && targetNode.data.nodeType === "transform");

      if (!sourceNode || !targetNode) return;

      if (isTransform) {
        const hasIncoming = edges.some((e) => e.target === targetNode.id);
        if (hasIncoming) {
          message.warning("Transform 节点只能有一个上游节点");
          return;
        }

        const hasOutgoing = edges.some((e) => e.source === sourceNode.id);
        if (hasOutgoing) {
          message.warning("Transform 节点只能有一个下游节点");
          return;
        }
      }

      if (isValidConnection()) {
        setEdges((eds) => addEdge(connection, eds));
      }
    },
    [getNodes, getEdges, isValidConnection, setEdges]
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
    setDrawerVisible(true);
  }, []);

  const onNodeContextMenu = useCallback((event: any, node: any) => {
    event.preventDefault();
    setSelectedNodeId(node.id);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  const onSelectionChange = useCallback(({ nodes, edges }: any) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  const onSelectionContextMenu = useCallback((event: any, { nodes }: any) => {
    if (nodes.length > 0) {
      event.preventDefault();
      setSelectedNodes(nodes);
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setMenuVisible(true);
    }
  }, []);

  const getDirectionText = (direction: string) => {
    switch (direction) {
      case "left":
        return "入";
      case "right":
        return "出";
      case "both":
        return "连";
      default:
        return "";
    }
  };

  const deleteConnections = useCallback(
    (direction: string, nodesArg?: any[]) => {
      const nodesToProcess =
        nodesArg || (selectedNode ? [selectedNode] : selectedNodes);

      if (!nodesToProcess || nodesToProcess.length === 0) {
        message.warning("请先选择节点");
        return;
      }

      const nodeIds = nodesToProcess.map((node) => node.id);

      setEdges((eds) => {
        let edgesToDelete: any[] = [];

        if (direction === "left") {
          edgesToDelete = eds.filter((edge) => nodeIds.includes(edge.target));
        } else if (direction === "right") {
          edgesToDelete = eds.filter((edge) => nodeIds.includes(edge.source));
        } else if (direction === "both") {
          edgesToDelete = eds.filter(
            (edge) =>
              nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
          );
        }

        if (edgesToDelete.length === 0) {
          message.warning(`选中的节点没有${getDirectionText(direction)}边`);
          return eds;
        }

        message.success(
          `已删除 ${edgesToDelete.length} 条${getDirectionText(direction)}边`
        );
        return eds.filter((edge) => !edgesToDelete.includes(edge));
      });

      setDrawerVisible(false);
    },
    [selectedNode, selectedNodes, setEdges]
  );

  const handleContextMenuAction = ({ key }: any, node?: any) => {
    const nodesToDelete = node ? [node] : selectedNodes;

    switch (key) {
      case "delete":
        setNodes((nds) =>
          nds.filter((n) => !nodesToDelete.some((sn: any) => sn.id === n.id))
        );
        setEdges((eds) =>
          eds.filter(
            (e) =>
              !nodesToDelete.some(
                (n: any) => e.source === n.id || e.target === n.id
              )
          )
        );
        message.success(`已删除 ${nodesToDelete.length} 个节点`);
        setDrawerVisible(false);
        break;
      case "delete_left_connections":
        deleteConnections("left", nodesToDelete);
        break;
      case "delete_right_connections":
        deleteConnections("right", nodesToDelete);
        break;
      case "delete_all_connections":
        deleteConnections("both", nodesToDelete);
        break;
      case "duplicate":
        setNodes((nds) => {
          const newNodes = nodesToDelete.map((node: any, index: number) => ({
            ...node,
            id: `${nds.length + index + 1}-${Date.now()}`,
            position: {
              x: node.position.x + 50 * (index + 1),
              y: node.position.y + 50 * (index + 1),
            },
            data: {
              ...node.data,
              label: `${node.data.label} (副本)`,
            },
          }));
          message.success(`已复制 ${newNodes.length} 个节点`);
          return nds.concat(newNodes);
        });
        break;
      default:
        break;
    }

    closeContextMenu();
  };

  const renderContextMenu = () => {
    const targetNodes =
      selectedNodes.length > 0
        ? selectedNodes
        : selectedNode
        ? [selectedNode]
        : [];

    const hasLeftConnections = edges.some((edge) =>
      targetNodes.some((node) => edge.target === node.id)
    );
    const hasRightConnections = edges.some((edge) =>
      targetNodes.some((node) => edge.source === node.id)
    );
    const hasAnyConnections = hasLeftConnections || hasRightConnections;

    const items: any[] = [{ key: "duplicate", label: "复制节点" }];

    if (hasLeftConnections || hasRightConnections) {
      items.push({ type: "divider" });
    }

    if (hasLeftConnections) {
      items.push({
        key: "delete_left_connections",
        label: `删除入边${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
      });
    }

    if (hasRightConnections) {
      items.push({
        key: "delete_right_connections",
        label: `删除出边${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
      });
    }

    if (hasAnyConnections) {
      items.push({
        key: "delete_all_connections",
        label: `删除所有连接${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
        danger: true,
      });
    }

    items.push({ type: "divider" });
    items.push({
      key: "delete",
      label: `删除节点${
        targetNodes.length > 1 ? `(${targetNodes.length})` : ""
      }`,
      danger: true,
    });

    return (
      <Menu
        onClick={(e) => handleContextMenuAction(e, selectedNode)}
        items={items}
      />
    );
  };

  const onCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setSelectedNodeId(null);
  }, []);

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;

          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
              config: {
                ...(node.data?.config || {}),
                ...(newData?.config || {}),
              },
              meta: {
                ...(node.data?.meta || {}),
                ...(newData?.meta || {}),
              },
            },
          };
        })
      );
    },
    [setNodes]
  );

  const getDirectUpstreamNode = useCallback(
    (nodeId: string) => {
      const currentEdges = getEdges();
      const currentNodes = getNodes();

      const incomingEdge = currentEdges.find((edge) => edge.target === nodeId);
      if (!incomingEdge) return null;

      return (
        currentNodes.find((node) => node.id === incomingEdge.source) || null
      );
    },
    [getEdges, getNodes]
  );

  const getDirectUpstreamSchema = useCallback(
    (nodeId: string) => {
      const upstreamNode = getDirectUpstreamNode(nodeId);
      return upstreamNode?.data?.meta?.outputSchema || [];
    },
    [getDirectUpstreamNode]
  );

  const getDirectDownstreamNodes = useCallback(
    (nodeId: string) => {
      const currentEdges = getEdges();
      const currentNodes = getNodes();

      const targetIds = currentEdges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);

      return currentNodes.filter((node) => targetIds.includes(node.id));
    },
    [getEdges, getNodes]
  );

  const buildFieldMapperOutputSchema = (
    inputSchema: any[] = [],
    mappings: any[] = [],
    passThroughUnmapped = false
  ) => {
    const mappedFields = mappings
      .filter(
        (item) => item.enabled !== false && item.sourceField && item.targetField
      )
      .map((item) => {
        const sourceField = inputSchema.find(
          (f) => f.name === item.sourceField
        );

        return {
          name: item.targetField,
          type: item.targetType || sourceField?.type,
          nullable: sourceField?.nullable,
          comment: sourceField?.comment,
          originFieldName: item.sourceField,
        };
      });

    if (!passThroughUnmapped) {
      return mappedFields;
    }

    const mappedSourceNames = new Set(
      mappings
        .filter((item) => item.enabled !== false)
        .map((item) => item.sourceField)
    );

    const passthroughFields = inputSchema
      .filter((field) => !mappedSourceNames.has(field.name))
      .map((field) => ({
        ...field,
        originFieldName: field.name,
      }));

    return [...mappedFields, ...passthroughFields];
  };

  const refreshNodeSchema = useCallback(
    (nodeId: string) => {
      const currentNodes = getNodes();
      const node = currentNodes.find((item) => item.id === nodeId);
      if (!node) return;

      if (node.data?.nodeType === "transform") {
        const inputSchema = getDirectUpstreamSchema(nodeId);

        if (node.data?.componentType === "FIELDMAPPER") {
          const mappings = node.data?.config?.mappings || [];
          const passThroughUnmapped =
            node.data?.config?.passThroughUnmapped ?? true;

          const outputSchema = buildFieldMapperOutputSchema(
            inputSchema,
            mappings,
            passThroughUnmapped
          );

          handleNodeDataChange(nodeId, {
            meta: {
              inputSchema,
              outputSchema,
              schemaStatus: "success",
              schemaError: "",
            },
          });
        }

        if (node.data?.componentType === "SQL") {
          handleNodeDataChange(nodeId, {
            meta: {
              inputSchema,
              outputSchema: inputSchema, // 先占位，后面再接 SQL 解析
              schemaStatus: "success",
              schemaError: "",
            },
          });
        }
      }

      if (node.data?.nodeType === "sink") {
        const inputSchema = getDirectUpstreamSchema(nodeId);

        handleNodeDataChange(nodeId, {
          meta: {
            inputSchema,
            schemaStatus: "success",
            schemaError: "",
          },
        });
      }
    },
    [getNodes, getDirectUpstreamSchema, handleNodeDataChange]
  );

  const refreshDownstreamSchemas = useCallback(
    (nodeId: string) => {
      const downstreamNodes = getDirectDownstreamNodes(nodeId);

      downstreamNodes.forEach((node) => {
        refreshNodeSchema(node.id);
      });
    },
    [getDirectDownstreamNodes, refreshNodeSchema]
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    controlMode,
    setControlMode,
    toggleControlMode,
    nodesReadOnly,
    workflowReadOnly,
    interactionMode,
    runVisible,
    setRunVisible,
    drawerVisible,
    selectedNode,
    menuVisible,
    menuPosition,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeContextMenu,
    onPaneClick,
    onSelectionChange,
    onSelectionContextMenu,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onPaneContextMenu,
    isValidConnection,
    closeContextMenu,
    renderContextMenu,
    onCloseDrawer,
    handleNodeDataChange,
    screenToFlowPosition,
    addNode,
    getDirectUpstreamNode,
    getDirectUpstreamSchema,
    getDirectDownstreamNodes,
    refreshNodeSchema,
    refreshDownstreamSchemas,
  };
}
