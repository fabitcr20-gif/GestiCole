import Link from "next/link";
import { type ComponentProps, type ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover border-transparent",
  secondary:
    "bg-white text-foreground hover:bg-slate-50 border-border",
  danger:
    "bg-white text-danger hover:bg-danger-bg border-danger-border",
  ghost:
    "bg-transparent text-foreground hover:bg-slate-100 border-transparent",
};

const sizeClasses: Record<Size, string> = {
  md: "px-4 py-2.5 text-base gap-2",
  lg: "px-6 py-4 text-lg gap-3",
};

const base =
  "inline-flex items-center justify-center rounded-xl border font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={clsx(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  href,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={clsx(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}
