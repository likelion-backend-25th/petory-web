import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";
import type { LoginRequest, SignUpRequest, SignUpResponse, TokenResponse } from "@/types/auth";

export function login(payload: LoginRequest): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/login", {
    method: "POST",
    body: payload,
  });
}

export function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  return apiClient<SignUpResponse>("/signup", {
    method: "POST",
    body: payload,
  });
}

function readTaken(body: unknown): boolean | null {
  if (typeof body === "boolean") {
    return body;
  }
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.exists === "boolean") {
    return record.exists;
  }
  if (typeof record.duplicated === "boolean") {
    return record.duplicated;
  }
  if (typeof record.available === "boolean") {
    return !record.available;
  }
  return null;
}

async function isValueTaken(path: string, query: Record<string, string>): Promise<boolean> {
  try {
    const body = await apiClient<unknown>(path, { query, skipAuth: true });
    const taken = readTaken(body);
    if (taken === null) {
      throw new Error("중복 확인 응답을 해석하지 못했습니다.");
    }
    return taken;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 409) {
      return true;
    }
    throw error;
  }
}

export function isEmailTaken(email: string): Promise<boolean> {
  return isValueTaken("/email/exists", { email });
}

export function isNicknameTaken(nickname: string): Promise<boolean> {
  return isValueTaken("/nickname/exists", { nickname });
}
