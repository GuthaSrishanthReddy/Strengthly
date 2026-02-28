import type { ReactNode } from "react";
import "./BitPanel.css";

type BitPanelProps = {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  className?: string;
};

const BitPanel = ({ children, title, eyebrow, className = "" }: BitPanelProps) => {
  return (
    <section className={`bit-panel ${className}`.trim()}>
      <div className="bit-panel__glow" aria-hidden="true" />
      {(eyebrow || title) && (
        <header className="bit-panel__header">
          {eyebrow && <p className="bit-panel__eyebrow">{eyebrow}</p>}
          {title && <h2 className="bit-panel__title">{title}</h2>}
        </header>
      )}
      <div className="bit-panel__body">{children}</div>
    </section>
  );
};

export default BitPanel;
