import { Checkbox, Divider, Input, message, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import HttpUtils from '@/utils/HttpUtils';
import { SyncOutlined } from '@ant-design/icons';
import { sortTypes, statusFilters } from './config';
import './index.less';
import ClusterList from './List';

interface ClustersState {
  liveCount: number;
  downCount: number;
  total: number;
}

export interface SearchParams {
  healthState?: number[];
  checkedKafkaVersions?: string[];
  sortInfo?: {
    sortField: string;
    sortType: string;
  };
  keywords?: string;
  clusterStatus?: number[];
  isReloadAll?: boolean;
}

const CheckboxGroup = Checkbox.Group;
const { Option } = Select;

const Index = () => {
  const [stateInfo, setStateInfo] = React.useState<ClustersState>({
    downCount: 0,
    liveCount: 1,
    total: 1,
  });

  const [list, setList] = useState([{
    names: "test",
    statusCode: "运行中"
  }]);
  const [clusterLoading, setClusterLoading] = useState<boolean>(false);
  useEffect(() => {
    
    
  }, []);

  const searchKeyword = useRef('');

  return (
    <>
      <div style={{ padding: '16px 16px' }}>
        <div className="multi-cluster-page" id="scrollableDiv">
          <div className="multi-cluster-page-fixed">
            <div className="content-container">
              <div className="multi-cluster-header">
                <div className="cluster-header-card">
                  <div className="cluster-header-card-bg-left"></div>
                  <div className="cluster-header-card-bg-right"></div>
                  <h5 className="header-card-title">
                    客户端<span className="chinese-text"> 总数</span>
                  </h5>
                  <div className="header-card-total">{stateInfo.total}</div>
                  <div className="header-card-info">
                    <div className="card-info-item card-info-item-live">
                      <div>
                        live
                        <span className="info-item-value">
                          <em>{stateInfo.liveCount}</em>
                        </span>
                      </div>
                    </div>
                    <div className="card-info-item card-info-item-down">
                      <div>
                        down
                        <span className="info-item-value">
                          <em>{stateInfo.downCount}</em>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cluster-header-filter">
                  <div className="header-filter-top">
                    <div className="header-filter-top-input">
                      <Input
                        onChange={(e) => (searchKeyword.current = e.target.value)}
                        allowClear
                        // bordered={false}
                        placeholder="请输入客户端名称进行搜索"
                        // suffix={<div onClick={searchParamsChangeFunc.onInputChange}> ggg</div>}
                      />
                    </div>
                  </div>

                  <div className="header-filter-bottom">
                    <div className="header-filter-bottom-item header-filter-bottom-item-checkbox">
                      <h3 className="header-filter-bottom-item-title">
                        节点类型
                        <div style={{ display: 'flex' }}>
                          <Checkbox.Group
                            options={[
                              { label: 'Zeta', value: 'Zeta' },
                              { label: 'Spark', value: 'Spark' },
                              { label: 'Flink', value: 'Flink' },
                            ]}
                            defaultValue={['Zeta', 'Spark', 'Flink']}
                          />
                        </div>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="multi-cluster-filter">
                <div className="multi-cluster-filter-select" style={{ alignItems: 'center' }}>
                  <div className="refresh-icon" style={{ marginLeft: 4 }}>
                    <SyncOutlined />
                  </div>

                  <Divider type="vertical" style={{ height: '2em', marginRight: 12 }} />
                  <Select defaultValue="asc" style={{ width: 170 }}>
                    {sortTypes.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="multi-cluster-filter-checkbox">
                  <CheckboxGroup  options={statusFilters}  defaultValue={[1,2]}/>
                </div>
              </div>
            </div>
          </div>
          <div className="multi-cluster-page-dashboard">
            <ClusterList list={list} clusterLoading={clusterLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
