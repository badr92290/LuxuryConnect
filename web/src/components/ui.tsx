import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading,
  disabled,
  className = "",
  full,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  full?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-background hover:bg-primary-dark",
    secondary: "bg-transparent border border-border text-white hover:bg-surfaceAlt",
    danger: "bg-danger text-white hover:opacity-90",
    ghost: "bg-transparent text-primary hover:underline px-1 py-1",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      {loading ? "..." : children}
    </button>
  );
}

export function Input({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block mb-4">
      {label && <span className="block mb-1.5 text-sm text-muted">{label}</span>}
      <input
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block mb-4">
      {label && <span className="block mb-1.5 text-sm text-muted">{label}</span>}
      <textarea
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      />
    </label>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block mb-4">
      {label && <span className="block mb-1.5 text-sm text-muted">{label}</span>}
      <select
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      >
        {children}
      </select>
    </label>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-4 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function Badge({ label, tone = "primary" }: { label: string; tone?: "primary" | "muted" | "success" | "danger" }) {
  const tones: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    muted: "bg-surfaceAlt text-muted",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</span>
  );
}

export function StarRating({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  const full = Math.round(rating);
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "text-accent" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-12 text-center text-muted">{message}</p>;
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm text-danger">{children}</p>;
}
