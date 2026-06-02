"use client";

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import {
  Brain,
  ChevronDown,
  LineChart,
  Loader2,
  Search,
  Radar,
  Star,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import type { MarketIntegrityRow } from "@/lib/market-integrity/coingecko";
import type { TokenRiskResult } from "@/lib/market-integrity/risk-types";

type ApiResponse =
  | {
      mode: "demo";
      results: TokenRiskResult[];
      result?: never;
      marketRow?: never;
    }
  | {
      mode: "demo" | "live";
      result: TokenRiskResult;
      marketRow?: MarketIntegrityRow;
      results?: never;
    }
  | { mode: "error"; error: string };

type MarketMemoryStatus = {
  lastSweepAt?: string;
  trackedAssets: number;
  storedSnapshots: number;
  highestStoredRisk?: { symbol: string; score: number; timestamp: string };
};

type MarketSweepInsight = {
  id: string;
  symbol: string;
  name: string;
  score: number;
  previousScore?: number;
  riskDelta?: number;
  priceDeltaPercent?: number;
  volumeDeltaPercent?: number;
  trend: "new" | "stable" | "rising_risk" | "cooling" | "volatile";
  reason: string;
};

type MarketsApiResponse =
  | {
      mode: "live";
      rows: MarketIntegrityRow[];
      generatedAt: string;
      source: string;
      memory?: MarketMemoryStatus;
      insights?: MarketSweepInsight[];
    }
  | { mode: "error"; error: string };

type Suggestion = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  rank?: number | null;
};
type SuggestionsApiResponse =
  | { mode: "live"; suggestions: Suggestion[] }
  | { mode: "error"; error: string };

type ShieldCaseTimelineEvent = {
  id: string;
  timestamp: string;
  label: string;
  body: string;
  score: number;
  tone: "neutral" | "watch" | "warning" | "critical";
};

type SentinelAlert = {
  id: string;
  type:
    | "critical_cluster"
    | "rising_risk"
    | "parabolic_pump"
    | "liquidity_stress"
    | "data_gap";
  symbol: string;
  name: string;
  score: number;
  level: TokenRiskResult["level"];
  confidence?: number;
  dominantAgent?: string;
  riskDelta?: number;
  priceDeltaPercent?: number;
  volumeDeltaPercent?: number;
  trend?: "new" | "stable" | "rising_risk" | "cooling" | "volatile";
  timestamp?: string;
  headline: string;
  reason: string;
  action: string;
  caseId?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  observations?: number;
  caseStatus?: "open" | "watch" | "cooling";
  timeline?: ShieldCaseTimelineEvent[];
};
type SentinelApiResponse =
  | {
      mode: "live";
      alerts: SentinelAlert[];
      inbox?: SentinelAlert[];
      rules?: { summary: ShieldRulesSummary; hits: ShieldRuleHit[] };
      generatedAt: string;
      rowsScanned: number;
    }
  | { mode: "error"; error: string };

type ShieldRuleHit = {
  id: string;
  ruleId: string;
  symbol: string;
  name: string;
  score: number;
  severity: "info" | "watch" | "warning" | "critical";
  action:
    | "monitor"
    | "open_case"
    | "review_liquidity"
    | "review_contract"
    | "review_data"
    | "cool_down";
  priority: number;
  headline: string;
  reason: string;
  nextStep: string;
  values?: Record<string, number | string | boolean | null | undefined>;
  timestamp: string;
};
type ShieldRulesSummary = {
  version: string;
  totalHits: number;
  critical: number;
  warning: number;
  watch: number;
  watchlistHits: number;
  risingFast: number;
  watchlist: string[];
};
const defaultWatchlist = ["BTC", "ETH", "SOL", "OM", "PEPE", "DOGE", "VLM"];

const TokenRiskModal = dynamic(
  () => import("@/components/market-integrity/TokenRiskModal"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/[0.88] p-4 text-velmere-ivory backdrop-blur-2xl">
        <div className="shield-terminal-loader max-w-md p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.08] text-velmere-gold">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                Shield terminal booting
              </p>
              <p className="mt-1 text-xs leading-6 text-white/[0.48]">
                Ładuję terminal w osobnym chunku, żeby klik tokena nie lagował main page.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
);

class ShieldModalErrorBoundary extends Component<
  { children: ReactNode; resetKey: string; onClose: () => void },
  { hasError: boolean; message?: string }
> {
  state = { hasError: false, message: undefined as string | undefined };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message:
        error instanceof Error ? error.message : "Terminal render failed",
    };
  }

  componentDidUpdate(previousProps: { resetKey: string }) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: undefined });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/[0.86] p-4 text-velmere-ivory backdrop-blur-xl">
        <div className="max-w-lg rounded-[1.5rem] border border-amber-300/[0.24] bg-[#0b0b0d] p-5 shadow-[0_30px_110px_rgba(0,0,0,0.75)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
            Shield terminal safe mode
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">
            Modal został zatrzymany zanim rozwalił UI.
          </h3>
          <p className="mt-2 text-sm leading-7 text-white/[0.55]">
            Shield złapał błąd renderowania terminala i przełączył go w tryb
            awaryjny. To nie jest wynik analizy tokena.
          </p>
          <p className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 font-mono text-[10px] leading-5 text-white/[0.44]">
            {this.state.message ?? "Unknown modal error"}
          </p>
          <button
            type="button"
            onClick={this.props.onClose}
            className="mt-4 inline-flex rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.72] transition hover:border-velmere-gold/[0.35] hover:text-velmere-gold"
          >
            Zamknij terminal
          </button>
        </div>
      </div>
    );
  }
}

const tabs = ["top", "trending", "watchlist", "highestRisk"] as const;
type MarketSortKey =
  | "rank"
  | "price"
  | "change24h"
  | "change7d"
  | "marketCap"
  | "volume"
  | "risk";

