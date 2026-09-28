import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AuthCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function AuthCard({ title, children, className }: AuthCardProps) {
  return (
    <section
      className={cn(
        "w-full max-w-[360px] rounded-md border-2 border-neutral-900 bg-white px-8 py-9",
        className,
      )}
    >
      {title ? <h1 className="mb-8 text-center text-lg font-semibold">{title}</h1> : null}
      {children}
    </section>
  );
}
