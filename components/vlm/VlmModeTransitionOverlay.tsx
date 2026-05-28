"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setDisplayMode(mode);
    setVisible(true);

    timerRef.current = setTimeout(() => setVisible(false), prefersReduced ? 180 : 1180);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode]);

  const isPro = displayMode === "pro";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed left-1/2 top-28 z-[90] hidden w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 md:block"
          initial={{ opacity: 0, y: -18, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
          transition={{ duration: 0.55, ease }}
          aria-hidden="true"
        >
          <div className={`overflow-hidden rounded-full border px-5 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl ${isPro ? "border-[#d4af37]/30 bg-black/72" : "border-white/12 bg-[#F5F0E8]/92"}`}>
            <div className="flex items-center justify-between gap-4">
              <p className={`font-mono text-[10px] font-black uppercase tracking-[0.28em] ${isPro ? "text-[#d4af37]" : "text-black/62"}`}>
                {isPro ? t("pro") : t("basic")}
              </p>
              <motion.span
                className={`h-px flex-1 ${isPro ? "bg-[#d4af37]/45" : "bg-black/20"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.95, ease }}
                style={{ transformOrigin: "left" }}
              />
              <p className={`max-w-[19rem] truncate text-[10px] uppercase tracking-[0.18em] ${isPro ? "text-white/45" : "text-black/45"}`}>
                {isPro ? t("proHint") : t("basicHint")}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
