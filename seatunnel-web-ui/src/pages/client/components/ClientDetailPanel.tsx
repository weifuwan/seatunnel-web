import { ApiOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { BLUE, MotionDiv, contentSwapVariants } from "../constants";
import ClientMetricsSection from "./ClientMetricsSection";

interface Props {
  selectedClient: any;
  selectedClientId?: number;
  healthMeta: any;
  metrics: any;
  metricsLoading: boolean;
  onRefresh: (id?: number) => void;
}

const ClientDetailPanel: React.FC<Props> = ({
  selectedClient,
  selectedClientId,
  healthMeta,
  metrics,
  metricsLoading,
  onRefresh,
}) => {
  const displayBaseUrl =
    selectedClient?.baseUrl?.replace(/^https?:\/\//, "") || "--";
  return (
    <AnimatePresence mode="wait">
      <MotionDiv
        key={selectedClientId}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={contentSwapVariants}
        className="min-h-full"
      >
        <div className="mb-5">
          <div className="mb-[18px] flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "#EEF4FF", color: BLUE }}
                >
                  <ApiOutlined />
                </div>

                <h1 className="m-0 text-[20px] font-bold leading-8 text-[#101828]">
                  {selectedClient?.clientName || "Client 详情"}
                </h1>
              </div>

              <div className="mt-3 flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="
    inline-flex items-center gap-2.5 rounded-[18px]
    border border-[#E3E8F2] bg-[#F7F9FC]
    px-4 py-2.5
    text-[14px] font-semibold text-[#344054]
    shadow-[0_2px_8px_rgba(16,24,40,0.04)]
  "
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EDF1F7]">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#667085]" />
                    </span>

                    <span className="break-all">{displayBaseUrl}</span>
                  </div>
                </div>
                <div
                  className="inline-flex w-fit max-w-[760px] items-center gap-2 text-[14px] leading-[1.8] text-[#667085]"
                  style={{ marginLeft: 26 }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                  <span>{healthMeta.desc}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold ${healthMeta.badge}`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${healthMeta.dot}`}
                />
                {healthMeta.label}
              </div>

              <Button
                icon={<ReloadOutlined />}
                loading={metricsLoading}
                onClick={() => onRefresh(selectedClientId)}
                className="h-10 rounded-3xl border-[#E4E7EC] text-[#475467]"
              >
                刷新指标
              </Button>
            </div>
          </div>
        </div>

        <ClientMetricsSection
          metrics={metrics}
          metricsLoading={metricsLoading}
        />
      </MotionDiv>
    </AnimatePresence>
  );
};

export default ClientDetailPanel;
