import { NavLink, useLocation } from "react-router";
import {
  Home,
  Flame,
  Search,
  HelpCircle,
  MapPinned,
  MessageCircle,
  PenSquare,
  Shield,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuthStore } from "@/stores/useAuthStore";

const navItems = [
  { to: "/", label: "홈", icon: Home, end: true },
  { to: "/ranking", label: "인기/핫 랭킹", icon: Flame, end: false },
  { to: "/club", label: "P클럽 찾기", icon: Search, end: false },
  { to: "/missing-pets", label: "실종동물 신고", icon: MapPinned, end: false },
  { to: "/qna", label: "QnA", icon: HelpCircle, end: false },
  { to: "/chat", label: "채팅", icon: MessageCircle, end: false },
] as const;

export function AppSidebar() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const myPageTo = user !== null && user.id > 0 ? "/mypage" : "/login";
  const isMyPage =
    location.pathname === "/mypage" ||
    (user !== null && user.id > 0 && location.pathname.startsWith(`/profile/${user.id}`));

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r-2 border-neutral-900 bg-white px-4 py-5 md:flex">
      <NavLink to="/" className="font-brand mb-8 px-2 text-3xl tracking-wide">
        petory
      </NavLink>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-100",
                isActive && "bg-neutral-900 text-white hover:bg-neutral-800",
              )
            }
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to={myPageTo}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-100",
            isMyPage && "bg-neutral-900 text-white hover:bg-neutral-800",
          )}
        >
          <UserRound className="size-4" aria-hidden />
          마이페이지
        </NavLink>
        {isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-100",
                isActive && "bg-neutral-900 text-white hover:bg-neutral-800",
              )
            }
          >
            <Shield className="size-4" aria-hidden />
            관리자
          </NavLink>
        ) : null}
      </nav>
      <NavLink
        to="/posts/new"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border-2 border-neutral-900 bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        <PenSquare className="size-4" aria-hidden />
        게시글작성
      </NavLink>
    </aside>
  );
}
