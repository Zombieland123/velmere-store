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

export default async function CheckoutSuccessPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Checkout" });

  return (
    <main className="min-h-screen bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center md:p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-velmere-gold" aria-hidden="true" />
          <p className="luxury-kicker mt-6 text-velmere-gold/80">{t("successKicker")}</p>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{t("successTitle")}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/56">{t("successBody")}</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-velmere-gold"
          >
            {t("backToShop")}
          </Link>
        </section>
      </LuxurySection>
    </main>
  );
}
