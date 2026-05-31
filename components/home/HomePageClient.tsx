"use client";

import { ArrowUpRight, MessageSquare, PackageCheck, ShieldCheck, Truck, WalletCards } from "lucide-react";
import { Link } from "@/navigation";
import Reveal from "@/components/ui/Reveal";
import NeuralBrainVisual from "@/components/home/NeuralBrainVisual";
import LuxuryProductCarousel from "@/components/home/LuxuryProductCarousel";
import EditorialFeatureSwitcher from "@/components/home/EditorialFeatureSwitcher";

const pillars = [
  {
    kicker: "What is Velmère?",
    title: "A quiet uniform system.",
    body: "Limited streetwear silhouettes built around weight, proportion and restraint. The digital layer supports the brand; it does not replace the product.",
  },
  {
    kicker: "The VLM Layer",
    title: "Access, not promises.",
    body: "VLM is planned as a private access concept for drops, Square signals and archive privileges. It is not a profit claim, financial product or checkout requirement.",
  },
  {
    kicker: "Private Drops",
    title: "Scarcity without noise.",
    body: "Drops should feel controlled: clear availability, sizing, care, delivery and return information before checkout.",
  },
  {
    kicker: "Velmère Square",
    title: "A member signal board.",
    body: "Square is the community layer for drop notes, archive requests and moderated signals. Guests can read. Members can participate.",
  },
];

const flow = [
  ["01", "Collection", "Product first: garments, fit, material and delivery clarity."],
  ["02", "Access", "VLM stays as a controlled private layer, separated from checkout."],
  ["03", "Square", "Community signals stay moderated, readable and calm."],
];

export default function HomePageClient() {
  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <section className="luxury-section min-h-[calc(100dvh-4.5rem)] pt-28 md:pt-32">
        <div className="grid gap-8 pb-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,0.88fr)] lg:items-stretch">
          <Reveal className="flex flex-col justify-between rounded-[2rem] border border-white/[0.10] bg-[#0B0B0D] p-6 shadow-velmere-card md:p-10 lg:min-h-[35rem]">
            <div>
              <p className="velmere-label text-velmere-gold">PRIVATE FASHION HOUSE / DIGITAL LAYER</p>
              <h1 className="mt-7 max-w-[12ch] font-serif text-[clamp(3.4rem,7.4vw,7.2rem)] leading-[0.88] tracking-[-0.055em] text-velmere-ivory">
                Enter quietly. Own the room.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-velmere-grey-soft md:text-lg">
                Luxury streetwear with a private digital layer. Garments remain the centre; VLM, Square and archive access orbit around them.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="velmere-button-primary">
                Explore Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/vlm-token" className="velmere-button-secondary">
                Enter VLM <WalletCards className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col justify-between rounded-[2rem] border border-white/[0.10] bg-[linear-gradient(145deg,#111113,#080809_58%,#17181B)] p-4 shadow-velmere-card md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4 px-1">
              <p className="velmere-label text-velmere-gold">Access core</p>
              <span className="rounded-full border border-white/[0.10] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.42]">Read-only preview</span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <NeuralBrainVisual />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="luxury-section pb-12 md:pb-16">
        <LuxuryProductCarousel />
      </section>

      <section className="luxury-section pb-20 md:pb-24">
        <EditorialFeatureSwitcher />
      </section>

      <section className="luxury-section pb-20 md:pb-28">
        <div className="grid gap-4 md:grid-cols-2">
          {pillars.map((section, index) => (
            <Reveal key={section.kicker} delay={index * 0.04} className="luxury-card group min-h-[17rem] transition duration-500 hover:-translate-y-1 hover:border-velmere-gold/[0.28] hover:bg-[#151518]">
              <p className="velmere-label text-velmere-gold">{section.kicker}</p>
              <h2 className="mt-5 font-serif text-4xl leading-[0.95] tracking-[-0.04em] text-velmere-ivory md:text-5xl">{section.title}</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-velmere-grey-soft">{section.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="luxury-section pb-20 md:pb-28">
        <Reveal className="overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#111113] shadow-velmere-card">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="p-6 md:p-10">
              <p className="velmere-label text-velmere-gold">DROP ARCHITECTURE</p>
              <h2 className="mt-5 font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-7xl">Quiet by design.</h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-velmere-grey-soft">
                The store should move like a private showroom: few choices, clear paths, no flashing signals. Product, membership and community each have their own role.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/square" className="velmere-button-secondary">
                  View Square <MessageSquare className="h-4 w-4" />
                </Link>
                <Link href="/shipping" className="velmere-button-ghost">Shipping details</Link>
              </div>
            </div>
            <div className="grid border-t border-white/[0.10] lg:border-l lg:border-t-0">
              {flow.map(([number, title, body]) => (
                <div key={title} className="grid gap-4 border-b border-white/[0.10] p-6 last:border-b-0 md:grid-cols-[4rem_1fr] md:p-8">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-velmere-gold">{number}</p>
                  <div>
                    <h3 className="text-xl text-velmere-ivory">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-velmere-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="luxury-section pb-24 md:pb-32">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Secure checkout", body: "Payment, taxes and delivery costs stay clear before purchase." },
            { icon: Truck, title: "Shipping clarity", body: "Carrier, destination, cost and delivery estimate stay visible." },
            { icon: PackageCheck, title: "EU returns", body: "Return and withdrawal information remain easy to find." },
            { icon: MessageSquare, title: "Human support", body: "Support stays direct and separate from wallet activity." },
          ].map(({ icon: Icon, title, body }) => (
            <Reveal key={title} className="luxury-card min-h-[13rem]">
              <Icon className="h-5 w-5 text-velmere-gold" />
              <h3 className="mt-5 text-lg text-velmere-ivory">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-velmere-muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
