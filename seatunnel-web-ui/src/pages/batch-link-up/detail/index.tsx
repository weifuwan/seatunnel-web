import { ArrowLeftOutlined, ProductOutlined } from "@ant-design/icons";
import { history, useParams } from "@umijs/max";
import { Button, Form, Input, Radio, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import DataSourceSelect, {
  generateDataSourceOptions,
} from "../DataSourceSelect";
import IconRightArrow from "../IconRightArrow";

const { Text } = Typography;
const { TextArea } = Input;

type SyncMode = "GUIDE_SINGLE" | "GUIDE_MULTI" | "SCRIPT";

const getDbLabel = (item: any) => {
  if (!item) return "-";
  return item?.dbType || item?.pluginName || item?.connectorType || "-";
};

const ModeCard = ({
  value,
  current,
  title,
  desc,
  tag,
  onSelect,
}: {
  value: SyncMode;
  current?: SyncMode;
  title: string;
  desc: string;
  tag?: string;
  onSelect: (value: SyncMode) => void;
}) => {
  const active = current === value;

  return (
    <div
      onClick={() => onSelect(value)}
      className={[
        "relative cursor-pointer rounded-2xl border p-5 transition-all duration-200",
        active
          ? "border-[#1677ff] bg-[#f5f9ff] shadow-[0_0_0_3px_rgba(22,119,255,0.08)]"
          : "border-[#EAECF0] bg-white hover:border-[#B2DDFF] hover:bg-[#FAFCFF]",
      ].join(" ")}
    >
      {tag ? (
        <div className="mb-3 inline-flex rounded-full bg-[#EFF8FF] px-2.5 py-1 text-xs font-medium text-[#175CD3]">
          {tag}
        </div>
      ) : null}

      <Radio value={value} className="mb-3">
        <span className="text-[15px] font-semibold text-[#101828]">
          {title}
        </span>
      </Radio>

      <div className="pl-6 text-[13px] leading-6 text-[#667085]">{desc}</div>
    </div>
  );
};

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [params, setParams] = useState<any>(null);

  const [sourceType, setSourceType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "JDBC-MYSQL",
  });

  const [targetType, setTargetType] = useState<any>({
    dbType: "MYSQL",
    connectorType: "Jdbc",
    pluginName: "Jdbc-MYSQL",
  });

  useEffect(() => {
    if (!id) return;

    const cache = sessionStorage.getItem(`batch-link-up-detail-${id}`);
    if (!cache) return;

    const data = JSON.parse(cache);
    setParams(data);

    if (data?.sourceType) setSourceType(data.sourceType);
    if (data?.targetType) setTargetType(data.targetType);

    form.setFieldsValue({
      jobName: data?.jobName || "",
      description: data?.description || "",
      mode: data?.mode || "GUIDE_SINGLE",
    });
  }, [id, form]);

  const mode = Form.useWatch("mode", form);

  const sourceLabel = useMemo(() => getDbLabel(sourceType), [sourceType]);
  const targetLabel = useMemo(() => getDbLabel(targetType), [targetType]);

  const goBack = () => {
    history.push("/sync/batch-link-up");
  };

  const handleSourceChange = (value: string, option: any) => {
    setSourceType({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleTargetChange = (value: string, option: any) => {
    setTargetType({
      dbType: value,
      connectorType: option?.connectorType,
      pluginName: option?.pluginName,
    });
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      const merged = {
        ...params,
        ...values,
        sourceType,
        targetType,
      };

      if (id) {
        sessionStorage.setItem(
          `batch-link-up-detail-${id}`,
          JSON.stringify(merged)
        );
      }

      message.success("基础配置已保存");
    } catch (error) {
      console.log(error);
    }
  };

  if (!params) {
    return <div className="p-6 text-[#667085]">暂无数据</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部头部 */}
      <div className="border-b border-[#F2F4F7] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF8FF] text-[20px] text-[#1570EF]">
              <ProductOutlined />
            </div>

            <div className="min-w-0">
              <div className="text-[22px] font-semibold leading-8 text-[#101828]">
                创建离线同步任务
              </div>
              <div className="mt-1 text-[14px] leading-6 text-[#667085]">
                先补充基础信息，再选择合适的配置方式，几步就能开始创建任务。
              </div>
            </div>
          </div>

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={goBack}
            className="!h-10 !rounded-full !border !border-[#E4E7EC] !bg-white !px-4 !text-[#344054] shadow-sm"
          >
            返回上一页
          </Button>
        </div>
      </div>

      {/* 主体 */}
      <div
        className="mx-auto max-w-[1400px] px-6 pb-28 pt-8"
        style={{ height: "calc(100vh - 200px)", overflow: "auto" }}
      >
        {/* 步骤提示 */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[#F5F9FF] px-3 py-1.5 text-sm text-[#175CD3]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1570EF] text-[12px] font-semibold text-white">
              1
            </span>
            基础配置
          </div>

          <div className="h-px flex-1 bg-[#EAECF0]" />

          <div className="flex items-center gap-2 rounded-full bg-[#F9FAFB] px-3 py-1.5 text-sm text-[#667085]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D0D5DD] text-[12px] font-semibold text-white">
              2
            </span>
            客户端链接配置
          </div>
        </div>

        <Form form={form} layout="vertical">
          <div className="overflow-hidden rounded-[24px] border border-[#EAECF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            {/* 第一块：基础信息 */}
            <div className="px-8 py-7">
              <div className="mb-6">
                <div className="text-[18px] font-semibold text-[#101828]">
                  基础信息
                </div>
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
                    <span className="ml-1 font-medium text-[#101828]">
                      {sourceLabel}
                    </span>
                    <span className="mx-2 text-[#98A2B3]">→</span>
                    <span className="font-medium text-[#101828]">
                      {targetLabel}
                    </span>
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

            <div className="h-px bg-[#F2F4F7]" />

            {/* 第二块：模式选择 */}
            <div className="px-8 py-7">
              <div className="mb-6">
                <div className="text-[18px] font-semibold text-[#101828]">
                  配置模式
                </div>
                <div className="mt-1 text-[14px] leading-6 text-[#667085]">
                  支持向导式快速创建，也支持脚本方式进行更灵活的任务编排。
                </div>
              </div>

              <Form.Item
                name="mode"
                initialValue="GUIDE_SINGLE"
                className="mb-0"
              >
                <Radio.Group className="w-full">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ModeCard
                      value="GUIDE_SINGLE"
                      current={mode}
                      title="单表向导模式"
                      desc="适合快速创建单表同步任务，配置路径更清晰，适合大多数常见场景。"
                      tag="推荐"
                      onSelect={(value) => form.setFieldValue("mode", value)}
                    />

                    <ModeCard
                      value="GUIDE_MULTI"
                      current={mode}
                      title="多表向导模式"
                      desc="适合批量配置多张表，统一管理同步关系，创建效率更高。"
                      tag="批量配置"
                      onSelect={(value) => form.setFieldValue("mode", value)}
                    />

                    <ModeCard
                      value="SCRIPT"
                      current={mode}
                      title="脚本模式"
                      desc="适合更复杂的同步场景，灵活度更高，适合熟悉任务编排的使用者。"
                      tag="高级模式"
                      onSelect={(value) => form.setFieldValue("mode", value)}
                    />
                  </div>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>

      {/* 底部操作栏 */}
      <div
        className="fixed bottom-0 right-0 z-[99] border-t border-[#EAECF0] bg-white/95 px-6 py-4 backdrop-blur"
        style={{
          left: "var(--pro-sider-current-width)",
          transition: "left var(--pro-sider-transition-duration) ease",
        }}
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4">
          <Text className="text-[14px] text-[#667085]">
            完成基础信息填写后，即可进入下一步配置
          </Text>

          <div className="flex items-center gap-3">
            <Button className="!h-10 !rounded-full !px-5" onClick={goBack}>
              取消
            </Button>

            <Button
              type="primary"
              onClick={handleNext}
              className="!h-10 !rounded-full !px-5 shadow-sm"
            >
              下一步
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
