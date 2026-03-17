import {
  AlignLeftOutlined,
  DeleteOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Col, List, message, Popconfirm, Row, Spin, Tag, Tooltip } from "antd";
import { useRef } from "react";

import FlinkIcon from "../batch-link-up/workflow/sider/icon/FlinkIcon";
import { SeatunnelClient, seatunnelClientApi } from "./api";
import HealthState from "./components/HealthState";
import {
  clientStatusTextMap,
  healthStatusTextMap,
  healthStatusToHealthState,
} from "./config";
import LogDrawer, { LogDrawerRef } from "./LogDrawer";

interface ClusterListProps {
  list: SeatunnelClient[];
  clusterLoading: boolean;
  onRefresh: () => void;
}

const ClusterList = ({ list, clusterLoading, onRefresh }: ClusterListProps) => {
  const ref = useRef<LogDrawerRef>(null);

  const handleViewLogs = async (itemData: SeatunnelClient) => {
    try {
      const res = await seatunnelClientApi.logs(itemData.id as number);
      if (res?.code === 0) {
        ref?.current?.setVisible(
          true,
          res?.data?.content || "",
          `${itemData?.clientName || "客户端"} - 日志`
        );
      } else {
        message.error(res?.message || "获取日志失败");
      }
    } catch (error) {
      message.error("获取日志失败");
    }
  };

  const handleDisable = async (itemData: SeatunnelClient) => {
    try {
      const res = await seatunnelClientApi.disable(itemData.id as number);
      if (res?.code === 0) {
        message.success("停用成功");
        onRefresh();
      } else {
        message.error(res?.message || "停用失败");
      }
    } catch (error) {
      message.error("停用失败");
    }
  };

  const handleDelete = async (itemData: SeatunnelClient) => {
    try {
      const res = await seatunnelClientApi.delete(itemData.id as number);
      if (res?.code === 0) {
        message.success("删除成功");
        onRefresh();
      } else {
        message.error(res?.message || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  const renderEngineIcon = (engineType?: string) => {
    if (engineType === "FLINK") {
      return <FlinkIcon width="20" height="20" />;
    }
    return (
      <div
        style={{
          minWidth: 20,
          height: 20,
          lineHeight: "20px",
          textAlign: "center",
          fontSize: 12,
          color: "#1677ff",
          fontWeight: 600,
        }}
      >
        {engineType?.slice(0, 1) || "-"}
      </div>
    );
  };

  const RenderItem = (itemData: SeatunnelClient) => {
    itemData = itemData || ({} as SeatunnelClient);

    const isDown = itemData.healthStatus === 2;
    const healthText =
      itemData.healthStatusName ||
      healthStatusTextMap[itemData.healthStatus || 0] ||
      "-";

    const clientStatusText =
      itemData.clientStatusName ||
      clientStatusTextMap[itemData.clientStatus || 0] ||
      "-";

    const handleEnable = async (itemData: SeatunnelClient) => {
      try {
        const res = await seatunnelClientApi.enable(itemData.id as number);
        if (res?.code === 0) {
          message.success("启用成功");
          onRefresh();
        } else {
          message.error(res?.message || "启用失败");
        }
      } catch (error) {
        message.error("启用失败");
      }
    };

    return (
      <List.Item
        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
      >
        <div className="multi-cluster-list-item" style={{ width: "100%" }}>
          <div className="multi-cluster-list-item-healthy">
            <div className="healthy-box">
              <HealthState
                state={healthStatusToHealthState(itemData.healthStatus)}
                width={70}
                height={70}
              />
            </div>
          </div>

          <div className="multi-cluster-list-item-right" style={{ flex: 1 }}>
            <div className="multi-cluster-list-item-base">
              <div className="multi-cluster-list-item-base-left">
                <div className="base-name">
                  {itemData?.clientName ?? "-"}
                  <Tag
                    style={{ marginLeft: 10 }}
                    color={isDown ? "error" : "success"}
                  >
                    {healthText}
                  </Tag>
                  {itemData.clientStatus === 2 ? (
                    <Popconfirm
                      title="确认启用该客户端？"
                      onConfirm={() => handleEnable(itemData)}
                    >
                      <div className="icon" style={{ cursor: "pointer" }}>
                        启用
                      </div>
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      title="确认停用该客户端？"
                      onConfirm={() => handleDisable(itemData)}
                    >
                      <div className="icon" style={{ cursor: "pointer" }}>
                        <StopOutlined style={{ color: "red" }} />
                      </div>
                    </Popconfirm>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div
                    className="balance-box balanced"
                    style={{ backgroundColor: "transparent" }}
                  >
                    {renderEngineIcon(itemData.engineType)}
                  </div>
                </div>
              </div>

              <div className="multi-cluster-list-item-base-date">
                <span style={{ color: "#000" }}>
                  创建时间：
                  <span style={{ color: "rgba(0,0,0,0.54)" }}>
                    {itemData?.createTime || "-"}
                  </span>
                </span>
              </div>
            </div>

            <div className="multi-cluster-list-item-Indicator">
              <div className="indicator-left">
                <div className="indicator-left-item">
                  <div className="indicator-left-item-title">
                    <span
                      className="indicator-left-item-title-dot"
                      style={{
                        background: isDown ? "#FF7066" : "#34C38F",
                      }}
                    />
                    {itemData.engineType || "-"}
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
                    <a>{itemData?.clientAddress || itemData?.baseUrl || "-"}</a>
                  </div>
                </div>
              </div>

              <div style={{ width: "65%" }}>
                <Row gutter={[12, 8]}>
                  <Col span={6}>
                    <div>版本</div>
                    <div>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}>
                        {itemData?.version || "-"}
                      </span>
                    </div>
                  </Col>

                  <Col span={6}>
                    <div>容器ID</div>
                    <div>
                      <Tooltip title={itemData?.containerId || "-"}>
                        <span
                          style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}
                        >
                          {itemData?.containerId || "-"}
                        </span>
                      </Tooltip>
                    </div>
                  </Col>

                  <Col span={6}>
                    <div>基础地址</div>
                    <div>
                      <Tooltip title={itemData?.baseUrl || "-"}>
                        <span
                          style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}
                        >
                          {itemData?.baseUrl || "-"}
                        </span>
                      </Tooltip>
                    </div>
                  </Col>

                  <Col span={6}>
                    <div>心跳时间</div>
                    <div>
                      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.54)" }}>
                        {itemData?.heartbeatTime || "-"}
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
                handleViewLogs(itemData);
              }}
            >
              <AlignLeftOutlined />
            </div>

            <Popconfirm
              title="确认停用该客户端？"
              onConfirm={() => handleDisable(itemData)}
            >
              <div
                className="icon"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <StopOutlined style={{ color: "red" }} />
              </div>
            </Popconfirm>

            <Popconfirm
              title="确认删除该客户端？"
              onConfirm={() => handleDelete(itemData)}
            >
              <div
                className="icon"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DeleteOutlined style={{ color: "red" }} />
              </div>
            </Popconfirm>
          </div>
        </div>
      </List.Item>
    );
  };

  return (
    <>
      <Spin spinning={clusterLoading}>
        <div style={{ height: "calc(100vh - 340px)", overflow: "auto" }}>
          <List
            bordered={false}
            split={false}
            className="multi-cluster-list"
            itemLayout="horizontal"
            dataSource={list}
            renderItem={RenderItem}
            locale={{ emptyText: "暂无客户端数据" }}
          />
        </div>
      </Spin>

      <LogDrawer ref={ref} />
    </>
  );
};

export default ClusterList;
