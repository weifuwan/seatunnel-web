import DataSourceSelect, { generateCDCDataSourceOptions, generateDataSourceOptions } from "@/pages/batch-link-up/DataSourceSelect";
import { Breadcrumb } from "antd";

import IconRightArrow from "@/pages/batch-link-up/IconRightArrow";
import { DbType } from "../types";

interface WholeSyncHeaderProps {
  goBack: () => void;
  sourceType: DbType;
  targetType: DbType;
  onSourceChange: (value: string, option: any) => void;
  onTargetChange: (value: string, option: any) => void;
}

const WholeSyncHeader: React.FC<WholeSyncHeaderProps> = ({
  goBack,
  sourceType,
  targetType,
  onSourceChange,
  onTargetChange,
}) => {
  return (
    <>
      <div className="jy-dc-ui-pro-header">
        <div style={{ padding: "8px 16px 0 16px" }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <a style={{ fontSize: 12 }} onClick={goBack}>
                    Task List
                  </a>
                ),
              },
              { title: <span style={{ fontSize: 12 }}>Streaming Sync</span> },
            ]}
          />
        </div>

        <div
          className="jy-dc-ui-pro-header-footer"
          style={{ padding: "12px 16px 16px" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <DataSourceSelect
              value={sourceType}
              onChange={onSourceChange}
              placeholder="SOURCE"
              prefix="SOURCE："
              dataSourceOptions={generateCDCDataSourceOptions()}
              width="48%"
            />
            <div
              style={{ display: "flex", alignItems: "center", margin: "0 8px" }}
            >
              <IconRightArrow />
            </div>
            <DataSourceSelect
              value={targetType}
              onChange={onTargetChange}
              placeholder="SINK"
               dataSourceOptions={generateDataSourceOptions()}
              prefix="SINK："
              width="48%"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WholeSyncHeader;
