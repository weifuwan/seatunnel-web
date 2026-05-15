import { Divider, message, Modal } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { history } from "umi";

import BottomActionBar from "./components/BottomActionBar";
import RealtimeHeader from "./components/RealtimeHeader";
import RealtimeTaskTable from "./components/RealtimeTaskTable";
import SearchToolbar from "./components/SearchToolbar";
import StreamingHelperSection from "./components/StreamingHelperSection";
import {
  seatunnelJobExecuteApi,
  seatunnelStreamingJobExecuteApi,
  seatunnelStremJobDefinitionApi,
} from "./api";

const REALTIME_DETAIL_CACHE_PREFIX = "stream-link-up-detail";

interface StreamingJobDefinitionVO {
  id: string | number;
  jobName?: string;
  jobDesc?: string;
  mode?: string;
  jobType?: string;
  clientId?: string | number;
  jobVersion?: number;
  releaseState?: "ONLINE" | "OFFLINE" | string | number;
  lastJobStatus?: string;
  instanceId?: string | number;
  sourceType?: string;
  sinkType?: string;
  sourceTable?: string;
  sinkTable?: string;
  sourceDatasourceId?: string | number;
  sinkDatasourceId?: string | number;
  createTime?: string;
  updateTime?: string;
  checkpointConfig?: string;
}

