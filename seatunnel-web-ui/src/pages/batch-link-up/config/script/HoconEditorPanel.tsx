import { Input, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const DEFAULT_TEMPLATE = `env {
  job.mode = "BATCH"
  parallelism = 1
}

source {
  # 例如：
  # Jdbc {
  #   url = "jdbc:mysql://127.0.0.1:3306/demo"
  #   user = "root"
  #   password = "123456"
  #   query = "select * from t_user"
  # }
}

sink {
  # 例如：
  # Console {}
}
`;

interface ValidateResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingBlocks: string[];
}

function simpleFormatHocon(input: string) {
  const lines = input.split("\n");
  let indent = 0;

  return lines
    .map((raw) => {
      const line = raw.trim();
      if (!line) return "";

      if (line.startsWith("}")) {
        indent = Math.max(indent - 1, 0);
      }

      const formatted = `${"  ".repeat(indent)}${line}`;

      if (line.endsWith("{")) {
        indent += 1;
      }

      return formatted;
    })
    .join("\n");
}

function validateHocon(content: string): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingBlocks: string[] = [];

  const text = content.trim();

  if (!text) {
    return {
      valid: false,
      errors: ["HOCON 内容不能为空"],
      warnings: [],
      missingBlocks: ["env", "source", "sink"],
    };
  }

  const hasEnv = /\benv\s*\{/m.test(text);
  const hasSource = /\bsource\s*\{/m.test(text);
  const hasSink = /\bsink\s*\{/m.test(text);

  if (!hasEnv) missingBlocks.push("env");
  if (!hasSource) missingBlocks.push("source");
  if (!hasSink) missingBlocks.push("sink");

  let braceCount = 0;
  for (const ch of text) {
    if (ch === "{") braceCount += 1;
    if (ch === "}") braceCount -= 1;
    if (braceCount < 0) {
      errors.push("存在多余的右花括号 `}`");
      break;
    }
  }

  if (braceCount > 0) {
    errors.push("花括号未闭合，缺少 `}`");
  }

  const quoteCount = (text.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    warnings.push("检测到双引号数量可能不成对，请检查字符串是否闭合");
  }

  const lines = text.split("\n");
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) return;

    const looksLikeAssignLine =
      trimmed.includes("=") &&
      !trimmed.endsWith("{") &&
      trimmed !== "}" &&
      !trimmed.startsWith("include");

    if (looksLikeAssignLine) {
      const parts = trimmed.split("=");
      if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
        errors.push(`第 ${index + 1} 行可能存在不完整的赋值表达式`);
      }
    }
  });

  if (hasSource && !/source\s*\{[\s\S]*\}/m.test(text)) {
    warnings.push("source 块可能未完整填写");
  }

  if (hasSink && !/sink\s*\{[\s\S]*\}/m.test(text)) {
    warnings.push("sink 块可能未完整填写");
  }

  if (missingBlocks.length > 0) {
    warnings.push(`建议补充基础块：${missingBlocks.join(" / ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingBlocks,
  };
}

export default function HoconEditorPanel({ value, onChange }: Props) {


  useEffect(() => {
    if (!value?.trim()) {
      onChange(DEFAULT_TEMPLATE);
    }
  }, []);


  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <div className="h-full rounded-[18px] border border-slate-200 bg-[#FCFDFE] p-3 transition-all duration-200 focus-within:border-blue-200">
          <TextArea
            variant="borderless"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={DEFAULT_TEMPLATE}
            autoSize={false}
            spellCheck={false}
            className="h-full resize-none !bg-transparent !p-0 !font-mono text-[13px] leading-7 shadow-none"
            style={{
              height: "100%",
              minHeight: "62vh",
              boxShadow: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
