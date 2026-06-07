import type { Metadata } from "next";
// PASS316 public commerce trim: launch-control panels stay out of customer routes; operator controls belong in admin/guard surfaces.
import ShopPageClient from "@/components/shop/ShopPageClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Sklep — Velmère" : locale === "de" ? "Shop — Velmère" : "Shop — Velmère";
  const description = locale === "pl"
    ? "Limitowane produkty Velmère, cięższe sylwetki i spokojna estetyka premium."
    : locale === "de"
      ? "Limitierte Velmère Produkte, schwere Silhouetten und ruhige Premium-Ästhetik."
      : "Limited Velmère pieces, heavier silhouettes, and a restrained premium aesthetic.";
  return buildVelmereMetadata({ locale, path: "/shop", title, description });
}

export default function ShopPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <ShopPageClient />
    </>
  );
}
