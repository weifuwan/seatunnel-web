import { generateCDCDataSourceOptions, generateDataSourceOptions } from "@/pages/batch-link-up/DataSourceSelect";
import {
  ArrowRightOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Select } from "antd";
import React from "react";
import { sinkOptions } from "../constants";

interface RealtimeHeaderProps {
  sourceType: string;
  sinkType: string;
  onSourceChange: (value: string) => void;
  onSinkChange: (value: string) => void;
  onCreate: () => void;
}

const RealtimeHeader: React.FC<RealtimeHeaderProps> = ({
  sourceType,
  sinkType,
  onSourceChange,
  onSinkChange,
  onCreate,
}) => {
  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <div
          className="flex items-center justify-center   text-indigo-600 "
          style={{
            backgroundColor: "#eef2ff",
            height: 44,
            width: 44,
            fontSize: 20,
            borderRadius: 14,
          }}
        >
          <ThunderboltOutlined />
        </div>

        <div>
          <h1
            className="m-0  font-bold tracking-tight text-slate-950"
            style={{ fontSize: 18, lineHeight: "26px" }}
          >
            实时同步任务
          </h1>
          <p className="mt-1  text-slate-500" style={{ fontSize: 13 }}>
            持续采集与实时处理数据流，帮助你更快构建端到端流式同步链路
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-indigo-100 bg-white/90 p-5 ">
        <div className="mb-4 flex items-center gap-3 font-semibold text-slate-900">
          同步方向
          <span className="inline-flex h-6 items-center gap-2 rounded-full bg-emerald-50 px-3 text-xs font-semibold text-emerald-600">
            <i className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            实时链路
          </span>
        </div>

        <div className="grid grid-cols-[minmax(240px,1fr)_120px_minmax(240px,1fr)_180px] items-center gap-4 max-xl:grid-cols-1">
          <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white transition
           hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
            <Select
              prefix="来源："
              value={sourceType}
              onChange={onSourceChange}
              options={generateCDCDataSourceOptions()}
              bordered={false}
              showSearch
              className="flex-1"
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-slate-900 max-xl:justify-start">
            <svg width="78" height="24" viewBox="0 0 90 24" fill="none">
              <path
                d="M2 13C11 13 12 16 20 16C30 16 30 5 41 5C52 5 52 20 64 20C74 20 75 12 88 12"
                stroke="#4f66f6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <ArrowRightOutlined />
          </div>

          <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
            <Select
              prefix="去向："
              value={sinkType}
              onChange={onSinkChange}
              options={generateDataSourceOptions()}
              bordered={false}
              showSearch
              className="flex-1"
            />
          </div>

          <Button
            type="primary"
            onClick={onCreate}
            className="h-10 rounded-full border-none bg-gradient-to-r  font-semibold "
          >
            创建实时任务
          </Button>

          
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          常用组合：
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐬 MySQL → Kafka
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐘 PostgreSQL → Kafka
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            🐬 MySQL CDC → Elasticsearch
          </span>
          <span className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-slate-600 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-600">
            ✣ Kafka → StarRocks
          </span>
        </div>
      </div>
    </>
  );
};

export default RealtimeHeader;
