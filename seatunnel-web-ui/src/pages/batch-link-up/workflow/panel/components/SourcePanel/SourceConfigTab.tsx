import { FC } from "react";

import Header from "@/components/Header";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Divider, Tooltip } from "antd";
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
    <div className="mt-2">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <Header
          title={
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {intl.formatMessage({
                id: "pages.job.config.source.basicSetting",
                defaultMessage: "Basic Setting",
              })}
            </span>
          }
        />

        <div className="mt-3">
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
        </div>

        <Divider style={{ margin: "20px 0 16px", borderColor: "#E2E8F0" }} />

        <Header
          title={
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {intl.formatMessage({
                  id: "pages.job.config.source.extraParams",
                  defaultMessage: "Extra Parameters",
                })}
              </span>

              <Tooltip
                title={intl.formatMessage({
                  id: "pages.job.config.source.extraParams.tip",
                  defaultMessage: "Configure extra custom parameters",
                })}
              >
                <InfoCircleOutlined style={{ color: "#94A3B8", fontSize: 14 }} />
              </Tooltip>
            </div>
          }
        />

        <ExtraParamsConfig
          selectedNode={selectedNode}
          params={params}
          onParamsChange={handleParamsChange}
        />
      </div>
    </div>
  );
};

export default SourceConfigTab;