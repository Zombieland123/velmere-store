import type { Metadata } from "next";
import VelmereSquareClient from "@/components/square/VelmereSquareClient";
import SquareVlmLaunchControl from "@/components/launch/SquareVlmLaunchControl";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/square",
    title: "Velmère Square",
    description: "A private square for signals, drops and members.",
  });
}

export default function SquarePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <VelmereSquareClient />
      <SquareVlmLaunchControl locale={locale} surface="square" />
    </>
  );
}
