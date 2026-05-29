"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

export default function VlmModeTransitionOverlay({ mode }: { mode: "basic" | "pro" }) {
  const t = useTranslations("VlmModeSwitch");
  const [visible, setVisible] = useState(false);
  const [displayMode, setDisplayMode] = useState(mode);
  const prevMode = useRef(mode);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mode === prevMode.current) return;
    prevMode.current = mode;
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayMode(mode);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 1180);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode]);

  const isPro = displayMode === "pro";

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key={displayMode}
          className="pointer-events-none fixed inset-0 z-[250] overflow-hidden bg-[#070708]/82 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden="true"
        >
          <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.16),transparent_22%),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:auto,52px_52px,52px_52px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c8a96a]/18"
            initial={{ scale: 0.72, opacity: 0, rotate: -16 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.18, opacity: 0, rotate: 12 }}
            transition={{ duration: 0.86, ease }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#101012]/72 shadow-[0_0_120px_rgba(212,175,55,0.12)]"
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.58, ease }}
          />
          {[0, 1, 2, 3].map((item) => (
            <motion.div
              key={item}
              className="absolute left-1/2 top-1/2 h-px w-[min(38rem,82vw)] origin-left bg-gradient-to-r from-transparent via-[#c8a96a]/55 to-transparent"
              style={{ rotate: `${item * 45}deg` }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ delay: item * 0.035, duration: 0.52, ease }}
            />
          ))}
          <motion.div
            className="absolute left-1/2 top-1/2 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#1A1A1C]/94 p-8 text-center shadow-[0_40px_140px_rgba(0,0,0,0.72)]"
            initial={{ opacity: 0, y: 30, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, scale: 0.98, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
          >
            <motion.div initial={{ width: 0 }} animate={{ width: "8rem" }} transition={{ duration: 0.64, ease }} className="mx-auto h-px bg-gradient-to-r from-transparent via-[#c8a96a]/80 to-transparent" />
            <p className={`mt-6 font-mono text-[10px] font-black uppercase tracking-[0.36em] ${isPro ? "text-[#c8a96a]" : "text-white/74"}`}>
              {isPro ? "VLM PRO // TERMINAL MODE" : "VLM BASIC // QUIET MODE"}
            </p>
            <p className="mx-auto mt-5 max-w-sm text-xs leading-6 text-white/60">
              {isPro ? t("proHint") : t("basicHint")}
            </p>
            <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-[1px] overflow-hidden rounded-xl bg-white/10 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
              {(isPro ? ["registry", "wallet", "signal"] : ["atelier", "archive", "drop"]).map((x) => <span key={x} className="bg-[#111113] px-3 py-3">{x}</span>)}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
