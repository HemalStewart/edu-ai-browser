// Hub URL rule shared by the kit and the SDK (CONTRACT.md §2):
// globalThis.__QUANTUM_HUB_URL__ (Vite tools set it) → process.env.NEXT_PUBLIC_QUANTUM_HUB_URL
// (literal access in try/catch so Next inlines it) → http://localhost:4000.

// Module-scoped declaration so Vite projects without @types/node still typecheck. It is erased at
// compile time, so bundlers still see the literal `process.env.NEXT_PUBLIC_QUANTUM_HUB_URL`.
declare const process: { env: Record<string, string | undefined> };

const DEFAULT_HUB = "http://localhost:4000";

export function hubBase(): string {
  const fromGlobal = (globalThis as { __QUANTUM_HUB_URL__?: unknown }).__QUANTUM_HUB_URL__;
  if (typeof fromGlobal === "string" && fromGlobal) return fromGlobal.replace(/\/+$/, "");
  try {
    const fromEnv = process.env.NEXT_PUBLIC_QUANTUM_HUB_URL;
    if (fromEnv) return fromEnv.replace(/\/+$/, "");
  } catch {
    /* `process` is not defined (plain Vite) */
  }
  return DEFAULT_HUB;
}

/** Absolute URL on the Quantum Hub, e.g. `hubUrl("/account")`. */
export function hubUrl(path: string = "/"): string {
  return hubBase() + (path.startsWith("/") ? path : "/" + path);
}
