import React from "react";
import { Button } from "antd";
import { history } from "umi";

const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#ffffff",
          borderRadius: 24,
          padding: "48px 32px",
          boxShadow: "0 12px 40px rgba(190, 170, 140, 0.12)",
          textAlign: "center",
          border: "1px solid #ece6dc",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🫣✨🐰</div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#2f2f2f",
            marginBottom: 12,
          }}
        >
          这个页面暂时还不能看哦
        </div>

        <div
          style={{
            fontSize: 16,
            color: "#6b6b6b",
            lineHeight: 1.8,
            marginBottom: 24,
          }}
        >
          功能正在偷偷打磨中～<br />
          据说 <span style={{ color: "#c28b47", fontWeight: 600 }}>长得太帅的人</span>{" "}
          会被系统自动拦截，暂时看不到这个页面 😎
          <br />
          别急，等我们修好“颜值识别系统”再来试试叭～ 🥹
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: 999,
            background: "#f6f1e8",
            color: "#9b7441",
            fontSize: 14,
            marginBottom: 28,
          }}
        >
          （小声说：其实是页面还没做完啦）🐾
        </div>

        <div style={{ fontSize: 36, marginBottom: 24 }}>૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა</div>

        <Button
          type="primary"
          size="large"
          onClick={() => history.push("/")}
          style={{
            height: 44,
            padding: "0 28px",
            borderRadius: 999,
            background: "#c28b47",
            borderColor: "#c28b47",
            boxShadow: "0 8px 20px rgba(194, 139, 71, 0.18)",
          }}
        >
          先回首页逛逛吧～
        </Button>
      </div>
    </div>
  );
};

export default App;