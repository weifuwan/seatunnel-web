import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space } from "antd";
import { FormField } from "../../../type";

export default function CustomKVList(props: { intl: any; field: FormField }) {
  const { intl, field } = props;

  return (
    <Form.Item
      labelCol={{ span: 3 }}
      wrapperCol={{ span: 19 }}
      label={
        <div style={{ height: 32, lineHeight: "33px" }}>{field.label}</div>
      }
    >
      <Form.List name={field.key}>
        {(fields, { add, remove }) => (
          <div style={{ width: "100%" }}>
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
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: "pages.datasource.form.other.keyRequired",
                        defaultMessage: "key can not be null",
                      }),
                    },
                  ]}
                >
                  <Input
                    placeholder={intl.formatMessage({
                      id: "pages.datasource.form.other.keyPlaceholder",
                      defaultMessage: "key",
                    })}
                    size="small"
                    style={{ width: 310 }}
                  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, "value"]}
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: "pages.datasource.form.other.valueRequired",
                        defaultMessage: "value can not be null",
                      }),
                    },
                  ]}
                >
                  <Input
                    placeholder={intl.formatMessage({
                      id: "pages.datasource.form.other.valuePlaceholder",
                      defaultMessage: "value",
                    })}
                    size="small"
                    style={{ width: 310 }}
                  />
                </Form.Item>

                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="dashed"
                size="small"
                style={{ width: 650 }}
                onClick={() => add({ key: "", value: "" })}
                block
                icon={<PlusOutlined />}
              >
                {intl.formatMessage({
                  id: "pages.datasource.form.other.addConnSetting",
                  defaultMessage: "Add Database Connection Settings",
                })}
              </Button>
            </Form.Item>
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
}
