"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { Archive, BadgeCheck, Fingerprint, Infinity, Layers3, LockKeyhole, Route, ShieldCheck, WalletCards, X } from "lucide-react";

type Mode = "basic" | "pro";
type ModuleKey = "mobius" | "amu" | "wallet" | "archive" | "order" | "security";

type Copy = {
  title: string;
  body: string;
  open: string;
  close: string;
  status: string;
  modules: Record<ModuleKey, { eyebrow: string; title: string; body: string; detail: string; facts: string[] }>;
};

const copy: Record<"en" | "pl" | "de", Copy> = {
  en: {
    title: "Pro is a control room, not a slogan.",
    body: "Each module expands into a readable micro-system: visual rhythm, security copy, operational limits and a clear reminder that VLM remains read-only until contract, audit and legal review are complete.",
    open: "Open module",
    close: "Close",
    status: "Read-only preview",
    modules: {
      mobius: {
        eyebrow: "Möbius Routing Path",
        title: "One path. No loose edge.",
        body: "A continuous access loop between drop, archive and Square.",
        detail: "The Möbius path is used as a navigation metaphor: the user can move from garment to drop signal to archive context without losing orientation. It is not a financial promise; it is the shape of a clean access system.",
        facts: ["Drop → Archive → Square", "Context preserved", "No claim of deployed routing"],
      },
      amu: {
        eyebrow: "AMU Baseline",
        title: "3162.27 as visual tempo.",
        body: "AMU controls rhythm, pulse and spacing language.",
        detail: "AMU is presented as a brand metronome: a controlled timing baseline for pulses, delays, distance between nodes and interface cadence. It stays visual and symbolic unless a real, reviewed technical use exists.",
        facts: ["3162.27", "Visual baseline", "No investment signal"],
      },
      wallet: {
        eyebrow: "Wallet Safety Preview",
        title: "Name the action before the signature.",
        body: "Connect, sign, approve and send must never blur together.",
        detail: "Velmère should never ask for a seed phrase or private key. Wallets stay optional, read-only by default and every wallet prompt must describe the exact action before the user signs anything.",
        facts: ["No seed phrase", "No custody", "Named approvals only"],
      },
      archive: {
        eyebrow: "Archive Entitlement Map",
        title: "Access as rooms, not a dead list.",
        body: "Archive visibility becomes a map of public, member and pending rooms.",
        detail: "The archive map should show what is public, what is member-only and what is pending deployment. It turns access into spatial understanding instead of a confusing locked list.",
        facts: ["Public rooms", "Member rooms", "Pending rooms"],
      },
      order: {
        eyebrow: "Order-book Cart",
        title: "Allocated inventory, not chaos.",
        body: "Cart rows behave like clean reserved inventory lines.",
        detail: "The order-book pattern gives trust: size, quantity, VAT, gross total and allocation status stay visible. It borrows the precision of an exchange without pretending clothing checkout is trading.",
        facts: ["VAT visible", "Allocation timer", "Clear gross total"],
      },
      security: {
        eyebrow: "Bitcoin Discipline",
        title: "Self-custody, clear prompts, no theatre.",
        body: "Security copy is part of the product, not legal decoration.",
        detail: "The site should explain that Velmère does not custody assets, does not request private keys, does not hide approvals and does not claim a live contract until deployment, verification, audit and legal review are done.",
        facts: ["Self-custody", "Contract review", "No hidden approvals"],
      },
    },
  },
  pl: {
    title: "Pro to pokój kontroli, nie slogan.",
    body: "Każdy moduł otwiera czytelny mikro-system: rytm wizualny, bezpieczeństwo, limity operacyjne i jasne przypomnienie, że VLM zostaje read-only do kontraktu, audytu i review prawnego.",
    open: "Otwórz moduł",
    close: "Zamknij",
    status: "Podgląd read-only",
    modules: {
      mobius: {
        eyebrow: "Möbius Routing Path",
        title: "Jedna ścieżka. Bez luźnej krawędzi.",
        body: "Ciągła pętla dostępu między dropem, archiwum i Square.",
        detail: "Ścieżka Möbiusa działa jako metafora nawigacji: użytkownik przechodzi od ubrania do sygnału dropu i kontekstu archiwum bez utraty orientacji. To nie jest obietnica finansowa; to kształt czystego systemu dostępu.",
        facts: ["Drop → Archiwum → Square", "Kontekst zachowany", "Bez claimu wdrożonego routingu"],
      },
      amu: {
        eyebrow: "AMU Baseline",
        title: "3162.27 jako tempo wizualne.",
        body: "AMU porządkuje rytm, puls i język odstępów.",
        detail: "AMU jest tutaj metronomem marki: kontroluje feeling pulsów, opóźnienia, dystans między nodami i tempo interfejsu. Zostaje warstwą wizualną i symboliczną, dopóki nie ma realnego, sprawdzonego zastosowania technicznego.",
        facts: ["3162.27", "Rytm wizualny", "Bez sygnału inwestycyjnego"],
      },
      wallet: {
        eyebrow: "Wallet Safety Preview",
        title: "Najpierw nazwa akcji, potem podpis.",
        body: "Connect, sign, approve i send nie mogą się mieszać.",
        detail: "Velmère nigdy nie powinno pytać o seed phrase ani private key. Portfel zostaje opcjonalny, domyślnie read-only, a każdy prompt portfela musi wyjaśniać dokładnie, co użytkownik podpisuje.",
        facts: ["Bez seed phrase", "Bez custody", "Tylko nazwane approvale"],
      },
      archive: {
        eyebrow: "Archive Entitlement Map",
        title: "Dostęp jako pokoje, nie martwa lista.",
        body: "Archiwum staje się mapą pokojów publicznych, member i pending.",
        detail: "Mapa archiwum pokazuje, co jest publiczne, co jest member-only i co czeka na wdrożenie. Dzięki temu dostęp jest przestrzenią, a nie niezrozumiałą listą kłódek.",
        facts: ["Pokoje publiczne", "Pokoje member", "Pokoje pending"],
      },
      order: {
        eyebrow: "Order-book Cart",
        title: "Przydzielony inventory row, nie chaos.",
        body: "Koszyk zachowuje się jak czyste linie rezerwacji.",
        detail: "Order-book daje zaufanie: rozmiar, ilość, VAT, kwota brutto i status alokacji są widoczne. Bierzemy precyzję giełdy, ale bez udawania, że checkout odzieży jest tradingiem.",
        facts: ["VAT widoczny", "Timer rezerwacji", "Jasna cena brutto"],
      },
      security: {
        eyebrow: "Dyscyplina Bitcoina",
        title: "Self-custody, jasne prompty, zero teatru.",
        body: "Security copy jest częścią produktu, nie dekoracją prawną.",
        detail: "Strona ma tłumaczyć, że Velmère nie przechowuje aktywów, nie prosi o klucze prywatne, nie ukrywa approvali i nie twierdzi, że kontrakt działa, dopóki nie ma deploymentu, weryfikacji, audytu i review prawnego.",
        facts: ["Self-custody", "Review kontraktu", "Bez ukrytych approvali"],
      },
    },
  },
  de: {
    title: "Pro ist ein Kontrollraum, kein Slogan.",
    body: "Jedes Modul öffnet ein lesbares Mikro-System: visueller Rhythmus, Sicherheitscopy, operative Grenzen und ein klarer Hinweis, dass VLM bis Contract, Audit und Legal Review read-only bleibt.",
    open: "Modul öffnen",
    close: "Schließen",
    status: "Read-only Vorschau",
    modules: {
      mobius: { eyebrow: "Möbius Routing Path", title: "Ein Pfad. Keine lose Kante.", body: "Eine kontinuierliche Access-Schleife zwischen Drop, Archiv und Square.", detail: "Der Möbius-Pfad ist eine Navigationsmetapher: vom Garment zum Drop-Signal und Archivkontext ohne Orientierungsverlust. Keine finanzielle Zusage.", facts: ["Drop → Archiv → Square", "Kontext bleibt", "Kein Live-Routing-Claim"] },
      amu: { eyebrow: "AMU Baseline", title: "3162.27 als visueller Takt.", body: "AMU ordnet Puls, Abstand und Interface-Timing.", detail: "AMU ist ein Marken-Metronom für Pulse, Delays und Node-Abstände. Symbolisch, bis ein realer technischer Einsatz geprüft ist.", facts: ["3162.27", "Visueller Rhythmus", "Kein Investment-Signal"] },
      wallet: { eyebrow: "Wallet Safety Preview", title: "Erst Aktion benennen, dann signieren.", body: "Connect, Sign, Approve und Send bleiben getrennt.", detail: "Velmère fragt nie nach Seed Phrase oder Private Key. Wallets bleiben optional und read-only, bis eine klare Wallet-Aktion bestätigt wird.", facts: ["Keine Seed Phrase", "Keine Custody", "Nur benannte Approvals"] },
      archive: { eyebrow: "Archive Entitlement Map", title: "Access als Räume, nicht als Liste.", body: "Archiv-Sichtbarkeit wird zur Karte aus Public-, Member- und Pending-Räumen.", detail: "Die Archivkarte zeigt, was öffentlich ist, was Member-only ist und was noch auf Deployment wartet.", facts: ["Public Rooms", "Member Rooms", "Pending Rooms"] },
      order: { eyebrow: "Order-book Cart", title: "Reservierte Inventory-Zeilen.", body: "Warenkorbzeilen wirken wie saubere Reservierungen.", detail: "Größe, Menge, MwSt., Brutto und Reservierungsstatus bleiben sichtbar – Präzision ohne Trading-Behauptung.", facts: ["MwSt. sichtbar", "Reservierungstimer", "Brutto klar"] },
      security: { eyebrow: "Bitcoin Discipline", title: "Self-custody, klare Prompts, kein Theater.", body: "Security Copy ist Produktlogik, nicht Dekoration.", detail: "Velmère verwahrt keine Assets, fragt keine Keys ab, versteckt keine Approvals und behauptet keinen Live-Contract vor Audit und Legal Review.", facts: ["Self-custody", "Contract Review", "Keine versteckten Approvals"] },
    },
  },
};

