import type { Metadata } from "next";
import AngelTeaser from "@/components/angel/AngelTeaser";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import FilmGrain from "@/components/ui/FilmGrain";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const LOCALES = ["pl", "en", "de"] as const;

export const dynamic = "force-dynamic";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  const title =
    locale === "pl"
      ? "Velmère - luksusowy streetwear"
      : locale === "de"
        ? "Velmère - Luxury Streetwear"
        : "Velmère - Luxury Streetwear";
  const description =
    locale === "pl"
      ? "Limitowane dropy, lookbook i dostęp VLM w spokojnej estetyce ciemnego luksusu."
      : locale === "de"
        ? "Limitierte Drops, Lookbook und VLM Access in ruhiger Dark-Luxury-Ästhetik."
        : "Limited drops, lookbook, and VLM access in a restrained dark luxury aesthetic.";

  return {
    title,
    description,
    metadataBase: new URL("https://velmere-store1.vercel.app"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        pl: "/pl",
        en: "/en",
        de: "/de",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: "Velmère",
      locale,
      type: "website",
    },
  };
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
      <CartProvider>
        <FilmGrain />
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <CookieConsent />
        <CartDrawer />
        <AngelTeaser />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
