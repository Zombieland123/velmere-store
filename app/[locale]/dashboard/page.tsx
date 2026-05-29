import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({ locale, path: "/dashboard", title: "Dashboard — Velmère", description: "Velmère account, wallet, orders, security and profile console." });
}

export default function DashboardPage() {
  return <DashboardClient />;
}
