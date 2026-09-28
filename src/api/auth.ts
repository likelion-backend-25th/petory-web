import { apiClient } from "@/lib/apiClient";
import type { LoginRequest, TokenResponse } from "@/types/auth";

export function login(payload: LoginRequest): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/login", {
    method: "POST",
    body: payload,
  });
}
