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
    createDataSourceOption('SQLServer', 'SQLSERVER'),
    // createDataSourceOption('SQLITE', 'SQLITE'),
    createDataSourceOption('MongoDB', 'MONGODB'),
    createDataSourceOption('DB2', 'DB2'),
    createDataSourceOption('Cache', 'CACHE'),
    // createDataSourceOption('Elasticsearch', 'ELASTICSEARCH'),
    createDataSourceOption('OpenGauss', 'OPENGUASS'),
    createDataSourceOption('Doris', 'DORIS'),
    createDataSourceOption('HIVE3', 'HIVE3'),
    createDataSourceOption('StarRocks', 'STARROCKS'),
    createDataSourceOption('ClickHouse', 'CLICKHOUSE'),
    createDataSourceOption('DaMeng', 'DAMENG'),
    createDataSourceOption('KingBase', 'KINGBASE'),
    createDataSourceOption('TiDB', 'TIDB'), 

  ];

  return (
    <Form form={form} layout="inline" onFinish={onSearch}>
      <Form.Item name="dbType" label="数据源类型">
        <Select
          style={{ width: 180 }}
          placeholder="数据源类型"
          size="small"
          showSearch
          options={dataSourceOption}
          allowClear
        />
      </Form.Item>
      <Form.Item name="dbName" label="数据源名称">
        <Input style={{ width: 180 }} placeholder="数据源名称" size="small" />
      </Form.Item>
      <Form.Item name="environment" label="所属环境">
        <Select
          style={{ width: 180 }}
          placeholder="所属环境"
          size="small"
          options={[
            { label: '开发环境', value: 'DEVELOP' },
            { label: '测试环境', value: 'TEST' },
            { label: '生产环境', value: 'PROD' },
          ]}
          allowClear
        />
      </Form.Item>
      <Form.Item name="" label="">
        <Button size="small" type="primary" htmlType="submit" style={{ padding: '4px 12px' }}>
          搜索
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SearchForm;
