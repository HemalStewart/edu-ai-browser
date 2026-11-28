"use client";
// ProfileButton and RequireQuantumId. Styling uses the kit's q-* classes and --q-* tokens only,
// plus a tiny scoped <style> block (qid-*) so the SDK has no CSS build requirements.
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { getTool } from "../ui/catalog";
import { hubLink, useQuantumId } from "./provider";
import type { ThemePreference } from "./types";

const CSS = `
.qid-root{position:relative;display:inline-flex}
.qid-avatar{width:32px;height:32px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;
  background:var(--q-raised);color:var(--q-fg);border:1px solid var(--q-line);font:600 12px/1 var(--q-font-sans);
  letter-spacing:.02em;cursor:pointer;padding:0}
.qid-avatar:hover{background:var(--q-hover)}
.qid-avatar:focus-visible,.qid-item:focus-visible,.qid-seg:focus-visible{outline:2px solid var(--q-fg);outline-offset:2px}
.qid-menu{position:absolute;right:0;top:calc(100% + 8px);min-width:260px;z-index:60;background:var(--q-card);
  border:1px solid var(--q-line);border-radius:12px;padding:6px;box-shadow:0 12px 32px rgba(0,0,0,.24);
  font-family:var(--q-font-sans)}
.qid-head{display:flex;gap:10px;align-items:center;padding:8px 8px 10px}
.qid-head .qid-avatar{cursor:default;width:36px;height:36px}
.qid-name{font-size:13px;font-weight:600;color:var(--q-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qid-email{font-size:12px;color:var(--q-fg-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qid-sep{height:1px;background:var(--q-line);margin:4px 2px}
.qid-item{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:8px 10px;border:0;border-radius:8px;
  background:transparent;color:var(--q-fg);font:500 13px/1.2 var(--q-font-sans);text-align:left;text-decoration:none;cursor:pointer}
.qid-item:hover,.qid-item:focus{background:var(--q-hover);outline:none}
.qid-item svg{color:var(--q-fg-3);flex:none}
.qid-label{font-size:11px;color:var(--q-fg-3);padding:6px 10px 4px;text-transform:uppercase;letter-spacing:.06em}
.qid-segs{display:flex;gap:4px;padding:2px 6px 6px}
.qid-seg{flex:1;padding:6px 0;border-radius:7px;border:1px solid var(--q-line);background:transparent;color:var(--q-fg-2);
  font:500 12px/1 var(--q-font-sans);cursor:pointer}
.qid-seg:hover,.qid-seg:focus{background:var(--q-hover);outline:none}
.qid-seg[aria-checked="true"]{background:var(--q-accent);color:var(--q-accent-fg);border-color:var(--q-accent)}
.qid-gate{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:16px;background:var(--q-canvas);
  color:var(--q-fg);font-family:var(--q-font-sans)}
.qid-gate-card{width:100%;max-width:400px;box-sizing:border-box;padding:32px;text-align:center;display:flex;flex-direction:column;
  align-items:center;gap:12px;background:var(--q-card);border:1px solid var(--q-line);border-radius:16px}
.qid-gate-card h1{font-size:20px;font-weight:600;margin:4px 0 0;letter-spacing:-.01em}
.qid-gate-card p{margin:0;color:var(--q-fg-2);font-size:14px;line-height:1.5}
.qid-gate-card .q-btn{width:100%;margin-top:8px;justify-content:center}
.qid-gate-note{font-size:12px !important;color:var(--q-fg-3) !important}
`;

export function initials(name: string | undefined, email?: string): string {
  const src = (name || email || "?").trim();
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : src.slice(0, 2);
  return letters.toUpperCase();
}

function SuiteMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--q-accent)" />
      <circle cx="15.5" cy="15" r="6.5" fill="none" stroke="var(--q-accent-fg)" strokeWidth="2.4" />
      <path d="M19 18.5l4.5 4.5" stroke="var(--q-accent-fg)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></>,
};
function Glyph({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** Avatar with initials → menu: name/email, Manage profile, theme, All apps, Sign out. */
export function ProfileButton() {
  const { status, user, me, tool, signIn, signOut, setThemePreference } = useQuantumId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const external = tool !== "hub";

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
  const focusItem = (index: number) => {
    const list = items();
    if (!list.length) return;
    list[(index + list.length) % list.length].focus();
  };
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    focusItem(0);
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (status !== "signed-in" || !user) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {status === "loading" ? (
          <span className="qid-avatar" aria-label="Loading profile" aria-busy="true" style={{ opacity: 0.5, cursor: "default" }} />
        ) : (
          <button type="button" className="q-btn q-btn--secondary q-btn--sm" onClick={signIn}>
            Sign in
          </button>
        )}
      </>
    );
  }

  const onTriggerKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKey = (e: ReactKeyboardEvent) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(i + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(i - 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(list.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const theme = me?.preferences.theme ?? "dark";
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div className="qid-root" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button
        ref={triggerRef}
        type="button"
        className="qid-avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Quantum ID: ${user.name}`}
        title={`${user.name} (${user.email})`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
      >
        {initials(user.name, user.email)}
      </button>
      {open && (
        <div id={menuId} ref={menuRef} className="qid-menu q-menu" role="menu" aria-label="Quantum ID" onKeyDown={onMenuKey}>
          <div className="qid-head">
            <span className="qid-avatar" aria-hidden="true">{initials(user.name, user.email)}</span>
            <div style={{ minWidth: 0 }}>
              <div className="qid-name">{user.name}</div>
              <div className="qid-email">{user.email}</div>
            </div>
          </div>
          <div className="qid-sep" role="separator" />
          <a role="menuitem" tabIndex={-1} className="qid-item" href={hubLink(tool, "/account")} {...linkProps} onClick={() => setOpen(false)}>
            <Glyph name="user" /> Manage profile
          </a>
          <a role="menuitem" tabIndex={-1} className="qid-item" href={hubLink(tool, "/")} {...linkProps} onClick={() => setOpen(false)}>
            <Glyph name="grid" /> All apps
          </a>
          <div className="qid-label" id={menuId + "-theme"}>Theme</div>
          <div className="qid-segs" role="group" aria-labelledby={menuId + "-theme"}>
            {THEME_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                tabIndex={-1}
                aria-checked={theme === o.value}
                className="qid-seg"
                onClick={() => void setThemePreference(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="qid-sep" role="separator" />
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className="qid-item"
            onClick={() => {
              close();
              signOut();
            }}
          >
            <Glyph name="logout" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** Renders children when signed in; otherwise a full-screen "Sign in with Quantum ID" card. */
export function RequireQuantumId({ children }: { children: ReactNode }) {
  const { status, tool, signIn } = useQuantumId();
  if (status === "signed-in") return <>{children}</>;
  const toolName = getTool(tool)?.name ?? "Quantum";
  return (
    <div className="qid-gate" aria-busy={status === "loading"}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {status === "loading" ? (
        <span style={{ color: "var(--q-fg-3)", fontSize: 13 }} role="status">
          Checking your Quantum ID…
        </span>
      ) : (
        <div className="qid-gate-card q-card" role="dialog" aria-labelledby="qid-gate-title">
          <SuiteMark size={44} />
          <div className="q-kicker">Quantum ID</div>
          <h1 id="qid-gate-title">Sign in with Quantum ID</h1>
          <p>One profile opens {toolName} and every other Quantum tool, and keeps your apps, theme and sessions in sync.</p>
          <button type="button" className="q-btn q-btn--primary" onClick={signIn} autoFocus>
            Sign in with Quantum ID
          </button>
          <p className="qid-gate-note">New to Quantum? You can create your Quantum ID on the next screen.</p>
        </div>
      )}
    </div>
  );
}