function formatNumber(value?: number, options?: Intl.NumberFormatOptions) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(
    "en-US",
    options ?? { maximumFractionDigits: 2 },
  ).format(value);
}

function formatUsd(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  if (Math.abs(value) < 1)
    return `$${formatNumber(value, { maximumSignificantDigits: 4 })}`;
  return `$${formatNumber(value, { notation: value >= 1_000_000 ? "compact" : "standard", maximumFractionDigits: 2 })}`;
}

function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, { maximumFractionDigits: 2 })}%`;
}

function proxiedIcon(image?: string) {
  if (!image) return undefined;
  if (image.startsWith("/api/market-integrity/icon?url=")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return `/api/market-integrity/icon?url=${encodeURIComponent(image)}`;
  }
  return image;
}

function TokenAvatar({ image, symbol }: { image?: string; symbol: string }) {
  const [failed, setFailed] = useState(false);
  const src = proxiedIcon(image);
  if (!src || failed) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] font-mono text-[10px] text-white/[0.62] shadow-[0_0_22px_rgba(210,176,94,0.08)] ring-1 ring-white/[0.08] tabular-nums">
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={36}
      height={36}
      unoptimized
      className="h-9 w-9 shrink-0 rounded-full bg-white/[0.05] object-cover shadow-[0_0_22px_rgba(210,176,94,0.08)] ring-1 ring-white/[0.08]"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function Sparkline({ values, change }: { values: number[]; change?: number }) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (clean.length < 2) return <span className="text-white/[0.26]">—</span>;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const points = clean
    .map((value, index) => {
      const x = (index / (clean.length - 1)) * 120;
      const y = 34 - ((value - min) / range) * 30 + 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const stroke = change !== undefined && change >= 0 ? "#2ee59d" : "#ff4d6d";
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-28" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
    </svg>
  );
}

function RiskDot({ level }: { level: TokenRiskResult["level"] }) {
  const className =
    level === "critical"
      ? "bg-red-400"
      : level === "high"
        ? "bg-orange-300"
        : level === "medium"
          ? "bg-amber-300"
          : "bg-emerald-300";
  return (
    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${className}`} />
  );
}

function levelLabel(score: number) {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
}

const marketSortLabels: Record<MarketSortKey, string> = {
  rank: "rank",
  price: "price",
  change24h: "24h change",
  change7d: "7d change",
  marketCap: "market cap",
  volume: "24h volume",
  risk: "risk score",
};

function sortDirectionCopy(key: MarketSortKey, direction: "asc" | "desc") {
  if (key === "rank")
    return direction === "asc"
      ? "lowest rank first"
      : "highest rank number first";
  if (key === "risk")
    return direction === "desc" ? "highest risk first" : "lowest risk first";
  return direction === "desc"
    ? "largest values first"
    : "smallest values first";
}

