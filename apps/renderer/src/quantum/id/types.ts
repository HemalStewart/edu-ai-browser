/** Quantum ID public types (CONTRACT.md §2). */
export type ThemePreference = "light" | "dark" | "system";

export type QuantumUser = { id: string; name: string; email: string; createdAt: string };

export type MeResponse = {
  user: QuantumUser;
  preferences: { theme: ThemePreference };
  /** Every catalog tool. One profile = every app, so `enabled` is always true today. */
  apps: { slug: string; enabled: boolean; lastOpenedAt: string | null }[];
};

export type QuantumIdStatus = "loading" | "signed-out" | "signed-in";

export type QuantumIdContextValue = {
  status: QuantumIdStatus;
  user?: QuantumUser;
  me?: MeResponse;
  token?: string;
  /** The catalog slug this provider was mounted with ("hub" on the hub itself). */
  tool: string;
  signIn(): void;
  signOut(): void;
  refresh(): Promise<void>;
  setThemePreference(t: ThemePreference): Promise<void>;
};
