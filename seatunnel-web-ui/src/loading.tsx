import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#ffffff]">
      <div className="-translate-y-6 flex flex-col items-center">
        <div className="text-[32px] font-medium tracking-[-0.04em] text-[#3f3f46]">
          <span className="font-bold text-[#2f343d]">SeaTunnel</span> Web
        </div>

        <div className="relative mt-7 h-[3px] w-[300px] overflow-hidden rounded-full bg-[#eeeeee]">
          <div className="seatunnel-loading-bar absolute left-0 top-0 h-full rounded-full bg-[#000000]" />
        </div>

        <style>
          {`
            .seatunnel-loading-bar {
              width: 0%;
              animation: seatunnelProgressMove 3.6s ease-in-out infinite;
            }

            @keyframes seatunnelProgressMove {
              0% {
                width: 0%;
              }

              70% {
                width: 100%;
              }

              100% {
                width: 100%;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Loading;