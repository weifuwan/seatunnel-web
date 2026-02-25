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
  const [connectionStatus, setConnectionStatus] = useState("C");
  const { getViewport } = useReactFlow();
  const stompClientRef = useRef<Client | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

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

  const isDuplicateMetric = (data: MetricsData): boolean => {
    if (!data.instanceId) return false;

    const cached = metricsCacheRef.current.get(data.instanceId);
    if (!cached) return false;

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

  const addLogEntry = (
    content: string,
    type: LogEntry["type"] = "log",
    data?: MetricsData
  ) => {
    const now = Date.now();
    const newEntry: LogEntry = {
      id: now,
      content,
      timestamp: new Date().toLocaleTimeString(),
      type,
      data,
      sortKey: now,
    };

    setLogEntries((prev) => {
      if (type === "metric" && data?.instanceId) {
        metricsCacheRef.current.set(data.instanceId, { data, timestamp: now });
      }

      const updated = [newEntry, ...prev];

      return updated.slice(0, 200);
    });
  };

  const handleMetricsData = (data: MetricsData) => {
    const now = Date.now();

    const metricsDataWithTime = {
      ...data,
      timestamp: now,
    };

    if (isDuplicateMetric(data)) {
      metricsCacheRef.current.set(data.instanceId, {
        data: metricsDataWithTime,
        timestamp: now,
      });
      return;
    }

    const vertexId = Object.keys(data.vertices)[0];
    if (vertexId) {
      const vertex = data.vertices[vertexId];
      const metricText = `Instance ${data.instanceId} - ${vertexId}: Read ${vertex.readRowCount} rows (${vertex.readQps} QPS), Write ${vertex.writeRowCount} rows (${vertex.writeQps} QPS), Status: ${vertex.status};`;
      addLogEntry(metricText, "metric", metricsDataWithTime);
    }
  };

  const scrollToBottom = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  };

  const CONNECT_TIMEOUT = 5000; // 10 秒
  let connectTimer: any = null;

  const connect = () => {
    setConnectionStatus("Connecting...");
    addLogEntry("Connecting WebSocket Server...", "log");

    const socket = new SockJS("http://192.168.1.115:9527/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,

      onConnect: () => {
        if (connectTimer) {
          clearTimeout(connectTimer);
          connectTimer = null;
        }

        setConnectionStatus("Connected");
        addLogEntry("WebSocket Connected", "log");

        const flowData = prepareDataForBackend();
        const leftSideParam = baseForm?.getFieldsValue();

        const params = {
          jobDefinitionInfo: JSON.stringify(flowData),
          ...leftSideParam,
        };

        seatunnelJobExecuteApi.executeadHoc(params).then((data) => {
          if (data.code !== 0) {
            addLogEntry(`Backend error?: ${data.message}`, "log");
          }
        });

        stompClient.subscribe("/topic/log/test", (message) => {
          try {
            const data = JSON.parse(message.body);
            data.type === "METRICS"
              ? handleMetricsData(data)
              : addLogEntry(JSON.stringify(data, null, 2), "log");
          } catch {
            addLogEntry(`Failed to parse message: ${message.body}`, "log");
          }
        });
      },

      onStompError: (error) => {
        clearTimeout(connectTimer);
        setConnectionStatus("Connection error");
        addLogEntry(`STOMP Error: ${error.headers.message}`, "log");
      },

      onWebSocketClose: () => {
        clearTimeout(connectTimer);
        setConnectionStatus("Disconnected");
        addLogEntry("WebSocket Closed", "log");
      },
    });

    connectTimer = setTimeout(() => {
      addLogEntry("WebSocket Connection timeout", "log");
      message.error("WebSocket Connection timeout");
      setConnectionStatus("Connection timeout");
      stompClient.deactivate();
    }, CONNECT_TIMEOUT);

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  const disconnect = () => {
    if (stompClientRef.current) {
      addLogEntry("Disconnecting WebSocket connection...", "log");
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setConnectionStatus("Disconnected");
      addLogEntry("WebSocket Disconnected", "log");

      metricsCacheRef.current.clear();
    }
  };

  useEffect(() => {
    if (runVisible === true) {
      connect();
    }

    return () => {
      if (stompClientRef.current) {
        disconnect();
      }
    };
  }, [runVisible]);

  useEffect(() => {
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

  const getLatestMetrics = (): MetricsData | null => {
    const metricEntries = logEntries.filter(
      (entry) => entry.type === "metric" && entry.data
    );

    if (metricEntries.length === 0) return null;

    const sortedEntries = [...metricEntries].sort(
      (a, b) => b.sortKey - a.sortKey
    );
    return sortedEntries[0]?.data || null;
  };

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

            {latestMetrics && <MetricsSummary data={latestMetrics} />}

            <LogList logs={sortedLogEntries} containerRef={logsContainerRef} />

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
