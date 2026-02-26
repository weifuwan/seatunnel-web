import { Button, Col, Divider, Input, Row } from 'antd';
import React, { useState } from 'react';

import DatabaseIcons from './icon/DatabaseIcons';
import './index.less';

interface DataSource {
  img?: string;
  onlyDiScript: boolean;
  doc: {
    reader?: string;
    writer?: string;
  };
  disabled?: boolean;
  dbType: string;
  type: string;
}

interface Group {
  groupName: string;
  datasourceList: DataSource[];
}

interface SearchFilterProps {
  data: Group[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({ data, selectSource }) => {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value.toLowerCase());
  };

  const [usedDataSource, setUsedDataSource] = useState([
    {
      label: 'MYSQL',
      value: 'MYSQL',
    },
    {
      label: 'ORACLE',
      value: 'ORACLE',
    },
    {
      label: 'PGSQL',
      value: 'PGSQL',
    },
  ]);

  const filteredData = data
    .filter((group) => selectedGroup === null || group.groupName === selectedGroup)
    .map((group) => ({
      groupName: group.groupName,
      datasourceList: group.datasourceList.filter((ds) => {
        if (ds?.dbType) {
          return ds.dbType.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      }),
    }));

  const handleGroupClick = (groupName: string) => {
    setSelectedGroup(groupName === selectedGroup ? null : groupName);
  };

  // 计算所有数据源的总数
  const totalDatasourceCount =
    data.reduce((total, group) => total + group.datasourceList.length, 0) || 0;

  return (
    <div>
      <Row>
        <Col span={3}>
          {' '}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', height: '30px' }}>
            常用数据库：
          </div>
        </Col>
        {usedDataSource.map((ds, index) => (
          <Col span={7} key={index} style={{ padding: '0px 3px' }}>
            <div className="lf-ds-card" onClick={() => selectSource(ds?.value, true)}>
              <div className="lf-ds-logo">{<DatabaseIcons dbType={ds.label} width={''} height={''} />}</div>
              <div>{ds?.label}</div>
            </div>
          </Col>
        ))}
      </Row>
      <div style={{ marginBottom: 8 }}>
        <Button
          type={selectedGroup === null ? 'primary' : 'default'}
          style={{
            marginRight: 8,
            fontSize: 12,
            marginBottom: 8,
            borderRadius: 4,
            padding: '4px 8px',
          }}
          onClick={() => handleGroupClick(null)}
          size="small"
        >
          全部( {totalDatasourceCount} )
        </Button>
        {data.map((group) => (
          <Button
            key={group.groupName}
            type={selectedGroup === group.groupName ? 'primary' : 'default'}
            style={{
              marginRight: 8,
              marginBottom: 8,
              borderRadius: 4,
              fontSize: 12,
              padding: '4px 8px',
              // fontWeight: 600,
            }}
            size="small"
            onClick={() => handleGroupClick(group.groupName)}
          >
            {group.groupName}( {group.datasourceList.length} )
          </Button>
        ))}
      </div>
      <Input
        // type="text"
        placeholder="Input..."
        value={query}
        style={{ borderRadius: 4 }}
        // enterButton="搜索"
        onChange={handleChange}
      />
      <Divider style={{ margin: '16px 0' }} />
      <Row>
        {filteredData &&
          filteredData.map((group, index) =>
            group.datasourceList.map((ds) => {
              return (
                <Col span={8} key={index} style={{ padding: '0px 4px' }}>
                  <div className="lf-ds-card" onClick={() => selectSource(ds?.dbType, true)}>
                    <div className="lf-ds-logo">{<DatabaseIcons dbType={ds.dbType} width={''} height={''} />}</div>
                    <div>{ds?.dbType}</div>
                  </div>
                </Col>
              );
            }),
          )}
      </Row>
    </div>
  );
};

export default SearchFilter;
