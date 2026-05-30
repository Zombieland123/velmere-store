"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function Footer() {
  const t = useTranslations("Footer");

  const navigationLinks = [
    { href: "/shop", label: t("shopAll") },
    { href: "/shop?category=men", label: t("menswear") },
    { href: "/shop?category=women", label: t("womenswear") },
    { href: "/lookbook", label: t("lookbook") },
    { href: "/square", label: t("square") },
  ];

  const legalLinks = [
    { href: "/legal/shipping", label: t("shipping") },
    { href: "/returns", label: t("returns") },
    { href: "/legal/terms", label: t("terms") },
    { href: "/legal/privacy", label: t("privacy") },
    { href: "/impressum", label: t("impressum") },
  ];

  return (
    <footer className="relative border-t border-white/8 bg-velmere-surface text-velmere-ivory">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link href="/" className="inline-flex font-sans text-2xl font-semibold uppercase tracking-[0.18em] text-velmere-ivory md:text-3xl">
              VELMÈRE
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-velmere-grey-soft">{t("tagline")}</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-velmere-muted">{t("micro")}</p>
          </div>

          {[
            { title: t("explore"), links: navigationLinks },
            { title: t("legal"), links: legalLinks },
          ].map((group) => (
            <div key={group.title}>
              <p className="luxury-kicker">{group.title}</p>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-velmere-muted transition-colors hover:text-velmere-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/50">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="luxury-kicker">{t("newsletter")}</p>
            <p className="mt-5 text-sm leading-7 text-velmere-grey-soft">{t("newsletterText")}</p>
            <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="velmere-meta text-velmere-gold">Signal list // staging</p>
              <p className="mt-3 text-sm leading-6 text-velmere-muted">{t("newsletterOffline")}</p>
              <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-velmere-ivory transition hover:border-velmere-gold/50 hover:text-velmere-gold">
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-xs text-velmere-muted">&copy; {new Date().getFullYear()} {t("rights")}</p>
          <Link href="/vlm-token" className="font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-muted transition hover:text-velmere-gold">
            {t("riskMicro")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
