/**
 * SeaTunnel Web initial loading
 * React 接管前展示一次启动动画，避免双 loading 动画
 */
(function () {
  const root = document.querySelector("#root");

  if (root && root.innerHTML === "") {
    root.innerHTML = `
      <style>
        html,
        body,
        #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          background: #ffffff;
        }

        .stw-initial-loading {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #ffffff;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            "Helvetica Neue",
            Arial,
            sans-serif;
        }

        .stw-soft-wave {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 330px;
          height: 330px;
          border-radius: 9999px;
          background: #f7f8fa;
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, -50%) scale(0.42);
          filter: blur(0.4px);
          animation-name: stwSoftWave;
          animation-duration: 1.55s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
          animation-iteration-count: 3;
          will-change: transform, opacity;
        }

        .stw-soft-wave-1 {
          animation-delay: 1.58s;
        }

        .stw-soft-wave-2 {
          width: 430px;
          height: 430px;
          background: #fafafa;
          animation-delay: 1.78s;
        }

        @keyframes stwSoftWave {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.42);
          }

          26% {
            opacity: 0.64;
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.52);
          }
        }

        .stw-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: translateY(-4px);
        }

        .stw-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: center;
          animation: stwLogoEnter 1.08s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity, filter;
        }

        .stw-logo {
          display: block;
          width: 152px;
          height: 152px;
          overflow: visible;
        }

        .stw-s-base {
          opacity: 1;
        }

        .stw-s-color {
          opacity: 0;
          animation: stwColorIn 0.56s ease-out forwards;
        }

        .stw-s-blue {
          animation-delay: 1.02s;
        }

        .stw-s-red {
          animation-delay: 1.09s;
        }

        .stw-s-yellow {
          animation-delay: 1.17s;
        }

        .stw-s-green {
          animation-delay: 1.25s;
        }

        .stw-title {
          margin-top: 28px;
          font-size: 25px;
          line-height: 1;
          font-weight: 400;
          letter-spacing: -0.035em;
          color: #5f6368;
          opacity: 0;
          transform: translateY(8px) scale(0.86);
          transform-origin: center;
          animation: stwTitleEnter 0.72s cubic-bezier(0.16, 1, 0.3, 1) 1.06s forwards;
          will-change: transform, opacity, filter;
        }

        .stw-title-main {
          font-weight: 600;
          color: #4f5358;
        }

        .stw-title-sub {
          font-weight: 400;
          color: #5f6368;
        }

        @keyframes stwLogoEnter {
          0% {
            opacity: 0;
            transform: scale(0.72);
            filter: blur(2px);
          }

          55% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform: scale(1.2);
            filter: blur(0);
          }
        }

        @keyframes stwColorIn {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes stwTitleEnter {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.86);
            filter: blur(2px);
          }

          60% {
            opacity: 1;
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes stwSoftWave {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.42);
          }

          28% {
            opacity: 0.72;
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.52);
          }
        }
      </style>

      <div class="stw-initial-loading">
        <div class="stw-soft-wave stw-soft-wave-1"></div>
        <div class="stw-soft-wave stw-soft-wave-2"></div>

        <div class="stw-content">
          <div class="stw-logo-wrap">
            <svg
              class="stw-logo"
              viewBox="0 0 132 132"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <!-- 淡灰 S 底 -->
              <path
                class="stw-s-base"
                d="
                  M91 36
                  C82 25 61 22 47 31
                  C33 40 33 55 45 63
                  C52 68 62 70 72 73
                  C85 76 96 82 98 94
                  C101 111 83 121 63 118
                  C48 116 37 109 31 98
                "
                stroke="#f1f3f4"
                stroke-width="20"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Blue -->
              <path
                class="stw-s-color stw-s-blue"
                d="
                  M91 36
                  C82 25 61 22 47 31
                  C40 35 36 41 36 47
                "
                stroke="#4285f4"
                stroke-width="20"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Red -->
              <path
                class="stw-s-color stw-s-red"
                d="
                  M36 47
                  C35 54 39 60 45 63
                  C52 68 62 70 72 73
                "
                stroke="#ea4335"
                stroke-width="20"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Yellow -->
              <path
                class="stw-s-color stw-s-yellow"
                d="
                  M72 73
                  C85 76 96 82 98 94
                  C99 101 96 106 91 111
                "
                stroke="#fbbc04"
                stroke-width="20"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Green -->
              <path
                class="stw-s-color stw-s-green"
                d="
                  M91 111
                  C84 118 73 120 63 118
                  C48 116 37 109 31 98
                "
                stroke="#34a853"
                stroke-width="20"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="stw-title">
            <span class="stw-title-main">SeaTunnel</span>
            <span class="stw-title-sub"> Web</span>
          </div>
        </div>
      </div>
    `;
  }
})();
