"use client"

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"

type ToastVariant = "default" | "destructive"

export type ToastOptions = {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastItem = Required<Pick<ToastOptions, "title">> &
  Pick<ToastOptions, "description" | "variant" | "durationMs"> & {
    id: string
  }

type ToastContextValue = {
  toast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function randomId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timers = timersRef.current
    const timer = timers.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.delete(id)
    }
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = randomId()
      const item: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "default",
        durationMs: options.durationMs ?? 5000,
      }

      setToasts((prev) => [...prev, item].slice(-5))

      const timer = window.setTimeout(() => dismiss(id), item.durationMs)
      timersRef.current.set(id, timer)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={
            "rounded-lg border bg-background p-4 shadow-lg transition" +
            (t.variant === "destructive"
              ? " border-destructive/40 bg-destructive/10"
              : " border-border")
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onDismiss(t.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
