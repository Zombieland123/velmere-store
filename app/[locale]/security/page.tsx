import type { Metadata } from "next";
import SecurityTrustPage from "@/components/security/SecurityTrustPage";

export const metadata: Metadata = {
  title: "Velmère Security",
  description: "Security-first architecture, API Abuse Shield, rate limits, admin gate, event ledger and safe export boundaries for Velmère.",
};

export default function SecurityPage({ params: { locale } }: { params: { locale: string } }) {
  return <SecurityTrustPage locale={locale} />;
}
