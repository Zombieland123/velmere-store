import type { Metadata } from "next";
import VlmAccessGatePage from "@/components/vlm/VlmAccessGatePage";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "VLM Token — dostęp Velmère" : locale === "de" ? "VLM Token — Velmère Access" : "VLM Token — Velmère Access";
  const description = locale === "pl"
    ? "Architektura dostępu VLM, portfele i roadmap kontraktu bez logiki transakcyjnej."
    : locale === "de"
      ? "VLM Access Architektur, Wallets und Contract Roadmap ohne Transaktionslogik."
      : "VLM access architecture, wallets, and contract roadmap without transaction logic.";
  return buildVelmereMetadata({ locale, path: "/vlm-token", title, description });
}

export default function VlmTokenPage() {
  return <VlmAccessGatePage />;
}
