import React from "react";
import { Button } from "antd";
import { history } from "umi";

const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "60vh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 20,
          padding: "44px 32px",
          textAlign: "center",
          border: "1px solid #edf1f7",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 18,
          }}
        >
          🫣
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1f2937",
            marginBottom: 12,
          }}
        >
          靓仔和靓女暂时还看不到这个页面哦
        </div>

        <div
          style={{
            fontSize: 15,
            color: "#667085",
            lineHeight: 1.8,
            marginBottom: 28,
          }}
        >
          页面还在打磨中，晚点再来看看吧。
        </div>

        <Button
          type="primary"
          size="large"
          onClick={() => history.push("/")}
          style={{
            height: 42,
            padding: "0 24px",
            borderRadius: 999,
            background: "#344054",
            borderColor: "#344054",
            boxShadow: "none",
          }}
        >
          返回首页
        </Button>
      </div>
    </div>
  );
};

export default App;