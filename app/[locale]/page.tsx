import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/lib/seo/metadata";
import HomePageClient from "@/components/home/HomePageClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    title: "Velmère — Luxury Streetwear",
    description: "Luxury streetwear with a private digital layer.",
  });
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
    notFound();
  }

  unstable_setRequestLocale(locale);
  return <HomePageClient />;
}
