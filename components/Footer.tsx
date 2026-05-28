"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  const exploreLinks = [
    { href: "/shop?category=men", label: t("menswear") },
    { href: "/shop?category=women", label: t("womenswear") },
    { href: "/shop?sort=new", label: t("newDrop") },
    { href: "/lookbook", label: t("lookbook") },
    { href: "/archive", label: t("archive") },
    { href: "/vlm-token", label: t("vlmToken") },
    { href: "/square", label: t("square") },
  ];

  const serviceLinks = [
    { href: "/shipping", label: t("shipping") },
    { href: "/returns", label: t("returns") },
    { href: "/contact", label: t("contact") },
  ];

  const legalLinks = [
    { href: "/impressum", label: t("impressum") },
    { href: "/terms", label: t("terms") },
    { href: "/privacy", label: t("privacy") },
    { href: "/token-agreement", label: t("tokenAgreement") },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link href="/" className="inline-flex font-sans text-3xl font-semibold uppercase tracking-[0.18em]">
              VELMÈRE
            </Link>
            <p className="mt-5 text-sm leading-7 text-white/58">{t("tagline")}</p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/44">{t("micro")}</p>
          </div>

          {[
            { title: t("explore"), links: exploreLinks },
            { title: t("service"), links: serviceLinks },
            { title: t("legal"), links: legalLinks },
          ].map((group) => (
            <div key={group.title}>
              <p className="luxury-kicker text-velmere-gold/70">{group.title}</p>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] uppercase tracking-[0.18em] text-white/52 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="luxury-kicker text-velmere-gold/70">{t("newsletter")}</p>
            <p className="mt-5 text-sm leading-7 text-white/58">{t("newsletterText")}</p>
            <div className="mt-5 space-y-3">
              <input
                type="email"
                disabled
                placeholder={t("emailPlaceholder")}
                className="h-12 w-full rounded-full border border-white/10 bg-white/[0.035] px-5 text-sm text-white/40 outline-none placeholder:text-white/28"
              />
              <button
                type="button"
                disabled
                className="h-12 w-full cursor-not-allowed rounded-full border border-white/10 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/34"
              >
                {t("subscribeSoon")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/36">
            &copy; {new Date().getFullYear()} {t("rights")}
          </p>
          <p className="mt-3 max-w-4xl text-[10px] uppercase tracking-[0.18em] text-white/24">{t("riskMicro")}</p>
        </div>
      </div>
    </footer>
  );
}
