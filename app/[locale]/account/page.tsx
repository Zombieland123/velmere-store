import type { Metadata } from "next";
import AuthGate from "@/components/auth/AuthGate";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const title = locale === "pl" ? "Konto — Velmère" : locale === "de" ? "Account — Velmère" : "Account — Velmère";
  const description = locale === "pl"
    ? "Profil, portfel, zamówienia i dostęp VLM w Velmère."
    : locale === "de"
      ? "Profil, Wallet, Bestellungen und VLM Access bei Velmère."
      : "Profile, wallet, orders, and VLM access at Velmère.";
  return buildVelmereMetadata({ locale, path: "/account", title, description });
}

export default function AccountPage() {
  return (
    <AuthGate title="ACCOUNT ACCESS LOCKED" body="Log in or create an account to manage profile, avatar, password, orders and optional Web3 bindings.">
      <DashboardClient />
    </AuthGate>
  );
}
