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
import { buildProductProviderTruthSnapshot } from "@/lib/launch/provider-truth-ledger";
import { buildPublicCommerceTrimGate } from "@/lib/market-integrity/public-commerce-trim-gate";
import { buildPublicFirstPurchaseFlowGate } from "@/lib/market-integrity/public-first-purchase-flow-gate";
import { buildPublicAtelierTrustRibbonGate } from "@/lib/market-integrity/public-atelier-trust-ribbon-gate";
import { buildPublicCopyPolishGate } from "@/lib/market-integrity/public-copy-polish-gate";
import { buildPublicProductPathwayReceiptGate } from "@/lib/market-integrity/public-product-pathway-receipt-gate";
import { buildPublicProvenanceDropConciergeGate } from "@/lib/market-integrity/public-provenance-drop-concierge-gate";
import { buildPublicSizeConfidenceConciergeGate } from "@/lib/market-integrity/public-size-confidence-concierge-gate";

const MEASUREMENTS = [
  { size: "S", chest: "112 cm", length: "66 cm", shoulders: "58 cm" },
  { size: "M", chest: "118 cm", length: "68 cm", shoulders: "60 cm" },
  { size: "L", chest: "124 cm", length: "70 cm", shoulders: "62 cm" },
  { size: "XL", chest: "130 cm", length: "72 cm", shoulders: "64 cm" },
];

