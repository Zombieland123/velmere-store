"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { formatMoney, getLocalizedString, getProducts } from "@/lib/products/catalog";
import { isProductCustomerPurchasable } from "@/lib/products/catalog";
import { luxuryEase } from "@/lib/motion";

export default function LuxuryProductCarousel() {
  const t = useTranslations("LuxuryProductCarousel");
  const locale = useLocale();
  const reducedMotion = useReducedMotion();
  const products = getProducts().slice(0, 4);
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) => (current + direction + products.length) % products.length);
    },
    [products.length],
  );

  if (products.length === 0) return null;

  const product = products[index];
  const purchasable = isProductCustomerPurchasable(product);

  return (
    <section className="py-14 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{t("kicker")}</p>
          <h2 className="mt-4 font-serif text-3xl text-[#FFFFF0] md:text-5xl">{t("title")}</h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("prev")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("next")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={product.id}
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: luxuryEase }}
            className="grid md:grid-cols-2"
            drag={reducedMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.x > 60) go(-1);
              if (info.offset.x < -60) go(1);
            }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={product.images[0].url}
                alt={getLocalizedString(product.images[0].alt, locale)}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{product.collection ?? t("collection")}</p>
              <h3 className="mt-4 font-serif text-3xl leading-tight text-white md:text-4xl">
                {getLocalizedString(product.title, locale)}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/54">
                {getLocalizedString(product.shortDescription, locale)}
              </p>
              <p className="mt-6 font-mono text-lg tabular-nums text-white/70">{formatMoney(product.price, locale)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/shop/${product.slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72 hover:text-white"
                >
                  {t("viewProduct")}
                </Link>
                {!purchasable ? (
                  <span className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-6 text-[11px] uppercase tracking-[0.18em] text-velmere-muted">
                    {t("comingSoon")}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center gap-2 md:hidden">
        {products.map((item, dotIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(dotIndex)}
            aria-label={t("goTo", { index: dotIndex + 1 })}
            className={`h-2 w-2 rounded-full ${dotIndex === index ? "bg-[#d4af37]" : "bg-white/20"}`}
          />
        ))}
      </div>
    </section>
  );
}
