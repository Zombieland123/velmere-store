import type { Metadata } from "next";
import { Suspense } from "react";
import VlmAccessGatePage from "@/components/vlm/VlmAccessGatePage";
import SquareVlmLaunchControl from "@/components/launch/SquareVlmLaunchControl";
import FullSurfaceReadinessIndex from "@/components/launch/FullSurfaceReadinessIndex";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/vlm-token",
    title: "VLM Access Layer — Velmère",
    description: "VLM access utility, wallet safety, contract status and risk notice.",
  });
}

export default function VlmTokenPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <Suspense fallback={null}>
        <VlmAccessGatePage />
      </Suspense>
      <SquareVlmLaunchControl locale={locale} surface="vlm" />
      <FullSurfaceReadinessIndex locale={locale} surface="vlm" />
    </>
  );
}
