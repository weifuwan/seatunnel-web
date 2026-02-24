import { Button, Form, Input, Select } from 'antd';
import DatabaseIcons from './icon/DatabaseIcons';

interface SearchFormProps {
  form: any;
  onSearch: (params: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ form, onSearch }) => {
  const createDataSourceOption = (dbType: any, value: any) => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DatabaseIcons dbType={dbType} width='14' height='14'/>
        {dbType}
      </div>
    ),
    value: value || dbType.toUpperCase(),
  });

  const dataSourceOption = [
    createDataSourceOption('MySql', 'MYSQL'),
    createDataSourceOption('Oracle', 'ORACLE'),
    createDataSourceOption('PostgreSql', 'POSTGRESQL'),
  ];

  return (
    <Form form={form} layout="inline" onFinish={onSearch}>
      <Form.Item name="dbType" label="DataSource Type">
        <Select
          style={{ width: 180 }}
          placeholder="DataSource Type"
          size="small"
          showSearch
          options={dataSourceOption}
          allowClear
        />
      </Form.Item>
      <Form.Item name="dbName" label="DataSource Name">
        <Input style={{ width: 180 }} placeholder="DataSource Name" size="small" />
      </Form.Item>
      <Form.Item name="environment" label="Env">
        <Select
          style={{ width: 180 }}
          placeholder="Env"
          size="small"
          showSearch
          options={[
            { label: 'DEVELOP', value: 'DEVELOP' },
            { label: 'TEST', value: 'TEST' },
            { label: 'PROD', value: 'PROD' },
          ]}
          allowClear
        />
      </Form.Item>
      <Form.Item name="" label="">
        <Button size="small" type="primary" htmlType="submit" style={{ padding: '4px 12px' }}>
          Search
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SearchForm;
