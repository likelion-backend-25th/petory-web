import { NavLink } from "react-router";
import { cn } from "@/lib/cn";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const items = [
  { to: "/", label: "홈", end: true },
  { to: "/ranking", label: "랭킹", end: false },
  { to: "/club", label: "클럽", end: false },
  { to: "/missing-pets", label: "실종신고", end: false },
  { to: "/qna", label: "QnA", end: false },
  { to: "/chat", label: "채팅", end: false },
  { to: "/mypage", label: "마이", end: false },
  { to: "/posts/new", label: "작성", end: false },
] as const;

export function MobileNav() {
  const isAdmin = useIsAdmin();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b-2 border-neutral-900 bg-white px-3 py-2 text-xs md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "shrink-0 rounded-md border-2 border-neutral-900 px-2 py-1",
              isActive && "bg-neutral-900 text-white",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
      {isAdmin ? (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            cn(
              "shrink-0 rounded-md border-2 border-neutral-900 px-2 py-1",
              isActive && "bg-neutral-900 text-white",
            )
          }
        >
          관리자
        </NavLink>
      ) : null}
    </nav>
  );
}
