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

const researchValidationCopy = {
  pl: {
    kicker: "validation matrix",
    title: "Jak to pokazywać, żeby brzmiało mocno, ale uczciwie.",
    body: "Research Lab ma być miejscem dla hipotez, audytów i replikacji. Najlepsza psychologia zaufania to nie krzyczeć ‘przełom’, tylko pokazać test, limit i następny krok.",
    rows: [
      { label: "Dataset", status: "jawny", body: "Zakresy, seed, próbki i wersje testów muszą być opisane tak, żeby ktoś mógł to powtórzyć." },
      { label: "Benchmark", status: "porównanie", body: "Wynik ma być zestawiony z prostym baseline i klasyczną metodą, nie tylko z własną poprzednią wersją." },
      { label: "Negative controls", status: "wymagane", body: "Trzeba sprawdzić, czy model nie działa tylko na dobranych oknach albo parametrach." },
      { label: "Peer review", status: "przed claimem", body: "Bez zewnętrznej replikacji sekcja mówi ‘research’, a nie ‘dowód’." },
    ],
  },
  de: {
    kicker: "Validation Matrix",
    title: "Stark zeigen, aber ehrlich bleiben.",
    body: "Research Lab ist für Hypothesen, Audits und Replikation. Vertrauen entsteht nicht durch ‘Durchbruch’-Sprache, sondern durch Test, Grenze und nächsten Schritt.",
    rows: [
      { label: "Dataset", status: "offen", body: "Ranges, Seeds, Samples und Testversionen müssen so beschrieben sein, dass andere es wiederholen können." },
      { label: "Benchmark", status: "Vergleich", body: "Ergebnis gegen einfachen Baseline und klassische Methode zeigen, nicht nur gegen die eigene vorige Version." },
      { label: "Negative Controls", status: "erforderlich", body: "Prüfen, ob das Modell nicht nur auf ausgewählten Fenstern oder Parametern funktioniert." },
      { label: "Peer Review", status: "vor Claim", body: "Ohne externe Replikation heißt die Sektion Research, nicht Beweis." },
    ],
  },
  en: {
    kicker: "validation matrix",
    title: "Show the strength without overclaiming it.",
    body: "Research Lab is for hypotheses, audits and replication. Trust is not built by shouting ‘breakthrough’; it is built by showing the test, the limit and the next step.",
    rows: [
      { label: "Dataset", status: "open", body: "Ranges, seeds, samples and test versions must be described so another reviewer can repeat them." },
      { label: "Benchmark", status: "comparison", body: "Results should be compared with a simple baseline and a classical method, not only with the previous internal version." },
      { label: "Negative controls", status: "required", body: "Check that the model does not only work on selected windows or tuned parameters." },
      { label: "Peer review", status: "before claim", body: "Without external replication, the section says research, not proof." },
    ],
  },
} as const;

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
  const normalizedLocale = normalizeLocale(locale);
  const active = copy[normalizedLocale];
  const validation = researchValidationCopy[normalizedLocale];

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

          <div className="mt-6 rounded-[1.9rem] border border-velmere-gold/[0.13] bg-[linear-gradient(145deg,rgba(212,175,55,0.055),rgba(0,0,0,0.24),rgba(34,211,238,0.035))] p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">{validation.kicker}</p>
                <h2 className="mt-4 font-serif text-3xl leading-none tracking-[-0.04em] text-white md:text-5xl">{validation.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/[0.58]">{validation.body}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {validation.rows.map((row) => (
                  <article key={row.label} className="rounded-[1.35rem] border border-white/[0.075] bg-black/[0.24] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-white/[0.82]">{row.label}</h3>
                      <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.07] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.13em] text-velmere-gold">{row.status}</span>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-white/[0.54]">{row.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
