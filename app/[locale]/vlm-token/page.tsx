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

export default function VlmTokenPage() {
  return (
    <Suspense fallback={null}>
      <VlmAccessGatePage />
    </Suspense>
  );
}
