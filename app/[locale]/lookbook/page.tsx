import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";

const LOOKS = [
  {
    key: "form",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20",
    className: "",
  },
  {
    key: "weight",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=22",
    className: "",
  },
  {
    key: "line",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=20",
    className: "",
  },
  {
    key: "silence",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20",
    className: "",
  },
];

export default async function LookbookPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Lookbook" });

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white">
      <LuxurySection className="py-24 md:py-30">
        <div className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="max-w-3xl lg:col-span-8">
            <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.95] text-white md:text-6xl">{t("title")}</h1>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {LOOKS.map((look, index) => (
            <article key={look.key} className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${look.className}`}>
              <div className="relative aspect-[4/5]">
                <Image
                  src={look.image}
                  alt={t("imageAlt", { number: index + 1 })}
                  fill
                  priority={index === 0}
                  sizes={look.className ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                  className="object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <div className="bg-[#F5F0E8] p-4 text-black">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/42">
                  {t(`looks.${look.key}.label`)}
                </p>
                <p className="mt-2 text-xs leading-6 text-black/62">{t(`looks.${look.key}.body`)}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#F5F0E8] px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-white"
          >
            {t("shopCta")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/archive"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F5F0E8] transition-colors hover:bg-white/[0.06]"
          >
            {t("archiveCta")}
          </Link>
        </div>
      </LuxurySection>
    </main>
  );
}
