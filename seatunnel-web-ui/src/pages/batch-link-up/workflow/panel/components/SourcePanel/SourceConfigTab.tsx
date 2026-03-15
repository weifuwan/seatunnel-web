// components/SourceConfigTab/index.tsx
import { FC } from "react";

import Header from "@/components/Header";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
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
  const intl = useIntl();

  const handleParamsChange = (newParams: any[]) => {
    setParams(newParams);

    if (selectedNode && onNodeDataChange) {
      const values = sourceForm.getFieldsValue(true);

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
              id: "pages.job.config.source.basicSetting",
              defaultMessage: "Basic Setting",
            })}
          </span>
        }
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
            {intl.formatMessage({
              id: "pages.job.config.source.extraParams",
              defaultMessage: "Extra Custom Parameters",
            })}{" "}
            <a
              title={intl.formatMessage({
                id: "pages.job.config.source.extraParams.tip",
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

export default SourceConfigTab;
