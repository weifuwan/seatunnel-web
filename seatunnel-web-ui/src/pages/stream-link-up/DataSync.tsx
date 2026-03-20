import { Button, Select } from "antd";
import React from "react";

// 图标组件
import {
  generateCDCDataSourceOptions,
  generateDataSourceOptions,
} from "../batch-link-up/DataSourceSelect";
import DataSourceSelect from "./DataSourceSelect";
import IconRightArrow from "./IconRightArrow";
import "./index.less";

const { Option } = Select;

interface DataSyncHeaderProps {
  goDetail: (value: any) => void;
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
  sourceType,
  setSourceType,
  targetType,
  setTargetType,
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
                title="BaStreamingtch Data Sync Job"
              >
                实时数据同步任务
              </div>
              <div className="jy-dc-ui-title-sub-name">
                完全向导式白屏化配置，轻松上手企业级数据同步任务配置。先选择您要同步的來源和去向类型，系统会自动展示它们支持的所有同步方案，一步即可建立所需同步任务。
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
              dataSourceOptions={generateCDCDataSourceOptions()}
              placeholder="来源"
              prefix="来源："
            />

            <div
              style={{ display: "flex", alignItems: "center", margin: "0 8px" }}
            >
              <IconRightArrow />
            </div>

            <DataSourceSelect
              value={targetType}
              dataSourceOptions={generateDataSourceOptions()}
              onChange={handleTargetChange}
              placeholder="去向"
              prefix="去向："
            />

            <Button
              style={{ marginLeft: "1.5%", width: "13%" }}
              type="primary"
              disabled={isButtonDisabled}
              onClick={handleCreateClick}
            >
              开始
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSyncHeader;
