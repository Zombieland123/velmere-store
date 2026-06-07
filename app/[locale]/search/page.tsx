import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import VelmereIntelligenceSearchClient from "@/components/search/VelmereIntelligenceSearchClient";
import { buildVelmereMetadata, SUPPORTED_LOCALES } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/search",
    title: "Velmère Lens",
    description: "A controlled Velmère Lens layer for compact token capsules, source confidence and shortcuts to full Shield analysis."
  });
}

export default function VelmereSearchPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { query?: string; q?: string };
}) {
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) notFound();
  unstable_setRequestLocale(locale);

  return (
    <VelmereIntelligenceSearchClient
      locale={locale}
      initialQuery={searchParams?.query || searchParams?.q || ""}
    />
  );
}

// PASS179 public UX marker: TokenMetadataProviderPanel remains available but is no longer rendered on the public Lens page.
