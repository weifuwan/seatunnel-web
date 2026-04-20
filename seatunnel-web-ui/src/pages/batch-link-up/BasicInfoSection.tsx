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

  return (
    <div className="m-4 rounded bg-white p-4 shadow-[0_2px_6px_#0000000d]">
      <div className="flex items-center justify-between">
        <Header
          title={
            <span className="text-sm">
              {intl.formatMessage({
                id: "pages.job.detail.basicInfo",
                defaultMessage: "Basic Info",
              })}
            </span>
          }
        />

        <div className="w-[150px]">{/* reserved actions */}</div>
      </div>

      <Descriptions
        column={2}
        labelStyle={{ color: "rgba(128,128,128,1)" }}
      >
        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.jobCode",
            defaultMessage: "Job Code",
          })}
        >
          <span className="pl-3 text-black">{item?.id || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.syncPlan",
            defaultMessage: "Sync Plan",
          })}
        >
          <div className="flex items-center pl-3 text-black">
            {item?.sourceType && (
              <DatabaseIcons dbType={item?.sourceType} width="24" height="24" />
            )}

            <span className="mx-3">{item?.sourceTable || "-"}</span>

            <IconRightArrow />

            {item?.sinkType && (
              <span className="ml-3 flex items-center">
                <DatabaseIcons dbType={item?.sinkType} width="24" height="24" />
              </span>
            )}

            <span className="mx-3">{item?.sinkTable || "-"}</span>
          </div>
        </Descriptions.Item>

        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.startTime",
            defaultMessage: "Start Time",
          })}
        >
          <span className="pl-3 text-black">{item?.startTime || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          span={4}
          label={intl.formatMessage({
            id: "pages.job.detail.endTime",
            defaultMessage: "End Time",
          })}
        >
          <span className="pl-3 text-black">{item?.endTime || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          label={intl.formatMessage({
            id: "pages.job.detail.jobVersion",
            defaultMessage: "Job Version",
          })}
        >
          <span className="pl-3 text-black">{item?.jobVersion || "-"}</span>
        </Descriptions.Item>

        <Descriptions.Item
          span={4}
          label={intl.formatMessage({
            id: "pages.job.detail.jobDescription",
            defaultMessage: "Job Description",
          })}
        >
          <span className="pl-3 text-black">{item?.jobDesc || "-"}</span>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default BasicInfoSection;