import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import CommerceLaunchControl from "@/components/launch/CommerceLaunchControl";
import ProviderTruthLedgerPanel from "@/components/launch/ProviderTruthLedgerPanel";
import ShippingReturnsTruthPanel from "@/components/launch/ShippingReturnsTruthPanel";
import PaymentOrderReadinessPanel from "@/components/launch/PaymentOrderReadinessPanel";
import OrderEventLedgerPanel from "@/components/launch/OrderEventLedgerPanel";
import LuxurySection from "@/components/layout/LuxurySection";
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
    matrixKicker: "co musi być gotowe",
    matrixTitle: "Start sklepu to operacja, nie sam przycisk płatności.",
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
    matrixKicker: "was bereit sein muss",
    matrixTitle: "Shop-Launch ist eine Operation, nicht nur ein Zahlungsbutton.",
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
    matrixKicker: "what must be ready",
    matrixTitle: "Store launch is an operation, not just a payment button.",
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

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/[0.10] bg-white/[0.04] p-6 text-center shadow-velmere-card md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08]">
            <ShieldAlert className="h-7 w-7 text-velmere-gold" aria-hidden="true" />
          </div>
          <p className="luxury-kicker mt-6 text-velmere-gold/[0.80]">{t.kicker}</p>
          <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/[0.58]">{t.body}</p>
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
      <CommerceLaunchControl locale={locale} surface="checkout" />
      <ProviderTruthLedgerPanel locale={locale} surface="checkout" />
      <ShippingReturnsTruthPanel locale={locale} surface="checkout" />
      <PaymentOrderReadinessPanel locale={locale} surface="checkout" />
      <OrderEventLedgerPanel locale={locale} surface="checkout" />
    </main>
  );
}
