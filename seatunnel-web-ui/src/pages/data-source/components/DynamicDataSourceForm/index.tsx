import HttpUtils from "@/utils/HttpUtils";
import { InfoCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Switch,
  Tooltip,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import DatabaseIcons from "../../icon/DatabaseIcons";
import { DynamicDataSourceFormProps } from "../../types";
import CustomKVList from "./components/CustomKVList";
import DriverLocationField from "./components/DriverLocationField";
import { getConfigInitialValues, transformRules } from "./utils/formUtils";

import { Code2, FlaskConical, ShieldCheck } from "lucide-react";

const ENV_OPTIONS = [
  {
    value: "DEVELOP",
    label: (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Code2 size={15} />
        </span>
        <span className="text-[13px] font-medium text-slate-700">开发环境</span>
      </div>
    ),
  },
  {
    value: "TEST",
    label: (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <FlaskConical size={15} />
        </span>
        <span className="text-[13px] font-medium text-slate-700">测试环境</span>
      </div>
    ),
  },
  {
    value: "PROD",
    label: (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
          <ShieldCheck size={15} />
        </span>
        <span className="text-[13px] font-medium text-slate-700">生产环境</span>
      </div>
    ),
  },
];

const cardStyle: React.CSSProperties = {
  padding: 20,
  border: "1px solid #E8EDF3",
  borderRadius: 16,
  background: "#FCFDFE",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 600,
  color: "#1F2937",
};

const sectionDescStyle: React.CSSProperties = {
  marginTop: 4,
  marginBottom: 0,
  fontSize: 13,
  color: "#667085",
  lineHeight: "22px",
};

const DynamicDataSourceForm: React.FC<DynamicDataSourceFormProps> = ({
  dbType,
  form,
  configForm,
  operateType,
}) => {
  const intl = useIntl();

  const [formConfig, setFormConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [needInstall, setNeedInstall] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [loadErrMsg, setLoadErrMsg] = useState<string>("");

  useEffect(() => {
    loadFormConfig();
  }, [dbType]);

  const loadFormConfig = async (): Promise<void> => {
    try {
      setLoading(true);
      setNeedInstall(false);
      setLoadErrMsg("");

      const response = await HttpUtils.get<any>(
        `/api/v1/data-source/plugin/config?pluginType=${dbType}`
      );

      if (response?.code === 0) {
        const fields = response?.data?.formFields || [];
        setFormConfig(fields);

        const init = getConfigInitialValues(fields);
        const current = configForm.getFieldsValue(true);

        const patch: Record<string, any> = {};
        Object.keys(init).forEach((k) => {
          const cur = current?.[k];
          if (cur === undefined || cur === null || cur === "") {
            patch[k] = init[k];
          }
        });

        if (Object.keys(patch).length) {
          configForm.setFieldsValue(patch);
        }
      } else {
        setNeedInstall(true);
        setLoadErrMsg(response?.message || "Plugin config not available");
        setFormConfig([]);
      }
    } catch (error: any) {
      setNeedInstall(true);
      setLoadErrMsg(
        error?.message ||
          intl.formatMessage({
            id: "pages.datasource.form.loadConfigFail",
            defaultMessage: "Failed to load form config",
          })
      );
      setFormConfig([]);
    } finally {
      setLoading(false);
    }
  };

  const installPlugin = async () => {
    try {
      setInstalling(true);
      const resp = await HttpUtils.post<any>(
        `/api/v1/data-source/plugin/config/install?pluginType=${dbType}`,
        {}
      );

      if (resp?.code === 0) {
        message.success("Plugin installed");
        await loadFormConfig();
      } else {
        message.error(resp?.message || "Install failed");
      }
    } catch (e: any) {
      message.error(e?.message || "Install failed");
    } finally {
      setInstalling(false);
    }
  };

  const renderFormItem = (field: any): React.ReactNode => {
    const commonProps = {
      placeholder: field.placeholder,
      onChange: () => {
        setTimeout(() => {
          configForm.validateFields([field.key]).catch(() => {});
        }, 0);
      },
    };

    if (field.key === "driverLocation") {
      return (
        <DriverLocationField
          field={field}
          dbType={dbType}
          configForm={configForm}
        />
      );
    }

    switch (field.type) {
      case "INPUT":
        return <Input {...commonProps} />;
      case "PASSWORD":
        return <Input.Password {...commonProps} />;
      case "SELECT":
        return (
          <Select {...commonProps}>
            {field.options?.map((option: any) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      case "NUMBER":
        return <InputNumber {...commonProps} style={{ width: "100%" }} />;
      case "SWITCH":
        return <Switch {...commonProps} />;
      case "TEXTAREA":
        return <Input.TextArea rows={4} {...commonProps} />;
      default:
        return <Input {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 220,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#667085",
            fontSize: 14,
          }}
        >
          <LoadingOutlined />
          <span>正在加载数据源配置...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={sectionTitleStyle}>数据源信息</h3>
        <p style={sectionDescStyle}>
          先填写基础信息，再补充当前数据源类型对应的连接参数。
        </p>
      </div>

      <Form form={form} layout="vertical">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <Form.Item
            label={intl.formatMessage({
              id: "pages.datasource.form.dsName",
              defaultMessage: "DS Name",
            })}
            name="name"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "pages.datasource.form.dsNameRequired",
                  defaultMessage: "DS Name is required",
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: "pages.datasource.form.inputPlaceholder",
                defaultMessage: "Input...",
              })}
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                {intl.formatMessage({
                  id: "pages.datasource.form.env",
                  defaultMessage: "Env",
                })}
                &nbsp;
                <Tooltip title="Deployment environment of the datasource">
                  <InfoCircleOutlined style={{ color: "#98A2B3" }} />
                </Tooltip>
              </span>
            }
            name="environment"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "pages.datasource.form.envRequired",
                  defaultMessage: "Env is required",
                }),
              },
            ]}
          >
            <Select
              placeholder={intl.formatMessage({
                id: "pages.datasource.form.selectPlaceholder",
                defaultMessage: "Select...",
              })}
              // showSearch
              options={ENV_OPTIONS}
            />
          </Form.Item>
        </div>

        <Form.Item
          label={intl.formatMessage({
            id: "pages.datasource.form.description",
            defaultMessage: "Description",
          })}
          name="remark"
        >
          <TextArea
            placeholder={intl.formatMessage({
              id: "pages.datasource.form.inputPlaceholder",
              defaultMessage: "Input...",
            })}
            rows={4}
          />
        </Form.Item>

        <Form.Item name="connectionParams" hidden>
          <Input type="hidden" />
        </Form.Item>

        {needInstall && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              border: "1px dashed #D6E4FF",
              background: "#F7FAFF",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                marginBottom: 10,
                color: "#526071",
                fontSize: 13,
                lineHeight: "22px",
              }}
            >
              当前插件配置暂不可用，可能尚未安装。请先安装对应插件后，再继续填写连接参数。
            </div>

            {loadErrMsg ? (
              <div
                style={{
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#98A2B3",
                  lineHeight: "20px",
                }}
              >
                {loadErrMsg}
              </div>
            ) : null}

            <Button
              type="default"
              loading={installing}
              onClick={installPlugin}
              style={{
                borderRadius: 10,
                height: 38,
                paddingInline: 16,
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span>
                  {intl.formatMessage({
                    id: "pages.datasource.form.installPlugin",
                    defaultMessage: "Install Plugin",
                  })}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>({dbType})</span>
                  <DatabaseIcons dbType={dbType} height="18" width="18" />
                </span>
              </span>
            </Button>
          </div>
        )}

        <div
          style={{
            marginTop: 8,
            paddingTop: 18,
            borderTop: "1px solid #EEF2F6",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={sectionTitleStyle}>连接参数</h3>
            <p style={sectionDescStyle}>
              根据当前数据源类型自动渲染配置项，建议优先填写必填字段。
            </p>
          </div>

          <Form
            form={configForm}
            initialValues={getConfigInitialValues(formConfig)}
            component={false}
            labelCol={{ flex: "110px" }}
            wrapperCol={{ flex: "1" }}
            labelAlign="left"
          >
            {formConfig.map((field) => {
              if (field.type === "CUSTOM_SELECT") {
                return (
                  <CustomKVList key={field.key} intl={intl} field={field} />
                );
              }

              return (
                <Form.Item
                  key={field.key}
                  label={field.label}
                  name={field.key}
                  rules={transformRules(field?.rules)}
                  validateTrigger={["onChange", "onBlur"]}
                  style={{ marginBottom: 18 }}
                >
                  {renderFormItem(field)}
                </Form.Item>
              );
            })}
          </Form>
        </div>
      </Form>
    </div>
  );
};

export default DynamicDataSourceForm;
