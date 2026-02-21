import Header from "@/components/Header";
import { Col, Form, Input, message, Popover, Radio, Row } from "antd";
import { useState } from "react";
import { taskScheduleApi } from "../../type";

function ScheduleConfig({ form }) {
  const [preview, setPreview] = useState<string[]>([]);

  const previewCron = async () => {
    const cron = form.getFieldValue("cronExpression");
    if (!cron) {
      message.error("请先输入 cron 表达式");
      return;
    }

    const res = await taskScheduleApi.getLast5ExecutionTimes(cron);
    if (res?.code === 0) {
      setPreview(res.data || []);
    }
  };

  return (
    <>
      <Header
        title={
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            Schedule Setting
          </span>
        }
      />

      <Row gutter={24}>
        <Col>
          <Form.Item
            name="cronExpression"
            label="Cron Expression"
            rules={[{ required: true }]}
          >
            <Input size="small" />
          </Form.Item>
        </Col>
        <Col>
          <Popover
            title="Last 5 Runs"
            content={preview.map((t, i) => (
              <div key={i}>{t}</div>
            ))}
          >
            <a onClick={previewCron} style={{ fontSize: 12 }}>
              Last 5 Runs
            </a>
          </Popover>
        </Col>
      </Row>

      <Form.Item
        name="scheduleStatus"
        label="Enable Scheduling"
        rules={[{ required: true }]}
      >
        <Radio.Group>
          <Radio value="ACTIVE">ACTIVE</Radio>
          <Radio value="PAUSED">PAUSED</Radio>
        </Radio.Group>
      </Form.Item>
    </>
  );
}

export default ScheduleConfig;
