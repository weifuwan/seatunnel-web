import { Button, Select } from "antd";
import React from "react";

import { useIntl } from "@umijs/max";
import DataSourceSelect, {
  generateDataSourceOptions,
} from "./DataSourceSelect";
import IconRightArrow from "./IconRightArrow";
import "./index.less";

const { Option } = Select;

interface DataSyncHeaderProps {
  goDetail: (value: any) => void;
  setParams: (value: SyncParams) => void;
  sourceType: any;
  targetType: any;
  setSourceType: (value: any) => void;
  setTargetType: (value: any) => void;
}

export interface SyncParams {
  sourceType: string;
  targetType: string;
}

const DataSyncHeader: React.FC<DataSyncHeaderProps> = ({
  goDetail,
  setParams,
  sourceType,
  setSourceType,
  targetType,
  setTargetType,
}) => {
  const intl = useIntl();

  const handleSourceChange = (value: string, option: any) => {
    setSourceType({
      dbType: value,
      connectorType: option?.connectorType,
    });
  };

  const handleTargetChange = (value: string, option: any) => {
    setTargetType({
      dbType: value,
      connectorType: option?.connectorType,
    });
  };

  const handleCreateClick = () => {
    goDetail(undefined);
    setParams({
      sourceType,
      targetType,
    });
  };

  const isButtonDisabled = !sourceType || !targetType;

  return (
    <div className="jy-dc-ui-pro-header">
      <div className="jy-dc-ui-pro-header-heading">
        <div className="jy-dc-ui-pro-header-heading-title">
          <div className="jy-dc-ui-title-dc-ui-title-large-dc-ui-title-LR">
            <div className="jy-dc-ui-title-name">
              <div
                className="jy-dc-ui-title-name-content"
                title={intl.formatMessage({
                  id: "pages.datasync.header.title",
                  defaultMessage: "Batch Data Sync Job",
                })}
              >
                {intl.formatMessage({
                  id: "pages.datasync.header.title",
                  defaultMessage: "Batch Data Sync Job",
                })}
              </div>

              <div className="jy-dc-ui-title-sub-name">
                {intl.formatMessage({
                  id: "pages.datasync.header.subtitle",
                  defaultMessage:
                    "Build enterprise-grade data sync jobs in minutes with a fully guided, white-screen configuration.",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="jy-dc-ui-pro-header-footer">
        <div style={{ padding: "12px 24px 16px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <DataSourceSelect
              value={sourceType}
              onChange={handleSourceChange}
              dataSourceOptions={generateDataSourceOptions()}
              placeholder={intl.formatMessage({
                id: "pages.datasync.header.source.placeholder",
                defaultMessage: "SOURCE",
              })}
              prefix={intl.formatMessage({
                id: "pages.datasync.header.source.prefix",
                defaultMessage: "SOURCE:",
              })}
            />

            <div
              style={{ display: "flex", alignItems: "center", margin: "0 8px" }}
            >
              <IconRightArrow />
            </div>

            <DataSourceSelect
              value={targetType}
              onChange={handleTargetChange}
              dataSourceOptions={generateDataSourceOptions()}
              placeholder={intl.formatMessage({
                id: "pages.datasync.header.sink.placeholder",
                defaultMessage: "SINK",
              })}
              prefix={intl.formatMessage({
                id: "pages.datasync.header.sink.prefix",
                defaultMessage: "SINK:",
              })}
            />

            <Button
              style={{ marginLeft: "1.5%", width: "13%" }}
              type="primary"
              disabled={isButtonDisabled}
              onClick={handleCreateClick}
            >
              {intl.formatMessage({
                id: "pages.datasync.header.button.start",
                defaultMessage: "START",
              })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSyncHeader;
