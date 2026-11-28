"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { AppSwitcher } from "./app-switcher";
import { AssistantPanel, type AssistantConfig } from "./assistant-panel";
import { getTool } from "./catalog";
import { Icon, type IconName } from "./icons";
import { OfflineGate } from "./offline-gate";
import { ThemeToggle } from "./theme";

export type NavItem = { id: string; label: string; icon: IconName; href?: string };

export interface QuantumShellProps {
  /** Catalog slug, e.g. "planner" (or "hub"). */
  tool: string;
  /** Icon rail. An item with id "settings" is pinned to the bottom of the rail. */
  nav: NavItem[];
  activeNav?: string;
  onNavigate?: (id: string) => void;
  /** Optional secondary panel (list of items), 260px. */
  sections?: ReactNode;
  sectionsTitle?: string;
  /** Extra controls in the sections panel header (e.g. a "New" button). */
  sectionsActions?: ReactNode;
  /** Shown in the top bar after the tool name. */
  breadcrumb?: string[];
  /** Top-bar right side, before the app switcher / theme / profile. */
  actions?: ReactNode;
  /** Right assistant panel; default on. */
  assistant?: AssistantConfig | false;
  /** Profile slot, top-right (pass `<ProfileButton />` from Quantum ID). */
  profile?: ReactNode;
  /** Main workspace. */
  children: ReactNode;
}

const NARROW_QUERY = "(max-width: 1099px)";

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return narrow;
}

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const v = window.localStorage.getItem(key);
    if (v === "open") return true;
    if (v === "closed") return false;
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeFlag(key: string, open: boolean) {
  try {
    window.localStorage.setItem(key, open ? "open" : "closed");
  } catch {
    /* ignore */
  }
}

function RailItem({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: (id: string) => void }) {
  const content = (
    <>
      <Icon name={item.icon} size={18} />
      <span className="q-rail-item__label">{item.label}</span>
    </>
  );
  const common = {
    className: "q-rail-item",
    "aria-current": active ? ("page" as const) : undefined,
    title: item.label,
  };
  if (item.href) {
    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      onNavigate(item.id);
    };
    return (
      <a href={item.href} onClick={onClick} {...common}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={() => onNavigate?.(item.id)} {...common}>
      {content}
    </button>
  );
}

/**
 * The one layout every Quantum tool uses:
 * top bar · icon rail (labels under icons) · optional sections panel · main · right assistant.
 * Below ~1100px the assistant and the sections panel become overlay drawers.
 */
