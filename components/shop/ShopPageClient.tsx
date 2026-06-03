"use client";

import { useEffect, useMemo } from "react";
import { ArrowUpRight, Bell, CreditCard, Headphones, PackageCheck, Truck, WalletCards } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";
import ProductCard from "@/components/ProductCard";
import LuxurySection from "@/components/layout/LuxurySection";
import { fadeUp } from "@/lib/motion";
import { trackVelmereEvent } from "@/lib/analytics";
import { getVisibleProducts } from "@/lib/products/catalog";
import { buildCommerceLaunchAudit } from "@/lib/products/launch-readiness";

const matrixSlots = ["Archive cut", "Drop reserve"];

const categories = [
  { key: null, href: "/shop", token: "filterAll" },
  { key: "men", href: "/shop?category=men", token: "filterMen" },
  { key: "women", href: "/shop?category=women", token: "filterWomen" },
] as const;

const sortLinks = [
  { key: "featured", href: "/shop", token: "sortFeatured" },
  { key: "new", href: "/shop?sort=new", token: "sortNewest" },
  { key: "price-asc", href: "/shop?sort=price-asc", token: "sortLowHigh" },
  { key: "price-desc", href: "/shop?sort=price-desc", token: "sortHighLow" },
] as const;

function matrixCopy(locale: string, category: string | null) {
  const isWomen = category === "women";
  if (locale === "pl") {
    return {
      label: isWomen ? "Kolekcja damska" : category === "men" ? "Kolekcja męska" : "Clothing",
      title: isWomen ? "Spokojna selekcja damska." : category === "men" ? "Spokojna selekcja męska." : "Clothing jako prosty lejek zakupowy.",
      body: "Produkt zostaje pierwszy: krój, materiał, rozmiar, dostawa i zwrot. VLM działa jako opcjonalny benefit, nie jako blokada zakupu.",
      locked: "Slot przyszłego dropu",
    };
  }
  if (locale === "de") {
    return {
      label: isWomen ? "Womenswear" : category === "men" ? "Menswear" : "Clothing",
      title: isWomen ? "Womenswear als ruhige Auswahl." : category === "men" ? "Menswear als ruhige Auswahl." : "Clothing als klarer Kauf-Funnel.",
      body: "Das Produkt bleibt zuerst: Schnitt, Material, Größe, Lieferung und Rückgabe. VLM ist ein optionaler Vorteil, keine Kaufbarriere.",
      locked: "Slot für kommenden Drop",
    };
  }
  return {
    label: isWomen ? "Womenswear" : category === "men" ? "Menswear" : "Clothing",
    title: isWomen ? "Womenswear as a quiet selection." : category === "men" ? "Menswear as a quiet selection." : "Clothing as a clean commerce funnel.",
    body: "Product stays first: cut, material, size, delivery and returns. VLM remains an optional benefit, never a purchase barrier.",
    locked: "Future drop slot",
  };
}

