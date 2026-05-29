"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 520, damping: 38, mass: 0.22 });
  const y = useSpring(rawY, { stiffness: 520, damping: 38, mass: 0.22 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return undefined;

    let magnetic: HTMLElement | null = null;

    const resetMagnetic = () => {
      if (magnetic) magnetic.style.transform = "";
      magnetic = null;
      setActive(false);
    };

    const onMove = (event: PointerEvent) => {
      rawX.set(event.clientX - 8);
      rawY.set(event.clientY - 8);

      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (target !== magnetic) resetMagnetic();
      if (!target) return;

      magnetic = target;
      setActive(true);
      const rect = target.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      target.style.transform = `translate3d(${dx * 0.08}px, ${dy * 0.08}px, 0)`;
    };

    const onLeave = () => {
      rawX.set(-100);
      rawY.set(-100);
      resetMagnetic();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", resetMagnetic, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", resetMagnetic);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      resetMagnetic();
    };
  }, [rawX, rawY]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[600] hidden h-4 w-4 rounded-full border border-white bg-white mix-blend-difference md:block"
      style={{ x, y }}
      animate={{ scale: active ? 3.1 : 1, opacity: active ? 0.78 : 0.62 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    />
  );
}
