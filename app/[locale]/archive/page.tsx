import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";
import BajakProtocolVisual from "@/components/vlm/BajakProtocolVisual";

const GARMENTS = [
  {
    key: "coat",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1800&auto=format&fit=crop&sat=-100&contrast=20",
    span: "lg:col-span-7",
    aspect: "aspect-[16/11]",
  },
  {
    key: "hood",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=18",
    span: "lg:col-span-5",
    aspect: "aspect-[4/5]",
  },
  {
    key: "trouser",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1800&auto=format&fit=crop&sat=-100&contrast=20",
    span: "lg:col-span-12",
    aspect: "aspect-[21/9]",
  },
];

export default async function ArchivePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Archive" });

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="pb-16 pt-32 md:pb-24">
        <section className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
            <h1 className="mt-6 max-w-4xl font-serif text-6xl leading-[0.9] text-white md:text-8xl">
              {t("title")}
            </h1>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-white/56 lg:col-span-4">
            <p>{t("intro")}</p>
            <Link href="/vlm-token" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/14 px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/68 transition-colors hover:border-white/28 hover:text-white">
              {t("vlmCta")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-12">
          {GARMENTS.map((garment, index) => (
            <article key={garment.key} className={`${garment.span} group overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_34px_120px_rgba(0,0,0,0.32)]`}>
              <div className={`relative ${garment.aspect} min-h-[26rem] overflow-hidden`}>
                <Image src={garment.image} alt={t(`garments.${garment.key}.title`)} fill sizes="(min-width: 1024px) 80vw, 100vw" className="object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/16 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-velmere-gold">
                    {String(index + 1).padStart(2, "0")} / {t(`garments.${garment.key}.status`)}
                  </p>
                  <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-white md:text-6xl">
                    {t(`garments.${garment.key}.title`)}
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">{t(`garments.${garment.key}.body`)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </LuxurySection>

      <section className="bg-[#F5F0E8] py-14 text-black md:py-20">
        <LuxurySection>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-black/42">{t("noteKicker")}</p>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">{t("noteTitle")}</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-black/62">{t("noteBody")}</p>
            </div>
          </div>
        </LuxurySection>
      </section>

      <LuxurySection className="py-16 md:py-24">
        <details className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <summary className="cursor-pointer font-sans text-xl font-semibold text-white">{t("systemNotes")}</summary>
          <div className="mt-6">
            <BajakProtocolVisual />
          </div>
        </details>
      </LuxurySection>
    </main>
  );
}
