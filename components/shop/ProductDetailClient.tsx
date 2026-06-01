"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";
import { useCart } from "@/components/CartProvider";
import { fadeUp } from "@/lib/motion";
import { trackVelmereEvent } from "@/lib/analytics";
import {
  formatMoney,
  getLocalizedString,
  getProductBySlugOrId,
  isProductCustomerPurchasable,
} from "@/lib/products/catalog";

const MEASUREMENTS = [
  { size: "S", chest: "112 cm", length: "66 cm", shoulders: "58 cm" },
  { size: "M", chest: "118 cm", length: "68 cm", shoulders: "60 cm" },
  { size: "L", chest: "124 cm", length: "70 cm", shoulders: "62 cm" },
  { size: "XL", chest: "130 cm", length: "72 cm", shoulders: "64 cm" },
];

const SPECS = [
  ["MATERIAL", "100% HEAVYWEIGHT COTTON"],
  ["WEIGHT", "450 GSM"],
  ["FIT", "BOXY / OVERSIZED"],
  ["CARE", "COLD WASH / INSIDE OUT / AIR DRY"],
] as const;

function ProductAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.10]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-white/[0.72]"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-7 text-white/[0.56]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = useTranslations("ProductDetail");
  const productT = useTranslations("Product");
  const trust = useTranslations("Trust");
  const locale = useLocale();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [toast, setToast] = useState("");
  const addInFlightRef = useRef(false);
  const [ctaState, setCtaState] = useState<"idle" | "processing" | "allocated">(
    "idle",
  );
  const { addItem } = useCart();
  const product = getProductBySlugOrId(params.id);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("velmere:angel-visibility", {
        detail: { hidden: isSizeGuideOpen },
      }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("velmere:angel-visibility", {
          detail: { hidden: false },
        }),
      );
    };
  }, [isSizeGuideOpen]);

  useEffect(() => {
    if (product) {
      trackVelmereEvent("product_view", { productId: product.id, slug: product.slug });
    }
  }, [product]);

  if (!product) {
    return (
      <main className="min-h-[100dvh] bg-velmere-black pb-28 text-white">
        <LuxurySection className="py-28 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <p className="luxury-kicker text-velmere-gold/[0.80]">
              {productT("missingKicker")}
            </p>
            <h1 className="mt-6 font-serif text-5xl text-white">
              {productT("notFound")}
            </h1>
            <p className="mt-5 text-sm leading-7 text-white/[0.58]">
              {productT("notFoundBody")}
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex min-h-12 items-center rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-velmere-gold"
            >
              {t("backToShop")}
            </Link>
          </div>
        </LuxurySection>
      </main>
    );
  }

  const selectedProduct = product;
  const selectedVariant =
    selectedProduct.variants.find(
      (variant) => variant.id === selectedVariantId,
    ) ?? null;
  const purchasable = isProductCustomerPurchasable(selectedProduct);
  const title = getLocalizedString(selectedProduct.title, locale);
  const externalOnly =
    selectedProduct.fulfilmentMode === "external_link" &&
    selectedProduct.externalUrl;
  const category =
    selectedProduct.collection ?? selectedProduct.tags[0] ?? "GARMENT";
  const humanBreadcrumb =
    locale === "pl"
      ? `Velmère / Sklep / ${title}`
      : locale === "de"
        ? `Velmère / Shop / ${title}`
        : `Velmère / Shop / ${title}`;

  function handleAddToCart() {
    if (!selectedVariant || !purchasable || ctaState !== "idle" || addInFlightRef.current) return;
    addInFlightRef.current = true;
    trackVelmereEvent("add_to_cart", { productId: selectedProduct.id, variantId: selectedVariant.id, size: selectedVariant.size ?? selectedVariant.title });
    navigator.vibrate?.(45);
    setCtaState("processing");
    window.setTimeout(() => {
      addItem({
        id: selectedProduct.id,
        name: title,
        price: selectedVariant.price?.amount ?? selectedProduct.price.amount,
        currency:
          selectedVariant.price?.currency ?? selectedProduct.price.currency,
        size: selectedVariant.size ?? selectedVariant.title,
        variantId: selectedVariant.id,
        image: selectedProduct.images[0]?.url ?? "",
      });
      setCtaState("allocated");
      setToast(t("addedToCart"));
      window.setTimeout(() => {
        addInFlightRef.current = false;
        setCtaState("idle");
        setToast("");
      }, 1400);
    }, 500);
  }

  const ctaLabel =
    ctaState === "processing"
      ? t("adding")
      : ctaState === "allocated"
        ? t("addedToCart")
        : purchasable
          ? selectedVariant
            ? t("addToCart")
            : t("selectSizeFirst")
          : productT("productComingSoon");

  return (
    <main className="min-h-[100dvh] bg-velmere-black pb-28 text-white">
      <LuxurySection className="max-w-none py-24 md:py-32">
        <Link
          href="/shop"
          className="mb-6 inline-flex min-h-11 items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/[0.50] transition-colors hover:text-white active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("backToShop")}
        </Link>
        <p className="mb-5 break-all font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.40]">
          {humanBreadcrumb}
        </p>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {selectedProduct.images.map((image, index) => (
              <motion.div
                key={image.url}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                viewport={{ once: true, margin: "-80px" }}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.10] bg-white shadow-2xl shadow-black/[0.30]"
              >
                <Image
                  src={image.url}
                  alt={t("imageAlt", { name: title, number: index + 1 })}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-contain object-center p-5 contrast-105"
                />
              </motion.div>
            ))}
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-white/[0.10] bg-[#1A1A1C] p-5 shadow-2xl shadow-black/[0.40] lg:sticky lg:top-28 md:p-7">
              <p className="luxury-kicker text-velmere-gold/[0.80]">
                {productT("garment")}
              </p>
              <h1 className="mt-5 font-serif text-4xl leading-tight text-white md:text-6xl">
                {title}
              </h1>
              <p className="mt-5 font-mono text-2xl tabular-nums text-white/[0.76]">
                {formatMoney(selectedProduct.price, locale)}
              </p>
              <p className="mt-6 text-sm leading-8 text-white/[0.60]">
                {getLocalizedString(selectedProduct.description, locale)}
              </p>

              <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.10] bg-[#111113]">
                <p className="border-b border-white/[0.10] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">
                  {locale === "pl"
                    ? "Materiał / Konstrukcja"
                    : locale === "de"
                      ? "Material / Konstruktion"
                      : "Material / Construction"}
                </p>
                {SPECS.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-[7.5rem_minmax(0,1fr)] border-b border-white/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] last:border-b-0"
                  >
                    <span className="text-velmere-muted">{key}</span>
                    <span className="break-words text-velmere-grey-soft">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-white/[0.10] bg-[#111113] p-4">
                <div className="grid gap-3 text-[11px] uppercase tracking-[0.16em] text-white/[0.52] sm:grid-cols-2">
                  <span>{trust("securePayment")}</span>
                  <span>{trust("trackedShipping")}</span>
                  <span>{trust("madeAfterOrder")}</span>
                  <span>{trust("support")}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] p-4 text-sm leading-7 text-white/[0.64]">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">{t("vlmBenefitTitle")}</p>
                <p>{t("vlmBenefitBody")}</p>
                <div className="grid gap-2 text-[11px] uppercase tracking-[0.14em] text-white/[0.46] sm:grid-cols-2">
                  <span>{t("deliveryEstimate")}</span>
                  <span>{t("returnSummary")}</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/[0.72]">
                    {t("selectSize")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="min-h-11 rounded-full border border-white/[0.10] px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.50] transition-colors hover:border-white/[0.25] hover:text-white active:scale-95"
                  >
                    {t("sizeGuide")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        trackVelmereEvent("size_select", { productId: selectedProduct.id, variantId: variant.id, size: variant.size ?? variant.title });
                      }}
                      className={`flex h-12 min-w-12 items-center justify-center rounded-full border px-3 text-xs font-semibold transition-transform duration-200 active:scale-95 ${selectedVariantId === variant.id ? "border-velmere-gold bg-velmere-gold text-black" : "border-white/[0.12] text-white/[0.62] hover:border-white/[0.28] hover:text-white"}`}
                    >
                      {variant.size ?? variant.title}
                    </button>
                  ))}
                </div>
              </div>

              {externalOnly ? (
                <a
                  href={selectedProduct.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-black transition-transform duration-200 hover:bg-velmere-gold active:scale-[0.98]"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {productT("openProduct")}
                </a>
              ) : (
                <button
                  type="button"
                  disabled={
                    !purchasable || !selectedVariant || ctaState !== "idle"
                  }
                  onClick={handleAddToCart}
                  className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-black transition-transform duration-200 hover:bg-velmere-gold active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/[0.10] disabled:text-white/[0.32]"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  {ctaLabel}
                </button>
              )}

              {!purchasable && !externalOnly ? (
                <p className="mt-4 rounded-lg border border-velmere-gold/[0.20] bg-velmere-gold/[0.08] p-4 text-sm leading-7 text-white/[0.66]">
                  {t("checkoutDisabledBody")}
                </p>
              ) : null}

              <div className="mt-8">
                <ProductAccordion title={t("details")}>
                  {getLocalizedString(selectedProduct.shortDescription, locale)}
                </ProductAccordion>
                <ProductAccordion title={t("shippingReturns")}>
                  {t("shippingReturnsBody")}
                </ProductAccordion>
                <ProductAccordion title={t("materialCare")}>
                  {t("materialCareBody")}
                </ProductAccordion>
              </div>
            </div>
          </aside>
        </div>
      </LuxurySection>

      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t("closeSizeGuide")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 z-[340] bg-black/[0.46] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: 80, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label={t("sizeGuideTitle")}
              className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 z-[350] max-h-[min(32rem,calc(100dvh-9rem))] w-[calc(100%-1.5rem)] max-w-[28rem] overflow-hidden rounded-[1.6rem] border border-white/[0.10] bg-[#1A1A1C] p-4 text-white shadow-[0_32px_100px_rgba(0,0,0,0.82)] backdrop-blur-xl md:bottom-auto md:right-8 md:top-28"
            >
              <button
                type="button"
                aria-label={t("closeSizeGuide")}
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] text-white/[0.54] transition-colors hover:border-white/[0.25] hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="luxury-kicker text-velmere-gold/[0.80]">
                {t("measurementTable")}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-white">
                {t("sizeGuideTitle")}
              </h2>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.10]">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/[0.14] text-[10px] uppercase tracking-[0.2em] text-white/[0.42]">
                      <th className="px-2 py-2">{t("size")}</th>
                      <th className="px-2 py-2">{t("chest")}</th>
                      <th className="px-2 py-2">{t("length")}</th>
                      <th className="px-2 py-2">{t("shoulders")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEASUREMENTS.map((row) => (
                      <tr
                        key={row.size}
                        className="border-b border-white/[0.10] text-[11px] text-white/[0.70]"
                      >
                        <td className="px-2 py-2 font-semibold text-white">
                          {row.size}
                        </td>
                        <td className="px-2 py-2">{row.chest}</td>
                        <td className="px-2 py-2">{row.length}</td>
                        <td className="px-2 py-2">{row.shoulders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!externalOnly ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.10] bg-black/[0.60] p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-2xl md:hidden">
          <button
            type="button"
            disabled={!purchasable || !selectedVariant || ctaState !== "idle"}
            onClick={handleAddToCart}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-black transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/[0.10] disabled:text-white/[0.32]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {ctaLabel}
          </button>
        </div>
      ) : null}
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-24 left-1/2 z-[140] -translate-x-1/2 rounded-full border border-velmere-gold/[0.25] bg-[#1A1A1C] px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-velmere-gold shadow-2xl backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
