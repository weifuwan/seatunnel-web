import { SendOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import React, { useMemo, useState } from "react";

// 图标组件
import MysqlIcon from "../data-source/icon/MysqlIcon";
import OracleIcon from "../data-source/icon/OracleIcon";
import PostgreSQL from "../data-source/icon/PsSqlIcon";
import IconRightArrow from "./IconRightArrow";
import "./index.less";
import DataSourceSelect, { generateCDCDataSourceOptions, generateDataSourceOptions } from "./DataSourceSelect";

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
  setTargetType
}) => {
  

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
              <div className="jy-dc-ui-title-name-content" title="Batch Data Sync Job">
                Batch Data Sync Job
              </div>
              <div className="jy-dc-ui-title-sub-name">
                Build enterprise-grade data sync jobs in minutes with a fully guided, white-screen configuration.
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
              placeholder="SOURCE"
              prefix="SOURCE："
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
              placeholder="SINK"
              prefix="SINK："
            />

            <Button
              style={{ marginLeft: "1.5%", width: "13%" }}
              type="primary"
              disabled={isButtonDisabled}
              onClick={handleCreateClick}
            >
              START
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSyncHeader;
