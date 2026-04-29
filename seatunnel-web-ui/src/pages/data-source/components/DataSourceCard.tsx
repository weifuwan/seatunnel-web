import {
  ArrowRightOutlined,
  DeleteOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import React from "react";
import { environmentTagConfigMap } from "../constants";
import DatabaseIcons from "../icon/DatabaseIcons";
import type { DataSourceRecord } from "../types";
import DataSourceStatus from "./DataSourceStatus";

interface DataSourceCardProps {
  record: DataSourceRecord;
  onEdit: (record: DataSourceRecord) => void;
  onDelete: (record: DataSourceRecord) => void;
  onTestConnection: (record: DataSourceRecord) => void;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({
  record,
  onEdit,
  onDelete,
  onTestConnection,
}) => {
  const environmentConfig = environmentTagConfigMap[
    record.environment || ""
  ] || {
    text: record.environmentName || "-",
    color: "#8c8c8c",
    backgroundColor: "#fafafa",
    icon: null,
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className={[
        "group relative overflow-hidden rounded-2xl border border-[#F0F0F0]",
        "bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]",
        "!transition-shadow !duration-200 !ease-out",
        "hover:!translate-y-0 hover:!transform-none",
        "hover:shadow-[0_10px_22px_rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      <div className="relative h-[78px] bg-[hsl(210_40%_96.1%)]">
        <div
          className={[
            "absolute left-5 bottom-[-22px] z-[2]",
            "flex h-[54px] w-[54px] items-center justify-center rounded-full",
            "border-[3px] border-white bg-white",
            "shadow-[0_4px_10px_rgba(0,0,0,0.10)]",
          ].join(" ")}
        >
          <DatabaseIcons dbType={record.dbType} width="25" height="25" />
        </div>

        <div className="absolute right-4 top-4">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full",
              "px-2 py-0.5 text-[11px] font-medium leading-none",
            ].join(" ")}
            style={{
              background: environmentConfig.backgroundColor,
              color: environmentConfig.color,
            }}
          >
            {environmentConfig.icon}
            {record.environmentName || environmentConfig.text}
          </span>
        </div>

        <div
          className={[
            "absolute left-3 top-3 z-[3] flex gap-2",
            "opacity-0 translate-y-[-6px] pointer-events-none",
            "transition-all duration-200 ease-out",
            "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
          ].join(" ")}
        >
          <button
            type="button"
            className={[
              "flex h-[28px] w-[28px] items-center justify-center rounded-full",
              "border border-[#E8E8E8] bg-white text-[11px] text-[#262626]",
              "shadow-[0_6px_16px_rgba(0,0,0,0.08)]",
              "transition-all duration-200 ease-out",
              "hover:scale-[1.05] hover:border-[#FFCCC7] hover:bg-[#FFF2F0] hover:text-[#FF4D4F]",
            ].join(" ")}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(record);
            }}
            title="删除"
          >
            <DeleteOutlined />
          </button>

          <button
            type="button"
            className={[
              "flex h-[28px] w-[28px] items-center justify-center rounded-full",
              "border border-[#E8E8E8] bg-white text-[11px] text-[#262626]",
              "shadow-[0_6px_16px_rgba(0,0,0,0.08)]",
              "transition-all duration-200 ease-out",
              "hover:scale-[1.05] hover:bg-[#F5F5F5] hover:text-[#1677FF]",
            ].join(" ")}
            onClick={(event) => {
              event.stopPropagation();
              onTestConnection(record);
            }}
            title="测试连接"
          >
            <DisconnectOutlined />
          </button>
        </div>
      </div>

      <div className="px-5 pb-4 pt-[34px]">
        <div
          className="mb-1.5 truncate text-[16px] font-bold text-[#1F1F1F]"
          title={record.name}
        >
          {record.name || "-"}
        </div>

        <div
          className="mb-2.5 truncate text-xs leading-5 text-[#475467]"
          title={record.jdbcUrl}
        >
          {record.jdbcUrl || "-"}
        </div>

        <div className="mb-3">
          <DataSourceStatus status={record.connStatus} />
        </div>

        <div className="mb-3 text-xs text-[#8C8C8C]">
          <span className="font-medium text-[#595959]">
            {record.updateTime || "-"}
          </span>
        </div>

        <Button
          block
          type="default"
          className={[
            "group/detail relative h-[36px] overflow-hidden rounded-full p-0",
            "border border-[#D9D9D9] bg-white font-semibold",
            "transition-all duration-300 ease-out",
            "hover:!border-[hsl(231_48%_48%)]",
          ].join(" ")}
          onClick={() => onEdit(record)}
        >
          <span
            className={[
              "absolute inset-0 z-[1] flex items-center justify-center rounded-full bg-white",
              "transition-all duration-300 ease-out",
              "group-hover/detail:translate-y-1.5 group-hover/detail:opacity-0",
            ].join(" ")}
          >
            查看详情
          </span>

          <span
            className={[
              "absolute inset-0 z-[2] flex items-center justify-center gap-2 rounded-full",
              "bg-[hsl(231_48%_48%)] text-white opacity-0",
              "transition-all duration-300 ease-out",
              "group-hover/detail:opacity-100",
            ].join(" ")}
          >
            <span
              className={[
                "translate-x-[-4px] transition-transform duration-300 ease-out",
                "group-hover/detail:translate-x-0",
              ].join(" ")}
            >
              查看详情
            </span>

            <span
              className={[
                "translate-x-[-8px] opacity-0 transition-all duration-300 ease-out",
                "group-hover/detail:translate-x-0 group-hover/detail:opacity-100",
              ].join(" ")}
            >
              <ArrowRightOutlined />
            </span>
          </span>
        </Button>
      </div>
    </Card>
  );
};

export default DataSourceCard;