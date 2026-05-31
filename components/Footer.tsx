"use client";

import { Link } from "@/navigation";

const exploreLinks = [
  { href: "/clothing", label: "Clothing" },
  { href: "/vlm-token", label: "VLM Access" },
  { href: "/square", label: "Velmère Square" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/community", label: "Community" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/impressum", label: "Impressum / Legal Notice" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/returns", label: "Returns / Right of Withdrawal" },
  { href: "/shipping", label: "Shipping" },
  { href: "/contact", label: "Contact" },
];

const microcopy = [
  "VLM is an access layer, not an investment.",
  "Never enter your seed phrase.",
  "Prices, taxes, delivery costs and return rights are shown before checkout.",
  "Consumer rights remain unaffected.",
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.10] bg-[#0B0B0D] text-velmere-ivory">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.7fr_0.9fr_1.1fr]">
          <div>
            <Link href="/" className="inline-flex font-sans text-2xl font-semibold uppercase tracking-[0.22em] text-velmere-ivory md:text-3xl">
              VELMÈRE
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-velmere-grey-soft">
              Luxury streetwear with a private digital layer.
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-velmere-muted">
              Clothing commerce, VLM access and Square community features stay clearly separated.
            </p>
          </div>

          <div>
            <p className="velmere-label text-velmere-gold">Explore</p>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-velmere-muted transition-colors hover:text-velmere-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/[0.50]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="velmere-label text-velmere-gold">Legal</p>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-velmere-muted transition-colors hover:text-velmere-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/[0.50]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="velmere-label text-velmere-gold">Trust notes</p>
            <div className="mt-5 grid gap-3">
              {microcopy.map((item) => (
                <p key={item} className="rounded-2xl border border-white/[0.10] bg-black/[0.24] p-4 text-xs leading-6 text-velmere-grey-soft">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.10] pt-6 text-xs leading-6 text-velmere-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Velmère. All rights reserved.</p>
          <p>Legal, privacy, delivery and VLM access pages are maintained as launch-control documents before public activation.</p>
        </div>
      </div>
    </footer>
  );
}
