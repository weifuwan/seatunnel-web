import { Client } from "@stomp/stompjs";
import { message } from "antd";
import type { FC } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import SockJS from "sockjs-client";
import { seatunnelJobExecuteApi } from "../../api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LogList } from "./components/LogList";
import { MetricsSummary } from "./components/MetricsSummary";
import "./index.less";
import { LogEntry, MetricsData } from "./types";

interface RunLogProps {
  setRunVisible: (value: boolean) => void;
  nodes?: any;
  edges?: any;
  runVisible?: boolean;
  baseForm?: any;
}

const RunLog: FC<RunLogProps> = ({
  setRunVisible,
  runVisible,
  nodes,
  baseForm,
  edges,
}) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [panelHeight, setPanelHeight] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("未连接");
  const { getViewport } = useReactFlow();
  const stompClientRef = useRef<Client | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // 用于去重的缓存
  const metricsCacheRef = useRef<
    Map<number, { data: MetricsData; timestamp: number }>
  >(new Map());

  const prepareDataForBackend = () => {
    const currentViewport = getViewport();
    return {
      nodes: nodes,
      edges: edges,
      viewport: currentViewport,
    };
  };

  // 检查是否重复的指标数据
  const isDuplicateMetric = (data: MetricsData): boolean => {
    if (!data.instanceId) return false;

    const cached = metricsCacheRef.current.get(data.instanceId);
    if (!cached) return false;

    // 检查数据是否相同
    const vertexId = Object.keys(data.vertices)[0];
    if (!vertexId) return false;

    const currentVertex = data.vertices[vertexId];
    const cachedVertex = cached.data.vertices[vertexId];

    if (!cachedVertex) return false;

    return (
      currentVertex.readRowCount === cachedVertex.readRowCount &&
      currentVertex.writeRowCount === cachedVertex.writeRowCount &&
      currentVertex.status === cachedVertex.status
    );
  };

  // 添加日志条目
  const addLogEntry = (
    content: string,
    type: LogEntry["type"] = "log",
    data?: MetricsData
  ) => {
    const now = Date.now();
    const newEntry: LogEntry = {
      id: now, // 使用时间戳作为ID，确保唯一性
      content,
      timestamp: new Date().toLocaleTimeString(),
      type,
      data,
      sortKey: now, // 使用精确的时间戳排序
    };

    setLogEntries((prev) => {
      // 去重逻辑：如果是metric类型，检查是否重复
      if (type === "metric" && data?.instanceId) {
        // 更新缓存
        metricsCacheRef.current.set(data.instanceId, { data, timestamp: now });
      }

      // 添加新条目并保持排序（最新的在前面）
      const updated = [newEntry, ...prev];

      // 限制总条目数，避免内存占用过多
      return updated.slice(0, 200);
    });
  };

  // 处理指标数据
  const handleMetricsData = (data: MetricsData) => {
    const now = Date.now();

    // 添加时间戳到数据中
    const metricsDataWithTime = {
      ...data,
      timestamp: now,
    };

    // 检查是否是重复数据
    if (isDuplicateMetric(data)) {
      // 如果是重复数据，只更新缓存但不添加日志
      metricsCacheRef.current.set(data.instanceId, {
        data: metricsDataWithTime,
        timestamp: now,
      });
      return;
    }

    // 提取指标信息
    const vertexId = Object.keys(data.vertices)[0];
    if (vertexId) {
      const vertex = data.vertices[vertexId];
      const metricText = `实例 ${data.instanceId} - ${vertexId}: 读取 ${vertex.readRowCount} 行 (${vertex.readQps} QPS), 写入 ${vertex.writeRowCount} 行 (${vertex.writeQps} QPS), 状态: ${vertex.status}`;

      // 只添加一条格式化的指标日志
      addLogEntry(metricText, "metric", metricsDataWithTime);
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  };

  // 连接 WebSocket
  const CONNECT_TIMEOUT = 5000; // 10 秒
  let connectTimer: any = null;

  const connect = () => {
    setConnectionStatus("连接中...");
    addLogEntry("正在连接 WebSocket 服务器...", "log");

    const socket = new SockJS("http://192.168.1.115:9527/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        // ✅ 成功连接，清除超时定时器
        if (connectTimer) {
          clearTimeout(connectTimer);
          connectTimer = null;
        }

        setConnectionStatus("已连接");
        addLogEntry("WebSocket 连接成功", "log");
        // message.success("WebSocket 连接成功");

        // 下面是你原来的逻辑
        const flowData = prepareDataForBackend();
        const leftSideParam = baseForm?.getFieldsValue();

        const params = {
          jobDefinitionInfo: JSON.stringify(flowData),
          ...leftSideParam,
        };

        seatunnelJobExecuteApi.executeadHoc(params).then(data => {
          if(data.code !== 0) {
            addLogEntry(`后端报错了: ${data.message}`, "log");
          }
        })

        stompClient.subscribe("/topic/log/test", (message) => {
          try {
            const data = JSON.parse(message.body);
            data.type === "METRICS"
              ? handleMetricsData(data)
              : addLogEntry(JSON.stringify(data, null, 2), "log");
          } catch {
            addLogEntry(`解析消息失败: ${message.body}`, "log");
          }
        });
      },

      onStompError: (error) => {
        clearTimeout(connectTimer);
        setConnectionStatus("连接错误");
        addLogEntry(`STOMP 错误: ${error.headers.message}`, "log");
      },

      onWebSocketClose: () => {
        clearTimeout(connectTimer);
        setConnectionStatus("已断开");
        addLogEntry("WebSocket 已关闭", "log");
      },
    });

    // ⏱ 启动连接超时兜底
    connectTimer = setTimeout(() => {
      addLogEntry("WebSocket 连接超时", "log");
      message.error("WebSocket 连接超时");
      setConnectionStatus("连接超时");
      stompClient.deactivate();
    }, CONNECT_TIMEOUT);

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // 断开连接
  const disconnect = () => {
    if (stompClientRef.current) {
      addLogEntry("正在断开WebSocket连接...", "log");
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setConnectionStatus("已断开");
      addLogEntry("WebSocket 连接已断开", "log");
      // 清空缓存
      metricsCacheRef.current.clear();
    }
  };

  useEffect(() => {
    if (runVisible === true) {
      connect();
    }

    // 清理函数
    return () => {
      if (stompClientRef.current) {
        disconnect();
      }
    };
  }, [runVisible]);

  useEffect(() => {
    // 当有新日志时自动滚动到底部
    scrollToBottom();
  }, [logEntries]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startY = e.clientY;
    const startHeight = panelHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.max(100, Math.min(600, startHeight + deltaY));
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 获取最新的指标数据（按时间倒序）
  const getLatestMetrics = (): MetricsData | null => {
    const metricEntries = logEntries.filter(
      (entry) => entry.type === "metric" && entry.data
    );

    if (metricEntries.length === 0) return null;

    // 按sortKey倒序排序，取最新的
    const sortedEntries = [...metricEntries].sort(
      (a, b) => b.sortKey - a.sortKey
    );
    return sortedEntries[0]?.data || null;
  };

  // 按时间倒序排列日志（最新的在前面）
  const sortedLogEntries = [...logEntries].sort(
    (a, b) => b.sortKey - a.sortKey
  );

  const latestMetrics = getLatestMetrics();

  return (
    <div tabIndex={-1} className="runLog">
      <div className="runLog-container">
        <div style={{ position: "relative", height: "100%" }}>
          <div
            style={{
              height: `calc(100% - ${panelHeight}px)`,
              background: "transparent",
            }}
          ></div>

          <div
            style={{
              height: "1px",
              background: isDragging ? "#1890ff" : "#e8e8e8",
              cursor: "row-resize",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseDown={handleMouseDown}
          >
            <div
              style={{
                width: "20px",
                height: "4px",
                background: isDragging ? "#1890ff" : "#999",
                borderRadius: "2px",
              }}
            ></div>
          </div>

          <div
            style={{
              height: `${panelHeight}px`,
              padding: "12px",
              background: "#fff",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Header
              connectionStatus={connectionStatus}
              latestMetrics={latestMetrics}
              onClose={() => setRunVisible(false)}
            />
            {/* 指标摘要面板 */}
            {latestMetrics && <MetricsSummary data={latestMetrics} />}

            {/* 日志显示区域 */}
            <LogList logs={sortedLogEntries} containerRef={logsContainerRef} />

            {/* 日志统计 */}
            <Footer
              total={sortedLogEntries.length}
              metricCount={metricsCacheRef.current.size}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RunLog);
