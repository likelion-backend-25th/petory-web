import { cn } from "@/lib/cn";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function AdminPagination({ page, totalPages, onChange }: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-5 flex items-center justify-center gap-3 text-sm" aria-label="페이지">
      <button
        type="button"
        className="disabled:text-neutral-300"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
      >
        {"<"}
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(item === page && "font-semibold underline")}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        className="disabled:text-neutral-300"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
      >
        {">"}
      </button>
    </nav>
  );
}
