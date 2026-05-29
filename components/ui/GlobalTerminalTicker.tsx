"use client";

import LiveClock from "@/components/ui/LiveClock";
import { useMounted } from "@/lib/hooks/useMounted";

const ticker = "[ VELMÈRE KERNEL ACTIVE ]   ///   [ AMU CONSTANT: 3162.27 ]   ///   [ ETH NETWORK: OBSERVATION MODE ]   ///   [ SECURITY: WEBHOOK SIGNED ]   ///   [ CHECKOUT: STRIPE SESSION READY ]   ///   [ ANGEL: GEMINI CATALOG LINK ONLINE ]";

export default function GlobalTerminalTicker() {
  const mounted = useMounted();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex h-6 items-center overflow-hidden border-t border-white/10 bg-black text-[10px] font-mono uppercase tracking-widest text-white/50">
      <div className="pointer-events-none flex min-w-0 flex-1 overflow-hidden" aria-hidden={!mounted}>
        {mounted ? (
          <>
            <div className="velmere-terminal-marquee pointer-events-none flex shrink-0 whitespace-nowrap pr-10">
              <span>{ticker}</span>
              <span className="pl-10">{ticker}</span>
            </div>
            <div className="velmere-terminal-marquee pointer-events-none flex shrink-0 whitespace-nowrap pr-10" aria-hidden="true">
              <span>{ticker}</span>
              <span className="pl-10">{ticker}</span>
            </div>
          </>
        ) : (
          <div className="pointer-events-none flex h-full w-full items-center px-4 text-white/25">[ VELMÈRE KERNEL INITIALIZING ]</div>
        )}
      </div>
      <LiveClock className="hidden h-full shrink-0 items-center border-l border-white/10 bg-black px-4 text-[9px] text-velmere-gold/70 md:inline-flex" />
    </div>
  );
}
