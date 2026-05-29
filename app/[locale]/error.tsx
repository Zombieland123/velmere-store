"use client";

import { useEffect, useState } from "react";

export default function LocaleErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    console.error("VELMERE_KERNEL_CRASH", error);
    const interval = window.setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-black px-6 py-24 text-white">
      <section className="w-full max-w-3xl border border-red-500/25 bg-red-950/[0.045] p-6 shadow-[0_0_120px_rgba(239,68,68,0.12)] md:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-red-300/75">VELMÈRE TERMINAL / SYSTEM BREAKDOWN</p>
        <h1 className="mt-5 font-mono text-2xl uppercase tracking-[0.22em] text-red-200 md:text-4xl">
          KERNEL PANIC
        </h1>
        <div className="mt-8 grid gap-2 border-y border-red-500/15 py-5 font-mono text-[10px] uppercase leading-6 tracking-[0.18em] text-red-100/60 md:text-xs">
          <p>[ HEX ] 0x56454C4D455245 :: RENDER TREE CORRUPTION DETECTED</p>
          <p>[ DIGEST ] {error.digest ?? "NO_DIGEST_AVAILABLE"}</p>
          <p>[ MESSAGE ] {error.message || "CLASSIFIED_RUNTIME_FAILURE"}</p>
          <p>[ RECOVERY ] AUTOMATED SEQUENCE IN T-{countdown.toString().padStart(2, "0")}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-8 min-h-12 border border-red-400/35 px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-red-100 transition-colors hover:border-red-200 hover:bg-red-200 hover:text-black active:scale-95"
        >
          [ RETRY KERNEL INITIALIZATION ]
        </button>
      </section>
    </main>
  );
}
