"use client";

import LiveClock from "@/components/ui/LiveClock";
import { useMounted } from "@/lib/hooks/useMounted";

export default function GlobalTerminalTicker() {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] hidden rounded-full border border-white/10 bg-[#141416]/88 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-white/45 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:block">
      <LiveClock className="inline-flex items-center text-[#c8a96a]/80" />
    </div>
  );
}
