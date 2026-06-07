import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import { buildVelmereMetadata, SUPPORTED_LOCALES } from "@/lib/seo/metadata";

type Locale = "pl" | "de" | "en";

const copy = {
  pl: {
    kicker: "prime lab · kryptografia · research deterministyczny",
    title: "Velmère Research Lab",
    subtitle: "Kryptografia, liczby pierwsze i determinizm informacyjny przedstawione jako testowalny research, nie jako obietnica przełamania zabezpieczeń.",
    badge: "audyt numeryczny · wymaga replikacji",
    back: "Wróć do VLM",
    cards: [
      { label: "Kryptografia", title: "Sekret pozostaje sekretem", body: "Podpis i weryfikacja pozwalają udowodnić kontrolę bez ujawniania prywatnego klucza." },
      { label: "Liczby pierwsze", title: "Mierzalny błąd rekonstrukcji", body: "Badamy resztę funkcji liczącej liczby pierwsze i porównujemy model z klasycznymi baseline'ami." },
      { label: "B. Protocol", title: "Skończona rekonstrukcja numeryczna", body: "Hipoteza jest oceniana przez holdout, przesunięcia parametrów, kontrolę sztucznych zer i niezależną replikację." },
      { label: "Entropia", title: "Deterministyczny model to nie RNG", body: "Źródło klucza wymaga jakościowej losowości. Model matematyczny nie zastępuje fizycznej entropii." },
    ],
    method: "Metoda badawcza",
    steps: [
      ["01", "Baseline", "Porównaj π(x), R(x) i klasyczne przybliżenia przed dodaniem korekty."],
      ["02", "B. Protocol", "Zdefiniuj skończoną korektę, parametry i przewidywany zakres działania."],
      ["03", "Falsification", "Sprawdź holdout, fake zeros, neighbor shift i stabilność poza dobranym oknem."],
      ["04", "Replication", "Udostępnij metodę i wyniki do niezależnego odtworzenia przed mocniejszym claimem."],
    ],
    boundaryTitle: "Granica twierdzenia",
    boundary: "Research Lab może mówić o benchmarku, rekonstrukcji, błędzie i falsyfikacji. Nie twierdzi, że udowodniono hipotezę Riemanna, złamano Bitcoin ani odzyskano prywatne klucze.",
    benchmarkTitle: "Audyt v3.1 · wyniki, które przeszły kontrolę",
    benchmarkIntro: "Liczby poniżej pochodzą z lokalnego raportu B. Protocol, aktualizowanego do testów v59. Najmocniejszy argument dotyczy skończonej rekonstrukcji numerycznej, nie twierdzenia asymptotycznego.",
    metrics: [
      ["v51 holdout", "800 punktów", "zamrożona mapa Adaptive-K"],
      ["Redukcja MAE", "96,734%", "53 871,13 → 1 759,36 względem R(x)"],
      ["Wygrane v51", "795 / 800", "bez dostrajania na zbiorze holdout"],
      ["v40 mixed-sign", "MAE 3,197", "najmocniejszy test dopasowania punktowego"],
    ],
    inverseTitle: "Odwrócona formuła · aktywny tor testowy",
    inverseBody: "Badamy, czy z obserwowanej reszty i stabilnego cutoffu można odtworzyć parametry korekty bez przecieku informacji z holdoutu. Ten tor pozostaje eksperymentalny.",
    inverseTests: [
      "Rozdziel trening skali od testu punktowego.",
      "Porównaj wynik z R(x), Li(x), stałą korektą i gładkim modelem log(x).",
      "Wykonaj neighbor-shift, shuffle wewnątrz okna i kontrolę sztucznych zer.",
      "Zamroź parametry przed nowym zakresem i opublikuj residuale.",
    ],
    caveat: "Ważna obserwacja v59: wąskie okna v51 są lokalnie gładkie, więc potwierdzają głównie zachowanie skali. v40/v49 pozostają mocniejszym testem fazy punktowej.",
  },
  de: {
    kicker: "prime lab · kryptografie · deterministische forschung",
    title: "Velmère Research Lab",
    subtitle: "Kryptografie, Primzahlen und Informationsdeterminismus als testbarer Research, nicht als Versprechen gebrochener Sicherheit.",
    badge: "numerisches Audit · Replikation erforderlich",
    back: "Zurück zu VLM",
    cards: [
      { label: "Kryptografie", title: "Das Secret bleibt geheim", body: "Signatur und Verifikation beweisen Kontrolle, ohne den privaten Schlüssel offenzulegen." },
      { label: "Primzahlen", title: "Messbarer Rekonstruktionsfehler", body: "Wir untersuchen den Residual der Primzahlzählfunktion und vergleichen das Modell mit klassischen Baselines." },
      { label: "B. Protocol", title: "Finite numerische Rekonstruktion", body: "Die Hypothese wird mit Holdout, Parameter-Shifts, Fake-Zeros und unabhängiger Replikation geprüft." },
      { label: "Entropie", title: "Determinismus ist kein RNG", body: "Schlüsselmaterial braucht hochwertige Zufälligkeit. Ein mathematisches Modell ersetzt keine physische Entropie." },
    ],
    method: "Forschungsmethode",
    steps: [
      ["01", "Baseline", "π(x), R(x) und klassische Näherungen vor jeder Korrektur vergleichen."],
      ["02", "B. Protocol", "Finite Korrektur, Parameter und erwarteten Geltungsbereich definieren."],
      ["03", "Falsifikation", "Holdout, Fake-Zeros, Neighbor Shift und Stabilität außerhalb des Fensters testen."],
      ["04", "Replikation", "Methode und Ergebnisse vor stärkeren Claims unabhängig reproduzieren lassen."],
    ],
    boundaryTitle: "Claim-Grenze",
    boundary: "Research Lab darf über Benchmark, Rekonstruktion, Fehler und Falsifikation sprechen. Es behauptet keinen Beweis der Riemann-Hypothese, keinen Bitcoin-Bruch und keine Wiederherstellung privater Schlüssel.",
    benchmarkTitle: "Audit v3.1 · kontrollierte Ergebnisse",
    benchmarkIntro: "Die Werte stammen aus dem lokalen B.-Protocol-Bericht bis Test v59. Die stärkste Aussage betrifft eine finite numerische Rekonstruktion, kein asymptotisches Theorem.",
    metrics: [
      ["v51 Holdout", "800 Punkte", "eingefrorene Adaptive-K-Map"],
      ["MAE-Reduktion", "96,734%", "53.871,13 → 1.759,36 gegenüber R(x)"],
      ["v51 Siege", "795 / 800", "ohne Tuning auf dem Holdout"],
      ["v40 Mixed-Sign", "MAE 3,197", "stärkster punktweiser Alignment-Test"],
    ],
    inverseTitle: "Inverse Formulierung · aktiver Testpfad",
    inverseBody: "Wir testen, ob Korrekturparameter aus Residual und stabilem Cutoff ohne Holdout-Leakage rekonstruiert werden können. Dieser Pfad bleibt experimentell.",
    inverseTests: [
      "Skalen-Training vom punktweisen Test trennen.",
      "Mit R(x), Li(x), konstanter Korrektur und glattem log(x)-Modell vergleichen.",
      "Neighbor-Shift, Window-Shuffle und Fake-Zero-Kontrollen ausführen.",
      "Parameter vor einem neuen Bereich einfrieren und Residuals veröffentlichen.",
    ],
    caveat: "Wichtige v59-Beobachtung: enge v51-Fenster sind lokal glatt und validieren primär Skalenverhalten. v40/v49 bleiben der stärkere punktweise Phasentest.",
  },
  en: {
    kicker: "prime lab · cryptography · deterministic research",
    title: "Velmère Research Lab",
    subtitle: "Cryptography, prime numbers and informational determinism framed as testable research, not a promise to defeat security.",
    badge: "numerical audit · replication required",
    back: "Back to VLM",
    cards: [
      { label: "Cryptography", title: "The secret stays secret", body: "Signatures and verification prove control without revealing the private key." },
      { label: "Prime numbers", title: "Measurable reconstruction error", body: "We study the residual of the prime-counting function and compare the model with classical baselines." },
      { label: "B. Protocol", title: "Finite numerical reconstruction", body: "The hypothesis is evaluated through holdout, parameter shifts, fake-zero controls and independent replication." },
      { label: "Entropy", title: "Determinism is not RNG", body: "Key material needs high-quality randomness. A mathematical model does not replace physical entropy." },
    ],
    method: "Research method",
    steps: [
      ["01", "Baseline", "Compare π(x), R(x) and classical approximations before adding a correction."],
      ["02", "B. Protocol", "Define the finite correction, parameters and expected operating range."],
      ["03", "Falsification", "Test holdout, fake zeros, neighbor shift and stability outside the selected window."],
      ["04", "Replication", "Publish the method and results for independent reproduction before stronger claims."],
    ],
    boundaryTitle: "Claim boundary",
    boundary: "Research Lab may discuss benchmarks, reconstruction, error and falsification. It does not claim a proof of the Riemann hypothesis, a break of Bitcoin or recovery of private keys.",
    benchmarkTitle: "Audit v3.1 · controlled results",
    benchmarkIntro: "The figures below come from the local B. Protocol report through test v59. The strongest claim is a finite numerical reconstruction, not an asymptotic theorem.",
    metrics: [
      ["v51 holdout", "800 points", "frozen Adaptive-K map"],
      ["MAE reduction", "96.734%", "53,871.13 → 1,759.36 against R(x)"],
      ["v51 wins", "795 / 800", "without holdout retuning"],
      ["v40 mixed-sign", "MAE 3.197", "strongest pointwise alignment test"],
    ],
    inverseTitle: "Inverse formulation · active test lane",
    inverseBody: "We are testing whether correction parameters can be reconstructed from the residual and a stable cutoff without holdout leakage. This lane remains experimental.",
    inverseTests: [
      "Separate scale training from pointwise testing.",
      "Compare against R(x), Li(x), a constant correction and a smooth log(x) model.",
      "Run neighbor-shift, within-window shuffle and fake-zero controls.",
      "Freeze parameters before a new range and publish residuals.",
    ],
    caveat: "Important v59 observation: narrow v51 windows are locally smooth, so they mainly validate scale behavior. v40/v49 remain the stronger pointwise phase test.",
  },
} as const;

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/research-lab",
    title: "Velmère Research Lab",
    description: "Testable cryptography and prime-number research with clear claim boundaries.",
  });
}

