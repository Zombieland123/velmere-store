"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { CONSENT_STORAGE_KEY, createConsentChoice, parseConsent } from "@/lib/privacy/consent";

export default function CookieConsent() {
  const t = useTranslations("CookieConsent");
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsVisible(!parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY)));
  }, []);

  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(createConsentChoice(value)));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[150] rounded-2xl border border-white/10 bg-black/90 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:left-auto md:max-w-2xl"
        >
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-velmere-gold">
                {t("title")}
              </p>
              <p className="mt-3 font-sans text-sm leading-7 text-white/64">{t("message")}</p>
              {showSettings && (
                <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-4 font-sans text-xs leading-6 text-white/56">
                  <p className="text-white/70">{t("settingsIntro")}</p>
                  <p>{t("necessary")}</p>
                  <p>{t("analytics")}</p>
                  <p>{t("marketing")}</p>
                  <Link href="/privacy" className="text-velmere-gold underline-offset-4 hover:underline">
                    {t("privacyLink")}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => choose("declined")}
                className="h-11 rounded-full border border-white/14 px-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/62 transition-colors hover:border-white hover:text-white"
              >
                {t("decline")}
              </button>
              <button
                type="button"
                onClick={() => setShowSettings((value) => !value)}
                className="h-11 rounded-full border border-white/14 px-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/62 transition-colors hover:border-white hover:text-white"
              >
                {t("settings")}
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="h-11 rounded-full bg-velmere-gold px-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-white"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
