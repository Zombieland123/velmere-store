"use client";

import { ArrowUpRight, CreditCard, Headphones, PackageCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import ProductCard from "@/components/ProductCard";
import LuxurySection from "@/components/layout/LuxurySection";
import { fadeUp } from "@/lib/motion";
import { getVisibleProducts } from "@/lib/products/catalog";

export default function ShopPage() {
  const nav = useTranslations("Nav");
  const t = useTranslations("Shop");
  const trust = useTranslations("Trust");
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  const pageTitle =
    category === "men"
      ? nav("menswear")
      : category === "women"
        ? nav("womenswear")
        : sort === "new"
          ? nav("newDrop")
          : t("title");
  const products = getVisibleProducts().filter((product) => !product.isVlmLocked);

  const trustItems = [
    { icon: CreditCard, label: trust("securePayment") },
    { icon: Truck, label: trust("trackedShipping") },
    { icon: PackageCheck, label: trust("madeAfterOrder") },
    { icon: Headphones, label: trust("support") },
  ];

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="max-w-3xl lg:col-span-8">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
            <h1 className="mt-6 font-serif text-5xl leading-none text-white md:text-7xl">{pageTitle}</h1>
            <p className="mt-6 text-sm leading-7 text-white/58 md:text-base">{t("subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </LuxurySection>

      <section className="bg-[#F5F0E8] py-14 text-black md:py-16">
        <LuxurySection>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/42">{t("serviceKicker")}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{t("serviceTitle")}</h2>
              </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex min-h-20 items-center gap-4 border border-black/10 bg-black/[0.035] px-4">
                  <Icon className="h-5 w-5 text-black/70" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/62">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </LuxurySection>
      </section>

      <LuxurySection className="py-16 md:py-24">
        <motion.section
          {...fadeUp}
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
        >
          <div>
            <p className="luxury-kicker text-velmere-gold/70">{t("archiveKicker")}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">{t("archiveTitle")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{t("archiveBody")}</p>
          </div>
          <Link
            href="/vlm-token"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/14 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 transition-colors hover:border-white/28 hover:text-white"
          >
            {t("archiveCta")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.section>
      </LuxurySection>
    </main>
  );
}
