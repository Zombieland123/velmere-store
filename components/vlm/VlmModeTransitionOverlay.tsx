"use client";

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

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setDisplayMode(mode);
    setVisible(true);

    timerRef.current = setTimeout(() => setVisible(false), prefersReduced ? 220 : 920);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode]);

  if (!visible) return null;

  const isPro = displayMode === "pro";

  return (
    <div className="pointer-events-none fixed inset-0 z-[250] flex items-center justify-center overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 ${isPro ? "bg-[#020202]" : "bg-[#0b0b0b]"}`}
        style={{ backdropFilter: "blur(14px)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.12),transparent_42%)]" />

      <div className="relative z-10 w-full max-w-xl px-6">
        <div
          className={`rounded-[2rem] border p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)] ${
            isPro
              ? "border-[#d4af37]/25 bg-[#050505]/88"
              : "border-white/10 bg-[#101010]/90"
          }`}
          style={{
            animation: `${isPro ? "slide-in-left" : "slide-in-right"} 820ms cubic-bezier(0.16,1,0.3,1)`,
          }}
        >
          <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.3em] ${isPro ? "text-[#d4af37]" : "text-white/68"}`}>
            {isPro ? t("pro") : t("basic")}
          </p>
          <p className={`mt-2 text-xs leading-6 ${isPro ? "text-white/58" : "text-white/52"}`}>
            {isPro ? t("proHint") : t("basicHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
