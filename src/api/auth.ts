import { apiClient } from "@/lib/apiClient";
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
