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
import { DynamicDataSourceFormProps, FormField } from "../../type";
import CustomKVList from "./components/CustomKVList";
import DriverLocationField from "./components/DriverLocationField";
import { getConfigInitialValues, transformRules } from "./utils/formUtils";

const ENV_OPTIONS = [
  {
    value: "DEVELOP",
    label: <div>🟢 开发环境</div>,
  },
  {
    value: "TEST",
    label: <div>🟡 测试环境</div>,
  },
  {
    value: "PROD",
    label: <div>🔴 生产环境</div>,
  },
];

const DynamicDataSourceForm: React.FC<DynamicDataSourceFormProps> = ({
  dbType,
  form,
  configForm,
  operateType,
}) => {
  const intl = useIntl();

  const [formConfig, setFormConfig] = useState<FormField[]>([]);
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

        if (Object.keys(patch).length) configForm.setFieldsValue(patch);
      } else {
        // 这里识别“未安装/未初始化”，你也可以根据 message 关键字更精确判断
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

  const renderFormItem = (field: FormField): React.ReactNode => {
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
        return <Input {...commonProps} size="small" />;
      case "PASSWORD":
        return <Input.Password {...commonProps} size="small" />;
      case "SELECT":
        return (
          <Select {...commonProps} size="small">
            {field.options?.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      case "NUMBER":
        return <InputNumber {...commonProps} size="small" />;
      case "SWITCH":
        return <Switch {...commonProps} size="small" />;
      case "TEXTAREA":
        return <Input.TextArea rows={4} {...commonProps} size="small" />;
      default:
        return <Input {...commonProps} size="small" />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px ",
        }}
      >
        <LoadingOutlined />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 19 }}>
        <Form.Item
          label={
            <div style={{ height: 32, lineHeight: "33px" }}>
              {intl.formatMessage({
                id: "pages.datasource.form.dsName",
                defaultMessage: "DS Name",
              })}
            </div>
          }
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
            size="small"
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
                <InfoCircleOutlined style={{ color: "#999" }} />
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
            size="small"
            placeholder={intl.formatMessage({
              id: "pages.datasource.form.selectPlaceholder",
              defaultMessage: "Select...",
            })}
            showSearch
            options={ENV_OPTIONS}
          />
        </Form.Item>
        <Form.Item
          label={
            <div style={{ height: 32, lineHeight: "33px" }}>
              {intl.formatMessage({
                id: "pages.datasource.form.description",
                defaultMessage: "Description",
              })}
            </div>
          }
          name="remark"
        >
          <TextArea
            placeholder={intl.formatMessage({
              id: "pages.datasource.form.inputPlaceholder",
              defaultMessage: "Input...",
            })}
            size="small"
            rows={4}
          />
        </Form.Item>

        <Form.Item name="connectionParams" hidden>
          <Input type="hidden" />
        </Form.Item>

        {/* 👇 这里新增 */}
        {needInstall && (
          <div
            style={{ margin: "-8px 0 16px 0", paddingLeft: 110, marginTop: 20 }}
          >
            {/* <div style={{ marginBottom: 8, color: "rgba(0,0,0,0.65)" }}>
              {loadErrMsg || "Plugin not installed."}
            </div> */}
            <Button
              type="dashed"
              loading={installing}
              onClick={installPlugin}
              style={{ width: "70%" }}
            >
              {intl.formatMessage({
                id: "pages.datasource.form.installPlugin",
                defaultMessage: "Install Plugin",
              })}{" "}
              ({dbType}
              <DatabaseIcons dbType={dbType} height="18" width="18" />)
            </Button>
          </div>
        )}

        <Form
          form={configForm}
          initialValues={getConfigInitialValues(formConfig)}
          component={false}
        >
          {formConfig.map((field) => {
            if (field.type === "CUSTOM_SELECT") {
              return <CustomKVList key={field.key} intl={intl} />;
            }

            return (
              <Form.Item
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 19 }}
                key={field.key}
                label={
                  <div style={{ height: 32, lineHeight: "33px" }}>
                    {field.label}
                  </div>
                }
                name={field.key}
                rules={transformRules(field?.rules)}
                validateTrigger={["onChange", "onBlur"]}
              >
                {renderFormItem(field)}
              </Form.Item>
            );
          })}
        </Form>
      </Form>
    </div>
  );
};

export default DynamicDataSourceForm;
