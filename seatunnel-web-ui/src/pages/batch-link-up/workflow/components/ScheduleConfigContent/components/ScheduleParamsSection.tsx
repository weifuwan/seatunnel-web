import { fetchTimeVariableList } from "@/pages/knowledge-management/api";
import { PlusOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import ParamTable from "./ParamTable";

interface Props {
  value?: any;
  onChange?: (patch: Record<string, any>) => void;
}

const { Link } = Typography;

const ScheduleParamsSection: React.FC<Props> = ({ value, onChange }) => {
  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    if (value?.paramsList) {
      console.log(value?.paramsList ?? []);
      setDataSource(value?.paramsList ?? []);
    }
  }, [value?.paramsList]);

  const [timeVariableKeys, setTimeVariableKeys] = useState<any[]>([]);

  useEffect(() => {
    const loadTimeVariables = async () => {
      try {
        const response = await fetchTimeVariableList();
        setTimeVariableKeys(response.data || []);
      } catch (error) {
        console.error("Failed to load time variables:", error);
      }
    };

    loadTimeVariables();
  }, []);

  const handleAdd = () => {
    const nextList = [
      ...dataSource,
      {
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        paramName: "",
        paramValue: "",
      },
    ];

    onChange?.({
      paramsList: nextList,
    });
  };

  const handleEdit = (record: any) => {
    const newList = [...dataSource];
    const index = newList.findIndex((item) => item.key === record.key);
    if (index >= 0) {
      newList[index] = {
        ...newList[index],
        paramName: record.paramName,
        paramValue: record.paramValue,
      };

      onChange?.({
        paramsList: newList,
      });
    }
  };

  const handleDelete = (key: string) => {
    const newList = dataSource.filter((item: any) => item.key !== key);
    onChange?.({
      paramsList: newList,
    });
  };

  return (
    <div className="schedule-section-body">
      <div className="schedule-link-row">
        <Space size={8}>
          <Link
            className="inline-flex h-7 items-center justify-center gap-1 rounded-[10px] border px-2.5 text-[13px] font-medium"
            onClick={handleAdd}
          >
            <PlusOutlined className="text-xs" />
            添加时间变量
          </Link>
          <Link
            className="inline-flex h-7 items-center justify-center gap-1 rounded-[10px] border px-2.5 text-[13px] font-medium"
            onClick={() => {}}
          >
            参数预览
          </Link>
        </Space>
      </div>

      <ParamTable
        dataSource={dataSource}
        onChange={handleEdit}
        onDelete={handleDelete}
        timeVariableKeys={timeVariableKeys}
      />
    </div>
  );
};

export default ScheduleParamsSection;
