interface BasicConfigContentProps {
  params?: any;
}

export default function BasicConfigContent({
  params,
}: BasicConfigContentProps) {
  const sourceType = params?.sourceType?.dbType || "SOURCE";
  const targetType = params?.targetType?.dbType || "SINK";
  const jobName = params?.jobName || "未命名任务";
  const description = params?.description?.trim();
  const bridgeClientId = params?.bridgeClientId || "-";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
      <div className="space-y-5">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between text-center">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400">Source</div>
              <div className="mt-1 text-[15px] font-semibold text-slate-900">
                {sourceType}
              </div>
            </div>

            <div className="px-3 text-slate-300">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="block"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400">Sink</div>
              <div className="mt-1 text-[15px] font-semibold text-slate-900">
                {targetType}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[12px] text-slate-400">名称</div>
            <div className="mt-1 text-[15px] font-semibold text-slate-900">
              {jobName}
            </div>
          </div>

          <div>
            <div className="text-[12px] text-slate-400">说明</div>
            <div className="mt-1 text-[13px] leading-6 text-slate-600">
              {description || "暂无任务描述，后续可在配置过程中补充说明。"}
            </div>
          </div>

          <div>
            <div className="text-[12px] text-slate-400">Zeta</div>
            <div className="mt-1 text-[14px] font-medium text-slate-900">
              {bridgeClientId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}