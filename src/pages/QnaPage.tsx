import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { PostCard } from "@/components/PostCard";
import { usePostFeed } from "@/hooks/usePostFeed";
import { normalizeHashtag } from "@/lib/postFormat";

export function QnaPage() {
  const [searchParams] = useSearchParams();
  const hashtag = normalizeHashtag(searchParams.get("q") ?? "");
  const { posts, hasNext, status, errorMessage, isLoadingMore, loadMore } = usePostFeed(hashtag, "qna");
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
    <section className="space-y-6">
      <header className="rounded-xl border-2 border-neutral-900 bg-white px-5 py-4">
        <h1 className="text-xl font-semibold">Q&A</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {hashtag === "" ? "궁금한 점을 남겨 주세요." : `#${hashtag}`}
        </p>
      </header>
      {status === "loading" ? <p className="text-neutral-500">Q&A를 불러오는 중...</p> : null}
      {status === "error" && posts.length === 0 ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {status === "success" && posts.length === 0 ? (
        <p className="text-neutral-500">
          {hashtag === "" ? "아직 Q&A가 없습니다." : `#${hashtag} Q&A가 없습니다.`}
        </p>
      ) : null}
      {posts.length > 0 ? (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} detailPath={`/qna/${post.id}`} />
            </li>
          ))}
        </ul>
      ) : null}
      <div ref={sentinelRef} className="h-8" />
      {isLoadingMore ? <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p> : null}
      {status === "success" && !hasNext && posts.length > 0 ? (
        <p className="text-center text-sm text-neutral-400">마지막 Q&A입니다.</p>
      ) : null}
      {errorMessage && posts.length > 0 ? <p className="text-center text-sm text-red-600">{errorMessage}</p> : null}
    </section>
  );
}
