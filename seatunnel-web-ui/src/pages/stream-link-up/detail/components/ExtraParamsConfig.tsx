import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Col, Input, Popover, Row, Select } from "antd";
import { FC, useEffect, useState } from "react";
import { mysqlParams } from "./config";

interface ExtraParamsConfigProps {
  value?: Array<{ key: string; value: string }>;
  onChange?: (value: Array<{ key: string; value: string }>) => void;
  pluginName?: string;
}

const ExtraParamsConfig: FC<ExtraParamsConfigProps> = ({
  value = [],
  onChange,
  pluginName,
}) => {
  /* ② 根据数据源类型，返回对应的参数元数据 */
  const getParamMeta = (type?: string) => {
    return mysqlParams;
  };

  const [keyOption, setKeyOption] = useState<any[]>([]);

  /* ③ 当选中节点变化时，自动补齐缺失的默认参数 */
  useEffect(() => {
    if (pluginName) {
      const meta = getParamMeta(pluginName);
      const formatMeta = meta?.map((item) => {
        return {
          value: item?.value,
          label: (
            <Popover
              style={{ zIndex: 98999 }}
              placement="left"
              title={
                <div>
                  <div>
                    参数：
                    <span style={{ fontSize: 13, fontWeight: 400 }}>
                      {item?.value}
                    </span>
                  </div>
                  <div>
                    简介：
                    <span style={{ fontSize: 13, fontWeight: 400 }}>
                      {item?.description}
                    </span>
                  </div>
                  <div>
                    例子：
                    <span style={{ fontSize: 13, fontWeight: 400 }}>
                      {item?.example}
                    </span>
                  </div>
                </div>
              }
            >
              <div>
                {item?.value}({item?.label})
              </div>
            </Popover>
          ),
        };
      });
      setKeyOption(formatMeta);
    }
  }, [pluginName]);

  const handleAddParam = () => {
    onChange?.([...value, { key: "", value: "" }]);
  };

  const handleParamChange = (
    index: number,
    field: "key" | "value",
    val: string
  ) => {
    const draft = [...value];
    draft[index][field] = val;
    onChange?.(draft);
  };

  const handleRemoveParam = (index: number) => {
    const draft = [...value];
    draft.splice(index, 1);
    onChange?.(draft);
  };
  return (
    <div style={{width: "78%"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          marginTop: 16,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            lineHeight: "14px",
            color: "#354052",
            textTransform: "uppercase",
          }}
        >
          PARAMS
        </div>
        <PlusOutlined onClick={handleAddParam} style={{ cursor: "pointer" }} />
      </div>

      {value.map((param, idx) => (
        <Row gutter={24} key={idx} style={{ marginBottom: 8 }}>
          <Col span={12} style={{ paddingRight: 6 }}>
            <Select
              style={{ width: "100%" }}
              placeholder="选择参数"
              options={keyOption}
              showSearch
              size="small"
              variant="filled"
              value={param.key || undefined}
              onChange={(val) => handleParamChange(idx, "key", val)}
            />
          </Col>
          <Col span={12} style={{ paddingLeft: 6 }}>
            <Input
              placeholder="输入值"
              variant="filled"
              size="small"
              value={param.value}
              onChange={(e) => handleParamChange(idx, "value", e.target.value)}
              suffix={<DeleteOutlined onClick={() => handleRemoveParam(idx)} />}
            />
          </Col>
        </Row>
      ))}

      {value.length === 0 && (
        <div style={{ color: "#999", textAlign: "center", padding: "8px 0" }}>
          No parameters yet 😊
        </div>
      )}
    </div>
  );
};

export default ExtraParamsConfig;
