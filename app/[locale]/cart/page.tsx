"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import LuxurySection from "@/components/layout/LuxurySection";
import { useCart } from "@/components/CartProvider";
import { buildPublicLaunchSurfaceGate } from "@/lib/market-integrity/public-launch-surface-gate";
import { buildPublicFirstPurchaseFlowGate } from "@/lib/market-integrity/public-first-purchase-flow-gate";
import { buildPublicAtelierTrustRibbonGate } from "@/lib/market-integrity/public-atelier-trust-ribbon-gate";
import { buildPublicCopyPolishGate } from "@/lib/market-integrity/public-copy-polish-gate";
import { buildPublicProductPathwayReceiptGate } from "@/lib/market-integrity/public-product-pathway-receipt-gate";
import { buildPublicProvenanceDropConciergeGate } from "@/lib/market-integrity/public-provenance-drop-concierge-gate";
import { buildPublicSizeConfidenceConciergeGate } from "@/lib/market-integrity/public-size-confidence-concierge-gate";

export default function CartPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations("Cart");
  const { openCart } = useCart();
  const publicLaunchGate = buildPublicLaunchSurfaceGate({ surface: "cart", locale });
  const firstPurchaseFlow = buildPublicFirstPurchaseFlowGate({
    surface: "cart",
    selectedSize: false,
    checkoutReady: false,
    waitlistReady: true,
    dppTraceabilityReady: true,
    productProofScore: 62,
    sourceConfidence: 68,
    liveWindowSeconds: 360,
    walletRequired: false,
    scarcityPressure: 0,
    copyDensity: "minimal",
  });
  const atelierTrustRibbon = buildPublicAtelierTrustRibbonGate({
    surface: "cart",
    fitProofVisible: false,
    materialProofVisible: true,
    deliveryPromiseReady: false,
    returnRightsVisible: true,
    checkoutReady: false,
    walletRequired: false,
    dppTraceabilityScore: 62,
    sourceFreshnessSeconds: 360,
    scarcityPressure: 0,
    operatorCopyVisible: false,
  });
  const publicCopyPolish = buildPublicCopyPolishGate({
    surface: "cart",
    passLabelsVisible: 0,
    rawScoresVisible: 0,
    operatorTermsVisible: 0,
    walletPressure: false,
    checkoutReady: false,
    fitPathVisible: false,
    deliveryReturnVisible: true,
    dppTraceabilityScore: atelierTrustRibbon.customerTrustScore,
    mexcFreshnessSeconds: 360,
    scarcityPressure: 0,
  });
  const productPathwayReceipt = buildPublicProductPathwayReceiptGate({
    surface: "cart",
    productVisible: false,
    fitGuideVisible: false,
    materialVisible: true,
    deliveryReturnVisible: true,
    checkoutReady: false,
    waitlistReady: true,
    walletRequired: false,
    operatorNoiseItems: 0,
    copyBlocksVisible: 1,
    mexcFreshnessSeconds: 360,
    dppTraceabilityScore: atelierTrustRibbon.customerTrustScore,
    scarcityPressure: 0,
  });
  const provenanceDropConcierge = buildPublicProvenanceDropConciergeGate({
    surface: "cart",
    productPathVisible: false,
    fitVisible: false,
    materialVisible: true,
    deliveryReturnVisible: true,
    checkoutReady: false,
    waitlistReady: true,
    walletRequired: false,
    mexcLiveWindowSeconds: 360,
    dppTraceabilityScore: atelierTrustRibbon.customerTrustScore,
    receiptReady: false,
    operatorNoiseItems: 0,
    scarcityPressure: 0,
  });
  const sizeConfidenceConcierge = buildPublicSizeConfidenceConciergeGate({
    surface: "cart",
    garmentMeasurementsVisible: false,
    selectedSize: false,
    materialCareVisible: true,
    deliveryReturnVisible: true,
    checkoutReady: false,
    waitlistReady: true,
    walletRequired: false,
    bodyComparisonCopyVisible: false,
    mexcLiveWindowSeconds: 360,
    dppProductInfoScore: atelierTrustRibbon.customerTrustScore,
    operatorNoiseItems: 0,
    scarcityPressure: 0,
  });


  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white" data-pass317-public-launch-surface="cart" data-pass318-public-storefront-focus="cart" data-pass319-public-first-purchase-flow="cart" data-pass320-public-atelier-trust-ribbon="cart" data-pass321-public-copy-polish="cart" data-pass322-public-product-pathway-receipt="cart" data-pass323-public-provenance-drop-concierge="cart" data-pass324-public-size-confidence-concierge="cart">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-2xl rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 text-center md:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035]">
            <ShoppingBag className="h-7 w-7 text-white/[0.42]" aria-hidden="true" />
          </div>
          <p className="luxury-kicker mt-6 text-velmere-gold/[0.80]">{t("kicker")}</p>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{t("title")}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/[0.56]">{t("checkoutUnavailable")}</p>
          <div className="pass317-public-surface-brief mt-5 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-4 text-left">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">{publicLaunchGate.customerLabel}</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.56]">{publicLaunchGate.customerSummary}</p>
          </div>
          <div className="mt-4 rounded-2xl border border-velmere-gold/[0.12] bg-velmere-gold/[0.055] p-4 text-left" data-pass319-cart-quiet-review="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">quiet cart review</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.56]">First purchase stays fit-first and proof-gated: {publicCopyPolish.statusLine}.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.10] bg-white/[0.035] p-4 text-left" data-pass320-cart-trust-ribbon="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Atelier trust ribbon</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.56]">{atelierTrustRibbon.customerCopy}</p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.38]">{publicCopyPolish.statusLine}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-velmere-gold/[0.12] bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(0,0,0,0.18))] p-4 text-left" data-pass322-cart-product-pathway-receipt="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Atelier product receipt</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.58]">{productPathwayReceipt.customerLine}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {productPathwayReceipt.receiptSteps.slice(0, 4).map((step) => (
                <span key={step} className="rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.52]">{step}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(212,175,55,0.045),rgba(0,0,0,0.18))] p-4 text-left" data-pass323-cart-provenance-drop-concierge="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Provenance concierge</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.58]">{provenanceDropConcierge.customerLine}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {provenanceDropConcierge.conciergeSteps.slice(0, 4).map((step) => (
                <span key={step} className="rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.52]">{step}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-velmere-gold"
          >
            {t("openCart")}
          </button>
        </section>
      </LuxurySection>
    </main>
  );
}
