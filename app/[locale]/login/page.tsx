import { getTranslations } from "next-intl/server";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import LuxurySection from "@/components/layout/LuxurySection";
import AuthFormClient from "@/components/auth/AuthFormClient";

export default async function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Auth" });
  const steps = [
    { icon: UserRound, label: t("email") },
    { icon: KeyRound, label: t("password") },
    { icon: ShieldCheck, label: t("pendingActivation") },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#080809] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(212,175,55,0.10),transparent_28%),radial-gradient(circle_at_84%_14%,rgba(255,255,255,0.05),transparent_26%)]" />
      <LuxurySection className="relative z-[1] py-28 md:py-40">
        <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <div className="rounded-[2.5rem] border border-white/10 bg-[#1A1A1C] p-8 shadow-[0_34px_110px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-10">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p><h1 className="mt-6 font-serif text-5xl leading-[0.92] text-white md:text-6xl">{t("login")}</h1><p className="mt-6 text-sm leading-7 text-white/60">{t("pendingActivation")}</p>
            <div className="mt-8 grid gap-3">{steps.map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"><Icon className="h-4 w-4 text-velmere-gold" aria-hidden="true" /><span className="text-xs leading-6 text-white/58">{label}</span></div>)}</div>
          </div>
          <AuthFormClient labels={{ email: t("email"), password: t("password"), signIn: t("signIn") }} />
        </section>
      </LuxurySection>
    </main>
  );
}
