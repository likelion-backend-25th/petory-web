import type { ReactNode } from "react";
import { Link } from "react-router";
import { toHandle } from "@/lib/postFormat";
import type { MemberProfile } from "@/types/profile";

interface ProfileHeroProps {
  profile: MemberProfile;
  isOwn: boolean;
  actions?: ReactNode;
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

function OwnActions({ memberId }: { memberId: number }) {
  return (
    <>
      <Link
        to={`/profile/${memberId}/edit`}
        className="rounded-md border-2 border-neutral-900 px-6 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        프로필 편집
      </Link>
      <Link
        to="/payments/history"
        className="rounded-md border-2 border-neutral-900 px-6 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        결제 내역
      </Link>
      <Link
        to="/subscriptions"
        className="rounded-md border-2 border-neutral-900 px-6 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        구독 관리
      </Link>
    </>
  );
}

export function ProfileHero({ profile, isOwn, actions }: ProfileHeroProps) {
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
          <div className="min-w-20 rounded-md border-2 border-neutral-900 px-3 py-2">
            <p className="text-xs text-neutral-500">게시물</p>
            <p className="text-xl font-semibold">{profile.postsCount}</p>
          </div>
          <Link
            to={`/profile/${profile.id}/followers`}
            className="min-w-20 rounded-md border-2 border-neutral-900 px-3 py-2 hover:bg-neutral-50"
          >
            <p className="text-xs text-neutral-500">팔로워</p>
            <p className="text-xl font-semibold">{profile.followers}</p>
          </Link>
          <Link
            to={`/profile/${profile.id}/followings`}
            className="min-w-20 rounded-md border-2 border-neutral-900 px-3 py-2 hover:bg-neutral-50"
          >
            <p className="text-xs text-neutral-500">팔로잉</p>
            <p className="text-xl font-semibold">{profile.followings}</p>
          </Link>
        </div>
      </div>
      <div className="mt-5">
        {actions ??
          (isOwn ? (
            <div className="flex flex-wrap justify-end gap-2">
              <OwnActions memberId={profile.id} />
            </div>
          ) : null)}
      </div>
    </section>
  );
}