export default function ResearchLabPage({ params: { locale } }: { params: { locale: string } }) {
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) notFound();
  unstable_setRequestLocale(locale);
  const safeLocale: Locale = locale === "de" || locale === "en" ? locale : "pl";
  const c = copy[safeLocale];

  return (
    <main className="min-h-screen bg-velmere-black px-5 pb-24 pt-28 text-white md:px-10 md:pt-36">
      <section className="mx-auto max-w-6xl">
        <Link href="/vlm" className="inline-flex rounded-full border border-white/[0.10] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.48] transition hover:text-white">{c.back}</Link>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,.7fr)]">
          <section className="rounded-[2rem] border border-white/[0.09] bg-[radial-gradient(circle_at_0%_0%,rgba(200,169,106,0.10),transparent_35%),rgba(255,255,255,0.025)] p-7 md:p-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.20em] text-velmere-gold">{c.kicker}</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] md:text-7xl">{c.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/[0.58]">{c.subtitle}</p>
            <p className="mt-6 inline-flex rounded-full border border-cyan-200/[0.15] bg-cyan-300/[0.05] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-100/[0.76]">{c.badge}</p>
          </section>

          <aside className="relative min-h-[350px] overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#0b0d0e] p-8">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <svg viewBox="0 0 320 320" className="relative h-full w-full" aria-label="Prime residual research diagram">
              <circle cx="160" cy="160" r="108" fill="none" stroke="rgba(200,169,106,.32)" />
              <circle cx="160" cy="160" r="72" fill="none" stroke="rgba(78,205,196,.25)" />
              <path d="M34 205 C76 78 122 248 164 122 C205 0 246 247 288 92" fill="none" stroke="rgba(200,169,106,.75)" strokeWidth="2" />
              <path d="M34 214 C82 177 118 185 160 160 C205 132 245 142 288 96" fill="none" stroke="rgba(78,205,196,.62)" strokeWidth="2" />
              <text x="160" y="150" textAnchor="middle" fill="white" fontSize="30" fontWeight="700">B.</text>
              <text x="160" y="178" textAnchor="middle" fill="rgba(255,255,255,.48)" fontSize="11" fontFamily="monospace">π(x) - R(x)</text>
            </svg>
          </aside>
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {c.cards.map((card) => (
            <article key={card.label} className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.025] p-5">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-velmere-gold">{card.label}</p>
              <h2 className="mt-3 text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-7 text-white/[0.52]">{card.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-4xl tracking-[-0.045em]">{c.method}</h2>
          <div className="mt-5 grid gap-3">
            {c.steps.map(([step, title, body]) => (
              <article key={step} className="grid gap-3 rounded-[1.4rem] border border-white/[0.08] bg-[#0c0d0e] p-5 sm:grid-cols-[3rem_11rem_1fr] sm:items-start">
                <span className="font-mono text-xs text-velmere-gold">{step}</span>
                <strong className="text-sm">{title}</strong>
                <p className="text-sm leading-7 text-white/[0.50]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-4xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">B. Protocol numerical record</p>
            <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em]">{c.benchmarkTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.52]">{c.benchmarkIntro}</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-[#0b0d0e]">
            {c.metrics.map(([label, value, note], index) => (
              <div key={label} className="grid gap-2 border-b border-white/[0.07] px-5 py-4 last:border-b-0 sm:grid-cols-[10rem_9rem_1fr] sm:items-center">
                <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.38]">{label}</span>
                <strong className="font-mono text-lg text-cyan-100">{value}</strong>
                <span className="text-sm text-white/[0.48]">{note}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl border border-cyan-200/[0.12] bg-cyan-300/[0.04] px-4 py-3 text-xs leading-6 text-cyan-50/[0.62]">{c.caveat}</p>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
          <div className="rounded-[1.6rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.045] p-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-velmere-gold">inverse reconstruction</p>
            <h2 className="mt-3 font-serif text-4xl tracking-[-0.045em]">{c.inverseTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.54]">{c.inverseBody}</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/[0.09] bg-white/[0.025] p-6">
            {c.inverseTests.map((test, index) => (
              <div key={test} className="flex gap-4 border-b border-white/[0.07] py-4 first:pt-0 last:border-b-0 last:pb-0">
                <span className="font-mono text-[10px] text-velmere-gold">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-sm leading-7 text-white/[0.54]">{test}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.05] p-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-velmere-gold">{c.boundaryTitle}</p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/[0.58]">{c.boundary}</p>
        </section>
      </section>
    </main>
  );
}
