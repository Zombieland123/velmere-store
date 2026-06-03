import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";
import ProductionDataBackbonePanel from "@/components/launch/ProductionDataBackbonePanel";
import StorageAdapterReadinessPanel from "@/components/launch/StorageAdapterReadinessPanel";
import AccountOrderEventTimelinePanel from "@/components/launch/AccountOrderEventTimelinePanel";
import AuthGate from "@/components/auth/AuthGate";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({ locale, path: "/dashboard", title: "Dashboard — Velmère", description: "Velmère account, wallet, orders, security and profile console." });
}

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <AuthGate>
      <DashboardClient />
      <ProductionDataBackbonePanel locale={locale} surface="account" />
      <StorageAdapterReadinessPanel locale={locale} surface="account" />
      <AccountOrderEventTimelinePanel locale={locale} surface="account" />
    </AuthGate>
  );
}
