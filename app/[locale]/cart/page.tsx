"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import LuxurySection from "@/components/layout/LuxurySection";
import CommerceLaunchControl from "@/components/launch/CommerceLaunchControl";
import PaymentOrderReadinessPanel from "@/components/launch/PaymentOrderReadinessPanel";
import OrderEventLedgerPanel from "@/components/launch/OrderEventLedgerPanel";
import { useCart } from "@/components/CartProvider";

export default function CartPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("Cart");
  const { openCart } = useCart();

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-2xl rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 text-center md:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035]">
            <ShoppingBag className="h-7 w-7 text-white/[0.42]" aria-hidden="true" />
          </div>
          <p className="luxury-kicker mt-6 text-velmere-gold/[0.80]">{t("kicker")}</p>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{t("title")}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/[0.56]">{t("checkoutUnavailable")}</p>
          <button
            type="button"
            onClick={openCart}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-velmere-gold"
          >
            {t("openCart")}
          </button>
        </section>
      </LuxurySection>
      <CommerceLaunchControl locale={locale} surface="cart" />
      <PaymentOrderReadinessPanel locale={locale} surface="cart" />
      <OrderEventLedgerPanel locale={locale} surface="cart" />
    </main>
  );
}
