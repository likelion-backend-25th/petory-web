import { Link } from "react-router";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isLoggedIn = accessToken !== null;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Patory
        </Link>
        <div className="flex items-center gap-3 text-sm text-neutral-700">
          <button type="button" aria-label="알림" className="rounded-md p-1 hover:bg-neutral-100">
            <Bell className="size-5" />
          </button>
          {isLoggedIn ? (
            <>
              {user !== null && user.id > 0 ? (
                <Link to={`/profile/${user.id}`} className="max-w-28 truncate hover:underline">
                  {user.nickname || "내 프로필"}
                </Link>
              ) : null}
              <button type="button" className="text-neutral-500 hover:text-neutral-900" onClick={clearSession}>
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
