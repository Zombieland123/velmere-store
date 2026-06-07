import type { Metadata } from "next";
// PASS316 public commerce trim: launch-control panels stay out of customer routes; operator controls belong in admin/guard surfaces.
import ShopPageClient from "@/components/shop/ShopPageClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Clothing — Velmère" : locale === "de" ? "Clothing — Velmère" : "Clothing — Velmère";
  const description = locale === "pl"
    ? "Sekcja clothing Velmère: limitowane sylwetki, przejrzyste produkty, dostawa i zwroty przed płatnością."
    : locale === "de"
      ? "Velmère Clothing: limitierte Silhouetten, klare Produktseiten, Lieferung und Rückgaben vor der Zahlung."
      : "Velmère clothing: limited silhouettes, clear product pages, delivery and returns before payment.";
  return buildVelmereMetadata({ locale, path: "/clothing", title, description });
}

export default function ClothingPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <ShopPageClient />
    </>
  );
}
