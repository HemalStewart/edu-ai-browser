"use client";
// Quantum ID client: one profile for every Quantum tool (CONTRACT.md §2).
//
// Hub mode (tool === "hub"): same-origin calls with the httpOnly `qid_session` cookie.
// Tool mode: OAuth-style redirect to the hub's /authorize, code exchange at /api/oauth/token,
// access token kept in localStorage["quantum.token"] and sent as `Authorization: Bearer`.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { hubUrl } from "./hub-url";
import type { MeResponse, QuantumIdContextValue, QuantumIdStatus, ThemePreference } from "./types";

const TOKEN_KEY = "quantum.token";
const THEME_KEY = "quantum.theme";
const PENDING_KEY = "quantum.oauth";

const THEMES: ThemePreference[] = ["light", "dark", "system"];
const isTheme = (v: unknown): v is ThemePreference => typeof v === "string" && (THEMES as string[]).includes(v);

// Storage access can throw (privacy modes, sandboxed iframes): never let it break the app.
function readStorage(kind: "local" | "session", key: string): string | null {
  try {
    return (kind === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(kind: "local" | "session", key: string, value: string | null): void {
  try {
    const s = kind === "local" ? window.localStorage : window.sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The current page URL without OAuth params or fragment: what we register as `redirect_uri`. */
function currentRedirectUri(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.hash = "";
  return url.toString();
}

// Module-level guards so React StrictMode's double effects never spend a code twice
// or record the same app-open twice in one page load.
const exchanges = new Map<string, Promise<string | null>>();
const openedThisLoad = new Set<string>();

type State = { status: QuantumIdStatus; me?: MeResponse; token?: string };

const QuantumIdContext = createContext<QuantumIdContextValue | null>(null);

/** Link to a hub page: relative on the hub itself, absolute (hubUrl) from a tool. */
export function hubLink(tool: string, path: string): string {
  return tool === "hub" ? path : hubUrl(path);
}

export function QuantumIdProvider({ tool, children }: { tool: string; children: ReactNode }) {
  const isHub = tool === "hub";
  const [state, setState] = useState<State>({ status: "loading" });
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const call = useCallback(
    (path: string, init: RequestInit = {}, token?: string) => {
      const headers = new Headers(init.headers);
      if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      if (isHub) return fetch(path, { ...init, headers, credentials: "include" });
      const t = token ?? readStorage("local", TOKEN_KEY);
      if (t) headers.set("Authorization", `Bearer ${t}`);
      return fetch(hubUrl(path), { ...init, headers, credentials: "omit" });
    },
    [isHub],
  );

  /** profile → kit: store the theme and tell ThemeProvider (it applies without re-dispatching). */
  const applyTheme = useCallback((theme: ThemePreference) => {
    if (readStorage("local", THEME_KEY) === theme) return;
    writeStorage("local", THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent("quantum:theme", { detail: theme }));
  }, []);

  const loadMe = useCallback(async () => {
    const token = isHub ? undefined : readStorage("local", TOKEN_KEY) ?? undefined;
    if (!isHub && !token) {
      setState({ status: "signed-out" });
      return;
    }
    let res: Response;
    try {
      res = await call("/api/me", { cache: "no-store" }, token);
    } catch {
      // Offline or hub unreachable: keep any token and retry when we're back online.
      setState((s) => (s.status === "signed-in" ? s : { status: "signed-out" }));
      return;
    }
    if (res.status === 401) {
      if (!isHub) writeStorage("local", TOKEN_KEY, null);
      setState({ status: "signed-out" });
      return;
    }
    if (!res.ok) {
      setState((s) => (s.status === "signed-in" ? s : { status: "signed-out" }));
      return;
    }
    const me = (await res.json()) as MeResponse;
    if (isTheme(me.preferences?.theme)) applyTheme(me.preferences.theme);
    setState({ status: "signed-in", me, token });
    if (!isHub && !openedThisLoad.has(tool)) {
      openedThisLoad.add(tool);
      call(`/api/me/apps/${encodeURIComponent(tool)}/open`, { method: "POST" }, token).catch(() => {});
    }
  }, [applyTheme, call, isHub, tool]);

  /** Tool mode: finish a redirect back from /authorize (verify state, exchange the code). */
  const completeRedirect = useCallback(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");
    const pendingRaw = readStorage("session", PENDING_KEY);
    // Only touch the URL when we started a sign-in; a tool may use ?code= for its own things.
    if (!code || returnedState === null || !pendingRaw) return;
    let pending: { state?: string; redirectUri?: string } = {};
    try {
      pending = JSON.parse(pendingRaw);
    } catch {
      /* treated as mismatch */
    }
    if (pending.state && pending.redirectUri && pending.state === returnedState) {
      let p = exchanges.get(code);
      if (!p) {
        p = fetch(hubUrl("/api/oauth/token"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "omit",
          body: JSON.stringify({ code, client_id: tool, redirect_uri: pending.redirectUri }),
        })
          .then(async (r) => (r.ok ? ((await r.json()) as { access_token?: string }).access_token ?? null : null))
          .catch(() => null);
        exchanges.set(code, p);
      }
      const token = await p;
      if (token) writeStorage("local", TOKEN_KEY, token);
    }
    writeStorage("session", PENDING_KEY, null);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [tool]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isHub) await completeRedirect();
      if (!cancelled) await loadMe();
    })();
    return () => {
      cancelled = true;
    };
  }, [completeRedirect, isHub, loadMe]);

  // kit → profile: the user changed the theme somewhere in this app.
  useEffect(() => {
    const onChanged = (e: Event) => {
      const theme = (e as CustomEvent).detail;
      const s = stateRef.current;
      if (!isTheme(theme) || s.status !== "signed-in") return;
      setState((prev) => (prev.me ? { ...prev, me: { ...prev.me, preferences: { theme } } } : prev));
      call("/api/me/preferences", { method: "PATCH", body: JSON.stringify({ theme }) }, s.token).catch(() => {});
    };
    const onOnline = () => {
      if (stateRef.current.status !== "signed-in") void loadMe();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && !isHub) void loadMe(); // signed in/out in another tab
    };
    window.addEventListener("quantum:theme-changed", onChanged);
    window.addEventListener("online", onOnline);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("quantum:theme-changed", onChanged);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("storage", onStorage);
    };
  }, [call, isHub, loadMe]);

  const signIn = useCallback(() => {
    if (isHub) {
      const here = window.location.pathname + window.location.search;
      window.location.assign("/signin?next=" + encodeURIComponent(here));
      return;
    }
    const redirectUri = currentRedirectUri();
    const st = randomState();
    writeStorage("session", PENDING_KEY, JSON.stringify({ state: st, redirectUri }));
    window.location.assign(
      hubUrl("/authorize") +
        "?client_id=" + encodeURIComponent(tool) +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&state=" + encodeURIComponent(st),
    );
  }, [isHub, tool]);

  const signOut = useCallback(() => {
    if (isHub) {
      fetch("/api/auth/signout", { method: "POST", credentials: "include" })
        .catch(() => {})
        .finally(() => setState({ status: "signed-out" }));
      return;
    }
    writeStorage("local", TOKEN_KEY, null);
    setState({ status: "signed-out" });
  }, [isHub]);

  const setThemePreference = useCallback(
    async (theme: ThemePreference) => {
      if (!isTheme(theme)) return;
      applyTheme(theme);
      const s = stateRef.current;
      if (s.status !== "signed-in") return;
      setState((prev) => (prev.me ? { ...prev, me: { ...prev.me, preferences: { theme } } } : prev));
      await call("/api/me/preferences", { method: "PATCH", body: JSON.stringify({ theme }) }, s.token).catch(() => {});
    },
    [applyTheme, call],
  );

  const value = useMemo<QuantumIdContextValue>(
    () => ({
      status: state.status,
      user: state.me?.user,
      me: state.me,
      token: state.token,
      tool,
      signIn,
      signOut,
      refresh: loadMe,
      setThemePreference,
    }),
    [state, tool, signIn, signOut, loadMe, setThemePreference],
  );

  return <QuantumIdContext.Provider value={value}>{children}</QuantumIdContext.Provider>;
}

export function useQuantumId(): QuantumIdContextValue {
  const ctx = useContext(QuantumIdContext);
  if (!ctx) throw new Error("useQuantumId must be used inside <QuantumIdProvider tool=\"…\">.");
  return ctx;
}
