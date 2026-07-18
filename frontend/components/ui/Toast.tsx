"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore, Toast as ToastType } from "@/lib/stores/useToastStore";

const iconMap: Record<ToastType["type"], React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colorMap: Record<ToastType["type"], string> = {
  success: "var(--success)",
  error: "var(--destructive)",
  info: "var(--primary)",
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const Icon = iconMap[toast.type];
  const color = colorMap[toast.type];

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg animate-fade-up min-w-[260px] max-w-sm"
      style={{ background: "var(--surface-elevated)", borderColor: "var(--border-strong)" }}
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
      <p className="text-xs font-medium flex-1" style={{ color: "var(--foreground)" }}>
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-0.5 rounded hover:bg-[var(--border)] shrink-0"
      >
        <X className="h-3 w-3" style={{ color: "var(--foreground-muted)" }} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
