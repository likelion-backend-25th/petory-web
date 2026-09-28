import { ApiError, readApiErrorMessage } from "@/types/api";
import { useAuthStore } from "@/stores/useAuthStore";

function getApiPrefix(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  // HTTPS 사이트에서 HTTP API를 직접 치면 mixed content로 막히므로 상대경로를 쓴다.
  if (
    baseUrl &&
    !(globalThis.location?.protocol === "https:" && baseUrl.startsWith("http://"))
  ) {
    return `${baseUrl.replace(/\/$/, "")}/api/v1`;
  }
  return "/api/v1";
}

type QueryValue = string | number | boolean | null | undefined;

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${getApiPrefix()}${path}`;
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

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { body, headers, query, ...rest } = options;
  const accessToken = useAuthStore.getState().accessToken;

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
      // 로그인 실패(401)와 만료된 세션을 구분하기 위해 인증 요청은 세션을 유지한다.
      if (response.status === 401 && path !== "/login" && !path.startsWith("/auth/")) {
        useAuthStore.getState().clearSession();
      }

      const errorBody: unknown = await response.json().catch(() => null);
      throw new ApiError(readApiErrorMessage(errorBody, response.status), response.status, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    throw new Error(message, { cause: error });
  }
}
