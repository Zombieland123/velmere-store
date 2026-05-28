"use client";

import { useTranslations } from "next-intl";
import { SECTION_NARROW } from "@/lib/vlm/layout";

const phases = ["store", "platform", "vlm"] as const;

export default function VlmProductionChecklist() {
  const t = useTranslations("VlmProductionChecklist");

  return (
    <section className={`${SECTION_NARROW} py-8 md:py-12`}>
      <div className="mb-8 max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{t("kicker")}</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-[#FFFFF0] md:text-4xl">{t("title")}</h2>
        <p className="mt-4 font-sans text-sm leading-7 text-white/56">{t("body")}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {phases.map((phase) => (
          <article key={phase} className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{t(`phases.${phase}.kicker`)}</p>
            <h3 className="mt-3 font-serif text-xl text-[#FFFFF0]">{t(`phases.${phase}.title`)}</h3>
            <ul className="mt-5 space-y-2.5">
              {(t.raw(`phases.${phase}.items`) as string[]).map((item) => (
                <li key={item} className="flex gap-2.5 font-sans text-sm leading-6 text-white/58">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#d4af37]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
