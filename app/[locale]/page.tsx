import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Velmère — luksusowy streetwear" : locale === "de" ? "Velmère — Luxury Streetwear" : "Velmère — Luxury Streetwear";
  const description = locale === "pl"
    ? "Limitowane dropy, spokojny lookbook i dostęp VLM w estetyce ciemnego luksusu."
    : locale === "de"
      ? "Limitierte Drops, ruhiger Lookbook und VLM Access in Dark-Luxury-Ästhetik."
      : "Limited drops, a restrained lookbook, and VLM access in a dark luxury aesthetic.";
  return buildVelmereMetadata({ locale, title, description });
}

export default function HomePage() {
  return <HomePageClient />;
}
