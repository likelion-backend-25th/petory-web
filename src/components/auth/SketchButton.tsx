import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SketchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  filled?: boolean;
}

export function SketchButton({ filled = false, className, type = "button", ...props }: SketchButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "h-9 rounded-md border-2 border-neutral-900 px-3 text-sm font-medium transition-colors disabled:opacity-50",
        filled ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-white hover:bg-neutral-50",
        className,
      )}
      {...props}
    />
  );
}