function commerceCopy(locale: string) {
  if (locale === "pl") {
    return {
      kicker: "commerce first",
      title: "Ubranie jest rdzeniem Velmère.",
      body: "Strona sklepu ma prowadzić do decyzji zakupowej przez jakość, rozmiar, dostawę i zwrot. Shield, VLM i Square wzmacniają zaufanie, ale nie zastępują produktu.",
      rails: [
        { label: "Fit", body: "Rozmiar, proporcja i sylwetka muszą być widoczne przed koszykiem." },
        { label: "Material", body: "Gramatura, odczucie, care i trwałość mają być opisane prosto, bez przesady." },
        { label: "Delivery", body: "Dostawa, podatki, zwroty i status fulfillmentu muszą być jasne przed płatnością." },
      ],
      digitalKicker: "digital layer",
      digitalTitle: "VLM nie blokuje zakupu.",
      digitalBody: "Warstwa cyfrowa może dawać dostęp, archive notes i community, ale clothing commerce zostaje oddzielony od tokena i portfela.",
      readinessKicker: "launch control",
      readinessTitle: "Sklep nie udaje gotowości.",
      readinessBody: "Ta warstwa pokazuje stan realnego commerce: które produkty są tylko preview, czy checkout jest zamknięty i co blokuje sprzedaż publiczną.",
      readinessCards: {
        total: "Produkty",
        preview: "Preview",
        purchasable: "Gotowe do sprzedaży",
        blocked: "Blokady",
        score: "Readiness",
      },
      issueTitle: "Najważniejsze blokady",
      noIssues: "Brak aktywnych blokad w audycie.",
    };
  }
  if (locale === "de") {
    return {
      kicker: "commerce first",
      title: "Kleidung ist der Kern von Velmère.",
      body: "Die Shop-Seite führt über Qualität, Größe, Lieferung und Rückgabe zur Kaufentscheidung. Shield, VLM und Square stärken Vertrauen, ersetzen aber nicht das Produkt.",
      rails: [
        { label: "Fit", body: "Größe, Proportion und Silhouette müssen vor dem Warenkorb klar sein." },
        { label: "Material", body: "Gewicht, Gefühl, Pflege und Haltbarkeit werden ruhig und konkret erklärt." },
        { label: "Delivery", body: "Lieferung, Steuern, Rückgaben und Fulfillment-Status sind vor Zahlung sichtbar." },
      ],
      digitalKicker: "digital layer",
      digitalTitle: "VLM blockiert keinen Kauf.",
      digitalBody: "Die digitale Ebene kann Access, Archive Notes und Community geben, bleibt aber vom Clothing Checkout getrennt.",
      readinessKicker: "launch control",
      readinessTitle: "Der Shop täuscht keine Bereitschaft vor.",
      readinessBody: "Diese Ebene zeigt den echten Commerce-Status: welche Produkte nur Preview sind, ob Checkout geschlossen ist und was den Public Launch blockiert.",
      readinessCards: {
        total: "Produkte",
        preview: "Preview",
        purchasable: "Verkaufsbereit",
        blocked: "Blocker",
        score: "Readiness",
      },
      issueTitle: "Wichtigste Blocker",
      noIssues: "Keine aktiven Blocker im Audit.",
    };
  }
  return {
    kicker: "commerce first",
    title: "Clothing is the core of Velmère.",
    body: "The shop page should lead purchase decisions through quality, size, delivery and returns. Shield, VLM and Square increase trust, but they do not replace the garment.",
    rails: [
      { label: "Fit", body: "Size, proportion and silhouette need to be clear before cart." },
      { label: "Material", body: "Weight, handfeel, care and durability should be described calmly and concretely." },
      { label: "Delivery", body: "Delivery, taxes, returns and fulfilment status must be visible before payment." },
    ],
    digitalKicker: "digital layer",
    digitalTitle: "VLM never blocks purchase.",
    digitalBody: "The digital layer can provide access, archive notes and community, but it stays separated from clothing checkout.",
    readinessKicker: "launch control",
    readinessTitle: "The store does not pretend to be ready.",
    readinessBody: "This layer shows the real commerce state: which products are preview-only, whether checkout is closed and what blocks a public sale.",
    readinessCards: {
      total: "Products",
      preview: "Preview",
      purchasable: "Sale-ready",
      blocked: "Blockers",
      score: "Readiness",
    },
    issueTitle: "Top blockers",
    noIssues: "No active blockers in the audit.",
  };
}

