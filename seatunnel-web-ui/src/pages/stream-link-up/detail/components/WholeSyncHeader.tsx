import DataSourceSelect, {
  generateCDCDataSourceOptions,
  generateDataSourceOptions,
} from "@/pages/batch-link-up/DataSourceSelect";
import IconRightArrow from "@/pages/batch-link-up/IconRightArrow";
import { ArrowLeftOutlined, ProductOutlined } from "@ant-design/icons";
import { Button } from "antd";
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
    <div>
      {/* style={{display: "flex", justifyContent: "space-between"}} */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <div className="rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between gap-4 max-[1200px]:flex-col max-[1200px]:items-stretch">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-indigo-50 text-[20px] text-[#4a5bd0]">
                  <ProductOutlined />
                </div>

                <div className="min-w-0">
                  <div className="text-[18px] font-bold leading-[26px] text-[#101828]">
                    创建实时同步任务
                  </div>

                  <div className="mt-1 text-[13px] leading-5 text-[#667085]">
                    选好同步方向，几步就能完成实时任务配置 ✨
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              goBack();
            }}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 999,
              border: "1px solid #E4E7EC",
              background: "#FFFFFF",
              color: "#344054",
              fontWeight: 500,
              marginRight: "16px",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F9FAFB";
              e.currentTarget.style.borderColor = "#D0D5DD";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E4E7EC";
            }}
          >
            返回上一页
          </Button>
        </div>
      </div>

      <div
        className="rounded-[24px] bg-gradient-to-r from-slate-50 to-slate-100/80 p-4 ring-1 ring-slate-200/70"
        style={{ margin: "0 16px", marginTop: 3 }}
      >
        <div className="mb-3 text-sm font-medium text-slate-700">同步方向</div>

        <div className="grid grid-cols-1 items-center gap-3 xl:grid-cols-[1fr_56px_1fr]">
          <div className="rounded-[18px] border border-white/80 bg-white px-3 py-3 shadow-sm transition-all hover:shadow-md">
            <DataSourceSelect
              value={sourceType}
              onChange={onSourceChange}
              placeholder="SOURCE"
              prefix="来源："
              dataSourceOptions={generateCDCDataSourceOptions()}
              width="100%"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
              <IconRightArrow />
            </div>
          </div>

          <div className="rounded-[18px] border border-white/80 bg-white px-3 py-3 shadow-sm transition-all hover:shadow-md">
            <DataSourceSelect
              value={targetType}
              onChange={onTargetChange}
              placeholder="SINK"
              prefix="去向："
              dataSourceOptions={generateDataSourceOptions()}
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholeSyncHeader;
