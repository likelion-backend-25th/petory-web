import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { FeedBanner } from "@/components/FeedBanner";
import { FeedTopPets } from "@/components/FeedTopPets";
import { PostCard } from "@/components/PostCard";
import { usePostFeed } from "@/hooks/usePostFeed";

export function FeedPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const { posts, hasNext, status, errorMessage, isLoadingMore, loadMore } = usePostFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visible = query
    ? posts.filter((post) =>
        `${post.content} ${post.nickname} ${post.hashtags}`.toLowerCase().includes(query),
      )
    : posts;

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
      <FeedBanner featured={posts[0] ?? null} />
      <FeedTopPets posts={posts} />

      {query ? <p className="text-sm text-neutral-500">검색: {query}</p> : null}
      {status === "loading" ? <p className="text-neutral-500">피드를 불러오는 중...</p> : null}
      {status === "error" && posts.length === 0 ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
      {status === "success" && visible.length === 0 ? (
        <p className="text-neutral-500">아직 게시글이 없습니다.</p>
      ) : null}

      {visible.length > 0 ? (
        <ul className="space-y-4">
          {visible.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      ) : null}

      <div ref={sentinelRef} className="h-8" />
      {isLoadingMore ? <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p> : null}
      {status === "success" && !hasNext && posts.length > 0 ? (
        <p className="text-center text-sm text-neutral-400">마지막 게시글입니다.</p>
      ) : null}
      {errorMessage && posts.length > 0 ? (
        <p className="text-center text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </section>
  );
}