export default function ShopPage() {
  const t = useTranslations("Shop");
  const trust = useTranslations("Trust");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") ?? "featured";

  const products = useMemo(() => {
    const base = getVisibleProducts().filter((product) => !product.isVlmLocked);
    const sorted = [...base];
    if (sort === "price-asc") sorted.sort((a, b) => a.price.amount - b.price.amount);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price.amount - a.price.amount);
    else if (sort === "new") sorted.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    else sorted.sort((a, b) => b.price.amount - a.price.amount);
    return sorted;
  }, [sort]);

  const visibleSlots = [...products, ...matrixSlots].slice(0, products.length + 2);
  const matrix = matrixCopy(locale, category);
  const commerce = commerceCopy(locale);
  const launchAudit = useMemo(() => buildCommerceLaunchAudit(products), [products]);

  useEffect(() => {
    trackVelmereEvent("clothing_view", { category: category ?? "all", sort });
  }, [category, sort]);

  const trustItems = [
    { icon: CreditCard, label: trust("securePayment") },
    { icon: Truck, label: trust("trackedShipping") },
    { icon: PackageCheck, label: trust("returnsPolicy") },
    { icon: Headphones, label: trust("support") },
  ];

  const funnelNotes = [
    { icon: CreditCard, label: t("guestFirst") },
    { icon: WalletCards, label: t("walletOptional") },
    { icon: Truck, label: t("deliveryVisible") },
  ];

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <div className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="max-w-3xl lg:col-span-8">
            <p className="luxury-kicker text-velmere-gold/[0.80]">{matrix.label}</p>
            <h1 className="mt-6 font-serif text-5xl leading-none text-white md:text-7xl">{matrix.title}</h1>
            <p className="mt-6 text-sm leading-7 text-white/[0.62] md:text-base">{matrix.body}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.48]">{t("intro")}</p>
          </div>
          <div className="grid gap-2 lg:col-span-4">
            {funnelNotes.map(({ icon: Icon, label }) => (
              <div key={label} className="flex min-h-12 items-center gap-3 rounded-full border border-white/[0.10] bg-white/[0.035] px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.58]">
                <Icon className="h-4 w-4 text-velmere-gold/[0.72]" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-[1.5rem] border border-white/[0.10] bg-white/[0.035] p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const active = item.key === category || (!item.key && !category);
              return (
                <Link
                  key={item.token}
                  href={item.href}
                  onClick={() => trackVelmereEvent("filter_use", { filter: item.key ?? "all" })}
                  className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${active ? "border-velmere-gold bg-velmere-gold text-black" : "border-white/[0.12] text-white/[0.58] hover:border-white/[0.25] hover:text-white"}`}
                >
                  {t(item.token)}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {sortLinks.map((item) => {
              const active = item.key === sort || (item.key === "featured" && sort === "featured");
              return (
                <Link
                  key={item.token}
                  href={category ? `${item.href}${item.href.includes("?") ? "&" : "?"}category=${category}` : item.href}
                  onClick={() => trackVelmereEvent("filter_use", { sort: item.key })}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${active ? "border-white/[0.36] text-white" : "border-white/[0.10] text-white/[0.42] hover:text-white"}`}
                >
                  {t(item.token)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[1.5rem] border border-velmere-gold/[0.14] bg-velmere-gold/[0.045] p-5 md:p-6">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-velmere-gold">{commerce.kicker}</p>
            <h2 className="mt-4 font-serif text-3xl leading-none text-white md:text-4xl">{commerce.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.60]">{commerce.body}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {commerce.rails.map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">{item.label}</p>
                <p className="mt-3 text-xs leading-6 text-white/[0.54]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-cyan-200/[0.10] bg-cyan-300/[0.035] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-[0.35fr_0.65fr] md:items-center">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/[0.72]">{commerce.digitalKicker}</p>
              <h2 className="mt-3 font-serif text-2xl text-white md:text-3xl">{commerce.digitalTitle}</h2>
            </div>
            <p className="text-sm leading-7 text-white/[0.58]">{commerce.digitalBody}</p>
          </div>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-white/[0.10] bg-white/[0.030] p-5 md:p-6">
          <div className="grid gap-5 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-velmere-gold">{commerce.readinessKicker}</p>
              <h2 className="mt-3 font-serif text-3xl leading-none text-white md:text-4xl">{commerce.readinessTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-white/[0.58]">{commerce.readinessBody}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {[
                [commerce.readinessCards.total, launchAudit.total],
                [commerce.readinessCards.preview, launchAudit.preview],
                [commerce.readinessCards.purchasable, launchAudit.purchasable],
                [commerce.readinessCards.blocked, launchAudit.blocked],
                [commerce.readinessCards.score, `${launchAudit.averageScore}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.1rem] border border-white/[0.08] bg-black/[0.22] p-3">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.38]">{label}</p>
                  <p className="mt-2 font-serif text-2xl text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 rounded-[1.2rem] border border-white/[0.08] bg-black/[0.18] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-white/[0.50]">{commerce.issueTitle}</p>
              <p className="max-w-2xl text-xs leading-6 text-white/[0.42]">
                {launchAudit.topIssues.length > 0
                  ? launchAudit.topIssues.map((item) => item.label).join(" · ")
                  : commerce.noIssues}
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
          className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:gap-5"
        >
          {visibleSlots.map((slot, index) => {
            const product = typeof slot === "string" ? undefined : slot;
            if (product) {
              return (
                <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                  <ProductCard product={product} priority={index < 2} />
                </motion.div>
              );
            }
            return (
              <motion.article key={String(slot)} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="group relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012)_48%,rgba(212,175,55,0.035))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.26)] md:min-h-[25rem] md:rounded-[2rem] md:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.07),transparent_25%),radial-gradient(circle_at_50%_58%,rgba(212,175,55,0.08),transparent_26%)] opacity-60" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="aspect-[4/5] rounded-[1.2rem] border border-white/[0.08] bg-black/[0.25] p-4">
                    <div className="h-full w-full rounded-[1rem] border border-dashed border-white/[0.10] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
                  </div>
                  <div className="pt-5">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-[#d4af37]/[0.70]">{matrix.locked}</p>
                    <h3 className="mt-3 font-serif text-xl text-white/[0.82] md:text-2xl">{String(slot)}</h3>
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
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/[0.42]">{t("serviceKicker")}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{t("serviceTitle")}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex min-h-20 items-center gap-4 border border-black/[0.10] bg-black/[0.035] px-4">
                  <Icon className="h-5 w-5 text-black/[0.70]" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/[0.62]">{label}</span>
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
          className="grid gap-6 rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8"
        >
          <div>
            <p className="luxury-kicker text-velmere-gold/[0.70]">{t("waitlistKicker")}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white md:text-5xl">{t("waitlistTitle")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.58]">{t("waitlistBody")}</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/[0.14] px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/[0.72] transition-colors hover:border-white/[0.28] hover:text-white"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            {t("waitlistCta")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.section>
      </LuxurySection>
    </main>
  );
}
