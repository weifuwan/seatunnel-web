/**
 * SeaTunnel Web loading
 * 白底 + 圆形扩散动画
 */
(function () {
  const _root = document.querySelector('#root');

  if (_root && _root.innerHTML === '') {
    _root.innerHTML = `
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

        .stw-loading {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        .stw-ripple {
          position: relative;
          width: 72px;
          height: 72px;
        }

        .stw-ripple span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #111111;
          transform: translate(-50%, -50%) scale(0.35);
          opacity: 0;
          animation: stwRipple 1.8s ease-out infinite;
        }

        .stw-ripple span:nth-child(2) {
          animation-delay: 0.45s;
        }

        .stw-ripple span:nth-child(3) {
          animation-delay: 0.9s;
        }

        @keyframes stwRipple {
          0% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.35);
          }

          55% {
            opacity: 0.16;
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(5);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .stw-ripple span {
            animation: none !important;
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      </style>

      <div class="stw-loading">
        <div class="stw-ripple">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }
})();