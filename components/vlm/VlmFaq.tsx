"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

const questions = [
  "what",
  "live",
  "contract",
  "buy",
  "amu",
  "rho",
  "bajak",
  "security",
  "walletCreation",
  "custody",
  "fixedSupply",
  "taxes",
  "taxesFinal",
  "auditRequired",
] as const;

export default function VlmFaq() {
  const t = useTranslations("VlmFaq");

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
      <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
      <h2 className="mt-5 font-serif text-4xl leading-tight text-white md:text-5xl">{t("title")}</h2>
      <div className="mt-8 divide-y divide-white/10">
        {questions.map((key, index) => (
          <details key={key} className="group py-5" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-sans text-lg font-semibold leading-tight text-white">
              {t(`${key}.q`)}
              <ChevronDown className="h-5 w-5 shrink-0 text-white/42 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
              <p className="mt-4 max-w-3xl overflow-hidden text-sm leading-7 text-white/56">{t(`${key}.a`)}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
