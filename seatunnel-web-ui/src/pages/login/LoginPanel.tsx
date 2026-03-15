import { GoogleOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useIntl, useModel } from "@umijs/max";
import {
  App,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from "antd";
import React, { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./index.less";
import SeaTunnelIcon from "./SeaTunnelIcon";
import { loginApi } from "./type";

/** 复用你已有的 ActionType */
type ActionType =
  | "BLINK"
  | "SMILE"
  | "SURPRISE"
  | "TILT"
  | "SHAKE"
  | "BOW"
  | "THANKS";

type LoginPanelProps = {
  onFire: (type: ActionType) => void;
};

export default function LoginPanel({ onFire }: LoginPanelProps) {
  const [loading, setLoading] = useState(false);

  // 简单节流：输入时别每个 keypress 都触发动作
  const lastFireRef = useRef<Record<string, number>>({});
  const fireThrottled = (key: string, type: ActionType, gapMs = 700) => {
    const now = Date.now();
    const last = lastFireRef.current[key] || 0;
    if (now - last >= gapMs) {
      lastFireRef.current[key] = now;
      onFire(type);
    }
  };

  // ====== ✨ 新增：微动效 keyframes（内联，不依赖 css 文件） ======
  const keyframes = `
    @keyframes stw-fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes stw-breath {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.06); }
    100% { transform: scale(1); }
    }
    @keyframes stw-glow {
      0%   { opacity: .35; transform: translate(-10%, -10%) scale(1); }
      50%  { opacity: .55; transform: translate(-8%, -12%) scale(1.05); }
      100% { opacity: .35; transform: translate(-10%, -10%) scale(1); }
    }
    @keyframes stw-gridShift {
      0%   { background-position: 0px 0px, 0px 0px, 0 0; }
      100% { background-position: 180px 120px, -120px 160px, 0 0; }
    }
    @keyframes stw-shine {
      0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
      35%  { opacity: .35; }
      60%  { opacity: .15; }
      100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
    }
  `;

  // ====== ✨ 新增：整体包裹层（让 SeaTunnel Web 不再单调） ======

  // 背景微动效：柔和网格 + 流动光斑（很克制）
  const animatedBgStyle: React.CSSProperties = {
    position: "absolute",
    inset: -1,
    pointerEvents: "none",
    // 三层：细网格 / 斜纹点阵 / 纯色底
    backgroundImage:
      "linear-gradient(rgba(17,24,39,0.05) 1px, transparent 1px)," +
      "linear-gradient(90deg, rgba(17,24,39,0.05) 1px, transparent 1px)," +
      "radial-gradient(circle at 20% 15%, rgba(99,102,241,0.25), transparent 55%)," +
      "radial-gradient(circle at 85% 45%, rgba(56,189,248,0.22), transparent 60%)",
    backgroundSize: "28px 28px, 28px 28px, auto, auto",
    filter: "blur(0px)",
    opacity: 1,
    animation: "stw-gridShift 12s linear infinite",
    maskImage:
      "radial-gradient(closest-side at 50% 45%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 100%)",
  };

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "100%",
      height: "100%",
      // borderRadius: 16,
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(17,24,39,0.06)",
      boxShadow:
        "0 20px 60px rgba(17, 24, 39, 0.14), 0 1px 0 rgba(255,255,255,0.6) inset",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      //   justifyContent: "center",
      position: "relative",
      zIndex: 1,
      animation: "stw-fadeUp 520ms ease-out both",
    }),
    []
  );

  // 顶部 icon：呼吸光晕 + 轻微漂浮
  const iconWrapStyle: React.CSSProperties = {
    width: 46,
    height: 46,
    borderRadius: 16,
    // background:
    //   "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(56,189,248,0.12))",
    border: "1px solid rgba(99,102,241,0.22)",
    display: "grid",
    placeItems: "center",
    marginBottom: 10,
    position: "relative",
    animation: "stw-breath 3.2s ease-in-out infinite",
    transformOrigin: "center",
  };

  const brandTextStyle: React.CSSProperties = {
    marginLeft: 10,
    fontWeight: 700,
    letterSpacing: 0.2,
    background:
      "linear-gradient(90deg, rgba(136,183,213,1), rgba(90,145,191,1), rgba(34,96,163,1))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontSize: "clamp(1.6rem, 3.2vw, 2rem)",
    lineHeight: 1.1,
    marginBottom: 12,
    textAlign: "center",
  };

  // 主按钮：微光扫过（hover/常驻都可以，这里做 hover 时更明显）
  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    height: 44,
    fontWeight: 700,
    border: "none",
    background:
      "linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(17,24,39,1) 45%, rgba(99,102,241,0.85) 100%)",
    boxShadow:
      "0 12px 30px rgba(17,24,39,0.20), 0 0 0 1px rgba(255,255,255,0.08) inset",
    position: "relative",
    overflow: "hidden",
  };

  const shineLayerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  };

  const shineBarStyle: React.CSSProperties = {
    position: "absolute",
    top: "-40%",
    left: 0,
    width: "40%",
    height: "180%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
    filter: "blur(0.5px)",
    animation: "stw-shine 2.8s ease-in-out infinite",
  };

  const [userLoginState, setUserLoginState] = useState<any>({});
  const [type, setType] = useState<string>("account");
  const { initialState, setInitialState } = useModel("@@initialState");

  const { message } = App.useApp();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const data = await loginApi.login({ ...values, type });
      if (data.code === 0) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: "pages.login.success",
          defaultMessage: "登录成功！",
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get("redirect") || "/";
        return;
      } else {
        onFire("TILT");
        message.error(data?.message || "");
      }
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };


  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{keyframes}</style>
      <div style={animatedBgStyle} />

      <div style={cardStyle}>
        {/* <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 70,
            userSelect: "none",
          }}
        >
          <div style={iconWrapStyle} aria-hidden>
            
            <div
              style={{
                width: 24,
                height: 24,
                position: "relative",
                cursor: "pointer",
                zIndex: 1,
              }}
              onClick={() => onFire("THANKS")}
              title="Hello"
            >
              <ZetaIcon />
            </div>
          </div>

          <span style={brandTextStyle}>SeaTunnel Web</span>
        </div> */}
        <div
          style={{
            position: "relative",
            margin: "0 2rem",
          }}
        >
          <div className="header_main">
            <div className="header_spinner2"></div>
            <div className="header_spinner_closer2">
              <div className="header_spinner_closer2_inner">
                <SeaTunnelIcon />
              </div>
            </div>
            <div className="header_spinner">
              <div className="innersphere innersphere1"></div>
              <div className="innersphere innersphere2"></div>
              <div className="innersphere innersphere3"></div>
              <div className="innersphere innersphere4"></div>
            </div>
            <div className="header_spinner_closer">
              <div
                style={{
                  display: "flex",
                  // marginTop: "11.5rem",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <span style={brandTextStyle}>SeaTunnel Web</span>
              </div>
            </div>
          </div>
        </div>
        <div className="portfolio_text_container">
          {/* <hr className="header_separator" /> */}
          <h1 className="portfolio_text">WelCome Back</h1>
        </div>

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label="userName"
            name="userName"
            // rules={[
            //   { required: true, message: "Please enter your email" },
            //   { type: "email", message: "Invalid email format" },
            // ]}
            style={{ marginBottom: 12 }}
          >
            <Input
              size="large"
              variant="filled"
              prefix={<MailOutlined style={{ color: "rgba(17,24,39,0.45)" }} />}
              placeholder="Enter your email"
              onFocus={() => onFire("SURPRISE")}
              onChange={() => fireThrottled("email_change", "SURPRISE", 900)}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label="userPassword"
            name="userPassword"
            rules={[{ required: true, message: "Please enter your password" }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password
              size="large"
              variant="filled"
              prefix={<LockOutlined style={{ color: "rgba(17,24,39,0.45)" }} />}
              placeholder="Enter your password"
              onFocus={() => onFire("BLINK")}
              onChange={() => fireThrottled("pwd_change", "BLINK", 900)}
              autoComplete="current-password"
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox
                style={{ color: "rgba(17,24,39,0.7)" }}
                onChange={() => fireThrottled("remember", "SMILE", 600)}
              >
                Remember for 30 days
              </Checkbox>
            </Form.Item>

            <Button
              type="link"
              style={{ padding: 0, color: "rgba(17,24,39,0.75)" }}
              onClick={() => onFire("TILT")}
            >
              Forgot password
            </Button>
          </div>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={loading}
            style={primaryBtnStyle}
            onMouseEnter={() => fireThrottled("login_hover", "SMILE", 700)}
          >
            <span style={{ position: "relative", zIndex: 1 }}>Login</span>
            <span style={shineLayerStyle} aria-hidden>
              <span style={shineBarStyle} />
            </span>
          </Button>

          <Divider style={{ margin: "14px 0" }} />

          <Button
            size="large"
            style={{
              width: "100%",
              borderRadius: 999,
              height: 44,
              fontWeight: 600,
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(17,24,39,0.10)",
            }}
            icon={<GoogleOutlined />}
            onClick={() => onFire("SHAKE")}
          >
            Log in with Google
          </Button>

          <Space
            style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
          >
            <Typography.Text style={{ color: "rgba(17,24,39,0.55)" }}>
              Don’t have an account?
            </Typography.Text>
            <Button type="link" style={{ padding: 0 }}>
              Sign up
            </Button>
          </Space>
        </Form>
      </div>
    </div>
  );
}
