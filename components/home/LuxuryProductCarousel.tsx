"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import {
  formatMoney,
  getLocalizedString,
  getProducts,
  isProductCustomerPurchasable,
} from "@/lib/products/catalog";

export default function LuxuryProductCarousel() {
  const t = useTranslations("LuxuryProductCarousel");
  const locale = useLocale();
  const products = getProducts().slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="velmere-label text-velmere-gold">{t("kicker")}</p>
          <h2 className="mt-4 font-serif text-4xl leading-[0.96] tracking-[-0.04em] text-velmere-ivory md:text-6xl">
            {t("title")}
          </h2>
        </div>
        <Link href="/shop" className="velmere-button-secondary w-fit">
          {locale === "pl"
            ? "Zobacz sklep"
            : locale === "de"
              ? "Shop ansehen"
              : "View shop"}{" "}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => {
          const purchasable = isProductCustomerPurchasable(product);
          const title = getLocalizedString(product.title, locale);
          return (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group overflow-hidden rounded-[1.75rem] border border-white/[0.10] bg-[#111113] shadow-velmere-card transition duration-500 hover:-translate-y-1 hover:border-velmere-gold/[0.26] hover:bg-[#151518] active:scale-[0.99]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image
                  src={product.images[0].url}
                  alt={getLocalizedString(product.images[0].alt, locale)}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:768px) 50vw, 100vw"
                  className="object-contain object-center p-4 contrast-105 transition duration-700 group-hover:scale-[1.025] group-hover:brightness-110"
                  priority={index === 0}
                />
                <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/[0.12] bg-black/[0.34] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.64] backdrop-blur-xl">
                    {purchasable
                      ? locale === "pl"
                        ? "Dostępne"
                        : locale === "de"
                          ? "Verfügbar"
                          : "Available"
                      : t("comingSoon")}
                  </span>
                  <span className="rounded-full border border-velmere-gold/[0.25] bg-velmere-gold/[0.10] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">
                    0{index + 1}
                  </span>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold/[0.75]">
                  {product.collection ?? t("collection")}
                </p>
                <h3 className="mt-4 font-serif text-2xl leading-tight text-velmere-ivory md:text-3xl">
                  {title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-velmere-muted">
                  {getLocalizedString(product.shortDescription, locale)}
                </p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="font-mono text-sm tabular-nums text-velmere-gold">
                    {formatMoney(product.price, locale)}
                  </p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.46] group-hover:text-white/[0.70]">
                    {t("viewProduct")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
