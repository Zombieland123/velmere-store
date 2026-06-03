"use client";

import { ArrowUpRight, ClipboardCheck, MessageSquare, PackageCheck, Radar, ShieldCheck, Truck, WalletCards } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import Reveal from "@/components/ui/Reveal";
import NeuralBrainVisual from "@/components/home/NeuralBrainVisual";
import LuxuryProductCarousel from "@/components/home/LuxuryProductCarousel";
import EditorialFeatureSwitcher from "@/components/home/EditorialFeatureSwitcher";
import FullSurfaceReadinessIndex from "@/components/launch/FullSurfaceReadinessIndex";

function homeCopy(locale: string) {
  if (locale === "pl") {
    return {
      heroKicker: "PRIVATE FASHION HOUSE / WARSTWA CYFROWA",
      heroTitle: "Wejdź cicho. Zajmij miejsce.",
      heroBody: "Luxury streetwear z prywatną warstwą cyfrową. Ubrania zostają centrum; VLM, Square i dostęp do archiwum krążą wokół produktu.",
      exploreCollection: "Zobacz kolekcję",
      enterVlm: "Wejdź do VLM",
      accessCore: "Rdzeń dostępu",
      readOnlyPreview: "Podgląd read-only",
      clothingKicker: "UBRANIA NAJPIERW",
      clothingTitle: "Ubranie zostaje kotwicą.",
      clothingBody: "VLM, Shield i Square wzmacniają markę, ale klient najpierw musi rozumieć krój, materiał, dostawę i prawa zwrotu.",
      launchKicker: "Launch Reality Ledger",
      launchTitle: "Jeszcze nie gotowe — i to jest warstwa kontroli.",
      launchBody: "Velmère nie ma udawać gotowego produktu. Publiczne strony mogą wyglądać premium, ale realny start wymaga głębi danych, QA mobile, VLM gating, evidence storage, rate-limitów i bezpiecznych prawnie operacji.",
      openShieldRoadmap: "Otwórz roadmapę Shield",
      vlmAccessLayer: "Warstwa dostępu VLM",
      shieldKicker: "SHIELD MARKET INTELLIGENCE",
      shieldTitle: "Market intelligence bez hype’u.",
      shieldBody: "Shield sprawdza float, unlock pressure, płynność, holderów, ryzyko kontraktu i sygnały manipulacji społecznej. Brak transparentności staje się widoczną warstwą ryzyka, nie ukrytym założeniem.",
      openMarketShield: "Otwórz Market Shield",
      shieldMap: "Mapa Shield",
      dropKicker: "ARCHITEKTURA DROPU",
      dropTitle: "Cicho z definicji.",
      dropBody: "Sklep ma działać jak prywatny showroom: mało wyborów, jasne ścieżki, zero migających sygnałów. Produkt, membership i community mają osobne role.",
      pillars: [
        {
          kicker: "Czym jest Velmère?",
          title: "Cichy system uniformu.",
          body: "Limitowane streetwearowe sylwetki budowane wokół gramatury, proporcji i kontroli. Warstwa cyfrowa wspiera markę; nie zastępuje produktu.",
        },
        {
          kicker: "Warstwa VLM",
          title: "Dostęp, nie obietnice.",
          body: "VLM jest planowany jako prywatna warstwa dostępu do dropów, sygnałów Square i przywilejów archiwum. To nie jest obietnica zysku, produkt finansowy ani wymóg checkoutu.",
        },
        {
          kicker: "Prywatne dropy",
          title: "Rzadkość bez hałasu.",
          body: "Drop ma być kontrolowany: jasna dostępność, rozmiary, care, dostawa i zwroty przed checkoutem.",
        },
        {
          kicker: "Velmère Square",
          title: "Tablica sygnałów memberów.",
          body: "Square jest warstwą community dla notatek dropów, próśb archiwalnych i moderowanych sygnałów. Goście czytają. Memberzy uczestniczą.",
        },
      ],
      flow: [
        ["01", "Kolekcja", "Produkt pierwszy: ubrania, fit, materiał i jasna dostawa."],
        ["02", "Dostęp", "VLM zostaje kontrolowaną warstwą prywatną, oddzieloną od checkoutu."],
        ["03", "Square", "Community signals pozostają moderowane, czytelne i spokojne."],
      ],
      clothingFirstAtelier: [
        ["01", "Krój", "Sylwetka, linia ramion, długość i gramatura prowadzą stronę przed warstwą cyfrową."],
        ["02", "Materiał", "Każdy drop potrzebuje jasnej gramatury, odczucia, care i statusu fulfillmentu."],
        ["03", "Zaufanie", "Dostawa, zwroty i prawa konsumenta zostają widoczne przed checkoutem."],
      ],
      launchReality: [
        ["Product shell", "42%", "Homepage, sklep, VLM i Shield istnieją; hierarchia clothing i trust są jaśniejsze, ale finalne dane produktów i fulfillment QA dalej czekają."],
        ["VLM Intelligence", "25%", "Investigator protocol i modal readout istnieją; real source ledger, web OSINT, evidence export i gating dalej są dużą pracą."],
        ["Mapa Shield", "91%", "Strona tłumaczy system i access lanes; containment i modal są mocniejsze, ale prawdziwe live źródła produkcyjne nadal są blockerem."],
        ["Production", "24%", "Guardy Vercel i walidacje są mocniejsze; rate-limity, wallet sessions, monitoring i evidence storage dalej blokują launch."],
      ],
      shieldRails: [
        ["01", "Low float", "Circulating supply jest porównywany z total/max supply przed werdyktem."],
        ["02", "Unlocki", "Luki w vestingu są red flagą, dopóki nie ma aktualnego źródła."],
        ["03", "KOL risk", "Paid hype i ukryte alokacje idą do OSINT review."],
      ],
    };
  }

  if (locale === "de") {
    return {
      heroKicker: "PRIVATE FASHION HOUSE / DIGITALE EBENE",
      heroTitle: "Leise eintreten. Den Raum besitzen.",
      heroBody: "Luxury Streetwear mit privater digitaler Ebene. Kleidung bleibt im Zentrum; VLM, Square und Archivzugang kreisen um das Produkt.",
      exploreCollection: "Kollektion ansehen",
      enterVlm: "VLM öffnen",
      accessCore: "Access Core",
      readOnlyPreview: "Read-only Vorschau",
      clothingKicker: "KLEIDUNG ZUERST",
      clothingTitle: "Das Garment bleibt der Anker.",
      clothingBody: "VLM, Shield und Square stärken die Marke, aber zuerst müssen Fit, Material, Lieferung und Rückgaberechte klar sein.",
      launchKicker: "Launch Reality Ledger",
      launchTitle: "Noch nicht bereit — genau das ist Kontrolle.",
      launchBody: "Velmère soll Fertigkeit nicht vortäuschen. Öffentliche Seiten können premium wirken, aber echter Launch braucht Datentiefe, Mobile-QA, VLM-Gating, Evidence Storage, Rate-Limits und rechtssichere Abläufe.",
      openShieldRoadmap: "Shield Roadmap öffnen",
      vlmAccessLayer: "VLM Access Layer",
      shieldKicker: "SHIELD MARKET INTELLIGENCE",
      shieldTitle: "Market Intelligence ohne Hype.",
      shieldBody: "Shield prüft Float, Unlock Pressure, Liquidität, Holder, Contract Risk und Social-Manipulation-Signale. Fehlende Transparenz wird als sichtbare Risikoschicht gezeigt.",
      openMarketShield: "Market Shield öffnen",
      shieldMap: "Shield Map",
      dropKicker: "DROP ARCHITEKTUR",
      dropTitle: "Leise by design.",
      dropBody: "Der Shop soll wie ein privater Showroom funktionieren: wenige Optionen, klare Wege, keine blinkenden Signale. Produkt, Membership und Community haben getrennte Rollen.",
      pillars: [
        { kicker: "Was ist Velmère?", title: "Ein ruhiges Uniform-System.", body: "Limitierte Streetwear-Silhouetten rund um Gewicht, Proportion und Zurückhaltung. Die digitale Ebene unterstützt die Marke; sie ersetzt nicht das Produkt." },
        { kicker: "Die VLM Ebene", title: "Zugang, keine Versprechen.", body: "VLM ist als private Access-Ebene für Drops, Square-Signale und Archivvorteile geplant. Kein Gewinnversprechen, kein Finanzprodukt, keine Checkout-Pflicht." },
        { kicker: "Private Drops", title: "Knappheit ohne Lärm.", body: "Drops sollen kontrolliert wirken: klare Verfügbarkeit, Größen, Pflege, Lieferung und Rückgabe vor dem Checkout." },
        { kicker: "Velmère Square", title: "Signalboard für Member.", body: "Square ist die Community-Ebene für Drop Notes, Archivwünsche und moderierte Signale. Gäste lesen. Member nehmen teil." },
      ],
      flow: [
        ["01", "Kollektion", "Produkt zuerst: Garments, Fit, Material und klare Lieferung."],
        ["02", "Access", "VLM bleibt eine kontrollierte private Ebene, getrennt vom Checkout."],
        ["03", "Square", "Community-Signale bleiben moderiert, lesbar und ruhig."],
      ],
      clothingFirstAtelier: [
        ["01", "Schnitt", "Silhouette, Schulterlinie, Länge und Gewicht führen die Seite vor jeder digitalen Ebene."],
        ["02", "Material", "Jeder Drop braucht klares Gewicht, Handfeel, Care und Fulfillment-Status."],
        ["03", "Vertrauen", "Lieferung, Rückgabe und Verbraucherrechte bleiben vor Checkout sichtbar."],
      ],
      launchReality: [
        ["Product shell", "42%", "Homepage, Shop, VLM und Shield existieren; Clothing-Hierarchie und Trust sind klarer, aber finale Produktdaten und Fulfillment-QA fehlen."],
        ["VLM Intelligence", "25%", "Investigator Protocol und Modal Readout existieren; Source Ledger, Web OSINT, Evidence Export und Gating bleiben große Arbeit."],
        ["Shield Map", "91%", "Die Seite erklärt System und Access Lanes; Containment und Modal sind stärker, echte Live-Produktionsquellen bleiben aber ein Blocker."],
        ["Production", "24%", "Vercel Guards und Validation Scripts sind stärker; Rate-Limits, Wallet Sessions, Monitoring und Evidence Storage blockieren den Launch."],
      ],
      shieldRails: [
        ["01", "Low Float", "Circulating Supply wird vor dem Verdict mit Total/Max Supply verglichen."],
        ["02", "Unlocks", "Vesting-Lücken bleiben Red Flags, bis aktuelle Quellen vorliegen."],
        ["03", "KOL Risk", "Paid Hype und undisclosed Allocations werden zu OSINT Review geroutet."],
      ],
    };
  }

  return {
    heroKicker: "PRIVATE FASHION HOUSE / DIGITAL LAYER",
    heroTitle: "Enter quietly. Own the room.",
    heroBody: "Luxury streetwear with a private digital layer. Clothing stays at the center; VLM, Square and archive access orbit the product.",
    exploreCollection: "Explore collection",
    enterVlm: "Enter VLM",
    accessCore: "Access core",
    readOnlyPreview: "Read-only preview",
    clothingKicker: "CLOTHING FIRST",
    clothingTitle: "The garment stays the anchor.",
    clothingBody: "VLM, Shield and Square strengthen the brand, but the customer must first understand fit, material, delivery and return rights.",
    launchKicker: "Launch Reality Ledger",
    launchTitle: "Not finished yet — and that is the control layer.",
    launchBody: "Velmère should not fake readiness. Public pages can look premium, but a real launch needs data depth, mobile QA, VLM gating, evidence storage, rate limits and legally safe operations.",
    openShieldRoadmap: "Open Shield roadmap",
    vlmAccessLayer: "VLM Access Layer",
    shieldKicker: "SHIELD MARKET INTELLIGENCE",
    shieldTitle: "Market intelligence without hype.",
    shieldBody: "Shield checks float, unlock pressure, liquidity, holders, contract risk and social manipulation signals. Missing transparency becomes a visible risk layer, not a hidden assumption.",
    openMarketShield: "Open Market Shield",
    shieldMap: "Shield Map",
    dropKicker: "DROP ARCHITECTURE",
    dropTitle: "Quiet by design.",
    dropBody: "The shop should feel like a private showroom: few choices, clear paths and no flashing signals. Product, membership and community have separate roles.",
    pillars: [
      { kicker: "What is Velmère?", title: "A quiet uniform system.", body: "Limited streetwear silhouettes built around weight, proportion and restraint. The digital layer supports the brand; it does not replace the product." },
      { kicker: "The VLM Layer", title: "Access, not promises.", body: "VLM is planned as a private access concept for drops, Square signals and archive privileges. It is not a profit claim, financial product or checkout requirement." },
      { kicker: "Private Drops", title: "Scarcity without noise.", body: "Drops should feel controlled: clear availability, sizing, care, delivery and return information before checkout." },
      { kicker: "Velmère Square", title: "A member signal board.", body: "Square is the community layer for drop notes, archive requests and moderated signals. Guests can read. Members can participate." },
    ],
    flow: [
      ["01", "Collection", "Product first: garments, fit, material and delivery clarity."],
      ["02", "Access", "VLM stays as a controlled private layer, separated from checkout."],
      ["03", "Square", "Community signals stay moderated, readable and calm."],
    ],
    clothingFirstAtelier: [
      ["01", "Cut", "Silhouette, shoulder line, length and weight lead the page before any digital layer."],
      ["02", "Material", "Every drop needs clear fabric weight, care, handfeel and fulfilment status."],
      ["03", "Trust", "Delivery, returns and consumer rights stay visible before checkout."],
    ],
    launchReality: [
      ["Product shell", "42%", "Homepage, store, VLM and Shield surfaces exist; clothing hierarchy and conversion trust are now clearer, but final product data and fulfillment QA remain."],
      ["VLM Intelligence", "25%", "Investigator protocol and modal readout exist; real source ledger, web OSINT, evidence export and gating remain major work."],
      ["Shield Map", "91%", "The page explains the system and access lanes; containment and modal UX are stronger, but real production source feeds remain the blocker."],
      ["Production", "24%", "Vercel guards and validation scripts are stronger; rate limits, wallet sessions, monitoring and evidence storage remain blockers."],
    ],
    shieldRails: [
      ["01", "Low float", "Circulating supply is compared with total/max supply before the verdict."],
      ["02", "Unlocks", "Vesting gaps are red flags until verified from current sources."],
      ["03", "KOL risk", "Paid hype and undisclosed allocations are routed to OSINT review."],
    ],
  };
}

