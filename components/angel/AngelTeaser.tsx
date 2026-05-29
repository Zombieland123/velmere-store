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
        className="group fixed left-0 top-1/2 z-[90] hidden -translate-y-1/2 md:flex"
      >
        <span className="flex min-h-[120px] w-11 flex-col items-center justify-center gap-2 rounded-r-2xl border border-l-0 border-[#d4af37]/20 bg-[#FFFFF0]/92 text-black shadow-[8px_0_32px_rgba(0,0,0,0.25)] transition-all group-hover:w-12 group-hover:bg-[#FFFFF0]">
          <Sparkles className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] [writing-mode:vertical-rl]">
            {t("tabLabel")}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={openAngel}
        aria-label={t("openLabel")}
        className="fixed right-4 z-[90] flex min-h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/25 bg-[#FFFFF0]/95 text-black shadow-md md:hidden safe-bottom-6"
      >
        <Sparkles className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
      </button>

      <AngelPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
