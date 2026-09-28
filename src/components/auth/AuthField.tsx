import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const controlClass =
  "h-10 w-full rounded-md border-2 border-neutral-900 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AuthField({
  id,
  label,
  error,
  actionLabel,
  onAction,
  className,
  ...props
}: AuthFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm text-neutral-800">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input id={inputId} className={cn(controlClass, className)} {...props} />
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="h-8 shrink-0 rounded-md border-2 border-neutral-900 px-2.5 text-xs whitespace-nowrap hover:bg-neutral-50"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

interface AuthSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function AuthSelect({ id, label, error, className, children, ...props }: AuthSelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm text-neutral-800">
        {label}
      </label>
      <select id={selectId} className={cn(controlClass, className)} {...props}>
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

interface AuthTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function AuthTextarea({ id, label, error, className, ...props }: AuthTextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm text-neutral-800">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={cn(
          "min-h-20 w-full rounded-md border-2 border-neutral-900 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
