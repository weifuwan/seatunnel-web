import DatabaseIcons from "@/pages/data-source/icon/DatabaseIcons";
import type { PropsWithChildren, ReactNode } from "react";
import CloseIcon from "../../../icon/CloseIcon";


interface PanelShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  badge: string;
  desc: string;
  heroTitle: string;
  heroDesc: string;
  heroTag: string;
  dbType?: string;
  icon?: ReactNode;
  onClose: () => void;
}

export default function PanelShell({
  eyebrow,
  title,
  badge,
  desc,
  heroTitle,
  heroDesc,
  heroTag,
  dbType,
  icon,
  onClose,
  children,
}: PanelShellProps) {
  return (
    <div className="workflow-panel">
      <aside className="workflow-panel__drawer workflow-panel__drawer--open">
        <div className="workflow-panel__header">
          <div className="workflow-panel__header-left">
            <div className="workflow-panel__eyebrow">{eyebrow}</div>

            <div className="workflow-panel__title-row">
              <h3 className="workflow-panel__title">{title}</h3>
              <span className="workflow-panel__badge">{badge}</span>
            </div>

            <div className="workflow-panel__desc">{desc}</div>
          </div>

          <button
            type="button"
            className="workflow-panel__close"
            onClick={onClose}
            aria-label="关闭面板"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="workflow-panel__body">
          <section className="workflow-panel__hero-card">
            <div className="workflow-panel__hero-icon">
              {icon || (
                <DatabaseIcons dbType={dbType || "mysql"} width="20" height="20" />
              )}
            </div>

            <div className="workflow-panel__hero-content">
              <div className="workflow-panel__hero-name">{heroTitle}</div>
              <div className="workflow-panel__hero-text">{heroDesc}</div>
            </div>

            <div className="workflow-panel__hero-tag">{heroTag}</div>
          </section>

          {children}
        </div>

        <div className="workflow-panel__footer">
          <button
            type="button"
            className="workflow-panel__btn workflow-panel__btn--ghost"
            onClick={onClose}
          >
            关闭
          </button>

          <button
            type="button"
            className="workflow-panel__btn workflow-panel__btn--primary"
          >
            保存配置
          </button>
        </div>
      </aside>
    </div>
  );
}