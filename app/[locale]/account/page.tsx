import type { Metadata } from "next";
import AuthGate from "@/components/auth/AuthGate";
import DashboardClient from "@/components/dashboard/DashboardClient";
import ProductionDataBackbonePanel from "@/components/launch/ProductionDataBackbonePanel";
import StorageAdapterReadinessPanel from "@/components/launch/StorageAdapterReadinessPanel";
import AccountOrderEventTimelinePanel from "@/components/launch/AccountOrderEventTimelinePanel";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/account",
    title: "Account — Velmère",
    description: "Profile, wallet, orders, and VLM access at Velmère.",
  });
}

export default function AccountPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AuthGate>
      <DashboardClient />
      <ProductionDataBackbonePanel locale={locale} surface="account" />
      <StorageAdapterReadinessPanel locale={locale} surface="account" />
      <AccountOrderEventTimelinePanel locale={locale} surface="account" />
    </AuthGate>
  );
}
