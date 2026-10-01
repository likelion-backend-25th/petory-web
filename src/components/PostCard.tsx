import { Link } from "react-router";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PostImageCarousel } from "@/components/PostGallery";
import { formatPostDate, isSubscriberOnly, parseHashtags } from "@/lib/postFormat";
import { displayViewCount } from "@/lib/viewCounts";
import type { PostListItem } from "@/types/post";

interface PostCardProps {
  post: PostListItem;
  detailPath?: string;
}

export function PostCard({ post, detailPath = `/posts/${post.id}` }: PostCardProps) {
  const tags = parseHashtags(post.hashtags);

  return (
    <article className="space-y-3 rounded-xl border-2 border-neutral-900 bg-white p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/profile/${post.memberId}`} className="truncate font-medium hover:underline">
            {post.nickname}
          </Link>
          <p className="text-xs text-neutral-500">{formatPostDate(post.createdAt)}</p>
        </div>
        {isSubscriberOnly(post.isSubscriberOnly) ? (
          <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
            구독자 전용
          </span>
        ) : null}
      </header>
      <Link to={detailPath} className="block">
        <p className="whitespace-pre-wrap text-neutral-800">{post.content}</p>
      </Link>
      {post.imageUrls.length > 0 ? (
        <PostImageCarousel
          key={post.id}
          imageUrls={post.imageUrls}
          alt={post.content}
          href={detailPath}
          imageClassName="aspect-video w-full rounded-lg object-cover"
        />
      ) : null}
      {tags.length > 0 ? (
        <Link to={detailPath} className="block">
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="text-sm text-neutral-500">
                {tag}
              </li>
            ))}
          </ul>
        </Link>
      ) : null}
      <footer className="flex items-center justify-between gap-3 text-sm text-neutral-500">
        <Link to={detailPath} className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Heart className="size-4" aria-hidden />
            {post.likeCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-4" aria-hidden />
            {post.commentCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-4" aria-hidden />
            <span className="sr-only">조회수</span>
            {displayViewCount(post.id, post.viewCount)}
          </span>
        </Link>
        <BookmarkButton postId={post.id} from={detailPath} />
      </footer>
    </article>
  );
}
