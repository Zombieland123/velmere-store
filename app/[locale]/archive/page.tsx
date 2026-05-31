import Image from "next/image";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";
import BajakProtocolVisual from "@/components/vlm/BajakProtocolVisual";

const GARMENTS = [
  {
    key: "coat",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=18",
  },
  {
    key: "hood",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=18",
  },
  {
    key: "trouser",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=18",
  },
];

export default async function ArchivePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Archive" });

  return (
    <main className="min-h-[100dvh] bg-[#09090A] text-white">
      <LuxurySection className="pb-16 pt-32 md:pb-24" bleed>
        <section className="mx-auto grid w-full max-w-none gap-8 px-4 md:px-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(22rem,0.38fr)] xl:items-end">
          <div>
            <p className="luxury-kicker text-velmere-gold/[0.80]">{t("kicker")}</p>
            <h1 className="mt-6 max-w-5xl font-serif text-6xl leading-[0.9] text-white md:text-8xl">
              {t("title")}
            </h1>
          </div>
          <div className="rounded-[1.5rem] border border-white/[0.10] bg-[#1A1A1C] p-6 text-sm leading-7 text-white/[0.56] shadow-2xl shadow-black/[0.40]">
            <p>{t("intro")}</p>
            <Link href="/vlm-token" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border border-[#c8a96a]/[0.25] bg-[#c8a96a]/[0.10] px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c8a96a] transition-colors hover:bg-[#c8a96a]/[0.15]">
              {t("vlmCta")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-12 grid w-full max-w-none gap-4 px-4 md:grid-cols-3 md:px-8">
            {GARMENTS.map((garment, index) => (
              <article key={garment.key} className="group overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-[#1A1A1C] shadow-[0_26px_90px_rgba(0,0,0,0.36)]">
                <div className="relative aspect-[4/5] max-h-[34rem] overflow-hidden">
                  <Image src={garment.image} alt={t(`garments.${garment.key}.title`)} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/[0.86] via-black/[0.16] to-transparent" />
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-[#c8a96a]/[0.25] bg-[#c8a96a]/[0.10] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#c8a96a]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="rounded-full border border-white/[0.10] bg-black/[0.35] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.45]">{t(`garments.${garment.key}.status`)}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h2 className="max-w-xl font-serif text-3xl leading-tight text-white md:text-4xl">
                      {t(`garments.${garment.key}.title`)}
                    </h2>
                    <p className="mt-3 max-w-xl text-xs leading-6 text-white/[0.62]">{t(`garments.${garment.key}.body`)}</p>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </LuxurySection>

      <section className="bg-[#D8D5CF] py-14 text-black md:py-20">
        <LuxurySection>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/[0.42]">{t("noteKicker")}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{t("noteTitle")}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-black/[0.62]">{t("noteBody")}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.10] bg-black/[0.035] p-5 font-mono text-[10px] uppercase tracking-[0.16em] text-black/[0.50]">
              <LockKeyhole className="mb-4 h-5 w-5 text-black/[0.50]" aria-hidden="true" />
              [ ARCHIVE ITEMS ARE OPTIMIZED PREVIEW ASSETS ]
            </div>
          </div>
        </LuxurySection>
      </section>

      <LuxurySection className="py-16 md:py-24">
        <details className="rounded-[1.5rem] border border-white/[0.10] bg-[#1A1A1C] p-5 md:p-6">
          <summary className="cursor-pointer font-sans text-xl font-semibold text-white">{t("systemNotes")}</summary>
          <div className="mt-6">
            <BajakProtocolVisual />
          </div>
        </details>
      </LuxurySection>
    </main>
  );
}
