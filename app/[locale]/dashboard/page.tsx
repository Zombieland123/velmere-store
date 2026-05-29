import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";
import AuthGate from "@/components/auth/AuthGate";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({ locale, path: "/dashboard", title: "Dashboard — Velmère", description: "Velmère account, wallet, orders, security and profile console." });
}

export default function DashboardPage() {
  return (
    <AuthGate title="DASHBOARD ACCESS LOCKED" body="Account console, wallet assets, security settings and order history open after login or registration. Wallet binding is optional after entry.">
      <DashboardClient />
    </AuthGate>
  );
}
