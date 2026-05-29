import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  params: { locale: string };
  searchParams?: { session_id?: string };
};

export default async function CheckoutSuccessPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: "Checkout" });
  const sessionId = searchParams?.session_id ?? "pending-sync";

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-3xl rounded-none border border-white/10 bg-white/[0.025] p-0 text-center shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/10 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/38 sm:flex sm:items-center sm:justify-between">
            <span>VELMÈRE CHECKOUT RECEIPT</span>
            <span className="tabular-nums">STATUS: CAPTURED</span>
          </div>
          <div className="p-7 md:p-10">
            <CheckCircle2 className="mx-auto h-12 w-12 text-velmere-gold" aria-hidden="true" />
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-velmere-gold/80">{t("successKicker")}</p>
            <h1 className="mt-4 font-serif text-4xl tracking-[0.08em] text-white md:text-5xl">{t("successTitle")}</h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/56">{t("successBody")}</p>

            <dl className="mx-auto mt-8 grid max-w-xl divide-y divide-white/5 border-y border-white/5 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              <div className="grid gap-2 py-3 sm:grid-cols-[0.4fr_1fr]">
                <dt>Session</dt>
                <dd className="break-all text-white/72 tabular-nums">{sessionId}</dd>
              </div>
              <div className="grid gap-2 py-3 sm:grid-cols-[0.4fr_1fr]">
                <dt>Fulfilment</dt>
                <dd className="text-white/72">Webhook queued / order draft sync</dd>
              </div>
              <div className="grid gap-2 py-3 sm:grid-cols-[0.4fr_1fr]">
                <dt>Ledger</dt>
                <dd className="text-emerald-300/70">[ ALLOCATED ]</dd>
              </div>
            </dl>

            <Link
              href="/shop"
              data-magnetic
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-none bg-white px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-velmere-gold active:scale-95"
            >
              {t("backToShop")}
            </Link>
          </div>
        </section>
      </LuxurySection>
    </main>
  );
}
