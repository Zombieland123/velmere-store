import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowRight, Bot, BrainCircuit, DatabaseZap, Gauge, Network, Radar, ShieldCheck, Workflow, Zap } from "lucide-react";
import { Link } from "@/navigation";
import { buildVelmereMetadata, SUPPORTED_LOCALES } from "@/lib/seo/metadata";

const copy = {
  pl: {
    kicker: "Velmère Shield",
    title: "Czym jest Shield?",
    body: "Prywatna warstwa RegTech/Web3, która łączy dane rynkowe, mikrostukturę order booka, płynność, kontrakt i pamięć ryzyka w jeden czytelny sygnał. To nie jest wyrok ani porada inwestycyjna — to system wczesnego ostrzegania.",
    visualTitle: "Jak działa sygnał Shielda",
    visualBody: "Dane wchodzą warstwami, agenci robią scoring, a meta-model zamienia chaos rynku w czytelną kartę ryzyka i case file do ręcznego review.",
    layers: ["Market data", "Klines + depth", "Risk agents", "Evidence report"],
    cta: "Wróć do radaru",
    blocks: [
      ["Live market data", "CoinGecko, DEX Screener, Binance depth/klines i GoPlus dostarczają dane po stronie serwera, bez ujawniania kluczy w przeglądarce."],
      ["Multi-Agent Fusion", "Velocity, liquidity, order book, holders, contract i data-quality działają jak osobni agenci. Meta-model składa ich wnioski w jeden wynik."],
      ["Risk Memory", "Bot sweep zapisuje snapshoty ryzyka i porównuje, czy token robi się spokojniejszy, czy zaczyna gwałtownie rosnąć pod kątem anomalii."],
      ["Evidence Report", "Każdy skan może zostać opisany jako raport: dane wejściowe, wykryte sygnały, ograniczenia i plan dalszego dochodzenia."],
    ],
    steps: ["Wpisujesz ticker lub adres kontraktu.", "Shield odpytuje źródła danych po stronie serwera.", "Agenci oceniają velocity, liquidity, order book, holders i kontrakt.", "Meta-model pokazuje score, confidence, reasoning i ograniczenia."],
    disclaimer: "Shield nie oskarża projektów i nie przewiduje zysków. Pokazuje anomalię, prawdopodobieństwo ryzyka i materiał do human review.",
    matrixTitle: "Co działa dziś / co jest R&D",
    matrixBody: "Shield jest budowany uczciwie: moduły live są oddzielone od modułów badawczych, żeby partnerzy, granty i użytkownicy widzieli, co już działa, a co wymaga finansowania R&D.",
    live: ["Live market data", "Multi-agent risk score", "Klines / order book", "Risk memory ledger", "Evidence report API", "Rules engine / watchlist"],
    rd: ["Wallet clustering", "Social NLP", "Mempool simulation", "Cross-chain tracking", "GNN anomaly model"],
    buildMeter: "Miernik budowy",
    progressTitle: "Budowa systemu krok po kroku",
    progressBody: "Aktualny etap to mocny MVP techniczny: mamy dane, agentów, wykres, ledger, crona i case files. Do wersji produkcyjnej brakuje głównie pełnego Supabase, alertów użytkownika, dokładniejszych źródeł on-chain, monitoringu SOC i testów build/e2e.",
    progress: [["MVP interfejsu", "82%"], ["Silnik ryzyka", "72%"], ["Produkcja/SOC", "42%"]],
  },
  en: {
    kicker: "Velmère Shield",
    title: "What is Shield?",
    body: "A private RegTech/Web3 layer that fuses market data, order-book microstructure, liquidity, contract data and risk memory into one readable signal. It is not a verdict or investment advice — it is an early-warning system.",
    visualTitle: "How the Shield signal works",
    visualBody: "Data enters in layers, agents score the evidence, and the meta-model turns market chaos into a readable risk card and case file for human review.",
    layers: ["Market data", "Klines + depth", "Risk agents", "Evidence report"],
    cta: "Back to radar",
    blocks: [
      ["Live market data", "CoinGecko, DEX Screener, Binance depth/klines and GoPlus provide server-side data without exposing keys in the browser."],
      ["Multi-Agent Fusion", "Velocity, liquidity, order book, holders, contract and data-quality act as separate agents. The meta-model fuses their conclusions into one result."],
      ["Risk Memory", "The sweep bot records risk snapshots and compares whether a token is cooling down or becoming anomalous fast."],
      ["Evidence Report", "Each scan can become a report: input data, detected signals, limitations and an investigation plan."],
    ],
    steps: ["Enter a ticker or contract address.", "Shield queries data sources server-side.", "Agents evaluate velocity, liquidity, order book, holders and contract risk.", "The meta-model shows score, confidence, reasoning and limitations."],
    disclaimer: "Shield does not accuse projects and does not predict profit. It surfaces anomalies, risk probability and material for human review.",
    matrixTitle: "What runs today / what is R&D",
    matrixBody: "Shield is built honestly: live modules are separated from research-grade modules so grants, partners and users can see what is already running and what needs R&D funding.",
    live: ["Live market data", "Multi-agent risk score", "Klines / order book", "Risk memory ledger", "Evidence report API", "Rules engine / watchlist"],
    rd: ["Wallet clustering", "Social NLP", "Mempool simulation", "Cross-chain tracking", "GNN anomaly model"],
    buildMeter: "Build meter",
    progressTitle: "Build progress, step by step",
    progressBody: "The current stage is a strong technical MVP: data, agents, charting, ledger, cron and case files are in place. Production still needs full Supabase rollout, user alerts, richer on-chain sources, SOC monitoring and build/e2e testing.",
    progress: [["Interface MVP", "82%"], ["Risk engine", "72%"], ["Production/SOC", "42%"]],
  },
  de: {
    kicker: "Velmère Shield",
    title: "Was ist Shield?",
    body: "Eine private RegTech/Web3-Schicht, die Marktdaten, Orderbook-Mikrostruktur, Liquidität, Contract-Daten und Risk Memory zu einem lesbaren Signal verdichtet. Kein Urteil und keine Anlageberatung — ein Frühwarnsystem.",
    visualTitle: "Wie das Shield-Signal funktioniert",
    visualBody: "Daten kommen in Schichten hinein, Agenten bewerten die Evidenz, und das Meta-Modell macht aus Marktchaos eine lesbare Risikokarte und einen Case File für Human Review.",
    layers: ["Market data", "Klines + depth", "Risk agents", "Evidence report"],
    cta: "Zurück zum Radar",
    blocks: [
      ["Live-Marktdaten", "CoinGecko, DEX Screener, Binance Depth/Klines und GoPlus liefern serverseitige Daten, ohne Schlüssel im Browser offenzulegen."],
      ["Multi-Agent Fusion", "Velocity, Liquidität, Orderbook, Holder, Contract und Data Quality arbeiten als separate Agenten. Das Meta-Modell fusioniert ihre Schlussfolgerungen."],
      ["Risk Memory", "Der Sweep-Bot speichert Risk-Snapshots und vergleicht, ob ein Token abkühlt oder schnell anomal wird."],
      ["Evidence Report", "Jeder Scan kann als Bericht ausgegeben werden: Eingangsdaten, Signale, Grenzen und Untersuchungsplan."],
    ],
    steps: ["Ticker oder Contract-Adresse eingeben.", "Shield fragt Datenquellen serverseitig ab.", "Agenten bewerten Velocity, Liquidität, Orderbook, Holder und Contract-Risiko.", "Das Meta-Modell zeigt Score, Confidence, Reasoning und Grenzen."],
    disclaimer: "Shield beschuldigt keine Projekte und prognostiziert keine Gewinne. Es zeigt Anomalien, Risikowahrscheinlichkeit und Material für Human Review.",
    matrixTitle: "Was heute läuft / was R&D ist",
    matrixBody: "Shield wird transparent aufgebaut: Live-Module sind von Forschungsmodulen getrennt, damit Partner, Fördergeber und Nutzer sehen, was bereits läuft und was R&D-Finanzierung braucht.",
    live: ["Live market data", "Multi-agent risk score", "Klines / order book", "Risk memory ledger", "Evidence report API", "Rules engine / watchlist"],
    rd: ["Wallet clustering", "Social NLP", "Mempool simulation", "Cross-chain Tracking", "GNN-Anomalie-Modell"],
    buildMeter: "Build-Meter",
    progressTitle: "Systemaufbau Schritt für Schritt",
    progressBody: "Der aktuelle Stand ist ein starkes technisches MVP: Daten, Agenten, Charts, Ledger, Cron und Case Files sind vorhanden. Für Produktion fehlen vor allem vollständiges Supabase, Nutzer-Alerts, bessere On-chain-Quellen, SOC-Monitoring und Build/e2e-Tests.",
    progress: [["Interface-MVP", "82%"], ["Risk Engine", "72%"], ["Produktion/SOC", "42%"]],
  },
} as const;

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/market-integrity/about",
    title: "What is Velmère Shield?",
    description: "How the Velmère Shield market-integrity radar combines live data, risk agents and evidence reports.",
  });
}

