"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import VlmModeTransitionOverlay from "@/components/vlm/VlmModeTransitionOverlay";
import { useUiSounds } from "@/lib/audio/useUiSounds";
import { useModeStore, type InterfaceMode } from "@/store/useModeStore";

/** VLM Basic/Pro controller. Floating variant lives above Angel only on the VLM page. */
export default function VlmModeSwitch({
  inline = false,
}: {
  inline?: boolean;
}) {
  const t = useTranslations("VlmModeSwitch");
  const { mode, setMode } = useModeStore();
  const { playClick, playSystemOn } = useUiSounds();
  const [chartOpen, setChartOpen] = useState(false);

  const chooseMode = (nextMode: InterfaceMode) => {
    setMode(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vlm-mode-choice-seen", "1");
      window.setTimeout(
        () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }),
        0,
      );
    }
    nextMode === "pro" ? playSystemOn() : playClick();
  };

  const control = (
    <div
      role="tablist"
      aria-label={t("aria")}
      className={`inline-flex rounded-full border border-white/[0.10] bg-[#121214]/[0.92] p-1 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur-2xl ${inline ? "origin-left scale-100" : ""}`}
    >
      {[
        { key: "basic" as const, href: "/vlm-token", label: t("basic") },
        { key: "pro" as const, href: "/vlm-token?mode=pro", label: t("pro") },
      ].map((item) => {
        const active = mode === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate)
                navigator.vibrate(50);
              chooseMode(item.key);
            }}
            className={`min-h-10 ${inline ? "min-w-[5.35rem] px-4" : "min-w-[5.7rem] px-4 md:min-w-[7rem] md:px-5"} rounded-full text-center font-sans text-[9px] font-black uppercase tracking-[0.2em] transition-colors active:scale-95 ${
              active
                ? item.key === "pro"
                  ? "bg-[linear-gradient(135deg,#d4af37,#3a2f16_58%,#101010)] text-[#FFFFF0] shadow-[0_0_34px_rgba(212,175,55,0.2)]"
                  : "bg-[#FFFFF0] text-black"
                : "text-white/[0.48] hover:text-white"
            }`}
          >
            <span className="inline-flex min-h-10 items-center justify-center">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );

  if (inline) return control;

  return (
    <>
      <VlmModeTransitionOverlay mode={mode} />
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+10.8rem)] right-4 z-[91] md:bottom-[11.1rem] md:right-8">
        <button
          type="button"
          onClick={() => setChartOpen(true)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-velmere-gold/[0.30] bg-[#111113]/[0.94] px-4 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-velmere-gold shadow-[0_18px_60px_rgba(0,0,0,0.52)] backdrop-blur-2xl transition hover:border-velmere-gold/[0.55] hover:bg-velmere-gold/[0.10] active:scale-95"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">{t("chartButton")}</span>
        </button>
      </div>
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] right-4 z-[91] md:bottom-[6.6rem] md:right-8">
        {control}
      </div>

      <AnimatePresence>
        {chartOpen ? (
          <motion.div
            className="fixed inset-0 z-[340] grid place-items-center bg-black/[0.76] p-4 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChartOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.article
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#111113] text-white shadow-[0_42px_160px_rgba(0,0,0,0.82)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.10] p-5 md:p-7">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-velmere-gold">{t("chartKicker")}</p>
                  <h3 className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em] md:text-5xl">{t("chartTitle")}</h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-white/[0.58]">{t("chartBody")}</p>
                </div>
                <button type="button" onClick={() => setChartOpen(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/[0.10] text-white/[0.50] transition hover:text-white" aria-label={t("chartClose")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-[1.35fr_0.65fr] md:p-7">
                <div className="relative min-h-[18rem] overflow-hidden rounded-[1.6rem] border border-velmere-gold/[0.20] bg-black/[0.70]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:42px_42px]" />
                  <svg viewBox="0 0 800 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <path d="M46 250 C138 220 176 150 246 168 C326 188 354 78 442 104 C534 132 570 54 754 72" fill="none" stroke="rgba(212,175,55,0.72)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 12" />
                    <path d="M46 250 C138 220 176 150 246 168 C326 188 354 78 442 104 C534 132 570 54 754 72" fill="none" stroke="rgba(245,240,232,0.16)" strokeWidth="12" strokeLinecap="round" />
                  </svg>
                  <div className="absolute left-5 top-5 rounded-full border border-white/[0.10] bg-black/[0.55] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.45]">VLM / analytics placeholder</div>
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/[0.10] bg-black/[0.68] p-4 text-sm leading-7 text-white/[0.56] backdrop-blur-xl">
                    {t("chartEmpty")}
                  </div>
                </div>
                <div className="grid gap-3">
                  {["Market cap", "Volume 24h", "Holders", "Liquidity", "Contract"].map((label) => (
                    <div key={label} className="rounded-2xl border border-white/[0.10] bg-white/[0.035] p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.35]">{label}</p>
                      <p className="mt-2 font-mono text-sm text-velmere-gold">Pending</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
