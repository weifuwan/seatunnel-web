// src/pages/devops/multi-cluster/index.tsx
import { Checkbox, Divider, Input, message, Select } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { SyncOutlined } from "@ant-design/icons";

import "./index.less";
import ClusterList from "./List";
import { seatunnelClientApi, SeatunnelClient } from "./api";
import {
  engineTypeOptions,
  sortFieldOptions,
  sortTypes,
  statusFilters,
} from "./config";

interface ClustersState {
  liveCount: number;
  downCount: number;
  total: number;
}

const CheckboxGroup = Checkbox.Group;
const { Option } = Select;

const Index = () => {
  const [stateInfo, setStateInfo] = React.useState<ClustersState>({
    downCount: 0,
    liveCount: 0,
    total: 0,
  });

  const [list, setList] = useState<SeatunnelClient[]>([]);
  const [clusterLoading, setClusterLoading] = useState<boolean>(false);

  const searchKeyword = useRef("");
  const keywordTimer = useRef<any>(null);

  const [engineTypes, setEngineTypes] = useState<string[]>([
    "ZETA",
    "SPARK",
    "FLINK",
  ]);
  const [healthStatusList, setHealthStatusList] = useState<number[]>([1, 2]);
  const [sortField, setSortField] = useState<string>("createTime");
  const [sortType, setSortType] = useState<"asc" | "desc">("desc");

  const loadStatistics = async () => {
    try {
      const res = await seatunnelClientApi.statistics();
      if (res?.code === 0) {
        setStateInfo({
          total: res?.data?.total || 0,
          liveCount: res?.data?.liveCount || 0,
          downCount: res?.data?.downCount || 0,
        });
      } else {
        message.error(res?.message || "获取统计信息失败");
      }
    } catch (error) {
      message.error("获取统计信息失败");
    }
  };

  const loadList = async () => {
    setClusterLoading(true);
    try {
      const res = await seatunnelClientApi.page({
        pageNo: 1,
        pageSize: 100,
        keywords: searchKeyword.current || undefined,
        engineTypes,
        healthStatusList,
        sortField,
        sortType,
      });

      if (res?.code === 0) {
        setList(res?.data?.records || []);
      } else {
        message.error(res?.message || "获取客户端列表失败");
      }
    } catch (error) {
      message.error("获取客户端列表失败");
    } finally {
      setClusterLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadStatistics(), loadList()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    loadList();
  }, [engineTypes, healthStatusList, sortField, sortType]);

  const handleKeywordChange = (value: string) => {
    searchKeyword.current = value;
    if (keywordTimer.current) {
      clearTimeout(keywordTimer.current);
    }
    keywordTimer.current = setTimeout(() => {
      loadList();
    }, 300);
  };

  return (
    <>
      <div style={{ padding: "16px 16px" }}>
        <div className="multi-cluster-page" id="scrollableDiv">
          <div className="multi-cluster-page-fixed">
            <div className="content-container">
              <div className="multi-cluster-header">
                <div className="cluster-header-card">
                  <div className="cluster-header-card-bg-left" />
                  <div className="cluster-header-card-bg-right" />
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
                        allowClear
                        placeholder="请输入客户端名称 / 地址进行搜索"
                        onChange={(e) => handleKeywordChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="header-filter-bottom">
                    <div className="header-filter-bottom-item header-filter-bottom-item-checkbox">
                      <h3 className="header-filter-bottom-item-title">
                        节点类型
                        <div style={{ display: "flex", marginTop: 8 }}>
                          <Checkbox.Group
                            options={engineTypeOptions}
                            value={engineTypes}
                            onChange={(checkedValue) =>
                              setEngineTypes(checkedValue as string[])
                            }
                          />
                        </div>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="multi-cluster-filter">
                <div
                  className="multi-cluster-filter-select"
                  style={{ alignItems: "center" }}
                >
                  <div
                    className="refresh-icon"
                    style={{ marginLeft: 4, cursor: "pointer" }}
                    onClick={refreshAll}
                    title="刷新"
                  >
                    <SyncOutlined />
                  </div>

                  <Divider
                    type="vertical"
                    style={{ height: "2em", marginRight: 12 }}
                  />

                  <Select
                    value={sortField}
                    style={{ width: 170, marginRight: 8 }}
                    onChange={(value) => setSortField(value)}
                  >
                    {sortFieldOptions.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>

                  <Select
                    value={sortType}
                    style={{ width: 120 }}
                    onChange={(value) => setSortType(value)}
                  >
                    {sortTypes.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="multi-cluster-filter-checkbox">
                  <CheckboxGroup
                    options={statusFilters}
                    value={healthStatusList}
                    onChange={(checkedValue) =>
                      setHealthStatusList(checkedValue as number[])
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="multi-cluster-page-dashboard">
            <ClusterList
              list={list}
              clusterLoading={clusterLoading}
              onRefresh={refreshAll}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;