export default function HomePageClient() {
  const copy = homeCopy(useLocale());
  const { pillars, flow, clothingFirstAtelier, launchReality, shieldRails } = copy;

  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <section className="luxury-section min-h-[calc(100dvh-4.5rem)] pt-28 md:pt-32">
        <div className="grid gap-8 pb-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,0.88fr)] lg:items-stretch">
          <Reveal className="flex flex-col justify-between rounded-[2rem] border border-white/[0.10] bg-[#0B0B0D] p-6 shadow-velmere-card md:p-10 lg:min-h-[35rem]">
            <div>
              <p className="velmere-label text-velmere-gold">{copy.heroKicker}</p>
              <h1 className="mt-7 max-w-[12ch] font-serif text-[clamp(3.4rem,7.4vw,7.2rem)] leading-[0.88] tracking-[-0.055em] text-velmere-ivory">
                {copy.heroTitle}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-velmere-grey-soft md:text-lg">
                {copy.heroBody}
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="velmere-button-primary">
                {copy.exploreCollection} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/vlm-token" className="velmere-button-secondary">
                {copy.enterVlm} <WalletCards className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col justify-between rounded-[2rem] border border-white/[0.10] bg-[linear-gradient(145deg,#111113,#080809_58%,#17181B)] p-4 shadow-velmere-card md:p-6">
            <div className="mb-4 flex items-center justify-between gap-4 px-1">
              <p className="velmere-label text-velmere-gold">{copy.accessCore}</p>
              <span className="rounded-full border border-white/[0.10] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.42]">{copy.readOnlyPreview}</span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <NeuralBrainVisual />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="luxury-section py-14 md:py-20">
        <Reveal className="rounded-[2rem] border border-velmere-gold/[0.13] bg-[linear-gradient(145deg,rgba(212,175,55,0.07),rgba(255,255,255,0.025)_45%,rgba(0,0,0,0.18))] p-6 md:p-9">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <div>
              <p className="velmere-label text-velmere-gold">{copy.clothingKicker}</p>
              <h2 className="mt-5 font-serif text-4xl leading-none text-white md:text-6xl">{copy.clothingTitle}</h2>
              <p className="mt-5 text-sm leading-7 text-velmere-grey-soft">
                {copy.clothingBody}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {clothingFirstAtelier.map(([step, label, body]) => (
                <div key={label} className="rounded-[1.35rem] border border-white/[0.08] bg-black/[0.22] p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/[0.32]">{step}</p>
                  <h3 className="mt-4 text-xl text-white">{label}</h3>
                  <p className="mt-3 text-xs leading-6 text-velmere-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>


      <section className="luxury-section pb-12 md:pb-16">
        <LuxuryProductCarousel />
      </section>

      <section className="luxury-section pb-14 md:pb-20">
        <Reveal className="overflow-hidden rounded-[2rem] border border-amber-300/[0.14] bg-[radial-gradient(circle_at_16%_12%,rgba(200,169,106,0.14),transparent_36%),linear-gradient(135deg,#101012,#070708)] p-6 shadow-velmere-card md:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,0.58fr)] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/[0.18] bg-amber-300/[0.06] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {copy.launchKicker}
              </div>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-[0.95] tracking-[-0.045em] text-white md:text-6xl">
                {copy.launchTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-velmere-grey-soft">
                {copy.launchBody}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/market-integrity/shield-map" className="velmere-button-primary">
                  {copy.openShieldRoadmap} <ShieldCheck className="h-4 w-4" />
                </Link>
                <Link href="/vlm-token" className="velmere-button-secondary">
                  {copy.vlmAccessLayer} <WalletCards className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {launchReality.map(([label, value, body]) => (
                <div key={label} className="rounded-2xl border border-white/[0.09] bg-black/[0.24] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.50]">{label}</p>
                    <p className="font-mono text-sm text-velmere-gold">{value}</p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-velmere-gold/[0.72]" style={{ width: value }} />
                  </div>
                  <p className="mt-3 text-xs leading-6 text-white/[0.50]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="luxury-section pb-14 md:pb-20">
        <Reveal className="overflow-hidden rounded-[2rem] border border-cyan-200/[0.12] bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.10),transparent_34%),linear-gradient(135deg,#101115,#080809)] p-6 shadow-velmere-card md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.42fr)] lg:items-center">
            <div>
              <p className="velmere-label text-velmere-gold">{copy.shieldKicker}</p>
              <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-[0.95] tracking-[-0.045em] text-white md:text-6xl">
                {copy.shieldTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-velmere-grey-soft">
                {copy.shieldBody}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/market-integrity" className="velmere-button-primary">
                  {copy.openMarketShield} <Radar className="h-4 w-4" />
                </Link>
                <Link href="/market-integrity/shield-map" className="velmere-button-secondary">
                  {copy.shieldMap} <ShieldCheck className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {shieldRails.map(([number, title, body]) => (
                <div key={title} className="rounded-2xl border border-white/[0.09] bg-black/[0.24] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{number}</p>
                  <h3 className="mt-2 text-lg text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/[0.52]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <FullSurfaceReadinessIndex locale={locale} surface="home" />

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
              <p className="velmere-label text-velmere-gold">{copy.dropKicker}</p>
              <h2 className="mt-5 font-serif text-5xl leading-[0.92] tracking-[-0.05em] md:text-7xl">{copy.dropTitle}</h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-velmere-grey-soft">
                {copy.dropBody}
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
