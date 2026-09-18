import React from "react";
import { IconArrowLeft } from "./icons";
import { CarGlyph } from "./logo";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
        checked ? "border-gold/50 bg-gold/5" : "border-hairline hover:border-gold/30"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? "border-gold bg-gold" : "border-mutedDark"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-background" fill="none">
            <path d="M3.5 8.2 6.5 11l6-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1 text-ivory">{label}</span>
    </label>
  );
}

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-5 flex items-center gap-1.5 text-sm text-mutedDark transition-colors hover:text-gold"
    >
      <IconArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

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
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gold-gradient text-background shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-8px_rgba(201,168,118,0.55)] hover:brightness-110 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_10px_26px_-6px_rgba(201,168,118,0.7)] active:brightness-95",
    secondary:
      "bg-transparent border border-border text-ivory hover:border-gold/60 hover:text-gold",
    danger: "bg-danger/90 text-background hover:bg-danger",
    ghost: "bg-transparent text-gold hover:text-gold-200 px-1 py-1",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      ) : (
        children
      )}
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
      {label && (
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider2 text-muted">
          {label}
        </span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-ivory placeholder:text-mutedDark focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors ${className}`}
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
      {label && (
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider2 text-muted">
          {label}
        </span>
      )}
      <textarea
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-ivory placeholder:text-mutedDark focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors ${className}`}
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
      {label && (
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider2 text-muted">
          {label}
        </span>
      )}
      <select
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-ivory focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-colors ${className}`}
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
    <div
      className={`rounded-2xl border border-hairline bg-surface p-5 transition-colors ${
        onClick ? "cursor-pointer hover:border-gold/40" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function Badge({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "muted" | "success" | "danger";
}) {
  const tones: Record<string, string> = {
    primary: "bg-gold/12 text-gold-200 border border-gold/25",
    muted: "bg-surfaceAlt text-muted border border-border",
    success: "bg-success/12 text-success border border-success/25",
    danger: "bg-danger/12 text-danger border border-danger/25",
  };
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function StarRating({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  const full = Math.round(rating);
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "text-gold" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-gold" />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <CarGlyph className="h-10 w-24 text-mutedDark/60" />
      <p className="max-w-xs text-sm text-muted">{message}</p>
    </div>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm text-danger">{children}</p>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">{children}</p>
  );
}
