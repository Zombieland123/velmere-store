"use client";

import Image from "next/image";
import { ArrowUpRight, Ruler, Scissors, Wind } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { useModeStore } from "@/store/useModeStore";
import { formatMoney, getLocalizedString, isProductCustomerPurchasable } from "@/lib/products/catalog";
import { buildProductProviderTruthSnapshot } from "@/lib/launch/provider-truth-ledger";
import type { Product } from "@/lib/products/types";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

function cardCommerceCopy(locale: string) {
  if (locale === "pl") {
    return {
      weight: "Gramatura",
      seam: "Szew",
      breath: "Oddychalność",
      reinforced: "Wzmocniony",
      medium: "Średnia",
      fitNote: "Sprawdź rozmiar, dostawę i zwrot przed płatnością.",
    };
  }
  if (locale === "de") {
    return {
      weight: "Gewicht",
      seam: "Naht",
      breath: "Atmung",
      reinforced: "Verstärkt",
      medium: "Mittel",
      fitNote: "Größe, Lieferung und Rückgabe vor Zahlung prüfen.",
    };
  }
  return {
    weight: "Weight",
    seam: "Seam",
    breath: "Breath",
    reinforced: "Reinforced",
    medium: "Medium",
    fitNote: "Check size, delivery and returns before payment.",
  };
}

function providerSnapshotCopy(locale: string) {
  if (locale === "pl") {
    return {
      provider: "provider",
      source: "źródło",
      blocked: "checkout zablokowany",
      review: "manual review",
      partial: "częściowe",
      ready: "gotowe",
      missing: "braki",
    };
  }
  if (locale === "de") {
    return {
      provider: "Provider",
      source: "Quelle",
      blocked: "Checkout gesperrt",
      review: "Manual Review",
      partial: "teilweise",
      ready: "bereit",
      missing: "fehlend",
    };
  }
  return {
    provider: "provider",
    source: "source",
    blocked: "checkout blocked",
    review: "manual review",
    partial: "partial",
    ready: "ready",
    missing: "missing",
  };
}

function providerSnapshotStatusLabel(status: string, locale: string) {
  const copy = providerSnapshotCopy(locale);
  if (status === "blocked") return copy.blocked;
  if (status === "manual_review") return copy.review;
  if (status === "ready") return copy.ready;
  return copy.partial;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const productT = useTranslations("Product");
  const locale = useLocale();
  const commerce = cardCommerceCopy(locale);
  const providerCopy = providerSnapshotCopy(locale);
  const { isProMode } = useModeStore();
  const reducedMotion = useReducedMotion();
  const purchasable = isProductCustomerPurchasable(product);
  const providerSnapshot = buildProductProviderTruthSnapshot(product);
  const providerStatusLabel = providerSnapshotStatusLabel(providerSnapshot.status, locale);
  const image = product.images[0];
  const hoverImage = product.images[1] ?? image;
  const title = getLocalizedString(product.title, locale);
  const description = getLocalizedString(product.shortDescription, locale);
  const fitValue = product.truth ? getLocalizedString(product.truth.fit, locale) : commerce.medium;
  const materialValue = product.truth ? getLocalizedString(product.truth.material, locale) : commerce.reinforced;
  const productMetrics = [
    { icon: Ruler, key: "weight", value: product.truth?.weight ?? "TBC" },
    { icon: Scissors, key: "seam", value: materialValue },
    { icon: Wind, key: "breath", value: fitValue },
  ] as const;

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
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.36]">
                {providerCopy.provider}: {product.provider} · {providerCopy.source}: {providerSnapshot.sourceMode} · {providerStatusLabel}
              </p>
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
        <motion.div layoutId={`product-image-${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-white">
          {image ? (
            <Image
              src={image.url}
              alt={getLocalizedString(image.alt, locale)}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              priority={priority}
              className="object-contain object-center p-4 contrast-105 transition-transform duration-700 group-hover:scale-[1.02]"
            />
          ) : null}
          {hoverImage && hoverImage.url !== image?.url ? (
            <Image
              src={hoverImage.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-contain object-center p-4 contrast-105 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
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
              <p className="mt-3 max-w-xs text-[10px] uppercase tracking-[0.16em] text-white/[0.34]">{commerce.fitNote}</p>
              <div className="mt-4 rounded-2xl border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold/[0.78]">
                  {providerCopy.provider}: {product.provider} · {providerSnapshot.score}/100
                </p>
                <p className="mt-2 line-clamp-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.40]">
                  {providerCopy.source}: {providerSnapshot.sourceMode} · {providerStatusLabel}
                  {providerSnapshot.missing.length ? ` · ${providerCopy.missing}: ${providerSnapshot.missing.slice(0, 2).join(", ")}` : ""}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white/[0.32] transition-colors group-hover:text-[#d4af37]" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {productMetrics.map(({ icon: Icon, key, value }) => (
              <div key={key} className="rounded-2xl border border-white/[0.10] bg-black/[0.25] p-3">
                <Icon className="h-3.5 w-3.5 text-[#d4af37]" aria-hidden="true" />
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.34]">{commerce[key]}</p>
                <p className="mt-1 line-clamp-2 font-mono text-[11px] tabular-nums text-white/[0.72]">{value}</p>
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
