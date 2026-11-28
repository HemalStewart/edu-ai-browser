/**
 * Hub URL resolution, shared rule with @quantum/id (CONTRACT.md §2):
 *   globalThis.__QUANTUM_HUB_URL__ (Vite tools set it)
 *   → process.env.NEXT_PUBLIC_QUANTUM_HUB_URL (literal access so Next inlines it; guarded for Vite)
 *   → http://localhost:4000
 */

// Module-scoped declaration so this compiles in tools without @types/node. At runtime the
// bundler (Next) replaces the literal `process.env.NEXT_PUBLIC_QUANTUM_HUB_URL`; in Vite the
// reference throws and is caught.
declare const process: { env: Record<string, string | undefined> };

const DEFAULT_HUB = "http://localhost:4000";
const trim = (u: string) => u.replace(/\/+$/, "");

export function quantumHubUrl(path = ""): string {
  let base = "";
  try {
    const g = (globalThis as { __QUANTUM_HUB_URL__?: unknown }).__QUANTUM_HUB_URL__;
    if (typeof g === "string" && g) base = g;
  } catch {
    /* ignore */
  }
  if (!base) {
    try {
      const v = process.env.NEXT_PUBLIC_QUANTUM_HUB_URL;
      if (v) base = v;
    } catch {
      /* `process` is not defined (Vite, browser) */
    }
  }
  base = trim(base || DEFAULT_HUB);
  if (!path) return base;
  return base + (path.startsWith("/") ? path : `/${path}`);
}

/** Token for cross-origin calls (set by the Quantum ID SDK). */
export function quantumToken(): string | null {
  try {
    return window.localStorage.getItem("quantum.token");
  } catch {
    return null;
  }
}
