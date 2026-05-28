"use client";

import Image from "next/image";
import { Link } from "@/navigation";
import LuxuryProductCarousel from "@/components/home/LuxuryProductCarousel";
import { ArrowUpRight, CreditCard, Headphones, PackageCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import NeuralBrainVisual from "@/components/home/NeuralBrainVisual";
import HomeSideRubrics from "@/components/home/HomeSideRubrics";
import LuxurySection from "@/components/layout/LuxurySection";
import { fadeUp } from "@/lib/motion";
import { formatMoney, getLocalizedString, getVisibleProducts } from "@/lib/products/catalog";

const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20";

export default function Home() {
  const t = useTranslations("Home");
  const trust = useTranslations("Trust");
  const locale = useLocale();
  const featuredProducts = getVisibleProducts().slice(0, 3);
  const trustItems = [
    { icon: CreditCard, label: trust("securePayment") },
    { icon: Truck, label: trust("trackedShipping") },
    { icon: Headphones, label: trust("supportBeforePurchase") },
    { icon: PackageCheck, label: trust("limitedDrops") },
  ];

  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <LuxurySection className="pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <motion.div {...fadeUp} className="lg:col-span-5">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
            <h1 className="mt-6 whitespace-pre-line font-serif text-5xl leading-[0.94] tracking-normal text-white md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/62 md:text-lg">{t("quote")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#F5F0E8] px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-white"
              >
                {t("cta")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/vlm-token"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F5F0E8] transition-colors hover:bg-white/[0.06]"
              >
                {t("secondaryCta")}
              </Link>
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="lg:col-span-7">
            <NeuralBrainVisual />
          </motion.div>
        </div>
      </LuxurySection>

      <HomeSideRubrics />

      <LuxurySection className="py-16 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="luxury-kicker">{t("new")}</p>
            <h2 className="mt-4 font-serif text-4xl leading-none text-white md:text-6xl">
              {t("newSectionTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/52">{t("newSectionSubtitle")}</p>
          </div>
          <Link
            href="/shop"
            className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46 transition-colors hover:text-white sm:block"
          >
            {t("cta")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={product.images[0].url}
                  alt={getLocalizedString(product.images[0].alt, locale)}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                  {getLocalizedString(product.title, locale)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  {getLocalizedString(product.shortDescription, locale)}
                </p>
                <p className="mt-3 font-sans text-lg text-white/64">{formatMoney(product.price, locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      </LuxurySection>

      <section className="bg-[#F5F0E8] py-16 text-black md:py-24">
        <LuxurySection>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/42">{t("editorialKicker")}</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">{t("editorialTitle")}</h2>
              <p className="mt-6 text-base leading-8 text-black/64">{t("editorialBody")}</p>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden lg:col-span-7">
              <Image
                src={EDITORIAL_IMAGE}
                alt={t("editorialImageAlt")}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover grayscale contrast-125"
              />
            </div>
          </div>
        </LuxurySection>
      </section>

      <LuxurySection>
        <LuxuryProductCarousel />
      </LuxurySection>

      <section className="bg-[#D8D5CF] py-10 text-black">
        <LuxurySection>
          <div className="grid gap-3 md:grid-cols-4">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex min-h-16 items-center gap-3 border border-black/10 bg-black/[0.035] px-4">
                <Icon className="h-4 w-4 text-black/68" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/62">{label}</span>
              </div>
            ))}
          </div>
        </LuxurySection>
      </section>

      <LuxurySection className="py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="luxury-kicker text-velmere-gold/70">{t("squareTeaserKicker")}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white md:text-5xl">{t("squareTeaserTitle")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{t("squareTeaserBody")}</p>
          </div>
          <Link
            href="/square"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 transition-colors hover:border-white/28 hover:text-white"
          >
            {t("squareTeaserCta")}
          </Link>
        </div>
        <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="luxury-kicker text-velmere-gold/70">{t("vlmTeaserKicker")}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white md:text-5xl">{t("vlmTeaserTitle")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{t("vlmTeaserBody")}</p>
          </div>
          <Link
            href="/vlm-token"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 transition-colors hover:border-white/28 hover:text-white"
          >
            {t("vlmTeaserCta")}
          </Link>
        </div>
        </div>
      </LuxurySection>
    </main>
  );
}
