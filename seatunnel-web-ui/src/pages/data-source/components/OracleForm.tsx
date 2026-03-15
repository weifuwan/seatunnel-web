import { Form, Input, InputNumber, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';

const OracleForm = ({ form }) => {
  // 校验 IP 地址的正则表达式
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  return (
    <div style={{ padding: '0 16px' }}>
      <Form
        form={form}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 19 }}
        initialValues={{
          auth: 'none',
        }}
        style={{ marginTop: 18 }}
      >
        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>数据源名称</div>}
          name="name"
          rules={[{ required: true, message: '数据源名称不能为空' }]}
        >
          <Input placeholder="数据源名称" maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>所属环境</div>}
          name="env"
          rules={[{ required: true, message: '数据源所属环境不能为空' }]}
        >
          <Select
            placeholder="选择所属环境"
            size="small"
            options={[
              { label: '开发环境', value: 'DEV' },
              { label: '测试环境', value: 'TEST' },
              { label: '生产环境', value: 'PRO' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>数据源描述</div>}
          name="note"
        >
          <TextArea placeholder="数据源描述" maxLength={2048} rows={4} />
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
          label={<div style={{ height: 32, lineHeight: '33px' }}>连接类型</div>}
          name="connectType"
          rules={[{ required: true, message: '连接类型' }]}
        >
          <Select size="small" options={[
            {
              label: "服务名称",
              value: "ORACLE_SERVICE_NAME"
            },
            {
              label: "SID",
              value: "ORACLE_SID"
            }
          ]}/>
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>端口</div>}
          name="port"
          rules={[{ required: true, message: '端口不能为空' }]}
        >
          <InputNumber placeholder="端口" maxLength={100} size="small" />
        </Form.Item>

        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>数据库名称</div>}
          name="database"
          rules={[{ required: true, message: '数据库名称不能为空' }]}
        >
          <Input placeholder="数据库名称" maxLength={100} size="small" />
        </Form.Item>
        
        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>用户名</div>}
          name="userName"
          rules={[{ required: true, message: '用户名不能为空' }]}
        >
          <Input placeholder="用户名" maxLength={100} size="small" />
        </Form.Item>
        
        <Form.Item
          label={<div style={{ height: 32, lineHeight: '33px' }}>密码</div>}
          name="password"
          rules={[{ required: true, message: '密码不能为空' }]}
        >
          <Input.Password placeholder="密码" maxLength={100} size="small" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default OracleForm;