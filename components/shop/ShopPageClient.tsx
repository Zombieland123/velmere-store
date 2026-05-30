"use client";

import Image from "next/image";
import { ArrowUpRight, CreditCard, Headphones, PackageCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import ProductCard from "@/components/ProductCard";
import LuxurySection from "@/components/layout/LuxurySection";
import { fadeUp } from "@/lib/motion";
import { getVisibleProducts } from "@/lib/products/catalog";

const matrixSlots = ["Archive cut", "Drop reserve"];

function matrixCopy(locale: string, category: string | null) {
  const isWomen = category === "women";
  if (locale === "pl") {
    return {
      label: isWomen ? "Kolekcja damska" : "Kolekcja męska",
      title: isWomen ? "Spokojna selekcja damska." : "Spokojna selekcja męska.",
      body: "Aktywne sylwetki zostają na pierwszym planie. Archiwalne miejsca pokazujemy oszczędnie, żeby sklep nie wyglądał jak pusty placeholder.",
      filter: "Kuratowana selekcja",
      locked: "Slot archiwalny",
    };
  }
  if (locale === "de") {
    return {
      label: isWomen ? "Womenswear" : "Menswear",
      title: isWomen ? "Womenswear als kontrollierte Schnitt-Matrix." : "Menswear als kontrollierte Schnitt-Matrix.",
      body: "Aktive Silhouetten bleiben zuerst sichtbar. Archivplätze bleiben reduziert, damit die Kollektion kuratiert wirkt.",
      filter: "Kuratierte Auswahl",
      locked: "Archiv-Slot",
    };
  }
  return {
    label: isWomen ? "Womenswear" : "Menswear",
    title: isWomen ? "Womenswear as a controlled silhouette matrix." : "Menswear as a controlled silhouette matrix.",
    body: "Active silhouettes stay visible first. Archive slots are held back so the collection feels curated, not unfinished.",
    filter: "Curated selection",
    locked: "Archive slot",
  };
}

export default function ShopPage() {
  const nav = useTranslations("Nav");
  const t = useTranslations("Shop");
  const trust = useTranslations("Trust");
  const locale = useLocale();
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
  const products = getVisibleProducts().filter((product) => !product.isVlmLocked).sort((a, b) => b.price.amount - a.price.amount);
  const visibleSlots = [...products, ...matrixSlots].slice(0, products.length + 2);
  const matrix = matrixCopy(locale, category);

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
            <p className="luxury-kicker text-velmere-gold/80">{matrix.label}</p>
            <h1 className="mt-6 font-serif text-5xl leading-none text-white md:text-7xl">{pageTitle}</h1>
            <p className="mt-6 text-sm leading-7 text-white/58 md:text-base">{matrix.body}</p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-velmere-muted">{matrix.filter}</span>
          </div>
        </div>

        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
          {visibleSlots.map((slot, index) => {
            const product = typeof slot === "string" ? undefined : slot;
            if (product) {
              return (
                <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                  <ProductCard product={product} />
                </motion.div>
              );
            }
            return (
              <motion.article key={String(slot)} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012)_48%,rgba(212,175,55,0.035))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.26)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.07),transparent_25%),radial-gradient(circle_at_50%_58%,rgba(212,175,55,0.08),transparent_26%)] opacity-60" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="aspect-[4/5] rounded-[1.35rem] border border-white/8 bg-black/25 p-5">
                    <div className="h-full w-full rounded-[1rem] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
                  </div>
                  <div className="pt-5">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-[#d4af37]/70">{matrix.locked}</p>
                    <h3 className="mt-3 font-serif text-2xl text-white/82">{typeof slot === 'string' ? slot : slot.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-velmere-muted">{locale === "pl" ? "Miejsce przyszłego dropu." : locale === "de" ? "Platz für einen kommenden Drop." : "Reserved for a future drop."}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
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