export function QuantumShell({
  tool,
  nav,
  activeNav,
  onNavigate,
  sections,
  sectionsTitle,
  sectionsActions,
  breadcrumb,
  actions,
  assistant = {},
  profile,
  children,
}: QuantumShellProps) {
  const info = getTool(tool);
  const toolName = tool === "hub" ? "Quantum" : (info?.name ?? tool);
  const narrow = useNarrow();
  const ids = `quantum-${tool}`;
  const sectionsId = `${ids}-sections`;
  const assistantId = `${ids}-assistant`;
  const storageKey = `quantum.assistant.${tool}`;

  // Wide screens: persisted per tool, default open. Narrow screens: a drawer, closed by default.
  const subscribePin = useCallback((notify: () => void) => {
    const onChange = () => notify();
    window.addEventListener("storage", onChange);
    window.addEventListener("quantum:assistant", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("quantum:assistant", onChange);
    };
  }, []);
  const assistantPinned = useSyncExternalStore(subscribePin, () => readFlag(storageKey, true), () => true);
  const [assistantDrawer, setAssistantDrawer] = useState(false);
  const [sectionsWide, setSectionsWide] = useState(true);
  const [sectionsDrawer, setSectionsDrawer] = useState(false);

  const hasAssistant = assistant !== false;
  const hasSections = sections != null;
  const assistantOpen = hasAssistant && (narrow ? assistantDrawer : assistantPinned);
  const sectionsOpen = hasSections && (narrow ? sectionsDrawer : sectionsWide);

  const setAssistantOpen = useCallback(
    (open: boolean) => {
      if (narrow) {
        setAssistantDrawer(open);
        if (open) setSectionsDrawer(false);
      } else {
        writeFlag(storageKey, open);
        window.dispatchEvent(new Event("quantum:assistant"));
      }
    },
    [narrow, storageKey],
  );

  const setSectionsOpen = (open: boolean) => {
    if (narrow) {
      setSectionsDrawer(open);
      if (open) setAssistantDrawer(false);
    } else setSectionsWide(open);
  };

  // Esc closes an open drawer on narrow screens.
  useEffect(() => {
    if (!narrow || !(assistantDrawer || sectionsDrawer)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      setAssistantDrawer(false);
      setSectionsDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [narrow, assistantDrawer, sectionsDrawer]);

  const navigate = (id: string) => {
    onNavigate?.(id);
    if (narrow) setSectionsDrawer(false);
  };

  const pinned = nav.filter((n) => n.id === "settings");
  const main = nav.filter((n) => n.id !== "settings");
  const drawerOpen = narrow && (assistantOpen || sectionsOpen);

  return (
    <OfflineGate>
      <div className="q-shell" data-tool={tool}>
        <header className="q-topbar">
          {hasSections ? (
            <button
              type="button"
              className="q-icon-btn"
              aria-label={sectionsOpen ? `Hide ${sectionsTitle ?? "sections"}` : `Show ${sectionsTitle ?? "sections"}`}
              title={sectionsOpen ? `Hide ${sectionsTitle ?? "sections"}` : `Show ${sectionsTitle ?? "sections"}`}
              aria-expanded={sectionsOpen}
              aria-controls={sectionsId}
              onClick={() => setSectionsOpen(!sectionsOpen)}
            >
              <Icon name="panel-left" size={16} />
            </button>
          ) : null}
          <div className="q-topbar__brand">
            <span className="q-mark" aria-hidden>
              <Icon name="atom" size={16} strokeWidth={1.7} />
            </span>
            <span className="q-topbar__name">{toolName}</span>
          </div>
          {breadcrumb && breadcrumb.length ? (
            <nav aria-label="Breadcrumb" style={{ minWidth: 0, display: "flex" }}>
              <ol className="q-crumbs">
                {breadcrumb.map((c, i) => (
                  <li key={`${c}-${i}`} aria-current={i === breadcrumb.length - 1 ? "page" : undefined}>
                    <span>{c}</span>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="q-topbar__spacer" />
          <div className="q-topbar__actions">
            {actions}
            {actions ? <span className="q-divider q-divider--vertical q-hide-sm" aria-hidden /> : null}
            <AppSwitcher current={tool} />
            <ThemeToggle />
            {hasAssistant ? (
              <button
                type="button"
                className="q-icon-btn"
                aria-label={assistantOpen ? "Hide assistant" : "Show assistant"}
                title={assistantOpen ? "Hide assistant" : "Show assistant"}
                aria-expanded={assistantOpen}
                aria-controls={assistantId}
                onClick={() => setAssistantOpen(!assistantOpen)}
              >
                <Icon name="sparkles" size={16} />
              </button>
            ) : null}
            {profile ? (
              <>
                <span className="q-divider q-divider--vertical" aria-hidden />
                {profile}
              </>
            ) : null}
          </div>
        </header>

        <div className="q-shell__body">
          <nav className="q-rail" aria-label={`${toolName} navigation`}>
            {main.map((item) => (
              <RailItem key={item.id} item={item} active={item.id === activeNav} onNavigate={navigate} />
            ))}
            {pinned.length ? <div className="q-rail__spacer" /> : null}
            {pinned.map((item) => (
              <RailItem key={item.id} item={item} active={item.id === activeNav} onNavigate={navigate} />
            ))}
          </nav>

          {hasSections ? (
            <aside id={sectionsId} className="q-sections" aria-label={sectionsTitle ?? "Sections"} hidden={!sectionsOpen}>
              {sectionsTitle || sectionsActions ? (
                <div className="q-sections__head">
                  <h2 className="q-sections__title">{sectionsTitle}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {sectionsActions}
                    {narrow ? (
                      <button type="button" className="q-icon-btn q-icon-btn--sm" aria-label="Close panel" title="Close" onClick={() => setSectionsOpen(false)}>
                        <Icon name="x" size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="q-sections__body">{sections}</div>
            </aside>
          ) : null}

          <main className="q-main">{children}</main>

          {drawerOpen ? (
            <button
              type="button"
              className="q-scrim"
              aria-label="Close panel"
              tabIndex={-1}
              onClick={() => {
                setAssistantDrawer(false);
                setSectionsDrawer(false);
              }}
            />
          ) : null}

          {hasAssistant ? (
            // Stays mounted while hidden so the conversation survives toggling.
            <aside id={assistantId} className="q-assistant" hidden={!assistantOpen} aria-label="Assistant">
              <AssistantPanel tool={tool} {...assistant} onClose={() => setAssistantOpen(false)} />
            </aside>
          ) : null}
        </div>
      </div>
    </OfflineGate>
  );
}
