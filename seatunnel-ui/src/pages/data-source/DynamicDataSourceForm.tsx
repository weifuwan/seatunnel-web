import HttpUtils from "@/utils/HttpUtils";
import {
  LoadingOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { DynamicDataSourceFormProps, FormField, FormRule } from "./type";

const DynamicDataSourceForm: React.FC<DynamicDataSourceFormProps> = ({
  dbType,
  form,
  configForm,
  operateType,
}) => {
  const [formConfig, setFormConfig] = useState<FormField[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadFormConfig();
  }, [dbType]);

  const loadFormConfig = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await HttpUtils.get<any>(
        `/api/v1/data-source/plugin/config?pluginType=${dbType}`
      );
      if (response?.code === 0) {
        setFormConfig(response?.data?.formFields || []);
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error("加载表单配置失败");
    } finally {
      setLoading(false);
    }
  };

  const renderFormItem = (field: FormField): React.ReactNode => {
    const commonProps = {
      placeholder: field.placeholder,
      onChange: () => {
        // 延迟验证，确保值已经更新
        setTimeout(() => {
          configForm.validateFields([field.key]).catch(() => {});
        }, 0);
      },
    };
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
      <Form
        form={form}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 19 }}
        // initialValues={getInitialValues(formConfig)}
      >
        <Form.Item
          label={<div style={{ height: 32, lineHeight: "33px" }}>DS Name</div>}
          name="dbName"
          rules={[{ required: true }]}
        >
          <Input placeholder="Input..." maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: "33px" }}>Env</div>}
          name="environment"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select..."
            size="small"
            options={[
              { label: "DEVELOP", value: "DEVELOP" },
              { label: "TEST", value: "TEST" },
              { label: "PROD", value: "PROD" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={
            <div style={{ height: 32, lineHeight: "33px" }}>Description</div>
          }
          name="remark"
        >
          <TextArea placeholder="Input..." size="small" rows={4} />
        </Form.Item>

        <Form.Item name="connectionParams" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Form
          form={configForm}
          initialValues={getConfigInitialValues(formConfig)}
          component={false}
        >
          {formConfig.map((field) => {
            if (field.type === "CUSTOM_SELECT") {
              return (
                <div style={{ paddingLeft: "113px" }}>
                  <Form.List name="other">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space
                            key={key}
                            style={{ display: "flex", marginBottom: 8 }}
                            align="baseline"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "key"]}
                              style={{ marginBottom: 0 }}
                              rules={[
                                { required: true, message: "key can not be null" },
                              ]}
                            >
                              <Input
                                placeholder="key"
                                size="small"
                                style={{ width: "310px" }}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              style={{ marginBottom: 0 }}
                              name={[name, "value"]}
                              rules={[
                                { required: true, message: "value can not be null" },
                              ]}
                            >
                              <Input
                                placeholder="value"
                                size="small"
                                style={{ width: "310px" }}
                              />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            size="small"
                            style={{ width: "650px" }}
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Add Database Connection Settings
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>
              );
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

          {/* 条件渲染other配置 */}
        </Form>
      </Form>
    </div>
  );
};

// 转换验证规则
const transformRules = (rules: FormRule[] | undefined): any[] => {
  if (!rules) return [];

  return rules.map((rule) => {
    const formRule: any = { message: rule.message };

    if (rule.required) {
      formRule.required = true;
    }
    return formRule;
  });
};

// 设置配置表单的初始值
const getConfigInitialValues = (
  formConfig: FormField[]
): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  formConfig.forEach((field) => {
    if (field.defaultValue !== undefined) {
      initialValues[field.key] = field.defaultValue;
    }
  });
  return initialValues;
};

// 设置主表单的初始值（如果需要的话）
const getInitialValues = (formConfig: FormField[]): Record<string, any> => {
  const configInitialValues = getConfigInitialValues(formConfig);
  return {
    config: JSON.stringify(configInitialValues),
  };
};

export default DynamicDataSourceForm;
