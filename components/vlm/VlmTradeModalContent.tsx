"use client";

import { useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";

const PRICE = 0.0004;
const BUY_FEE = 0.015;
const SELL_FEE = 0.015;

export default function VlmTradeModalContent() {
  const t = useTranslations("VlmTradeModal");
  const [amount, setAmount] = useState("100");

  const numeric = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", "."));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [amount]);

  const beforeFee = numeric > 0 ? numeric / PRICE : 0;
  const afterBuyFee = numeric > 0 ? (numeric * 0.985) / PRICE : 0;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-white/58">{t("body")}</p>

      <label className="block rounded-2xl border border-white/10 bg-[#121212]/90 p-4">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("payLabel")}</span>
        <div className="mt-2 flex items-center gap-3">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            className="min-h-11 flex-1 bg-transparent font-mono text-lg tabular-nums text-[#FFFFF0] outline-none"
          />
          <span className="text-[10px] uppercase text-white/42">EUR</span>
        </div>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-[10px] uppercase text-white/40">{t("beforeFeeLabel")}</p>
          <p className="mt-2 font-mono tabular-nums text-[#FFFFF0]">
            {beforeFee > 0 ? beforeFee.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"} VLM
          </p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/[0.06] p-4">
          <p className="text-[10px] uppercase text-[#d4af37]">{t("afterFeeLabel")}</p>
          <p className="mt-2 font-mono tabular-nums text-[#FFFFF0]">
            {afterBuyFee > 0 ? afterBuyFee.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"} VLM
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-xl border border-white/5 p-3 text-xs text-white/52">{t("buyFeeExample")}</p>
        <p className="rounded-xl border border-white/5 p-3 text-xs text-white/52">{t("sellFeeExample")}</p>
      </div>

      <p className="text-xs text-white/48">{t("lpNote")}</p>
      <p className="text-xs text-white/48">{t("impactNote")}</p>

      <button
        type="button"
        disabled
        className="flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.16em] text-white/42"
      >
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
        {t("disabledCta")}
      </button>
    </div>
  );
}
