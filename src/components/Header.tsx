import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Bell, Search, UserRound } from "lucide-react";
import { normalizeHashtag } from "@/lib/postFormat";
import { useAuthStore } from "@/stores/useAuthStore";

export function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isLoggedIn = accessToken !== null;
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const onSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const hashtag = normalizeHashtag(query);
    void navigate(hashtag === "" ? "/" : `/?q=${encodeURIComponent(hashtag)}`);
  };

  return (
    <header className="border-b-2 border-neutral-900 bg-white">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link to="/" className="font-brand text-xl tracking-wide md:hidden">
          petory
        </Link>
        <form className="mx-auto flex w-full max-w-md items-center gap-2" onSubmit={onSearch}>
          <label className="sr-only" htmlFor="feed-search">
            해시태그 검색
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="feed-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="#해시태그"
              className="h-9 w-full rounded-full border-2 border-neutral-900 bg-white pr-3 pl-9 text-sm outline-none"
            />
          </div>
        </form>
        <div className="flex items-center gap-2 text-sm">
          <button type="button" aria-label="알림" className="rounded-md p-1 hover:bg-neutral-100">
            <Bell className="size-5" />
          </button>
          {isLoggedIn ? (
            <>
              {user !== null && user.id > 0 ? (
                <Link
                  to={`/profile/${user.id}`}
                  aria-label="내 프로필"
                  className="flex size-8 items-center justify-center rounded-full border-2 border-neutral-900"
                >
                  <UserRound className="size-4" />
                </Link>
              ) : null}
              <button type="button" className="hidden text-neutral-500 hover:text-neutral-900 sm:inline" onClick={clearSession}>
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-md border-2 border-neutral-900 px-3 py-1 font-medium">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
