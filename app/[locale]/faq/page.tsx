import type { Metadata } from "next";
import LuxurySection from "@/components/layout/LuxurySection";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/faq",
    title: "FAQ — Velmère",
    description: "Velmère FAQ for clothing orders, returns, delivery, accounts and optional VLM wallet perks.",
  });
}

export default function FaqPage({ params: { locale } }: { params: { locale: string } }) {
  const copy = locale === "pl"
    ? {
        kicker: "FAQ / OBSŁUGA",
        title: "Najważniejsze odpowiedzi przed dropem.",
        intro: "To robocza strona FAQ przed pełną aktywacją sprzedaży. Finalne dane wysyłki, zwrotów i płatności muszą zostać uzupełnione przed przyjmowaniem zamówień.",
        items: [
          ["Czy zakup wymaga portfela?", "Nie. Zakup odzieży powinien działać jako zwykły guest checkout. Portfel jest tylko opcjonalnym benefitem VLM."],
          ["Kiedy pojawią się aktywne produkty?", "Po potwierdzeniu realnych zdjęć, wariantów, cen, fulfilmentu, wysyłki, zwrotów i przeglądu prawnego."],
          ["Czy VLM jest inwestycją?", "Nie. VLM jest opisywany jako warstwa dostępu, a nie obietnica zysku, ceny, płynności lub listingu."],
        ],
      }
    : locale === "de"
      ? {
          kicker: "FAQ / SERVICE",
          title: "Wichtige Antworten vor dem Drop.",
          intro: "Arbeitsversion vor dem Verkaufsstart. Versand, Rückgaben, Zahlung und rechtliche Daten müssen vor Bestellungen finalisiert werden.",
          items: [
            ["Brauche ich eine Wallet?", "Nein. Clothing-Käufe sollen als normaler Guest Checkout funktionieren. Wallet ist nur ein optionaler VLM-Vorteil."],
            ["Wann werden Produkte aktiv?", "Nach finalen Bildern, Varianten, Preisen, Fulfilment, Versand, Rückgaben und rechtlicher Prüfung."],
            ["Ist VLM eine Investition?", "Nein. VLM ist eine Access-Schicht, keine Gewinn-, Preis-, Liquiditäts- oder Listing-Zusage."],
          ],
        }
      : {
          kicker: "FAQ / SERVICE",
          title: "Key answers before the drop.",
          intro: "Working FAQ before commercial activation. Shipping, returns, payment and legal details must be finalized before orders are accepted.",
          items: [
            ["Do I need a wallet to buy clothing?", "No. Clothing purchase should work as guest checkout. Wallet is only an optional VLM perk."],
            ["When do products go active?", "After final images, variants, prices, fulfilment, shipping, returns and legal review are confirmed."],
            ["Is VLM an investment?", "No. VLM is an access layer, not a profit, price, liquidity or listing promise."],
          ],
        };

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <p className="luxury-kicker text-velmere-gold/[0.80]">{copy.kicker}</p>
        <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">{copy.title}</h1>
        <p className="mt-6 max-w-3xl text-sm leading-7 text-white/[0.60] md:text-base">{copy.intro}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.items.map(([question, answer]) => (
            <article key={question} className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6">
              <h2 className="font-serif text-2xl text-white">{question}</h2>
              <p className="mt-4 text-sm leading-7 text-white/[0.58]">{answer}</p>
            </article>
          ))}
        </div>
      </LuxurySection>
    </main>
  );
}
