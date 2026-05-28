import { getTranslations } from "next-intl/server";
import { KeyRound, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import LuxurySection from "@/components/layout/LuxurySection";

export default async function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Auth" });

  const steps = [
    { icon: UserRound, label: t("email") },
    { icon: KeyRound, label: t("password") },
    { icon: ShieldCheck, label: t("pendingActivation") },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-velmere-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(212,175,55,0.12),transparent_28%),radial-gradient(circle_at_84%_14%,rgba(255,255,255,0.06),transparent_26%)]" />
      <LuxurySection className="relative z-[1] py-28 md:py-40">
        <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_34px_110px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-10">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
            <h1 className="mt-6 font-serif text-5xl leading-[0.92] text-white md:text-6xl">{t("login")}</h1>
            <p className="mt-6 text-sm leading-7 text-white/60">{t("pendingActivation")}</p>
            <div className="mt-8 grid gap-3">
              {steps.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <Icon className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
                  <span className="text-xs leading-6 text-white/58">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-[2.5rem] border border-white/10 bg-[#050505]/92 p-6 shadow-[0_34px_110px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="font-sans text-[10px] font-black uppercase tracking-[0.26em] text-white/42">Secure preview</p>
                <h2 className="mt-2 font-serif text-3xl">Velmère Account</h2>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-velmere-gold/25 bg-velmere-gold/10 text-velmere-gold">
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label htmlFor="email" className="font-sans text-[11px] uppercase tracking-[0.18em] text-white/52">
                  {t("email")}
                </label>
                <input id="email" type="email" disabled placeholder="velmere@preview" className="mt-3 h-14 w-full rounded-full border border-white/10 bg-black/45 px-5 text-white/42 outline-none placeholder:text-white/22" />
              </div>
              <div>
                <label htmlFor="password" className="font-sans text-[11px] uppercase tracking-[0.18em] text-white/52">
                  {t("password")}
                </label>
                <input id="password" type="password" disabled placeholder="••••••••" className="mt-3 h-14 w-full rounded-full border border-white/10 bg-black/45 px-5 text-white/42 outline-none placeholder:text-white/22" />
              </div>
              <button type="button" disabled className="min-h-14 w-full cursor-not-allowed rounded-full border border-velmere-gold/25 bg-velmere-gold/[0.06] px-6 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-velmere-gold/52">
                {t("signIn")}
              </button>
            </div>
          </form>
        </section>
      </LuxurySection>
    </main>
  );
}
