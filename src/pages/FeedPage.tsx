import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { FeedBanner } from "@/components/FeedBanner";
import { FeedTopPets } from "@/components/FeedTopPets";
import { PostCard } from "@/components/PostCard";
import { usePostFeed } from "@/hooks/usePostFeed";
import { isSubscriberOnly, normalizeHashtag } from "@/lib/postFormat";
import { canViewSubscriberPost } from "@/lib/subscriberAccess";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscribedMemberIds } from "@/stores/useSubscriptionStore";

export function FeedPage() {
  const [searchParams] = useSearchParams();
  const hashtag = normalizeHashtag(searchParams.get("q") ?? "");
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const subscribedAuthorIds = useSubscribedMemberIds();
  const { posts, hasNext, status, errorMessage, isLoadingMore, loadMore } = usePostFeed(hashtag);
  const visiblePosts = posts.filter((post) =>
    canViewSubscriberPost(isSubscriberOnly(post.isSubscriberOnly), post.memberId, myId, subscribedAuthorIds),
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || status !== "success" || !hasNext || errorMessage || isLoadingMore) {
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
  }, [errorMessage, hasNext, isLoadingMore, loadMore, posts.length, status]);

  return (
    <section className="space-y-6">
      {hashtag === "" ? (
        <>
          <FeedBanner />
          <FeedTopPets />
        </>
      ) : (
        <p className="text-sm text-neutral-500">#{hashtag}</p>
      )}
      {status === "loading" ? <p className="text-neutral-500">피드를 불러오는 중...</p> : null}
      {status === "error" && posts.length === 0 ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
      {status === "success" && visiblePosts.length === 0 && !hasNext && !isLoadingMore ? (
        <p className="text-neutral-500">
          {hashtag === "" ? "아직 게시글이 없습니다." : `#${hashtag} 게시글이 없습니다.`}
        </p>
      ) : null}

      {visiblePosts.length > 0 ? (
        <ul className="space-y-4">
          {visiblePosts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      ) : null}

      <div ref={sentinelRef} className="h-8" />
      {isLoadingMore ? <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p> : null}
      {status === "success" && !hasNext && visiblePosts.length > 0 ? (
        <p className="text-center text-sm text-neutral-400">마지막 게시글입니다.</p>
      ) : null}
      {errorMessage && visiblePosts.length > 0 ? (
        <p className="text-center text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </section>
  );
}
