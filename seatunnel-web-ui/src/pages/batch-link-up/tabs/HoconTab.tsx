import { defaultKeymap } from "@codemirror/commands";
import {
  HighlightStyle,
  StreamLanguage,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { Card } from "antd";
import { FileCode2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface HoconTabProps {
  config?: string;
}

type HoconState = {
  inBlockComment: boolean;
};

const hoconLanguage = StreamLanguage.define<HoconState>({
  startState() {
    return { inBlockComment: false };
  },

  token(stream, state) {
    if (state.inBlockComment) {
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === "*" && stream.peek() === "/") {
          stream.next();
          state.inBlockComment = false;
          break;
        }
      }
      return "comment";
    }

    if (stream.eatSpace()) return null;

    if (stream.match("#")) {
      stream.skipToEnd();
      return "comment";
    }

    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    if (stream.match("/*")) {
      state.inBlockComment = true;
      return "comment";
    }

    if (
      stream.match("{") ||
      stream.match("}") ||
      stream.match("[") ||
      stream.match("]")
    ) {
      return "brace";
    }

    if (stream.match("=") || stream.match(":") || stream.match(",")) {
      return "operator";
    }

    if (stream.match(/"(?:[^"\\]|\\.)*"?/)) {
      return "string";
    }

    if (stream.match(/\b(true|false|null)\b/)) {
      return "bool";
    }

    if (stream.match(/\b\d+(\.\d)?\b/)) {
      return "number";
    }

    if (stream.match(/\b(env|job|source|sink|transform|include)\b/)) {
      return "keyword";
    }

    if (stream.match(/[A-Za-z_][\w.-]*/)) {
      const cur = stream.current();
      const rest = stream.string.slice(stream.pos);

      if (/^\s*[=:]/.test(rest)) {
        return "propertyName";
      }

      if (/^[A-Z][\w-]*/.test(cur)) {
        return "typeName";
      }

      return "variableName";
    }

    stream.next();
    return null;
  },
});

const hoconHighlightStyle = HighlightStyle.define([
  {
    tag: tags.keyword,
    color: "#2563eb",
    fontWeight: "600",
  },
  {
    tag: tags.comment,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  {
    tag: tags.string,
    color: "#0f766e",
  },
  {
    tag: tags.number,
    color: "#d97706",
    fontWeight: "500",
  },
  {
    tag: tags.bool,
    color: "#7c3aed",
    fontWeight: "600",
  },
  {
    tag: tags.propertyName,
    color: "#334155",
    fontWeight: "500",
  },
  {
    tag: tags.typeName,
    color: "#4f46e5",
    fontWeight: "600",
  },
  {
    tag: tags.variableName,
    color: "#475569",
  },
  {
    tag: [tags.brace, tags.squareBracket],
    color: "#0284c7",
    fontWeight: "600",
  },
  {
    tag: tags.operator,
    color: "#94a3b8",
  },
]);

const hoconPreviewTheme = EditorView.theme({
  "&": {
    minHeight: "460px",
    fontSize: "13px",
    backgroundColor: "#FCFDFE",
    color: "#334155",
    outline: "none !important",
  },

  "&.cm-focused": {
    outline: "none !important",
  },

  ".cm-scroller": {
    overflow: "auto",
    fontFamily:
      'JetBrains Mono, Fira Code, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    lineHeight: "26px",
    outline: "none !important",
  },

  ".cm-content": {
    padding: "16px 0",
    caretColor: "transparent",
    outline: "none !important",
  },

  ".cm-line": {
    padding: "0 18px",
  },

  ".cm-activeLine": {
    backgroundColor: "transparent",
  },

  ".cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.14) !important",
  },

  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.14) !important",
  },

  ".cm-cursor": {
    display: "none",
  },
});

const HoconTab: React.FC<HoconTabProps> = ({ config = "" }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (viewRef.current) return;

    const state = EditorState.create({
      doc: config || "",
      extensions: [
        keymap.of(defaultKeymap),
        hoconLanguage,
        syntaxHighlighting(hoconHighlightStyle),
        hoconPreviewTheme,
        EditorView.lineWrapping,
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    const next = config || "";

    if (next !== current) {
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: next,
        },
      });
    }
  }, [config]);

  return (
    <Card
      size="small"
      className="mt-2 !rounded-2xl !border-slate-200 !shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      bodyStyle={{ padding: 16 }}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
          <FileCode2 size={16} strokeWidth={1.9} />
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">HOCON 配置</div>
          <div className="mt-0.5 text-xs text-slate-400">
            查看当前运行实例最终生成的 SeaTunnel 配置
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#FCFDFE]">
        <div className="h-[480px] overflow-auto">
          <div ref={containerRef} />
        </div>
      </div>
    </Card>
  );
};

export default HoconTab;
