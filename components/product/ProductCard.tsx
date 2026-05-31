"use client";

import Image from "next/image";
import { ArrowUpRight, Ruler, Scissors, Wind } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { useModeStore } from "@/store/useModeStore";
import { formatMoney, getLocalizedString, isProductCustomerPurchasable } from "@/lib/products/catalog";
import type { Product } from "@/lib/products/types";

type ProductCardProps = {
  product: Product;
};

const proMetrics = [
  { icon: Ruler, label: "Weight", value: "450gsm" },
  { icon: Scissors, label: "Seam", value: "Reinforced" },
  { icon: Wind, label: "Breath", value: "Medium" },
] as const;

export default function ProductCard({ product }: ProductCardProps) {
  const productT = useTranslations("Product");
  const locale = useLocale();
  const { isProMode } = useModeStore();
  const reducedMotion = useReducedMotion();
  const purchasable = isProductCustomerPurchasable(product);
  const image = product.images[0];
  const hoverImage = product.images[1] ?? image;
  const title = getLocalizedString(product.title, locale);
  const description = getLocalizedString(product.shortDescription, locale);

  if (!isProMode) {
    return (
      <Link href={`/shop/${product.slug}`} className="block" data-product-card>
        <article className="border-y border-white/[0.10] py-5 text-velmere-ivory">
          <div className="grid grid-cols-[1fr_auto] items-start gap-5">
            <div>
              <p className="velmere-label">
                {purchasable ? productT("available") : productT("productComingSoon")}
              </p>
              <h3 className="mt-2 text-base font-semibold uppercase tracking-[0.08em] text-velmere-ivory">{title}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-velmere-muted">{description}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm tabular-nums text-velmere-grey-soft">{formatMoney(product.price, locale)}</p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/[0.34]">
                {product.variants.map((variant) => variant.size ?? variant.title).join(" / ")}
              </p>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/shop/${product.slug}`} className="block" data-product-card>
      <motion.article
        layout
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#d4af37]/[0.15] bg-[linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.018)_44%,rgba(212,175,55,0.045))] shadow-[0_28px_90px_rgba(0,0,0,0.36)]"
      >
        <motion.div layoutId={`product-image-${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-white/[0.035]">
          {image ? (
            <Image
              src={image.url}
              alt={getLocalizedString(image.alt, locale)}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-center contrast-105 transition-transform duration-700 group-hover:scale-[1.025]"
            />
          ) : null}
          {hoverImage && hoverImage.url !== image?.url ? (
            <Image
              src={hoverImage.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-center contrast-105 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.12),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute left-4 top-4 rounded-full border border-black/[0.10] bg-[#FFFFF0] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
            {purchasable ? productT("available") : productT("productComingSoon")}
          </span>
          <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.12] bg-black/[0.65] p-3 backdrop-blur-xl">
              {product.variants.map((variant) => (
                <span key={variant.id} className="rounded-full border border-white/[0.15] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.70]">
                  {variant.size ?? variant.title}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <motion.h3 layoutId={`product-title-${product.id}`} className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                {title}
              </motion.h3>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/[0.52]">{description}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white/[0.32] transition-colors group-hover:text-[#d4af37]" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {proMetrics.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/[0.10] bg-black/[0.25] p-3">
                <Icon className="h-3.5 w-3.5 text-[#d4af37]" aria-hidden="true" />
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.34]">{label}</p>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-white/[0.72]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <p className="font-mono text-lg tabular-nums text-velmere-gold">{formatMoney(product.price, locale)}</p>
            <p className="velmere-label">
              {purchasable ? productT("viewProduct") : productT("details")}
            </p>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
