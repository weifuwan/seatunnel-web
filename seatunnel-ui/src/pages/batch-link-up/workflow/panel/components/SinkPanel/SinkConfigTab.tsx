// components/SourceConfigTab/index.tsx
import { FC, useState } from "react";

import Header from "@/components/Header";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Divider } from "antd";
import ExtraParamsConfig from "./ExtraParamsConfig";
import SinkBasicConfig from "./SinkBasicConfig";

interface SinkConfigTabProps {
  selectedNode: {
    id: string;
    data: any;
  };
  sinkOption: any[];
  onNodeDataChange: (nodeId: string, newData: any) => void;
  qualityDetailRef: any;
  setSinkColumns: (value: any) => void;
  sinkForm: any;
  sinkTableOption: any[];
  getSinkTableList: (value: any) => void;
  setAutoCreateTable: (value: any) => void;
  autoCreateTable: any;
}

const SourceConfigTab: FC<SinkConfigTabProps> = ({
  selectedNode,
  sinkOption,
  onNodeDataChange,
  qualityDetailRef,
  setSinkColumns,
  sinkForm,
  getSinkTableList,
  sinkTableOption,
  setAutoCreateTable,
  autoCreateTable
}) => {
  const [params, setParams] = useState<any[]>(selectedNode?.data?.params || []);

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
      <SinkBasicConfig
        selectedNode={selectedNode}
        sinkOption={sinkOption}
        qualityDetailRef={qualityDetailRef}
        onNodeDataChange={onNodeDataChange}
        setSinkColumns={setSinkColumns}
        sinkForm={sinkForm}
        sinkTableOption={sinkTableOption}
        getSinkTableList={getSinkTableList}
        setAutoCreateTable={setAutoCreateTable}
        autoCreateTable={autoCreateTable}
      />

      <Divider style={{ padding: 0, margin: "12px 0" }} />

      <Header
        title={
          <span style={{ fontSize: 13, fontWeight: 400 }}>
            Extra Custom Parameters{" "}
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
