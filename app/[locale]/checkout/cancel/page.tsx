import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutCancelPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Checkout" });

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-3xl rounded-none border border-white/[0.10] bg-white/[0.025] p-0 text-center shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/[0.10] px-6 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/[0.38] sm:flex sm:items-center sm:justify-between">
            <span>VELMÈRE ORDER RECEIPT</span>
            <span className="tabular-nums">STATUS: CANCELLED</span>
          </div>
          <div className="p-7 md:p-10">
            <XCircle className="mx-auto h-12 w-12 text-white/[0.42]" aria-hidden="true" />
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-velmere-gold/[0.80]">{t("cancelKicker")}</p>
            <h1 className="mt-4 font-serif text-4xl tracking-[0.08em] text-white md:text-5xl">{t("cancelTitle")}</h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/[0.56]">{t("cancelBody")}</p>

            <div className="mx-auto mt-8 max-w-xl border-y border-white/[0.05] py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.42]">
              <p>Order was cancelled. No payment was captured.</p>
            </div>

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
