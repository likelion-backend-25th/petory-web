import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostImageCarouselProps {
  imageUrls: string[];
  alt: string;
  imageClassName: string;
  href?: string;
}

function CarouselImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 text-sm text-neutral-400 ${className}`}>
        이미지를 불러올 수 없습니다
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export function PostImageCarousel({ imageUrls, alt, imageClassName, href }: PostImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = imageUrls.length;
  if (count === 0) {
    return null;
  }
  const currentIndex = index >= count ? 0 : index;
  const current = imageUrls[currentIndex];
  const multiple = count > 1;

  const shift = (delta: number): void => {
    setIndex((value) => {
      const base = value >= count ? 0 : value;
      return (base + delta + count) % count;
    });
  };

  const image = <CarouselImage src={current} alt={alt} className={imageClassName} />;

  return (
    <div className="relative">
      {href ? (
        <Link to={href} className="block">
          {image}
        </Link>
      ) : (
        image
      )}
      {multiple ? (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full border-2 border-neutral-900 bg-white/90 p-1 text-neutral-900"
            onClick={() => shift(-1)}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="다음 사진"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full border-2 border-neutral-900 bg-white/90 p-1 text-neutral-900"
            onClick={() => shift(1)}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}

interface PostGalleryProps {
  imageUrls: string[];
  alt: string;
  credit: string;
}

export function PostGallery({ imageUrls, alt, credit }: PostGalleryProps) {
  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="relative">
        <PostImageCarousel
          imageUrls={imageUrls}
          alt={alt}
          imageClassName="aspect-[4/3] w-full object-cover"
        />
        <p className="pointer-events-none absolute right-3 bottom-2 text-xs text-neutral-500">made by. {credit}</p>
      </div>
    </div>
  );
}
