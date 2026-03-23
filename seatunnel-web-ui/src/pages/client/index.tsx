import { Space } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import ClientTabs from "./components/ClientTabs";
import "./index.less";

import HeroPanel from "./components/HeroPanel";
import PageHeader from "./components/PageHeader";
import QuickGlancePanel from "./components/QuickGlancePanel";
import ResourceDistributionPanel from "./components/ResourceDistributionPanel";
import RuntimeTrendPanel from "./components/RuntimeTrendPanel";
import { useClientMonitoring } from "./hooks/useClientMonitoring";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const contentSwapVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const cardHover = {
  whileHover: {
    y: -3,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const MotionDiv = motion.div;

const Index: React.FC = () => {
  const {
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    health,
    trendBars,
    resourceUsageData,
  } = useClientMonitoring();

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      style={{
        height: "100%",
        background:
          "linear-gradient(180deg, #ffffff 0%, #fcfcfd 52%, #fafafc 100%)",
        margin: "0 48px",
      }}
    >
      <div
        style={{
          height: "calc(100vh - 64px)",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          gap: 14,
        }}
      >
        <PageHeader />

        <ClientTabs
          clients={clients}
          selectedClientId={selectedClientId}
          onChange={setSelectedClientId}
        />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ minHeight: 0, overflow: "auto", paddingRight: 2 }}>
            <AnimatePresence mode="wait">
              <MotionDiv
                key={selectedClientId}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentSwapVariants}
                style={{ minHeight: "100%" }}
              >
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                  <MotionDiv variants={sectionVariants}>
                    <HeroPanel
                      selectedClient={selectedClient}
                      health={health}
                    />
                  </MotionDiv>

                  <MotionDiv
                    variants={sectionVariants}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.15fr 0.85fr",
                      gap: 14,
                    }}
                  >
                    <MotionDiv>
                      <QuickGlancePanel
                        selectedClient={selectedClient}
                        health={health}
                      />
                    </MotionDiv>

                    <MotionDiv>
                      <ResourceDistributionPanel
                        resourceUsageData={resourceUsageData}
                      />
                    </MotionDiv>
                  </MotionDiv>

                  <MotionDiv
                    variants={sectionVariants}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 14,
                    }}
                  >
                    <MotionDiv>
                      <RuntimeTrendPanel
                        selectedClient={selectedClient}
                        trendBars={trendBars}
                      />
                    </MotionDiv>
                  </MotionDiv>
                </Space>
              </MotionDiv>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default Index;
