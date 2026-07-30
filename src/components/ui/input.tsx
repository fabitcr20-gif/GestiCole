import { type ComponentProps, type ReactNode } from "react";
import clsx from "clsx";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block mb-1.5">
      <span className="text-base font-semibold text-foreground">{children}</span>
      {hint && <span className="block text-sm text-muted-foreground font-normal">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-lg text-foreground shadow-sm",
        "focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-lg text-foreground shadow-sm",
        "focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-lg text-foreground shadow-sm",
        "focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none",
        className
      )}
      {...props}
    />
  );
}

export function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} hint={hint}>
        {label}
      </Label>
      {children}
    </div>
  );
}
