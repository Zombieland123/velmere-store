"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { luxuryEase } from "@/lib/motion";

export type SideActionPanelProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const widthBySize = {
  sm: "md:max-w-[520px]",
  md: "md:max-w-[560px]",
  lg: "md:max-w-[640px]",
} as const;

export default function SideActionPanel({
  open,
  onClose,
  title,
  kicker,
  children,
  size = "md",
}: SideActionPanelProps) {
  const common = useTranslations("SideActionPanel");
  const { closeCart } = useCart();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    closeCart();
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !focusable?.length) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onTab);

    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onTab);
    };
  }, [closeCart, onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={common("close")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: luxuryEase }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/[0.70] backdrop-blur-xl"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%", y: "100%" }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: "100%", y: "100%" }}
            transition={{ duration: 0.5, ease: luxuryEase }}
            className={`fixed inset-x-0 bottom-0 z-[110] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[2rem] border border-white/[0.10] bg-black/[0.90] text-white shadow-[-24px_0_120px_rgba(0,0,0,0.55)] backdrop-blur-xl md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-full md:rounded-none md:rounded-l-[2rem] ${widthBySize[size]}`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] px-6 py-6 md:px-10 md:py-8">
              <div className="min-w-0 pr-4">
                {kicker ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{kicker}</p>
                ) : null}
                <h2 id={titleId} className="mt-2 font-serif text-2xl leading-tight text-[#FFFFF0] md:text-3xl">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-white/[0.70] transition-colors hover:border-white/[0.20] hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{common("close")}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8 md:px-10 md:py-10">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
