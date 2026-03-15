// RunLog.tsx（核心片段，你可以直接替换整个文件也行）
import { Client } from "@stomp/stompjs";
import { message } from "antd";
import type { FC } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import SockJS from "sockjs-client";
import { useLocation } from "umi";
import { seatunnelJobDefinitionApi, seatunnelJobExecuteApi } from "../../api";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LogList } from "./components/LogList";
import { MetricsSummary } from "./components/MetricsSummary";
import "./index.less";

type SeatunnelJobMetricsPO = {
  pipelineId: number;
  readRowCount: number;
  writeRowCount: number;
  readQps: number;
  writeQps: number;
  recordDelay: number;
  readBytes: number;
  writeBytes: number;
  readBps: number;
  writeBps: number;
  intermediateQueueSize: number;
  lagCount: number;
  lossRate: number;
  avgRowSize: number;
  status?: string;
};

export type MetricsMessage = {
  type: "METRICS";
  instanceId: number;
  engineId: string;
  timestamp: number;
  metrics: Record<string, SeatunnelJobMetricsPO>;
};

type LogEntryType = "log" | "metric" | "error";
type LogEntry = {
  id: number;
  content: string;
  timestamp: string;
  type: LogEntryType;
  data?: MetricsMessage;
  sortKey: number;
};

interface RunLogProps {
  setRunVisible: (value: boolean) => void;
  nodes?: any;
  edges?: any;
  runVisible?: boolean;
  baseForm?: any;
}

const RunLog: FC<RunLogProps> = ({ setRunVisible, runVisible, nodes, baseForm, edges }) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const idFromUrl = query.get("id");

  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [panelHeight, setPanelHeight] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("C");

  const { getViewport } = useReactFlow();
  const stompClientRef = useRef<Client | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const metricsCacheRef = useRef<Map<number, { data: MetricsMessage; timestamp: number }>>(new Map());

  const prepareDataForBackend = () => {
    const currentViewport = getViewport();
    return { nodes, edges, viewport: currentViewport };
  };

  const addLogEntry = (content: string, type: LogEntryType = "log", data?: MetricsMessage) => {
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
      if (type === "metric" && data?.instanceId != null) {
        metricsCacheRef.current.set(data.instanceId, { data, timestamp: now });
      }
      return [newEntry, ...prev].slice(0, 200);
    });
  };

  const getFirstPipeline = (metrics?: Record<string, SeatunnelJobMetricsPO>) => {
    if (!metrics) return null;
    const keys = Object.keys(metrics);
    if (!keys.length) return null;
    const k = keys.sort()[0];
    return metrics[k] || null;
  };

  const isDuplicateMetric = (data: MetricsMessage) => {
    const cached = metricsCacheRef.current.get(data.instanceId);
    if (!cached) return false;

    const curr = getFirstPipeline(data.metrics);
    const prev = getFirstPipeline(cached.data.metrics);
    if (!curr || !prev) return false;

    return (
      curr.readRowCount === prev.readRowCount &&
      curr.writeRowCount === prev.writeRowCount &&
      (curr.status ?? "") === (prev.status ?? "")
    );
  };

  const handleMetricsData = (data: MetricsMessage) => {
    const now = Date.now();
    const payload: MetricsMessage = { ...data, timestamp: now };

    if (isDuplicateMetric(payload)) {
      metricsCacheRef.current.set(payload.instanceId, { data: payload, timestamp: now });
      return;
    }

    const p = getFirstPipeline(payload.metrics);
    if (!p) {
      addLogEntry(`METRICS received but metrics map empty: ${JSON.stringify(payload)}`, "error");
      return;
    }

    addLogEntry(
      `Instance ${payload.instanceId} - Pipeline ${p.pipelineId}: ` +
        `Read ${p.readRowCount} (${p.readQps} QPS), ` +
        `Write ${p.writeRowCount} (${p.writeQps} QPS), ` +
        `Queue ${p.intermediateQueueSize};`,
      "metric",
      payload
    );
  };

  const scrollToBottom = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  };

  const CONNECT_TIMEOUT = 5000;
  let connectTimer: any = null;

  const connect = () => {
    setConnectionStatus("Connecting...");
    addLogEntry("Connecting WebSocket Server...", "log");

    const socket = new SockJS("http://127.0.0.1:9527/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket as any,

      onConnect: () => {
        if (connectTimer) clearTimeout(connectTimer);

        setConnectionStatus("Connected");
        addLogEntry("WebSocket Connected", "log");

        void prepareDataForBackend();
        void (baseForm?.getFieldsValue?.() || {});

        seatunnelJobDefinitionApi.selectById(idFromUrl).then((resp) => {
          if (resp?.code !== 0) {
            message.error("请先发布");
            addLogEntry("Job definition not published.", "error");
            return;
          }

          seatunnelJobExecuteApi.execute(idFromUrl).then((execResp) => {
            if (execResp?.code !== 0) {
              addLogEntry(`Backend execute error: ${execResp?.message || "unknown"}`, "error");
            }
          });

          stompClient.subscribe("/topic/log/test", (msg) => {
            let data: any;
            try {
              data = JSON.parse(msg.body);
            } catch {
              addLogEntry(`JSON parse failed: ${msg.body}`, "error");
              return;
            }

            try {
              if (data?.type === "METRICS") {
                handleMetricsData(data as MetricsMessage);
              } else {
                addLogEntry(JSON.stringify(data, null, 2), "log");
              }
            } catch (e: any) {
              addLogEntry(`Handle message failed: ${e?.message || String(e)}`, "error");
            }
          });
        });
      },

      onStompError: (error) => {
        if (connectTimer) clearTimeout(connectTimer);
        setConnectionStatus("Connection error");
        addLogEntry(`STOMP Error: ${error.headers?.message || "unknown"}`, "error");
      },

      onWebSocketClose: () => {
        if (connectTimer) clearTimeout(connectTimer);
        setConnectionStatus("Disconnected");
        addLogEntry("WebSocket Closed", "log");
      },
    });

    connectTimer = setTimeout(() => {
      addLogEntry("WebSocket Connection timeout", "error");
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
    if (runVisible === true) connect();
    return () => {
      if (stompClientRef.current) disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getLatestMetrics = (): MetricsMessage | null => {
    const metricEntries = logEntries.filter((e) => e.type === "metric" && e.data);
    if (!metricEntries.length) return null;
    return [...metricEntries].sort((a, b) => b.sortKey - a.sortKey)[0].data || null;
  };

  const sortedLogEntries = [...logEntries].sort((a, b) => b.sortKey - a.sortKey);
  const latestMetrics = getLatestMetrics();

  return (
    <div tabIndex={-1} className="runLog">
      <div className="runLog-container">
        <div style={{ position: "relative", height: "100%" }}>
          <div style={{ height: `calc(100% - ${panelHeight}px)`, background: "transparent" }} />

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
            />
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
              latestMetrics={latestMetrics || undefined}
              onClose={() => setRunVisible(false)}
            />

            {/* ✅ 没数据就不渲染，避免 Header/MetricsSummary 内 Object.values 崩 */}
            {latestMetrics ? <MetricsSummary data={latestMetrics} /> : null}

            <LogList logs={sortedLogEntries as any} containerRef={logsContainerRef} />

            <Footer total={sortedLogEntries.length} metricCount={metricsCacheRef.current.size} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RunLog);