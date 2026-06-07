"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Database,
  ExternalLink,
  Loader2,
  Radar,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/navigation";

type Locale = "pl" | "de" | "en";
type EvidenceState =
  | "confirmed"
  | "likely"
  | "unverified"
  | "red_flag"
  | "unknown";

type InvestigatorLane = {
  id: "supply" | "unlock" | "liquidity" | "insider" | "social" | "contract";
  label: string;
  score: number;
  status: EvidenceState;
  headline: string;
  body: string;
  nextStep: string;
};

type InvestigatorAction = {
  id: string;
  label: string;
  priority: "low" | "medium" | "high" | "critical";
  body: string;
  command: string;
};

type Investigator = {
  title: string;
  quickVerdict: string;
  finalVerdict: string;
  overallRisk: number;
  confidence: "Low" | "Medium" | "High";
  confidenceScore: number;
  lanes: InvestigatorLane[];
  nextActions: InvestigatorAction[];
  webQueries: string[];
  caseFrame: {
    asset: string;
    sourceState: string;
    primaryConcern: string;
    missingData: string[];
    operatorMode: string;
  };
};

type EngineStatus = {
  marketData: "live";
  riskEngine: "connected";
  generativeNarrative: "configured" | "not_configured";
  webOsint: "not_connected";
};

type CoinSuggestion = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  rank?: number | null;
};

type RiskSnapshot = {
  token: {
    marketId?: string;
    symbol: string;
    name: string;
    image?: string;
    rank?: number;
  };
  metrics: {
    currentPrice?: number;
    marketCap?: number;
    fdv?: number;
    volume24h?: number;
    priceChange1h?: number;
    priceChange24h?: number;
    priceChange7d?: number;
    circulatingSupply?: number;
    totalSupply?: number;
    maxSupply?: number;
  };
  dataQuality: "demo" | "partial" | "live";
};

type InvestigatorResponse =
  | {
      mode: "live";
      investigator: Investigator;
      engine: EngineStatus;
      result: RiskSnapshot;
      generatedAt: string;
    }
  | { mode: "error"; error: string };

const localSuggestions: CoinSuggestion[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    rank: 1,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    rank: 2,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    rank: 6,
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    rank: 10,
  },
];

const copy = {
  pl: {
    back: "Wróć do Shield",
    kicker: "Velmère Shield Map",
    title: "Sprawdź ryzyko. Zobacz braki. Wykonaj następny krok.",
    subtitle:
      "Jedna analiza zamiast ściany paneli. Shield łączy dane rynkowe z sześcioma osiami ryzyka i jasno mówi, czego jeszcze nie potwierdzono.",
    placeholder: "Wpisz symbol, nazwę tokena lub adres kontraktu",
    scan: "Skanuj",
    scanning: "Analizuję",
    source: "Stan źródeł",
    missing: "Czego brakuje",
    next: "Najbliższe działania",
    research: "Zapytania do dalszego researchu",
    openMarkets: "Otwórz Real Markets",
    openLens: "Otwórz Browser / PDF",
    risk: "Ryzyko",
    confidence: "Pewność",
    plainTitle: "Co to oznacza teraz",
    numbers: "Najważniejsze liczby",
    price: "Cena",
    marketCap: "Kapitalizacja",
    volume: "Wolumen",
    calmButIncomplete:
      "Dane cenowe nie pokazują obecnie skrajnej presji, ale niski wynik ryzyka nie oznacza bezpieczeństwa. Najpierw sprawdź brakujące źródła wskazane niżej.",
    elevated:
      "Kilka warstw pokazuje podwyższoną presję. Nie opieraj decyzji wyłącznie na cenie; sprawdź płynność, podaż i największy blocker.",
    high:
      "Presja ryzyka jest wysoka. Wynik wymaga ograniczenia ekspozycji i potwierdzenia źródeł przed mocniejszym wnioskiem.",
    confidenceLow:
      "Pewność jest ograniczona przez brakujące dane. Shield pokazuje, czego nie wie, zamiast udawać finalny werdykt.",
    emptyTitle: "Zacznij od symbolu",
    emptyBody:
      "Shield najpierw pobierze bieżący snapshot rynku, potem oceni podaż, unlocki, płynność, holderów, social/KOL i kontrakt.",
    liveData: "Dane rynkowe",
    riskEngine: "Silnik ryzyka",
    aiLayer: "Warstwa generatywna",
    osint: "Web OSINT",
    connected: "połączony",
    notConfigured: "brak konfiguracji",
    notConnected: "niepodłączony",
    prescreen:
      "To jest pre-screen, nie finalny werdykt. Bez aktualnego web OSINT system nie potwierdza vestingu, KOL, unlocków ani kontraktu.",
  },
  de: {
    back: "Zurück zu Shield",
    kicker: "Velmère Shield Map",
    title: "Risiko prüfen. Lücken sehen. Nächsten Schritt ausführen.",
    subtitle:
      "Eine Analyse statt einer Wand aus Panels. Shield verbindet Marktdaten mit sechs Risikospuren und zeigt offen, was noch nicht bestätigt ist.",
    placeholder: "Symbol, Tokenname oder Contract-Adresse eingeben",
    scan: "Scannen",
    scanning: "Analyse",
    source: "Quellenstatus",
    missing: "Fehlende Daten",
    next: "Nächste Schritte",
    research: "Weitere Research-Abfragen",
    openMarkets: "Real Markets öffnen",
    openLens: "Browser / PDF öffnen",
    risk: "Risiko",
    confidence: "Konfidenz",
    plainTitle: "Was das jetzt bedeutet",
    numbers: "Wichtigste Zahlen",
    price: "Preis",
    marketCap: "Marktkapitalisierung",
    volume: "Volumen",
    calmButIncomplete:
      "Die Preisdaten zeigen derzeit keinen extremen Druck, aber ein niedriger Risikowert ist kein Sicherheitsnachweis. Prüfe zuerst die fehlenden Quellen.",
    elevated:
      "Mehrere Ebenen zeigen erhöhten Druck. Verlasse dich nicht nur auf den Preis; prüfe Liquidität, Supply und den größten Blocker.",
    high:
      "Der Risikodruck ist hoch. Quellen und Exponierung müssen vor einer stärkeren Aussage geprüft werden.",
    confidenceLow:
      "Die Konfidenz ist durch fehlende Daten begrenzt. Shield zeigt offen, was nicht bekannt ist.",
    emptyTitle: "Mit einem Symbol starten",
    emptyBody:
      "Shield lädt zuerst den aktuellen Markt-Snapshot und bewertet dann Supply, Unlocks, Liquidität, Holder, Social/KOL und Contract.",
    liveData: "Marktdaten",
    riskEngine: "Risk Engine",
    aiLayer: "Generative Ebene",
    osint: "Web OSINT",
    connected: "verbunden",
    notConfigured: "nicht konfiguriert",
    notConnected: "nicht verbunden",
    prescreen:
      "Dies ist ein Pre-Screen, kein finales Urteil. Ohne aktuelles Web-OSINT bestätigt das System Vesting, KOL, Unlocks oder Contract nicht.",
  },
  en: {
    back: "Back to Shield",
    kicker: "Velmère Shield Map",
    title: "Check risk. See the gaps. Take the next step.",
    subtitle:
      "One analysis instead of a wall of panels. Shield combines market data with six risk lanes and states clearly what remains unverified.",
    placeholder: "Enter a symbol, token name or contract address",
    scan: "Scan",
    scanning: "Analyzing",
    source: "Source state",
    missing: "Missing data",
    next: "Next actions",
    research: "Further research queries",
    openMarkets: "Open Real Markets",
    openLens: "Open Browser / PDF",
    risk: "Risk",
    confidence: "Confidence",
    plainTitle: "What this means now",
    numbers: "Key numbers",
    price: "Price",
    marketCap: "Market cap",
    volume: "Volume",
    calmButIncomplete:
      "Price data does not show extreme pressure right now, but a low risk score is not proof of safety. Verify the missing sources below first.",
    elevated:
      "Several layers show elevated pressure. Do not rely on price alone; check liquidity, supply and the largest blocker.",
    high:
      "Risk pressure is high. Verify the sources and control exposure before drawing a stronger conclusion.",
    confidenceLow:
      "Confidence is constrained by missing data. Shield states what it does not know instead of presenting a false final verdict.",
    emptyTitle: "Start with a symbol",
    emptyBody:
      "Shield first loads a current market snapshot, then reviews supply, unlocks, liquidity, holders, social/KOL and contract risk.",
    liveData: "Market data",
    riskEngine: "Risk engine",
    aiLayer: "Generative layer",
    osint: "Web OSINT",
    connected: "connected",
    notConfigured: "not configured",
    notConnected: "not connected",
    prescreen:
      "This is a pre-screen, not a final verdict. Without current web OSINT the system does not confirm vesting, KOL activity, unlocks or the contract.",
  },
} as const;

const laneLabels = {
  pl: {
    supply: "Podaż / float",
    unlock: "Vesting / unlocki",
    liquidity: "Płynność / wyjście",
    insider: "Holderzy / insiderzy",
    social: "Social / KOL",
    contract: "Kontrakt / governance",
  },
  de: {
    supply: "Supply / Float",
    unlock: "Vesting / Unlocks",
    liquidity: "Liquidität / Exit",
    insider: "Holder / Insider",
    social: "Social / KOL",
    contract: "Contract / Governance",
  },
  en: {
    supply: "Supply / float",
    unlock: "Vesting / unlocks",
    liquidity: "Liquidity / exits",
    insider: "Holders / insiders",
    social: "Social / KOL",
    contract: "Contract / governance",
  },
} as const;

function translateVerdict(value: string, locale: Locale) {
  const verdicts: Record<string, Record<Locale, string>> = {
    "Insufficient evidence for a reliable verdict": {
      pl: "Za mało dowodów na wiarygodny werdykt",
      de: "Zu wenig Evidenz für ein verlässliches Urteil",
      en: "Insufficient evidence for a reliable verdict",
    },
    "Insufficient transparency — treat as high risk until proven otherwise": {
      pl: "Niewystarczająca przejrzystość, wymagany ostrożny review",
      de: "Unzureichende Transparenz, vorsichtige Prüfung erforderlich",
      en: "Insufficient transparency, cautious review required",
    },
    "High manipulation risk": {
      pl: "Wysokie ryzyko manipulacji",
      de: "Hohes Manipulationsrisiko",
      en: "High manipulation risk",
    },
    "Mixed: growth may include engineered pressure": {
      pl: "Sygnał mieszany, możliwa sztucznie wzmacniana presja",
      de: "Gemischtes Signal, möglicher künstlicher Druck",
      en: "Mixed signal, engineered pressure may be present",
    },
    "Likely organic growth": {
      pl: "Wzrost wygląda względnie organicznie",
      de: "Wachstum wirkt eher organisch",
      en: "Growth appears relatively organic",
    },
  };
  return verdicts[value]?.[locale] ?? value;
}

function translateMissing(value: string, locale: Locale) {
  const translations: Record<string, Record<Locale, string>> = {
    "circulating / total supply confirmation": {
      pl: "potwierdzenie circulating i total supply",
      de: "Bestätigung von Circulating und Total Supply",
      en: value,
    },
    "team / investor / advisor unlock schedule": {
      pl: "harmonogram unlocków zespołu, inwestorów i doradców",
      de: "Unlock-Plan von Team, Investoren und Beratern",
      en: value,
    },
    "holder concentration and wallet clustering": {
      pl: "koncentracja holderów i klastry portfeli",
      de: "Holder-Konzentration und Wallet-Cluster",
      en: value,
    },
    "exit liquidity and slippage depth": {
      pl: "płynność wyjścia i głębokość poślizgu",
      de: "Exit-Liquidität und Slippage-Tiefe",
      en: value,
    },
    "contract address / explorer verification": {
      pl: "adres kontraktu i weryfikacja w explorerze",
      de: "Contract-Adresse und Explorer-Verifizierung",
      en: value,
    },
  };
  return translations[value]?.[locale] ?? value;
}

function laneStateClass(status: EvidenceState) {
  if (status === "red_flag")
    return "border-rose-300/[0.22] bg-rose-400/[0.055] text-rose-100";
  if (status === "confirmed")
    return "border-emerald-300/[0.20] bg-emerald-400/[0.05] text-emerald-100";
  return "border-amber-300/[0.18] bg-amber-300/[0.045] text-amber-100";
}

function localizedLane(
  lane: InvestigatorLane,
  locale: Locale,
  symbol: string,
) {
  if (locale === "en") {
    return { headline: lane.headline, body: lane.body };
  }
  if (symbol.toUpperCase() === "BTC" && lane.id === "unlock") {
    return locale === "pl"
      ? {
          headline: "Emisja protokołu zamiast vestingu zespołu",
          body:
            "Bitcoin nie ma harmonogramu unlocków zespołu ani inwestorów. W tej osi liczą się emisja, podaż górników, rezerwy giełd i przepływy dużych holderów.",
        }
      : {
          headline: "Protokoll-Emission statt Team-Vesting",
          body:
            "Bitcoin hat keinen Team- oder Investoren-Unlock-Plan. Relevant sind Emission, Miner-Bestände, Börsenreserven und große Holder-Flows.",
        };
  }
  if (symbol.toUpperCase() === "BTC" && lane.id === "contract") {
    return locale === "pl"
      ? {
          headline: "Brak kontraktu kontrolowanego przez emitenta",
          body:
            "Natywny BTC nie ma ownera, podatku sprzedaży ani funkcji mint/blacklist. Osobno trzeba oceniać giełdy, custody, mosty i wrapped BTC.",
        }
      : {
          headline: "Kein emittentenkontrollierter Token-Contract",
          body:
            "Native BTC hat keinen Owner, Sell-Tax oder Mint/Blacklist-Funktion. Börsen, Custody, Bridges und Wrapped BTC bleiben separate Risiken.",
        };
  }
  if (symbol.toUpperCase() === "BTC" && lane.id === "insider") {
    return locale === "pl"
      ? {
          headline: "Brakuje aktualnego obrazu koncentracji podaży",
          body:
            "Rozdziel rezerwy giełd, ETF i custody, podaż górników, long-term holderów, wieloryby oraz retail. Sam ranking adresów nie pokazuje realnej kontroli podaży.",
        }
      : {
          headline: "Aktuelles Bild der Supply-Konzentration fehlt",
          body:
            "Börsenreserven, ETF und Custody, Miner-Supply, Long-Term Holder, Whales und Retail müssen getrennt werden. Eine reine Adressliste zeigt keine reale Supply-Kontrolle.",
        };
  }
  const pl = {
    supply: {
      headline:
        lane.score >= 45
          ? "Podaż wymaga pilnej weryfikacji"
          : "Dane podaży są dostępne",
      body:
        "Porównaj circulating supply z total/max supply oraz FDV. Niski float ułatwia gwałtowne ruchy ceny.",
    },
    unlock: {
      headline: "Przejrzystość unlocków nie została potwierdzona",
      body:
        "Brakuje potwierdzonego harmonogramu zespołu, inwestorów, doradców, OTC i dużych portfeli.",
    },
    liquidity: {
      headline:
        lane.score >= 55
          ? "Płynność wyjścia jest pod presją"
          : "Głębokość płynności jest niepełna",
      body:
        "Sprawdź pule DEX, order book CEX, spread i poślizg. Sam wolumen nie dowodzi, że pozycję da się spokojnie zamknąć.",
    },
    insider: {
      headline: "Brakuje obrazu koncentracji holderów",
      body:
        "Portfele zespołu, treasury, CEX, LP, wieloryby i retail muszą zostać rozdzielone przed oceną dystrybucji.",
    },
    social: {
      headline:
        lane.score >= 55
          ? "Narracja social wymaga review"
          : "Brak mocnego lokalnego sygnału pompy",
      body:
        "Aktualny web OSINT powinien sprawdzić płatne promocje, ujawnienia KOL i skoordynowany hype.",
    },
    contract: {
      headline: "Ryzyko kontraktu nie zostało w pełni wykluczone",
      body:
        "Zweryfikuj ownera, proxy, mint, blacklistę, pause, podatki i audyt bezpośrednio w explorerze.",
    },
  } as const;
  const de = {
    supply: {
      headline:
        lane.score >= 45
          ? "Supply benötigt dringende Prüfung"
          : "Supply-Daten sind verfügbar",
      body:
        "Circulating Supply mit Total/Max Supply und FDV vergleichen. Ein niedriger Float erleichtert starke Preisbewegungen.",
    },
    unlock: {
      headline: "Unlock-Transparenz ist nicht bestätigt",
      body:
        "Ein bestätigter Plan für Team, Investoren, Berater, OTC und große Wallets fehlt.",
    },
    liquidity: {
      headline:
        lane.score >= 55
          ? "Exit-Liquidität steht unter Druck"
          : "Liquiditätstiefe ist unvollständig",
      body:
        "DEX-Pools, CEX-Orderbook, Spread und Slippage prüfen. Volumen allein beweist keinen sauberen Exit.",
    },
    insider: {
      headline: "Holder-Konzentration ist nicht vollständig",
      body:
        "Team, Treasury, CEX, LP, Whales und Retail müssen vor einer Verteilungsbewertung getrennt werden.",
    },
    social: {
      headline:
        lane.score >= 55
          ? "Social Narrative benötigt Review"
          : "Kein starkes lokales Pump-Signal",
      body:
        "Aktuelles Web-OSINT sollte bezahlte Promotion, KOL-Offenlegung und koordinierten Hype prüfen.",
    },
    contract: {
      headline: "Contract-Risiko ist nicht vollständig geklärt",
      body:
        "Owner, Proxy, Mint, Blacklist, Pause, Steuern und Audit direkt im Explorer verifizieren.",
    },
  } as const;
  return locale === "pl" ? pl[lane.id] : de[lane.id];
}

function localizedAction(
  action: InvestigatorAction,
  locale: Locale,
  symbol: string,
) {
  if (locale === "en") return { label: action.label, body: action.body };
  if (symbol.toUpperCase() === "BTC" && action.id === "inspect-unlocks") {
    return locale === "pl"
      ? {
          label: "Sprawdź emisję i przepływy",
          body:
            "Zweryfikuj podaż górników, rezerwy giełd, przepływy ETF oraz zmianę podaży long-term holderów.",
        }
      : {
          label: "Emission und Flows prüfen",
          body:
            "Miner-Supply, Börsenreserven, ETF-Flows und Veränderungen bei Long-Term Holdern prüfen.",
        };
  }
  if (symbol.toUpperCase() === "BTC" && action.id === "audit-contract") {
    return locale === "pl"
      ? {
          label: "Oddziel ryzyko custody",
          body:
            "Oceń giełdy, custodianów, mosty i wrapped BTC osobno od natywnego protokołu Bitcoin.",
        }
      : {
          label: "Custody-Risiko trennen",
          body:
            "Börsen, Custodians, Bridges und Wrapped BTC getrennt vom nativen Bitcoin-Protokoll bewerten.",
        };
  }
  const pl: Record<string, { label: string; body: string }> = {
    "verify-supply": {
      label: "Potwierdź podaż",
      body:
        "Porównaj circulating, total i max supply w explorerze oraz niezależnym źródle danych.",
    },
    "inspect-unlocks": {
      label: "Sprawdź unlocki",
      body:
        "Znajdź harmonogram zespołu, inwestorów, doradców, ekosystemu, OTC i dużych portfeli.",
    },
    "check-liquidity": {
      label: "Sprawdź płynność",
      body:
        "Porównaj depth DEX/CEX, spread, order book i poślizg wyjścia.",
    },
    "review-kol": {
      label: "Zweryfikuj KOL i social",
      body:
        "Szukaj płatnych promocji, nieujawnionych alokacji i skoordynowanego hype'u.",
    },
    "audit-contract": {
      label: "Zweryfikuj kontrakt",
      body:
        "Sprawdź ownera, proxy, mint, blacklistę, pause, podatki i status audytu.",
    },
  };
  const de: Record<string, { label: string; body: string }> = {
    "verify-supply": {
      label: "Supply bestätigen",
      body:
        "Circulating, Total und Max Supply im Explorer und einer unabhängigen Datenquelle vergleichen.",
    },
    "inspect-unlocks": {
      label: "Unlocks prüfen",
      body:
        "Pläne für Team, Investoren, Berater, Ökosystem, OTC und große Wallets finden.",
    },
    "check-liquidity": {
      label: "Liquidität prüfen",
      body: "DEX/CEX Depth, Spread, Orderbook und Exit-Slippage vergleichen.",
    },
    "review-kol": {
      label: "KOL und Social prüfen",
      body:
        "Bezahlte Promotion, nicht offengelegte Allokationen und koordinierten Hype suchen.",
    },
    "audit-contract": {
      label: "Contract prüfen",
      body:
        "Owner, Proxy, Mint, Blacklist, Pause, Steuern und Audit-Status prüfen.",
    },
  };
  return (locale === "pl" ? pl : de)[action.id] ?? {
    label: action.label,
    body: action.body,
  };
}

export default function ShieldMapCommandClient({ locale }: { locale: string }) {
  const safeLocale: Locale =
    locale === "de" || locale === "en" ? locale : "pl";
  const c = copy[safeLocale];
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [investigator, setInvestigator] = useState<Investigator | null>(null);
  const [snapshot, setSnapshot] = useState<RiskSnapshot | null>(null);
  const [suggestions, setSuggestions] = useState<CoinSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [engine, setEngine] = useState<EngineStatus>({
    marketData: "live",
    riskEngine: "connected",
    generativeNarrative: "not_configured",
    webOsint: "not_connected",
  });
  const bootedQueryRef = useRef("");
  const committedQueryRef = useRef("");
  const searchShellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clean = query.trim().toLowerCase();
    if (
      clean.length < 2 ||
      clean === committedQueryRef.current.toLowerCase()
    ) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    const local = localSuggestions.filter((item) => {
      const haystack = `${item.symbol} ${item.name} ${item.id}`.toLowerCase();
      return haystack.includes(clean);
    });
    setSuggestions(local.slice(0, 3));
    setSuggestionsOpen(local.length > 0);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/market-integrity/search?query=${encodeURIComponent(clean)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const payload = (await response.json()) as {
          suggestions?: CoinSuggestion[];
        };
        const seen = new Set<string>();
        const merged = [...local, ...(payload.suggestions ?? [])]
          .filter((item) => {
            const key = item.id || item.symbol;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => {
            const relevance = (item: CoinSuggestion) => {
              const id = item.id.toLowerCase();
              const name = item.name.toLowerCase();
              const symbolValue = item.symbol.toLowerCase();
              if (id === clean || name === clean) return 0;
              if (id.startsWith(clean) || name.startsWith(clean)) return 1;
              if (symbolValue === clean) return 2;
              if (
                id.includes(clean) ||
                name.includes(clean) ||
                symbolValue.startsWith(clean)
              ) {
                return 3;
              }
              return 4;
            };
            return (
              relevance(a) - relevance(b) ||
              (a.rank ?? Number.MAX_SAFE_INTEGER) -
                (b.rank ?? Number.MAX_SAFE_INTEGER)
            );
          })
          .slice(0, 3);
        setSuggestions(merged);
        setSuggestionsOpen(merged.length > 0);
      } catch {
        if (controller.signal.aborted) return;
        setSuggestions(local.slice(0, 3));
        setSuggestionsOpen(local.length > 0);
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function closeSuggestions(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchShellRef.current?.contains(target)) return;
      setSuggestionsOpen(false);
    }
    document.addEventListener("pointerdown", closeSuggestions, true);
    return () =>
      document.removeEventListener("pointerdown", closeSuggestions, true);
  }, []);

  async function runScan(
    event?: FormEvent<HTMLFormElement>,
    directQuery?: string,
  ) {
    event?.preventDefault();
    const clean = (directQuery ?? query).trim();
    if (clean.length < 2 || loading) return;
    committedQueryRef.current = clean;
    setQuery(clean.toUpperCase());
    setSuggestions([]);
    setSuggestionsOpen(false);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/market-integrity/investigator?query=${encodeURIComponent(clean)}&locale=${safeLocale}`,
        { headers: { accept: "application/json" }, cache: "no-store" },
      );
      const payload = (await response.json()) as InvestigatorResponse;
      if (!response.ok || payload.mode === "error") {
        throw new Error(
          payload.mode === "error" ? payload.error : "Investigator unavailable",
        );
      }
      setInvestigator(payload.investigator);
      setEngine(payload.engine);
      setSnapshot(payload.result);
    } catch (scanError) {
      setInvestigator(null);
      setSnapshot(null);
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Investigator unavailable",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const routed = (
      searchParams.get("query") ||
      searchParams.get("asset") ||
      ""
    ).trim();
    if (!routed || routed === bootedQueryRef.current) return;
    bootedQueryRef.current = routed;
    setQuery(routed.toUpperCase());
    void runScan(undefined, routed);
    // The URL handoff should run once per routed query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const symbol =
    investigator?.caseFrame.asset.match(/\(([^)]+)\)$/)?.[1] || query.trim();
  const topAction = investigator?.nextActions[0];
  const plainMeaning = investigator
    ? investigator.overallRisk >= 65
      ? c.high
      : investigator.overallRisk >= 35
        ? c.elevated
        : c.calmButIncomplete
    : "";
  const meaningBody =
    investigator && investigator.confidenceScore < 55
      ? `${plainMeaning} ${c.confidenceLow}`
      : plainMeaning;

  function formatMoney(value?: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "—";
    return new Intl.NumberFormat(safeLocale, {
      style: "currency",
      currency: "USD",
      notation: value >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  }

  function formatPercent(value?: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "—";
    return `${value > 0 ? "+" : ""}${new Intl.NumberFormat(safeLocale, {
      maximumFractionDigits: 2,
    }).format(value)}%`;
  }

  return (
    <main className="min-h-screen bg-velmere-black px-5 pb-24 pt-28 text-velmere-ivory md:px-10 md:pt-32">
      <section className="mx-auto max-w-[82rem]">
        <Link
          href="/market-integrity"
          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/[0.46] transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {c.back}
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-velmere-gold">
              {c.kicker}
            </p>
            <h1 className="mt-3 max-w-4xl font-serif text-5xl tracking-[-0.055em] text-white md:text-7xl">
              {c.title}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/[0.54] md:text-base">
              {c.subtitle}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-300/[0.14] bg-amber-300/[0.035] p-4 text-xs leading-6 text-amber-50/[0.64]">
            <AlertTriangle className="mb-3 h-5 w-5 text-amber-200" />
            {c.prescreen}
          </div>
        </div>

        <div ref={searchShellRef} className="relative mt-8">
        <form
          onSubmit={runScan}
          className="flex flex-col gap-3 rounded-[1.7rem] border border-cyan-200/[0.14] bg-cyan-300/[0.035] p-3 sm:flex-row"
        >
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.2rem] border border-white/[0.08] bg-black/[0.28] px-4">
            <Search className="h-5 w-5 shrink-0 text-velmere-gold" />
            <input
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                if (
                  value.trim().toLowerCase() !==
                  committedQueryRef.current.toLowerCase()
                ) {
                  committedQueryRef.current = "";
                }
                setQuery(value);
              }}
              onFocus={() =>
                setSuggestionsOpen(
                  Boolean(query.trim() && suggestions.length),
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Escape") setSuggestionsOpen(false);
              }}
              placeholder={c.placeholder}
              className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/[0.28]"
              data-testid="shield-map-search"
            />
          </label>
          <button
            type="submit"
            disabled={loading || query.trim().length < 2}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[1.2rem] border border-velmere-gold/[0.28] bg-velmere-gold/[0.10] px-7 font-mono text-[10px] uppercase tracking-[0.15em] text-velmere-gold disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Radar className="h-4 w-4" />
            )}
            {loading ? c.scanning : c.scan}
          </button>
        </form>
        {suggestionsOpen && suggestions.length ? (
          <div
            role="listbox"
            aria-label={c.placeholder}
            className="absolute inset-x-0 top-[calc(100%+0.65rem)] z-50 grid gap-1 rounded-[1.4rem] border border-cyan-200/[0.18] bg-[#071012]/[0.99] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.72)] backdrop-blur-2xl"
          >
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  committedQueryRef.current = item.symbol;
                  setQuery(item.symbol);
                  setSuggestions([]);
                  setSuggestionsOpen(false);
                  void runScan(undefined, item.symbol);
                }}
                className="flex items-center gap-3 rounded-[1rem] border border-transparent px-3 py-3 text-left transition hover:border-cyan-200/[0.14] hover:bg-cyan-300/[0.05]"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-white/[0.04] bg-cover bg-center font-mono text-[10px] text-velmere-gold"
                  style={
                    item.image
                      ? { backgroundImage: `url(${item.image})` }
                      : undefined
                  }
                  aria-hidden="true"
                >
                  {item.image ? null : item.symbol.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-white">
                    {item.name}
                  </strong>
                  <small className="mt-1 block font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.38]">
                    {item.symbol}
                    {item.rank ? ` · #${item.rank}` : ""}
                  </small>
                </span>
              </button>
            ))}
          </div>
        ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {["BTC", "ETH", "SOL", "DOGE"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void runScan(undefined, item)}
              className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.44] transition hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Database,
              label: c.liveData,
              state: c.connected,
              ok: engine.marketData === "live",
            },
            {
              icon: ShieldCheck,
              label: c.riskEngine,
              state: c.connected,
              ok: engine.riskEngine === "connected",
            },
            {
              icon: Brain,
              label: c.aiLayer,
              state:
                engine.generativeNarrative === "configured"
                  ? c.connected
                  : c.notConfigured,
              ok: engine.generativeNarrative === "configured",
            },
            {
              icon: ExternalLink,
              label: c.osint,
              state: c.notConnected,
              ok: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-[1.2rem] border border-white/[0.08] bg-white/[0.025] p-4"
            >
              <item.icon
                className={`h-5 w-5 ${item.ok ? "text-emerald-300" : "text-amber-200"}`}
              />
              <span className="min-w-0">
                <strong className="block text-xs text-white/[0.76]">
                  {item.label}
                </strong>
                <small className="mt-1 block font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.36]">
                  {item.state}
                </small>
              </span>
            </div>
          ))}
        </div>

        {error ? (
          <div className="mt-8 rounded-[1.5rem] border border-rose-300/[0.20] bg-rose-400/[0.05] p-5 text-sm leading-7 text-rose-100">
            {error}
          </div>
        ) : null}

        {!investigator && !loading && !error ? (
          <div className="mt-10 grid min-h-[22rem] place-items-center rounded-[2rem] border border-dashed border-white/[0.10] bg-white/[0.018] p-8 text-center">
            <div className="max-w-xl">
              <Radar className="mx-auto h-10 w-10 text-velmere-gold/[0.72]" />
              <h2 className="mt-5 font-serif text-4xl text-white">
                {c.emptyTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/[0.46]">
                {c.emptyBody}
              </p>
            </div>
          </div>
        ) : null}

        {investigator ? (
          <div className="mt-10 space-y-5" data-testid="shield-map-result">
            <section className="grid gap-4 rounded-[2rem] border border-white/[0.10] bg-white/[0.025] p-5 md:grid-cols-[minmax(0,1fr)_12rem_12rem] md:p-7">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-white/[0.04] bg-cover bg-center font-mono text-xs text-velmere-gold"
                    style={
                      snapshot?.token.image
                        ? {
                            backgroundImage: `url(${snapshot.token.image})`,
                          }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {snapshot?.token.image ? null : symbol.slice(0, 2)}
                  </span>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/[0.58]">
                    {investigator.caseFrame.asset} ·{" "}
                    {investigator.caseFrame.sourceState}
                  </p>
                </div>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {translateVerdict(investigator.finalVerdict, safeLocale)}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/[0.48]">
                  {c.source}: {investigator.caseFrame.sourceState} ·{" "}
                  {investigator.caseFrame.operatorMode}
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-rose-300/[0.16] bg-rose-400/[0.045] p-4">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-rose-100/[0.62]">
                  {c.risk}
                </span>
                <strong className="mt-2 block font-mono text-3xl text-white">
                  {investigator.overallRisk}/100
                </strong>
              </div>
              <div className="rounded-[1.3rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.045] p-4">
                <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-velmere-gold/[0.72]">
                  {c.confidence}
                </span>
                <strong className="mt-2 block font-mono text-2xl text-white">
                  {investigator.confidenceScore}%
                </strong>
              </div>
            </section>

            <section className="grid gap-4 rounded-[1.7rem] border border-cyan-200/[0.14] bg-cyan-300/[0.035] p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] md:p-6">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/[0.64]">
                  {c.plainTitle}
                </p>
                <p className="mt-3 max-w-3xl text-base leading-8 text-white/[0.72]">
                  {meaningBody}
                </p>
                {topAction ? (
                  <p className="mt-4 rounded-xl border border-velmere-gold/[0.15] bg-velmere-gold/[0.045] px-4 py-3 text-sm leading-6 text-white/[0.60]">
                    <strong className="text-velmere-gold">
                      {localizedAction(topAction, safeLocale, symbol).label}:
                    </strong>{" "}
                    {localizedAction(topAction, safeLocale, symbol).body}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.44]">
                  {c.numbers}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    [c.price, formatMoney(snapshot?.metrics.currentPrice)],
                    ["24H", formatPercent(snapshot?.metrics.priceChange24h)],
                    ["7D", formatPercent(snapshot?.metrics.priceChange7d)],
                    [
                      c.marketCap,
                      formatMoney(snapshot?.metrics.marketCap),
                    ],
                    [c.volume, formatMoney(snapshot?.metrics.volume24h)],
                    ["FDV", formatMoney(snapshot?.metrics.fdv)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.07] bg-black/[0.18] p-3"
                    >
                      <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.30]">
                        {label}
                      </span>
                      <strong className="mt-1 block truncate font-mono text-xs text-white/[0.78]">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {investigator.lanes.map((lane) => (
                (() => {
                  const localized = localizedLane(
                    lane,
                    safeLocale,
                    symbol,
                  );
                  return (
                    <article
                      key={lane.id}
                      className={`rounded-[1.5rem] border p-5 ${laneStateClass(lane.status)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.15em] opacity-70">
                            {laneLabels[safeLocale][lane.id]}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-white">
                            {localized.headline}
                          </h3>
                        </div>
                        <strong className="font-mono text-lg text-white">
                          {lane.score}
                        </strong>
                      </div>
                      <p className="mt-3 text-xs leading-6 text-white/[0.54]">
                        {localized.body}
                      </p>
                    </article>
                  );
                })()
              ))}
            </section>

            {topAction ? (
              <section className="rounded-[1.7rem] border border-velmere-gold/[0.20] bg-velmere-gold/[0.06] p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-velmere-gold" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">
                      {c.next} · {topAction.priority}
                    </p>
                    {(() => {
                      const localized = localizedAction(
                        topAction,
                        safeLocale,
                        symbol,
                      );
                      return (
                        <>
                          <h3 className="mt-2 text-xl font-semibold text-white">
                            {localized.label}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-white/[0.56]">
                            {localized.body}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </section>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/[0.09] bg-white/[0.022] p-5">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.17em] text-velmere-gold">
                  {c.missing}
                </h3>
                <div className="mt-4 space-y-2">
                  {investigator.caseFrame.missingData.map((item) => (
                    <p
                      key={item}
                      className="rounded-xl border border-white/[0.07] bg-black/[0.20] px-3 py-3 text-xs leading-5 text-white/[0.52]"
                    >
                      {translateMissing(item, safeLocale)}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/[0.09] bg-white/[0.022] p-5">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.17em] text-velmere-gold">
                  {c.next}
                </h3>
                <div className="mt-4 space-y-2">
                  {investigator.nextActions.slice(0, 4).map((action) => (
                    (() => {
                      const localized = localizedAction(
                        action,
                        safeLocale,
                        symbol,
                      );
                      return (
                        <div
                          key={action.id}
                          className="rounded-xl border border-white/[0.07] bg-black/[0.20] px-3 py-3"
                        >
                          <strong className="text-xs text-white/[0.76]">
                            {localized.label}
                          </strong>
                          <p className="mt-1 text-[11px] leading-5 text-white/[0.42]">
                            {localized.body}
                          </p>
                        </div>
                      );
                    })()
                  ))}
                </div>
              </div>
            </section>

            <details className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.02] p-5">
              <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.54]">
                {c.research}
              </summary>
              <div className="mt-4 space-y-2">
                {investigator.webQueries.map((item) => (
                  <p
                    key={item}
                    className="rounded-xl border border-white/[0.06] bg-black/[0.18] px-3 py-2 font-mono text-[9px] leading-5 text-white/[0.40]"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </details>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/market-integrity/cross-asset"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.62]"
              >
                {c.openMarkets}
              </Link>
              <Link
                href={`/search?query=${encodeURIComponent(symbol)}`}
                className="inline-flex items-center gap-2 rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-velmere-gold"
              >
                {c.openLens}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
