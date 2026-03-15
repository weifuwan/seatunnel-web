import { Button, Form, Input, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

export default function CustomKVList(props: { intl: any }) {
  const { intl } = props;

  return (
    <div style={{ paddingLeft: "113px" }}>
      <Form.List name="other">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
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
                    style={{ width: "310px" }}
                  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  style={{ marginBottom: 0 }}
                  name={[name, "value"]}
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
                {intl.formatMessage({
                  id: "pages.datasource.form.other.addConnSetting",
                  defaultMessage: "Add Database Connection Settings",
                })}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </div>
  );
}