import type { Metadata } from "next";
import VelmereSquareClient from "@/components/square/VelmereSquareClient";
import TokenGate from "@/components/ui/TokenGate";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Velmère Square — społeczność" : locale === "de" ? "Velmère Square — Community" : "Velmère Square — Community";
  const description = locale === "pl"
    ? "Community feed Velmère dla dropów, notatek dostępu i sygnałów atelier."
    : locale === "de"
      ? "Velmère Community Feed für Drops, Access-Notizen und Atelier-Signale."
      : "Velmère community feed for drops, access notes, and atelier signals.";
  return buildVelmereMetadata({ locale, path: "/square", title, description });
}

export default function SquarePage() {
  return <TokenGate><VelmereSquareClient /></TokenGate>;
}
