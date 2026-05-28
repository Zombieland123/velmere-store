"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "0123456789ABCDEF#%$@+-/<>[]{}";

type ScrambleTextProps = {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  duration?: number;
  once?: boolean;
};

function scrambleText(target: string, revealCount: number) {
  let visible = 0;
  return Array.from(target)
    .map((char) => {
      if (char === "\n" || char === " " || char === "\t") return char;
      visible += 1;
      if (visible <= revealCount) return char;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join("");
}

function countVisibleChars(text: string) {
  return Array.from(text).filter((char) => !/\s/.test(char)).length;
}

export default function ScrambleText({
  text,
  as = "span",
  className,
  duration = 800,
  once = true,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once, margin: "-12% 0px -12% 0px" });
  const reducedMotion = useReducedMotion();
  const totalChars = useMemo(() => countVisibleChars(text), [text]);
  const [displayText, setDisplayText] = useState(text);
  const [played, setPlayed] = useState(false);
  const Component = as as any;

  useEffect(() => {
    if (!isInView || reducedMotion || (played && once)) {
      if (reducedMotion) setDisplayText(text);
      return;
    }

    setPlayed(true);
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const revealCount = Math.floor(totalChars * eased);
      setDisplayText(progress >= 1 ? text : scrambleText(text, revealCount));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    setDisplayText(scrambleText(text, 0));
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, isInView, once, played, reducedMotion, text, totalChars]);

  return (
    <Component ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </Component>
  );
}
