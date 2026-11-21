export function sanitizeReturnTo(
  value: string | null | undefined,
  fallback = "/account",
): string {
  if (!value) return fallback;
  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  if (/^[\\/]{2}/.test(candidate) || /[\s\\]/.test(candidate)) return fallback;
  if (/^\/(api|login|register|forgot-password|reset-password|verify-email)(\/|$)/.test(candidate)) {
    return fallback;
  }
  return candidate;
}
