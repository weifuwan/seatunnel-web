import React from 'react';
import { Input } from 'antd';
import { useIntl } from '@umijs/max';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const intl = useIntl();

  return (
    <div className="datasource-search-bar">
      <Input
        size="large"
        allowClear
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={intl.formatMessage({
          id: 'pages.datasource.search.placeholder',
          defaultMessage: 'Search by datasource name...',
        })}
        className="datasource-search-input"
      />
    </div>
  );
};

export default SearchBar;