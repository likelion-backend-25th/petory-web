import { Link, useParams } from "react-router";
import { SnackSupportForm } from "@/components/SnackSupportForm";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/useAuthStore";

export function ProfilePage() {
  const { memberId } = useParams();
  const { profile, status, errorMessage } = useProfile(memberId);
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const isOwnProfile = profile !== null && myId !== null && myId > 0 && myId === profile.id;

  if (status === "loading") {
    return <p className="text-neutral-500">프로필을 불러오는 중...</p>;
  }

  if (status === "error" || profile === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">프로필을 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/" className="inline-block text-sm font-medium underline">
          피드로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="text-2xl font-semibold tracking-tight">{profile.nickname}</h1>
        {profile.intro ? <p className="text-sm text-neutral-600">{profile.intro}</p> : null}
        <p className="text-xs text-neutral-400">
          게시글 {profile.postsCount} · 팔로워 {profile.followers} · 팔로잉 {profile.followings}
        </p>
      </div>
      {isOwnProfile ? (
        <p className="text-sm text-neutral-500">내 프로필에는 후원하기가 표시되지 않습니다.</p>
      ) : (
        <SnackSupportForm targetMemberId={profile.id} targetNickname={profile.nickname} />
      )}
    </section>
  );
}
