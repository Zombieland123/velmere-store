"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import LuxurySection from "@/components/layout/LuxurySection";
import { fadeUp } from "@/lib/motion";

export default function NotFound() {
  const t = useTranslations("Errors.notFound");

  return (
    <main className="min-h-screen bg-velmere-black text-white">
      <LuxurySection className="flex min-h-screen items-center justify-center py-28 md:py-36">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="luxury-kicker text-velmere-gold/80">404</p>
          <h1 className="mt-6 font-serif text-5xl leading-tight text-white md:text-7xl">{t("title")}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/58 md:text-base">{t("body")}</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-colors hover:bg-velmere-gold"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </LuxurySection>
    </main>
  );
}
