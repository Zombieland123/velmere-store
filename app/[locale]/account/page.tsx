import type { Metadata } from "next";
import AuthGate from "@/components/auth/AuthGate";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/account",
    title: "Account — Velmère",
    description: "Profile, wallet, orders, and VLM access at Velmère.",
  });
}

export default function AccountPage() {
  return (
    <AuthGate>
      <DashboardClient />
    </AuthGate>
  );
}
