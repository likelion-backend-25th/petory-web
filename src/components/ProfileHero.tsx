import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { deleteMyProfile } from "@/api/profile";
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
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionClass = "rounded-md border-2 border-neutral-900 px-6 py-2 text-sm font-medium hover:bg-neutral-50";

  const confirmWithdraw = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await deleteMyProfile(memberId);
      clearSession();
      void navigate("/", { replace: true });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

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
      <button type="button" className={cn(actionClass, "text-red-600")} onClick={() => setConfirmOpen(true)}>
        탈퇴하기
      </button>
      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
            className="w-full max-w-sm rounded-xl border-2 border-neutral-900 bg-white p-5"
          >
            <h2 id="withdraw-title" className="text-center text-lg font-semibold">
              정말 탈퇴하시겠습니까?
            </h2>
            {error ? <p className="mt-2 text-center text-sm text-red-600">{error}</p> : null}
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                className="h-9 rounded-md border-2 border-neutral-900 px-5 text-sm hover:bg-neutral-50"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
              >
                취소
              </button>
              <button
                type="button"
                className="h-9 rounded-md border-2 border-neutral-900 bg-neutral-900 px-5 text-sm text-white disabled:opacity-50"
                onClick={() => void confirmWithdraw()}
                disabled={busy}
              >
                {busy ? "탈퇴 중..." : "탈퇴"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
