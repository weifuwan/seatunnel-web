import { Button, Form, Input, Select } from 'antd';
import DatabaseIcons from './icon/DatabaseIcons';
import { useIntl } from '@umijs/max';

interface SearchFormProps {
  form: any;
  onSearch: (params: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ form, onSearch }) => {
  const intl = useIntl();

  const createDataSourceOption = (dbType: any, value: any) => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DatabaseIcons dbType={dbType} width="14" height="14" />
        {dbType}
      </div>
    ),
    value: value || dbType.toUpperCase(),
  });

  const dataSourceOption = [
    createDataSourceOption('MySql', 'MYSQL'),
    createDataSourceOption('Oracle', 'ORACLE'),
    createDataSourceOption('PgSQL', 'PGSQL'),
  ];

  return (
    <Form form={form} layout="inline" onFinish={onSearch}>
      <Form.Item
        name="dbType"
        label={intl.formatMessage({
          id: 'pages.datasource.search.type',
          defaultMessage: 'DataSource Type',
        })}
      >
        <Select
          style={{ width: 180 }}
          placeholder={intl.formatMessage({
            id: 'pages.datasource.search.type',
            defaultMessage: 'DataSource Type',
          })}
          size="small"
          showSearch
          options={dataSourceOption}
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="name"
        label={intl.formatMessage({
          id: 'pages.datasource.search.name',
          defaultMessage: 'DataSource Name',
        })}
      >
        <Input
          style={{ width: 180 }}
          placeholder={intl.formatMessage({
            id: 'pages.datasource.search.name',
            defaultMessage: 'DataSource Name',
          })}
          size="small"
        />
      </Form.Item>

      <Form.Item
        name="environment"
        label={intl.formatMessage({
          id: 'pages.datasource.search.env',
          defaultMessage: 'Env',
        })}
      >
        <Select
          style={{ width: 180 }}
          placeholder={intl.formatMessage({
            id: 'pages.datasource.search.env',
            defaultMessage: 'Env',
          })}
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

      <Form.Item>
        <Button size="small" type="primary" htmlType="submit" style={{ padding: '4px 12px' }}>
          {intl.formatMessage({
            id: 'pages.datasource.search.button',
            defaultMessage: 'Search',
          })}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SearchForm;