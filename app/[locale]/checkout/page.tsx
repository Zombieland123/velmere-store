import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import LuxurySection from "@/components/layout/LuxurySection";
import { Link } from "@/navigation";
import { buildPublicLaunchSurfaceGate } from "@/lib/market-integrity/public-launch-surface-gate";
import { buildPublicFirstPurchaseFlowGate } from "@/lib/market-integrity/public-first-purchase-flow-gate";
import { buildPublicAtelierTrustRibbonGate } from "@/lib/market-integrity/public-atelier-trust-ribbon-gate";
import { buildPublicCopyPolishGate } from "@/lib/market-integrity/public-copy-polish-gate";
import { buildPublicProductPathwayReceiptGate } from "@/lib/market-integrity/public-product-pathway-receipt-gate";
import { buildPublicProvenanceDropConciergeGate } from "@/lib/market-integrity/public-provenance-drop-concierge-gate";
import { buildPublicSizeConfidenceConciergeGate } from "@/lib/market-integrity/public-size-confidence-concierge-gate";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Checkout — kontrola startu" : locale === "de" ? "Checkout — Launch-Kontrolle" : "Checkout — Launch Control";
  const description = locale === "pl"
    ? "Checkout Velmère pozostaje zablokowany do czasu produkcyjnego potwierdzenia płatności, podatków, dostawy i zwrotów."
    : locale === "de"
      ? "Velmère Checkout bleibt gesperrt, bis Zahlung, Steuern, Versand und Rückgaben produktiv bestätigt sind."
      : "Velmère checkout remains blocked until payment, tax, shipping and return flows are production verified.";

  return buildVelmereMetadata({ locale, path: "/checkout", title, description });
}

const copy = {
  pl: {
    kicker: "checkout / launch control",
    title: "Checkout nie jest jeszcze publicznie aktywny.",
    body: "Płatność zostaje zablokowana do momentu, aż provider, podatki, koszty dostawy, potwierdzenie zamówienia i zwroty będą produkcyjnie sprawdzone. To chroni klienta przed fałszywą gotowością sklepu.",
    matrixKicker: "bezpieczny start",
    matrixTitle: "Najpierw potwierdzimy produkt, dostawę i zwrot.",
    matrix: [
      ["Provider", "Printful/Contrado/Tapstitch muszą mieć prawdziwy status produktu i koszt dostawy."],
      ["Płatność", "Stripe/checkout musi zwracać order event, receipt i bezpieczny fallback."],
      ["Dostawa", "Czas, region i cena nie mogą być zgadywane przez UI."],
      ["Zwroty", "Klient musi widzieć jasną politykę przed zapłatą."],
    ],
  },
  de: {
    kicker: "checkout / launch control",
    title: "Checkout ist noch nicht öffentlich aktiv.",
    body: "Zahlung bleibt gesperrt, bis Provider, Steuern, Versandkosten, Bestellbestätigung und Rückgaben produktiv geprüft sind. Das schützt Kundinnen und Kunden vor falscher Shop-Bereitschaft.",
    matrixKicker: "sicherer start",
    matrixTitle: "Zuerst bestätigen wir Produkt, Lieferung und Rückgabe.",
    matrix: [
      ["Provider", "Printful/Contrado/Tapstitch brauchen echten Produktstatus und Versandkosten."],
      ["Zahlung", "Stripe/Checkout muss Order Event, Receipt und sicheren Fallback liefern."],
      ["Versand", "Zeit, Region und Preis dürfen nicht vom UI geraten werden."],
      ["Rückgaben", "Kundinnen und Kunden müssen die klare Policy vor Zahlung sehen."],
    ],
  },
  en: {
    kicker: "checkout / launch control",
    title: "Checkout is not publicly active yet.",
    body: "Payment stays blocked until provider, taxes, shipping costs, order confirmation and returns are production verified. This protects customers from a false-ready store.",
    matrixKicker: "safe launch",
    matrixTitle: "First we confirm product, delivery and returns.",
    matrix: [
      ["Provider", "Printful/Contrado/Tapstitch need real product status and shipping cost truth."],
      ["Payment", "Stripe/checkout must return order event, receipt and safe fallback."],
      ["Shipping", "Time, region and price must not be guessed by the UI."],
      ["Returns", "The customer must see a clear policy before payment."],
    ],
  },
} as const;

