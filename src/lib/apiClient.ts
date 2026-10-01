import { readJwtClaims, readUserFromAccessToken } from "@/lib/jwt";
import { useAuthStore } from "@/stores/useAuthStore";
import { ApiError, readApiErrorMessage } from "@/types/api";
import type { TokenResponse } from "@/types/auth";
import type { User } from "@/types/user";

function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  // HTTPS 사이트에서 HTTP API를 직접 치면 mixed content로 막히므로 상대경로를 쓴다.
  if (
    baseUrl &&
    !(globalThis.location?.protocol === "https:" && baseUrl.startsWith("http://"))
  ) {
    return baseUrl.replace(/\/$/, "");
  }
  return "";
}

function getApiPrefix(): string {
  return `${getApiBaseUrl()}/api/v1`;
}

type QueryValue = string | number | boolean | null | undefined;

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  // 일부 컨트롤러는 /api/v1이 아닌 /api 바로 아래에 있다.
  const url = path.startsWith("/api/")
    ? `${getApiBaseUrl()}${path}`
    : `${getApiPrefix()}${path}`;
  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }
    params.set(key, String(value));
  }

  const search = params.toString();
  return search === "" ? url : `${url}?${search}`;
}

const REFRESH_PATH = "/refresh";

function isSessionPath(path: string): boolean {
  return path === "/login" || path === "/signup" || path === REFRESH_PATH;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.accessToken === "string" && typeof record.refreshToken === "string";
}

function isAccessTokenStale(token: string): boolean {
  const claims = readJwtClaims(token);
  const exp = claims?.exp;
  if (typeof exp !== "number") {
    return false;
  }
  return exp * 1000 <= Date.now() + 30_000;
}

function applyTokens(tokens: TokenResponse): void {
  const current = useAuthStore.getState().user;
  const claims = readUserFromAccessToken(tokens.accessToken);
  const user: User = {
    id: claims.id ?? current?.id ?? 0,
    email: claims.email || current?.email || "",
    nickname: claims.nickname || current?.nickname || "",
    role: claims.role || current?.role || "",
  };
  useAuthStore.getState().setSession(user, tokens.accessToken, tokens.refreshToken);
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(buildUrl(REFRESH_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      return false;
    }
    const body: unknown = await response.json();
    if (!isTokenResponse(body)) {
      return false;
    }
    applyTokens(body);
    return true;
  } catch {
    return false;
  }
}

// 서버는 갱신할 때마다 refreshToken을 교체한다. 동시에 온 401은 한 번만 갱신한다.
function refreshAccessTokenOnce(): Promise<boolean> {
  if (refreshInFlight === null) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: ApiClientOptions, retried: boolean): Promise<T> {
  const { body, headers, query, skipAuth = false, ...rest } = options;

  if (!skipAuth && !retried && !isSessionPath(path)) {
    const currentToken = useAuthStore.getState().accessToken;
    if (currentToken && isAccessTokenStale(currentToken)) {
      const refreshed = await refreshAccessTokenOnce();
      if (!refreshed) {
        useAuthStore.getState().clearSession();
      }
    }
  }

  const accessToken = skipAuth ? null : useAuthStore.getState().accessToken;

  try {
    const response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // 로그인 실패(401)는 기존 세션을 지우지 않는다. 만료된 토큰은 한 번 갱신 후 재시도한다.
      if (response.status === 401 && !skipAuth && !isSessionPath(path)) {
        if (!retried) {
          const refreshed = await refreshAccessTokenOnce();
          if (refreshed) {
            return request(path, options, true);
          }
        }
        useAuthStore.getState().clearSession();
      }

      const errorBody: unknown = await response.json().catch(() => null);
      throw new ApiError(readApiErrorMessage(errorBody, response.status), response.status, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (text.trim() === "") {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    throw new Error(message, { cause: error });
  }
}

export function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  return request(path, options, false);
}
