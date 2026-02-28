import { Dropdown, Form, Layout, Menu, message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  MiniMap,
  ReactFlowProvider,
  SelectionMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "./index.less";
import styles from "./index.less";
import LeftSider from "./sider";

import WorkflowPanel from "./panel";

import { ControlMode } from "./config";

import CustomEdge from "./edge";
import CustomNode from "./nodes";
import { ControlPanel } from "./operator/ControlPanel";
import RunLog from "./run/index";
import WholeSync from "./whole";

const nodeTypesConfig = {
  ["custom"]: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1;

function FlowComponent({ form, params, goBack }) {
  const { getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const [controlMode, setControlMode] = useState<string>(ControlMode.Pointer);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 切换控制模式
  const toggleControlMode = useCallback((mode: string) => {
    setControlMode(mode);
  }, []);

  const [draggingNode, setDraggingNode] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlacingNode, setIsPlacingNode] = useState(false);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [runVisible, setRunVisible] = useState(false);

  const handleNodeDragStart = useCallback(
    (id: any, nodeData: any) => {
      const previewNode = {
        id: id,
        type: "custom",
        position: { x: mousePosition.x, y: mousePosition.y },
        data: { ...nodeData, isPreview: true, type: "source" },
        draggable: true,
        selectable: true,
      };

      setDraggingNode(previewNode);
      setIsPlacingNode(true);
      setControlMode(ControlMode.Pointer);
      setNodes((nds) => [...nds, previewNode]);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleCanvasClick);
    },
    [mousePosition]
  );

  const addDefault = () => {
    // 给源节点和目标节点设置不同的位置
    const sourcePosition = { x: 0, y: 150 }; // 左边位置
    const sinkPosition = { x: 300, y: 150 }; // 右边位置
    const sourceId = `source-${Date.now()}`;
    const sourceNode = {
      id: sourceId,
      type: "custom",
      position: sourcePosition,
      data: {
        title: params?.sourceType?.dbType,
        plugin_output: sourceId,
        nodeType: "source",
        dbType: params?.sourceType?.dbType,
        type: params?.sourceType?.dbType,
        isPreview: false,
        connectorType: params?.sourceType?.connectorType,
      },
      draggable: true,
      selectable: true,
    };
    const sinkId = `sink-${Date.now()}`;
    const sinkNode = {
      id: sinkId,
      type: "custom",
      position: sinkPosition,
      data: {
        title: params?.targetType?.dbType,
        plugin_input: sinkId,
        nodeType: "sink",
        dbType: params?.targetType?.dbType,
        type: params?.targetType?.dbType,
        isPreview: false,
        connectorType: params?.targetType?.connectorType,
      },
      draggable: true,
      selectable: true,
    };
    // 同时添加两个节点
    setNodes([sourceNode, sinkNode]);

    // 创建连接边
    const newEdge = {
      id: `edge-${sourceNode.id}-${sinkNode.id}`,
      source: sourceNode.id,
      target: sinkNode.id,
      type: "custom",
      data: {},
    };

    // 添加边连接两个节点
    setEdges([newEdge]);
  };

  useEffect(() => {
    if (params?.jobDefinitionInfo !== undefined) {
      // leftBar
      form.setFieldsValue({
        jobName: params?.jobName,
        jobDesc: params?.jobDesc,
        clientId: params?.clientId,
      });

      if (params?.wholeSync === false) {
        const contentInfo = JSON.parse(params?.jobDefinitionInfo);
        const nodes = contentInfo?.nodes || [];
        const edges = contentInfo?.edges || [];
        setNodes(nodes);
        setEdges(edges);
      }
    }
  }, [params]);

  const didFitViewRef = useRef(false);

  useEffect(() => {
    if (nodes.length > 0 && !didFitViewRef.current) {
      didFitViewRef.current = true;

      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          duration: 0,
        });
      }, 0);
    }
  }, [nodes]);

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingNode || !reactFlowWrapper.current || !reactFlowInstance)
        return;

      // 获取画布位置
      const flowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // 计算相对于画布的位置
      const position = reactFlowInstance.project({
        x: e.clientX - flowBounds.left,
        y: e.clientY - flowBounds.top,
      });

      // 更新鼠标位置
      setMousePosition(position);

      // 更新预览节点位置
      if (draggingNode) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === draggingNode.id ? { ...node, position } : node
          )
        );
      }
    },
    [draggingNode, reactFlowInstance]
  );

  // 处理画布点击放置节点
  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (!draggingNode || !isPlacingNode) return;

      // 防止重复点击
      if (e.target && (e.target as HTMLElement).closest(".react-flow__node")) {
        return;
      }

      // 创建正式节点
      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "custom",
        position: mousePosition,
        data: { ...draggingNode.data, isPreview: false },
        draggable: true,
        selectable: true,
      };

      // 添加正式节点
      setNodes((nds) => {
        // 移除预览节点
        const filteredNodes = nds.filter((node) => node.id !== draggingNode.id);
        return [...filteredNodes, newNode];
      });

      // 清理状态
      cleanupDragging();
    },
    [draggingNode, mousePosition, isPlacingNode]
  );

  // 清理拖拽状态
  const cleanupDragging = useCallback(() => {
    setDraggingNode(null);
    setIsPlacingNode(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("click", handleCanvasClick);
  }, []);

  // 按ESC取消放置
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlacingNode) {
        // 移除预览节点
        setNodes((nds) => nds.filter((node) => node.id !== draggingNode?.id));
        cleanupDragging();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlacingNode, draggingNode]);

  useEffect(() => {
    if (isPlacingNode) {
      document.body.style.cursor = "crosshair";
    } else {
      document.body.style.cursor = "";
    }

    return () => {
      document.body.style.cursor = "";
    };
  }, [isPlacingNode]);

  const onNodeMouseEnter = useCallback((event, node) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          // 保存原始颜色（如果尚未保存）
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
            style: { ...edge.style, stroke: "#155aef" },
          };
        }
        return edge;
      })
    );
  }, []);

  const onNodeMouseLeave = useCallback((event, node) => {
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
  }, []);

  // 辅助函数
  const getStatusColor = (status) => {
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

  const [nodesReadOnly, setNodesReadOnly] = useState(false);
  const [workflowReadOnly, setWorkflowReadOnly] = useState(false);
  const [interactionMode, setInteractionMode] = useState(ControlMode.Pointer);
  const [selectedNode, setSelectedNode] = useState(null);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    const styleId = "reactflow-cursor-override";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // 根据模式设置不同的 CSS
    const css =
      controlMode === ControlMode.Hand
        ? `
        .react-flow__pane {
          cursor: grab !important;
        }
        .react-flow__pane:active {
          cursor: grabbing !important;
        }
      `
        : `
        .react-flow__pane {
          cursor: default !important;
        }
   
      `;

    styleElement.innerHTML = css;

    return () => {
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [controlMode]);

  const isValidConnection = useCallback((connection: any) => {
    // 这里可以添加自定义的连接验证逻辑
    return true;
  }, []);

  const onConnect = useCallback((connection: any) => {
    const nodes = getNodes();
    const edges = getEdges();

    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    const isTransform =
      (sourceNode && sourceNode.data.nodeType === "transform") ||
      (targetNode && targetNode.data.nodeType === "transform");

    if (!sourceNode || !targetNode) return;

    if (isTransform) {
      // 检查上游节点（目标节点是否已经有上游）
      const hasIncoming = edges.some((e) => e.target === targetNode.id);
      if (hasIncoming) {
        message.warning("Transform 节点只能有一个上游节点");
        return;
      }

      // 检查下游节点（源节点是否已经有下游）
      const hasOutgoing = edges.some((e) => e.source === sourceNode.id);
      if (hasOutgoing) {
        message.warning("Transform 节点只能有一个下游节点");
        return;
      }
    }

    if (isValidConnection(connection)) {
      setEdges((eds) => addEdge(connection, eds));
    }
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setDrawerVisible(true);
  }, []);

  const [menuVisible, setMenuVisible] = useState(false);

  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setSelectedNode(node);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

  const onSelectionContextMenu = useCallback((event, { nodes, edges }) => {
    if (nodes.length > 0) {
      event.preventDefault();
      setSelectedNodes(nodes);
      setMenuPosition({ x: event.clientX, y: event.clientY });
      setMenuVisible(true);
    }
  }, []);

  const [drawerVisible, setDrawerVisible] = useState(false);

  const deleteConnections = useCallback(
    (direction, nodes) => {
      const nodesToProcess =
        nodes || (selectedNode ? [selectedNode] : selectedNodes);

      if (!nodesToProcess || nodesToProcess.length === 0) {
        message.warning("请先选择节点");
        return;
      }

      const nodeIds = nodesToProcess.map((node) => node.id);

      setEdges((eds) => {
        let edgesToDelete = [];

        if (direction === "left") {
          // 删除所有选中节点的入边
          edgesToDelete = eds.filter((edge) => nodeIds.includes(edge.target));
        } else if (direction === "right") {
          // 删除所有选中节点的出边
          edgesToDelete = eds.filter((edge) => nodeIds.includes(edge.source));
        } else if (direction === "both") {
          // 删除所有选中节点的所有连接
          edgesToDelete = eds.filter(
            (edge) =>
              nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
          );
        }

        if (edgesToDelete.length === 0) {
          message.warning(`选中的节点没有${getDirectionText(direction)}边`);
          return eds;
        }

        const newEdges = eds.filter((edge) => !edgesToDelete.includes(edge));
        message.success(
          `已删除 ${edgesToDelete.length} 条${getDirectionText(direction)}边`
        );
        return newEdges;
      });
      setDrawerVisible(false);
    },
    [selectedNode, selectedNodes]
  );

  // 辅助函数
  const getDirectionText = (direction) => {
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

  // 在右键菜单中使用
  const handleContextMenuAction = ({ key }, node) => {
    const nodesToDelete = node ? [node] : selectedNodes;

    switch (key) {
      case "delete":
        setNodes(
          nodes.filter((n) => !nodesToDelete.some((sn) => sn.id === n.id))
        );
        setEdges(
          edges.filter(
            (e) =>
              !nodesToDelete.some((n) => e.source === n.id || e.target === n.id)
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
        const newNodes = nodesToDelete.map((node, index) => {
          const newNodeId = `${nodes.length + index + 1}-${Date.now()}`;
          return {
            ...node,
            id: newNodeId,
            position: {
              x: node.position.x + 50 * (index + 1),
              y: node.position.y + 50 * (index + 1),
            },
            data: {
              ...node.data,
              label: `${node.data.label} (副本)`,
            },
          };
        });
        setNodes((nds) => nds.concat(newNodes));
        message.success(`已复制 ${newNodes.length} 个节点`);
        break;
      case "edit":
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

    const baseItems = [{ key: "duplicate", label: "复制节点" }];

    const connectionItems = [];

    if (hasLeftConnections) {
      connectionItems.push({
        key: "delete_left_connections",
        label: `删除入边${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
      });
    }

    if (hasRightConnections) {
      connectionItems.push({
        key: "delete_right_connections",
        label: `删除出边${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
      });
    }

    if (hasAnyConnections) {
      connectionItems.push({
        key: "delete_all_connections",
        label: `删除所有连接${
          targetNodes.length > 1 ? `(${targetNodes.length})` : ""
        }`,
        danger: true,
      });
    }

    const deleteItem = {
      key: "delete",
      label: `删除节点${
        targetNodes.length > 1 ? `(${targetNodes.length})` : ""
      }`,
      danger: true,
    };

    // 如果有连接相关操作，添加分隔线
    const items = [...baseItems];
    if (connectionItems.length > 0) {
      items.push({ type: "divider" });
      items.push(...connectionItems);
    }
    items.push({ type: "divider" });
    items.push(deleteItem);

    return (
      <Menu
        onClick={(e) => handleContextMenuAction(e, selectedNode)}
        items={items}
      />
    );
  };

  const onCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
  }, []);

  const handleNodeDataChange = (nodeId: string, newData: any) => {

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div
      className={"relative h-full w-full min-w-[960px]"}
      style={{
        height: "100%",
        width: "100%",
        cursor: controlMode === ControlMode.Hand ? "grab" : "default",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypesConfig}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        onSelectionContextMenu={onSelectionContextMenu}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneContextMenu={onPaneContextMenu}
        isValidConnection={isValidConnection}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        nodesDraggable={
          !nodesReadOnly && interactionMode === ControlMode.Pointer
        }
        nodesConnectable={!nodesReadOnly}
        nodesFocusable={!nodesReadOnly}
        edgesFocusable={!nodesReadOnly}
        panOnDrag={controlMode === ControlMode.Hand ? true : false}
        zoomOnPinch={!workflowReadOnly}
        zoomOnScroll={!workflowReadOnly}
        zoomOnDoubleClick={!workflowReadOnly}
        selectionOnDrag={
          interactionMode === ControlMode.Pointer && !workflowReadOnly
        }
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.25,
          maxZoom: 0.75,
        }}
        // 关键：添加自定义类名
        className={`reactflow-wrapper ${
          controlMode === ControlMode.Hand ? "hand-mode" : "pointer-mode"
        }`}
      >
        <Background gap={[14, 14]} size={2} color="#8585ad26" />

        <MiniMap
          position="bottom-left"
          style={{
            width: 102,
            height: 72,
          }}
          maskColor="#E9EBF0"
        />
        <ControlPanel
          controlMode={controlMode}
          onControlModeChange={toggleControlMode}
          onNodeDragStart={handleNodeDragStart}
          nodes={nodes}
          edges={edges}
          baseForm={form}
          goBack={goBack}
          setRunVisible={setRunVisible}
          runVisible={runVisible}
        />
      </ReactFlow>

      <Dropdown
        overlay={renderContextMenu()}
        open={menuVisible}
        onOpenChange={closeContextMenu}
        trigger={["contextMenu"]}
      >
        <div
          style={{
            position: "fixed",
            left: menuPosition.x,
            top: menuPosition.y,
            width: "1px",
            height: "1px",
          }}
        />
      </Dropdown>

      {drawerVisible && (
        <WorkflowPanel
          selectedNode={selectedNode}
          onClose={onCloseDrawer}
          onNodeDataChange={handleNodeDataChange}
        />
      )}

      {runVisible && (
        <RunLog
          setRunVisible={setRunVisible}
          runVisible={runVisible}
          nodes={nodes}
          edges={edges}
          baseForm={form}
        />
      )}
    </div>
  );
}

export default function WorkflowBasic({
  params,
  goBack,
  sourceType,
  setSourceType,
  targetType,
  setTargetType,
  setParams,
}) {
  const [form] = Form.useForm();

  // 👀 监听 wholeSync 字段
  const wholeSync = Form.useWatch("wholeSync", form);

  const generateDefault = () => {
    const sourcePosition = { x: 0, y: 150 }; // 左边位置
    const sinkPosition = { x: 300, y: 150 }; // 右边位置
    const sourceId = `source-${Date.now()}`;
    const sourceNode = {
      id: sourceId,
      type: "custom",
      position: sourcePosition,
      data: {
        title: sourceType?.dbType,
        plugin_output: sourceId,
        nodeType: "source",
        dbType: sourceType?.dbType,
        type: sourceType?.dbType,
        isPreview: false,
        pluginName: sourceType?.pluginName,
        connectorType: sourceType?.connectorType,
      },
      draggable: true,
      selectable: true,
    };
    const sinkId = `sink-${Date.now()}`;
    const sinkNode = {
      id: sinkId,
      type: "custom",
      position: sinkPosition,
      data: {
        title: targetType?.dbType,
        plugin_input: sinkId,
        nodeType: "sink",
        dbType: targetType?.dbType,
        type: targetType?.dbType,
        isPreview: false,
        pluginName: targetType?.pluginName,
        connectorType: targetType?.connectorType,
      },
      draggable: true,
      selectable: true,
    };

    const nodes = [sourceNode, sinkNode];
    const newEdge = {
      id: `edge-${sourceNode.id}-${sinkNode.id}`,
      source: sourceNode.id,
      target: sinkNode.id,
      type: "custom",
      data: {},
    };
    const edges = [newEdge];
    return JSON.stringify({
      nodes: nodes,
      edges: edges,
    });
  };

  useEffect(() => {
    if (wholeSync === false) {
      const jobInfo = params?.jobDefinitionInfo;
      console.log(jobInfo);
      if(jobInfo === undefined || jobInfo === null) {
        goBack();
        return;
      }
      const jobObj = JSON.parse(jobInfo || "{}");
      if ("source" in jobObj) {
        setParams((prev: any) => ({
          ...prev,
          wholeSync: wholeSync,
          jobDefinitionInfo: generateDefault(),
        }));
      }
    }
  }, [wholeSync]);

  return (
    <Layout className={styles.layout}>
      <LeftSider params={params} form={form} />

      <div
        style={{
          height: "calc(100vh - 56px)",
          width: "calc(100vw - 12px)",
        }}
      >
        {wholeSync ? (
          <div>
            <WholeSync goBack={goBack} baseForm={form} />
          </div>
        ) : (
          <ReactFlowProvider>
            <FlowComponent form={form} params={params} goBack={goBack} />
          </ReactFlowProvider>
        )}
      </div>
    </Layout>
  );
}
