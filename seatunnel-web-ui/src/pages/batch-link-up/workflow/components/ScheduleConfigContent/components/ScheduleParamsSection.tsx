import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import ParamTable from "./ParamTable";
import { paramData } from "../constants";

const { Link } = Typography;

const ScheduleParamsSection: React.FC = () => {
  return (
    <div className="schedule-section-body">
      <div className="schedule-link-row">
        <Space size={16}>
          <Link className="schedule-link">
            <PlusOutlined />
            添加参数
          </Link>
          <Link className="schedule-link">参数预览</Link>
        </Space>
      </div>

      <ParamTable dataSource={paramData} />
    </div>
  );
};

export default ScheduleParamsSection;