"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, LockKeyhole, Search, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

const checks = [
  "openzeppelin",
  "fixedSupply",
  "mintDisabled",
  "buyTaxCap",
  "sellTaxCap",
  "noBlacklist",
  "noHoneypot",
  "multisig",
  "testnet",
  "staticAnalysis",
  "audit",
] as const;

const evmAddress = /^0x[a-fA-F0-9]{40}$/;

export default function SecurityReadinessConsole() {
  const t = useTranslations("SecurityReadinessConsole");
  const reducedMotion = useReducedMotion();
  const [address, setAddress] = useState("");

  const addressState = useMemo(() => {
    if (!address.trim()) return "empty";
    return evmAddress.test(address.trim()) ? "valid" : "invalid";
  }, [address]);

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/28 p-5 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 w-px bg-velmere-gold/35"
            animate={reducedMotion ? undefined : { opacity: [0.15, 0.85, 0.15], scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
            <h3 className="mt-4 font-serif text-3xl leading-tight text-white md:text-4xl">{t("title")}</h3>
            <label className="mt-6 block font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
              {t("inputLabel")}
            </label>
            <div className="mt-3 flex gap-2 rounded-full border border-white/10 bg-black/35 p-2">
              <Search className="ml-2 mt-2 h-4 w-4 shrink-0 text-white/36" aria-hidden="true" />
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={t("placeholder")}
                spellCheck={false}
                className="min-h-10 w-full bg-transparent font-mono text-sm text-white outline-none placeholder:text-white/28"
              />
            </div>
            <p
              className={`mt-3 font-sans text-xs leading-6 ${
                addressState === "valid" ? "text-velmere-gold" : addressState === "invalid" ? "text-red-200/80" : "text-white/44"
              }`}
            >
              {t(`addressStates.${addressState}`)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-velmere-gold/20 bg-velmere-gold/[0.055] p-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-velmere-gold">
                {t("resultLabel")}
              </p>
              <p className="mt-3 font-sans text-2xl font-semibold text-white">{t("result")}</p>
              <p className="mt-3 font-sans text-xs leading-6 text-white/58">{t("disclaimer")}</p>
            </div>
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-velmere-gold/35 text-velmere-gold">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {checks.map((check) => {
              const required = check === "multisig" || check === "testnet" || check === "audit";
              return (
                <div key={check} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/24 p-3">
                  {required ? (
                    <TriangleAlert className="h-4 w-4 shrink-0 text-velmere-gold" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white/46" aria-hidden="true" />
                  )}
                  <span className="font-sans text-xs leading-5 text-white/58">{t(`checks.${check}`)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
