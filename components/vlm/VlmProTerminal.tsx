"use client";

import { useTranslations } from "next-intl";
import AmuCoreVisualizer from "@/components/vlm/AmuCoreVisualizer";
import AccessFormulaVisual from "@/components/vlm/AccessFormulaVisual";
import PrimeFieldSimulation from "@/components/vlm/PrimeFieldSimulation";
import SecurityReadinessConsole from "@/components/vlm/SecurityReadinessConsole";
import VlmContractRegistryPanel from "@/components/vlm/VlmContractRegistryPanel";
import VlmLiquidityRoute from "@/components/vlm/VlmLiquidityRoute";
import VlmProductionChecklist from "@/components/vlm/VlmProductionChecklist";
import WalletGenesisSimulation from "@/components/vlm/WalletGenesisSimulation";
import { VLM_SCIENTIFIC_CONSTANTS } from "@/lib/vlm/scientific-constants";
import { SECTION_NARROW } from "@/lib/vlm/layout";

const blocks = ["tokenMath", "registry", "security", "amuLab", "walletLogic", "production"] as const;

export default function VlmProTerminal() {
  const t = useTranslations("VlmProTerminal");
  const { amu, rho } = VLM_SCIENTIFIC_CONSTANTS;

  return (
    <section className={`${SECTION_NARROW} scroll-mt-28 py-10 md:py-14`}>
      <div className="mb-8 px-2 md:px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{t("kicker")}</p>
        <h2 className="mt-3 font-serif text-3xl text-[#FFFFF0] md:text-4xl">{t("title")}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/56">{t("body")}</p>
      </div>

      <div className="space-y-6 px-2 md:px-4">
        {blocks.map((block) => (
          <article key={block} className="rounded-[2rem] border border-white/10 bg-[#121212]/90 p-6 md:p-8">
            <h3 className="font-serif text-xl text-[#FFFFF0] md:text-2xl">{t(`${block}.title`)}</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">{t(`${block}.body`)}</p>

            {block === "tokenMath" && (
              <dl className="mt-5 divide-y divide-white/5 font-mono text-sm tabular-nums">
                {(["supply", "price", "quote", "buyFee", "sellFee", "lp"] as const).map((row) => (
                  <div key={row} className="grid gap-1 py-3 sm:grid-cols-2">
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/40">{t(`tokenMath.rows.${row}.label`)}</dt>
                    <dd className="text-[#FFFFF0]/85">{t(`tokenMath.rows.${row}.value`)}</dd>
                  </div>
                ))}
              </dl>
            )}

            {block === "registry" && (
              <div className="mt-5">
                <VlmContractRegistryPanel />
              </div>
            )}

            {block === "security" && (
              <div className="mt-5 [&>section]:mt-0">
                <SecurityReadinessConsole />
              </div>
            )}

            {block === "amuLab" && (
              <div className="mt-5 space-y-4">
                <p className="font-mono text-sm text-[#d4af37]">
                  AMU = {amu} · ρ = {rho} · Hₙ = AMU × ρⁿ
                </p>
                <AmuCoreVisualizer selectedN={4} active />
                <PrimeFieldSimulation active />
              </div>
            )}

            {block === "walletLogic" && (
              <div className="mt-5 space-y-5">
                <AccessFormulaVisual compact active />
                <WalletGenesisSimulation compact active />
              </div>
            )}

            {block === "production" && (
              <div className="mt-5 space-y-5">
                <VlmLiquidityRoute />
                <VlmProductionChecklist />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
