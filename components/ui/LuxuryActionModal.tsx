"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { luxuryEase } from "@/lib/motion";

export type LuxuryActionModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
};

const widthBySize = {
  sm: "md:max-w-[520px]",
  md: "md:max-w-[720px]",
  lg: "md:max-w-[920px]",
  xl: "md:max-w-[1100px]",
} as const;

export default function LuxuryActionModal({
  open,
  onClose,
  title,
  kicker,
  size = "md",
  children,
}: LuxuryActionModalProps) {
  const common = useTranslations("LuxuryActionModal");
  const { closeCart } = useCart();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      closeCart();
    }
  }, [closeCart, open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const focusable = () =>
      panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onTab);

    window.setTimeout(() => focusable()?.[0]?.focus(), 50);

    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onTab);
      triggerRef.current?.focus();
    };
  }, [onClose, open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center md:items-center md:p-6">
          <motion.button
            type="button"
            aria-label={common("close")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: luxuryEase }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
            className={`relative z-[1] flex w-full flex-col overflow-hidden border border-white/10 bg-[#080808]/95 shadow-[0_40px_120px_rgba(0,0,0,0.65)] md:max-h-[calc(100dvh-7rem)] md:rounded-[2rem] ${widthBySize[size]} max-h-[88dvh] rounded-t-[2rem]`}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8 md:py-6">
              <div className="min-w-0 pr-2">
                {kicker ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{kicker}</p>
                ) : null}
                <h2 id={titleId} className="mt-1 font-serif text-2xl leading-tight text-[#FFFFF0] md:text-3xl">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{common("close")}</span>
              </button>
            </div>
            <div className="luxury-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8 md:py-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
