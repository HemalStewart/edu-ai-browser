// Server-side checks for tool routes. Import this module directly from server code.
import { hubUrl } from "./hub-url";
import type { QuantumUser } from "./types";

export async function verifyQuantumId(token: string | null | undefined, clientId: string): Promise<QuantumUser | null> {
  if (!token || token.length > 8192 || /\s/.test(token)) return null;

  try {
    const response = await fetch(hubUrl("/api/oauth/identity?client_id=" + encodeURIComponent(clientId)), {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const { user } = await response.json();
    if (!user || typeof user.id !== "string" || typeof user.name !== "string" || typeof user.email !== "string") return null;
    return user as QuantumUser;
  } catch {
    return null;
  }
}

export function quantumBearer(request: Request): string | undefined {
  return /^Bearer ([^\s]+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
}
