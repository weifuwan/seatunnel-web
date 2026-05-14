const RealtimeFlowBridge: React.FC = () => {
  return (
    <>
      <style>
        {`
          @keyframes bridge-dash-flow {
            from {
              stroke-dashoffset: 28;
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes bridge-soft-breathe {
            0%, 100% {
              opacity: 0.45;
            }
            50% {
              opacity: 0.9;
            }
          }
        `}
      </style>

      <svg
        width="128"
        height="34"
        viewBox="0 0 128 34"
        fill="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="bridgeLineSoft" x1="0" y1="0" x2="128" y2="0">
            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="bridgeLineActive" x1="0" y1="0" x2="128" y2="0">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
            <stop offset="35%" stopColor="#6366f1" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="bridgeCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#4f66f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4f66f6" stopOpacity="0" />
          </radialGradient>

          <filter id="bridgeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 左右更细的引导线 */}
        <path
          d="M4 17H24"
          stroke="url(#bridgeLineSoft)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M104 17H124"
          stroke="url(#bridgeLineSoft)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* 左侧汇聚 */}
        <path
          d="M24 17C35 17 38 9 48 9C56 9 59 13 64 17"
          stroke="#e8edff"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M24 17C35 17 38 25 48 25C56 25 59 21 64 17"
          stroke="#e8edff"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* 右侧发散 */}
        <path
          d="M64 17C69 13 72 9 80 9C90 9 93 17 104 17"
          stroke="#e8edff"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M64 17C69 21 72 25 80 25C90 25 93 17 104 17"
          stroke="#e8edff"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* 动态高亮：上通路 */}
        <path
          d="M24 17C35 17 38 9 48 9C56 9 59 13 64 17C69 13 72 9 80 9C90 9 93 17 104 17"
          stroke="url(#bridgeLineActive)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="10 18"
          filter="url(#bridgeGlow)"
          className="animate-[bridge-dash-flow_1.4s_linear_infinite]"
        />

        {/* 动态高亮：下通路 */}
        <path
          d="M24 17C35 17 38 25 48 25C56 25 59 21 64 17C69 21 72 25 80 25C90 25 93 17 104 17"
          stroke="url(#bridgeLineActive)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="12 20"
          filter="url(#bridgeGlow)"
          className="animate-[bridge-dash-flow_1.8s_linear_infinite]"
        />

        {/* 左右节点 */}
        <circle
          cx="24"
          cy="17"
          r="1.6"
          fill="#818cf8"
          className="animate-[bridge-soft-breathe_2s_ease-in-out_infinite]"
        />
        <circle
          cx="104"
          cy="17"
          r="1.6"
          fill="#22d3ee"
          className="animate-[bridge-soft-breathe_2.2s_ease-in-out_infinite]"
        />

        {/* 中间能量核心 */}
        <circle cx="64" cy="17" r="10" fill="url(#bridgeCoreGlow)" opacity="0.55" />
        <circle cx="64" cy="17" r="3.2" fill="#4f66f6" filter="url(#bridgeGlow)" />
        <circle cx="64" cy="17" r="1.4" fill="#ffffff" opacity="0.95" />

        {/* 扩散环 */}
        <circle cx="64" cy="17" r="6" stroke="#6366f1" strokeWidth="0.9" opacity="0.35">
          <animate
            attributeName="r"
            values="6;10;6"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.35;0.08;0.35"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="64" cy="17" r="8" stroke="#22d3ee" strokeWidth="0.8" opacity="0.18">
          <animate
            attributeName="r"
            values="8;12;8"
            dur="2.8s"
            begin="0.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.18;0.04;0.18"
            dur="2.8s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* 流动粒子 1 */}
        <circle r="1.9" fill="#6366f1" filter="url(#bridgeGlow)">
          <animateMotion
            dur="1.9s"
            repeatCount="indefinite"
            path="M24 17C35 17 38 9 48 9C56 9 59 13 64 17C69 13 72 9 80 9C90 9 93 17 104 17"
          />
        </circle>

        {/* 流动粒子 2 */}
        <circle r="1.5" fill="#22d3ee" opacity="0.95" filter="url(#bridgeGlow)">
          <animateMotion
            dur="2.1s"
            begin="0.55s"
            repeatCount="indefinite"
            path="M24 17C35 17 38 25 48 25C56 25 59 21 64 17C69 21 72 25 80 25C90 25 93 17 104 17"
          />
        </circle>

        {/* 流动粒子 3：横向主链 */}
        <circle r="1.2" fill="#a5b4fc" opacity="0.8">
          <animateMotion
            dur="2.6s"
            begin="0.2s"
            repeatCount="indefinite"
            path="M4 17H24C35 17 38 9 48 9C56 9 59 13 64 17C69 21 72 25 80 25C90 25 93 17 104 17H124"
          />
        </circle>
      </svg>
    </>
  );
};

export default RealtimeFlowBridge;