import React, { useMemo, useState } from 'react';
import { Button, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import DatabaseIcons from '../icon/DatabaseIcons';
import { COMMON_DB_OPTIONS } from '../constants';
import type { DataSourceGroup } from '../types';
import './index.less';

interface DataSourceTypeSelectorProps {
  dataSourceGroups: DataSourceGroup[];
  onSelect: (dbType: string) => void;
}

const DataSourceTypeSelector: React.FC<DataSourceTypeSelectorProps> = ({
  dataSourceGroups,
  onSelect,
}) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);

  const totalDatasourceCount = useMemo(() => {
    return dataSourceGroups.reduce((total, group) => total + group.datasourceList.length, 0);
  }, [dataSourceGroups]);

  const filteredGroupList = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return dataSourceGroups
      .filter((group) => selectedGroupName === null || group.groupName === selectedGroupName)
      .map((group) => ({
        groupName: group.groupName,
        datasourceList: group.datasourceList.filter((item) =>
          item.dbType.toLowerCase().includes(keyword),
        ),
      }))
      .filter((group) => group.datasourceList.length > 0);
  }, [dataSourceGroups, query, selectedGroupName]);

  const flatDatasourceList = useMemo(() => {
    return filteredGroupList.flatMap((group) =>
      group.datasourceList.map((item) => ({
        ...item,
        groupName: group.groupName,
      })),
    );
  }, [filteredGroupList]);

  const handleToggleGroup = (groupName: string | null) => {
    setSelectedGroupName((prev) => (prev === groupName ? null : groupName));
  };

  return (
    <div className="lf-ds-selector">
      <div className="lf-ds-selector__section">
        <div className="lf-ds-selector__section-header">
          <div className="lf-ds-selector__title">
            {intl.formatMessage({
              id: 'pages.datasource.filter.commonDb',
              defaultMessage: 'Common DB',
            })}
          </div>
          <div className="lf-ds-selector__subtitle">
            {intl.formatMessage({
              id: 'pages.datasource.filter.commonDb.desc',
              defaultMessage: 'Quickly choose a commonly used datasource type',
            })}
          </div>
        </div>

        <div className="lf-ds-selector__common-grid">
          {COMMON_DB_OPTIONS.map((item) => (
            <div
              key={item.value}
              className="lf-ds-selector__common-card"
              onClick={() => onSelect(item.value)}
            >
              <div className="lf-ds-selector__common-icon">
                <DatabaseIcons dbType={item.label} width="" height="" />
              </div>
              <div className="lf-ds-selector__common-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lf-ds-selector__filter-panel">
        <div className="lf-ds-selector__filter-top">
          <div className="lf-ds-selector__chip-list">
            <Button
              type={selectedGroupName === null ? 'primary' : 'default'}
              size="small"
              className="lf-ds-selector__chip"
              onClick={() => handleToggleGroup(null)}
            >
              {intl.formatMessage({
                id: 'pages.datasource.filter.all',
                defaultMessage: 'All',
              })}
              <span className="lf-ds-selector__chip-count">{totalDatasourceCount}</span>
            </Button>

            {dataSourceGroups.map((group) => (
              <Button
                key={group.groupName}
                type={selectedGroupName === group.groupName ? 'primary' : 'default'}
                size="small"
                className="lf-ds-selector__chip"
                onClick={() => handleToggleGroup(group.groupName)}
              >
                {group.groupName}
                <span className="lf-ds-selector__chip-count">{group.datasourceList.length}</span>
              </Button>
            ))}
          </div>

          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={intl.formatMessage({
              id: 'pages.datasource.filter.inputPlaceholder',
              defaultMessage: 'Search datasource type...',
            })}
            value={query}
            className="lf-ds-selector__search"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="lf-ds-selector__result-header">
          <div className="lf-ds-selector__result-title">
            {intl.formatMessage({
              id: 'pages.datasource.filter.resultTitle',
              defaultMessage: 'All datasource types',
            })}
          </div>
          <div className="lf-ds-selector__result-count">{flatDatasourceList.length}</div>
        </div>

        {flatDatasourceList.length === 0 ? (
          <div className="lf-ds-selector__empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({
                id: 'pages.datasource.filter.empty',
                defaultMessage: 'No datasource type found',
              })}
            />
          </div>
        ) : (
          <div className="lf-ds-selector__grid">
            {flatDatasourceList.map((item) => (
              <div
                key={`${item.groupName}-${item.dbType}`}
                className="lf-ds-selector__card"
                onClick={() => onSelect(item.dbType)}
              >
                <div className="lf-ds-selector__card-top">
                  <div className="lf-ds-selector__icon-wrap">
                    <DatabaseIcons dbType={item.dbType} width="" height="" />
                  </div>
                  <div className="lf-ds-selector__badge">{item.groupName}</div>
                </div>

                <div className="lf-ds-selector__card-name">{item.dbType}</div>

                <div className="lf-ds-selector__card-meta">
                  {item.connectorType || item.type || 'Datasource'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSourceTypeSelector;