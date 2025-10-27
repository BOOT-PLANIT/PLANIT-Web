import type { UserLevel } from "../store/useAuthStore";

export function toUserLevel(v: unknown): UserLevel | null {
  if (typeof v !== "string") return null;
  const u = v.trim().toUpperCase();
  return u === "USER" || u === "ADMIN" ? (u as UserLevel) : null;
}
