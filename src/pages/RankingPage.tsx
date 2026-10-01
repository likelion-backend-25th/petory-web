import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useRanking } from "@/hooks/useRanking";

function RankAvatar({ nickname, profileImage }: { nickname: string; profileImage: string | null }) {
  const [failed, setFailed] = useState(false);
  if (profileImage && !failed) {
    return (
      <img
        src={profileImage}
        alt=""
        className="size-14 rounded-full border-2 border-neutral-900 object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="flex size-14 items-center justify-center rounded-full border-2 border-neutral-900 text-lg">
      {nickname.slice(0, 1) || "P"}
    </span>
  );
}

export function RankingPage() {
  const { pets, hasNext, status, errorMessage, errorStatus, isLoadingMore, loadMore } = useRanking(20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || status !== "success" || !hasNext || errorMessage) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [errorMessage, hasNext, loadMore, status]);

  return (
    <section className="space-y-4">
      <header className="rounded-xl border-2 border-neutral-900 bg-white px-5 py-4">
        <h1 className="text-xl font-semibold">인기/핫 랭킹</h1>
        <p className="mt-1 text-sm text-neutral-500">팔로워가 많은 순입니다.</p>
      </header>
      {status === "loading" ? <p className="text-neutral-500">랭킹을 불러오는 중...</p> : null}
      {status === "error" ? (
        <p className="text-sm text-red-600">
          {errorStatus === 401 ? (
            <>
              랭킹을 보려면{" "}
              <Link to="/login" state={{ from: "/ranking" }} className="underline">
                로그인
              </Link>
              해 주세요.
            </>
          ) : (
            errorMessage
          )}
        </p>
      ) : null}
      {status === "success" && pets.length === 0 ? (
        <p className="text-neutral-500">아직 랭킹에 오른 반려동물이 없습니다.</p>
      ) : null}
      {pets.length > 0 ? (
        <ol className="space-y-3">
          {pets.map((pet, index) => (
            <li key={pet.memberId}>
              <Link
                to={`/profile/${pet.memberId}`}
                className="flex items-center gap-4 rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 hover:bg-neutral-50"
              >
                <span className="w-8 text-lg font-semibold">{index + 1}</span>
                <RankAvatar nickname={pet.nickname} profileImage={pet.profileImage} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{pet.nickname}</span>
                  <span className="text-sm text-neutral-500">팔로워 {pet.followerCount}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : null}
      <div ref={sentinelRef} className="h-8" />
      {isLoadingMore ? <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p> : null}
      {errorMessage && pets.length > 0 ? <p className="text-center text-sm text-red-600">{errorMessage}</p> : null}
    </section>
  );
}
