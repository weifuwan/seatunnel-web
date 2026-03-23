import { useMemo, useState } from "react";

import {
  buildCriticalAlerts,
  buildResourceUsageData,
  buildRecentEvents,
  buildTrendBars,
  getHealthInfo,
} from "../utils";
import { mockClients } from "../mock";

export const useClientMonitoring = () => {
  const [clients] = useState(mockClients);
  const [selectedClientId, setSelectedClientId] = useState(mockClients[0].id);

  const selectedClient = useMemo(
    () => clients.find((item) => item.id === selectedClientId) || clients[0],
    [clients, selectedClientId]
  );

  const health = useMemo(() => getHealthInfo(selectedClient), [selectedClient]);
  const trendBars = useMemo(() => buildTrendBars(selectedClient), [selectedClient]);
  const resourceUsageData = useMemo(
    () => buildResourceUsageData(selectedClient),
    [selectedClient]
  );
  const recentEvents = useMemo(
    () => buildRecentEvents(selectedClient, health),
    [selectedClient, health]
  );
  const criticalAlerts = useMemo(
    () => buildCriticalAlerts(selectedClient),
    [selectedClient]
  );

  return {
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    health,
    trendBars,
    resourceUsageData,
    recentEvents,
    criticalAlerts,
  };
};