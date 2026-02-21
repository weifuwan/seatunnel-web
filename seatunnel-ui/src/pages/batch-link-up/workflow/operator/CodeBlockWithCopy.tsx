import { CheckCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { useState } from "react";

const CodeBlockWithCopy = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // 去除 HTML 标签，获取纯文本内容
      const plainText = content.replace(/<[^>]*>/g, "");
      await navigator.clipboard.writeText(plainText);
      setCopied(true);

      // 2秒后恢复复制按钮状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("复制失败:", err);
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement("textarea");
      textArea.value = content.replace(/<[^>]*>/g, "");
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error("降级复制也失败:", copyErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const simpleHighlight = (text) => {
    if (!text) return "";

    // 只处理大括号和中括号，避免冲突
    return text
      .split("")
      .map((char) => {
        if (char === "{" || char === "}") {
          return `<span style="color: #d73a49; font-weight: 600;">${char}</span>`;
        }
        if (char === "[" || char === "]") {
          return `<span style="color: #6f42c1; font-weight: 600;">${char}</span>`;
        }
        return char;
      })
      .join("");
  };

  return (
    <div style={{ height: "70vh", overflowY: "auto", position: "relative" }}>
      {/* 复制按钮 */}
      <div
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 10,
          backgroundColor: copied ? "#52c41a" : "#1890ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "6px 12px",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        {copied ? (
          <>
            <CheckCircleOutlined />
            
          </>
        ) : (
          <>
            <CopyOutlined />
            
          </>
        )}
      </div>

      <div
        style={{
          backgroundColor: "rgb(21 90 239/0.08)",
          borderRadius: 8,
          padding: "12px",
          paddingTop: "12px", // 给复制按钮留出空间
          color: "black",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontSize: "14px",
          lineHeight: "1.5",
          overflow: "auto",
          maxHeight: "100%",
          position: "relative",
        }}
      >
        <pre style={{ margin: 0 }}>
          <code
            dangerouslySetInnerHTML={{
              __html: simpleHighlight(content),
            }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlockWithCopy;
