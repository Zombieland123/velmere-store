"use client";

import type React from "react";
import { useEffect, useId } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";

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

  useEffect(() => {
    if (open) closeCart();
  }, [closeCart, open]);

  return (
    <Drawer.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-2xl duration-500" />
        <Drawer.Content
          aria-labelledby={titleId}
          className={`fixed bottom-0 left-1/2 z-[301] flex max-h-[88dvh] w-full -translate-x-1/2 flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#080808]/95 shadow-[0_40px_120px_rgba(0,0,0,0.65)] outline-none md:bottom-auto md:top-1/2 md:max-h-[calc(100dvh-7rem)] md:-translate-y-1/2 md:rounded-[2rem] ${widthBySize[size]}`}
        >
          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-white/20 md:hidden" aria-hidden="true" />
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8 md:py-6">
            <div className="min-w-0 pr-2">
              {kicker ? <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{kicker}</p> : null}
              <Drawer.Title id={titleId} className="mt-1 font-serif text-2xl leading-tight tracking-[0.08em] text-[#FFFFF0] md:text-3xl">
                {title}
              </Drawer.Title>
            </div>
            <Drawer.Close asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-none border border-white/10 bg-white/[0.04] text-white/70 hover:text-white active:scale-95"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{common("close")}</span>
              </button>
            </Drawer.Close>
          </div>
          <div className="luxury-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8 md:py-8">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
