"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "./icons";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "quantum.theme";
/** profile → kit: the Quantum ID SDK dispatches this; the kit applies it without re-dispatching. */
export const THEME_EVENT = "quantum:theme";
/** kit → profile: dispatched when the *user* changes the theme in the kit. */
export const THEME_CHANGED_EVENT = "quantum:theme-changed";

const isPref = (v: unknown): v is ThemePreference => v === "light" || v === "dark" || v === "system";

/* ── tiny external store, so useTheme() also works outside a provider ── */

let fallback: ThemePreference = "dark";
let current: ThemePreference | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function readStored(): ThemePreference {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isPref(v)) return v;
  } catch {
    /* storage blocked */
  }
  return fallback;
}

function systemPrefersLight(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches;
  } catch {
    return false;
  }
}

function resolve(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") return systemPrefersLight() ? "light" : "dark";
  return pref;
}

function applyToDocument(pref: ThemePreference) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolve(pref);
}

function getPref(): ThemePreference {
  if (current === null) current = readStored();
  return current;
}

/** Sets the preference. `fromUser` dispatches `quantum:theme-changed` so Quantum ID can save it. */
function setPref(next: ThemePreference, fromUser: boolean) {
  if (!isPref(next)) return;
  current = next;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* storage blocked */
  }
  applyToDocument(next);
  emit();
  if (fromUser) {
    try {
      window.dispatchEvent(new CustomEvent(THEME_CHANGED_EVENT, { detail: next }));
    } catch {
      /* very old browsers */
    }
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  let mql: MediaQueryList | null = null;
  const onSystem = () => {
    if (getPref() === "system") applyToDocument("system");
    cb();
  };
  try {
    mql = window.matchMedia("(prefers-color-scheme: light)");
    mql.addEventListener("change", onSystem);
  } catch {
    mql = null;
  }
  return () => {
    listeners.delete(cb);
    mql?.removeEventListener("change", onSystem);
  };
}

/** Snapshot = "<pref>|<resolved>" so a system change re-renders consumers. */
const getSnapshot = () => {
  const p = getPref();
  return `${p}|${resolve(p)}`;
};
const getServerSnapshot = () => `${fallback}|${fallback === "light" ? "light" : "dark"}`;

export interface ThemeContextValue {
  theme: ThemePreference;
  resolved: ResolvedTheme;
  setTheme: (t: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useThemeStore(): ThemeContextValue {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [theme, resolved] = snap.split("|") as [ThemePreference, ResolvedTheme];
  return { theme, resolved, setTheme: (t) => setPref(t, true) };
}

/**
 * Applies `data-theme` on <html>, persists to localStorage["quantum.theme"], follows the system
 * when the preference is "system", and listens for:
 *  - `quantum:theme` (from the Quantum ID SDK) → applied without re-dispatching,
 *  - `storage` events (another tab changed the theme).
 * Pair it with a tiny inline script in <head> that sets data-theme before first paint.
 */
export function ThemeProvider({ children, defaultTheme = "dark" }: { children: ReactNode; defaultTheme?: ThemePreference }) {
  const value = useThemeStore();

  useEffect(() => {
    if (isPref(defaultTheme)) fallback = defaultTheme;
    current = readStored();
    applyToDocument(current);
    emit();

    const onProfileTheme = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isPref(detail) && detail !== current) setPref(detail, false);
      else if (isPref(detail)) applyToDocument(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = isPref(e.newValue) ? e.newValue : fallback;
      current = next;
      applyToDocument(next);
      emit();
    };
    window.addEventListener(THEME_EVENT, onProfileTheme);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onProfileTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, [defaultTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** `{ theme, resolved, setTheme }`. Works inside or outside `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  const store = useThemeStore();
  return ctx ?? store;
}

/** Light / dark switch. Shows the theme you will switch *to*. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const next: ResolvedTheme = resolved === "dark" ? "light" : "dark";
  const label = `Switch to ${next} theme`;
  return (
    <button
      type="button"
      className={["q-icon-btn", className].filter(Boolean).join(" ")}
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
    >
      <Icon name={resolved === "dark" ? "sun" : "moon"} size={16} />
    </button>
  );
}
