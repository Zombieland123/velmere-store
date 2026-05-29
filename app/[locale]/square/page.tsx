import type { Metadata } from "next";
import VelmereSquareClient from "@/components/square/VelmereSquareClient";
import AuthGate from "@/components/auth/AuthGate";
import TokenGate from "@/components/ui/TokenGate";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Velmère Square" : locale === "de" ? "Velmère Square" : "Velmère Square";
  const description = locale === "pl"
    ? "Community feed Velmère dla zalogowanych memberów, dropów i sygnałów atelier."
    : locale === "de"
      ? "Velmère Community Feed für eingeloggte Member, Drops und Atelier-Signale."
      : "Velmère community feed for signed-in members, drops, and atelier signals.";
  return buildVelmereMetadata({ locale, path: "/square", title, description });
}

export default function SquarePage() {
  return (
    <AuthGate title="VELMÈRE SQUARE LOCKED" body="Square opens after login, registration, or wallet connection. Connect to enter the social exchange feed.">
      <TokenGate>
        <VelmereSquareClient />
      </TokenGate>
    </AuthGate>
  );
}
