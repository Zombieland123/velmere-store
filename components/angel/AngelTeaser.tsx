"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import AngelPanel from "@/components/angel/AngelPanel";
import { useCart } from "@/components/CartProvider";

export default function AngelTeaser() {
  const t = useTranslations("Angel");
  const [open, setOpen] = useState(false);
  const { closeCart } = useCart();

  useEffect(() => {
    const closeAngel = () => setOpen(false);
    const openAngelFromCommand = () => {
      closeCart();
      window.dispatchEvent(new Event("velmere:close-square-panels"));
      setOpen(true);
    };
    window.addEventListener("velmere:close-angel", closeAngel);
    window.addEventListener("velmere:angel:open", openAngelFromCommand);
    return () => {
      window.removeEventListener("velmere:close-angel", closeAngel);
      window.removeEventListener("velmere:angel:open", openAngelFromCommand);
    };
  }, [closeCart]);

  const openAngel = () => {
    closeCart();
    window.dispatchEvent(new Event("velmere:close-square-panels"));
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openAngel}
        aria-label={t("openLabel")}
        className="group fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-[90] flex min-h-12 items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#F5F0E8] px-3 text-black shadow-[0_20px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/20 backdrop-blur-2xl transition hover:border-[#d4af37]/55 hover:bg-white active:scale-95 md:bottom-8 md:right-8 md:bg-[#1A1A1C]/95 md:px-4 md:text-[#d4af37]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]/25 text-black md:bg-[#d4af37]/10 md:text-[#d4af37]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="hidden font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/70 md:inline">Angel</span>
      </button>
      <AngelPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
