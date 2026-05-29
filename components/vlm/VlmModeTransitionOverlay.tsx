"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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
    timerRef.current = setTimeout(() => setVisible(false), 980);
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
          className="pointer-events-none fixed inset-0 z-[250] overflow-hidden bg-[#050506]/72 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#1D1D20] to-[#101012]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 34 }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#1A1A1C] to-[#09090A]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 34 }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#1A1A1C]/94 p-8 text-center shadow-[0_40px_140px_rgba(0,0,0,0.72)]"
            initial={{ opacity: 0, y: 26, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 230, damping: 27 }}
          >
            <motion.div initial={{ width: 0 }} animate={{ width: "7rem" }} transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }} className="mx-auto h-px bg-gradient-to-r from-transparent via-[#c8a96a]/80 to-transparent" />
            <p className={`mt-6 font-mono text-[10px] font-black uppercase tracking-[0.34em] ${isPro ? "text-[#c8a96a]" : "text-white/70"}`}>
              {isPro ? t("pro") : t("basic")}
            </p>
            <p className="mx-auto mt-5 max-w-sm text-xs leading-6 text-white/58">
              {isPro ? t("proHint") : t("basicHint")}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