const moduleOrder: ModuleKey[] = ["mobius", "amu", "wallet", "archive", "order", "security"];
const topModuleKeys: ModuleKey[] = ["amu", "wallet"];
const bottomModuleKeys: ModuleKey[] = ["archive", "order", "security"];
const iconMap = { mobius: Infinity, amu: Layers3, wallet: WalletCards, archive: Archive, order: Route, security: ShieldCheck } as const;

function MobiusVisual({ large = false }: { large?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 520 250" className={large ? "h-64 w-full" : "h-36 w-full"} aria-hidden="true">
      <defs>
        <radialGradient id="mobiusGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212,175,55,0.42)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="260" cy="124" rx="128" ry="54" fill="url(#mobiusGlow)" opacity="0.22" />
      <path d="M72 126 C136 22, 218 44, 260 126 C302 208, 384 230, 448 126 C384 22, 302 44, 260 126 C218 208, 136 230, 72 126" fill="none" stroke="rgba(245,240,232,0.22)" strokeWidth="2" />
      <path d="M72 126 C136 22, 218 44, 260 126 C302 208, 384 230, 448 126 C384 22, 302 44, 260 126 C218 208, 136 230, 72 126" fill="none" stroke="rgba(212,175,55,0.72)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="10 18" className={reduced ? undefined : "velmere-dash-flow"} />
      <circle cx="260" cy="126" r="7" fill="#F5F0E8" className={reduced ? undefined : "velmere-pulse-dot"} />
    </svg>
  );
}

function AmuVisual({ large = false }: { large?: boolean }) {
  return (
    <div className={`grid place-items-center ${large ? "min-h-[18rem]" : "min-h-[9rem]"}`}>
      <div className="velmere-soft-breathe relative grid h-44 w-44 place-items-center rounded-full border border-velmere-gold/[0.25] bg-velmere-gold/[0.055] shadow-[0_0_90px_rgba(212,175,55,0.18)]">
        <span className="absolute inset-6 rounded-full border border-white/[0.10]" />
        <span className="absolute inset-12 rounded-full border border-velmere-gold/[0.20]" />
        <span className="font-serif text-4xl text-white">3162.27</span>
      </div>
    </div>
  );
}

function WalletVisual({ large = false }: { large?: boolean }) {
  const steps = ["connect", "sign", "approve", "send"];
  return <div className={`grid gap-3 ${large ? "sm:grid-cols-4" : "grid-cols-2"}`}>{steps.map((step, index) => <div key={step} className="rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4"><ShieldCheck className={`h-4 w-4 ${index === 1 ? "text-velmere-gold" : "text-white/[0.35]"}`} /><p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.55]">{step}</p></div>)}</div>;
}

function ArchiveVisual({ large = false }: { large?: boolean }) {
  const reduced = useReducedMotion();
  return <svg viewBox="0 0 520 250" className={large ? "h-64 w-full" : "h-36 w-full"}><path d="M60 168 C140 64, 200 148, 270 82 C350 4, 420 118, 466 70" fill="none" stroke="rgba(212,175,55,0.55)" strokeWidth="2" strokeDasharray="8 14" className={reduced ? undefined : "velmere-dash-flow"} />{[[60,168],[200,148],[270,82],[466,70],[350,118]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="7" fill="rgba(212,175,55,0.72)" className={reduced ? undefined : "velmere-pulse-dot"} style={{ animationDelay: `${i * .15}s` }} />)}</svg>;
}

function OrderVisual() {
  return <div className="grid gap-3">{["Structured cargo", "Heavy hoodie", "Access pass"].map((item, index) => <div key={item} className="rounded-xl border border-white/[0.10] bg-black/[0.20] p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm text-white/[0.78]">{item}</span><span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.10]"><motion.span className="block h-full rounded-full bg-velmere-gold/[0.70]" initial={{ width: 0 }} animate={{ width: `${62 + index * 8}%` }} transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }} /></span></div><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.32]">[ allocated ]</p></div>)}</div>;
}

function SecurityVisual({ large = false }: { large?: boolean }) {
  return <div className={`relative overflow-hidden rounded-2xl border border-white/[0.10] bg-black/[0.24] ${large ? "h-64" : "h-36"}`}><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:34px_34px]" />{[18,34,54,72,86].map((left, i) => <span key={left} className="velmere-signal-node absolute h-3 w-3 rounded-full bg-velmere-gold shadow-[0_0_26px_rgba(212,175,55,.55)]" style={{ left: `${left}%`, top: `${32 + (i % 2) * 26}%`, animationDelay: `${i * 0.18}s` }} />)}<div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">{["no seed", "no custody", "review"].map(item => <span key={item} className="rounded-full border border-white/[0.10] bg-black/[0.40] px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.15em] text-white/[0.48]">{item}</span>)}</div></div>;
}

