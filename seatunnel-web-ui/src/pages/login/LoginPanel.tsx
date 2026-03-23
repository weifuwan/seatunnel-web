import { ArrowRightOutlined, GoogleOutlined } from "@ant-design/icons";
import { useIntl, useModel } from "@umijs/max";
import { App, Button, Checkbox, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./index.less";
import { loginApi } from "./type";

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
  onPanelHoverChange?: (hovered: boolean) => void;
  onFieldFocusChange?: (field: "userName" | "userPassword" | null) => void;
  onPasswordVisibilityChange?: (visible: boolean) => void;
};

export default function LoginPanel({
  onFire,
  onPanelHoverChange,
  onFieldFocusChange,
  onPasswordVisibilityChange,
}: LoginPanelProps) {
  const [loading, setLoading] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [type] = useState<string>("account");
  const [form] = useForm();

  const lastFireRef = useRef<Record<string, number>>({});

  const fireThrottled = (key: string, type: ActionType, gapMs = 900) => {
    const now = Date.now();
    const last = lastFireRef.current[key] || 0;
    if (now - last >= gapMs) {
      lastFireRef.current[key] = now;
      onFire(type);
    }
  };

  const keyframes = `
    @keyframes stw-softFadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes stw-breathe {
      0%   { transform: scale(1); opacity: 0.9; }
      50%  { transform: scale(1.03); opacity: 1; }
      100% { transform: scale(1); opacity: 0.9; }
    }

    @keyframes stw-floatAura {
      0%   { transform: translate3d(0, 0, 0); }
      50%  { transform: translate3d(0, -6px, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  `;

  const panelBgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: `
      radial-gradient(circle at 18% 18%, rgba(120, 162, 201, 0.16), transparent 34%),
      radial-gradient(circle at 80% 12%, rgba(156, 186, 214, 0.12), transparent 28%),
      radial-gradient(circle at 72% 78%, rgba(201, 220, 234, 0.18), transparent 32%),
      linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(243,246,250,0.98) 100%)
    `,
  };

  const auraStyle: React.CSSProperties = {
    position: "absolute",
    right: "-6%",
    top: "10%",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(136,183,213,0.16) 0%, rgba(136,183,213,0.08) 42%, rgba(136,183,213,0) 72%)",
    filter: "blur(10px)",
    animation: "stw-floatAura 10s ease-in-out infinite",
    pointerEvents: "none",
  };

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "100%",
      height: "100%",
      background: "rgba(255,255,255,0.78)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(148, 163, 184, 0.14)",
      boxShadow:
        "0 12px 36px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
      padding: 28,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      zIndex: 1,
      animation: "stw-softFadeUp 420ms ease-out both",
    }),
    []
  );

  const brandWrapStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    marginTop: "9vh",
  };

  const logoShellStyle: React.CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    marginBottom: 14,
  };

  const brandTextStyle: React.CSSProperties = {
    fontWeight: 700,
    letterSpacing: 0.2,
    color: "#355f86",
    fontSize: "clamp(1.45rem, 2.8vw, 1.9rem)",
    lineHeight: 1.15,
    textAlign: "center",
    marginBottom: 6,
  };

  const subTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 13,
    color: "rgba(71, 85, 105, 0.72)",
    textAlign: "center",
  };

  const titleStyle: React.CSSProperties = {
    margin: "0 0 18px",
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 700,
    color: "#0f172a",
    textAlign: "center",
  };

  const descStyle: React.CSSProperties = {
    margin: "0 0 22px",
    fontSize: 13,
    lineHeight: 1.7,
    color: "rgba(71, 85, 105, 0.72)",
    textAlign: "center",
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: 14,
    height: 46,
    background: "rgba(248,250,252,0.92)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    height: 46,
    fontWeight: 700,
    border: "none",
    // background: "linear-gradient(135deg, #1f2937 0%, #334155 100%)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
  };

  const ghostBtnStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 999,
    height: 46,
    fontWeight: 600,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "none",
  };

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
      console.log("---");

      await form.validateFields();
      setLoading(true);

      const data = await loginApi.login({ ...values, type });

      if (data.code === 0) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: "pages.login.success",
          defaultMessage: "登录成功！",
        });

        onFire("THANKS");
        message.success(defaultLoginSuccessMessage);

        await fetchUserInfo();

        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get("redirect") || "/";
        return;
      }

      onFire("TILT");
      message.error(data?.message || "");
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });

      console.log(error);
      onFire("SHAKE");
      message.error(defaultLoginFailureMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 64px",
      }}
      onMouseEnter={() => onPanelHoverChange?.(true)}
      onMouseLeave={() => {
        onPanelHoverChange?.(false);
        onFieldFocusChange?.(null);
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
        }}
      >
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.15,
              fontWeight: 700,
              color: "#0f172a",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Welcome back!
          </h1>
          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 14,
              color: "#647b9a",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Please enter your details
          </p>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          form={form}
        >
          <Form.Item
            label={
              <span
                style={{
                  fontWeight: 500,
                  color: "black",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Email
              </span>
            }
            name="userName"
            style={{ marginBottom: 18 }}
            rules={[{ required: true, message: "Please enter your Email" }]}
          >
            <Input
              className="login-input"
              size="large"
              placeholder="you@example.com"
              onFocus={() => {
                onFieldFocusChange?.("userName");
                fireThrottled("focus_user", "SURPRISE", 1200);
              }}
              onBlur={() => onFieldFocusChange?.(null)}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                style={{
                  fontWeight: 500,
                  color: "black",
                  fontSize: "0.875rem",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Password
              </span>
            }
            name="userPassword"
            rules={[{ required: true, message: "Please enter your password" }]}
            style={{ marginBottom: 14 }}
          >
            <Input.Password
              className="login-password-input"
              size="large"
              placeholder="••••••••"
              onFocus={() => {
                onFieldFocusChange?.("userPassword");
                fireThrottled("focus_pwd", "BLINK", 1200);
              }}
              onBlur={() => onFieldFocusChange?.(null)}
              autoComplete="current-password"
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
              fontSize: 14,
            }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember for 30 days</Checkbox>
            </Form.Item>

            <Button type="link" style={{ padding: 0 }}>
              Forgot password?
            </Button>
          </div>
          <Button
            className="animated-profile-btn-v2"
            block
            type="default"
            onClick={async () => {
              try {
                console.log("---");

                await form.validateFields();
                const values = form.getFieldsValue();
                setLoading(true);

                const data = await loginApi.login({ ...values, type });

                if (data.code === 0) {
                  const defaultLoginSuccessMessage = intl.formatMessage({
                    id: "pages.login.success",
                    defaultMessage: "登录成功！",
                  });

                  onFire("THANKS");
                  message.success(defaultLoginSuccessMessage);

                  await fetchUserInfo();

                  const urlParams = new URL(window.location.href).searchParams;
                  window.location.href = urlParams.get("redirect") || "/";
                  return;
                }

                onFire("TILT");
                message.error(data?.message || "");
              } catch (error) {
                const defaultLoginFailureMessage = intl.formatMessage({
                  id: "pages.login.failure",
                  defaultMessage: "登录失败，请重试！",
                });

                console.log(error);
                onFire("SHAKE");
                message.error(defaultLoginFailureMessage);
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
          >
            <span className="default-layer">Log in</span>

            <span className="hover-layer">
              <span className="hover-label">Log in</span>
              <span className="hover-icon">
                <ArrowRightOutlined />
              </span>
            </span>
          </Button>

          <Button
            className="animated-profile-btn-v2"
            style={{
              marginTop: 14,
            }}
            block
            type="default"
            loading={loading}
          >
            <span className="default-layer">Log in with Google</span>

            <span className="hover-layer">
              <span className="hover-label">Log in with Google</span>
              <span className="hover-icon">
                <GoogleOutlined />
              </span>
            </span>
          </Button>

          <div
            style={{
              marginTop: 26,
              textAlign: "center",
              color: "rgba(71, 85, 105, 0.72)",
              fontSize: 14,
            }}
          >
            Don&apos;t have an account?{" "}
            <Button type="link" style={{ padding: 0, fontWeight: 600 }}>
              Sign Up
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
