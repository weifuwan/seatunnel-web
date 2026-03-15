import Header from "@/components/Header";
import { Descriptions } from "antd";
import React from "react";
import { useIntl } from "@umijs/max";
import DatabaseIcons from "../data-source/icon/DatabaseIcons";
import IconRightArrow from "./IconRightArrow";

interface TaskDetailPanelProps {
  item: any;
}

const BasicInfoSection: React.FC<TaskDetailPanelProps> = ({ item }) => {
  const intl = useIntl();

  const labelStyle = { color: "rgba(128,128,128,1)" };

  return (
    <div
      style={{
        margin: 16,
        padding: 16,
        background: "#fff",
        borderRadius: 4,
        boxShadow: "0 2px 6px #0000000d",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Header
          title={
            <span style={{ fontSize: 14 }}>
              {intl.formatMessage({
                id: "pages.job.detail.basicInfo",
                defaultMessage: "Basic Info",
              })}
            </span>
          }
        />

        <div style={{ width: 150 }}>{/* reserved actions */}</div>
      </div>

      <Descriptions column={2}>
        {/* Job Code */}
        <Descriptions.Item
          label={
            <span style={labelStyle}>
              {intl.formatMessage({
                id: "pages.job.detail.jobCode",
                defaultMessage: "Job Code",
              })}
            </span>
          }
        >
          <span style={{ color: "#000", paddingLeft: 12 }}>
            {item?.id || "-"}
          </span>
        </Descriptions.Item>

        {/* Sync Plan */}
        <Descriptions.Item
          label={
            <span style={labelStyle}>
              {intl.formatMessage({
                id: "pages.job.detail.syncPlan",
                defaultMessage: "Sync Plan",
              })}
            </span>
          }
        >
          <div
            style={{
              color: "#000",
              paddingLeft: 12,
              display: "flex",
              alignItems: "center",
            }}
          >
            {item?.sourceType && (
              <DatabaseIcons dbType={item?.sourceType} width="24" height="24" />
            )}

            &nbsp;&nbsp;&nbsp;
            {item?.sourceType}
            &nbsp;&nbsp;&nbsp;

            <IconRightArrow />

            &nbsp;&nbsp;&nbsp;

            {item?.sinkType && (
              <DatabaseIcons dbType={item?.sinkType} width="24" height="24" />
            )}

            &nbsp;&nbsp;&nbsp;
            {item?.sinkType}
          </div>
        </Descriptions.Item>

        {/* Start Time */}
        <Descriptions.Item
          label={
            <span style={labelStyle}>
              {intl.formatMessage({
                id: "pages.job.detail.startTime",
                defaultMessage: "Start Time",
              })}
            </span>
          }
        >
          <span style={{ color: "#000", paddingLeft: 12 }}>
            {item?.startTime || "-"}
          </span>
        </Descriptions.Item>

        {/* End Time */}
        <Descriptions.Item
          span={4}
          label={
            <span style={labelStyle}>
              {intl.formatMessage({
                id: "pages.job.detail.endTime",
                defaultMessage: "End Time",
              })}
            </span>
          }
        >
          <span style={{ color: "#000", paddingLeft: 12 }}>
            {item?.endTime || "-"}
          </span>
        </Descriptions.Item>

        {/* Job Version */}
        <Descriptions.Item
          label={
            <span style={labelStyle}>
              {intl.formatMessage({
                id: "pages.job.detail.jobVersion",
                defaultMessage: "Job Version",
              })}
            </span>
          }
        >
          <span style={{ color: "#000", paddingLeft: 12 }}>
            {item?.jobVersion || "-"}
          </span>
        </Descriptions.Item>

        {/* Job Description */}
        <Descriptions.Item
          span={4}
          label={
            <span style={labelStyle}>
              {intl.formatMessage({
                id: "pages.job.detail.jobDescription",
                defaultMessage: "Job Description",
              })}
            </span>
          }
        >
          <span style={{ color: "#000", paddingLeft: 12 }}>
            {item?.jobDesc || "-"}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default BasicInfoSection;