import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { useMissingPetList } from "@/hooks/useMissingPetList";

interface MissingPetThumbnailProps {
  imageUrl?: string;
  label: string;
}

function MissingPetThumbnail({ imageUrl, label }: MissingPetThumbnailProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
        이미지 없음
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={label}
      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
      onError={() => setFailedUrl(imageUrl)}
    />
  );
}

export function MissingPetListPage() {
  const {
    items,
    totalCount,
    hasNext,
    status,
    errorMessage,
    isLoadingMore,
    loadMore,
  } = useMissingPetList();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || status !== "success" || !hasNext || isLoadingMore) {
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
  }, [hasNext, isLoadingMore, loadMore, status]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border-2 border-neutral-900 bg-white p-6">
        <div>
          <p className="text-sm font-medium text-red-600">함께 찾아주세요</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            실종동물 신고
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            총 {totalCount.toLocaleString()}건의 실종 신고가 등록되어 있습니다.
          </p>
        </div>
        <Link
          to="/missing-pets/new"
          className="inline-flex h-10 items-center gap-2 rounded-md border-2 border-neutral-900 bg-neutral-900 px-4 text-sm font-medium text-white"
        >
          <Plus className="size-4" aria-hidden />
          실종 신고하기
        </Link>
      </header>

      {status === "loading" ? (
        <p className="text-neutral-500">실종 신고를 불러오는 중...</p>
      ) : null}
      {status === "error" && items.length === 0 ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
      {status === "success" && items.length === 0 ? (
        <div className="rounded-xl border-2 border-neutral-900 bg-white p-8 text-center text-neutral-500">
          등록된 실종 신고가 없습니다.
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item, index) => {
            const overlayLabel =
              item.status === "FOUND"
                ? "발견됨"
                : item.status === "CANCELLED"
                  ? "취소됨"
                  : null;
            const content = (
              <div className="relative h-full w-full">
                <MissingPetThumbnail
                  imageUrl={item.imageUrl}
                  label={`실종동물 신고 ${item.id ?? index + 1}`}
                />
                {overlayLabel ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <span className="text-4xl font-bold text-neutral-600/80 sm:text-5xl">
                      {overlayLabel}
                    </span>
                  </div>
                ) : null}
              </div>
            );

            return (
              <li
                key={item.id ?? `${item.imageUrl ?? "missing"}-${index}`}
                className="group aspect-square overflow-hidden rounded-xl border-2 border-neutral-900 bg-white"
              >
                {item.id === undefined ? (
                  content
                ) : (
                  <Link
                    to={`/missing-pets/${item.id}`}
                    className="block h-full w-full"
                    aria-label={`실종동물 신고 ${item.id} 상세 보기`}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      <div ref={sentinelRef} className="h-8" />
      {isLoadingMore ? (
        <p className="text-center text-sm text-neutral-500">더 불러오는 중...</p>
      ) : null}
      {status === "success" && !hasNext && items.length > 0 ? (
        <p className="text-center text-sm text-neutral-400">
          마지막 실종 신고입니다.
        </p>
      ) : null}
      {errorMessage && items.length > 0 ? (
        <p className="text-center text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </section>
  );
}
