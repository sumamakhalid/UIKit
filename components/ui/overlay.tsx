"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Icon, type IconName } from "./icon";
import type { Tone } from "./display";

/* ------------------------------------------------------------------ */
/* Shared: portal, escape key, scroll lock, focus trap                 */
/* ------------------------------------------------------------------ */

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useDialogBehaviour(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // The panel mounts through a portal a frame later, so wait for it.
    let raf = 0;
    let tries = 0;
    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) {
        if (tries++ < 10) raf = requestAnimationFrame(focusFirst);
        return;
      }
      const first =
        panel.querySelector<HTMLElement>("[data-autofocus]") ??
        [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].find((el) => !el.hasAttribute("data-dialog-close"));
      (first ?? panel).focus();
    };
    raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, panelRef]);
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Prevent closing by clicking the backdrop (e.g. long forms) */
  dismissible?: boolean;
}

const modalSizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ open, onClose, title, description, children, footer, size = "md", dismissible = true }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useDialogBehaviour(open, onClose, panelRef);
  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={dismissible ? onClose : undefined} />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex max-h-[92vh] w-full animate-pop-in flex-col rounded-t-xl bg-surface shadow-lg outline-none sm:rounded-xl",
            modalSizes[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-tight text-fg">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-1 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              data-dialog-close
              className="-mt-1 -mr-1 rounded-full bg-surface-2 p-2 text-fg hover:bg-primary-soft focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          {children && <div className="overflow-y-auto px-6 pb-6">{children}</div>}
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-line px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* ------------------------------------------------------------------ */
/* ConfirmDialog                                                       */
/* ------------------------------------------------------------------ */

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={busy}
            data-autofocus
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Drawer — side panel for add/edit forms and detail views             */
/* ------------------------------------------------------------------ */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}

const drawerWidths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-xl" };

export function Drawer({ open, onClose, title, description, children, footer, width = "md" }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogBehaviour(open, onClose, panelRef);
  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-end p-0 sm:p-3">
        <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={onClose} />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cn(
            "relative flex h-full w-full animate-slide-in flex-col bg-surface shadow-lg outline-none sm:rounded-xl",
            drawerWidths[width],
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold tracking-tight text-fg">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              data-dialog-close
              className="-mr-1 rounded-full bg-surface-2 p-2 text-fg hover:bg-primary-soft focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}

/* ------------------------------------------------------------------ */
/* DropdownMenu                                                        */
/* ------------------------------------------------------------------ */

export type MenuItem =
  | { type?: "item"; label: ReactNode; icon?: IconName; onSelect: () => void; danger?: boolean; disabled?: boolean; shortcut?: string }
  | { type: "divider" }
  | { type: "label"; label: ReactNode };

export interface DropdownMenuProps {
  /** Render the trigger. Spread `props` onto your button. */
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenu({ trigger, items, align = "end", className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const els = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [])];
        const i = els.indexOf(document.activeElement as HTMLElement);
        const next = e.key === "ArrowDown" ? (i + 1) % els.length : (i - 1 + els.length) % els.length;
        els[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      {trigger({ onClick: () => setOpen((o) => !o), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "absolute top-full z-40 mt-2 min-w-[210px] animate-pop-in rounded-lg border border-line bg-surface p-1.5 shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((it, i) => {
            if (it.type === "divider") return <div key={i} className="my-1 h-px bg-line" />;
            if (it.type === "label")
              return (
                <div key={i} className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-wide text-subtle uppercase">
                  {it.label}
                </div>
              );
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  it.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium outline-none",
                  "hover:bg-surface-2 focus:bg-surface-2 disabled:pointer-events-none disabled:opacity-50",
                  it.danger ? "text-danger" : "text-fg",
                )}
              >
                {it.icon && <Icon name={it.icon} size={16} className={it.danger ? "" : "text-muted"} />}
                <span className="flex-1">{it.label}</span>
                {it.shortcut && <span className="text-xs text-subtle">{it.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

interface ToastItem {
  id: number;
  title: ReactNode;
  description?: ReactNode;
  tone: Exclude<Tone, "primary" | "neutral" | "accent">;
  action?: { label: string; onClick: () => void };
}

type ToastInput = Omit<ToastItem, "id" | "tone"> & { tone?: ToastItem["tone"]; duration?: number };

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

const toastIcon: Record<ToastItem["tone"], IconName> = {
  success: "check-circle",
  danger: "x-circle",
  warning: "alert",
  info: "info",
};
const toastColor: Record<ToastItem["tone"], string> = {
  success: "bg-accent text-accent-fg",
  danger: "bg-danger text-danger-fg",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    ({ duration = 4000, tone = "success", ...t }: ToastInput) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { id, tone, ...t }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Portal>
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-lg bg-primary p-4 text-primary-fg shadow-lg"
            >
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", toastColor[t.tone])}><Icon name={toastIcon[t.tone]} size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] opacity-75">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action!.onClick();
                      dismiss(t.id);
                    }}
                    className="mt-2 inline-flex h-7 items-center rounded-full bg-accent px-3 text-xs font-bold text-accent-fg"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-m-1 rounded-full p-1 opacity-70 hover:opacity-100"
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

/** const toast = useToast(); toast({ title: "Saved", tone: "success" }) */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
