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
        <Space size={16}>
          <Link
            className="schedule-link"
            onClick={() => {
              const nextList = [
                ...dataSource,
                {
                  key: "",
                  value: "",
                  description: "",
                },
              ];

              onChange?.({
                paramsList: nextList,
              });
            }}
          >
            <PlusOutlined />
            添加参数
          </Link>

          <Link className="schedule-link">参数预览</Link>
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
