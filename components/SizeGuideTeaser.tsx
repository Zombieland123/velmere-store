"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler, X } from "lucide-react";
import { useTranslations } from "next-intl";

const rows = [
  ["S", "48-52", "66", "58"],
  ["M", "52-56", "68", "60"],
  ["L", "56-60", "70", "62"],
  ["XL", "60-64", "72", "64"],
];

export default function SizeGuideTeaser() {
  const t = useTranslations("SizeGuide");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        className="fixed bottom-6 right-6 z-[90] hidden h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/[0.25] bg-[#FFFFF0]/[0.92] text-black shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 md:flex"
      >
        <Ruler className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            role="dialog"
            aria-modal="false"
            aria-label={t("title")}
            initial={{ x: "110%", y: 28, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: "110%", y: 28, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[260] w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#050505]/[0.96] text-[#FFFFF0] shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.10] p-5">
              <div>
                <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37]">{t("kicker")}</p>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{t("title")}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] text-white/[0.60] hover:text-white">
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{t("close")}</span>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm leading-7 text-white/[0.58]">{t("body")}</p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.10]">
                <table className="w-full text-left font-sans text-xs text-white/[0.66]">
                  <thead className="bg-white/[0.04] text-[10px] uppercase tracking-[0.18em] text-white/[0.42]">
                    <tr>
                      <th className="px-3 py-3">{t("size")}</th>
                      <th className="px-3 py-3">{t("chest")}</th>
                      <th className="px-3 py-3">{t("length")}</th>
                      <th className="px-3 py-3">{t("shoulder")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row[0]} className="border-t border-white/[0.10]">
                        {row.map((cell) => (
                          <td key={cell} className="px-3 py-3">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs leading-6 text-white/[0.42]">{t("note")}</p>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
