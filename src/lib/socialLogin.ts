import { establishSession } from "@/lib/session";

const API_ORIGIN = (import.meta.env.VITE_API_PROXY_TARGET || "https://petory-api.likelion.shop").replace(
  /\/$/,
  "",
);

export type SocialProvider = "google" | "kakao";

export function startSocialLogin(provider: SocialProvider): void {
  window.location.assign(`${API_ORIGIN}/oauth2/authorization/${provider}`);
}

type SocialCallback =
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "error" }
  | { kind: "none" };

function consumeSocialCallback(): SocialCallback {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const failed = params.get("error") === "social";
  if ((accessToken && refreshToken) || failed) {
    window.history.replaceState(null, "", window.location.pathname);
  }
  if (accessToken && refreshToken) {
    return { kind: "tokens", accessToken, refreshToken };
  }
  if (failed) {
    return { kind: "error" };
  }
  return { kind: "none" };
}

// 쿼리의 토큰은 첫 렌더 전에 거둔다. effect에서 지우면 실패 안내가 한 번 더 마운트될 때 사라진다.
export const socialCallback = consumeSocialCallback();

let applied = false;

export function applySocialLogin(): void {
  if (applied || socialCallback.kind !== "tokens") {
    return;
  }
  applied = true;
  void establishSession({
    accessToken: socialCallback.accessToken,
    refreshToken: socialCallback.refreshToken,
  });
}
