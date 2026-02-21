import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Space } from 'antd';
import { useState } from 'react';

const MySQLForm = ({ form }) => {
  // 校验 IP 地址的正则表达式
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const [show, setShow] = useState(true);
  const generateAutoName = () => {
    const now = new Date();
    const datePart = now.toLocaleDateString('zh-CN').replace(/\//g, '');
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
    return `mysql_${datePart}_${timePart}`;
    // 示例：elasticsearch_20250801_170230
  };
  return (
    <div style={{ padding: '0 16px' }}>
      <Form
        form={form}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 19 }}
        initialValues={{
          auth: 'UP',
          jdbcDriverClass: 'com.mysql.cj.jdbc.Driver',
          jdbcDriver: 'mysql-connector-java-8.0.30.jar',
          host: '127.0.0.1',
          port: '3306',
          ssh: 'false',
          environmentId: 1,
          alias: generateAutoName(),
          url: 'jdbc:mysql://127.0.0.1:3306/', // 初始值根据初始 host 和 port 设置
          other: [
            {
              key: 'useSSL',
              value: 'false',
            },
            {
              key: 'serverTimezone',
              value: 'UTC',
            },
            {
              key: 'useUnicode',
              value: 'true',
            },
            {
              key: 'characterEncoding',
              value: 'utf-8',
            },
          ],
        }}
        onValuesChange={(changedValues, allValues) => {
          // 当 host 或 port 变化时更新 URL
          if ('host' in changedValues || 'port' in changedValues) {
            const { host, port } = allValues;
            if (host && port) {
              form.setFieldsValue({
                url: `jdbc:mysql://${host}:${port}/`,
              });
            }
          }
        }}
        style={{ marginTop: 18 }}
      >
        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>数据源名称</div>}
          name="alias"
          rules={[{ required: true, message: '数据源名称不能为空' }]}
        >
          <Input placeholder="数据源名称" maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>所属环境</div>}
          name="environmentId"
          rules={[{ required: true, message: '数据源所属环境不能为空' }]}
        >
          <Select
            placeholder="选择所属环境"
            size="small"
            options={[
              { label: '开发环境', value: 1 },
              { label: '测试环境', value: 2 },
              { label: '生产环境', value: 3 },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>主机地址</div>}
          name="host"
          rules={[
            { required: true, message: '主机地址不能为空' },
            { pattern: ipRegex, message: '请输入有效的 IP 地址!' },
          ]}
        >
          <Input placeholder="主机地址 eg: 127.0.0.1" size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>数据库名称</div>}
          name="databaseName"
          rules={[{ required: true, message: '数据库名称不能为空' }]}
        >
          <Input placeholder="数据库名称" maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>端口</div>}
          name="port"
          rules={[{ required: true, message: '端口不能为空' }]}
        >
          <InputNumber placeholder="端口" maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>驱动类</div>}
          name="jdbcDriverClass"
          rules={[{ required: true, message: '驱动类不能为空' }]}
        >
          <Input placeholder="驱动类" maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>身份验证</div>}
          name="auth"
          rules={[{ required: true, message: '身份验证不能为空' }]}
        >
          <Select
            maxLength={100}
            size="small"
            style={{ width: '30%' }}
            onChange={(value) => {
              if (value == 'UP') {
                setShow(true);
              } else {
                setShow(false);
              }
            }}
            options={[
              {
                label: 'User&Password',
                value: 'UP',
              },
              {
                label: 'NONE',
                value: 'NONE',
              },
            ]}
          />
        </Form.Item>

        {show && (
          <>
            <Form.Item
              label={<div style={{ height: 32, lineHeight: '33px' }}>用户名</div>}
              name="userName"
              rules={[{ required: true, message: '用户名不能为空' }]}
            >
              <Input placeholder="用户名" size="small" />
            </Form.Item>

            <Form.Item
              label={<div style={{ height: 32, lineHeight: '33px' }}>密码</div>}
              name="password"
              rules={[{ required: true, message: '密码不能为空' }]}
            >
              <Input.Password placeholder="密码" size="small" />
            </Form.Item>
          </>
        )}
        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>URL</div>}
          name="url"
          rules={[{ required: true, message: 'URL不能为空' }]}
        >
          <Input disabled placeholder="jdbc:mysql://localhost:3306/" size="small" />
        </Form.Item>

        <div style={{ paddingLeft: '103px' }}>
          <Form.List name="other">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'key']}
                      style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: '键不能为空' }]}
                    >
                      <Select
                        placeholder="输入键"
                        size="small"
                        style={{ width: '310px' }}
                        showSearch
                        options={[
                          { label: 'useSSL', value: 'useSSL' },
                          { label: 'serverTimezone', value: 'serverTimezone' },
                          { label: 'useUnicode', value: 'useUnicode' },
                          { label: 'characterEncoding', value: 'characterEncoding' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      style={{ marginBottom: 0 }}
                      name={[name, 'value']}
                      rules={[{ required: true, message: '值不能为空' }]}
                    >
                      <Input placeholder="输入值" size="small" style={{ width: '310px' }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    size="small"
                    style={{ width: '650px' }}
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加数据库连接参数
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
      </Form>
    </div>
  );
};

export default MySQLForm;
