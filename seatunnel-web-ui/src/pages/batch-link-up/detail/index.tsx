import { Form } from "antd";
import PageHeader from "./components/PageHeader";
import StepIndicator from "./components/StepIndicator";
import BaseInfoSection from "./components/BaseInfoSection";
import ModeSection from "./components/ModeSection";
import ClientLinkSection from "./components/ClientLinkSection";
import BottomActionBar from "./components/BottomActionBar";
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
    setSourceClientId,
    setTargetClientId,
    setBridgeClientIds,
    handleSourceChange,
    handleTargetChange,
    goBack,
    handleNext,
  } = useDetailPage();

  if (!params) {
    return <div className="p-6 text-[#667085]">暂无数据</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader onBack={goBack} />

      <div className="mx-auto max-w-[1540px] px-6 pb-28 pt-8">
        <StepIndicator activeStep={activeStep} />

        <div ref={scrollRef} style={{ height: "calc(100vh - 300px)", overflow: "auto" }}>
          <Form form={form} layout="vertical">
            <div className="overflow-hidden rounded-[24px] border border-[#EAECF0] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <BaseInfoSection
                sectionRef={baseSectionRef}
                sourceType={sourceType}
                targetType={targetType}
                sourceLabel={sourceLabel}
                targetLabel={targetLabel}
                handleSourceChange={handleSourceChange}
                handleTargetChange={handleTargetChange}
              />

              <div className="h-px bg-[#F2F4F7]" />

              <ModeSection
                mode={mode}
                setMode={(value) => form.setFieldValue("mode", value)}
              />

              <div className="h-px bg-[#F2F4F7]" />

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
            </div>
          </Form>
        </div>
      </div>

      <BottomActionBar onCancel={goBack} onNext={handleNext} />
    </div>
  );
};

export default DetailPage;