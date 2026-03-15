import { List, message, Spin } from "antd";

import { useMemo, useRef } from "react";

import HttpUtils from "@/utils/HttpUtils";
import {
  AlignLeftOutlined,
  DeleteOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Col, Row } from "antd";
import HealthState, { HealthStateEnum } from "./components/HealthState";
import LogDrawer from "./LogDrawer";
import FlinkIcon from "../batch-link-up/workflow/sider/icon/FlinkIcon";

const ClusterList = ({ list, clusterLoading }) => {
  const ref = useRef(null);
  const RenderItem = (itemData: any) => {
    itemData = itemData || {};

    return (
      <List.Item
        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
      >
        <div className="multi-cluster-list-item">
          <div className="multi-cluster-list-item-healthy">
            <div className="healthy-box">
              <HealthState
                state={HealthStateEnum.GOOD}
                width={70}
                height={70}
              />
            </div>
          </div>
          <div className="multi-cluster-list-item-right">
            <div className="multi-cluster-list-item-base">
              <div className="multi-cluster-list-item-base-left">
                <div className="base-name">{itemData?.names ?? "-"}</div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div className="balance-box balanced" style={{backgroundColor: "transparent"}}>
                    <FlinkIcon width="20" height="20"/>
                  </div>
                </div>
              </div>
              <div className="multi-cluster-list-item-base-date">
                {/* <span style={{ color: "#000" }}>
                  创建时间：
                  <span style={{ color: "rgba(0,0,0,0.54)" }}>
                    2026-01-14 00:00:00
                  </span>
                 
                </span> */}
                {/* <span style={{ color: '#000', marginLeft: 24 }}>最后心跳时间：</span>
                <span style={{ color: '#000' }}>
                  {moment(itemData.lastHeartbeatTime).format('YYYY-MM-DD HH:mm:ss')}
                </span> */}
              </div>
            </div>
            <div className="multi-cluster-list-item-Indicator">
              <div className="indicator-left">
                <div className="indicator-left-item">
                  <div className="indicator-left-item-title">
                    <span
                      className="indicator-left-item-title-dot"
                      style={{
                        background:
                          itemData.status === 2 ? "#FF7066" : "#34C38F",
                      }}
                    ></span>
                    {itemData.image}
                  </div>
                  <div
                    className="indicator-left-item-value"
                    style={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.54)",
                      marginLeft: 0,
                    }}
                  >
                    客户端地址：
                    <a>127.0.0.1</a>
                    {/* {itemData?.ipWithPortList.map((item, index) => (
                      <span key={item}>
                        <a href={`http://${item}`} target="_blank" rel="noopener noreferrer">
                          {item}
                        </a>
                        {index < itemData.ipWithPortList.length - 1 ? '，' : ''}
                      </span>
                    ))} */}
                  </div>
                </div>
              </div>

              <div style={{ width: "65%" }}>
                <Row>
                  <Col span={6}>
                    {/* <div>心跳时间</div>
                    <div>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}>
                        2026-01-14 00:00:00
                      </span>
                    </div> */}
                  </Col>
                  <Col span={6}>
                    {/* <div>引擎类型</div>
                    <div>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}>
                        <FlinkIcon />
                      </span>
                    </div> */}
                  </Col>
                  <Col span={6}>
                    {/* <div>映射端口</div>
                    <div>{itemData.ipWithPortList}</div> */}
                  </Col>
                  <Col span={6}>
                   <div>心跳时间</div>
                    <div>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}>
                        2026-01-14 00:00:00
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>

          <div className="multi-cluster-list-item-btn">
            <div
              className="icon"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                // showAccessCluster(itemData);

                HttpUtils.post("/api/v1/devops/container/logs", {
                  containerId: itemData?.containerId,
                }).then((data) => {
                  if (data?.code === 0) {
                    ref?.current?.setVisible(
                      true,

                      data?.data
                    );
                  } else {
                    message.error(data?.message || "获取日志失败");
                  }
                });
              }}
            >
              <AlignLeftOutlined />
            </div>

            <div
              className="icon"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                // e.stopPropagation();
              }}
            >
              <StopOutlined style={{ color: "red" }} />
            </div>

            <div
              className="icon"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                // e.stopPropagation();
              }}
            >
              <DeleteOutlined style={{ color: "red" }} />
            </div>

            {/* <div
              className="icon"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                // e.stopPropagation();
              }}
            >
              <DeleteOutlined style={{ color: 'red' }} />
            </div> */}
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <>
      <Spin spinning={clusterLoading}>
        <div style={{ height: "calc(100vh - 340px)", overflow: "auto" }}>
          {useMemo(
            () => (
              <List
                bordered={false}
                split={false}
                className="multi-cluster-list"
                itemLayout="horizontal"
                dataSource={list}
                renderItem={RenderItem}
              />
            ),
            [list]
          )}
        </div>
      </Spin>

      <LogDrawer ref={ref} />
    </>
  );
};
export default ClusterList;
