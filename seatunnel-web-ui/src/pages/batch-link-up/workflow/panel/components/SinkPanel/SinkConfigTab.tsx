// components/SinkConfigTab/index.tsx
import { FC, useEffect, useState } from "react";

import Header from "@/components/Header";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
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

const SinkConfigTab: FC<SinkConfigTabProps> = ({
  selectedNode,
  sinkOption,
  onNodeDataChange,
  qualityDetailRef,
  setSinkColumns,
  sinkForm,
  getSinkTableList,
  sinkTableOption,
  setAutoCreateTable,
  autoCreateTable,
}) => {
  const intl = useIntl();

  const [params, setParams] = useState<any[]>([]);

  useEffect(() => {
    setParams(selectedNode?.data?.params || []);
  }, [selectedNode?.id, selectedNode?.data?.params]);

  const handleParamsChange = (newParams: any[]) => {
  setParams(newParams);

  if (selectedNode && onNodeDataChange) {
    const values = sinkForm?.getFieldsValue?.() || {};
    onNodeDataChange(selectedNode.id, {
      ...selectedNode.data,
      ...values,
      params: newParams,
    });
  }
};

  return (
    <div style={{ marginTop: 8 }}>
      <Header
        title={
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {intl.formatMessage({
              id: "pages.job.config.sink.basicSetting",
              defaultMessage: "Basic Setting",
            })}
          </span>
        }
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
            {intl.formatMessage({
              id: "pages.job.config.sink.extraParams",
              defaultMessage: "Extra Custom Parameters",
            })}{" "}
            <a
              title={intl.formatMessage({
                id: "pages.job.config.sink.extraParams.tip",
                defaultMessage: "Configure extra custom parameters",
              })}
            >
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

export default SinkConfigTab;
