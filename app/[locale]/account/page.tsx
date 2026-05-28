import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";
import ProfileAccountClient from "@/components/account/ProfileAccountClient";

const modules = ["profile", "orders", "saved", "vlm", "wallet", "newsletter"] as const;

export default async function AccountPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Account" });

  return (
    <main className="min-h-screen bg-velmere-black text-white">
      <LuxurySection className="py-28 md:py-36">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/5 bg-white/[0.035] p-8 md:p-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{t("kicker")}</p>
          <h1 className="mt-5 font-serif text-4xl text-[#FFFFF0] md:text-5xl">{t("title")}</h1>
          <p className="mt-5 text-sm leading-7 text-white/58">{t("status")}</p>

          <ProfileAccountClient />

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module} className="rounded-2xl border border-white/5 bg-black/24 p-5">
                <p className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-white">
                  {t(`modules.${module}.title`)}
                </p>
                <p className="mt-2 text-xs leading-6 text-white/48">{t(`modules.${module}.body`)}</p>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/62 transition-colors hover:border-white/20 hover:text-white"
          >
            {t("loginCta")}
          </Link>
        </section>
      </LuxurySection>
    </main>
  );
}
