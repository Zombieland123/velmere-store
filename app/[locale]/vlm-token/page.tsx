import type { Metadata } from "next";
import { Suspense } from "react";
import VlmAccessGatePage from "@/components/vlm/VlmAccessGatePage";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/vlm-token",
    title: "VLM Access Layer — Velmère",
    description: "VLM access utility, wallet safety, contract status and risk notice.",
  });
}

// PASS318 route removal: operator panels are removed from public customer DOM.
export default function VlmTokenPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <Suspense fallback={null}>
        <VlmAccessGatePage />
      </Suspense>
    </>
  );
}