const RealtimeSyncPage: React.FC = () => {
  const [sourceType, setSourceType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "MySQL-CDC",
    pluginName: "MySQL-CDC",
  });

  const [sinkType, setSinkType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });

  const [keyword, setKeyword] = useState("");
  const [releaseState, setReleaseState] = useState<string>();
  const [sourceQueryType, setSourceQueryType] = useState<string>();
  const [sinkQueryType, setSinkQueryType] = useState<string>();

  const [dataSource, setDataSource] = useState<StreamingJobDefinitionVO[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const hasSelected = selectedRowKeys.length > 0;

  const queryParams = useMemo(() => {
    const params: any = {
      pageNo: current,
      pageSize,
    };

    if (keyword?.trim()) {
      params.jobName = keyword.trim();
    }

    if (releaseState) {
      params.releaseState = releaseState;
    }

    if (sourceQueryType) {
      params.sourceType = sourceQueryType;
    }

    if (sinkQueryType) {
      params.sinkType = sinkQueryType;
    }

    return params;
  }, [current, pageSize, keyword, releaseState, sourceQueryType, sinkQueryType]);

  const getPageRecords = (res: any) => {
    const payload = res?.data;

    const records = payload?.bizData || [];
    const nextTotal = payload?.pagination?.total;

    return {
      records,
      total: Number(nextTotal || 0),
    };
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await seatunnelStremJobDefinitionApi.page(queryParams);

      if (res?.code !== undefined && res.code !== 0) {
        message.error(res?.message || "查询实时任务列表失败");
        setDataSource([]);
        setTotal(0);
        return;
      }

      const { records, total: nextTotal } = getPageRecords(res);

      setDataSource(records || []);
      setTotal(nextTotal || 0);
    } catch (error) {
      message.error("查询实时任务列表失败");
      setDataSource([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!sourceType?.dbType) {
      message.warning("请选择来源类型");
      return;
    }

    if (!sinkType?.dbType) {
      message.warning("请选择去向类型");
      return;
    }

    try {
      setCreating(true);

      const data = await seatunnelStremJobDefinitionApi.getUniqueId();

      if (data?.code !== 0) {
        message.error(data?.message  || "获取实时任务ID失败");
        return;
      }

      const returnId = data?.data;

      if (!returnId) {
        message.error("创建实时任务失败：未获取到任务ID");
        return;
      }

      sessionStorage.setItem(
        `${REALTIME_DETAIL_CACHE_PREFIX}-${returnId}`,
        JSON.stringify({
          id: returnId,
          sourceType,
          targetType: sinkType,
        }),
      );

      history.push(`/sync/stream-link-up/${returnId}/detail`);
    } catch (error) {
      message.error("创建实时任务失败");
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setReleaseState(undefined);
    setSourceQueryType(undefined);
    setSinkQueryType(undefined);
    setCurrent(1);
    setSelectedRowKeys([]);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setCurrent(1);
    setSelectedRowKeys([]);
  };

  const handleReleaseStateChange = (value?: string) => {
    setReleaseState(value);
    setCurrent(1);
    setSelectedRowKeys([]);
  };

  const handleSourceTypeChange = (value?: string) => {
    setSourceQueryType(value);
    setCurrent(1);
    setSelectedRowKeys([]);
  };

  const handleSinkTypeChange = (value?: string) => {
    setSinkQueryType(value);
    setCurrent(1);
    setSelectedRowKeys([]);
  };

  const handleView = (record: StreamingJobDefinitionVO) => {
    history.push(`/sync/stream-link-up/${record.id}/detail?readonly=true`);
  };

  const handleEdit = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务 ID 不存在");
      return;
    }

    try {
      const res = await seatunnelStremJobDefinitionApi.selectEditDetail(record.id);

      if (res?.code !== 0) {
        message.error(res?.message || res?.msg || "查询编辑详情失败");
        return;
      }

      history.push(`/sync/stream-link-up/${record.id}/detail`);
    } catch (error) {
      message.error("查询编辑详情失败");
    }
  };

  const handleRun = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务 ID 不存在");
      return;
    }

    const isOnline = record.releaseState === "ONLINE" || record.releaseState === 1;

    if (!isOnline) {
      message.warning("请先上线任务，再执行运行操作");
      return;
    }

    try {
      const res = await seatunnelStreamingJobExecuteApi.execute(record.id);

      if (res?.code !== 0) {
        message.error(res?.msg || "运行实时任务失败");
        return;
      }

      message.success("实时任务已启动");
      loadData();
    } catch (error) {
      message.error("运行实时任务失败");
    }
  };

  const handleStop = async (record: StreamingJobDefinitionVO) => {
    if (!record?.instanceId) {
      message.warning("当前任务没有运行实例");
      return;
    }

    try {
      const res = await seatunnelStreamingJobExecuteApi.pause(record.instanceId);

      if (res?.code !== 0) {
        message.error( res?.msg || "停止实时任务失败");
        return;
      }

      message.success("实时任务已停止");
      loadData();
    } catch (error) {
      message.error("停止实时任务失败");
    }
  };

  const handleOnline = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务 ID 不存在");
      return;
    }

    try {
      const res = await seatunnelStremJobDefinitionApi.online(record.id);

      if (res?.code !== 0) {
        message.error(res?.message || res?.msg || "上线实时任务失败");
        return;
      }

      message.success("实时任务已上线");
      loadData();
    } catch (error) {
      message.error("上线实时任务失败");
    }
  };

  const handleOffline = async (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务 ID 不存在");
      return;
    }

    try {
      const res = await seatunnelStremJobDefinitionApi.offline(record.id);

      if (res?.code !== 0) {
        message.error(res?.message || res?.msg || "下线实时任务失败");
        return;
      }

      message.success("实时任务已下线");
      loadData();
    } catch (error) {
      message.error("下线实时任务失败");
    }
  };

  const handleDelete = (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务 ID 不存在");
      return;
    }

    Modal.confirm({
      title: "确认删除实时任务？",
      centered: true,
      content: (
        <span>
          删除后不可恢复：
          <span className="font-medium text-orange-500">
            {record.jobName || record.id}
          </span>
        </span>
      ),
      okText: "删除",
      cancelText: "取消",
      okButtonProps: {
        danger: true,
        size: "small",
      },
      cancelButtonProps: {
        size: "small",
      },
      async onOk() {
        try {
          const res = await seatunnelStremJobDefinitionApi.delete(String(record.id));

          if (res?.code !== 0) {
            message.error(res?.msg || "删除实时任务失败");
            return;
          }

          message.success("实时任务已删除");

          setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));

          if (dataSource.length === 1 && current > 1) {
            setCurrent(current - 1);
          } else {
            loadData();
          }
        } catch (error) {
          message.error("删除实时任务失败");
        }
      },
    });
  };

  const handleLog = (record: StreamingJobDefinitionVO) => {
    if (!record?.id) {
      message.warning("任务 ID 不存在");
      return;
    }

    /**
     * 这里先跳转到详情页的日志视图。
     * 如果你后面有独立实例页，可以改成：
     * history.push(`/sync/stream-link-up/${record.id}/instances`);
     */
    history.push(`/sync/stream-link-up/${record.id}/detail?tab=logs&readonly=true`);
  };

  const handleCheckpoint = (record: StreamingJobDefinitionVO) => {
    Modal.info({
      title: "检查点配置",
      centered: true,
      width: 720,
      content: (
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {record.checkpointConfig || "暂无检查点配置"}
        </pre>
      ),
      okText: "关闭",
    });
  };

  const handleBatchStart = async () => {
    if (!hasSelected) return;

    try {
      await Promise.all(
        selectedRowKeys.map((id) => seatunnelStremJobDefinitionApi.online(id)),
      );

      message.success(`已提交 ${selectedRowKeys.length} 个实时任务上线请求`);
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error("批量上线失败");
    }
  };

  const handleBatchStop = async () => {
    if (!hasSelected) return;

    try {
      await Promise.all(
        selectedRowKeys.map((id) => seatunnelStremJobDefinitionApi.offline(id)),
      );

      message.success(`已提交 ${selectedRowKeys.length} 个实时任务下线请求`);
      setSelectedRowKeys([]);
      loadData();
    } catch (error) {
      message.error("批量下线失败");
    }
  };

  return (
    <div className="min-h-screen px-6 pb-24 pt-7 text-slate-950">
      <RealtimeHeader
        sourceType={sourceType}
        sinkType={sinkType}
        onSourceChange={setSourceType}
        onSinkChange={setSinkType}
        onCreate={handleCreate}
        creating={creating}
      />

      <div className="mb-5 overflow-hidden">
        <SearchToolbar
          keyword={keyword}
          releaseState={releaseState}
          sourceType={sourceQueryType}
          sinkType={sinkQueryType}
          onKeywordChange={handleKeywordChange}
          onReleaseStateChange={handleReleaseStateChange}
          onSourceTypeChange={handleSourceTypeChange}
          onSinkTypeChange={handleSinkTypeChange}
          onReset={handleReset}
        />

        <Divider style={{ padding: 0, margin: "16px 0" }} />

        <RealtimeTaskTable
          loading={loading}
          dataSource={dataSource}
          selectedRowKeys={selectedRowKeys}
          onSelectedRowKeysChange={setSelectedRowKeys}
          pagination={false}
          onView={handleView}
          onEdit={handleEdit}
          onRun={handleRun}
          onStop={handleStop}
          onOnline={handleOnline}
          onOffline={handleOffline}
          onDelete={handleDelete}
          onLog={handleLog}
          onCheckpoint={handleCheckpoint}
        />
      </div>

      {!loading && dataSource.length <= 1 ? (
        <>
          <Divider style={{ padding: 0, margin: "12px 0" }} />
          <StreamingHelperSection />
        </>
      ) : null}

      <BottomActionBar
        total={total}
        selectedCount={selectedRowKeys.length}
        disabled={!hasSelected}
        onStart={handleBatchStart}
        onStop={handleBatchStop}
      />
    </div>
  );
};

export default RealtimeSyncPage;