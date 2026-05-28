"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import LuxurySection from "@/components/layout/LuxurySection";
import { useCart } from "@/components/CartProvider";
import LuxuryEmptyState from "@/components/ui/LuxuryEmptyState";

export default function CartPage() {
  const t = useTranslations("Cart");
  const { openCart } = useCart();

  return (
    <main className="min-h-screen bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-2xl text-center">
          <LuxuryEmptyState
            title={t("emptyLuxury.title")}
            body={t("emptyLuxury.body")}
            icon={<ShoppingBag className="h-7 w-7" aria-hidden="true" />}
          />
          <p className="luxury-kicker mt-8 text-velmere-gold/80">{t("kicker")}</p>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{t("title")}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/56">{t("checkoutUnavailable")}</p>
          <button
            type="button"
            onClick={openCart}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors duration-500 hover:bg-velmere-gold"
          >
            {t("openCart")}
          </button>
        </section>
      </LuxurySection>
    </main>
  );
}
