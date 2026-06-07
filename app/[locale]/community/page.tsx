import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import LuxurySection from "@/components/layout/LuxurySection";
import { Link } from "@/navigation";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/community",
    title: "Community — Velmère",
    description: "Velmère community hub for Square, waitlist, lookbook and optional VLM access features.",
  });
}

export default function CommunityPage({ params: { locale } }: { params: { locale: string } }) {
  const isPl = locale === "pl";
  const title = isPl ? "Społeczność bez chaosu." : locale === "de" ? "Community ohne Chaos." : "Community without noise.";
  const body = isPl
    ? "Square, lista oczekujących i przyszłe benefity VLM są rozdzielone od podstawowego sklepu, żeby klient nie musiał rozumieć Web3 przed obejrzeniem produktu."
    : locale === "de"
      ? "Square, Warteliste und künftige VLM-Vorteile bleiben vom normalen Shop getrennt, damit Kundinnen und Kunden kein Web3 verstehen müssen, bevor sie Produkte sehen."
      : "Square, waitlist and future VLM perks stay separated from basic commerce so customers do not need to understand Web3 before viewing products.";

  return (
    <main className="min-h-[100dvh] bg-velmere-black text-white" data-pass315-public-surface-trim="community" data-pass317-public-launch-surface="community" data-pass318-public-storefront-focus="community">
      <LuxurySection className="py-28 md:py-36">
        <p className="luxury-kicker text-velmere-gold/[0.80]">COMMUNITY / VELMÈRE</p>
        <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-tight md:text-7xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-sm leading-7 text-white/[0.60] md:text-base">{body}</p>
        <div className="pass315-community-entry-grid mt-10 grid gap-4 md:grid-cols-3">
          {[
            { href: "/square", title: "Velmère Square", body: isPl ? "Posty, komentarze i sygnały społeczności." : "Posts, comments and community signals." },
            { href: "/contact", title: isPl ? "Lista oczekujących" : "Waitlist", body: isPl ? "Prośba o dostęp do dropu i kontaktu." : "Drop access request and contact." },
            { href: "/vlm-token", title: "VLM", body: isPl ? "Prywatny dostęp do narzędzi, dropów i Research Lab." : locale === "de" ? "Privater Zugang zu Tools, Drops und Research Lab." : "Private access to tools, drops and Research Lab." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/[0.10] bg-white/[0.04] p-6 transition-colors hover:border-velmere-gold/[0.35]">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-serif text-2xl text-white">{item.title}</h2>
                <ArrowUpRight className="h-4 w-4 text-white/[0.35] transition-colors group-hover:text-velmere-gold" />
              </div>
              <p className="mt-4 text-sm leading-7 text-white/[0.58]">{item.body}</p>
            </Link>
          ))}
        </div>
      </LuxurySection>
    </main>
  );
}
