import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    title: "Velmère — Luxury Streetwear",
    description: "Luxury streetwear with a private digital layer.",
  });
}

export default function HomePage() {
  return <HomePageClient />;
}
