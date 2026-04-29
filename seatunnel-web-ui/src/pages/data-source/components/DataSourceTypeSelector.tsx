import React, { useMemo, useState } from 'react';
import { Button, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DatabaseIcons from '../icon/DatabaseIcons';
import { COMMON_DB_OPTIONS } from '../constants';
import type { DataSourceGroup } from '../types';

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
    return dataSourceGroups.reduce(
      (total, group) => total + group.datasourceList.length,
      0,
    );
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
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-[0_6px_18px_rgba(16,24,40,0.04)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[#101828]">
              常用数据库
            </div>
            <div className="mt-1 text-xs text-[#667085]">
              可快速选择常见的数据源类型
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {COMMON_DB_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={[
                'group flex items-center gap-3 rounded-2xl border border-[#EAECF0]',
                'bg-[#FCFCFD] px-3 py-3 text-left',
                'transition-all duration-200 ease-out',
                'hover:-translate-y-0.5 hover:border-[hsl(231_48%_48%/0.35)]',
                'hover:bg-[hsl(231_48%_48%/0.04)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.06)]',
              ].join(' ')}
              onClick={() => onSelect(item.value)}
            >
              <div
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  'border border-[#EEF2F6] bg-white',
                  'transition-all duration-200 ease-out',
                  'group-hover:border-[hsl(231_48%_48%/0.18)] group-hover:bg-white',
                ].join(' ')}
              >
                <DatabaseIcons dbType={item.label} width="18px" height="18px" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#344054] transition-colors group-hover:text-[hsl(231_48%_48%)]">
                  {item.label}
                </div>
                <div className="mt-0.5 text-xs text-[#98A2B3]">
                  快速选择
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-[0_6px_18px_rgba(16,24,40,0.04)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Button
                type={selectedGroupName === null ? 'primary' : 'default'}
                size="small"
                className={[
                  '!h-8 !rounded-full !px-3 !text-xs !font-medium',
                  selectedGroupName === null
                    ? '!border-[hsl(231_48%_48%)] !bg-[hsl(231_48%_48%)]'
                    : '!border-[#EAECF0] !text-[#475467] hover:!border-[hsl(231_48%_48%/0.45)] hover:!text-[hsl(231_48%_48%)]',
                ].join(' ')}
                onClick={() => handleToggleGroup(null)}
              >
                全部
                <span
                  className={[
                    'ml-1 inline-flex min-w-[18px] justify-center rounded-full px-1.5 text-[11px]',
                    selectedGroupName === null
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F2F4F7] text-[#667085]',
                  ].join(' ')}
                >
                  {totalDatasourceCount}
                </span>
              </Button>

              {dataSourceGroups.map((group) => {
                const active = selectedGroupName === group.groupName;

                return (
                  <Button
                    key={group.groupName}
                    type={active ? 'primary' : 'default'}
                    size="small"
                    className={[
                      '!h-8 !rounded-full !px-3 !text-xs !font-medium',
                      active
                        ? '!border-[hsl(231_48%_48%)] !bg-[hsl(231_48%_48%)]'
                        : '!border-[#EAECF0] !text-[#475467] hover:!border-[hsl(231_48%_48%/0.45)] hover:!text-[hsl(231_48%_48%)]',
                    ].join(' ')}
                    onClick={() => handleToggleGroup(group.groupName)}
                  >
                    {group.groupName}
                    <span
                      className={[
                        'ml-1 inline-flex min-w-[18px] justify-center rounded-full px-1.5 text-[11px]',
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F2F4F7] text-[#667085]',
                      ].join(' ')}
                    >
                      {group.datasourceList.length}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Input
            allowClear
            prefix={<SearchOutlined className="text-[#98A2B3]" />}
            placeholder="请输入数据源类型"
            value={query}
            className={[
              '!h-10 !w-full !rounded-full !border-[#EAECF0] !px-3',
              'lg:!w-[280px]',
              'hover:!border-[hsl(231_48%_48%/0.45)]',
              'focus-within:!border-[hsl(231_48%_48%)]',
              'focus-within:!shadow-[0_0_0_3px_hsl(231_48%_48%/0.10)]',
            ].join(' ')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {flatDatasourceList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-6 py-10 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="未找到匹配的数据源类型"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {flatDatasourceList.map((item) => (
              <button
                key={`${item.groupName}-${item.dbType}`}
                type="button"
                className={[
                  'group relative flex min-h-[74px] items-center justify-between gap-3',
                  'rounded-2xl border border-[#EAECF0] bg-white px-4 py-3 text-left',
                  'transition-all duration-200 ease-out',
                  'hover:-translate-y-0.5 hover:border-[hsl(231_48%_48%/0.35)]',
                  'hover:bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFBFF_100%)]',
                  'hover:shadow-[0_10px_22px_rgba(15,23,42,0.07)]',
                ].join(' ')}
                onClick={() => onSelect(item.dbType)}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      'border border-[#EEF2F6] bg-[#F9FAFB]',
                      'transition-all duration-200 ease-out',
                      'group-hover:border-[hsl(231_48%_48%/0.18)] group-hover:bg-[hsl(231_48%_48%/0.06)]',
                    ].join(' ')}
                  >
                    <DatabaseIcons dbType={item.dbType} width="16px" height="16px" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-sm font-semibold text-[#344054] transition-colors group-hover:text-[hsl(231_48%_48%)]"
                      title={item.dbType}
                    >
                      {item.dbType}
                    </div>

                    <div className="mt-1 truncate text-xs text-[#98A2B3]">
                      {item.connectorType || item.type || '数据源'}
                    </div>
                  </div>
                </div>

                <div
                  className={[
                    'max-w-[96px] shrink-0 truncate rounded-full',
                    'bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#667085]',
                    'transition-all duration-200 ease-out',
                    'group-hover:bg-[hsl(231_48%_48%/0.08)] group-hover:text-[hsl(231_48%_48%)]',
                  ].join(' ')}
                  title={item.groupName}
                >
                  {item.groupName}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DataSourceTypeSelector;