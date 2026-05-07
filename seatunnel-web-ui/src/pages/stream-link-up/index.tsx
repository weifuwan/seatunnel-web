import { Divider, message } from "antd";
import React, { useMemo, useState } from "react";
import BottomActionBar from "./components/BottomActionBar";
import RealtimeHeader from "./components/RealtimeHeader";
import RealtimeTaskTable from "./components/RealtimeTaskTable";
import SearchToolbar from "./components/SearchToolbar";
import StreamingHelperSection from "./components/StreamingHelperSection";
import { mockTasks } from "./constants";

const RealtimeSyncPage: React.FC = () => {
  const [sourceType, setSourceType] = useState("MYSQL");
  const [sinkType, setSinkType] = useState("KAFKA");

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string>();
  const [direction, setDirection] = useState<string>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  const handleCreate = () => {
    message.success(`准备创建实时任务：${sourceType} → ${sinkType}`);
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
    <div className="min-h-screen  px-6 pb-24 pt-7 text-slate-950">
      <RealtimeHeader
        sourceType={sourceType}
        sinkType={sinkType}
        onSourceChange={setSourceType}
        onSinkChange={setSinkType}
        onCreate={handleCreate}
      />
      

      <div className="mb-5 overflow-hidden ">
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
      ) : (
        ""
      )}

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
