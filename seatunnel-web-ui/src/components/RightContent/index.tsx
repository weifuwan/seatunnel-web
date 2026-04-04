import { QuestionCircleOutlined, ReadOutlined } from "@ant-design/icons";
import { SelectLang as UmiSelectLang } from "@umijs/max";
import { history } from "umi";
import "./index.less";
import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";

export type SiderTheme = "light" | "dark";

export const SelectLang: React.FC = () => {
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

export const Question: React.FC = () => {
  return (
    <a
      href="http://localhost:3000/"
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
      }}
    >
      <QuestionCircleOutlined />
    </a>
  );
};

export const Knowledge: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: "4px",
        fontSize: "18px",
        color: "inherit",
        cursor: "pointer",
      }}
      onClick={() => {
        history.push("/knowledge-management");
      }}
    >
      <ReadOutlined />
    </div>
  );
};

type SearchTarget = {
  pathname: string;
  query?: Record<string, string>;
};

type SearchItem = {
  id: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ReactNode;
  target?: SearchTarget;
};

const buildQueryString = (query?: Record<string, string>) => {
  if (!query) return "";
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const formatDateTime = (value: moment.Moment) => value.format("YYYY-MM-DD HH:mm:ss");

const getTodayRange = () => ({
  createTimeStart: formatDateTime(moment().startOf("day")),
  createTimeEnd: formatDateTime(moment().endOf("day")),
  current: "1",
  pageSize: "10",
});

const getRecentOneDayRange = () => ({
  createTimeStart: formatDateTime(moment().subtract(1, "day")),
  createTimeEnd: formatDateTime(moment()),
  current: "1",
  pageSize: "10",
});

const getRecentWeekRange = () => ({
  createTimeStart: formatDateTime(moment().subtract(7, "days")),
  createTimeEnd: formatDateTime(moment()),
  current: "1",
  pageSize: "10",
});

const searchList: SearchItem[] = [
  {
    id: "1",
    title: "查一下最近一天的任务",
    desc: "查看最近 24 小时内创建或执行的任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        ...getRecentOneDayRange(),
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-blue-500"
      >
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </svg>
    ),
  },
  {
    id: "2",
    title: "看看运行中的任务",
    desc: "快速筛选当前正在执行中的 Batch 任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        status: "RUNNING",
        current: "1",
        pageSize: "10",
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-green-500"
      >
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </svg>
    ),
  },
  {
    id: "3",
    title: "看看失败的任务",
    desc: "查看执行失败的离线任务，便于排查问题",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        status: "FAILED",
        current: "1",
        pageSize: "10",
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-indigo-500"
      >
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
      </svg>
    ),
  },
  {
    id: "4",
    title: "看看最近执行过的任务",
    desc: "按最近执行时间排序查看离线任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        current: "1",
        pageSize: "10",
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-pink-500"
      >
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "5",
    title: "看看今天创建的任务",
    desc: "快速查看今天新建的离线任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        ...getTodayRange(),
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-orange-500"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
  },
  {
    id: "6",
    title: "查一下最近一周的任务",
    desc: "快速查看最近 7 天内的任务",
    tag: "Batch",
    target: {
      pathname: "/sync/batch-link-up",
      query: {
        ...getRecentWeekRange(),
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-teal-500"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredList = useMemo(() => {
    return searchList.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.desc.toLowerCase().includes(keyword.toLowerCase()) ||
        item.tag.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [keyword]);

  useEffect(() => {
    setActiveIndex(0);
  }, [keyword, open]);

  const handleSelect = (item: SearchItem) => {
    if (!item.target) return;

    const search = buildQueryString(item.target.query);

    history.push({
      pathname: item.target.pathname,
      search,
    });

    setOpen(false);
    setKeyword("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (!filteredList.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredList.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredList.length) % filteredList.length);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredList[activeIndex]);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div style={{ marginRight: "27vw" }}>
      <div className="flex flex-1 justify-center max-w-xl">
        <div
          ref={wrapperRef}
          className="relative max-w-md"
          style={{ width: "48vh" }}
        >
          <div
            className="rounded-full border transition-all duration-300"
            style={{
              background: "#fff",
              borderColor: open ? "#3b82f6" : "#d1d5db",
              boxShadow: open
                ? "0 0 0 3px rgba(59,130,246,0.10)"
                : "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <div className="relative rounded-full">
              <input
                className="flex w-full bg-background px-4 py-1.5 pl-9 pr-9 text-sm h-9 rounded-full focus-visible:outline-none"
                placeholder="Search batch jobs、stream jobs..."
                type="text"
                value={keyword}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (!open) setOpen(true);
                }}
                style={{
                  border: "none",
                  boxShadow: "none",
                  background: "transparent",
                }}
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>

              {keyword && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-slate-100"
                  onClick={() => setKeyword("")}
                >
                  <div className="flex h-4 w-4 items-center justify-center text-slate-400">
                    ×
                  </div>
                </button>
              )}
            </div>
          </div>

          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-3xl border shadow-lg dark:border-neutral-700 transition-all duration-300 ease-out"
            style={{
              backgroundColor: "white",
              opacity: open ? 1 : 0,
              maxHeight: open ? 420 : 0,
              transform: open
                ? "translateY(0px) scale(1)"
                : "translateY(-6px) scale(0.98)",
              transformOrigin: "top center",
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <ul className="py-1">
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={item.id}
                      className="cursor-pointer px-3 py-2 flex items-center justify-between transition-all duration-200 custom-hover"
                      style={{
                        opacity: open ? 1 : 0,
                        transform: open ? "translateY(0)" : "translateY(-6px)",
                        transitionDelay: `${index * 35}ms`,
                        background: isActive ? "#F8FAFC" : "transparent",
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{item.icon}</span>
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium"
                            style={{ color: "black", fontFamily: "Inter, sans-serif" }}
                          >
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.desc}</span>
                        </div>
                      </div>

                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {item.tag}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results found
                </li>
              )}
            </ul>

            <div className="px-3 py-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};