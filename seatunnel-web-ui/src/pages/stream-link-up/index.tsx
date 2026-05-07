import { Divider, message } from "antd";
import React, { useMemo, useState } from "react";
import { history } from "umi";

import BottomActionBar from "./components/BottomActionBar";
import RealtimeHeader from "./components/RealtimeHeader";
import RealtimeTaskTable from "./components/RealtimeTaskTable";
import SearchToolbar from "./components/SearchToolbar";
import StreamingHelperSection from "./components/StreamingHelperSection";
import { mockTasks } from "./constants";
import { seatunnelStremJobDefinitionApi } from "./api";

const REALTIME_DETAIL_CACHE_PREFIX = "stream-link-up-detail";

const RealtimeSyncPage: React.FC = () => {
  const [sourceType, setSourceType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "MYSQL-CDC",
  });


  const [sinkType, setSinkType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>();
  const [direction, setDirection] = useState<string>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [creating, setCreating] = useState(false);

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.id.toLowerCase().includes(keyword.toLowerCase());

      const matchStatus = !status || item.status === status;

      const matchDirection =
        !direction ||
        `${item.sourceType}_${item.sinkType}` === direction ||
        item.sourceType === direction ||
        item.sinkType === direction;

      return matchKeyword && matchStatus && matchDirection;
    });
  }, [keyword, status, direction]);

  const hasSelected = selectedRowKeys.length > 0;

  /**
   * 新增实时任务：
   * 1. 先申请唯一 ID
   * 2. 将实时任务初始化信息写入 sessionStorage
   * 3. 跳转到实时任务详情页
   */
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
        message.error(data?.message || "创建实时任务失败，请稍后重试");
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
          jobType: "STREAMING",
          sourceType,
          targetType: sinkType,
        })
      );

      history.push(`/sync/stream-link-up/${returnId}/detail`);
    } catch (error) {
      console.error("Create stream sync task failed:", error);
      message.error("创建实时任务失败，请检查网络或稍后重试");
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setStatus(undefined);
    setDirection(undefined);
  };

  const handleBatchStart = () => {
    if (!hasSelected) return;
    message.success(`已提交 ${selectedRowKeys.length} 个实时任务启动请求`);
  };

  const handleBatchStop = () => {
    if (!hasSelected) return;
    message.success(`已提交 ${selectedRowKeys.length} 个实时任务停止请求`);
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
          status={status}
          direction={direction}
          onKeywordChange={setKeyword}
          onStatusChange={setStatus}
          onDirectionChange={setDirection}
          onReset={handleReset}
        />

        <Divider style={{ padding: 0, margin: "16px 0" }} />

        <RealtimeTaskTable
          dataSource={filteredTasks}
          selectedRowKeys={selectedRowKeys}
          onSelectedRowKeysChange={setSelectedRowKeys}
        />
      </div>

      {mockTasks && mockTasks?.length <= 1 ? (
        <>
          <Divider style={{ padding: 0, margin: "12px 0" }} />
          <StreamingHelperSection />
        </>
      ) : null}

      <BottomActionBar
        total={filteredTasks.length}
        selectedCount={selectedRowKeys.length}
        disabled={!hasSelected}
        onStart={handleBatchStart}
        onStop={handleBatchStop}
      />
    </div>
  );
};

export default RealtimeSyncPage;