function localeCopy(locale: string) {
  if (locale === "pl" || locale === "de") return copy[locale];
  return copy.en;
}

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = localeCopy(locale);
  const publicLaunchGate = buildPublicLaunchSurfaceGate({ surface: "checkout", locale });
  const firstPurchaseFlow = buildPublicFirstPurchaseFlowGate({
    surface: "checkout",
    selectedSize: false,
    checkoutReady: false,
    waitlistReady: true,
    dppTraceabilityReady: true,
    productProofScore: 60,
    sourceConfidence: 70,
    liveWindowSeconds: 360,
    walletRequired: false,
    scarcityPressure: 0,
    copyDensity: "minimal",
  });
  const atelierTrustRibbon = buildPublicAtelierTrustRibbonGate({
    surface: "checkout",
    fitProofVisible: false,
    materialProofVisible: true,
    deliveryPromiseReady: false,
    returnRightsVisible: true,
    checkoutReady: false,
    walletRequired: false,
    dppTraceabilityScore: 64,
    sourceFreshnessSeconds: 360,
    scarcityPressure: 0,
    operatorCopyVisible: false,
  });
  const publicCopyPolish = buildPublicCopyPolishGate({
    surface: "checkout",
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
    surface: "checkout",
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
    surface: "checkout",
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
    surface: "checkout",
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
    <main className="min-h-[100dvh] bg-velmere-black text-white" data-pass317-public-launch-surface="checkout" data-pass318-public-storefront-focus="checkout" data-pass319-public-first-purchase-flow="checkout" data-pass320-public-atelier-trust-ribbon="checkout" data-pass321-public-copy-polish="checkout" data-pass322-public-product-pathway-receipt="checkout" data-pass323-public-provenance-drop-concierge="checkout" data-pass324-public-size-confidence-concierge="checkout">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/[0.10] bg-white/[0.04] p-6 text-center shadow-velmere-card md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08]">
            <ShieldAlert className="h-7 w-7 text-velmere-gold" aria-hidden="true" />
          </div>
          <p className="luxury-kicker mt-6 text-velmere-gold/[0.80]">{t.kicker}</p>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/[0.58]">{t.body}</p>
          <div className="pass317-public-surface-brief mx-auto mt-6 max-w-xl rounded-2xl border border-white/[0.08] bg-black/[0.20] p-4 text-left">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">{publicLaunchGate.customerLabel}</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.56]">{publicLaunchGate.customerSummary}</p>
          </div>
          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-velmere-gold/[0.12] bg-velmere-gold/[0.055] p-4 text-left" data-pass319-checkout-proof-gate="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">proof-gated checkout</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.56]">{publicCopyPolish.brief}</p>
          </div>

          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/[0.10] bg-white/[0.035] p-4 text-left" data-pass320-checkout-trust-ribbon="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Atelier trust ribbon</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.56]">{atelierTrustRibbon.customerCopy}</p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.38]">{publicCopyPolish.statusLine}</p>
          </div>

          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-velmere-gold/[0.12] bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(0,0,0,0.18))] p-4 text-left" data-pass322-checkout-product-pathway-receipt="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Atelier product receipt</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.58]">{productPathwayReceipt.customerLine}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {productPathwayReceipt.receiptSteps.slice(0, 4).map((step) => (
                <span key={step} className="rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.52]">{step}</span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(212,175,55,0.045),rgba(0,0,0,0.18))] p-4 text-left" data-pass323-checkout-provenance-drop-concierge="true">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">Provenance concierge</p>
            <p className="mt-2 text-xs leading-6 text-white/[0.58]">{provenanceDropConcierge.customerLine}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {provenanceDropConcierge.conciergeSteps.slice(0, 4).map((step) => (
                <span key={step} className="rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.52]">{step}</span>
              ))}
            </div>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/shop" className="velmere-button-secondary">Return to shop</Link>
            <Link href="/contact" className="velmere-button-primary">Join waitlist</Link>
          </div>
        </section>
      </LuxurySection>
      <section className="mx-auto max-w-7xl px-6 pb-8 md:px-12">
        <div className="rounded-[2rem] border border-velmere-gold/[0.12] bg-[linear-gradient(145deg,rgba(212,175,55,0.055),rgba(255,255,255,0.025),rgba(0,0,0,0.18))] p-6 md:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">{t.matrixKicker}</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.04em] text-white md:text-5xl">{t.matrixTitle}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {t.matrix.map(([label, value]) => (
                <article key={label} className="rounded-[1.35rem] border border-white/[0.08] bg-black/[0.22] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">{label}</p>
                  <p className="mt-3 text-xs leading-6 text-white/[0.56]">{value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
