"use client";

import { useLocale } from "next-intl";
import { Link } from "@/navigation";

function footerCopy(locale: string) {
  if (locale === "pl") {
    return {
      tagline: "Luxury streetwear z prywatną warstwą cyfrową.",
      micro: "Sklep z ubraniami, dostęp VLM i Square pozostają jasno oddzielone.",
      explore: "Eksploruj",
      legal: "Legal",
      trust: "Notatki zaufania",
      rights: "Wszelkie prawa zastrzeżone.",
      launch: "Strony legal, privacy, delivery i VLM access są dokumentami kontroli launchu przed publiczną aktywacją.",
      exploreLinks: [
        { href: "/clothing", label: "Ubrania" },
        { href: "/vlm-token", label: "Dostęp VLM" },
        { href: "/research-lab", label: "Research Lab" },
        { href: "/square", label: "Velmère Square" },
        { href: "/lookbook", label: "Lookbook" },
        { href: "/community", label: "Community" },
        { href: "/faq", label: "FAQ" },
      ],
      legalLinks: [
        { href: "/impressum", label: "Impressum / dane sprzedawcy" },
        { href: "/privacy", label: "Polityka prywatności" },
        { href: "/terms", label: "Regulamin" },
        { href: "/returns", label: "Zwroty / prawo odstąpienia" },
        { href: "/shipping", label: "Dostawa" },
        { href: "/contact", label: "Kontakt" },
      ],
      microcopy: [
        "VLM jest warstwą dostępu, nie inwestycją.",
        "Nigdy nie wpisuj seed phrase.",
        "Ceny, podatki, koszty dostawy i prawa zwrotu są pokazywane przed checkoutem.",
        "Prawa konsumenta pozostają bez zmian.",
      ],
    };
  }

  if (locale === "de") {
    return {
      tagline: "Luxury Streetwear mit privater digitaler Ebene.",
      micro: "Clothing Commerce, VLM Access und Square Community bleiben klar getrennt.",
      explore: "Entdecken",
      legal: "Rechtliches",
      trust: "Trust Notes",
      rights: "Alle Rechte vorbehalten.",
      launch: "Legal-, Privacy-, Delivery- und VLM-Access-Seiten werden vor öffentlicher Aktivierung als Launch-Control-Dokumente gepflegt.",
      exploreLinks: [
        { href: "/clothing", label: "Kleidung" },
        { href: "/vlm-token", label: "VLM Access" },
        { href: "/research-lab", label: "Research Lab" },
        { href: "/square", label: "Velmère Square" },
        { href: "/lookbook", label: "Lookbook" },
        { href: "/community", label: "Community" },
        { href: "/faq", label: "FAQ" },
      ],
      legalLinks: [
        { href: "/impressum", label: "Impressum / Anbieterkennzeichnung" },
        { href: "/privacy", label: "Datenschutzerklärung" },
        { href: "/terms", label: "AGB" },
        { href: "/returns", label: "Rückgabe / Widerrufsrecht" },
        { href: "/shipping", label: "Versand" },
        { href: "/contact", label: "Kontakt" },
      ],
      microcopy: [
        "VLM ist eine Access-Ebene, keine Investition.",
        "Gib niemals deine Seed Phrase ein.",
        "Preise, Steuern, Versandkosten und Rückgaberechte werden vor dem Checkout angezeigt.",
        "Verbraucherrechte bleiben unberührt.",
      ],
    };
  }

  return {
    tagline: "Luxury streetwear with a private digital layer.",
    micro: "Clothing commerce, VLM access and Square community features stay clearly separated.",
    explore: "Explore",
    legal: "Legal",
    trust: "Trust notes",
    rights: "All rights reserved.",
    launch: "Legal, privacy, delivery and VLM access pages are maintained as launch-control documents before public activation.",
    exploreLinks: [
      { href: "/clothing", label: "Clothing" },
      { href: "/vlm-token", label: "VLM Access" },
      { href: "/research-lab", label: "Research Lab" },
      { href: "/square", label: "Velmère Square" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/community", label: "Community" },
      { href: "/faq", label: "FAQ" },
    ],
    legalLinks: [
      { href: "/impressum", label: "Impressum / Legal Notice" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
      { href: "/returns", label: "Returns / Right of Withdrawal" },
      { href: "/shipping", label: "Shipping" },
      { href: "/contact", label: "Contact" },
    ],
    microcopy: [
      "VLM is an access layer, not an investment.",
      "Never enter your seed phrase.",
      "Prices, taxes, delivery costs and return rights are shown before checkout.",
      "Consumer rights remain unaffected.",
    ],
  };
}

export default function Footer() {
  const copy = footerCopy(useLocale());

  return (
    <footer className="relative border-t border-white/[0.10] bg-[#0B0B0D] text-velmere-ivory">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.7fr_0.9fr_1.1fr]">
          <div>
            <Link href="/" className="inline-flex font-sans text-2xl font-semibold uppercase tracking-[0.22em] text-velmere-ivory md:text-3xl">
              VELMÈRE
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-velmere-grey-soft">
              {copy.tagline}
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-velmere-muted">
              {copy.micro}
            </p>
          </div>

          <div>
            <p className="velmere-label text-velmere-gold">{copy.explore}</p>
            <ul className="mt-5 space-y-3">
              {copy.exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-velmere-muted transition-colors hover:text-velmere-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/[0.50]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="velmere-label text-velmere-gold">{copy.legal}</p>
            <ul className="mt-5 space-y-3">
              {copy.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-velmere-muted transition-colors hover:text-velmere-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/[0.50]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="velmere-label text-velmere-gold">{copy.trust}</p>
            <div className="mt-5 grid gap-3">
              {copy.microcopy.map((item) => (
                <p key={item} className="rounded-2xl border border-white/[0.10] bg-black/[0.24] p-4 text-xs leading-6 text-velmere-grey-soft">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.10] pt-6 text-xs leading-6 text-velmere-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Velmère. {copy.rights}</p>
          <p>{copy.launch}</p>
        </div>
      </div>
    </footer>
  );
}