function productDetailCopy(locale: string) {
  if (locale === "pl") {
    return {
      constructionTitle: "Materiał / Konstrukcja",
      launchNoteTitle: "Status dropu",
      providerSnapshotTitle: "Status produktu",
      providerSnapshotBody: "Produkt jest w trybie preview. Sprzedaż otworzy się dopiero, gdy rozmiary, dostawa i zwroty będą jasno potwierdzone.",
      providerMissing: "Operator review",
      providerSource: "Status",
      launchKicker: "przed zakupem",
      launchTitle: "Rozmiar, materiał i dostawa — jasno.",
      launchBody: "Zakup odzieży jest prosty: najpierw produkt, potem rozmiar, dostawa i zwrot. VLM zostaje opcjonalnym benefitem, nie warunkiem zakupu.",
      rails: [
        { label: "Rozmiar", body: "Tabela mierzy produkt, nie ciało. Porównaj z bluzą, którą już nosisz." },
        { label: "Care", body: "Pierz na zimno, na lewej stronie. Suszenie na powietrzu chroni nadruk i formę." },
        { label: "Fulfillment", body: "Dostawa, podatki, provider i status produkcji muszą być jasne przed checkoutem." },
      ],
      specs: [
        ["Materiał", "100% heavyweight cotton"],
        ["Gramatura", "450 GSM"],
        ["Krój", "Boxy / oversize"],
        ["Pielęgnacja", "Zimne pranie / na lewej stronie / suszyć na powietrzu"],
      ],
    };
  }
  if (locale === "de") {
    return {
      constructionTitle: "Material / Konstruktion",
      launchNoteTitle: "Drop Status",
      providerSnapshotTitle: "Produktstatus",
      providerSnapshotBody: "Dieses Produkt ist im Preview-Modus. Verkauf öffnet erst, wenn Größen, Lieferung und Rückgaben klar bestätigt sind.",
      providerMissing: "Operator Review",
      providerSource: "Status",
      launchKicker: "vor dem Kauf",
      launchTitle: "Größe, Material und Lieferung — klar.",
      launchBody: "Clothing bleibt einfach: Produkt zuerst, dann Größe, Lieferung und Rückgabe. VLM bleibt optionaler Vorteil, keine Kaufbedingung.",
      rails: [
        { label: "Größe", body: "Die Tabelle misst das Produkt, nicht den Körper. Vergleiche mit einem Hoodie, den du bereits trägst." },
        { label: "Pflege", body: "Kalt und auf links waschen. Lufttrocknung schützt Druck und Form." },
        { label: "Fulfillment", body: "Lieferung, Steuern, Provider und Produktionsstatus müssen vor Checkout klar sein." },
      ],
      specs: [
        ["Material", "100% Heavyweight Cotton"],
        ["Gewicht", "450 GSM"],
        ["Passform", "Boxy / Oversized"],
        ["Pflege", "Kalt waschen / auf links / lufttrocknen"],
      ],
    };
  }
  return {
    constructionTitle: "Material / Construction",
    launchNoteTitle: "Drop status",
    providerSnapshotTitle: "Product status",
    providerSnapshotBody: "This product is in preview mode. Sale opens only after size, delivery and returns are clearly confirmed.",
    providerMissing: "Operator review",
    providerSource: "Status",
    launchKicker: "before purchase",
    launchTitle: "Size, material and delivery — clearly.",
    launchBody: "Clothing stays simple: product first, then size, delivery and returns. VLM remains optional, never a purchase condition.",
    rails: [
      { label: "Size", body: "The table measures the garment, not the body. Compare it with a hoodie you already wear." },
      { label: "Care", body: "Wash cold and inside out. Air drying protects print and shape." },
      { label: "Fulfillment", body: "Delivery, taxes, provider and production status must be clear before checkout." },
    ],
    specs: [
      ["Material", "100% heavyweight cotton"],
      ["Weight", "450 GSM"],
      ["Fit", "Boxy / oversized"],
      ["Care", "Cold wash / inside out / air dry"],
    ],
  };
}

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
      <main className="min-h-[100dvh] bg-velmere-black pb-28 text-white" data-pass316-public-commerce-trim="product" data-pass318-public-storefront-focus="product" data-pass319-public-first-purchase-flow="product" data-pass320-public-atelier-trust-ribbon="product" data-pass321-public-copy-polish="product" data-pass322-public-product-pathway-receipt="product" data-pass323-public-provenance-drop-concierge="product" data-pass324-public-size-confidence-concierge="product">
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
  const providerSnapshot = buildProductProviderTruthSnapshot(selectedProduct);
  const publicCommerceTrimGate = buildPublicCommerceTrimGate({ surface: "product", products: [selectedProduct], productSnapshot: providerSnapshot });
  const firstPurchaseFlow = buildPublicFirstPurchaseFlowGate({
    surface: "product",
    selectedSize: Boolean(selectedVariant),
    checkoutReady: purchasable,
    waitlistReady: !purchasable,
    dppTraceabilityReady: providerSnapshot.score >= 52,
    productProofScore: providerSnapshot.score,
    sourceConfidence: publicCommerceTrimGate.customerProofScore,
    liveWindowSeconds: purchasable ? 540 : 300,
    walletRequired: false,
    scarcityPressure: 0,
    copyDensity: "minimal",
  });
  const atelierTrustRibbon = buildPublicAtelierTrustRibbonGate({
    surface: "product",
    fitProofVisible: Boolean(selectedVariant),
    materialProofVisible: Boolean(selectedProduct.truth),
    deliveryPromiseReady: purchasable,
    returnRightsVisible: true,
    checkoutReady: purchasable,
    walletRequired: false,
    dppTraceabilityScore: providerSnapshot.score,
    sourceFreshnessSeconds: purchasable ? 540 : 300,
    scarcityPressure: 0,
    operatorCopyVisible: false,
  });
  const publicCopyPolish = buildPublicCopyPolishGate({
    surface: "product",
    passLabelsVisible: 0,
    rawScoresVisible: 0,
    operatorTermsVisible: 0,
    walletPressure: false,
    checkoutReady: purchasable,
    fitPathVisible: Boolean(selectedVariant),
    deliveryReturnVisible: true,
    dppTraceabilityScore: atelierTrustRibbon.customerTrustScore,
    mexcFreshnessSeconds: purchasable ? 540 : 300,
    scarcityPressure: 0,
  });
  const productPathwayReceipt = buildPublicProductPathwayReceiptGate({
    surface: "product",
    productVisible: true,
    fitGuideVisible: Boolean(selectedVariant),
    materialVisible: Boolean(selectedProduct.truth),
    deliveryReturnVisible: true,
    checkoutReady: purchasable,
    waitlistReady: !purchasable,
    walletRequired: false,
    operatorNoiseItems: 0,
    copyBlocksVisible: 1,
    mexcFreshnessSeconds: purchasable ? 540 : 300,
    dppTraceabilityScore: atelierTrustRibbon.customerTrustScore,
    scarcityPressure: 0,
  });
  const provenanceDropConcierge = buildPublicProvenanceDropConciergeGate({
    surface: "product",
    productPathVisible: true,
    fitVisible: Boolean(selectedVariant),
    materialVisible: Boolean(selectedProduct.truth),
    deliveryReturnVisible: true,
    checkoutReady: purchasable,
    waitlistReady: !purchasable,
    walletRequired: false,
    mexcLiveWindowSeconds: purchasable ? 540 : 300,
    dppTraceabilityScore: atelierTrustRibbon.customerTrustScore,
    receiptReady: purchasable,
    operatorNoiseItems: 0,
    scarcityPressure: 0,
  });
  const sizeConfidenceConcierge = buildPublicSizeConfidenceConciergeGate({
    surface: "product",
    garmentMeasurementsVisible: productMeasurements.length > 0,
    selectedSize: Boolean(selectedVariant),
    materialCareVisible: Boolean(selectedProduct.truth),
    deliveryReturnVisible: true,
    checkoutReady: purchasable,
    waitlistReady: !purchasable,
    walletRequired: false,
    bodyComparisonCopyVisible: false,
    mexcLiveWindowSeconds: purchasable ? 540 : 300,
    dppProductInfoScore: atelierTrustRibbon.customerTrustScore,
    operatorNoiseItems: 0,
    scarcityPressure: 0,
  });

  const title = getLocalizedString(selectedProduct.title, locale);
  const externalOnly =
    selectedProduct.fulfilmentMode === "external_link" &&
    selectedProduct.externalUrl;
  const category =
    selectedProduct.collection ?? selectedProduct.tags[0] ?? "GARMENT";
  const detailCopy = productDetailCopy(locale);
  const truth = selectedProduct.truth;
  const careLines = truth?.care.map((item) => getLocalizedString(item, locale)) ?? [];
  const productMeasurements = truth?.sizeGuide.measurements.length ? truth.sizeGuide.measurements : MEASUREMENTS;
  const productSpecs = truth
    ? [
        [detailCopy.specs[0]?.[0] ?? "Material", getLocalizedString(truth.material, locale)],
        [detailCopy.specs[1]?.[0] ?? "Weight", truth.weight ?? "TBC"],
        [detailCopy.specs[2]?.[0] ?? "Fit", getLocalizedString(truth.fit, locale)],
        [detailCopy.specs[3]?.[0] ?? "Care", careLines.join(" / ")],
      ]
    : detailCopy.specs;
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
    <main className="min-h-[100dvh] bg-velmere-black pb-28 text-white" data-pass316-public-commerce-trim="product" data-pass318-public-storefront-focus="product" data-pass319-public-first-purchase-flow="product" data-pass320-public-atelier-trust-ribbon="product" data-pass321-public-copy-polish="product" data-pass322-public-product-pathway-receipt="product" data-pass323-public-provenance-drop-concierge="product" data-pass324-public-size-confidence-concierge="product">
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
                  {detailCopy.constructionTitle}
                </p>
                {productSpecs.map(([key, value]) => (
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

              <div className="mt-4 rounded-xl border border-cyan-200/[0.12] bg-cyan-300/[0.04] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/[0.78]">{detailCopy.launchKicker}</p>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-white">{detailCopy.launchTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-white/[0.58]">{detailCopy.launchBody}</p>
                <div className="mt-4 grid gap-3">
                  {detailCopy.rails.map((rail) => (
                    <div key={rail.label} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/[0.70]">{rail.label}</p>
                      <p className="mt-2 text-xs leading-6 text-white/[0.52]">{rail.body}</p>
                    </div>
                  ))}
                  {truth?.launchNote ? (
                    <div className="rounded-lg border border-velmere-gold/[0.16] bg-velmere-gold/[0.06] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold/[0.78]">{detailCopy.launchNoteTitle}</p>
                      <p className="mt-2 text-xs leading-6 text-white/[0.56]">{getLocalizedString(truth.launchNote, locale)}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">{detailCopy.providerSnapshotTitle}</p>
                    <p className="mt-3 text-sm leading-7 text-white/[0.58]">{detailCopy.providerSnapshotBody}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.50]">
                    {publicCopyPolish.statusLine}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3" data-pass316-product-customer-signals="true">
                  {publicCommerceTrimGate.customerSignals.map((signal) => (
                    <span key={signal} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{signal}</span>
                  ))}
                </div>
              </div>


              <div className="mt-4 rounded-xl border border-velmere-gold/[0.14] bg-[linear-gradient(135deg,rgba(212,175,55,0.065),rgba(0,0,0,0.18))] p-4" data-pass322-product-pathway-receipt="true">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">Atelier product receipt</p>
                    <p className="mt-3 text-sm leading-7 text-white/[0.60]">{productPathwayReceipt.headline}</p>
                    <p className="mt-2 text-xs leading-6 text-white/[0.46]">{productPathwayReceipt.customerLine}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.50]">
                    {productPathwayReceipt.pathwayMode.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {productPathwayReceipt.receiptSteps.map((step) => (
                    <span key={step} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{step}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(212,175,55,0.045),rgba(0,0,0,0.18))] p-4" data-pass323-product-provenance-drop-concierge="true">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">Provenance concierge</p>
                    <p className="mt-3 text-sm leading-7 text-white/[0.60]">{provenanceDropConcierge.headline}</p>
                    <p className="mt-2 text-xs leading-6 text-white/[0.46]">{provenanceDropConcierge.customerLine}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.50]">
                    {provenanceDropConcierge.eliteStatus.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {provenanceDropConcierge.conciergeSteps.map((step) => (
                    <span key={step} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{step}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.10] bg-white/[0.035] p-4" data-pass319-product-purchase-constellation="true">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">Quiet first purchase</p>
                    <p className="mt-3 text-sm leading-7 text-white/[0.58]">Choose fit first. Checkout or waitlist stays calm until delivery, returns and proof are ready.</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.50]">
                    {publicCopyPolish.publicMode.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {firstPurchaseFlow.customerSteps.slice(0, 4).map((step) => (
                    <span key={step} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{step}</span>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.38]">{publicCopyPolish.statusLine}</p>
              </div>


              <div className="mt-4 rounded-xl border border-velmere-gold/[0.14] bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(255,255,255,0.025))] p-4" data-pass320-product-trust-ribbon="true">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">Atelier trust ribbon</p>
                    <p className="mt-3 text-sm leading-7 text-white/[0.58]">{atelierTrustRibbon.customerCopy}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.50]">
                    {publicCopyPolish.publicMode.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {atelierTrustRibbon.ribbonSteps.map((step) => (
                    <span key={step} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{step}</span>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.38]">{publicCopyPolish.statusLine}</p>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/[0.20] p-4" data-pass321-product-copy-polish="true">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-velmere-gold/[0.82]">Concierge proof whisper</p>
                    <p className="mt-3 text-sm leading-7 text-white/[0.58]">{publicCopyPolish.brief}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.50]">
                    {publicCopyPolish.publicMode.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {publicCopyPolish.badges.map((badge) => (
                    <span key={badge} className="rounded-lg border border-white/[0.08] bg-black/[0.18] p-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{badge}</span>
                  ))}
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
                  {truth ? `${getLocalizedString(truth.deliveryNote, locale)} ${getLocalizedString(truth.returnNote, locale)}` : t("shippingReturnsBody")}
                </ProductAccordion>
                <ProductAccordion title={t("materialCare")}>
                  {truth ? `${getLocalizedString(truth.composition, locale)} ${careLines.join(" ")}` : t("materialCareBody")}
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
                    {productMeasurements.map((row) => (
                      <tr
                        key={row.size}
                        className="border-b border-white/[0.10] text-[11px] text-white/[0.70]"
                      >
                        <td className="px-2 py-2 font-semibold text-white">
                          {row.size}
                        </td>
                        <td className="px-2 py-2">{row.chest ?? row.waist ?? "—"}</td>
                        <td className="px-2 py-2">{row.length}</td>
                        <td className="px-2 py-2">{row.shoulders ?? row.inseam ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {truth?.sizeGuide.note ? (
                <p className="mt-4 text-xs leading-6 text-white/[0.54]">{getLocalizedString(truth.sizeGuide.note, locale)}</p>
              ) : null}
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
