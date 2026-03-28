import { Form, Input } from "antd";
import DataSourceSelect, { generateDataSourceOptions } from "../../DataSourceSelect";
import IconRightArrow from "../../IconRightArrow";

const { TextArea } = Input;

interface Props {
  sourceType: any;
  targetType: any;
  sourceLabel: string;
  targetLabel: string;
  handleSourceChange: (value: string, option: any) => void;
  handleTargetChange: (value: string, option: any) => void;
  sectionRef?: React.RefObject<HTMLDivElement >;
}

const BaseInfoSection: React.FC<Props> = ({
  sourceType,
  targetType,
  sourceLabel,
  targetLabel,
  handleSourceChange,
  handleTargetChange,
  sectionRef,
}) => {
  return (
    <div ref={sectionRef} className="px-8 py-7">
      <div className="mb-6">
        <div className="text-[18px] font-semibold text-[#101828]">基础信息</div>
        <div className="mt-1 text-[14px] leading-6 text-[#667085]">
          先确定同步方向，并填写任务名称与用途说明。
        </div>
      </div>

      <Form.Item label="数据同步方式" required className="mb-6">
        <div className="rounded-2xl border border-[#E4E7EC] bg-[#FCFCFD] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <DataSourceSelect
              value={sourceType}
              onChange={handleSourceChange}
              dataSourceOptions={generateDataSourceOptions()}
              placeholder="请选择来源"
              prefix="来源："
            />

            <div className="flex items-center justify-center text-[#98A2B3]">
              <IconRightArrow />
            </div>

            <DataSourceSelect
              value={targetType}
              onChange={handleTargetChange}
              dataSourceOptions={generateDataSourceOptions()}
              placeholder="请选择去向"
              prefix="去向："
            />
          </div>

          <div className="mt-4 rounded-xl bg-white px-4 py-3 text-[13px] text-[#475467]">
            当前同步方向：
            <span className="ml-1 font-medium text-[#101828]">{sourceLabel}</span>
            <span className="mx-2 text-[#98A2B3]">→</span>
            <span className="font-medium text-[#101828]">{targetLabel}</span>
          </div>
        </div>
      </Form.Item>

      <div className="grid grid-cols-1 gap-6">
        <Form.Item
          label="任务名称"
          name="jobName"
          rules={[{ required: true, message: "请输入任务名称" }]}
          className="mb-0"
        >
          <Input
            placeholder="比如：MySQL 到 Doris 用户表同步"
            className="!h-11 !rounded-xl"
          />
        </Form.Item>

        <Form.Item label="任务描述" name="description" className="mb-0">
          <TextArea
            placeholder="简单写一下这个任务是做什么的，比如同步范围、用途、注意事项等"
            rows={4}
            className="!rounded-xl"
          />
        </Form.Item>
      </div>
    </div>
  );
};

export default BaseInfoSection;