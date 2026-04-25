import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useIntl } from "@umijs/max";
import {
  DatePicker,
  Empty,
  Input,
  List,
  message,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  CalendarClock,
  CalendarDays,
  Clock3,
  SlidersHorizontal,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { seatunnelJobInstanceApi } from "./api";
import "./sync.less";
import { HistoryItem } from "./type";

interface TaskHistoryPanelProps {
  selectedItem: any;
  statusFilter: string;
  onItemSelect: (id: number) => void;
  onStatusFilterChange: (status: string) => void;
  instanceItem: any;
  setInstanceItem: (item: any) => void;
}

const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({
  selectedItem,
  statusFilter,
  onItemSelect,
  onStatusFilterChange,
  instanceItem,
  setInstanceItem,
}) => {
  const intl = useIntl();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [timeRangeType, setTimeRangeType] = useState("最近一天");

  const [customTimeRange, setCustomTimeRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const getTimeRangeParams = () => {
    const now = dayjs();

    switch (timeRangeType) {
      case "最近一天":
        return {
          queryStartTime: now.subtract(1, "day").format("YYYY-MM-DD HH:mm:ss"),
          queryEndTime: now.format("YYYY-MM-DD HH:mm:ss"),
        };
      case "最近三天":
        return {
          queryStartTime: now.subtract(3, "day").format("YYYY-MM-DD HH:mm:ss"),
          queryEndTime: now.format("YYYY-MM-DD HH:mm:ss"),
        };
      case "最近一周":
        return {
          queryStartTime: now.subtract(7, "day").format("YYYY-MM-DD HH:mm:ss"),
          queryEndTime: now.format("YYYY-MM-DD HH:mm:ss"),
        };
      case "自定义":
        return {
          queryStartTime: customTimeRange?.[0]
            ?.startOf("day")
            .format("YYYY-MM-DD HH:mm:ss"),
          queryEndTime: customTimeRange?.[1]
            ?.endOf("day")
            .format("YYYY-MM-DD HH:mm:ss"),
        };
      default:
        return {
          queryStartTime: undefined,
          queryEndTime: undefined,
        };
    }
  };

  const fetchHistory = useCallback(async () => {
    if (!selectedItem?.id) {
      setHistoryItems([]);
      return;
    }

    const { queryStartTime, queryEndTime } = getTimeRangeParams();

    setLoading(true);
    try {
      const data = await seatunnelJobInstanceApi.page({
        pageNum: 1,
        pageSize: 20,
        jobDefinitionId: selectedItem.id,
        keyword: debouncedKeyword || undefined,
        jobStatus:
          statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        queryStartTime,
        queryEndTime,
      });

      if (data?.code === 0) {
        setHistoryItems(data?.data?.bizData || []);
      } else {
        message.error(data?.message || "Load history failed");
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "pages.job.history.load.failed",
          defaultMessage: "Failed to load run history",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [
    selectedItem?.id,
    debouncedKeyword,
    statusFilter,
    timeRangeType,
    customTimeRange,
    intl,
  ]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const statusCountMap = useMemo(() => {
    return historyItems.reduce(
      (acc, item) => {
        const status = item.jobStatus || "UNKNOWN";
        acc[status] = (acc[status] || 0) + 1;
        acc.all += 1;
        return acc;
      },
      {
        all: 0,
        FINISHED: 0,
        FAILED: 0,
        RUNNING: 0,
        PENDING: 0,
      } as Record<string, number>
    );
  }, [historyItems]);

  const getStatusMeta = (status: HistoryItem["jobStatus"]) => {
    switch (status) {
      case "FAILED":
        return {
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          text: intl.formatMessage({
            id: "pages.job.history.status.failed",
            defaultMessage: "Failed",
          }),
          tagColor: "error",
          dotColor: "#ff4d4f",
          lightBg: "#fff2f0",
        };
      case "FINISHED":
        return {
          icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
          text: intl.formatMessage({
            id: "pages.job.history.status.finished",
            defaultMessage: "Success",
          }),
          tagColor: "success",
          dotColor: "#52c41a",
          lightBg: "#f6ffed",
        };
      case "RUNNING":
        return {
          icon: <SyncOutlined spin style={{ color: "#1677ff" }} />,
          text: intl.formatMessage({
            id: "pages.job.history.status.running",
            defaultMessage: "Running",
          }),
          tagColor: "processing",
          dotColor: "#1677ff",
          lightBg: "#e6f4ff",
        };
      default:
        return {
          icon: <ClockCircleOutlined style={{ color: "#8c8c8c" }} />,
          text: status || "Unknown",
          tagColor: "default",
          dotColor: "#8c8c8c",
          lightBg: "#fafafa",
        };
    }
  };

  const quickFilters = [
    {
      key: "FINISHED",
      label: intl.formatMessage({
        id: "pages.job.history.status.finished",
        defaultMessage: "Success",
      }),
      color: "#52c41a",
      count: statusCountMap.FINISHED || 0,
    },
    {
      key: "RUNNING",
      label: intl.formatMessage({
        id: "pages.job.history.status.running",
        defaultMessage: "Running",
      }),
      color: "#1677ff",
      count: statusCountMap.RUNNING || 0,
    },
    {
      key: "FAILED",
      label: intl.formatMessage({
        id: "pages.job.history.status.failed",
        defaultMessage: "Failed",
      }),
      color: "#ff4d4f",
      count: statusCountMap.FAILED || 0,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          padding: "10px 10px 8px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div />
          <ReloadOutlined
            onClick={fetchHistory}
            style={{
              fontSize: 16,
              color: "#1677ff",
              cursor: "pointer",
            }}
            title={intl.formatMessage({
              id: "pages.job.history.refresh",
              defaultMessage: "Refresh",
            })}
          />
        </div>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder={intl.formatMessage({
              id: "pages.job.history.search.placeholder",
              defaultMessage: "Search by job name",
            })}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <Segmented
            value={timeRangeType}
            onChange={(value) => setTimeRangeType(value as any)}
            block
            className="time-range-segmented"
            options={[
              {
                label: (
                  <div className="time-range-option">
                    <Clock3 size={14} />
                    <span className="time-range-option__title">最近一天</span>
                  </div>
                ),
                value: "最近一天",
              },
              {
                label: (
                  <div className="time-range-option">
                    <CalendarClock size={14} />
                    <span className="time-range-option__title">最近三天</span>
                  </div>
                ),
                value: "最近三天",
              },
              {
                label: (
                  <div className="time-range-option">
                    <CalendarDays size={14} />
                    <span className="time-range-option__title">最近一周</span>
                  </div>
                ),
                value: "最近一周",
              },
              {
                label: (
                  <div className="time-range-option">
                    <SlidersHorizontal size={14} />
                    <span className="time-range-option__title">自定义</span>
                  </div>
                ),
                value: "自定义",
              },
            ]}
          />

          {timeRangeType === "自定义" && (
            <DatePicker.RangePicker
              showTime
              style={{ width: "100%" }}
              value={customTimeRange as any}
              onChange={(values) => {
                setCustomTimeRange(
                  values ? [values[0] ?? null, values[1] ?? null] : null
                );
              }}
              placeholder={["开始时间", "结束时间"]}
              format="YYYY-MM-DD HH:mm:ss"
            />
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {quickFilters.map((item) => {
              const active = statusFilter === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() =>
                    onStatusFilterChange(active ? "all" : item.key)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 16,
                    cursor: "pointer",
                    border: active
                      ? `1px solid ${item.color}`
                      : "1px solid #f0f0f0",
                    background: active ? `${item.color}12` : "#fafafa",
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: active ? item.color : "#595959",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {item.label}({item.count})
                  </span>
                </div>
              );
            })}
          </div>
        </Space>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 8,
          background: "#fafafa",
        }}
      >
        <List
          loading={loading}
          dataSource={historyItems}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={intl.formatMessage({
                  id: "pages.job.history.empty",
                  defaultMessage: "No run history",
                })}
              />
            ),
          }}
          renderItem={(item) => {
            const meta = getStatusMeta(item.jobStatus);
            const active = instanceItem?.id === item.id;

            return (
              <List.Item
                onClick={() => {
                  setInstanceItem(item);
                  // onItemSelect?.(item.id);
                }}
                style={{
                  marginBottom: 8,
                  padding: 0,
                  border: "none",
                  background: "transparent",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    borderRadius: 12,
                    padding: "10px 12px",
                    background: active ? "#e6f4ff" : "#fff",
                    border: active ? "1px solid #91caff" : "1px solid #f0f0f0",
                    boxShadow: active
                      ? "0 2px 8px rgba(22,119,255,0.08)"
                      : "0 1px 3px rgba(0,0,0,0.03)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        minWidth: 28,
                        borderRadius: 8,
                        background: meta.lightBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 2,
                      }}
                    >
                      {meta.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <Typography.Text
                          strong
                          ellipsis
                          style={{ fontSize: 14, maxWidth: "65%" }}
                        >
                          {item.jobName || "-"}
                        </Typography.Text>

                        <Tag
                          color={meta.tagColor as any}
                          style={{
                            marginRight: 0,
                            borderRadius: 10,
                            paddingInline: 8,
                          }}
                        >
                          {meta.text}
                        </Tag>
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "#8c8c8c",
                          lineHeight: 1.6,
                        }}
                      >
                        <div>{item.startTime || "-"}</div>
                        {item.endTime ? <div>{item.endTime}</div> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default TaskHistoryPanel;
