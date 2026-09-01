"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "@phosphor-icons/react";

export type ToastItem = {
  id: string;
  title: string;
  body: string;
};

let _addToast: ((t: ToastItem) => void) | null = null;

export function showStudentToast(title: string, body: string) {
  if (_addToast) {
    _addToast({ id: `${Date.now()}-${Math.random()}`, title, body });
  }
}

const DURATION_MS = 5000;

export function StudentNotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _addToast = (t) => setToasts((prev) => [t, ...prev].slice(0, 5));
    return () => {
      _addToast = null;
    };
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} duration={DURATION_MS} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
  duration,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  duration: number;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss, duration]);

  return (
    <div
      className="flex w-72 items-start gap-3 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl"
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
        <Bell size={14} weight="fill" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground line-clamp-1">
          {toast.title}
        </p>
        {toast.body ? (
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">{toast.body}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="shrink-0 text-zinc-500 hover:text-foreground"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
