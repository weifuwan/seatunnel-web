import { PlusOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import React from "react";
import ParamTable from "./ParamTable";

interface Props {
  value?: any;
  onChange?: (patch: Record<string, any>) => void;
}

const { Link } = Typography;

const ScheduleParamsSection: React.FC<Props> = ({ value, onChange }) => {
  const dataSource = value?.paramsList ?? [];

  return (
    <div className="schedule-section-body">
      <div className="schedule-link-row">
        <Space size={8}>
          <Link
            className={[
              "inline-flex h-7 items-center justify-center gap-1 rounded-[10px] border px-2.5",
              "text-[13px] font-medium leading-none no-underline",
              "text-[hsl(231_48%_48%)]",
              "border-[hsl(231_44%_91%)] bg-[hsl(231_56%_98.5%)]",
              "transition-all duration-200 ease-out",
              "hover:border-[hsl(231_44%_84%)] hover:bg-[hsl(231_58%_97.5%)] hover:text-[hsl(231_52%_42%)]",
              "hover:shadow-[0_4px_12px_rgba(67,78,181,0.08)]",
              "active:scale-[0.98]",
            ].join(" ")}
            onClick={() => {
              const nextList = [
                ...dataSource,
                {
                  key: `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                  paramName: "",
                  paramValue: "",
                },
              ];

              onChange?.({
                paramsList: nextList,
              });
            }}
          >
            <PlusOutlined className="text-xs" />
            添加参数
          </Link>

          <Link
            className={[
              "inline-flex h-7 items-center justify-center rounded-[10px] border px-2.5",
              "text-[13px] font-medium leading-none no-underline",
              "text-slate-500",
              "border-transparent bg-transparent",
              "transition-all duration-200 ease-out",
              "hover:border-[hsl(231_44%_90%)] hover:bg-[hsl(231_56%_98.5%)] hover:text-[hsl(231_48%_48%)]",
              "active:scale-[0.98]",
            ].join(" ")}
          >
            参数预览
          </Link>
        </Space>
      </div>

      <ParamTable
        dataSource={dataSource}
        onChange={(nextList) => {
          onChange?.({
            paramsList: nextList,
          });
        }}
      />
    </div>
  );
};

export default ScheduleParamsSection;
