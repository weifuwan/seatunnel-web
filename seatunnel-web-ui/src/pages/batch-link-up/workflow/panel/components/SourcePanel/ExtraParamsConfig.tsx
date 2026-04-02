import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Popover, Select, Tooltip } from "antd";
import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { mysqlParams } from "./config";

interface ExtraParamsConfigProps {
  params: Array<{ key: string; value: string }>;
  onParamsChange: (params: Array<{ key: string; value: string }>) => void;
  selectedNode: { id: string; data: { text?: string; dbType?: string } };
}

const ExtraParamsConfig: FC<ExtraParamsConfigProps> = ({
  params,
  onParamsChange,
  selectedNode,
}) => {
  const getParamMeta = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "MYSQL":
        return mysqlParams;
      default:
        return [];
    }
  };

  const [keyOptions, setKeyOptions] = useState<any[]>([]);

  const dbType = selectedNode?.data?.dbType || "MYSQL";

  useEffect(() => {
    const meta = getParamMeta(dbType);

    const formatMeta = meta?.map((item) => ({
      value: item?.value,
      label: (
        <Popover
          placement="left"
          overlayStyle={{ maxWidth: 320 }}
          content={
            <div className="workflow-panel__param-popover">
              <div>
                参数：<span>{item?.value}</span>
              </div>
              <div>
                简介：<span>{item?.description}</span>
              </div>
              <div>
                示例：<span>{item?.example}</span>
              </div>
            </div>
          }
        >
          <div>
            {item?.value}（{item?.label}）
          </div>
        </Popover>
      ),
    }));

    setKeyOptions(formatMeta);
  }, [dbType]);

  const selectedKeys = useMemo(() => {
    return params.map((item) => item.key).filter(Boolean);
  }, [params]);

  const handleAddParam = () => {
    onParamsChange([...params, { key: "", value: "" }]);
  };

  const handleParamChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const draft = [...params];
    draft[index] = {
      ...draft[index],
      [field]: value,
    };
    onParamsChange(draft);
  };

  const handleRemoveParam = (index: number) => {
    const draft = [...params];
    draft.splice(index, 1);
    onParamsChange(draft);
  };

  return (
    <div className="workflow-panel__params">
      <div className="workflow-panel__params-head">
        <div className="workflow-panel__params-title">参数列表</div>

        <Tooltip title="添加一个额外参数">
          <button
            type="button"
            className="workflow-panel__icon-btn"
            onClick={handleAddParam}
          >
            <PlusOutlined />
          </button>
        </Tooltip>
      </div>

      {params.length === 0 ? (
        <div className="workflow-panel__empty">暂无额外参数</div>
      ) : (
        <div className="workflow-panel__params-list">
          {params.map((param, idx) => {
            const currentKey = param.key;

            const options = keyOptions.map((option) => {
              const disabled =
                !!option.value &&
                option.value !== currentKey &&
                selectedKeys.includes(option.value);
              return { ...option, disabled };
            });

            return (
              <div className="workflow-panel__param-row" key={idx}>
                <Select
                  value={param.key || undefined}
                  onChange={(value) => handleParamChange(idx, "key", value)}
                  options={options}
                  placeholder="选择参数"
                  showSearch
                  optionFilterProp="value"
                  size="large"
                  className="workflow-panel__antd-select workflow-panel__param-key"
                  popupClassName="workflow-panel__dropdown"
                />

                <Input
                  value={param.value}
                  onChange={(e) =>
                    handleParamChange(idx, "value", e.target.value)
                  }
                  placeholder="输入参数值"
                  size="large"
                  className="workflow-panel__param-value"
                  suffix={
                    <DeleteOutlined
                      onClick={() => handleRemoveParam(idx)}
                      style={{ cursor: "pointer", color: "#98A2B3" }}
                    />
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExtraParamsConfig;