import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/cn";
import { toHandle } from "@/lib/postFormat";
import { useAuthStore } from "@/stores/useAuthStore";
import type { MemberProfile } from "@/types/profile";

interface ProfileHeroProps {
  profile: MemberProfile;
  isOwn: boolean;
  actions?: ReactNode;
  plansOpen?: boolean;
  onTogglePlans?: () => void;
}

function Avatar({ nickname, profileImage }: { nickname: string; profileImage: string | null }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt=""
        className="size-24 rounded-full border-2 border-neutral-900 object-cover"
      />
    );
  }
  return (
    <span className="flex size-24 items-center justify-center rounded-full border-2 border-neutral-900 text-3xl">
      {nickname.slice(0, 1) || "P"}
    </span>
  );
}

function OwnActions({
  memberId,
  plansOpen,
  onTogglePlans,
}: {
  memberId: number;
  plansOpen: boolean;
  onTogglePlans?: () => void;
}) {
  const actionClass = "rounded-md border-2 border-neutral-900 px-6 py-2 text-sm font-medium hover:bg-neutral-50";
  return (
    <>
      <Link to={`/profile/${memberId}/edit`} className={actionClass}>
        프로필 편집
      </Link>
      <Link to="/payments/history" className={actionClass}>
        결제 내역
      </Link>
      <button
        type="button"
        className={cn(actionClass, plansOpen && "bg-neutral-900 text-white hover:bg-neutral-800")}
        aria-expanded={plansOpen}
        onClick={onTogglePlans}
      >
        구독플랜 설정
      </button>
      <Link to="/subscriptions" className={actionClass}>
        구독 관리
      </Link>
    </>
  );
}

export function ProfileHero({ profile, isOwn, actions, plansOpen = false, onTogglePlans }: ProfileHeroProps) {
  const isLoggedIn = useAuthStore((state) => state.accessToken) !== null;
  const statClass = "min-w-20 rounded-md border-2 border-neutral-900 px-3 py-2";

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-5">
      <p className="text-lg font-semibold">{toHandle(profile.nickname)}</p>
      <div className="mt-4 flex flex-wrap items-start gap-6">
        <Avatar nickname={profile.nickname} profileImage={profile.profileImage} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">{profile.nickname}</h1>
          <p className="mt-1 text-sm text-neutral-600">{profile.intro || "소개가 없습니다."}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={statClass}>
            <p className="text-xs text-neutral-500">게시물</p>
            <p className="text-xl font-semibold">{profile.postsCount}</p>
          </div>
          {isLoggedIn ? (
            <Link to={`/profile/${profile.id}/followers`} className={`${statClass} hover:bg-neutral-50`}>
              <p className="text-xs text-neutral-500">팔로워</p>
              <p className="text-xl font-semibold">{profile.followers}</p>
            </Link>
          ) : (
            <div className={statClass}>
              <p className="text-xs text-neutral-500">팔로워</p>
              <p className="text-xl font-semibold">{profile.followers}</p>
            </div>
          )}
          {isLoggedIn ? (
            <Link to={`/profile/${profile.id}/followings`} className={`${statClass} hover:bg-neutral-50`}>
              <p className="text-xs text-neutral-500">팔로잉</p>
              <p className="text-xl font-semibold">{profile.followings}</p>
            </Link>
          ) : (
            <div className={statClass}>
              <p className="text-xs text-neutral-500">팔로잉</p>
              <p className="text-xl font-semibold">{profile.followings}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">
        {actions ??
          (isOwn ? (
            <div className="flex flex-wrap justify-end gap-2">
              <OwnActions memberId={profile.id} plansOpen={plansOpen} onTogglePlans={onTogglePlans} />
            </div>
          ) : null)}
      </div>
    </section>
  );
}
