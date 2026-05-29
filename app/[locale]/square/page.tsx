import type { Metadata } from "next";
import VelmereSquareClient from "@/components/square/VelmereSquareClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Velmère Square" : locale === "de" ? "Velmère Square" : "Velmère Square";
  const description = locale === "pl"
    ? "Publiczny podgląd Square. Logowanie odblokowuje publikowanie i komentarze."
    : locale === "de"
      ? "Öffentliche Square-Vorschau. Login entsperrt Posting und Kommentare."
      : "Public Square preview. Login unlocks posting and comments.";
  return buildVelmereMetadata({ locale, path: "/square", title, description });
}

export default function SquarePage() {
  return <VelmereSquareClient />;
}
