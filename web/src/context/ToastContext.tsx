import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { IconAlert, IconCheck, IconX } from "../components/icons";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans un ToastProvider");
  return ctx;
}

const STYLES: Record<ToastVariant, string> = {
  success: "border-success/30 text-success",
  error: "border-danger/30 text-danger",
  info: "border-gold/30 text-gold-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-8 md:right-8 md:left-auto md:items-end md:px-0">
        {toasts.map((t) => {
          const Icon = t.variant === "error" ? IconAlert : IconCheck;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-surface/90 px-4 py-3 shadow-glass backdrop-blur-xl animate-toast-in ${
                STYLES[t.variant]
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <p className="flex-1 text-sm text-ivory">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-mutedDark transition-colors hover:text-ivory"
                aria-label="Fermer"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
