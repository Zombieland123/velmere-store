"use client";

import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";

const PRICE_ROWS = [
  { key: "price" },
  { key: "quote" },
  { key: "buyFee" },
  { key: "sellFee" },
  { key: "transferFee" },
] as const;

export default function VlmTradePreview() {
  const t = useTranslations("VlmTradePreview");

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#121212]/90 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-[#FFFFF0] md:text-2xl">{t("title")}</h2>
        <span className="shrink-0 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[#d4af37]">
          {t("badge")}
        </span>
      </div>

      <dl className="mt-5 divide-y divide-white/5 text-sm">
        {PRICE_ROWS.map(({ key }) => (
          <div key={key} className="flex justify-between gap-4 py-3">
            <dt className="text-white/45">{t(`rows.${key}.label`)}</dt>
            <dd className="font-mono tabular-nums text-[#FFFFF0]">{t(`rows.${key}.value`)}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        disabled
        className="mt-5 flex min-h-[44px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] text-[10px] uppercase tracking-[0.16em] text-white/42"
      >
        <LockKeyhole className="h-3.5 w-3.5 text-[#d4af37]" aria-hidden="true" />
        {t("disabledCta")}
      </button>

      <p className="mt-4 text-[11px] leading-5 text-white/40">{t("activationNote")}</p>
    </div>
  );
}
