import { Link } from "react-router";
import type { PostListItem } from "@/types/post";

interface FeedBannerProps {
  featured: PostListItem | null;
}

export function FeedBanner({ featured }: FeedBannerProps) {
  return (
    <section className="overflow-hidden rounded-xl border-2 border-neutral-900 bg-white">
      <div className="flex min-h-40 flex-col justify-end bg-neutral-100 px-6 py-5">
        <p className="font-brand text-4xl tracking-wide">petory</p>
        {featured ? (
          <Link to={`/posts/${featured.id}`} className="mt-2 text-sm text-neutral-700 hover:underline">
            {featured.content}
          </Link>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">반려동물과 함께하는 일상</p>
        )}
      </div>
    </section>
  );
}
