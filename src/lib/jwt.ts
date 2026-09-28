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

function readRole(claims: Record<string, unknown>): string {
  if (typeof claims.role === "string" && claims.role.trim() !== "") {
    return claims.role;
  }
  if (Array.isArray(claims.roles)) {
    const first = claims.roles.find((item): item is string => typeof item === "string");
    return first ?? "";
  }
  return "";
}

export function readRolesFromAccessToken(token: string): string[] {
  const claims = readJwtClaims(token);
  if (claims === null) {
    return [];
  }
  const roles: string[] = [];
  if (typeof claims.role === "string") {
    roles.push(claims.role);
  }
  if (Array.isArray(claims.roles)) {
    for (const item of claims.roles) {
      if (typeof item === "string") {
        roles.push(item);
      }
    }
  }
  return roles;
}

export function readUserFromAccessToken(token: string): {
  id: number | null;
  email: string;
  nickname: string;
  role: string;
} {
  const claims = readJwtClaims(token);
  if (claims === null) {
    return { id: null, email: "", nickname: "", role: "" };
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

  return { id, email, nickname, role: readRole(claims) };
}
