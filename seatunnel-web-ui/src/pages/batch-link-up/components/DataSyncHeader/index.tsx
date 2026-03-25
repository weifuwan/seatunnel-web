import { DatabaseOutlined, PlusOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import { Button } from "antd";
import React from "react";
import DataSourceSelect, {
  generateDataSourceOptions,
} from "../../DataSourceSelect";
import IconRightArrow from "../../IconRightArrow";
import "./index.less";

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
    <div className="sync-page-header">
      <div className="sync-page-header__top">
        <div className="sync-page-header__meta">
          <div className="sync-page-header__icon">
            <DatabaseOutlined />
          </div>

          <div className="sync-page-header__text">
            <div className="sync-page-header__title">
              {intl.formatMessage({
                id: "pages.datasync.header.title",
                defaultMessage: "批量数据同步任务",
              })}
            </div>
            <div className="sync-page-header__subtitle">
              {intl.formatMessage({
                id: "pages.datasync.header.subtitle",
                defaultMessage: "选择同步方向，快速创建新的离线同步任务",
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="sync-page-header__toolbar">
        <div className="sync-page-header__toolbar-label">同步方向</div>

        <div className="sync-page-header__selectors">
          <DataSourceSelect
            value={sourceType}
            onChange={handleSourceChange}
            dataSourceOptions={generateDataSourceOptions()}
            placeholder={intl.formatMessage({
              id: "pages.datasync.header.source.placeholder",
              defaultMessage: "请选择来源",
            })}
            prefix={intl.formatMessage({
              id: "pages.datasync.header.source.prefix",
              defaultMessage: "来源：",
            })}
          />

          <div className="sync-page-header__arrow">
            <IconRightArrow />
          </div>

          <DataSourceSelect
            value={targetType}
            onChange={handleTargetChange}
            dataSourceOptions={generateDataSourceOptions()}
            placeholder={intl.formatMessage({
              id: "pages.datasync.header.sink.placeholder",
              defaultMessage: "请选择去向",
            })}
            prefix={intl.formatMessage({
              id: "pages.datasync.header.sink.prefix",
              defaultMessage: "去向：",
            })}
          />
          <Button
            type="primary"
            className="sync-page-header__create-btn"
            disabled={isButtonDisabled}
            onClick={handleCreateClick}
          >
            {intl.formatMessage({
              id: "pages.datasync.header.button.start",
              defaultMessage: "开始创建",
            })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataSyncHeader;
