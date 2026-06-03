import SecurityOperationsChecklistPanel from "@/components/security/SecurityOperationsChecklistPanel";
import { LockKeyhole, RadioTower, ShieldCheck, ShieldHalf, TriangleAlert } from "lucide-react";
import {
  buildSecurityTrustSnapshot,
  resolveSecurityTrustLocale,
  securityTrustCopy,
  securityTrustPillars,
  securityTrustRoadmap,
} from "@/lib/security/security-trust-copy";

export default function SecurityTrustPage({ locale }: { locale: string }) {
  const safeLocale = resolveSecurityTrustLocale(locale);
  const copy = securityTrustCopy[safeLocale];
  const snapshot = buildSecurityTrustSnapshot(safeLocale);
  const liveCount = securityTrustPillars.filter((pillar) => pillar.status === "live").length;
  const previewCount = securityTrustPillars.filter((pillar) => pillar.status === "preview").length;
  const averageProgress = Math.round(securityTrustPillars.reduce((sum, pillar) => sum + pillar.progress, 0) / securityTrustPillars.length);

  return (
    <main className="min-h-screen bg-velmere-black text-white">
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
        <div className="vst-hero">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.065] px-3 py-1.5 text-velmere-gold">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{copy.eyebrow}</span>
            </div>
            <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.055em] md:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/[0.62]">{copy.subtitle}</p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            <div className="vst-stat"><p>implemented layers</p><strong>{liveCount}</strong></div>
            <div className="vst-stat"><p>preview layers</p><strong>{previewCount}</strong></div>
            <div className="vst-stat"><p>security progress</p><strong>{averageProgress}%</strong></div>
            <div className="vst-stat"><p>boundary</p><strong>honest</strong></div>
          </div>

          <div className="mt-6 rounded-[1.35rem] border border-cyan-200/[0.12] bg-cyan-300/[0.035] p-4">
            <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/[0.62]">
              <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Production boundary
            </p>
            <p className="mt-2 text-sm leading-7 text-cyan-100/[0.72]">{copy.disclaimer}</p>
          </div>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          {securityTrustPillars.map((pillar) => (
            <article key={pillar.id} className="vst-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {pillar.status === "live" ? (
                      <ShieldCheck className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
                    ) : (
                      <ShieldHalf className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
                    )}
                    <span className={`vst-chip vst-chip-${pillar.status}`}>{pillar.status}</span>
                    <span className="vst-chip">{pillar.progress}%</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-white/[0.90]">{pillar.title[safeLocale]}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/[0.58]">{pillar.summary[safeLocale]}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-black/[0.22] p-3">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">implemented</p>
                  <p className="mt-2 text-[11px] leading-5 text-white/[0.52]">{pillar.implemented.join(" · ")}</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-black/[0.22] p-3">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">next</p>
                  <p className="mt-2 text-[11px] leading-5 text-white/[0.52]">{pillar.next.join(" · ")}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 vst-roadmap">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Security roadmap</p>
              <h2 className="mt-3 font-serif text-4xl leading-none tracking-[-0.045em] md:text-5xl">World-class direction, honest delivery.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.58]">{copy.short}</p>
            </div>
            <a href="/api/security/trust" className="vst-link">
              <RadioTower className="h-3.5 w-3.5" aria-hidden="true" />
              API snapshot
            </a>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {securityTrustRoadmap.map((item) => (
              <article key={item.id} className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.22] p-4">
                <span className="vst-chip">{item.phase}</span>
                <h3 className="mt-3 text-base font-semibold text-white/[0.88]">{item.label[safeLocale]}</h3>
                <p className="mt-2 text-xs leading-6 text-white/[0.56]">{item.description[safeLocale]}</p>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.32]">
                  blockers · {item.blockers.join(" · ")}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 rounded-[1.1rem] border border-white/[0.08] bg-black/[0.24] p-4 text-xs leading-6 text-white/[0.48]">
            {snapshot.productionBoundary}
          </p>
        </section>

        <SecurityOperationsChecklistPanel locale={safeLocale} />
      </section>
    </main>
  );
}
