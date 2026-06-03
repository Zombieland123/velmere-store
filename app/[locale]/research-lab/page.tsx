import type { Metadata } from "next";
import { Link } from "@/navigation";
import { buildVelmereMetadata } from "@/lib/seo/metadata";

type ResearchLocale = "pl" | "de" | "en";

const copy = {
  pl: {
    title: "Velmère Research Lab",
    subtitle: "Liczby pierwsze, kryptografia i Bajak Protocol pokazane jako rygorystyczny research — bez obietnic łamania kluczy i bez claimów bez replikacji.",
    kicker: "research lab · safe disclosure",
    badge: "numerical audit, not a proof claim",
    back: "Wróć do VLM",
    cards: [
      {
        label: "Bajak Protocol",
        value: "audyt numeryczny",
        body: "Research Lab może pokazywać redukcję błędu, testy falsyfikacyjne i rekonstrukcję rozkładu liczb pierwszych jako audyt numeryczny, nie jako publiczny dowód twierdzenia.",
      },
      {
        label: "Kryptografia",
        value: "granice bezpieczeństwa",
        body: "Wyjaśniamy, dlaczego liczby pierwsze są ważne dla kryptografii, ale nie sugerujemy łamania portfeli, seed phrase, kluczy prywatnych ani Bitcoina.",
      },
      {
        label: "Odwrócony wzór",
        value: "pipeline badawczy",
        body: "Wzór odwrócony jest komunikowany jako hipoteza i pipeline testów: dataset, benchmark, negatywne kontrole, replikacja, peer review.",
      },
    ],
    rails: [
      "Nie obiecujemy zysków, przewagi inwestycyjnej ani łamania kryptografii.",
      "Nie twierdzimy, że mamy dowód RH bez formalnej publikacji i recenzji.",
      "Pokazujemy testy, ograniczenia, missing data i plan falsyfikacji.",
      "VLM pozostaje warstwą access/utility, nie inwestycją.",
    ],
  },
  de: {
    title: "Velmère Research Lab",
    subtitle: "Primzahlen, Kryptografie und Bajak Protocol als strenges Research — ohne Key-Breaking-Versprechen und ohne unreplicated Claims.",
    kicker: "research lab · safe disclosure",
    badge: "numerisches Audit, kein Beweis-Claim",
    back: "Zurück zu VLM",
    cards: [
      {
        label: "Bajak Protocol",
        value: "numerisches Audit",
        body: "Research Lab kann Fehlerreduktion, Falsifikationstests und Primzahl-Rekonstruktion als numerisches Audit zeigen, nicht als öffentlichen Theorem-Beweis.",
      },
      {
        label: "Kryptografie",
        value: "Sicherheitsgrenzen",
        body: "Wir erklären, warum Primzahlen für Kryptografie wichtig sind, ohne Wallet-, Seed-Phrase-, Private-Key- oder Bitcoin-Angriffe zu suggerieren.",
      },
      {
        label: "Inverse Formel",
        value: "Research Pipeline",
        body: "Die inverse Formel wird als Hypothese und Testpipeline kommuniziert: Dataset, Benchmark, Negativkontrollen, Replikation, Peer Review.",
      },
    ],
    rails: [
      "Keine Gewinnversprechen, keine Investment-Edge und keine Kryptografie-Breaking-Claims.",
      "Kein RH-Beweis-Claim ohne formale Veröffentlichung und Review.",
      "Wir zeigen Tests, Grenzen, fehlende Daten und Falsifikationsplan.",
      "VLM bleibt Access/Utility-Layer, keine Investition.",
    ],
  },
  en: {
    title: "Velmère Research Lab",
    subtitle: "Prime numbers, cryptography and the Bajak Protocol framed as rigorous research — no key-breaking promises and no unrepeated claims.",
    kicker: "research lab · safe disclosure",
    badge: "numerical audit, not a proof claim",
    back: "Back to VLM",
    cards: [
      {
        label: "Bajak Protocol",
        value: "numerical audit",
        body: "Research Lab can show error reduction, falsification tests and prime-distribution reconstruction as a numerical audit, not as a public theorem proof.",
      },
      {
        label: "Cryptography",
        value: "safety boundary",
        body: "We explain why prime numbers matter in cryptography without suggesting wallet, seed phrase, private-key or Bitcoin-breaking capabilities.",
      },
      {
        label: "Inverse formula",
        value: "research pipeline",
        body: "The inverse formula is communicated as a hypothesis and test pipeline: dataset, benchmark, negative controls, replication and peer review.",
      },
    ],
    rails: [
      "No profit promises, no investment edge and no crypto-breaking claims.",
      "No RH-proof claim without formal publication and review.",
      "We show tests, limitations, missing data and falsification plan.",
      "VLM remains an access/utility layer, not an investment.",
    ],
  },
} satisfies Record<ResearchLocale, {
  title: string;
  subtitle: string;
  kicker: string;
  badge: string;
  back: string;
  cards: { label: string; value: string; body: string }[];
  rails: string[];
}>;

function normalizeLocale(locale: string): ResearchLocale {
  if (locale === "pl" || locale === "de") return locale;
  return "en";
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const active = copy[normalizeLocale(locale)];
  return buildVelmereMetadata({
    locale,
    path: "/research-lab",
    title: `${active.title} — Velmère`,
    description: active.subtitle,
  });
}

export default function ResearchLabPage({ params: { locale } }: { params: { locale: string } }) {
  const active = copy[normalizeLocale(locale)];

  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <section className="luxury-section min-h-[72vh] py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/vlm-token"
            className="inline-flex rounded-full border border-white/[0.10] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.55] transition hover:border-velmere-gold/[0.35] hover:text-velmere-gold"
          >
            {active.back}
          </Link>

          <div className="mt-10 rounded-[2.4rem] border border-velmere-gold/[0.14] bg-gradient-to-br from-velmere-gold/[0.08] via-white/[0.025] to-cyan-300/[0.055] p-6 md:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-velmere-gold">{active.kicker}</p>
            <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.065em] text-white md:text-7xl">
              {active.title}
            </h1>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-white/[0.58] md:text-base">
              {active.subtitle}
            </p>
            <p className="mt-6 inline-flex rounded-full border border-cyan-200/[0.14] bg-cyan-300/[0.055] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-50/[0.72]">
              {active.badge}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {active.cards.map((card) => (
                <article key={card.label} className="rounded-[1.6rem] border border-white/[0.08] bg-black/[0.24] p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.35]">{card.label}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-velmere-gold">{card.value}</p>
                  <p className="mt-3 text-xs leading-6 text-white/[0.55]">{card.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/[0.38]">release rails</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {active.rails.map((rail) => (
                <div key={rail} className="rounded-2xl border border-white/[0.07] bg-black/[0.22] p-4 text-xs leading-6 text-white/[0.56]">
                  {rail}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
