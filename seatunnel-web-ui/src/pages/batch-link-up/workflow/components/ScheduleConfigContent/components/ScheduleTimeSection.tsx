import React from "react";
import { Alert, Form, Input, Radio, Select, Space, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { formItemStyle, labelNodeStyle } from "../constants";

const { Text } = Typography;

const ScheduleTimeSection: React.FC = () => {
  return (
    <div className="schedule-section-body">
      <div className="schedule-inner-panel">
        <Alert
          className="mb-4 rounded-lg"
          type="info"
          showIcon
          message={<span className="text-[13px]">调度时区为 Asia/Shanghai</span>}
        />

        <Form
          layout="horizontal"
          component={false}
          labelCol={{ flex: "118px" }}
          wrapperCol={{ flex: "1" }}
          labelAlign="left"
        >
          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>调度周期</span>}
            required
          >
            <Select
              size="small"
              className="w-[140px]"
              defaultValue="day"
              options={[
                { label: "日", value: "day" },
                { label: "周", value: "week" },
                { label: "月", value: "month" },
                { label: "小时", value: "hour" },
              ]}
            />
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>调度时间</span>}
            required
          >
            <Input
              size="small"
              className="w-[180px]"
              defaultValue="00:17"
              suffix={<CalendarOutlined className="text-[#98A2B3]" />}
            />
          </Form.Item>

          <Form.Item
            style={formItemStyle}
            label={<span style={labelNodeStyle}>生效日期</span>}
            required
          >
            <Radio.Group defaultValue="forever">
              <Space size={16} wrap>
                <Radio value="forever">永久生效</Radio>
                <Radio value="assign">指定时间</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            style={{ marginBottom: 2 }}
            label={<span style={labelNodeStyle}>Cron表达式</span>}
          >
            <div className="inline-flex min-h-8 items-center gap-3">
              <Text className="text-[13px] text-[#344054]">00 17 00 * * ?</Text>
              <a className="text-[12px]">复制</a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ScheduleTimeSection;