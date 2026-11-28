// @quantum/id: the Quantum ID client SDK (CONTRACT.md §2).
// Vendored into tool repos by scripts/sync-kit.mjs, so: React only, relative imports, "use client".
export { QuantumIdProvider, useQuantumId } from "./provider";
export { ProfileButton, RequireQuantumId } from "./ui";
export { hubUrl } from "./hub-url";
export type { MeResponse, QuantumUser, ThemePreference, QuantumIdStatus, QuantumIdContextValue } from "./types";
