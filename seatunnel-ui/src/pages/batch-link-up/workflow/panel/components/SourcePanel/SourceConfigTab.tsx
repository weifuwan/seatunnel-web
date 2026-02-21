// components/SourceConfigTab/index.tsx
import { FC } from "react";

import Header from "@/components/Header";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Divider } from "antd";
import ExtraParamsConfig from "./ExtraParamsConfig";
import SourceBasicConfig from "./SourceBasicConfig";

interface SourceConfigTabProps {
  selectedNode: {
    id: string;
    data: any;
  };
  sourceOption: any[];
  onNodeDataChange: (nodeId: string, newData: any) => void;
  qualityDetailRef: any;
  setSourceColumns: (value: any) => void;
  sourceForm: any;
  sourceTableOption: any[];
  getSourceTableList: (value: any) => void;
  setParams: (value: any) => void;
  params: any;
}

const SourceConfigTab: FC<SourceConfigTabProps> = ({
  selectedNode,
  sourceOption,
  onNodeDataChange,
  qualityDetailRef,
  setSourceColumns,
  sourceForm,
  getSourceTableList,
  sourceTableOption,
  setParams,
  params,
}) => {
  const handleParamsChange = (newParams: any[]) => {
    setParams(newParams);
    if (selectedNode && onNodeDataChange) {
      const values = {}; // 这里需要获取form的值
      onNodeDataChange(selectedNode.id, {
        ...selectedNode.data,
        params: newParams,
        ...values,
      });
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <Header
        title={<span style={{ fontSize: 13, fontWeight: 500 }}>Basic Setting</span>}
      />
      <SourceBasicConfig
        selectedNode={selectedNode}
        sourceOption={sourceOption}
        qualityDetailRef={qualityDetailRef}
        onNodeDataChange={onNodeDataChange}
        setSourceColumns={setSourceColumns}
        sourceForm={sourceForm}
        sourceTableOption={sourceTableOption}
        getSourceTableList={getSourceTableList}
      />

      <Divider style={{ padding: 0, margin: "12px 0" }} />

      <Header
        title={
          <span style={{ fontSize: 13, fontWeight: 400 }}>
            额外自定义参数配置{" "}
            <a>
              <InfoCircleOutlined />
            </a>
          </span>
        }
      />

      <ExtraParamsConfig
        selectedNode={selectedNode}
        params={params}
        onParamsChange={handleParamsChange}
      />
    </div>
  );
};

export default SourceConfigTab;
