import { login, signUp } from "@/api/auth";
import { getProfile } from "@/api/profile";
import { readUserFromAccessToken } from "@/lib/jwt";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LoginRequest, SignUpRequest } from "@/types/auth";
import type { User } from "@/types/user";

export async function signIn(payload: LoginRequest): Promise<void> {
  const tokens = await login(payload);
  const claims = readUserFromAccessToken(tokens.accessToken);
  let user: User = {
    id: claims.id ?? 0,
    email: claims.email,
    nickname: claims.nickname,
  };

  useAuthStore.getState().setSession(user, tokens.accessToken, tokens.refreshToken);

  if (user.id > 0) {
    try {
      const profile = await getProfile(user.id);
      user = {
        id: profile.id,
        email: profile.email ?? user.email,
        nickname: profile.nickname || user.nickname,
      };
      useAuthStore.getState().setSession(user, tokens.accessToken, tokens.refreshToken);
    } catch {
      // 프로필 조회 실패해도 토큰으로 결제 API는 호출할 수 있다.
    }
  }
}

export async function signUpAndSignIn(payload: SignUpRequest): Promise<void> {
  await signUp(payload);
  await signIn({ email: payload.email, password: payload.password });
}