export default function MarketIntegrityAboutPage({ params: { locale } }: { params: { locale: string } }) {
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) notFound();
  unstable_setRequestLocale(locale);
  const t = copy[locale as keyof typeof copy];
  const icons = [DatabaseZap, Bot, Radar, Workflow];

  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <section className="luxury-section pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="velmere-label text-velmere-gold">{t.kicker}</p>
          <h1 className="mx-auto mt-4 max-w-[12ch] font-serif text-[clamp(2.4rem,6vw,6rem)] leading-[0.88] tracking-[-0.06em]">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-velmere-grey-soft md:text-base">{t.body}</p>
          <Link href="/market-integrity" className="mt-7 inline-flex items-center gap-3 rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:bg-velmere-gold/[0.14]">
            <ShieldCheck className="h-4 w-4" /> {t.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="luxury-section py-6">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#0b0b0d] p-6 shadow-velmere-card">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,169,106,0.14),transparent_34%),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,58px_58px,58px_58px]" />
            <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2"><div className="h-full w-full rounded-full border border-velmere-gold/[0.16] velmere-signal-ring" /></div>
            <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2"><div className="h-full w-full rounded-full border border-white/[0.10] velmere-signal-ring" /></div>
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2"><div className="h-full w-full rounded-full border border-emerald-300/[0.12] velmere-signal-ring" /></div>
            <div className="absolute left-1/2 top-1/2 h-[1px] w-36 origin-left bg-gradient-to-r from-velmere-gold to-transparent velmere-signal-ring" />
            <div className="relative z-10 flex h-full min-h-[20rem] flex-col items-center justify-center text-center">
              <ShieldCheck className="h-9 w-9 text-velmere-gold velmere-soft-breathe" />
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">Live anomaly fusion</p>
              <p className="mt-3 max-w-xs text-sm leading-7 text-white/[0.58]">{t.visualBody}</p>
            </div>
          </div>
          <div>
            <p className="velmere-label text-velmere-gold">System map</p>
            <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">{t.visualTitle}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/[0.52]">{t.visualBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {t.layers.map((layer, index) => (
                <div key={layer} className="group rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4 transition hover:border-velmere-gold/[0.24] hover:bg-velmere-gold/[0.045]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.34]">0{index + 1}</span>
                  <p className="mt-2 text-sm font-semibold text-white">{layer}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full bg-velmere-gold transition-all duration-700 group-hover:w-full" style={{ width: `${26 + index * 18}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section py-6">
        <div className="grid gap-3 md:grid-cols-4">
          {t.blocks.map(([title, body], index) => {
            const Icon = icons[index] ?? Gauge;
            return (
              <div key={title} className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-white/[0.030] p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-velmere-gold/[0.08] blur-2xl transition group-hover:bg-velmere-gold/[0.14]" />
                <Icon className="relative h-5 w-5 text-velmere-gold" />
                <h2 className="relative mt-5 text-base font-semibold text-white">{title}</h2>
                <p className="relative mt-3 text-xs leading-6 text-white/[0.48]">{body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="luxury-section py-8">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr]">
          <div className="rounded-[2rem] border border-white/[0.10] bg-[#0c0c0e] p-6">
            <Network className="h-5 w-5 text-velmere-gold" />
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.04em]">Data fusion pipeline</h2>
            <p className="mt-4 text-sm leading-7 text-white/[0.50]">{t.disclaimer}</p>
          </div>
          <div className="grid gap-3">
            {t.steps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08] font-mono text-[10px] text-velmere-gold">0{index + 1}</span>
                <p className="text-sm leading-7 text-white/[0.62]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section py-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#0b0b0d] p-6 shadow-velmere-card md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="velmere-label text-velmere-gold">{t.buildMeter}</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">{t.progressTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-white/[0.50]">{t.progressBody}</p>
            </div>
            <div className="grid gap-3">
              {t.progress.map(([label, value], index) => (
                <div key={label} className="rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.44]">0{index + 1} · {label}</span>
                    <span className="font-mono text-sm text-velmere-gold">{value}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-velmere-gold" style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section pb-20 md:pb-28">
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#0b0b0d] p-6 shadow-velmere-card md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="velmere-label text-velmere-gold">AI research map</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">{t.matrixTitle}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/[0.48]">{t.matrixBody}</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-emerald-300/[0.14] bg-emerald-400/[0.045] p-5">
              <div className="flex items-center gap-3 text-emerald-100"><Zap className="h-5 w-5" /><span className="font-mono text-[10px] uppercase tracking-[0.16em]">Live modules</span></div>
              <div className="mt-4 grid gap-2">
                {t.live.map((item) => <div key={item} className="rounded-xl border border-white/[0.08] bg-black/[0.18] px-4 py-3 text-sm text-white/[0.68]">{item}</div>)}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-5">
              <div className="flex items-center gap-3 text-velmere-gold"><BrainCircuit className="h-5 w-5" /><span className="font-mono text-[10px] uppercase tracking-[0.16em]">R&D roadmap</span></div>
              <div className="mt-4 grid gap-2">
                {t.rd.map((item) => <div key={item} className="rounded-xl border border-white/[0.08] bg-black/[0.18] px-4 py-3 text-sm text-white/[0.68]">{item}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
