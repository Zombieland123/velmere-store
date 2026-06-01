import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import MarketIntegrityClient from "@/components/market-integrity/MarketIntegrityClient";
import { marketIntegrityDemoResults } from "@/lib/market-integrity/demo-tokens";
import { buildVelmereMetadata, SUPPORTED_LOCALES } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/market-integrity",
    title: "Velmère Shield — Market Integrity Radar",
    description: "Automated Web3 market-integrity risk signals for token anomalies, liquidity warnings and manipulation-risk patterns.",
  });
}

export default function MarketIntegrityPage({ params: { locale } }: { params: { locale: string } }) {
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) notFound();
  unstable_setRequestLocale(locale);

  return <MarketIntegrityClient demoResults={marketIntegrityDemoResults} />;
}
