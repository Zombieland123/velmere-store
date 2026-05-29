import type { Metadata } from "next";
import AngelTeaser from "@/components/angel/AngelTeaser";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/ui/CommandPalette";
import GlobalTerminalTicker from "@/components/ui/GlobalTerminalTicker";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import Web3Provider from "@/components/wallet/Web3Provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { buildVelmereMetadata, SUPPORTED_LOCALES } from "@/lib/seo/metadata";

const LOCALES = SUPPORTED_LOCALES;

export const dynamic = "force-dynamic";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  const title =
    locale === "pl"
      ? "Velmère — luksusowy streetwear"
      : locale === "de"
        ? "Velmère — Luxury Streetwear"
        : "Velmère — Luxury Streetwear";
  const description =
    locale === "pl"
      ? "Limitowane dropy, lookbook i dostęp VLM w spokojnej estetyce ciemnego luksusu."
      : locale === "de"
        ? "Limitierte Drops, Lookbook und VLM Access in ruhiger Dark-Luxury-Ästhetik."
        : "Limited drops, lookbook, and VLM access in a restrained dark luxury aesthetic.";

  return buildVelmereMetadata({ locale, title, description });
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Web3Provider>
        <CartProvider>
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <CookieConsent />
          <CartDrawer />
          <AngelTeaser />
          <CommandPalette />
          <GlobalTerminalTicker />
        </CartProvider>
      </Web3Provider>
    </NextIntlClientProvider>
  );
}
