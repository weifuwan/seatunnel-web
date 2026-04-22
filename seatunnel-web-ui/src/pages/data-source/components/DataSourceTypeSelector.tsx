import React, { useMemo, useState } from 'react';
import { Button, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DatabaseIcons from '../icon/DatabaseIcons';
import { COMMON_DB_OPTIONS } from '../constants';
import type { DataSourceGroup } from '../types';
import './source.less';

interface DataSourceTypeSelectorProps {
  dataSourceGroups: DataSourceGroup[];
  onSelect: (dbType: string) => void;
}

const DataSourceTypeSelector: React.FC<DataSourceTypeSelectorProps> = ({
  dataSourceGroups,
  onSelect,
}) => {
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
          `${item.dbType} ${item.connectorType || ''} ${item.type || ''}`
            .toLowerCase()
            .includes(keyword),
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
          <div>
            <div className="lf-ds-selector__title">常用数据库</div>
            <div className="lf-ds-selector__subtitle">可快速选择常见的数据源类型</div>
          </div>
        </div>

        <div className="lf-ds-selector__common-grid">
          {COMMON_DB_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="lf-ds-selector__common-card"
              onClick={() => onSelect(item.value)}
            >
              <div className="lf-ds-selector__common-icon">
                <DatabaseIcons dbType={item.label} width="18px" height="18px" />
              </div>
              <div className="lf-ds-selector__common-content">
                <div className="lf-ds-selector__common-label">{item.label}</div>
                <div className="lf-ds-selector__common-desc">快速选择</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lf-ds-selector__filter-panel">
        <div className="lf-ds-selector__toolbar">
          <div className="lf-ds-selector__toolbar-left">
            <div className="lf-ds-selector__chip-list">
              <Button
                type={selectedGroupName === null ? 'primary' : 'default'}
                size="small"
                className="lf-ds-selector__chip"
                onClick={() => handleToggleGroup(null)}
              >
                全部
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
          </div>

          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="请输入数据源类型"
            value={query}
            className="lf-ds-selector__search"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        

        {flatDatasourceList.length === 0 ? (
          <div className="lf-ds-selector__empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到匹配的数据源类型" />
          </div>
        ) : (
          <div className="lf-ds-selector__grid">
            {flatDatasourceList.map((item) => (
              <button
                key={`${item.groupName}-${item.dbType}`}
                type="button"
                className="lf-ds-selector__card"
                onClick={() => onSelect(item.dbType)}
              >
                <div className="lf-ds-selector__card-main">
                  <div className="lf-ds-selector__icon-wrap">
                    <DatabaseIcons dbType={item.dbType} width="16px" height="16px" />
                  </div>

                  <div className="lf-ds-selector__card-content">
                    <div className="lf-ds-selector__card-name" title={item.dbType}>
                      {item.dbType}
                    </div>

                    <div className="lf-ds-selector__card-meta">
                      {item.connectorType || item.type || '数据源'}
                    </div>
                  </div>
                </div>

                <div className="lf-ds-selector__badge" title={item.groupName}>
                  {item.groupName}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSourceTypeSelector;