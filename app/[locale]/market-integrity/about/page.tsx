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
    live: ["Live market data", "Multi-agent risk score", "Klines / order book", "Risk memory ledger", "Evidence report API"],
    rd: ["Wallet clustering", "Social NLP", "Mempool simulation", "Cross-chain tracking", "GNN anomaly model"],
  },
  en: {
    kicker: "Velmère Shield",
    title: "What is Shield?",
    body: "A private RegTech/Web3 layer that fuses market data, order-book microstructure, liquidity, contract data and risk memory into one readable signal. It is not a verdict or investment advice — it is an early-warning system.",
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
    live: ["Live market data", "Multi-agent risk score", "Klines / order book", "Risk memory ledger", "Evidence report API"],
    rd: ["Wallet clustering", "Social NLP", "Mempool simulation", "Cross-chain tracking", "GNN anomaly model"],
  },
  de: {
    kicker: "Velmère Shield",
    title: "Was ist Shield?",
    body: "Eine private RegTech/Web3-Schicht, die Marktdaten, Orderbook-Mikrostruktur, Liquidität, Contract-Daten und Risk Memory zu einem lesbaren Signal verdichtet. Kein Urteil und keine Anlageberatung — ein Frühwarnsystem.",
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
    live: ["Live market data", "Multi-agent risk score", "Klines / order book", "Risk memory ledger", "Evidence report API"],
    rd: ["Wallet clustering", "Social NLP", "Mempool simulation", "Cross-chain tracking", "GNN anomaly model"],
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
