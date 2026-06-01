"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  LineChart,
  Loader2,
  Search,
  ShieldAlert,
  Star,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import TokenRiskModal from "@/components/market-integrity/TokenRiskModal";
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


type SentinelAlert = {
  id: string;
  type: "critical_cluster" | "rising_risk" | "parabolic_pump" | "liquidity_stress" | "data_gap";
  symbol: string;
  name: string;
  score: number;
  level: TokenRiskResult["level"];
  confidence?: number;
  dominantAgent?: string;
  headline: string;
  reason: string;
  action: string;
};
type SentinelApiResponse =
  | { mode: "live"; alerts: SentinelAlert[]; generatedAt: string; rowsScanned: number }
  | { mode: "error"; error: string };

const tabs = ["top", "trending", "watchlist", "highestRisk"] as const;

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
  return image;
}

function TokenAvatar({ image, symbol }: { image?: string; symbol: string }) {
  const [failed, setFailed] = useState(false);
  const src = proxiedIcon(image);
  if (!src || failed) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] font-mono text-[10px] text-white/[0.62]">
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="h-8 w-8 shrink-0 rounded-full bg-white/[0.05] object-cover"
      loading="lazy"
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
  const [sentinelAlerts, setSentinelAlerts] = useState<SentinelAlert[]>([]);
  const [sentinelLoading, setSentinelLoading] = useState(true);

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
      try {
        const response = await fetch("/api/market-integrity/sentinel?pages=1&perPage=120", {
          headers: { accept: "application/json" },
        });
        const data = (await response.json()) as SentinelApiResponse;
        if (active && response.ok && data.mode === "live") setSentinelAlerts(data.alerts.slice(0, 4));
      } catch {
        if (active) setSentinelAlerts([]);
      } finally {
        if (active) setSentinelLoading(false);
      }
    }
    void loadSentinel();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
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
  }, [query]);

  const visibleRows = useMemo(() => {
    const rows = [...marketRows];
    if (activeTab === "highestRisk")
      return rows.sort(
        (a, b) =>
          b.result.score - a.result.score ||
          (a.rank ?? 9999) - (b.rank ?? 9999),
      );
    if (activeTab === "trending")
      return rows.sort(
        (a, b) =>
          Math.abs(b.priceChange24h ?? 0) - Math.abs(a.priceChange24h ?? 0),
      );
    if (activeTab === "watchlist")
      return rows
        .filter((row) =>
          ["BTC", "ETH", "SOL", "OM", "PEPE", "DOGE"].includes(row.symbol),
        )
        .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
    return rows.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  }, [activeTab, marketRows]);

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

  async function scanToken(nextQuery = query) {
    const clean = nextQuery.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    setSuggestionsOpen(false);
    try {
      const response = await fetch(
        `/api/market-integrity/analyze?query=${encodeURIComponent(clean)}`,
        { method: "GET", headers: { accept: "application/json" } },
      );
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || data.mode === "error")
        throw new Error(
          data.mode === "error" ? data.error : t("errors.generic"),
        );
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
    setSelected(item);
  }

  function closeTokenModal() {
    setSelected(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void scanToken();
  }

  function sentinelTone(type: SentinelAlert["type"]) {
    if (type === "critical_cluster") return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
    if (type === "rising_risk") return "border-amber-300/[0.20] bg-amber-300/[0.055] text-amber-100";
    if (type === "parabolic_pump") return "border-orange-300/[0.20] bg-orange-300/[0.055] text-orange-100";
    if (type === "liquidity_stress") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    return "border-white/[0.10] bg-white/[0.035] text-white/[0.66]";
  }

  return (
    <main className="bg-velmere-black text-velmere-ivory">
      <section className="luxury-section pt-14 md:pt-18">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl text-center"
        >
          <p className="velmere-label text-velmere-gold">{t("kicker")}</p>
          <h1 className="mx-auto mt-3 max-w-[12ch] font-serif text-[clamp(2.25rem,5vw,5.35rem)] leading-[0.88] tracking-[-0.06em]">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-velmere-grey-soft md:text-base">
            {t("subtitle")}
          </p>

          <div className="mx-auto mt-7 grid max-w-4xl gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <form
              onSubmit={onSubmit}
              className="relative rounded-full border border-white/[0.12] bg-[#101012]/[0.88] p-2 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            >
              <label className="sr-only" htmlFor="market-integrity-search">
                {t("searchLabel")}
              </label>
              <div className="flex min-h-[3.25rem] items-center gap-3 rounded-full bg-black/[0.30] px-4 md:px-5">
                <Search className="h-4 w-4 shrink-0 text-velmere-gold" />
                <input
                  id="market-integrity-search"
                  value={query}
                  onFocus={() => suggestions.length && setSuggestionsOpen(true)}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/[0.32]"
                  autoComplete="off"
                  spellCheck={false}
                />
                {suggestionLoading ? <Loader2 className="h-4 w-4 animate-spin text-white/[0.35]" /> : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-velmere-ivory px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-velmere-gold disabled:cursor-wait disabled:opacity-70 md:px-5"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("scanButton")}
                  <ArrowRight className="h-3.5 w-3.5" />
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
                        <span className="block truncate text-sm font-semibold text-white">{item.name}</span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.42]">
                          {item.symbol}{item.rank ? ` · #${item.rank}` : ""}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </form>

            <Link
              href="/market-integrity/about"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08] px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-velmere-gold transition hover:border-velmere-gold/[0.44] hover:bg-velmere-gold/[0.14]"
            >
              <ShieldAlert className="h-4 w-4" />
              {t("aboutButton")}
            </Link>
          </div>

          <p className="mx-auto mt-3 max-w-3xl text-xs leading-6 text-white/[0.40]">
            {t("privateSystem")}
          </p>

          {error ? (
            <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-red-400/[0.22] bg-red-500/[0.08] p-4 text-sm leading-7 text-red-100">
              {t("errors.prefix")}: {error}
            </div>
          ) : null}

          <div className="mx-auto mt-5 max-w-5xl rounded-[1.35rem] border border-white/[0.09] bg-white/[0.025] p-3 text-left">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                {t("sentinel.title")}
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.30]">
                {sentinelLoading ? t("sentinel.scanning") : `${sentinelAlerts.length} ${t("sentinel.alerts")}`}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              {(sentinelAlerts.length ? sentinelAlerts : Array.from({ length: 4 }).map((_, index) => ({
                id: `empty-${index}`,
                type: "data_gap" as const,
                symbol: "—",
                name: t("sentinel.waiting"),
                score: 0,
                level: "low" as const,
                headline: t("sentinel.emptyHeadline"),
                reason: t("sentinel.emptyBody"),
                action: "",
              }))).map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  disabled={alert.symbol === "—"}
                  onClick={() => alert.symbol !== "—" && void scanToken(alert.symbol)}
                  className={`min-h-[5.75rem] rounded-2xl border p-3 text-left transition hover:border-velmere-gold/[0.35] disabled:cursor-default ${sentinelTone(alert.type)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">{alert.symbol}</span>
                    <span className="font-mono text-[10px] text-white/[0.56]">{alert.score ? `${alert.score}/100` : "—"}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-white/[0.82]">{alert.headline}</p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-white/[0.40]">{alert.name}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="luxury-section py-5">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              label: t("sweepStats.marketCap"),
              value: formatUsd(stats.marketCap),
              tone: stats.avgChange >= 0 ? "text-emerald-300" : "text-red-300",
              sub: formatPercent(stats.avgChange),
            },
            {
              label: t("sweepStats.volume"),
              value: formatUsd(stats.volume),
              tone: "text-white",
              sub: "24h",
            },
            {
              label: t("sweepStats.highestRisk"),
              value: stats.highestRisk ? stats.highestRisk.symbol : "—",
              tone: "text-velmere-gold",
              sub: stats.highestRisk
                ? `${stats.highestRisk.result.score}/100`
                : "—",
            },
            {
              label: t("sweepStats.coverage"),
              value: `${marketRows.length}`,
              tone: "text-white",
              sub: t("sweepStats.assets"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.10] bg-white/[0.030] p-3.5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.35]">
                {item.label}
              </p>
              <p
                className={`mt-2 font-mono text-lg font-semibold ${item.tone}`}
              >
                {item.value}
              </p>
              <p className="mt-1 text-xs text-white/[0.38]">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="luxury-section pb-16 md:pb-24">
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#0d0d10] shadow-velmere-card">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition ${activeTab === tab ? "border-velmere-gold/[0.45] bg-velmere-gold/[0.12] text-velmere-gold" : "border-white/[0.10] bg-white/[0.025] text-white/[0.42] hover:border-white/[0.22] hover:text-white"}`}
                >
                  {t(`tabs.${tab}`)}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-white/[0.38]">
              <LineChart className="h-4 w-4 text-velmere-gold" />{" "}
              {t("marketTable.liveNote")}
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
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full border-collapse text-left">
                  <thead className="border-b border-white/[0.08] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.38]">
                    <tr>
                      <th className="px-4 py-4">#</th>
                      <th className="px-4 py-4">{t("marketTable.name")}</th>
                      <th className="px-4 py-4 text-right">
                        {t("marketTable.price")}
                      </th>
                      <th className="px-4 py-4 text-right">1h</th>
                      <th className="px-4 py-4 text-right">24h</th>
                      <th className="px-4 py-4 text-right">7d</th>
                      <th className="px-4 py-4 text-right">30d</th>
                      <th className="px-4 py-4 text-right">
                        {t("marketTable.marketCap")}
                      </th>
                      <th className="px-4 py-4 text-right">
                        {t("marketTable.volume")}
                      </th>
                      <th className="px-4 py-4">{t("marketTable.risk")}</th>
                      <th className="px-4 py-4">{t("marketTable.last7d")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => openTokenModal(row)}
                        className="cursor-pointer border-b border-white/[0.06] transition hover:bg-white/[0.045]"
                      >
                        <td className="px-4 py-4 font-mono text-xs text-white/[0.42]">
                          <span className="inline-flex items-center gap-3">
                            <Star className="h-3.5 w-3.5 text-white/[0.18]" />
                            {row.rank ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <TokenAvatar
                              image={row.image}
                              symbol={row.symbol}
                            />
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {row.name}
                              </p>
                              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.38]">
                                {row.symbol}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-sm text-white">
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
                            className={`px-4 py-4 text-right font-mono text-xs ${value === undefined ? "text-white/[0.32]" : value >= 0 ? "text-emerald-300" : "text-red-300"}`}
                          >
                            {formatPercent(value)}
                          </td>
                        ))}
                        <td className="px-4 py-4 text-right font-mono text-xs text-white/[0.75]">
                          {formatUsd(row.marketCap)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-xs text-white/[0.75]">
                          {formatUsd(row.volume24h)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2">
                            <RiskDot level={row.result.level} />
                            <span className="font-mono text-xs text-white/[0.68]">
                              {row.result.score}/100
                            </span>
                            {row.memory?.riskDeltaLatest ? (
                              <span className={`font-mono text-[9px] uppercase tracking-[0.12em] ${row.memory.riskDeltaLatest > 0 ? "text-amber-200" : "text-emerald-200"}`}>
                                Δ{row.memory.riskDeltaLatest > 0 ? "+" : ""}{row.memory.riskDeltaLatest}
                              </span>
                            ) : null}
                            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.30]">
                              {levelLabel(row.result.score)}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Sparkline
                            values={row.sparkline7d}
                            change={row.priceChange7d}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/[0.08] p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-xs leading-6 text-white/[0.42]">
                  {t("marketTable.coverageNote")}
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

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["low", "medium", "high", "critical"].map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.35]">
                {t(`riskScale.${key}.range`)}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {t(`riskScale.${key}.label`)}
              </p>
              <p className="mt-2 text-xs leading-6 text-white/[0.44]">
                {t(`riskScale.${key}.body`)}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 min-h-[9rem] animate-pulse rounded-[2rem] border border-white/[0.10] bg-white/[0.04]" />
        ) : result ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => openTokenModal(result)}
              className="w-full text-left"
            >
              <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.035] p-5 transition hover:border-velmere-gold/[0.24]">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("cardKicker")}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {scannedSummary}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/[0.48]">
                  {result.aiSummary}
                </p>
              </div>
            </button>
          </div>
        ) : null}
      </section>

      {selected ? (
        <TokenRiskModal item={selected} onClose={closeTokenModal} />
      ) : null}
    </main>
  );
}
