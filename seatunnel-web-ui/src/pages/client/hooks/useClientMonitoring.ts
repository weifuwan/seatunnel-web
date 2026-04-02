import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { SeatunnelClient, seatunnelClientApi } from "../api";


export const useClientMonitoring = () => {
  const [clients, setClients] = useState<SeatunnelClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);

      const res = await seatunnelClientApi.page({
        pageNo: 1,
        pageSize: 100,
      });

      if (res.code !== 0) {
        message.error(res.message || "获取 Client 列表失败");
        return;
      }

      const records = res?.data?.records || res?.data?.list || [];
      setClients(records);

      setSelectedClientId((prev) => {
        if (prev && records.some((item: SeatunnelClient) => item.id === prev)) {
          return prev;
        }
        return records?.[0]?.id;
      });
    } catch (error: any) {
      message.error(error?.message || "获取 Client 列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === selectedClientId) || clients[0],
    [clients, selectedClientId]
  );

  // const health = useMemo(() => getHealthInfo(selectedClient), [selectedClient]);
  // const trendBars = useMemo(() => buildTrendBars(selectedClient), [selectedClient]);
  // const resourceUsageData = useMemo(
  //   () => buildResourceUsageData(selectedClient),
  //   [selectedClient]
  // );
  // const recentEvents = useMemo(
  //   () => buildRecentEvents(selectedClient, health),
  //   [selectedClient, health]
  // );
  // const criticalAlerts = useMemo(
  //   () => buildCriticalAlerts(selectedClient),
  //   [selectedClient]
  // );

  return {
    clients,
    loading,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    reloadClients: loadClients,
  };
};