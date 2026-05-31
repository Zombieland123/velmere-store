import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import AuthFormClient from "@/components/auth/AuthFormClient";
import LoginSecurityVisual from "@/components/auth/LoginSecurityVisual";
import { Link } from "@/navigation";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

const loginCopy = {
  en: {
    returnHome: "Return home",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    privateAccount: "Private account",
    title: "Sign in.",
    body: "Account first. Wallet optional. No seed phrases.",
    googlePreview: "Google preview",
    notLive: "Not live",
    emailAccess: "email access",
    createAccount: "Create account",
    alreadyHave: "Already have an account?",
    forgotPassword: "Forgot password?",
    previewNotice: "Preview mode only. Production auth requires Google OAuth keys, server sessions and final legal copy.",
    minimumPassword: "Minimum 8 characters",
    emailError: "Enter a valid email address.",
    passwordError: "Password must contain at least 8 characters.",
    walletRequired: "Connect a wallet before creating a member account for VLM and Square features.",
  },
  pl: {
    returnHome: "Wróć na stronę główną",
    email: "E-mail",
    password: "Hasło",
    signIn: "Zaloguj się",
    privateAccount: "Prywatne konto",
    title: "Zaloguj się.",
    body: "Najpierw konto. Portfel opcjonalnie. Nigdy seed phrase.",
    googlePreview: "Podgląd Google",
    notLive: "Nieaktywne",
    emailAccess: "dostęp e-mail",
    createAccount: "Utwórz konto",
    alreadyHave: "Masz już konto?",
    forgotPassword: "Nie pamiętasz hasła?",
    previewNotice: "Tryb podglądu. Produkcyjne logowanie wymaga kluczy Google OAuth, sesji serwera i finalnych tekstów prawnych.",
    minimumPassword: "Minimum 8 znaków",
    emailError: "Wpisz poprawny adres e-mail.",
    passwordError: "Hasło musi mieć minimum 8 znaków.",
    walletRequired: "Podłącz portfel przed utworzeniem konta membera dla funkcji VLM i Square.",
  },
  de: {
    returnHome: "Zur Startseite",
    email: "E-Mail",
    password: "Passwort",
    signIn: "Einloggen",
    privateAccount: "Privates Konto",
    title: "Einloggen.",
    body: "Zuerst Account. Wallet optional. Keine Seed Phrase.",
    googlePreview: "Google-Vorschau",
    notLive: "Nicht live",
    emailAccess: "E-Mail-Zugang",
    createAccount: "Konto erstellen",
    alreadyHave: "Schon ein Konto?",
    forgotPassword: "Passwort vergessen?",
    previewNotice: "Nur Vorschau. Produktion erfordert Google-OAuth-Schlüssel, Server-Sessions und finale Rechtstexte.",
    minimumPassword: "Mindestens 8 Zeichen",
    emailError: "Gib eine gültige E-Mail-Adresse ein.",
    passwordError: "Das Passwort muss mindestens 8 Zeichen haben.",
    walletRequired: "Verbinde ein Wallet, bevor du ein Member-Konto für VLM- und Square-Funktionen erstellst.",
  },
} as const;

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/login",
    title: "Login — Velmère",
    description: "Enter the private Velmère layer with account access and optional wallet binding.",
  });
}

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const copy = loginCopy[locale as keyof typeof loginCopy] ?? loginCopy.en;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-velmere-black text-velmere-ivory">
      <section className="luxury-section pt-28 md:pt-32">
        <div className="grid gap-6 pb-20 lg:grid-cols-[0.82fr_0.92fr] lg:items-stretch">
          <section className="rounded-[2rem] border border-white/[0.10] bg-[#0B0B0D] p-6 shadow-velmere-card md:p-8">
            <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/[0.45] transition hover:text-velmere-gold">
              <ArrowLeft className="h-4 w-4" /> {copy.returnHome}
            </Link>
            <div className="mt-6">
              <LoginSecurityVisual />
            </div>
          </section>

          <AuthFormClient labels={copy} />
        </div>
      </section>
    </main>
  );
}
