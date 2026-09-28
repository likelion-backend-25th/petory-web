function readNumberClaim(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }
  return null;
}

export function readJwtClaims(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (payload === undefined) {
      return null;
    }
    const json = atob(payload.replaceAll("-", "+").replaceAll("_", "/"));
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function readUserFromAccessToken(token: string): {
  id: number | null;
  email: string;
  nickname: string;
} {
  const claims = readJwtClaims(token);
  if (claims === null) {
    return { id: null, email: "", nickname: "" };
  }

  const id =
    readNumberClaim(claims.memberId) ??
    readNumberClaim(claims.userId) ??
    readNumberClaim(claims.id) ??
    readNumberClaim(claims.sub);

  const email =
    typeof claims.email === "string"
      ? claims.email
      : typeof claims.sub === "string" && !/^\d+$/.test(claims.sub)
        ? claims.sub
        : "";

  const nickname = typeof claims.nickname === "string" ? claims.nickname : "";

  return { id, email, nickname };
}
