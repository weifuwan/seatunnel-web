import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  StreamLanguage,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";

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
  Jdbc {
    url = "jdbc:mysql://127.0.0.1:3306/demo"
    user = "root"
    password = "123456"
    query = "select * from t_user"
  }
}

sink {
  # 例如：
  Console {}
}
`;

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

    if (stream.match("{") || stream.match("}") || stream.match("[") || stream.match("]")) {
      return "brace";
    }

    if (stream.match("=") || stream.match(":")) {
      return "operator";
    }

    if (stream.match(/"(?:[^"\\]|\\.)*"?/)) {
      return "string";
    }

    if (stream.match(/\b(true|false)\b/)) {
      return "bool";
    }

    if (stream.match(/\b\d+(\.\d+)?\b/)) {
      return "number";
    }

    if (stream.match(/\b(env|source|sink|transform|include)\b/)) {
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
  { tag: tags.keyword, color: "#0284c7", fontWeight: "600" },
  { tag: tags.comment, color: "#94a3b8", fontStyle: "italic" },
  { tag: tags.string, color: "#d97706" },
  { tag: tags.number, color: "#7c3aed" },
  { tag: tags.bool, color: "#e11d48", fontWeight: "600" },
  { tag: tags.propertyName, color: "#0f766e" },
  { tag: tags.typeName, color: "#334155", fontWeight: "600" },
  { tag: tags.variableName, color: "#475569" },
  { tag: [tags.brace, tags.squareBracket], color: "#64748b" },
  { tag: tags.operator, color: "#94a3b8" },
]);

const editorTheme = EditorView.theme({
  "&": {
    height: "calc(100vh - 240px)",
    minHeight: "42vh",
    fontSize: "13px",
    backgroundColor: "transparent",
    outline: "none !important",
  },

  "&.cm-focused": {
    outline: "none !important",
  },

  ".cm-scroller": {
    overflow: "auto",
    fontFamily:
      'JetBrains Mono, Fira Code, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    lineHeight: "28px",
    outline: "none !important",
  },

  ".cm-content": {
    padding: "4px 0",
    caretColor: "#0f172a",
    outline: "none !important",
  },

  ".cm-line": {
    padding: "0",
  },

  ".cm-gutters": {
    display: "none",
  },

  ".cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.16) !important",
  },

  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.16) !important",
  },

  ".cm-cursor": {
    borderLeftColor: "#0f172a",
  },
});

export default function HoconEditorPanel({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!value?.trim()) {
      onChange(DEFAULT_TEMPLATE);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (viewRef.current) return;

    const startDoc = value?.trim() ? value : DEFAULT_TEMPLATE;

    const state = EditorState.create({
      doc: startDoc,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        hoconLanguage,
        syntaxHighlighting(hoconHighlightStyle),
        editorTheme,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const nextValue = update.state.doc.toString();
            if (nextValue !== value) {
              onChange(nextValue);
            }
          }
        }),
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
    if (value !== current && typeof value === "string") {
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <div className="h-full rounded-[18px] border border-slate-200 bg-[#FCFDFE] p-3 transition-all duration-200 focus-within:border-blue-200">
          <div ref={containerRef} className="h-full" />
        </div>
      </div>
    </div>
  );
}