function ModuleVisual({ type, large = false }: { type: ModuleKey; large?: boolean }) {
  if (type === "mobius") return <MobiusVisual large={large} />;
  if (type === "amu") return <AmuVisual large={large} />;
  if (type === "wallet") return <WalletVisual large={large} />;
  if (type === "archive") return <ArchiveVisual large={large} />;
  if (type === "order") return <OrderVisual />;
  return <SecurityVisual large={large} />;
}

export default function VlmSelectedSystems({ mode }: { mode: Mode }) {
  const locale = useLocale() as "en" | "pl" | "de";
  const t = copy[locale] ?? copy.en;
  const [active, setActive] = useState<ModuleKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [active]);

  const activeModule = useMemo(() => active ? t.modules[active] : null, [active, t.modules]);

  if (mode !== "pro") return null;

  return (
    <section id="vlm-pro-systems" className="luxury-section pb-24">
      <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
        <div>
          <p className="velmere-label text-velmere-gold">VLM Pro / selected systems</p>
          <h2 className="mt-5 max-w-3xl font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.86] tracking-[-0.065em] text-white">{t.title}</h2>
        </div>
        <p className="max-w-3xl text-sm leading-8 text-white/[0.62] md:text-base">{t.body}</p>
      </div>

      <div className="mt-10 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <button type="button" onClick={() => setActive("mobius")} className="group rounded-[2rem] border border-white/[0.10] bg-[#101013] p-5 text-left transition hover:border-velmere-gold/[0.35] active:scale-[0.99]">
          <div className="flex items-center justify-between gap-4"><p className="velmere-label text-velmere-gold">{t.modules.mobius.eyebrow}</p><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.35]">{t.open}</span></div>
          <MobiusVisual large />
        </button>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {topModuleKeys.map((key) => {
            const item = t.modules[key];
            const Icon = iconMap[key];
            return <button key={key} type="button" onClick={() => setActive(key)} className="rounded-[2rem] border border-white/[0.10] bg-[#101013] p-5 text-left transition hover:-translate-y-1 hover:border-velmere-gold/[0.35] active:scale-[0.99]"><Icon className="h-5 w-5 text-velmere-gold" /><p className="mt-5 velmere-label text-velmere-gold">{item.eyebrow}</p><h3 className="mt-4 font-serif text-3xl tracking-[-0.04em] text-white">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/[0.55]">{item.body}</p></button>;
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {bottomModuleKeys.map((key) => {
          const item = t.modules[key];
          const Icon = iconMap[key];
          return <button key={key} type="button" onClick={() => setActive(key)} className="rounded-[2rem] border border-white/[0.10] bg-[#101013] p-5 text-left transition hover:-translate-y-1 hover:border-velmere-gold/[0.35] active:scale-[0.99]"><Icon className="h-5 w-5 text-velmere-gold" /><p className="mt-5 velmere-label text-velmere-gold">{item.eyebrow}</p><h3 className="mt-4 font-serif text-2xl tracking-[-0.035em] text-white">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/[0.55]">{item.body}</p></button>;
        })}
      </div>

      {mounted ? createPortal(
        <AnimatePresence>
          {active && activeModule ? (
            <motion.div className="fixed inset-0 z-[220] grid place-items-center bg-black/[0.72] p-4 backdrop-blur-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
              <motion.article role="dialog" aria-modal="true" className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#111113] shadow-2xl shadow-black/[0.70]" initial={{ opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 26, scale: 0.97 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-white/[0.10] p-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">{activeModule.eyebrow}</p><h3 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-white md:text-5xl">{activeModule.title}</h3></div><button type="button" onClick={() => setActive(null)} className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.10] text-white/[0.50] transition hover:text-white"><X className="h-4 w-4" /></button></div>
                <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]"><div className="border-b border-white/[0.10] p-5 md:border-b-0 md:border-r"><ModuleVisual type={active} large /></div><div className="p-5 md:p-7"><p className="text-sm leading-8 text-white/[0.68] md:text-base">{activeModule.detail}</p><div className="mt-7 grid gap-3">{activeModule.facts.map((fact) => <div key={fact} className="flex items-center gap-3 rounded-2xl border border-white/[0.10] bg-black/[0.24] px-4 py-3"><BadgeCheck className="h-4 w-4 text-velmere-gold" /><span className="text-sm text-white/[0.62]">{fact}</span></div>)}</div><p className="mt-7 rounded-2xl border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] p-4 font-mono text-[10px] uppercase leading-6 tracking-[0.16em] text-velmere-gold">{t.status}</p></div></div>
              </motion.article>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      ) : null}
    </section>
  );
}