export default function MarketIntegrityClient({
  demoResults,
}: {
  demoResults: TokenRiskResult[];
}) {
  const t = useTranslations("MarketIntegrity");
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [result, setResult] = useState<TokenRiskResult | null>(null);
  const [selected, setSelected] = useState<
    MarketIntegrityRow | TokenRiskResult | null
  >(null);
  const [marketRows, setMarketRows] = useState<MarketIntegrityRow[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("top");
  const [sortKey, setSortKey] = useState<MarketSortKey>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sentinelAlerts, setSentinelAlerts] = useState<SentinelAlert[]>([]);
  const [caseInbox, setCaseInbox] = useState<SentinelAlert[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [sentinelLoading, setSentinelLoading] = useState(true);
  const [watchlistSymbols, setWatchlistSymbols] =
    useState<string[]>(defaultWatchlist);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesSummary, setRulesSummary] = useState<ShieldRulesSummary | null>(
    null,
  );
  const [ruleHits, setRuleHits] = useState<ShieldRuleHit[]>([]);
  const [shieldInspectorOpen, setShieldInspectorOpen] = useState(false);
  const [interactionPulse, setInteractionPulse] = useState(0);
  const [sourceCooldownUntil, setSourceCooldownUntil] = useState<number | null>(null);
  const [cooldownTick, setCooldownTick] = useState(0);
  const searchShellRef = useRef<HTMLFormElement | null>(null);
  const [activeShieldLayer, setActiveShieldLayer] = useState("Velocity");
  const routeScanHandledRef = useRef(false);
  const [isOpeningTerminal, startTerminalTransition] = useTransition();
  void cooldownTick;
  const sourceCooldownActive = Boolean(sourceCooldownUntil && sourceCooldownUntil > Date.now());
  const sourceCooldownSeconds = sourceCooldownActive && sourceCooldownUntil
    ? Math.max(1, Math.ceil((sourceCooldownUntil - Date.now()) / 1000))
    : 0;

  async function loadMarkets(
    nextPage = 1,
    mode: "replace" | "append" = "replace",
  ) {
    if (mode === "replace") setMarketLoading(true);
    if (mode === "append") setLoadingMore(true);
    setMarketError(null);
    try {
      const response = await fetch(
        `/api/market-integrity/markets?perPage=250&page=${nextPage}`,
        { headers: { accept: "application/json" } },
      );
      const data = (await response.json()) as MarketsApiResponse;
      if (!response.ok || data.mode === "error")
        throw new Error(
          data.mode === "error" ? data.error : t("errors.generic"),
        );
      setMarketRows((current) => {
        if (mode === "replace") return data.rows;
        const seen = new Set(current.map((row) => row.id));
        return [...current, ...data.rows.filter((row) => !seen.has(row.id))];
      });
      setPage(nextPage);
    } catch (loadError) {
      setMarketError(
        loadError instanceof Error ? loadError.message : t("errors.generic"),
      );
    } finally {
      setMarketLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    void loadMarkets(1, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    async function loadSentinel() {
      setSentinelLoading(true);
      setRulesLoading(true);
      try {
        const watch = watchlistSymbols.join(",");
        const response = await fetch(
          `/api/market-integrity/sentinel?pages=1&perPage=120&watchlist=${encodeURIComponent(watch)}`,
          {
            headers: { accept: "application/json" },
          },
        );
        const data = (await response.json()) as SentinelApiResponse;
        if (active && response.ok && data.mode === "live") {
          const inbox = data.inbox?.length ? data.inbox : data.alerts;
          setSentinelAlerts(data.alerts.slice(0, 4));
          setCaseInbox(inbox.slice(0, 8));
          if (data.rules) {
            setRulesSummary(data.rules.summary);
            setRuleHits(data.rules.hits.slice(0, 6));
          }
          setActiveCaseId(
            (current) => current ?? inbox[0]?.caseId ?? inbox[0]?.id ?? null,
          );
        }
      } catch {
        if (active) {
          setSentinelAlerts([]);
          setRulesSummary(null);
          setRuleHits([]);
        }
      } finally {
        if (active) {
          setSentinelLoading(false);
          setRulesLoading(false);
        }
      }
    }
    void loadSentinel();
    return () => {
      active = false;
    };
  }, [watchlistSymbols]);

  useEffect(() => {
    const saved = window.localStorage.getItem("velmere-shield-watchlist");
    if (!saved) return;
    const parsed = saved
      .split(/[\s,;|]+/)
      .map((item) =>
        item
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9:_-]/g, ""),
      )
      .filter(Boolean);
    if (parsed.length)
      setWatchlistSymbols(Array.from(new Set(parsed)).slice(0, 18));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "velmere-shield-watchlist",
      watchlistSymbols.join(","),
    );
  }, [watchlistSymbols]);

  useEffect(() => {
    if (!sourceCooldownUntil) return;
    const timer = window.setInterval(() => {
      setCooldownTick((current) => current + 1);
      if (sourceCooldownUntil <= Date.now()) {
        setSourceCooldownUntil(null);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sourceCooldownUntil]);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if (sourceCooldownActive) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setSuggestionLoading(true);
      try {
        const response = await fetch(
          `/api/market-integrity/search?query=${encodeURIComponent(clean)}`,
          { headers: { accept: "application/json" } },
        );
        if (response.status === 429) {
          if (active) {
            setSourceCooldownUntil(Date.now() + 45_000);
            setSuggestions([]);
            setSuggestionsOpen(false);
          }
          return;
        }
        const data = (await response.json()) as SuggestionsApiResponse;
        if (active && response.ok && data.mode === "live") {
          setSuggestions(data.suggestions.slice(0, 3));
          setSuggestionsOpen(true);
        }
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setSuggestionLoading(false);
      }
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, sourceCooldownActive]);

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchShellRef.current?.contains(target)) return;
      setSuggestionsOpen(false);
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  const visibleRows = useMemo(() => {
    let rows = [...marketRows];
    if (activeTab === "highestRisk") {
      rows = rows.sort(
        (a, b) =>
          b.result.score - a.result.score ||
          (a.rank ?? 9999) - (b.rank ?? 9999),
      );
    } else if (activeTab === "trending") {
      rows = rows.sort(
        (a, b) =>
          Math.abs(b.priceChange24h ?? 0) - Math.abs(a.priceChange24h ?? 0),
      );
    } else if (activeTab === "watchlist") {
      rows = rows.filter(
        (row) =>
          watchlistSymbols.includes(row.symbol) ||
          watchlistSymbols.includes(row.id.toUpperCase()),
      );
    }

    const valueForSort = (row: MarketIntegrityRow): number | undefined => {
      if (sortKey === "price") return row.price;
      if (sortKey === "change24h") return row.priceChange24h;
      if (sortKey === "change7d") return row.priceChange7d;
      if (sortKey === "marketCap") return row.marketCap;
      if (sortKey === "volume") return row.volume24h;
      if (sortKey === "risk") return row.result.score;
      return row.rank;
    };

    return rows.sort((a, b) => {
      const aValue = valueForSort(a);
      const bValue = valueForSort(b);
      const aMissing =
        aValue === undefined || aValue === null || Number.isNaN(aValue);
      const bMissing =
        bValue === undefined || bValue === null || Number.isNaN(bValue);
      if (aMissing && bMissing) return (a.rank ?? 9999) - (b.rank ?? 9999);
      if (aMissing) return 1;
      if (bMissing) return -1;
      const direction = sortDirection === "asc" ? 1 : -1;
      const delta = aValue - bValue;
      if (delta !== 0) return delta * direction;
      return (a.rank ?? 9999) - (b.rank ?? 9999);
    });
  }, [activeTab, marketRows, sortDirection, sortKey, watchlistSymbols]);

  const stats = useMemo(() => {
    const marketCap = marketRows.reduce(
      (sum, row) => sum + (row.marketCap ?? 0),
      0,
    );
    const volume = marketRows.reduce(
      (sum, row) => sum + (row.volume24h ?? 0),
      0,
    );
    const highestRisk = marketRows.reduce<MarketIntegrityRow | null>(
      (current, row) =>
        !current || row.result.score > current.result.score ? row : current,
      null,
    );
    const avgChange = marketRows.length
      ? marketRows.reduce((sum, row) => sum + (row.priceChange24h ?? 0), 0) /
        marketRows.length
      : 0;
    return { marketCap, volume, highestRisk, avgChange };
  }, [marketRows]);

  const scannedSummary = result
    ? `${result["token"].symbol} · ${t(`badges.${result.badge}`)} · ${result.score}/100`
    : "";

  function findLocalMarketMatch(value: string) {
    const clean = value.trim().toLowerCase();
    if (!clean) return undefined;
    return marketRows.find(
      (row) =>
        row.id.toLowerCase() === clean ||
        row.symbol.toLowerCase() === clean ||
        row.name.toLowerCase() === clean,
    );
  }

  async function fetchSuggestionHit(value: string) {
    const clean = value.trim();
    if (!clean || clean.length < 2) return undefined;
    try {
      const response = await fetch(
        `/api/market-integrity/search?query=${encodeURIComponent(clean)}`,
        {
          headers: { accept: "application/json" },
        },
      );
      const data = (await response.json()) as SuggestionsApiResponse;
      if (!response.ok || data.mode === "error") return undefined;
      const lower = clean.toLowerCase();
      return (
        data.suggestions.find(
          (item) =>
            item.id.toLowerCase() === lower ||
            item.symbol.toLowerCase() === lower ||
            item.name.toLowerCase() === lower,
        ) ?? data.suggestions[0]
      );
    } catch {
      return undefined;
    }
  }

  async function resolveScanQuery(value: string) {
    const clean = value.trim();
    if (!clean) return clean;
    const lower = clean.toLowerCase();
    const suggestionHit = suggestions.find(
      (item) =>
        item.id.toLowerCase() === lower ||
        item.symbol.toLowerCase() === lower ||
        item.name.toLowerCase() === lower,
    );
    if (suggestionHit) return suggestionHit.id;
    const remoteHit = await fetchSuggestionHit(clean);
    return remoteHit?.id ?? clean;
  }

  async function scanToken(nextQuery = query) {
    const clean = nextQuery.trim();
    if (!clean) return;
    setError(null);
    setSuggestionsOpen(false);
    if (clean.length < 2) {
      return;
    }
    const localMatch = findLocalMarketMatch(clean);
    if (localMatch) {
      setResult(localMatch.result);
      openTokenModal(localMatch);
      return;
    }
    if (sourceCooldownActive) {
      setError(`Źródło live ma chwilowy cooldown (${sourceCooldownSeconds}s). Wybierz token z tabeli albo poczekaj chwilę przed kolejnym skanem.`);
      return;
    }
    setLoading(true);
    try {
      const resolvedQuery = await resolveScanQuery(clean);
      const resolvedLocalMatch = findLocalMarketMatch(resolvedQuery);
      if (resolvedLocalMatch) {
        setResult(resolvedLocalMatch.result);
        openTokenModal(resolvedLocalMatch);
        return;
      }
      const response = await fetch(
        `/api/market-integrity/analyze?query=${encodeURIComponent(resolvedQuery)}`,
        { method: "GET", headers: { accept: "application/json" } },
      );
      if (response.status === 429) {
        setSourceCooldownUntil(Date.now() + 45_000);
        throw new Error(
          "Zewnętrzne źródło danych chwilowo ograniczyło zapytania (429). Shield przełącza search w tryb local-first — wybierz monetę z tabeli albo spróbuj ponownie za chwilę.",
        );
      }
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || data.mode === "error")
        throw new Error(
          data.mode === "error" ? data.error : t("errors.generic"),
        );
      if (!data.result) throw new Error("Scan returned no terminal result");
      setResult(data.result);
      openTokenModal(data.marketRow ?? data.result);
    } catch (scanError) {
      setError(
        scanError instanceof Error ? scanError.message : t("errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  }

  function openTokenModal(item: MarketIntegrityRow | TokenRiskResult) {
    startTerminalTransition(() => setSelected(item));
  }

  function closeTokenModal() {
    setSelected(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void scanToken();
  }

  useEffect(() => {
    if (routeScanHandledRef.current || marketLoading || !marketRows.length)
      return;
    const routeScan = new URLSearchParams(window.location.search).get("scan");
    if (!routeScan) return;
    routeScanHandledRef.current = true;
    setQuery(routeScan.toUpperCase());
    void scanToken(routeScan);
    // scanToken intentionally reads the latest resolver state after markets load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketLoading, marketRows.length]);

  function cleanWatchSymbol(value: string) {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9:_-]/g, "")
      .slice(0, 32);
  }

  function addWatchlistSymbol(value = query) {
    const clean = cleanWatchSymbol(value);
    if (!clean) return;
    setWatchlistSymbols((current) =>
      Array.from(new Set([clean, ...current])).slice(0, 18),
    );
  }

  function removeWatchlistSymbol(value: string) {
    setWatchlistSymbols((current) => current.filter((item) => item !== value));
  }

  function selectTab(tab: (typeof tabs)[number]) {
    setActiveTab(tab);
    if (tab === "highestRisk") {
      setSortKey("risk");
      setSortDirection("desc");
      return;
    }
    if (tab === "trending") {
      setSortKey("change24h");
      setSortDirection("desc");
      return;
    }
    if (tab === "top") {
      setSortKey("rank");
      setSortDirection("asc");
    }
  }

  function updateSort(nextKey: MarketSortKey) {
    setSortKey((current) => {
      if (current === nextKey) {
        setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
        return current;
      }
      setSortDirection(nextKey === "rank" ? "asc" : "desc");
      return nextKey;
    });
  }

  function SortHeader({
    label,
    sort,
    align = "left",
  }: {
    label: string;
    sort: MarketSortKey;
    align?: "left" | "right";
  }) {
    const active = sortKey === sort;
    return (
      <button
        type="button"
        onClick={() => updateSort(sort)}
        aria-label={`Sort by ${label}. ${active ? sortDirectionCopy(sort, sortDirection) : "Click once for primary direction, click again to reverse."}`}
        title={`Sort by ${label} · ${active ? sortDirectionCopy(sort, sortDirection) : "click twice to reverse"}`}
        className={`inline-flex items-center gap-1.5 transition hover:text-white ${align === "right" ? "justify-end" : "justify-start"} ${active ? "text-velmere-gold" : "text-white/[0.38]"}`}
      >
        {label}
        <span className={`text-[9px] ${active ? "opacity-100" : "opacity-30"}`}>
          {active ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
        </span>
        <span className="sr-only">
          {active ? sortDirectionCopy(sort, sortDirection) : "not sorted"}
        </span>
      </button>
    );
  }

  function handleTableWheel(event: WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const scroller = document.scrollingElement ?? document.documentElement;
    const before = scroller.scrollTop;
    scroller.scrollTop += event.deltaY;
    if (scroller.scrollTop !== before) event.preventDefault();
  }

  const activeCase = useMemo(() => {
    if (!caseInbox.length) return null;
    return (
      caseInbox.find((item) => (item.caseId ?? item.id) === activeCaseId) ??
      caseInbox[0]
    );
  }, [activeCaseId, caseInbox]);

  function sentinelTone(type: SentinelAlert["type"]) {
    if (type === "critical_cluster")
      return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
    if (type === "rising_risk")
      return "border-amber-300/[0.20] bg-amber-300/[0.055] text-amber-100";
    if (type === "parabolic_pump")
      return "border-orange-300/[0.20] bg-orange-300/[0.055] text-orange-100";
    if (type === "liquidity_stress")
      return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    return "border-white/[0.10] bg-white/[0.035] text-white/[0.66]";
  }

  function caseTone(tone?: ShieldCaseTimelineEvent["tone"]) {
    if (tone === "critical")
      return "border-red-300/[0.26] bg-red-400/[0.08] text-red-100";
    if (tone === "warning")
      return "border-amber-300/[0.22] bg-amber-300/[0.07] text-amber-100";
    if (tone === "watch")
      return "border-velmere-gold/[0.20] bg-velmere-gold/[0.06] text-velmere-gold";
    return "border-white/[0.10] bg-white/[0.035] text-white/[0.62]";
  }

  function alertTypeLabel(type: SentinelAlert["type"]) {
    return t(`caseInbox.types.${type}`);
  }

  function ruleTone(severity: ShieldRuleHit["severity"]) {
    if (severity === "critical")
      return "border-red-300/[0.24] bg-red-400/[0.07] text-red-100";
    if (severity === "warning")
      return "border-amber-300/[0.22] bg-amber-300/[0.07] text-amber-100";
    if (severity === "watch")
      return "border-velmere-gold/[0.20] bg-velmere-gold/[0.06] text-velmere-gold";
    return "border-white/[0.10] bg-white/[0.028] text-white/[0.58]";
  }

  function ruleActionLabel(action: ShieldRuleHit["action"]) {
    return t(`rules.actions.${action}`);
  }

  function formatCaseDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const fallbackTimeline: ShieldCaseTimelineEvent[] = activeCase
    ? [
        {
          id: "opened",
          timestamp:
            activeCase.firstSeenAt ??
            activeCase.timestamp ??
            new Date().toISOString(),
          label: t("caseInbox.timeline.opened"),
          body: activeCase.reason,
          score: activeCase.score,
          tone: activeCase.score >= 65 ? "warning" : "watch",
        },
        {
          id: "action",
          timestamp:
            activeCase.lastSeenAt ??
            activeCase.timestamp ??
            new Date().toISOString(),
          label: t("caseInbox.timeline.action"),
          body: activeCase.action,
          score: activeCase.score,
          tone: activeCase.score >= 85 ? "critical" : "watch",
        },
      ]
    : [];

  const shieldLayers = [
    {
      label: "Velocity",
      score:
        result?.agentAssessments?.find((agent) => agent.id === "velocity")
          ?.score ?? 42 + ((interactionPulse * 7) % 28),
      body: "Detects parabolic moves, sharp reversals and abnormal multi-timeframe acceleration.",
      action: "Compare candles, volume and replay before opening a case.",
    },
    {
      label: "Liquidity",
      score:
        result?.agentAssessments?.find((agent) => agent.id === "liquidity")
          ?.score ?? 38 + ((interactionPulse * 5) % 32),
      body: "Measures visible exit depth, liquidity/market-cap coverage and sell-impact pressure.",
      action:
        "Open the token card and verify depth, slippage and stress simulator.",
    },
    {
      label: "Holders",
      score:
        result?.agentAssessments?.find((agent) => agent.id === "holders")
          ?.score ?? 36 + ((interactionPulse * 9) % 30),
      body: "Tracks concentration, float uncertainty, whale pressure and unresolved wallet clusters.",
      action:
        "Use holder intelligence and never treat missing chain data as safety.",
    },
    {
      label: "Contract",
      score:
        result?.agentAssessments?.find((agent) => agent.id === "contract")
          ?.score ?? 28 + ((interactionPulse * 4) % 22),
      body: "Escalates taxes, privilege flags, honeypot risk and missing contract metadata.",
      action:
        "Verify owner controls, blacklist/mint/pause permissions and tax changes.",
    },
    {
      label: "Order book",
      score:
        result?.agentAssessments?.find((agent) => agent.id === "microstructure")
          ?.score ?? 34 + ((interactionPulse * 6) % 34),
      body: "Looks for thin depth, imbalance, spoof-like stress and weak support zones.",
      action:
        "Inspect heatmap and danger zones when opening the terminal modal.",
    },
    {
      label: "Data",
      score:
        result?.agentAssessments?.find((agent) => agent.id === "data")?.score ??
        26 + ((interactionPulse * 3) % 20),
      body: "Separates real evidence from uncertainty, stale data and unsupported tokens.",
      action:
        "Connect Supabase cron, holders and order-book feeds for stronger confidence.",
    },
  ];
  const activeLayer =
    shieldLayers.find((layer) => layer.label === activeShieldLayer) ??
    shieldLayers[0];
  const socCritical =
    rulesSummary?.critical ??
    caseInbox.filter((item) => item.score >= 85).length;
  const socWatch =
    (rulesSummary?.warning ?? 0) +
    (rulesSummary?.watch ?? 0) +
    caseInbox.filter((item) => item.score >= 35 && item.score < 85).length;
  const criticalReviewRows = [
    ...caseInbox.map((item) => ({
      id: item.caseId ?? item.id,
      symbol: item.symbol,
      label: item.headline,
      score: item.score,
      action: item.action,
      source: "case",
    })),
    ...ruleHits.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      label: item.headline,
      score: item.score,
      action: item.nextStep,
      source: item.severity,
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <main className="shield-typography-root shield-no-overlap bg-velmere-black text-velmere-ivory">
      <section className="luxury-section shield-no-overlap sticky top-[4.35rem] z-30 border-b border-white/[0.06] bg-velmere-black/[0.86] py-4 backdrop-blur-xl md:top-[4.75rem]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-6xl min-w-0"
        >
          <div className="mx-auto max-w-4xl min-w-0">
            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <form
                ref={searchShellRef}
                onSubmit={onSubmit}
                className="shield-search-shell"
              >
                <label className="sr-only" htmlFor="market-integrity-search">
                  {t("searchLabel")}
                </label>
                <div className="flex min-h-[3.5rem] items-center gap-3 rounded-full bg-black/[0.34] px-4 md:px-5">
                  <input
                    id="market-integrity-search"
                    value={query}
                    onFocus={() =>
                      suggestions.length && setSuggestionsOpen(true)
                    }
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSuggestionsOpen(false);
                        if (query) setQuery("");
                      }
                    }}
                    placeholder=""
                    aria-label={t("searchLabel")}
                    className="shield-search-input"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {suggestionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white/[0.35]" />
                  ) : null}
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSuggestions([]);
                        setSuggestionsOpen(false);
                      }}
                      aria-label="Clear search"
                      className="shield-search-icon-button shield-premium-focus text-white/[0.34] hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={loading}
                    aria-label={t("scanButton")}
                    className="shield-premium-focus inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.08] text-velmere-gold transition hover:border-velmere-gold/[0.38] hover:bg-velmere-gold/[0.14] disabled:cursor-wait disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {suggestionsOpen && suggestions.length ? (
                  <div className="absolute left-1/2 top-[calc(100%+0.55rem)] z-40 w-[min(29rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[1.1rem] border border-white/[0.12] bg-[#101013]/[0.98] text-left shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                    {suggestions.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setQuery(item.symbol);
                          setSuggestionsOpen(false);
                          void scanToken(item.id);
                        }}
                        className="flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-2.5 text-left transition last:border-b-0 hover:bg-white/[0.055]"
                      >
                        <TokenAvatar image={item.image} symbol={item.symbol} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-white">
                            {item.name}
                          </span>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.42]">
                            {item.symbol}
                            {item.rank ? ` · #${item.rank}` : ""}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </form>

              <div className="flex items-center justify-end gap-2">
                <Link
                  href="/market-integrity/shield-map"
                  className="shield-map-button shield-premium-focus"
                  aria-label="Open full Shield Map page"
                >
                  <Radar className="h-3.5 w-3.5" />
                  Shield map
                </Link>
              </div>
            </div>

            {sourceCooldownActive ? (
              <div className="shield-source-cooldown mt-3" role="status" aria-live="polite">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold">source cooldown</span>
                <span className="text-xs leading-5 text-white/[0.54]">External search/analyze is rate-limited for {sourceCooldownSeconds}s. Table clicks stay local-first and safe.</span>
              </div>
            ) : null}

            {false ? (
              <motion.div
                key={interactionPulse}
                initial={
                  reducedMotion ? false : { opacity: 0, y: -6, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="shield-quick-panel mt-3"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,0.86fr)_minmax(18rem,0.44fr)] lg:items-stretch">
                  <div className="min-w-0 rounded-[1.25rem] border border-white/[0.075] bg-black/[0.18] p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.28] bg-black/[0.24] text-velmere-gold">
                          <Brain className="h-4 w-4" />
                          {loading ? (
                            <span className="absolute inset-0 animate-ping rounded-full border border-velmere-gold/[0.20]" />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                            Shield lens · quick status
                          </p>
                          <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.42]">
                            Tarcza pokazuje tylko warstwy review. Pełna mapa działania jest na osobnej stronie Shield Map.
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span className="shield-readability-grade">
                          <span className="text-white/[0.34]">safe wording</span>
                          <span className="text-velmere-gold">requires review</span>
                        </span>
                        <span className="shield-readability-grade">
                          <span className="text-white/[0.34]">legal rail</span>
                          <span className="text-velmere-gold">Not financial advice</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {shieldLayers.map((layer) => {
                        const active = activeLayer.label === layer.label;
                        return (
                          <button
                            key={layer.label}
                            type="button"
                            onClick={() => setActiveShieldLayer(layer.label)}
                            className={`shield-inspector-layer ${active ? "border-velmere-gold/[0.36] bg-velmere-gold/[0.08] shadow-[0_0_0_1px_rgba(200,169,106,0.10)]" : "border-white/[0.08] bg-black/[0.20] hover:border-white/[0.18] hover:bg-white/[0.026]"}`}
                            aria-pressed={active}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.50]">
                                {layer.label}
                              </span>
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${layer.score >= 65 ? "bg-amber-300" : "bg-velmere-gold"}`}
                              />
                            </div>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                              <motion.div
                                initial={reducedMotion ? false : { width: "8%" }}
                                animate={{
                                  width: `${Math.max(8, Math.min(100, layer.score))}%`,
                                }}
                                transition={{
                                  duration: 0.55,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className="h-full rounded-full bg-velmere-gold"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="min-w-0 rounded-[1.25rem] border border-velmere-gold/[0.16] bg-[radial-gradient(circle_at_0%_0%,rgba(200,169,106,0.10),transparent_36%),rgba(255,255,255,0.022)] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.38]">
                      selected layer · {activeLayer.label}
                    </p>
                    <p className="shield-copy-safe mt-1 text-xs leading-6 text-white/[0.56]">
                      {activeLayer.body}
                    </p>
                    <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.40]">
                      {activeLayer.action}
                    </p>
                    <div className="mt-3 rounded-[1rem] border border-white/[0.07] bg-black/[0.16] p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">runtime guard</span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-velmere-gold">PASS74</span>
                      </div>
                      <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.40]">
                        Tarcza nie pokazuje pełnego systemu ani JSON. To szybki lens: warstwa, następny krok i skrót do pełnej Shield Map.
                      </p>
                      <div className="mt-2 grid gap-1.5">
                        {(criticalReviewRows.length ? criticalReviewRows : [{ id: "no-critical", symbol: "—", label: "No critical queue from current sweep", score: 0, action: "Open full map for source lanes", source: "runtime" }]).slice(0, 3).map((row) => (
                          <Link
                            key={row.id}
                            href={row.symbol !== "—" ? `/market-integrity?scan=${encodeURIComponent(row.symbol)}` : "/market-integrity/shield-map"}
                            className="shield-lens-review-row shield-premium-focus"
                          >
                            <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.62]">{row.symbol}</span>
                            <span className="min-w-0 flex-1 truncate text-[10px] text-white/[0.42]">{row.label}</span>
                            <span className="shrink-0 font-mono text-[9px] text-velmere-gold">{row.score}/100</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Link
                        href="/market-integrity/shield-map"
                        className="shield-premium-focus rounded-full border border-velmere-gold/[0.20] bg-velmere-gold/[0.075] px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.13em] text-velmere-gold transition hover:bg-velmere-gold/[0.12]"
                      >
                        open full map
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShieldInspectorOpen(false)}
                        className="shield-premium-focus rounded-full border border-white/[0.10] bg-white/[0.026] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.48] transition hover:border-white/[0.20] hover:text-white"
                      >
                        hide lens
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/[0.22] bg-red-500/[0.08] p-4 text-sm leading-7 text-red-100">
                {t("errors.prefix")}: {error}
              </div>
            ) : null}
          </div>
        </motion.div>
      </section>

      <section className="luxury-section shield-no-overlap pb-16 pt-5 md:pb-24">
        <div className="shield-table-shell">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => selectTab(tab)}
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition ${activeTab === tab ? "border-velmere-gold/[0.45] bg-velmere-gold/[0.12] text-velmere-gold" : "border-white/[0.10] bg-white/[0.025] text-white/[0.42] hover:border-white/[0.22] hover:text-white"}`}
                >
                  {t(`tabs.${tab}`)}
                </button>
              ))}
            </div>
            <div className="inline-flex flex-wrap items-center gap-3 text-xs text-white/[0.38]">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.32]">
                {visibleRows.length}/{marketRows.length}
              </span>
              <span className="hidden h-4 w-px bg-white/[0.10] md:inline-flex" />
              <span className="inline-flex items-center gap-2">
                <LineChart className="h-4 w-4 text-velmere-gold" />
                {t("marketTable.liveNote")}
              </span>
              <span className="shield-sort-hint">
                sort · {marketSortLabels[sortKey]} ·{" "}
                {sortDirectionCopy(sortKey, sortDirection)}
              </span>
            </div>
          </div>

          {marketLoading ? (
            <div className="grid gap-3 p-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-2xl bg-white/[0.045]"
                />
              ))}
            </div>
          ) : marketError ? (
            <div className="p-6 text-sm leading-7 text-red-100">
              {t("errors.prefix")}: {marketError}
            </div>
          ) : (
            <>
              <div className="grid gap-3 p-3 md:hidden">
                {visibleRows.slice(0, 80).map((row) => {
                  const inWatchlist =
                    watchlistSymbols.includes(row.symbol) ||
                    watchlistSymbols.includes(row.id.toUpperCase());
                  return (
                    <button
                      key={`mobile-${row.id}`}
                      type="button"
                      onClick={() => openTokenModal(row)}
                      className="shield-mobile-coin-card shield-premium-focus text-left transition hover:border-velmere-gold/[0.28] hover:bg-white/[0.042]"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <TokenAvatar image={row.image} symbol={row.symbol} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {row.name}
                            </p>
                            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.13em] text-white/[0.38]">
                              #{row.rank ?? "—"} · {row.symbol}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (inWatchlist) removeWatchlistSymbol(row.symbol);
                            else addWatchlistSymbol(row.symbol);
                          }}
                          className={`shield-premium-focus shrink-0 rounded-full border border-white/[0.08] p-2 transition ${inWatchlist ? "text-velmere-gold" : "text-white/[0.24]"}`}
                          aria-label={
                            inWatchlist
                              ? `${t("watchlist.remove")} ${row.symbol}`
                              : `${t("watchlist.addQuery")} ${row.symbol}`
                          }
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${inWatchlist ? "fill-current" : ""}`}
                          />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px] tabular-nums">
                        <div className="shield-kpi-compact">
                          <p className="uppercase tracking-[0.13em] text-white/[0.30]">
                            price
                          </p>
                          <p className="mt-1 truncate text-white">
                            {formatUsd(row.price)}
                          </p>
                        </div>
                        <div className="shield-kpi-compact">
                          <p className="uppercase tracking-[0.13em] text-white/[0.30]">
                            24h
                          </p>
                          <p
                            className={`mt-1 ${row.priceChange24h === undefined ? "text-white/[0.32]" : row.priceChange24h >= 0 ? "text-emerald-300" : "text-red-300"}`}
                          >
                            {formatPercent(row.priceChange24h)}
                          </p>
                        </div>
                        <div className="shield-kpi-compact">
                          <p className="uppercase tracking-[0.13em] text-white/[0.30]">
                            risk
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-white/[0.78]">
                            <RiskDot level={row.result.level} />{" "}
                            {row.result.score}/100
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Sparkline
                          values={row.sparkline7d}
                          change={row.priceChange7d}
                        />
                        <span className="shield-readability-grade shrink-0">
                          review terminal
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div
                className="shield-table-scroll-x hidden md:block"
                onWheel={handleTableWheel}
              >
                <table className="w-full min-w-[1080px] table-fixed border-collapse text-left tabular-nums">
                  <thead className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#101013]/[0.98] font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.38] backdrop-blur-xl">
                    <tr>
                      <th className="px-4 py-4">
                        <SortHeader label="#" sort="rank" />
                      </th>
                      <th className="w-[17rem] px-4 py-4">
                        {t("marketTable.name")}
                      </th>
                      <th className="px-4 py-4 text-right">
                        <SortHeader
                          label={t("marketTable.price")}
                          sort="price"
                          align="right"
                        />
                      </th>
                      <th className="px-4 py-4 text-right">1h</th>
                      <th className="px-4 py-4 text-right">
                        <SortHeader
                          label="24h"
                          sort="change24h"
                          align="right"
                        />
                      </th>
                      <th className="px-4 py-4 text-right">
                        <SortHeader label="7d" sort="change7d" align="right" />
                      </th>
                      <th className="px-4 py-4 text-right">30d</th>
                      <th className="px-4 py-4 text-right">
                        <SortHeader
                          label={t("marketTable.marketCap")}
                          sort="marketCap"
                          align="right"
                        />
                      </th>
                      <th className="px-4 py-4 text-right">
                        <SortHeader
                          label={t("marketTable.volume")}
                          sort="volume"
                          align="right"
                        />
                      </th>
                      <th className="px-4 py-4">
                        <SortHeader label={t("marketTable.risk")} sort="risk" />
                      </th>
                      <th className="w-[10rem] px-4 py-4">
                        {t("marketTable.last7d")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => {
                      const inWatchlist =
                        watchlistSymbols.includes(row.symbol) ||
                        watchlistSymbols.includes(row.id.toUpperCase());
                      return (
                        <tr
                          key={row.id}
                          onClick={() => openTokenModal(row)}
                          className="shield-market-row group"
                        >
                          <td className="shield-table-cell font-mono text-xs text-white/[0.42]">
                            <span className="inline-flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (inWatchlist)
                                    removeWatchlistSymbol(row.symbol);
                                  else addWatchlistSymbol(row.symbol);
                                }}
                                className={`shield-premium-focus rounded-full p-1 transition ${inWatchlist ? "text-velmere-gold" : "text-white/[0.18] hover:text-velmere-gold"}`}
                                aria-label={
                                  inWatchlist
                                    ? `${t("watchlist.remove")} ${row.symbol}`
                                    : `${t("watchlist.addQuery")} ${row.symbol}`
                                }
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${inWatchlist ? "fill-current" : ""}`}
                                />
                              </button>
                              {row.rank ?? "—"}
                            </span>
                          </td>
                          <td className="shield-table-cell">
                            <div className="flex min-w-0 items-center gap-3">
                              <TokenAvatar
                                image={row.image}
                                symbol={row.symbol}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white transition group-hover:text-velmere-gold">
                                  {row.name}
                                </p>
                                <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.38]">
                                  {row.symbol}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="shield-table-cell text-right font-mono text-sm text-white">
                            {formatUsd(row.price)}
                          </td>
                          {[
                            row.priceChange1h,
                            row.priceChange24h,
                            row.priceChange7d,
                            row.priceChange30d,
                          ].map((value, index) => (
                            <td
                              key={index}
                              className={`shield-table-cell text-right font-mono text-xs ${value === undefined ? "text-white/[0.32]" : value >= 0 ? "text-emerald-300" : "text-red-300"}`}
                            >
                              {formatPercent(value)}
                            </td>
                          ))}
                          <td className="shield-table-cell text-right font-mono text-xs text-white/[0.75]">
                            {formatUsd(row.marketCap)}
                          </td>
                          <td className="shield-table-cell text-right font-mono text-xs text-white/[0.75]">
                            {formatUsd(row.volume24h)}
                          </td>
                          <td className="shield-table-cell">
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <RiskDot level={row.result.level} />
                              <span className="font-mono text-xs text-white/[0.68]">
                                {row.result.score}/100
                              </span>
                              {row.memory?.riskDeltaLatest ? (
                                <span
                                  className={`font-mono text-[9px] uppercase tracking-[0.12em] ${row.memory.riskDeltaLatest > 0 ? "text-amber-200" : "text-emerald-200"}`}
                                >
                                  Δ{row.memory.riskDeltaLatest > 0 ? "+" : ""}
                                  {row.memory.riskDeltaLatest}
                                </span>
                              ) : null}
                              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.30]">
                                {levelLabel(row.result.score)}
                              </span>
                            </span>
                          </td>
                          <td className="shield-table-cell">
                            <Sparkline
                              values={row.sparkline7d}
                              change={row.priceChange7d}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/[0.08] p-4 md:flex-row md:items-center md:justify-between">
                <p className="shield-copy-rhythm text-xs text-white/[0.42]">
                  {t("marketTable.coverageNote")} · Not financial advice.
                  Algorithmic risk flag only.
                </p>
                <button
                  type="button"
                  onClick={() => void loadMarkets(page + 1, "append")}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.035] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.68] transition hover:border-velmere-gold/[0.35] hover:text-velmere-gold disabled:cursor-wait disabled:opacity-60"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}{" "}
                  {t("marketTable.loadMore")}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {isOpeningTerminal && !selected ? (
        <div className="fixed bottom-5 left-1/2 z-[99998] -translate-x-1/2 rounded-full border border-velmere-gold/[0.18] bg-black/[0.72] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          opening terminal
        </div>
      ) : null}

      {selected ? (
        <ShieldModalErrorBoundary
          resetKey={"id" in selected ? selected.id : selected.token.symbol}
          onClose={closeTokenModal}
        >
          <TokenRiskModal item={selected} onClose={closeTokenModal} />
        </ShieldModalErrorBoundary>
      ) : null}
    </main>
  );
}
