import { Form } from "antd";
import BaseInfoSection from "./components/BaseInfoSection";
import BottomActionBar from "./components/BottomActionBar";
import ClientLinkSection from "./components/ClientLinkSection";
import ModeSection from "./components/ModeSection";
import PageHeader from "./components/PageHeader";
import { STEP_THEME } from "./constants";
import useDetailPage from "./hooks/useDetailPage";

const DetailPage = () => {
  const {
    form,
    params,
    sourceType,
    targetType,
    activeStep,
    sourceClientId,
    targetClientId,
    bridgeClientIds,
    sourceLabel,
    targetLabel,
    mode,
    scrollRef,
    baseSectionRef,
    clientSectionRef,
    setActiveStep,
    setSourceClientId,
    setTargetClientId,
    setBridgeClientIds,
    handleSourceChange,
    handleTargetChange,
    handleModeChange,
    goBack,
    goStep,
    handleNext,
  } = useDetailPage();

  if (!params) {
    return <div className="p-6 text-[#667085]">暂无数据</div>;
  }

  const isBaseStep = activeStep === "base";
  const isClientStep = activeStep === "client";

  const nextText = (() => {
    if (isBaseStep) return "下一步：客户端链接配置";
    if (mode === "GUIDE_MULTI") return "进入多表配置";
    if (mode === "SCRIPT") return "进入脚本配置";
    return "进入单表配置";
  })();

  const hintText = (() => {
    if (isBaseStep) return "先完成基础配置，再进入客户端链接配置";
    if (mode === "GUIDE_MULTI")
      return "确认客户端链接关系后，将进入多表向导配置";
    if (mode === "SCRIPT") return "确认客户端链接关系后，将进入脚本配置";
    return "确认客户端链接关系后，将进入单表向导配置";
  })();

  return (
    <div className="min-h-screen bg-white">
      <PageHeader onBack={goBack} />

      <div className="mx-auto max-w-[1540px] px-6 pb-28 pt-6">
        <div className="sticky top-0 z-20 mb-6 bg-white/95 pt-1 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goStep("base")}
              className={[
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all duration-200",
                isBaseStep
                  ? STEP_THEME.base.pill
                  : STEP_THEME.base.pillInactive,
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-200",
                  isBaseStep
                    ? STEP_THEME.base.dot
                    : STEP_THEME.base.dotInactive,
                ].join(" ")}
              >
                1
              </span>
              基础配置
            </button>

            <div className="h-px flex-1 bg-[#EAECF0]" />

            <button
              type="button"
              onClick={() => goStep("client")}
              className={[
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all duration-200",
                isClientStep
                  ? STEP_THEME.client.pill
                  : STEP_THEME.client.pillInactive,
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-200",
                  isClientStep
                    ? STEP_THEME.client.dot
                    : STEP_THEME.client.dotInactive,
                ].join(" ")}
              >
                2
              </span>
              客户端链接配置
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          style={{ height: "calc(100vh - 260px)", overflow: "auto" }}
        >
          <Form form={form} layout="vertical">
            <div className="overflow-hidden rounded-[24px] border border-[#EAECF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              {isBaseStep && (
                <>
                  <BaseInfoSection
                    sourceType={sourceType}
                    targetType={targetType}
                    handleSourceChange={handleSourceChange}
                    handleTargetChange={handleTargetChange}
                    mode={mode}
                    setMode={handleModeChange}
                  />
                </>
              )}

              {isClientStep && (
                <ClientLinkSection
                  sectionRef={clientSectionRef}
                  activeStep={activeStep}
                  sourceType={sourceType}
                  targetType={targetType}
                  sourceLabel={sourceLabel}
                  targetLabel={targetLabel}
                  sourceClientId={sourceClientId}
                  targetClientId={targetClientId}
                  bridgeClientIds={bridgeClientIds}
                  setSourceClientId={setSourceClientId}
                  setTargetClientId={setTargetClientId}
                  setBridgeClientIds={setBridgeClientIds}
                  handleSourceChange={handleSourceChange}
                  handleTargetChange={handleTargetChange}
                />
              )}
            </div>
          </Form>
        </div>
      </div>

      <BottomActionBar
        onCancel={goBack}
        onNext={handleNext}
        onPrev={isClientStep ? () => setActiveStep("base") : undefined}
        nextText={nextText}
        hintText={hintText}
      />
    </div>
  );
};

export default DetailPage;
