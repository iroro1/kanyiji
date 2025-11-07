"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Toast = {
  id: number;
  title: string;
  variant?: "success" | "error" | "info";
};

const ToastContext = createContext<{
  notify: (title: string, variant?: Toast["variant"]) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (title: string, variant: Toast["variant"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, variant }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000
    );
  };

  const value = useMemo(() => ({ notify }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow text-sm font-medium text-text-inverse ${
              t.variant === "success"
                ? "bg-green-600 text-white"
                : t.variant === "error"
                ? "bg-red-600"
                : "bg-gray-800 text-white"
            }`}
          >
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
