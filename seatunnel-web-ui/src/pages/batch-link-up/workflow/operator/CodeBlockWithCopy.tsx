import {
  CheckCircleOutlined,
  CopyOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import React, { useMemo, useState } from "react";

interface CodeBlockWithCopyProps {
  content?: string;
  height?: number;
  title?: string;
  onClose?: () => void;
}

type TokenType =
  | "brace"
  | "string"
  | "key"
  | "number"
  | "boolean"
  | "plain";

interface Token {
  text: string;
  type: TokenType;
}

const CodeBlockWithCopy: React.FC<CodeBlockWithCopyProps> = ({
  content = "",
  height = 460,
  title = "HOCON Preview",
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      const ch = line[i];

      if ("{}[]".includes(ch)) {
        tokens.push({ text: ch, type: "brace" });
        i += 1;
        continue;
      }

      if (ch === '"') {
        let j = i + 1;
        while (j < line.length) {
          if (line[j] === '"' && line[j - 1] !== "\\") break;
          j += 1;
        }
        const str = line.slice(i, Math.min(j + 1, line.length));
        tokens.push({ text: str, type: "string" });
        i = Math.min(j + 1, line.length);
        continue;
      }

      const keyMatch = line.slice(i).match(/^[A-Za-z0-9._-]+(?=\s*=)/);
      if (keyMatch) {
        tokens.push({ text: keyMatch[0], type: "key" });
        i += keyMatch[0].length;
        continue;
      }

      const boolMatch = line.slice(i).match(/^(true|false|null)\b/);
      if (boolMatch) {
        tokens.push({ text: boolMatch[0], type: "boolean" });
        i += boolMatch[0].length;
        continue;
      }

      const numberMatch = line.slice(i).match(/^\d+(\.\d+)?\b/);
      if (numberMatch) {
        tokens.push({ text: numberMatch[0], type: "number" });
        i += numberMatch[0].length;
        continue;
      }

      let j = i + 1;
      while (
        j < line.length &&
        !'{}[]"'.includes(line[j]) &&
        !line.slice(j).match(/^[A-Za-z0-9._-]+(?=\s*=)/) &&
        !line.slice(j).match(/^(true|false|null)\b/) &&
        !line.slice(j).match(/^\d+(\.\d+)?\b/)
      ) {
        j += 1;
      }

      tokens.push({ text: line.slice(i, j), type: "plain" });
      i = j;
    }

    return tokens;
  };

  const lines = useMemo(() => {
    return content.split("\n").map((line) => tokenizeLine(line));
  }, [content]);

  const getTokenClassName = (type: TokenType) => {
    switch (type) {
      case "brace":
        return "text-sky-600 font-semibold";
      case "string":
        return "text-emerald-600";
      case "key":
        return "text-slate-800 font-medium";
      case "number":
        return "text-amber-600";
      case "boolean":
        return "text-violet-600 font-medium";
      default:
        return "text-slate-700";
    }
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ height }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          {/* <div className="h-2 w-2 rounded-full bg-sky-500" /> */}
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            style={{borderRadius: 16}}
            className={[
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            {copied ? <CheckCircleOutlined /> : <CopyOutlined />}
            <span>{copied ? "已复制" : "复制代码"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              title="关闭"
            >
              <CloseOutlined />
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-auto bg-slate-50/70"
        style={{ height: `calc(${height}px - 57px)` }}
      >
        <pre className="m-0 p-5 font-mono text-[13px] leading-7">
          {lines.map((lineTokens, lineIndex) => (
            <div
              key={lineIndex}
              className="min-h-[28px] whitespace-pre-wrap break-words"
            >
              {lineTokens.map((token, tokenIndex) => (
                <span
                  key={`${lineIndex}-${tokenIndex}`}
                  className={getTokenClassName(token.type)}
                >
                  {token.text}
                </span>
              ))}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default CodeBlockWithCopy;