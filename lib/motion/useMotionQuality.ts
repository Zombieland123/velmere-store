"use client";

import { useEffect, useState } from "react";

export type MotionQuality = "high" | "medium" | "low";

function detectMotionQuality(reducedMotion: boolean): MotionQuality {
  if (reducedMotion) return "low";
  if (typeof window === "undefined") return "medium";

  const width = window.innerWidth;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const dpr = window.devicePixelRatio || 1;
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 4 : 4;

  if (width < 720 || coarsePointer || cores <= 4 || dpr > 2.5) return "low";
  if (width < 1180 || cores <= 6 || dpr > 2) return "medium";
  return "high";
}

export function useMotionQuality(reducedMotion = false) {
  const [quality, setQuality] = useState<MotionQuality>("medium");

  useEffect(() => {
    const update = () => setQuality(detectMotionQuality(reducedMotion));
    update();

    const pointerQuery = window.matchMedia?.("(pointer: coarse)");
    const reducedQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", update, { passive: true });
    pointerQuery?.addEventListener?.("change", update);
    reducedQuery?.addEventListener?.("change", update);

    return () => {
      window.removeEventListener("resize", update);
      pointerQuery?.removeEventListener?.("change", update);
      reducedQuery?.removeEventListener?.("change", update);
    };
  }, [reducedMotion]);

  return quality;
}

export function getCanvasDpr(quality: MotionQuality) {
  if (typeof window === "undefined") return 1;
  const native = window.devicePixelRatio || 1;
  const cap = quality === "high" ? 1.75 : quality === "medium" ? 1.35 : 1;
  return Math.max(1, Math.min(native, cap));
}

export function getMotionFrameInterval(quality: MotionQuality) {
  if (quality === "high") return 1000 / 60;
  if (quality === "medium") return 1000 / 45;
  return 1000 / 30;
}

export function getParticleBudget(quality: MotionQuality, mode: "basic" | "pro" | "advanced" = "basic") {
  if (quality === "low") return mode === "basic" ? 0 : 4;
  if (quality === "medium") return mode === "basic" ? 6 : 12;
  return mode === "basic" ? 10 : 22;
}
