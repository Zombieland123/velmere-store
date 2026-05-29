"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircleDot, Cpu, Eye, Network, Orbit, ShieldCheck, WalletCards } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const basicItems = ["one", "two", "three"] as const;
const proItems = ["orbit", "wallet", "security", "lp"] as const;
const amuControls = [
  { label: "AMU", value: "3162.2776", width: 78 },
  { label: "ρ", value: "1.3247", width: 58 },
  { label: "WALLET", value: "EVM", width: 66 },
  { label: "SIGNAL", value: "ACCESS", width: 72 },
] as const;

function BasicCard({ reducedMotion }: { reducedMotion: boolean }) {
  const t = useTranslations("VlmBasicPro");
  return (
    <motion.article
      key="basic"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "-105%", scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "105%", scale: 0.98 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-none overflow-hidden rounded-[2rem] border border-black/10 bg-[#F5F0E8] p-5 text-center text-black shadow-[0_24px_90px_rgba(0,0,0,0.22)] md:p-8 lg:text-left xl:p-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_16%,rgba(0,0,0,0.06),transparent_30%)]" />
      <div className="relative z-[1] grid gap-6 lg:grid-cols-[0.42fr_1.58fr] lg:items-stretch">
        <div>
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.32em] text-black/45">{t("basic.kicker")}</p>
          <h3 className="mx-auto mt-5 max-w-[8ch] font-serif text-5xl leading-[0.9] md:text-7xl lg:mx-0">{t("basic.title")}</h3>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-black/62 lg:mx-0">{t("basicHint")}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {basicItems.map((item, index) => (
            <motion.div
              key={item}
              initial={reducedMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
              className="flex min-h-36 flex-col justify-between rounded-[1.5rem] border border-black/10 bg-black/[0.035] p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#F5F0E8]">
                <CircleDot className="h-4 w-4 text-black/34" aria-hidden="true" />
              </div>
              <p className="mt-5 font-sans text-sm leading-7 text-black/68">{t(`basic.items.${item}`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function ProOrbit({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-[#d4af37]/18 bg-black/70 xl:min-h-[36rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.22),transparent_35%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:auto,44px_44px,44px_44px]" />
      {!reducedMotion ? (
        <>
          {[0, 1, 2, 3, 4].map((ring) => (
            <motion.span
              key={ring}
              className="absolute left-1/2 top-1/2 rounded-full border border-[#d4af37]/20"
              style={{ width: 160 + ring * 74, height: 160 + ring * 74, marginLeft: -(80 + ring * 37), marginTop: -(80 + ring * 37) }}
              animate={{ rotate: ring % 2 ? -360 : 360, opacity: [0.16, 0.72, 0.16] }}
              transition={{ duration: 13 + ring * 4, repeat: Infinity, ease: "linear" }}
            />
          ))}
          {Array.from({ length: 44 }).map((_, index) => (
            <motion.span
              key={index}
              className="absolute h-1.5 w-1.5 rounded-full bg-[#d4af37] shadow-[0_0_24px_rgba(212,175,55,0.78)]"
              style={{ left: `${10 + ((index * 31) % 80)}%`, top: `${12 + ((index * 47) % 74)}%` }}
              animate={{ y: [0, -18, 0], x: [0, index % 2 ? 10 : -10, 0], opacity: [0.12, 1, 0.12], scale: [0.65, 1.45, 0.65] }}
              transition={{ duration: 2.4 + (index % 6) * 0.35, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#d4af37]/30 bg-black/70 font-serif text-2xl text-white shadow-[0_0_90px_rgba(212,175,55,0.28)]">VLM</div>
      </div>
      <div className="absolute left-5 top-5 grid gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/48">
        <span className="rounded-full border border-white/10 bg-black/55 px-3 py-2">EVM route</span>
        <span className="rounded-full border border-white/10 bg-black/55 px-3 py-2">Wallet state</span>
        <span className="rounded-full border border-white/10 bg-black/55 px-3 py-2">AMU signal</span>
      </div>
    </div>
  );
}

function ProCard({ reducedMotion }: { reducedMotion: boolean }) {
  const t = useTranslations("VlmBasicPro");
  const [chartOpen, setChartOpen] = useState(false);
  return (
    <motion.article
      key="pro"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "105%", scale: 0.965 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: "-105%", scale: 0.965 }}
      transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-none overflow-hidden rounded-[2.4rem] border border-[#d4af37]/24 bg-[#030303] p-5 text-center text-white shadow-[0_40px_140px_rgba(0,0,0,0.62)] md:p-7 lg:text-left xl:p-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_36%,rgba(212,175,55,0.18),transparent_34%)]" />
      <div className="relative z-[1] grid gap-8 xl:grid-cols-[0.34fr_0.66fr] xl:items-start">
        <div>
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.34em] text-[#d4af37]">{t("pro.kicker")}</p>
          <h3 className="mx-auto mt-5 max-w-[9ch] font-serif text-4xl leading-[0.94] text-white md:text-5xl lg:mx-0 xl:text-[4.4rem]">{t("pro.title")}</h3>
          <p className="mx-auto mt-6 max-w-lg font-sans text-sm leading-7 text-white/64 lg:mx-0">{t("pro.body")}</p>
          <button type="button" onClick={() => setChartOpen((value) => !value)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#d4af37] transition hover:bg-[#d4af37]/15 active:scale-95">
            <Eye className="h-4 w-4" /> {chartOpen ? t("pro.chartHide") : t("pro.chartShow")}
          </button>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {amuControls.map((control) => (
              <div key={control.label} className="rounded-2xl border border-white/10 bg-black/48 p-3 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/44">
                  <span>{control.label}</span><span className="text-[#d4af37]">{control.value}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><motion.span className="block h-full rounded-full bg-[#d4af37]" initial={{ width: 0 }} animate={{ width: `${control.width}%` }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <ProOrbit reducedMotion={reducedMotion} />
          <AnimatePresence>
            {chartOpen ? (
              <motion.div initial={{ y: -28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -28, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="rounded-[1.5rem] border border-[#d4af37]/25 bg-black/80 p-4 backdrop-blur-2xl">
                <div className="relative h-24 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:42px_28px]">
                  <motion.span className="absolute left-0 top-1/2 h-px w-full bg-[#d4af37]/55" animate={reducedMotion ? undefined : { scaleX: [0.35, 1, 0.35] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "left" }} />
                  <motion.span className="absolute left-0 top-[64%] h-px w-full bg-white/28" animate={reducedMotion ? undefined : { scaleX: [1, 0.42, 1] }} transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "left" }} />
                  <p className="absolute left-4 top-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/44">{t("pro.chartLabel")}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <div className="relative z-[1] mt-8 grid auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {proItems.map((item, index) => {
          const Icon = item === "orbit" ? Orbit : item === "wallet" ? WalletCards : item === "security" ? ShieldCheck : Cpu;
          return <motion.div key={item} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.06, duration: 0.48, ease: [0.16, 1, 0.3, 1] }} className="flex min-h-36 flex-col justify-between rounded-[1.35rem] border border-white/10 bg-black/70 p-5 backdrop-blur-xl"><Icon className="h-5 w-5 text-[#d4af37]" /><p className="mt-4 font-sans text-xs leading-6 text-white/62">{t(`pro.items.${item}`)}</p></motion.div>;
        })}
      </div>
    </motion.article>
  );
}

export default function VlmBasicProShowcase() {
  const t = useTranslations("VlmBasicPro");
  const reducedMotion = Boolean(useReducedMotion());
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "pro" ? "pro" : "basic";

  return (
    <section id="vlm-mode" className="mx-auto w-full max-w-none overflow-hidden px-4 py-14 sm:px-6 lg:px-12 2xl:px-20 md:py-20">
      <div className="mx-auto mb-8 w-full max-w-none text-center lg:text-left">
        <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
        <h2 className="mx-auto mt-4 max-w-4xl font-serif text-4xl leading-tight text-white md:text-5xl lg:mx-0">{t("title")}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/54 lg:mx-0">{t("body")}</p>
      </div>
      <AnimatePresence mode="wait" initial={false}>{mode === "pro" ? <ProCard key="pro-card" reducedMotion={reducedMotion} /> : <BasicCard key="basic-card" reducedMotion={reducedMotion} />}</AnimatePresence>
    </section>
  );
}
