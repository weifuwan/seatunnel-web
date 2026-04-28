import { Form, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { seatunnelClientApi, SeatunnelClientMetrics } from "../api";
import { useClientMonitoring } from "./useClientMonitoring";
import { getHealthMeta } from "../utils";

export function useClientPageState() {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    reloadClients,
  } = useClientMonitoring();

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [metrics, setMetrics] = useState<SeatunnelClientMetrics>({});
  const [form] = Form.useForm();

  const healthMeta = useMemo(
    () => getHealthMeta(selectedClient?.healthStatus),
    [selectedClient?.healthStatus]
  );

  const handleCreateClient = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const res = await seatunnelClientApi.saveOrUpdate(values);
      if (res.code !== 0) {

        return;
      }

      message.success("Client 创建成功");
      setOpenAddModal(false);
      form.resetFields();
      await reloadClients();
    } catch (error: any) {
      if (error?.errorFields) return;

    } finally {
      setConfirmLoading(false);
    }
  };

  const loadClientMetrics = async (clientId?: number) => {
    if (!clientId) {
      setMetrics({});
      return;
    }

    try {
      setMetricsLoading(true);

      const res = await seatunnelClientApi.metrics(clientId);
      if (res.code !== 0) {

        return;
      }

      setMetrics({
        cpuUsage: res.data?.cpuUsage,
        memoryUsage: res.data?.memoryUsage,
        threadCount: res.data?.threadCount,
        runningOps: res.data?.runningOps,
      });
    } catch (error: any) {

      setMetrics({});
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    loadClientMetrics(selectedClientId);
  }, [selectedClientId]);

  return {
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    reloadClients,

    confirmLoading,
    metricsLoading,
    openAddModal,
    setOpenAddModal,
    metrics,
    form,
    healthMeta,

    handleCreateClient,
    loadClientMetrics,
  };
}