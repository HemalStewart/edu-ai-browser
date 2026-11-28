"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { QUANTUM_CATEGORIES, QUANTUM_TOOLS } from "./catalog";
import { quantumHubUrl } from "./hub";
import { Icon } from "./icons";

export interface AppSwitcherProps {
  /** Slug of the tool you are in; highlighted in the grid. */
  current?: string;
  /** Open the popover initially (style guide / screenshots). */
  defaultOpen?: boolean;
  className?: string;
}

const COLS = 3;

/**
 * Adobe-style app switcher: every Quantum tool from the catalog, grouped by category.
 * Each tile opens the tool in a new tab. Keyboard: Esc closes, arrow keys move through the grid.
 */
export function AppSwitcher({ current, defaultOpen = false, className }: AppSwitcherProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const focusApp = (index: number) => {
    const links = popRef.current?.querySelectorAll<HTMLAnchorElement>("a.q-app");
    if (!links || !links.length) return;
    links[Math.max(0, Math.min(links.length - 1, index))].focus();
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusApp(0));
    }
  };

  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(popRef.current?.querySelectorAll<HTMLAnchorElement>("a.q-app") ?? []);
    const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (idx < 0) return;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS } as Record<string, number>;
    if (e.key in step) {
      e.preventDefault();
      focusApp(idx + step[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusApp(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusApp(links.length - 1);
    }
  };

  return (
    <div ref={rootRef} className={["q-switcher", className].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        type="button"
        className="q-icon-btn"
        aria-label="Quantum apps"
        title="Quantum apps"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <Icon name="apps" size={16} />
      </button>

      {open ? (
        <div ref={popRef} id={popId} className="q-menu q-switcher__pop" role="dialog" aria-label="Quantum apps" onKeyDown={onGridKey}>
          <div className="q-switcher__head">
            <div>
              <p className="q-switcher__title">Quantum apps</p>
              <span className="q-kicker">{QUANTUM_TOOLS.length} tools · one Quantum ID</span>
            </div>
            <button type="button" className="q-icon-btn q-icon-btn--sm" aria-label="Close apps" title="Close" onClick={() => setOpen(false)}>
              <Icon name="x" size={14} />
            </button>
          </div>
          <div className="q-switcher__body">
            {QUANTUM_CATEGORIES.map((cat) => {
              const tools = QUANTUM_TOOLS.filter((t) => t.category === cat);
              if (!tools.length) return null;
              const headingId = `${popId}-${cat}`;
              return (
                <section key={cat} aria-labelledby={headingId}>
                  <div className="q-switcher__group">
                    <span className="q-kicker" id={headingId}>
                      {cat}
                    </span>
                  </div>
                  <div className="q-switcher__grid">
                    {tools.map((t) => (
                      <a
                        key={t.slug}
                        className="q-app"
                        href={t.devUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-current={t.slug === current ? "true" : undefined}
                        title={`${t.name} — ${t.tagline}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="q-app__tile" aria-hidden>
                          {t.mark}
                        </span>
                        <span className="q-app__text">
                          <span className="q-app__name">{t.name.replace(/^Quantum (Studio )?/, "")}</span>
                          <span className="q-app__tagline">{t.tagline}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          <div className="q-switcher__foot">
            <a className="q-switcher__link" href={quantumHubUrl("/account")}>
              <Icon name="user" size={14} />
              Manage apps in your Quantum ID
            </a>
            <a className="q-switcher__link" href={quantumHubUrl("/")} target="_blank" rel="noopener noreferrer">
              All apps
              <Icon name="external" size={13} />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
