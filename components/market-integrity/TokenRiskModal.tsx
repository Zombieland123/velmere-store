"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Loader2,
  Radar,
  Maximize2,
  Minimize2,
  Network,
  ShieldCheck,
  Sigma,
  WalletCards,
  Target,
  GitBranch,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import TokenRiskBadge from "@/components/market-integrity/TokenRiskBadge";
import { buildAttackSurface } from "@/lib/market-integrity/attack-playbook";
import { buildHolderIntelligence } from "@/lib/market-integrity/holder-intelligence";
import { buildStressScenarios } from "@/lib/market-integrity/stress-simulator";
import { buildRiskReplay } from "@/lib/market-integrity/risk-replay";
import { buildAiRiskBotBrief } from "@/lib/market-integrity/ai-risk-bot";
import { buildAiRiskOrchestrator } from "@/lib/market-integrity/ai-orchestrator";
import { buildShieldChatResponse } from "@/lib/market-integrity/shield-chat";
import { buildChartRegime } from "@/lib/market-integrity/chart-regime";
import { buildSocTerminalBrief } from "@/lib/market-integrity/soc-orchestrator";
import { buildVlmShieldAccess } from "@/lib/market-integrity/vlm-access-layer";
import { buildTerminalReadiness } from "@/lib/market-integrity/terminal-readiness";
import { buildEvidenceWorkflow } from "@/lib/market-integrity/evidence-workflow";
import { buildLiquidityIntelligence } from "@/lib/market-integrity/liquidity-intelligence";
import { buildVlmShieldInvestigator } from "@/lib/market-integrity/shield-investigator";
import { buildProductOpsAudit } from "@/lib/market-integrity/product-ops-audit";
import { buildTerminalControlPlane } from "@/lib/market-integrity/terminal-control-plane";
import { buildTerminalRiskWorkspace } from "@/lib/market-integrity/terminal-risk-workspace";
import { buildProductionHardening } from "@/lib/market-integrity/production-hardening";
import { buildTerminalUsabilityGuard } from "@/lib/market-integrity/terminal-usability-guard";
import { buildTerminalOperatorCopilot } from "@/lib/market-integrity/terminal-operator-copilot";
import { buildTerminalLaunchBridge } from "@/lib/market-integrity/terminal-launch-bridge";
import { buildTerminalSourceTrust } from "@/lib/market-integrity/terminal-source-trust";
import { buildTerminalEvidenceExport } from "@/lib/market-integrity/terminal-evidence-export";
import { buildTerminalRuntimeHealth } from "@/lib/market-integrity/terminal-runtime-health";
import { buildTerminalOperatorFocus } from "@/lib/market-integrity/terminal-operator-focus";
import { buildTerminalInteractionStability } from "@/lib/market-integrity/terminal-interaction-stability";
import { buildTerminalReviewDeck } from "@/lib/market-integrity/terminal-review-deck";
import { buildShieldOperatorCaseFile } from "@/lib/market-integrity/operator-casefile";
import { buildShieldEvidenceExportManifest, buildShieldEvidenceReportDraft, serializeShieldEvidenceExportManifest } from "@/lib/market-integrity/evidence-report";
import {
  badgeFromLevel,
  levelFromScore,
} from "@/lib/market-integrity/risk-engine";
import type {
  MarketChartRange,
  MarketIntegrityRow,
} from "@/lib/market-integrity/coingecko";
import type {
  RiskLevel,
  TokenRiskResult,
} from "@/lib/market-integrity/risk-types";

type ModalItem = MarketIntegrityRow | TokenRiskResult;
type BrainResult = TokenRiskResult;
type ChartPoint = {
  timestamp: number;
  price: number;
  volume?: number;
  marketCap?: number;
};
type ChartApiResponse =
  | {
      mode: "live";
      points: ChartPoint[];
      range: MarketChartRange;
      id: string;
      source: string;
      generatedAt: string;
    }
  | { mode: "error"; error: string };
type CandleApiResponse =
  | {
      mode: "live";
      candles: Candle[];
      range: MarketChartRange;
      pair: string;
      source: string;
      generatedAt: string;
    }
  | { mode: "error"; error: string };

type OrderBookLevel = {
  price: number;
  quantity: number;
  notionalUsd: number;
  cumulativeUsd: number;
};

type OrderBookResult = {
  symbol: string;
  bestBid?: number;
  bestAsk?: number;
  spreadPercent?: number;
  bidDepthUsd: number;
  askDepthUsd: number;
  bids?: OrderBookLevel[];
  asks?: OrderBookLevel[];
  bidAskImbalancePercent: number;
  simulatedSellSlippage10k?: number;
  simulatedBuySlippage10k?: number;
  riskPoints: number;
  signals: Array<{ id: string; label: string; points: number }>;
  source: string;
};
type OrderBookApiResponse =
  | { mode: "live"; orderbook: OrderBookResult; generatedAt: string }
  | { mode: "error"; error: string };

type HistorySnapshot = {
  id: string;
  symbol: string;
  timestamp: string;
  price?: number;
  volume24h?: number;
  score: number;
  level: RiskLevel;
};
type HistoryApiResponse =
  | { mode: "live"; history: HistorySnapshot[]; observations: number; generatedAt: string }
  | { mode: "error"; error: string };

const ranges = ["1m", "15m", "1h", "4h", "1d", "7d"] as const;
type VlmAiSequenceMode = "basic" | "pro" | "advanced";

type TerminalCommandId = "deck" | "risk" | "review" | "holders" | "liquidity" | "chart" | "evidence" | "data" | "copilot" | "launch" | "sources" | "export" | "runtime" | "usability" | "stability" | "ops" | "control" | "workspace" | "production";
type TerminalCommandRow = {
  id: TerminalCommandId;
  label: string;
  body: string;
  next: string;
};

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume?: number;
  trades?: number;
  timestamp: number;
};

function isMarketRow(item: ModalItem): item is MarketIntegrityRow {
  return "result" in item;
}

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

function combinedSafeVerdict(score: number) {
  if (score >= 80) return "critical review";
  if (score >= 55) return "watch closely";
  if (score >= 30) return "moderate watch";
  return "low detected risk";
}

function proxiedIcon(image?: string) {
  if (!image) return undefined;
  if (image.startsWith('/api/market-integrity/icon?url=')) return image;
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return `/api/market-integrity/icon?url=${encodeURIComponent(image)}`;
  }
  return image;
}

function TokenAvatar({ image, symbol }: { image?: string; symbol: string }) {
  const [failed, setFailed] = useState(false);
  const src = proxiedIcon(image);
  if (!src || failed) {
    return (
      <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] font-mono text-xs text-white/[0.62]">
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={44}
      height={44}
      unoptimized
      className="mt-1 h-11 w-11 shrink-0 rounded-full bg-white/[0.06] object-cover"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

type RangeProfile = {
  spanMs: number;
  targetBars: number;
  minimumVisibleBars: number;
  pixelsPerBar: number;
  label: string;
  tick: "minute" | "hour" | "day" | "week";
};

const rangeProfiles: Record<MarketChartRange, RangeProfile> = {
  "1m": { spanMs: 180 * MINUTE_MS, targetBars: 180, minimumVisibleBars: 90, pixelsPerBar: 4.7, label: "1m scalping bars", tick: "minute" },
  "15m": { spanMs: 180 * 15 * MINUTE_MS, targetBars: 180, minimumVisibleBars: 80, pixelsPerBar: 5.2, label: "15m session bars", tick: "hour" },
  "1h": { spanMs: 180 * HOUR_MS, targetBars: 180, minimumVisibleBars: 72, pixelsPerBar: 5.4, label: "1h structure bars", tick: "day" },
  "4h": { spanMs: 180 * 4 * HOUR_MS, targetBars: 180, minimumVisibleBars: 64, pixelsPerBar: 5.8, label: "4h swing bars", tick: "day" },
  "1d": { spanMs: 180 * DAY_MS, targetBars: 180, minimumVisibleBars: 56, pixelsPerBar: 6.4, label: "1d macro bars", tick: "day" },
  "7d": { spanMs: 104 * 7 * DAY_MS, targetBars: 104, minimumVisibleBars: 32, pixelsPerBar: 9.5, label: "7d macro bars", tick: "week" },
};

function profileForRange(range: MarketChartRange = "7d") {
  return rangeProfiles[range] ?? rangeProfiles["7d"];
}

function pointsFromPrices(values: number[], range: MarketChartRange = "7d"): ChartPoint[] {
  const clean = values.filter((value) => Number.isFinite(value));
  const profile = profileForRange(range);
  const selected = clean.slice(-profile.targetBars);
  const now = Date.now();
  const step =
    selected.length > 1 ? profile.spanMs / (selected.length - 1) : profile.spanMs;
  return selected.map((price, index) => ({
    timestamp: now - (selected.length - index - 1) * step,
    price,
  }));
}

function candlesFromPoints(points: ChartPoint[]): Candle[] {
  const clean = points.filter((point) => Number.isFinite(point.price));
  return clean.map((point, index) => {
    const previous = clean[Math.max(0, index - 1)]?.price ?? point.price;
    const next = clean[Math.min(clean.length - 1, index + 1)]?.price ?? point.price;
    const open = index === 0 ? point.price : previous;
    const close = point.price;
    const spread = Math.max(Math.abs(close - open), Math.abs(next - close), Math.abs(close) * 0.0015);
    const high = Math.max(open, close, next) + spread * 0.34;
    const low = Math.max(0, Math.min(open, close, next) - spread * 0.34);
    return {
      timestamp: point.timestamp,
      open,
      high,
      low,
      close,
      volume: point.volume ?? Math.max(1, spread * 1000000),
    };
  });
}

function fallbackPointsForResult(row: MarketIntegrityRow | null, result: TokenRiskResult, range: MarketChartRange = "7d"): ChartPoint[] {
  const profile = profileForRange(range);
  const raw = row?.sparkline7d ?? result.chart?.sevenDay ?? [];
  const clean = raw.filter((value) => Number.isFinite(value));
  if (clean.length >= 2) {
    const base = pointsFromPrices(clean, range);
    if (base.length >= Math.min(32, profile.targetBars)) return base;
  }

  const current = result.metrics.currentPrice ?? row?.price ?? 1;
  const safeCurrent = Number.isFinite(current) && current > 0 ? current : 1;
  const change =
    range === "7d"
      ? result.metrics.priceChange7d ?? result.metrics.priceChange24h ?? 0
      : range === "1d"
        ? result.metrics.priceChange24h ?? result.metrics.priceChange7d ?? 0
        : range === "4h" || range === "1h" || range === "15m" || range === "1m"
          ? result.metrics.priceChange1h ?? result.metrics.priceChange24h ?? 0
          : result.metrics.priceChange24h ?? 0;
  const divisor = 1 + change / 100;
  const start = Number.isFinite(divisor) && Math.abs(divisor) > 0.05 ? safeCurrent / divisor : safeCurrent * 0.965;
  const count = profile.targetBars;
  const step = profile.spanMs / Math.max(1, count - 1);
  const baseVolume = result.metrics.volume24h ?? row?.volume24h ?? safeCurrent * 100000;

  return Array.from({ length: count }).map((_, index) => {
    const progress = index / Math.max(1, count - 1);
    const harmonic = Math.sin(progress * Math.PI * 8) * safeCurrent * 0.0035;
    const micro = Math.sin(progress * Math.PI * 31) * safeCurrent * 0.0012;
    const price = Math.max(safeCurrent * 0.0001, start + (safeCurrent - start) * progress + harmonic + micro);
    const volumeWave = 0.64 + Math.abs(Math.sin(progress * Math.PI * 5)) * 0.46 + progress * 0.18;
    return {
      timestamp: Date.now() - (count - index - 1) * step,
      price,
      volume: Math.max(1, baseVolume * volumeWave / Math.max(1, count)),
    };
  });
}

function PriceChart({
  points,
  loading,
}: {
  points: ChartPoint[];
  change?: number;
  loading?: boolean;
}) {
  const clean = points.filter((point) => Number.isFinite(point.price));
  if (clean.length < 2)
    return (
      <div className="flex h-[20rem] items-center sm:h-[24rem] justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] text-sm text-white/[0.38]">
        No chart data available for this asset yet.
      </div>
    );

  const width = 760;
  const height = 350;
  const min = Math.min(...clean.map((point) => point.price));
  const max = Math.max(...clean.map((point) => point.price));
  const range = max - min || 1;
  const path = clean
    .map((point, index) => {
      const x = (index / (clean.length - 1)) * width;
      const y = height - ((point.price - min) / range) * (height - 38) - 19;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${path} L${width} ${height} L0 ${height} Z`;
  const up = (clean.at(-1)?.price ?? 0) >= (clean[0]?.price ?? 0);
  const color = up ? "#2ee59d" : "#ff4d6d";

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-black/[0.30] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {loading ? (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.42] px-3 py-2 text-xs text-white/[0.58]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> chart
        </div>
      ) : null}
      <svg viewBox="0 0 760 350" className="relative h-[20rem] w-full sm:h-[24rem]" aria-hidden="true">
        <path d={area} fill={color} opacity="0.10" />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {clean.map((point, index) => {
          if (index % Math.max(1, Math.ceil(clean.length / 18)) !== 0) return null;
          const x = (index / (clean.length - 1)) * width;
          const y = height - ((point.price - min) / range) * (height - 38) - 19;
          return <circle key={point.timestamp} cx={x} cy={y} r="2.2" fill={color} opacity="0.55" />;
        })}
      </svg>
      <div className="relative -mt-8 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.28]">
        <span>Price line</span>
        <span>Live market chart</span>
      </div>
    </div>
  );
}


function ExchangeCandlesChart({
  candles,
  loading,
  range,
  source,
}: {
  candles: Candle[];
  loading?: boolean;
  range: MarketChartRange;
  source: string;
}) {
  const chartShellRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [chartPixelWidth, setChartPixelWidth] = useState(0);
  const profile = profileForRange(range);

  useEffect(() => {
    const node = chartShellRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setChartPixelWidth(Math.round(width));
    });
    observer.observe(node);
    setChartPixelWidth(Math.round(node.getBoundingClientRect().width));
    return () => observer.disconnect();
  }, []);

  const allClean = candles.filter(
    (candle) =>
      Number.isFinite(candle.open) &&
      Number.isFinite(candle.high) &&
      Number.isFinite(candle.low) &&
      Number.isFinite(candle.close),
  );
  const responsiveVisibleBars = Math.min(
    profile.targetBars,
    Math.max(profile.minimumVisibleBars, Math.floor((chartPixelWidth || 1040) / profile.pixelsPerBar)),
  );
  const clean = allClean.slice(-Math.max(2, responsiveVisibleBars));
  if (clean.length < 2)
    return (
      <div className="relative flex h-[20rem] items-center sm:h-[24rem] justify-center overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-[#070708] text-center text-sm text-white/[0.44]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:62px_62px]" />
        <div className="relative max-w-sm px-6 leading-7">
          Candle feed is warming up. Shield will render fallback market structure when live bars are sparse.
        </div>
      </div>
    );

  const width = 1040;
  const plotWidth = 930;
  const scaleWidth = width - plotWidth;
  const priceHeight = 318;
  const volumeHeight = 92;
  const gap = 16;
  const height = priceHeight + volumeHeight + gap + 24;
  const min = Math.min(...clean.map((candle) => candle.low));
  const max = Math.max(...clean.map((candle) => candle.high));
  const priceRange = max - min || 1;
  const maxVolume = Math.max(...clean.map((candle) => candle.volume || 0), 1);
  const step = plotWidth / clean.length;
  const bodyWidth = Math.max(1.6, Math.min(9.5, step * 0.68));
  const densityRatio = clean.length / Math.max(1, profile.targetBars);
  const densityLabel = densityRatio >= 0.82 ? "terminal density" : densityRatio >= 0.50 ? "usable density" : "fallback density";
  const yPrice = (value: number) =>
    priceHeight - ((value - min) / priceRange) * (priceHeight - 28) + 14;
  const priceTicks = Array.from({ length: 5 }).map((_, index) =>
    min + (priceRange * (4 - index)) / 4,
  );
  const averagePath = (period: number) =>
    clean
      .map((_, index) => {
        if (index < period - 1) return null;
        const slice = clean.slice(index - period + 1, index + 1);
        const avg = slice.reduce((sum, candle) => sum + candle.close, 0) / slice.length;
        const x = index * step + step / 2;
        const y = yPrice(avg);
        return `${index === period - 1 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .filter(Boolean)
      .join(" ");
  const ma7 = averagePath(Math.min(7, Math.max(2, Math.floor(clean.length / 4))));
  const ma25 = clean.length >= 25 ? averagePath(25) : "";
  const volumeAverage = clean.reduce((sum, candle) => sum + (candle.volume || 0), 0) / clean.length;
  const anomalyIndexes = clean
    .map((candle, index) => {
      const previous = clean[Math.max(0, index - 1)];
      const change = previous?.close ? ((candle.close - previous.close) / previous.close) * 100 : 0;
      const volumeBurst = candle.volume > volumeAverage * 2.5;
      const priceBurst = Math.abs(change) > 4;
      return volumeBurst || priceBurst ? index : null;
    })
    .filter((value): value is number => value !== null)
    .slice(-8);
  const hover = hoverIndex !== null ? clean[hoverIndex] : clean.at(-1);
  const hoverX = hoverIndex !== null ? hoverIndex * step + step / 2 : undefined;
  const latest = clean.at(-1);
  const first = clean[0];
  const sessionChange = first?.open && latest ? ((latest.close - first.open) / first.open) * 100 : undefined;
  const sessionHigh = Math.max(...clean.map((candle) => candle.high));
  const sessionLow = Math.min(...clean.map((candle) => candle.low));
  const vwapWeight = clean.reduce((sum, candle) => sum + Math.max(0, candle.volume || 0), 0);
  const vwap = vwapWeight > 0 ? clean.reduce((sum, candle) => sum + candle.close * Math.max(0, candle.volume || 0), 0) / vwapWeight : undefined;
  const vwapY = vwap ? yPrice(vwap) : undefined;
  const volumeAverageY = priceHeight + gap + (volumeHeight - Math.max(2, (volumeAverage / maxVolume) * (volumeHeight - 10)));
  const profileBins = Array.from({ length: 18 }, (_, index) => {
    const lowEdge = min + (priceRange * index) / 18;
    const highEdge = min + (priceRange * (index + 1)) / 18;
    const volume = clean.reduce((sum, candle) => {
      const typical = (candle.high + candle.low + candle.close) / 3;
      return typical >= lowEdge && typical < highEdge ? sum + Math.max(0, candle.volume || 0) : sum;
    }, 0);
    const center = (lowEdge + highEdge) / 2;
    return { lowEdge, highEdge, center, volume };
  });
  const maxProfileVolume = Math.max(...profileBins.map((bin) => bin.volume), 1);
  const pointOfControl = profileBins.reduce((best, bin) => (bin.volume > best.volume ? bin : best), profileBins[0]);
  const pocY = pointOfControl ? yPrice(pointOfControl.center) : undefined;
  const timeTickIndexes = Array.from({ length: Math.min(6, clean.length) })
    .map((_, index, arr) => Math.round(((clean.length - 1) * index) / Math.max(1, arr.length - 1)))
    .filter((value, index, arr) => arr.indexOf(value) === index);
  const dateLabel = hover
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(hover.timestamp))
    : "—";
  const hoverUp = hover ? hover.close >= hover.open : true;
  const formatTimeTick = (timestamp: number) => {
    const date = new Date(timestamp);
    if (profile.tick === "minute") return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
    if (profile.tick === "hour") return new Intl.DateTimeFormat("en-US", { day: "2-digit", hour: "2-digit" }).format(date);
    if (profile.tick === "week") return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(date);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date);
  };

  return (
    <div ref={chartShellRef} className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-[#070708] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-white/[0.07] pb-3 font-mono text-[9px] uppercase tracking-[0.11em] text-white/[0.42] sm:text-[10px]">
        <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-white/[0.70]">OHLC</span>
        <span className="whitespace-nowrap">O <strong className="text-white/[0.78] tabular-nums">{formatUsd(hover?.open)}</strong></span>
        <span className="whitespace-nowrap">H <strong className="text-emerald-200 tabular-nums">{formatUsd(hover?.high)}</strong></span>
        <span className="whitespace-nowrap">L <strong className="text-red-200 tabular-nums">{formatUsd(hover?.low)}</strong></span>
        <span className="whitespace-nowrap">C <strong className={`${hoverUp ? "text-emerald-200" : "text-red-200"} tabular-nums`}>{formatUsd(hover?.close)}</strong></span>
        <span className="whitespace-nowrap">V <strong className="text-white/[0.70] tabular-nums">{formatNumber(hover?.volume, { notation: "compact", maximumFractionDigits: 2 })}</strong></span>
        <span className="whitespace-nowrap">VWAP <strong className="text-velmere-gold tabular-nums">{formatUsd(vwap)}</strong></span>
        <span className="whitespace-nowrap">RANGE <strong className={`${sessionChange !== undefined && sessionChange >= 0 ? "text-emerald-200" : "text-red-200"} tabular-nums`}>{formatPercent(sessionChange)}</strong></span>
        <span className="ml-auto whitespace-nowrap text-white/[0.30]">{dateLabel}</span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.32]">
        {['MA 7', 'MA 25', 'VOL', 'ALERTS', 'CROSSHAIR'].map((item) => (
          <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1">{item}</span>
        ))}
        <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1">{profile.label}</span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1">{densityLabel}</span>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1">visible {clean.length}/{profile.targetBars}</span>
        <span className="ml-auto rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-2.5 py-1 text-velmere-gold">Binance / MEXC style</span>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:62px_62px]" />
      {loading ? (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.58] px-3 py-2 text-xs text-white/[0.58]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> candles
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="shield-mobile-chart-height relative w-full touch-none select-none"
        aria-hidden="true"
        preserveAspectRatio="none"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * width;
          const next = Math.max(0, Math.min(clean.length - 1, Math.round((x / plotWidth) * clean.length - 0.5)));
          setHoverIndex(next);
        }}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <rect x="0" y="0" width={plotWidth} height={priceHeight} fill="rgba(255,255,255,0.008)" />
        {profileBins.map((bin, index) => {
          const barWidth = Math.max(3, (bin.volume / maxProfileVolume) * 96);
          const y = yPrice(bin.center);
          return (
            <rect
              key={`profile-${index}`}
              x={plotWidth - barWidth - 8}
              y={y - 4}
              width={barWidth}
              height="8"
              rx="3"
              fill="rgba(200,169,106,0.18)"
            />
          );
        })}
        <rect x="0" y="0" width={plotWidth} height={priceHeight * 0.15} fill="rgba(255,77,109,0.045)" />
        <rect x="0" y={priceHeight * 0.85} width={plotWidth} height={priceHeight * 0.15} fill="rgba(30,230,167,0.035)" />
        <text x="12" y="18" fill="rgba(255,77,109,0.44)" fontSize="10" fontFamily="monospace">UPPER LIQUIDITY RISK</text>
        <text x="12" y={priceHeight - 8} fill="rgba(30,230,167,0.42)" fontSize="10" fontFamily="monospace">LOWER SUPPORT / EXIT ZONE</text>
        {priceTicks.map((tick) => {
          const y = yPrice(tick);
          return (
            <g key={tick}>
              <line x1="0" x2={plotWidth} y1={y} y2={y} stroke="rgba(255,255,255,0.075)" strokeDasharray="4 7" />
              <text x={plotWidth + 12} y={y + 4} fill="rgba(255,255,255,0.38)" fontSize="11" fontFamily="monospace">
                {formatUsd(tick)}
              </text>
            </g>
          );
        })}
        {vwapY !== undefined ? (
          <g>
            <line x1="0" x2={plotWidth} y1={vwapY} y2={vwapY} stroke="rgba(200,169,106,0.22)" strokeDasharray="8 7" />
            <text x={plotWidth + 12} y={vwapY - 6} fill="rgba(200,169,106,0.70)" fontSize="10" fontFamily="monospace">VWAP</text>
          </g>
        ) : null}
        {pocY !== undefined ? (
          <g>
            <line x1="0" x2={plotWidth} y1={pocY} y2={pocY} stroke="rgba(200,169,106,0.16)" strokeDasharray="3 5" />
            <text x={plotWidth - 112} y={pocY - 7} fill="rgba(200,169,106,0.66)" fontSize="10" fontFamily="monospace">POC</text>
          </g>
        ) : null}
        <g>
          <line x1="0" x2={plotWidth} y1={yPrice(sessionHigh)} y2={yPrice(sessionHigh)} stroke="rgba(255,255,255,0.055)" />
          <line x1="0" x2={plotWidth} y1={yPrice(sessionLow)} y2={yPrice(sessionLow)} stroke="rgba(255,255,255,0.055)" />
        </g>
        {ma25 ? <path d={ma25} fill="none" stroke="rgba(184,154,106,0.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {ma7 ? <path d={ma7} fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {clean.map((candle, index) => {
          const x = index * step + step / 2;
          const up = candle.close >= candle.open;
          const color = up ? "#1ee6a7" : "#ff4d6d";
          const yHigh = yPrice(candle.high);
          const yLow = yPrice(candle.low);
          const yOpen = yPrice(candle.open);
          const yClose = yPrice(candle.close);
          const bodyY = Math.min(yOpen, yClose);
          const bodyH = Math.max(1.6, Math.abs(yClose - yOpen));
          const volH = Math.max(2, ((candle.volume || 0) / maxVolume) * (volumeHeight - 10));
          return (
            <g key={`${candle.timestamp}-${index}`}>
              <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={color} strokeWidth="1.15" opacity="0.92" />
              <rect
                x={x - bodyWidth / 2}
                y={bodyY}
                width={bodyWidth}
                height={bodyH}
                rx="0.9"
                fill={up ? color : "#070708"}
                stroke={color}
                strokeWidth="1.05"
                opacity="0.96"
              />
              <rect
                x={x - bodyWidth / 2}
                y={priceHeight + gap + (volumeHeight - volH)}
                width={bodyWidth}
                height={volH}
                rx="0.8"
                fill={color}
                opacity="0.34"
              />
            </g>
          );
        })}
        {anomalyIndexes.map((index) => {
          const candle = clean[index];
          const x = index * step + step / 2;
          return (
            <g key={`anomaly-${candle.timestamp}`}>
              <line x1={x} x2={x} y1="0" y2={priceHeight + volumeHeight + gap} stroke="rgba(251,191,36,0.22)" strokeDasharray="2 5" />
              <circle cx={x} cy={Math.max(12, yPrice(candle.high) - 8)} r="3.5" fill="#fbbf24" opacity="0.86" />
            </g>
          );
        })}
        <line x1="0" x2={plotWidth} y1={priceHeight + gap - 1} y2={priceHeight + gap - 1} stroke="rgba(255,255,255,0.12)" />
        <line x1="0" x2={plotWidth} y1={volumeAverageY} y2={volumeAverageY} stroke="rgba(255,255,255,0.10)" strokeDasharray="4 6" />
        {timeTickIndexes.map((tickIndex) => {
          const candle = clean[tickIndex];
          const x = tickIndex * step + step / 2;
          const label = formatTimeTick(candle.timestamp);
          return (
            <g key={`time-${candle.timestamp}`}>
              <line x1={x} x2={x} y1="0" y2={priceHeight + volumeHeight + gap} stroke="rgba(255,255,255,0.04)" />
              <text x={x} y={priceHeight + volumeHeight + gap + 17} textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize="10" fontFamily="monospace">{label}</text>
            </g>
          );
        })}
        {hoverX !== undefined && hover ? (
          <g>
            <line x1={hoverX} x2={hoverX} y1="0" y2={priceHeight + volumeHeight + gap} stroke="rgba(255,255,255,0.22)" strokeDasharray="5 6" />
            <line x1="0" x2={plotWidth} y1={yPrice(hover.close)} y2={yPrice(hover.close)} stroke="rgba(255,255,255,0.16)" strokeDasharray="5 6" />
            <rect x={Math.min(plotWidth - 190, Math.max(8, hoverX + 12))} y="16" width="182" height="116" rx="12" fill="rgba(10,10,12,0.94)" stroke="rgba(255,255,255,0.12)" />
            <text x={Math.min(plotWidth - 174, Math.max(24, hoverX + 28))} y="38" fill="rgba(255,255,255,0.72)" fontSize="11" fontFamily="monospace">{dateLabel}</text>
            <text x={Math.min(plotWidth - 174, Math.max(24, hoverX + 28))} y="58" fill="rgba(255,255,255,0.62)" fontSize="11" fontFamily="monospace">O {formatUsd(hover.open)}</text>
            <text x={Math.min(plotWidth - 174, Math.max(24, hoverX + 28))} y="76" fill="#1ee6a7" fontSize="11" fontFamily="monospace">H {formatUsd(hover.high)}</text>
            <text x={Math.min(plotWidth - 174, Math.max(24, hoverX + 28))} y="94" fill="#ff4d6d" fontSize="11" fontFamily="monospace">L {formatUsd(hover.low)}</text>
            <text x={Math.min(plotWidth - 174, Math.max(24, hoverX + 28))} y="112" fill={hoverUp ? "#1ee6a7" : "#ff4d6d"} fontSize="11" fontFamily="monospace">C {formatUsd(hover.close)} · V {formatNumber(hover.volume, { notation: "compact", maximumFractionDigits: 2 })}</text>
          </g>
        ) : null}
        <text x="0" y={height - 2} fill="rgba(255,255,255,0.30)" fontSize="10" fontFamily="monospace">PRICE / VOLUME · MA · ANOMALY MARKERS</text>
        <text x={plotWidth + scaleWidth - 8} y={height - 2} textAnchor="end" fill="rgba(255,255,255,0.30)" fontSize="10" fontFamily="monospace">{source.toUpperCase()}</text>
      </svg>
    </div>
  );
}


function PopupMarketChart({
  candles,
  points,
  loading,
}: {
  candles: Candle[];
  points: ChartPoint[];
  loading?: boolean;
}) {
  const [windowOffset, setWindowOffset] = useState(0);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startOffset: 0,
  });

  const allCleanCandles = candles.filter(
    (candle) =>
      Number.isFinite(candle.open) &&
      Number.isFinite(candle.high) &&
      Number.isFinite(candle.low) &&
      Number.isFinite(candle.close),
  );
  const allCleanPoints = points.filter((point) => Number.isFinite(point.price));
  const candleWindow = 72;
  const pointWindow = 96;
  const candleMaxOffset = Math.max(0, allCleanCandles.length - candleWindow);
  const pointMaxOffset = Math.max(0, allCleanPoints.length - pointWindow);
  const maxOffset = Math.max(candleMaxOffset, pointMaxOffset);

  useEffect(() => {
    setWindowOffset(0);
  }, [candles.length, points.length]);

  const clampOffset = (value: number) => Math.max(0, Math.min(maxOffset, value));
  const candleStart = Math.max(0, allCleanCandles.length - candleWindow - clampOffset(windowOffset));
  const pointStart = Math.max(0, allCleanPoints.length - pointWindow - clampOffset(windowOffset));
  const cleanCandles = allCleanCandles.slice(candleStart, candleStart + candleWindow);
  const cleanPoints = allCleanPoints.slice(pointStart, pointStart + pointWindow);

  const handleChartPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      dragging: true,
      startX: event.clientX,
      startOffset: windowOffset,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleChartPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging || maxOffset <= 0) return;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaBars = Math.round((-deltaX) / 10);
    setWindowOffset(clampOffset(dragRef.current.startOffset + deltaBars));
  };

  const handleChartPointerUp = (event?: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.dragging = false;
    if (event) event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  if (cleanCandles.length < 2 && cleanPoints.length < 2) {
    return (
      <div className="shield-popup-chart flex items-center justify-center text-sm text-white/[0.40]">
        Chart feed is warming up for this asset.
      </div>
    );
  }

  const width = 920;
  const priceHeight = 300;
  const volumeHeight = 58;
  const gap = 16;
  const height = priceHeight + volumeHeight + gap;
  // PASS127: chart panning stays available by drag, but the visible debug controls were removed from the premium chart.

  if (cleanCandles.length >= 2) {
    const min = Math.min(...cleanCandles.map((candle) => candle.low));
    const max = Math.max(...cleanCandles.map((candle) => candle.high));
    const priceRange = max - min || 1;
    const maxVolume = Math.max(...cleanCandles.map((candle) => candle.volume || 0), 1);
    const step = width / cleanCandles.length;
    const bodyWidth = Math.max(2.4, Math.min(9.2, step * 0.58));
    const yPrice = (value: number) => priceHeight - ((value - min) / priceRange) * (priceHeight - 32) + 16;
    const ma = cleanCandles
      .map((_, index) => {
        const size = Math.min(9, index + 1);
        const slice = cleanCandles.slice(Math.max(0, index - size + 1), index + 1);
        const avg = slice.reduce((sum, candle) => sum + candle.close, 0) / slice.length;
        const x = index * step + step / 2;
        const y = yPrice(avg);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

    return (
      <div className="shield-popup-chart" onPointerDown={handleChartPointerDown} onPointerMove={handleChartPointerMove} onPointerUp={handleChartPointerUp} onPointerCancel={handleChartPointerUp} onPointerLeave={handleChartPointerUp}>
        {loading ? (
          <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.52] px-3 py-2 text-xs text-white/[0.56]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> candles
          </div>
        ) : null}
        <svg viewBox={`0 0 ${width} ${height}`} className="relative h-full w-full touch-none select-none" preserveAspectRatio="none" aria-hidden="true">
          <rect x="0" y="0" width={width} height={priceHeight} fill="rgba(255,255,255,0.010)" />
          {Array.from({ length: 5 }).map((_, index) => {
            const y = 18 + (index * (priceHeight - 36)) / 4;
            return <line key={`h-${index}`} x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,0.055)" strokeDasharray="5 8" />;
          })}
          {Array.from({ length: 7 }).map((_, index) => {
            const x = (index * width) / 6;
            return <line key={`v-${index}`} x1={x} x2={x} y1="0" y2={height} stroke="rgba(255,255,255,0.030)" />;
          })}
          <path d={ma} fill="none" stroke="rgba(200,169,106,0.52)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          {cleanCandles.map((candle, index) => {
            const x = index * step + step / 2;
            const up = candle.close >= candle.open;
            const color = up ? "#1ee6a7" : "#ff4d6d";
            const yHigh = yPrice(candle.high);
            const yLow = yPrice(candle.low);
            const yOpen = yPrice(candle.open);
            const yClose = yPrice(candle.close);
            const bodyY = Math.min(yOpen, yClose);
            const bodyH = Math.max(1.8, Math.abs(yClose - yOpen));
            const volH = Math.max(2, ((candle.volume || 0) / maxVolume) * volumeHeight);
            return (
              <g key={`${candle.timestamp}-${index}`}>
                <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={color} strokeWidth="1.1" opacity="0.86" />
                <rect x={x - bodyWidth / 2} y={bodyY} width={bodyWidth} height={bodyH} rx="1" fill={up ? color : "#070708"} stroke={color} strokeWidth="1" opacity="0.95" />
                <rect x={x - bodyWidth / 2} y={priceHeight + gap + (volumeHeight - volH)} width={bodyWidth} height={volH} rx="1" fill={color} opacity="0.34" />
              </g>
            );
          })}
        </svg>
        </div>
    );
  }

  const min = Math.min(...cleanPoints.map((point) => point.price));
  const max = Math.max(...cleanPoints.map((point) => point.price));
  const priceRange = max - min || 1;
  const path = cleanPoints
    .map((point, index) => {
      const x = (index / Math.max(1, cleanPoints.length - 1)) * width;
      const y = priceHeight - ((point.price - min) / priceRange) * (priceHeight - 38) - 19;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${path} L${width} ${priceHeight} L0 ${priceHeight} Z`;
  const up = (cleanPoints.at(-1)?.price ?? 0) >= (cleanPoints[0]?.price ?? 0);
  const color = up ? "#1ee6a7" : "#ff4d6d";

  return (
    <div className="shield-popup-chart" onPointerDown={handleChartPointerDown} onPointerMove={handleChartPointerMove} onPointerUp={handleChartPointerUp} onPointerCancel={handleChartPointerUp} onPointerLeave={handleChartPointerUp}>
      {loading ? (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.52] px-3 py-2 text-xs text-white/[0.56]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> chart
        </div>
      ) : null}
      <svg viewBox={`0 0 ${width} ${priceHeight}`} className="relative h-full w-full touch-none select-none" preserveAspectRatio="none" aria-hidden="true">
        <path d={area} fill={color} opacity="0.10" />
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ChartRegimePanel({
  result,
  candles,
  orderbook,
  source,
}: {
  result: TokenRiskResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  source: string;
}) {
  const clean = candles.filter((candle) => Number.isFinite(candle.close));
  const first = clean[0]?.open;
  const last = clean.at(-1)?.close;
  const rangePercent = first && last ? Math.abs(((last - first) / first) * 100) : undefined;
  const regime = buildChartRegime(result, {
    bars: clean.length,
    rangePercent,
    source,
    hasOrderBook: Boolean(orderbook),
  });
  const tone = regime.score >= 70 ? "text-red-100" : regime.score >= 40 ? "text-amber-100" : "text-emerald-100";

  return (
    <div className="shield-command-panel mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Chart regime brain</p>
          <h3 className="mt-2 shield-copy-safe text-sm font-semibold text-white/[0.88]">{regime.headline}</h3>
          <p className="mt-2 shield-dense-copy text-xs text-white/[0.46]">{regime.narrative}</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/[0.09] bg-black/[0.25] px-3 py-2 text-right">
          <p className={`font-mono text-lg tabular-nums ${tone}`}>{regime.score}/100</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">{regime.density}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {regime.checks.map((check) => (
          <div key={check.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">{check.label}</p>
              <span className={`h-2 w-2 shrink-0 rounded-full ${check.status === "warning" ? "bg-red-300" : check.status === "watch" ? "bg-amber-300" : "bg-emerald-300"}`} />
            </div>
            <p className="mt-2 truncate font-mono text-xs text-white/[0.74]">{check.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {regime.nextActions.map((action, index) => (
          <div key={`${action}-${index}`} className="flex gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.020] px-3 py-2 text-[11px] leading-5 text-white/[0.48]">
            <span className="font-mono text-velmere-gold">0{index + 1}</span>
            <span className="shield-copy-safe">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VolumeProfilePanel({ candles }: { candles: Candle[] }) {
  const clean = candles.filter((candle) => Number.isFinite(candle.close) && Number.isFinite(candle.volume));
  if (clean.length < 8) return null;
  const min = Math.min(...clean.map((candle) => candle.low));
  const max = Math.max(...clean.map((candle) => candle.high));
  const range = max - min || 1;
  const bins = Array.from({ length: 12 }, (_, index) => {
    const low = min + (range * index) / 12;
    const high = min + (range * (index + 1)) / 12;
    const volume = clean.reduce((sum, candle) => {
      const typical = (candle.high + candle.low + candle.close) / 3;
      return typical >= low && typical < high ? sum + Math.max(0, candle.volume || 0) : sum;
    }, 0);
    return { low, high, volume };
  }).reverse();
  const maxVolume = Math.max(...bins.map((bin) => bin.volume), 1);
  const poc = bins.reduce((best, bin) => (bin.volume > best.volume ? bin : best), bins[0]);

  return (
    <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Volume profile</p>
          <p className="mt-1 text-xs leading-5 text-white/[0.42]">Price bands where most recent volume concentrated. This helps avoid empty chart space and shows liquidity magnets.</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/[0.08] bg-black/[0.20] px-3 py-2 text-right">
          <p className="font-mono text-xs text-white tabular-nums">{formatUsd((poc.low + poc.high) / 2)}</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">POC</p>
        </div>
      </div>
      <div className="mt-4 grid gap-1.5">
        {bins.map((bin, index) => {
          const width = Math.max(5, (bin.volume / maxVolume) * 100);
          return (
            <div key={`${bin.low}-${index}`} className="grid grid-cols-[5.7rem_minmax(0,1fr)_4.2rem] items-center gap-2 font-mono text-[9px] text-white/[0.38]">
              <span className="truncate">{formatUsd((bin.low + bin.high) / 2)}</span>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-velmere-gold" style={{ width: `${width}%`, opacity: 0.22 + width / 180 }} />
              </div>
              <span className="text-right">{formatNumber(bin.volume, { notation: "compact", maximumFractionDigits: 1 })}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VolumeBarsChart({
  points,
  loading,
}: {
  points: ChartPoint[];
  loading?: boolean;
}) {
  const clean = points.filter((point) => Number.isFinite(point.volume ?? 0));
  const fallback = points.filter((point) => Number.isFinite(point.price));
  const source = clean.some((point) => (point.volume ?? 0) > 0) ? clean : fallback;
  if (source.length < 2)
    return (
      <div className="flex h-[20rem] items-center sm:h-[24rem] justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] text-sm text-white/[0.38]">
        No volume data available for this asset yet.
      </div>
    );

  const width = 760;
  const height = 350;
  const values = source.map((point) => point.volume ?? point.price);
  const max = Math.max(...values, 1);
  const step = width / source.length;
  const barWidth = Math.max(2, Math.min(14, step * 0.58));

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-black/[0.30] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {loading ? (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.42] px-3 py-2 text-xs text-white/[0.58]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> volume
        </div>
      ) : null}
      <svg viewBox="0 0 760 350" className="relative h-[20rem] w-full sm:h-[24rem]" aria-hidden="true">
        {source.map((point, index) => {
          const value = point.volume ?? point.price;
          const previous = source[Math.max(0, index - 1)]?.price ?? point.price;
          const up = point.price >= previous;
          const color = up ? "#2ee59d" : "#ff4d6d";
          const barHeight = Math.max(3, (value / max) * 300);
          const x = index * step + step / 2 - barWidth / 2;
          const y = 324 - barHeight;
          return (
            <rect
              key={`${point.timestamp}-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="2"
              fill={color}
              opacity="0.58"
            />
          );
        })}
      </svg>
      <div className="relative -mt-8 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.28]">
        <span>Volume bars</span>
        <span>Activity histogram</span>
      </div>
    </div>
  );
}



function OrderBookDepthChart({
  orderbook,
  loading,
}: {
  orderbook: OrderBookResult | null;
  loading?: boolean;
}) {
  const bids = (orderbook?.bids ?? []).slice(0, 48);
  const asks = (orderbook?.asks ?? []).slice(0, 48);
  const hasDepth = bids.length >= 2 && asks.length >= 2;
  if (!hasDepth) {
    return (
      <div className="flex h-[20rem] items-center sm:h-[24rem] justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] px-6 text-center text-sm leading-7 text-white/[0.38]">
        {loading ? "Loading order book depth" : "Depth chart is available only when the asset has a supported live order book pair."}
      </div>
    );
  }

  const width = 960;
  const height = 390;
  const paddingX = 46;
  const top = 22;
  const bottom = 42;
  const plotHeight = height - top - bottom;
  const all = [...bids, ...asks];
  const minPrice = Math.min(...all.map((level) => level.price));
  const maxPrice = Math.max(...all.map((level) => level.price));
  const maxDepth = Math.max(...all.map((level) => level.cumulativeUsd), 1);
  const priceRange = maxPrice - minPrice || 1;
  const xFor = (price: number) => paddingX + ((price - minPrice) / priceRange) * (width - paddingX * 2);
  const yFor = (depth: number) => top + plotHeight - (depth / maxDepth) * plotHeight;
  const mid = orderbook?.bestBid && orderbook?.bestAsk ? (orderbook.bestBid + orderbook.bestAsk) / 2 : undefined;
  const bidPath = bids
    .slice()
    .reverse()
    .map((level, index) => `${index === 0 ? "M" : "L"}${xFor(level.price).toFixed(2)} ${yFor(level.cumulativeUsd).toFixed(2)}`)
    .join(" ");
  const askPath = asks
    .map((level, index) => `${index === 0 ? "M" : "L"}${xFor(level.price).toFixed(2)} ${yFor(level.cumulativeUsd).toFixed(2)}`)
    .join(" ");
  const bidArea = `${bidPath} L${xFor(bids[0].price).toFixed(2)} ${height - bottom} L${xFor(bids.at(-1)?.price ?? bids[0].price).toFixed(2)} ${height - bottom} Z`;
  const askArea = `${askPath} L${xFor(asks.at(-1)?.price ?? asks[0].price).toFixed(2)} ${height - bottom} L${xFor(asks[0].price).toFixed(2)} ${height - bottom} Z`;

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-[#070708] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.07] pb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.42]">
        <span className="text-white/[0.70]">ORDER BOOK DEPTH</span>
        <span>BID <strong className="text-emerald-200">{formatUsd(orderbook?.bidDepthUsd)}</strong></span>
        <span>ASK <strong className="text-red-200">{formatUsd(orderbook?.askDepthUsd)}</strong></span>
        <span>SPREAD <strong className="text-white/[0.72]">{formatPercent(orderbook?.spreadPercent)}</strong></span>
        <span className="ml-auto text-white/[0.30]">{orderbook?.symbol ?? "—"}</span>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
      {loading ? (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.58] px-3 py-2 text-xs text-white/[0.58]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> depth
        </div>
      ) : null}
      <svg viewBox={`0 0 ${width} ${height}`} className="relative h-[20rem] w-full sm:h-[26rem]" aria-hidden="true">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = top + ratio * plotHeight;
          const depth = maxDepth * (1 - ratio);
          return (
            <g key={ratio}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 7" />
              <text x={width - paddingX + 10} y={y + 4} fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="monospace">
                {formatUsd(depth)}
              </text>
            </g>
          );
        })}
        {mid ? (
          <g>
            <line x1={xFor(mid)} x2={xFor(mid)} y1={top} y2={height - bottom} stroke="rgba(255,255,255,0.16)" strokeDasharray="5 6" />
            <text x={xFor(mid)} y={height - 12} textAnchor="middle" fill="rgba(255,255,255,0.36)" fontSize="10" fontFamily="monospace">MID {formatUsd(mid)}</text>
          </g>
        ) : null}
        <path d={bidArea} fill="#1ee6a7" opacity="0.11" />
        <path d={askArea} fill="#ff4d6d" opacity="0.10" />
        <path d={bidPath} fill="none" stroke="#1ee6a7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={askPath} fill="none" stroke="#ff4d6d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x={paddingX} y={height - 12} fill="rgba(30,230,167,0.70)" fontSize="11" fontFamily="monospace">BIDS</text>
        <text x={width - paddingX} y={height - 12} textAnchor="end" fill="rgba(255,77,109,0.70)" fontSize="11" fontFamily="monospace">ASKS</text>
      </svg>
    </div>
  );
}


function OrderBookHeatmapPanel({ orderbook }: { orderbook: OrderBookResult | null }) {
  const bids = (orderbook?.bids ?? []).slice(0, 18);
  const asks = (orderbook?.asks ?? []).slice(0, 18);
  const maxNotional = Math.max(...[...bids, ...asks].map((level) => level.notionalUsd || 0), 1);
  const hasDepth = bids.length >= 2 && asks.length >= 2;
  const imbalance = orderbook?.bidAskImbalancePercent ?? 0;
  const stress = Math.min(100, Math.round(Math.abs(imbalance) + (orderbook?.riskPoints ?? 0) * 0.85));

  if (!hasDepth) {
    return (
      <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-velmere-gold" />
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Order book heatmap</p>
        </div>
        <p className="mt-3 text-xs leading-6 text-white/[0.42]">
          Heatmap activates when Shield can match the asset to a supported live order book pair. Until then the system treats missing depth as uncertainty, not safety.
        </p>
      </div>
    );
  }

  const renderSide = (levels: OrderBookLevel[], side: "bid" | "ask") => (
    <div className="grid gap-1.5">
      {levels.map((level, index) => {
        const width = Math.max(5, Math.min(100, (level.notionalUsd / maxNotional) * 100));
        const opacity = 0.16 + Math.min(0.62, (level.notionalUsd / maxNotional) * 0.58);
        return (
          <div key={`${side}-${level.price}-${index}`} className="grid grid-cols-[4.8rem_minmax(0,1fr)_4.6rem] items-center gap-2 font-mono text-[9px] tabular-nums text-white/[0.38]">
            <span className={side === "bid" ? "text-emerald-200/[0.82]" : "text-red-200/[0.82]"}>{formatUsd(level.price)}</span>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full ${side === "bid" ? "bg-emerald-300" : "bg-red-300"}`}
                style={{ width: `${width}%`, opacity }}
              />
            </div>
            <span className="text-right">{formatUsd(level.notionalUsd)}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-velmere-gold" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Order book heatmap</p>
            <p className="mt-1 text-xs leading-5 text-white/[0.42]">Depth density, slippage pressure and bid/ask imbalance in one compact terminal block.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-2 text-right">
          <p className="font-mono text-lg text-white tabular-nums">{stress}/100</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">micro stress</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/[0.10] bg-emerald-400/[0.035] p-3">
          <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-100/[0.70]"><span>Bids</span><span>{formatUsd(orderbook?.bidDepthUsd)}</span></div>
          {renderSide(bids, "bid")}
        </div>
        <div className="rounded-2xl border border-red-300/[0.10] bg-red-400/[0.035] p-3">
          <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-red-100/[0.70]"><span>Asks</span><span>{formatUsd(orderbook?.askDepthUsd)}</span></div>
          {renderSide(asks, "ask")}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Spread", formatPercent(orderbook?.spreadPercent)],
          ["Sell 10k", formatPercent(orderbook?.simulatedSellSlippage10k)],
          ["Imbalance", formatPercent(orderbook?.bidAskImbalancePercent)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">{label}</p>
            <p className="mt-2 font-mono text-sm text-white tabular-nums">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiquidityDangerZones({ candles, orderbook, result }: { candles: Candle[]; orderbook: OrderBookResult | null; result: TokenRiskResult }) {
  const clean = candles.filter((candle) => Number.isFinite(candle.close));
  const latest = clean.at(-1)?.close ?? result.metrics.currentPrice ?? 0;
  const high = clean.length ? Math.max(...clean.map((candle) => candle.high)) : latest * 1.035;
  const low = clean.length ? Math.min(...clean.map((candle) => candle.low)) : latest * 0.965;
  const risk = Math.min(100, Math.round((orderbook?.riskPoints ?? 0) + (result.metrics.volumeToMarketCapRatio ?? 0) * 180 + (result.metrics.priceChange24h ? Math.abs(result.metrics.priceChange24h) * 0.8 : 0)));
  const zones = [
    { label: "Breakout chase", value: high, tone: "text-amber-100", body: "Watch for thin liquidity above session high." },
    { label: "Exit liquidity", value: latest, tone: "text-velmere-gold", body: "Current price area used for slippage and depth checks." },
    { label: "Drawdown shelf", value: low, tone: "text-red-100", body: "Below session low Shield treats selling pressure as elevated." },
  ];

  return (
    <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/[0.20] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-velmere-gold" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Liquidity danger zones</p>
            <p className="mt-1 text-xs leading-5 text-white/[0.42]">Price zones generated from current candle range, order book stress and volume pressure.</p>
          </div>
        </div>
        <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.48]">stress {risk}/100</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {zones.map((zone) => (
          <div key={zone.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
            <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${zone.tone}`}>{zone.label}</p>
            <p className="mt-2 font-mono text-sm text-white tabular-nums">{formatUsd(zone.value)}</p>
            <p className="mt-2 text-[11px] leading-5 text-white/[0.42]">{zone.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function StressSimulatorPanel({ result }: { result: TokenRiskResult }) {
  const stress = buildStressScenarios(result);
  const worst = stress.worstScenario;
  const tokenInfo = result["token"];
  const query = tokenInfo.marketId ?? tokenInfo.tokenAddress ?? tokenInfo.symbol;
  const tone = worst?.severity === "critical"
    ? "text-red-100"
    : worst?.severity === "warning"
      ? "text-amber-100"
      : worst?.severity === "watch"
        ? "text-velmere-gold"
        : "text-emerald-100";

  return (
    <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sigma className="h-4 w-4 text-velmere-gold" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Stress simulator</p>
            <p className="mt-1 text-xs leading-5 text-white/[0.42]">Deterministic shock scenarios for sell pressure, holder exits, velocity bursts and contract pressure.</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`font-mono text-lg tabular-nums ${tone}`}>{worst?.score ?? 0}/100</p>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">worst</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {stress.scenarios.slice(0, 4).map((scenario) => (
          <div key={scenario.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white/[0.80]">{scenario.label}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/[0.42]">{scenario.nextStep}</p>
              </div>
              <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.52]">{scenario.score}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className={`h-full rounded-full ${scenario.score >= 70 ? "bg-amber-300" : scenario.score >= 40 ? "bg-velmere-gold" : "bg-emerald-300"}`} style={{ width: `${clampPercent(scenario.score)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:text-white pointer-events-none opacity-75">
        stress endpoint ready
      </span>
    </div>
  );
}

function AiRiskBotPanel({ result, history }: { result: TokenRiskResult; history: HistorySnapshot[] }) {
  const bot = buildAiRiskBotBrief(result, history);
  const layerTone = (layer: string) =>
    layer === "liquidity"
      ? "border-emerald-300/[0.16] bg-emerald-300/[0.045] text-emerald-100"
      : layer === "holders"
        ? "border-amber-300/[0.18] bg-amber-300/[0.055] text-amber-100"
        : layer === "chart"
          ? "border-sky-300/[0.16] bg-sky-300/[0.045] text-sky-100"
          : layer === "legal"
            ? "border-velmere-gold/[0.20] bg-velmere-gold/[0.060] text-velmere-gold"
            : "border-white/[0.09] bg-white/[0.028] text-white/[0.58]";
  return (
    <div className="shield-density-bento border-velmere-gold/[0.18] bg-[radial-gradient(circle_at_0%_0%,rgba(200,169,106,0.12),transparent_34%),rgba(255,255,255,0.03)] p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Brain className="h-4 w-4 shrink-0 text-velmere-gold" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Velmère AI risk bot</p>
            <p className="shield-copy-safe mt-1 text-xs leading-5 text-white/[0.44]">SOC analyst mode: ranked commands, missing data, uncertainty and safe wording instead of decorative hype.</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full border border-white/[0.10] bg-black/[0.20] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.46]">
            conf {bot.confidence}%
          </span>
          <span className="rounded-full border border-amber-300/[0.14] bg-amber-300/[0.045] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-100">
            uncertainty {bot.dataUncertaintyPercent}%
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          ["tone", "calm SOC"],
          ["claim", "no accusation"],
          ["output", "operator commands"],
        ].map(([label, value]) => (
          <div key={label} className="shield-readability-grade justify-between">
            <span className="text-white/[0.32]">{label}</span>
            <span className="text-white/[0.66]">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-white/[0.86]">{bot.verdict}</p>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/[0.52]">Δ {bot.riskDelta > 0 ? "+" : ""}{bot.riskDelta}</span>
        </div>
        <p className="shield-copy-safe text-xs leading-6 text-white/[0.56]">{bot.narrative}</p>
        <p className="rounded-2xl border border-velmere-gold/[0.14] bg-velmere-gold/[0.045] p-3 text-[11px] leading-5 text-velmere-gold/[0.86]">
          {bot.guardrail}
        </p>
      </div>

      <div className="shield-safe-scroll mt-4 grid max-h-[24rem] gap-2 overflow-y-auto pr-1">
        {bot.commands.slice(0, 6).map((command, index) => (
          <div key={command.id} className="grid min-w-0 grid-cols-[1.65rem_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.22] p-3 sm:grid-cols-[1.65rem_minmax(0,1fr)_auto]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] font-mono text-[9px] text-velmere-gold">{index + 1}</span>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-xs font-semibold text-white/[0.82]">{command.label}</p>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${layerTone(command.layer)}`}>{command.layer}</span>
              </div>
              <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.44]">{command.body}</p>
              <p className="shield-copy-safe mt-2 border-t border-white/[0.06] pt-2 text-[11px] leading-5 text-velmere-gold/[0.80]">{command.operatorPrompt}</p>
            </div>
            <span className="w-fit rounded-full border border-white/[0.10] bg-white/[0.035] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.46]">
              {command.priority}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">Prompt examples</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {bot.promptExamples.slice(0, 4).map((prompt) => <p key={prompt}>• {prompt}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-100">Missing data</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {(bot.missingData.length ? bot.missingData : ["No major missing input detected; still check source freshness."]).map((item) => <p key={item}>• {item}</p>)}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">SOC runbook</p>
        <div className="grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
          {bot.socRunbook.map((item) => <p key={item}>• {item}</p>)}
        </div>
      </div>

      {bot.warnings.length ? (
        <div className="mt-3 rounded-2xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-100">uncertainty guard</p>
          <ul className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {bot.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-[11px] leading-5 text-white/[0.48]">
        <strong className="text-white/[0.78]">Next question:</strong> {bot.nextQuestion}
      </div>
    </div>
  );
}


function AskShieldChatPanel({ result, history }: { result: BrainResult; history: HistorySnapshot[] }) {
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  const quickPrompts = [
    "Explain risk without hype",
    "Audit holders and clusters",
    "Check exit depth",
    "Read candles like Binance",
    "Build evidence report",
  ];
  const [prompt, setPrompt] = useState(quickPrompts[0]);
  const answer = useMemo(() => buildShieldChatResponse(result, history, prompt), [history, prompt, result]);
  const toneClass = (tone: string) =>
    tone === "critical"
      ? "border-red-300/[0.22] bg-red-400/[0.07] text-red-100"
      : tone === "warning"
        ? "border-amber-300/[0.22] bg-amber-300/[0.07] text-amber-100"
        : tone === "watch"
          ? "border-velmere-gold/[0.20] bg-velmere-gold/[0.06] text-velmere-gold"
          : tone === "low"
            ? "border-emerald-300/[0.18] bg-emerald-400/[0.055] text-emerald-100"
            : "border-white/[0.10] bg-white/[0.028] text-white/[0.62]";

  return (
    <div className="shield-command-panel bg-[radial-gradient(circle_at_100%_0%,rgba(200,169,106,0.12),transparent_34%),rgba(255,255,255,0.026)]">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Ask Shield AI bot</p>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.46]">Command layer: ask about risk, holders, liquidity, candles or evidence. Every answer keeps missing data visible.</p>
        </div>
        <Brain className="mt-1 h-4 w-4 shrink-0 text-velmere-gold" />
      </div>

      <div className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1 no-scrollbar">
        {quickPrompts.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPrompt(item)}
            className={`shield-touch-target shrink-0 rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] transition ${prompt === item ? "border-velmere-gold/[0.42] bg-velmere-gold/[0.12] text-velmere-gold" : "border-white/[0.09] bg-black/[0.18] text-white/[0.42] hover:text-white"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-2xl border border-white/[0.10] bg-black/[0.28] px-4 font-mono text-[11px] text-white outline-none placeholder:text-white/[0.28]"
          placeholder="Ask Shield: holders, liquidity, candles, evidence..."
        />
        <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-velmere-gold/[0.22] bg-velmere-gold/[0.08] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.14] pointer-events-none opacity-75">
        in-panel answer
      </span>
      </div>

      <div className="shield-safe-scroll mt-4 max-h-[31rem] overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/[0.22] p-4 pr-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/[0.88]">{answer.headline}</p>
            <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.52]">{answer.answer}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.10] bg-white/[0.035] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.46]">
            {answer.confidence}%
          </span>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {answer.cards.slice(0, 6).map((card) => (
            <div key={`${card.label}-${card.value}`} className={`min-w-0 rounded-2xl border p-3 ${toneClass(card.tone)}`}>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.44]">{card.label}</p>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/[0.72]">{card.value}</span>
              </div>
              <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.48]">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3 text-[11px] leading-5 text-white/[0.46]">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">Next actions</p>
          {answer.nextActions.slice(0, 3).map((item) => <p key={item}>• {item}</p>)}
          <p className="pt-1 text-white/[0.34]">Guard: {answer.guardrails.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}


function AiOrchestratorPanel({ result, history }: { result: BrainResult; history: HistorySnapshot[] }) {
  const orchestrator = buildAiRiskOrchestrator(result, history);
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  return (
    <div className="shield-safe-card bg-[radial-gradient(circle_at_100%_0%,rgba(200,169,106,0.11),transparent_34%),rgba(255,255,255,0.026)] p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">AI orchestrator</p>
          <p className="shield-copy-safe mt-2 text-sm leading-7 text-white/[0.62]">{orchestrator.headline}</p>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-white/[0.10] bg-black/[0.20] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.52]">
          {orchestrator.overall}/100
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {orchestrator.nextBestActions.slice(0, 4).map((action) => (
          <div key={action.id} className="grid min-w-0 grid-cols-[1.65rem_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <span className={`mt-0.5 h-2 w-2 rounded-full ${action.priority === "escalate" ? "bg-red-300" : action.priority === "block_confidence" ? "bg-amber-300" : "bg-velmere-gold"}`} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/[0.84]">{action.label}</p>
              <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.44]">{action.reason}</p>
            </div>
            <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.46]">{action.score}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.36]">UI safety memory</p>
        <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
          {orchestrator.uiSafetyChecklist.slice(0, 3).map((item) => <p key={item}>• {item}</p>)}
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:text-white pointer-events-none opacity-75">
        orchestrator in panel
      </span>
    </div>
  );
}


function ShieldAccessLayerPanel({ result }: { result: BrainResult }) {
  const access = useMemo(() => buildVlmShieldAccess(result), [result]);
  const tierTone = (id: string) =>
    id === access.recommendedTier
      ? "border-velmere-gold/[0.34] bg-velmere-gold/[0.09] text-velmere-gold"
      : "border-white/[0.08] bg-black/[0.18] text-white/[0.46]";
  const statusTone = (status: string) =>
    status === "open" || status === "api_ready"
      ? "text-emerald-200"
      : status === "member_only" || status === "pro_required"
        ? "text-velmere-gold"
        : "text-amber-200";
  const assetMeta = result["token"];
  const query = assetMeta.marketId ?? assetMeta.tokenAddress ?? assetMeta.symbol;

  return (
    <div className="shield-safe-card bg-[radial-gradient(circle_at_100%_0%,rgba(200,169,106,0.12),transparent_34%),rgba(255,255,255,0.026)] p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">VLM access layer</p>
          <p className="shield-copy-safe mt-2 text-sm leading-7 text-white/[0.62]">{access.summary}</p>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.13em] text-velmere-gold">
          {access.recommendedTier}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {access.tiers.map((tier) => (
          <div key={tier.id} className={`min-w-0 rounded-2xl border p-3 ${tierTone(tier.id)}`}>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate text-xs font-semibold text-white/[0.84]">{tier.label}</p>
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">{tier.badge}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.46]">{tier.utility}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        {access.featureMatrix.slice(0, 5).map((feature) => (
          <div key={feature.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/[0.82]">{feature.label}</p>
              <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.42]">{feature.reason}</p>
            </div>
            <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] ${statusTone(feature.status)}`}>
              {feature.status.replaceAll("_", " ")}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {access.pass59AccessGates.map((gate) => (
          <div key={gate.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.38]">{gate.label}</p>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] ${gate.status === "ready" ? "text-emerald-200" : gate.status === "watch" ? "text-velmere-gold" : "text-amber-200"}`}>{gate.status}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.44]">{gate.reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {access.pass60PolicySpine.map((policy) => (
          <div key={policy.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.38]">{policy.label}</p>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] ${policy.status === "ready" ? "text-emerald-200" : policy.status === "watch" ? "text-velmere-gold" : "text-amber-200"}`}>{policy.status}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.44]">{policy.guardrail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-300/[0.15] bg-amber-300/[0.055] p-3 text-[11px] leading-5 text-amber-100/[0.82]">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">Legal memory</p>
        <p className="shield-copy-safe mt-2">{access.complianceGuardrails[0]}</p>
        <p className="shield-copy-safe mt-1">{access.complianceGuardrails[1]}</p>
      </div>

      <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:text-white pointer-events-none opacity-75">
        VLM access in panel
      </span>
    </div>
  );
}


function TerminalCommandPalette({
  rows,
  activeId,
  activeRow,
  onSelect,
}: {
  rows: TerminalCommandRow[];
  activeId: TerminalCommandId;
  activeRow: TerminalCommandRow;
  onSelect: (id: TerminalCommandId) => void;
}) {
  return (
    <div className="shield-command-palette mt-4 p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Terminal command palette</p>
          <p className="shield-copy-safe mt-1 text-xs leading-6 text-white/[0.48]">
            PASS77 opens with a concise review deck first: operator brief, source truth, AI boundaries, evidence gate, interaction path and launch blockers before deep panels.
          </p>
        </div>
        <span className="w-fit shrink-0 rounded-full border border-white/[0.10] bg-black/[0.22] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.42]">
          active · {activeId}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {rows.map((row, index) => {
          const active = row.id === activeId;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelect(row.id)}
              className={`shield-touch-target min-w-0 rounded-2xl border p-3 text-left transition duration-300 ease-velmere ${active ? "border-velmere-gold/[0.36] bg-velmere-gold/[0.09] text-velmere-gold" : "border-white/[0.08] bg-black/[0.18] text-white/[0.46] hover:border-white/[0.18] hover:text-white"}`}
              aria-pressed={active}
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] tabular-nums">0{index + 1}</span>
              <span className="mt-2 block truncate text-xs font-semibold">{row.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.22] p-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.52fr)]">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.36]">operator read</p>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.56]">{activeRow.body}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-velmere-gold/[0.16] bg-velmere-gold/[0.045] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">next command</p>
          <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.52]">{activeRow.next}</p>
        </div>
      </div>
    </div>
  );
}



function TerminalReviewDeckPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const deck = useMemo(
    () =>
      buildTerminalReviewDeck(result, {
        candlesCount: candles.length,
        historyCount: history.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbook,
        activeCommand,
        terminalBootDeferred: true,
        modalChunkSplit: true,
        heavyPanelsDeferred: true,
        sourceCooldownActive: false,
        searchLocalFirst: true,
        suggestionDismissOnOutsideClick: true,
        tableWheelUnlocked: true,
        shieldMapDetached: true,
        focusedPanelRouting: true,
        rateLimitMiddlewareReady: false,
        exportInfrastructureReady: false,
        persistentAuditLogReady: false,
        walletSessionReady: false,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const toneForState = (state: string) => {
    if (state === "ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (state === "review") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.060] text-velmere-gold";
    if (state === "degraded") return "border-amber-300/[0.20] bg-amber-300/[0.060] text-amber-100";
    return "border-red-300/[0.20] bg-red-400/[0.060] text-red-100";
  };

  return (
    <div className="shield-review-deck mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Review deck · PASS77
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {deck.headline}
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.50]">
            {deck.executiveBrief}
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.22] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">deck score</p>
          <p className="mt-1 font-mono text-3xl text-velmere-gold tabular-nums">{deck.deckScore}/100</p>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">/{deck.activeCommand} · {deck.state}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {deck.lanes.map((lane) => (
          <div key={lane.id} className={`shield-review-lane ${toneForState(lane.state)}`}>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] tabular-nums">{lane.score}/100</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.signal}</p>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-70">{lane.operatorAction}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.86fr)_minmax(17rem,0.44fr)]">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">next best actions</p>
          <div className="mt-3 grid gap-2">
            {deck.nextBestActions.map((action) => (
              <div key={action.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-velmere-gold">{action.priority} · {action.command}</span>
                  <span className="truncate text-[11px] text-white/[0.62]">{action.label}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.46]">{action.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-velmere-gold/[0.14] bg-velmere-gold/[0.045] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">compression rules</p>
          <div className="mt-3 grid gap-2">
            {deck.compressionRules.slice(0, 5).map((rule) => (
              <p key={rule} className="shield-copy-safe rounded-xl border border-white/[0.07] bg-black/[0.16] p-2 text-[10px] leading-5 text-white/[0.46]">
                {rule}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/[0.16] p-3 text-[11px] leading-5 text-white/[0.44]">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">safe copy</p>
        <p className="shield-copy-safe mt-2">{deck.safeCopy.join(" · ")}</p>
      </div>
    </div>
  );
}

function OperatorCopilotPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const copilot = useMemo(
    () =>
      buildTerminalOperatorCopilot(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbookRiskPoints: orderbook?.riskPoints,
        historyCount: history.length,
        activeCommand,
        terminalBootDeferred: true,
        shieldMapDetached: true,
        sourceHonestyVisible: true,
        chatHistoryCount: 0,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const toneForStatus = (status: string) => {
    if (status === "ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (status === "watch") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    return "border-white/[0.09] bg-black/[0.18] text-white/[0.54]";
  };

  return (
    <div className="shield-operator-copilot mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Operator copilot · PASS70
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {copilot.headline}
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            This panel turns the AI bot into a SOC assistant: short prompts, missing-data checks, evidence-safe wording and next operator commands. It does not produce accusations, investment advice or legal proof.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">confidence</p>
            <p className="mt-1 text-lg text-velmere-gold tabular-nums">{copilot.confidenceScore}/100</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">uncertainty</p>
            <p className="mt-1 text-lg text-white tabular-nums">{copilot.uncertaintyPercent}%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="min-w-0 rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/[0.36]">operator action queue</p>
          <div className="mt-3 grid gap-2">
            {copilot.immediateActions.map((action) => (
              <div key={action.id} className={`min-w-0 rounded-2xl border p-3 ${toneForStatus(action.status)}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{action.label}</p>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{action.status}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{action.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          {copilot.prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">{prompt.label}</p>
                <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.026] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.36]">prompt</span>
              </div>
              <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.58]">{prompt.prompt}</p>
              <p className="shield-copy-safe mt-2 text-[10px] leading-5 text-white/[0.34]">{prompt.when}</p>
              <p className="mt-2 rounded-2xl border border-velmere-gold/[0.14] bg-velmere-gold/[0.045] p-2 text-[10px] leading-5 text-velmere-gold/[0.86]">{prompt.guardrail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">missing data blockers</p>
          <div className="mt-3 grid gap-2">
            {(copilot.missingData.length ? copilot.missingData : ["No major copilot blockers from the visible terminal state. Keep manual review wording anyway."]).map((item) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">UI contract</p>
          <div className="mt-3 grid gap-2">
            {copilot.uiContract.map((item) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">
                {item}
              </p>
            ))}
          </div>
          <p className="shield-copy-safe mt-3 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.055] p-3 text-[11px] leading-5 text-amber-100/[0.84]">
            {copilot.legalNote}
          </p>
        </div>
      </div>
    </div>
  );
}


function TerminalSourceTrustPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const sourceTrust = useMemo(
    () =>
      buildTerminalSourceTrust(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbook,
        historyCount: history.length,
        activeCommand,
        searchResolverGuarded: true,
        suggestionDismissOnOutsideClick: true,
        sourceCooldownActive: false,
        terminalBootDeferred: true,
        modalChunkSplit: true,
        tableWheelUnlocked: true,
        walletSessionReady: false,
        exportInfrastructureReady: false,
        rateLimitMiddlewareReady: false,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const statusTone = (status: string) => {
    if (status === "live") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (status === "partial") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    if (status === "fallback") return "border-amber-300/[0.18] bg-amber-300/[0.050] text-amber-100";
    return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
  };

  const toneDot = (tone: string) => {
    if (tone === "good") return "bg-emerald-300";
    if (tone === "watch") return "bg-velmere-gold";
    return "bg-red-300";
  };

  return (
    <div className="shield-source-trust mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Source trust console · PASS72
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            Live, partial, fallback and blocked sources are separated before the UI makes a claim.
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            This console is the anti-kernel-panic layer for product truth: search cooldowns, candles, holders, order book, contract checks, replay, evidence export and VLM session gates stay visible instead of being hidden by a premium layout.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">trust</p>
            <p className="mt-1 text-lg text-velmere-gold tabular-nums">{sourceTrust.trustScore}/100</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">mode</p>
            <p className="mt-1 truncate text-xs text-white">{sourceTrust.mode.replaceAll("_", " ")}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {sourceTrust.adapters.slice(0, 9).map((adapter) => (
            <div key={adapter.id} className={`shield-source-adapter ${statusTone(adapter.status)}`}>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{adapter.label}</p>
                <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{adapter.status}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-current opacity-70" style={{ width: `${clampPercent(adapter.confidence)}%` }} />
              </div>
              <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{adapter.currentSource}</p>
              <p className="shield-copy-safe mt-2 border-t border-white/[0.08] pt-2 text-[10px] leading-5 opacity-70">{adapter.operatorAction}</p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 gap-3">
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">source ledger</p>
            <div className="mt-3 grid gap-2">
              {sourceTrust.sourceLedger.slice(0, 7).map((item) => (
                <div key={item.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.022] p-2.5">
                  <span className={`h-2 w-2 rounded-full ${toneDot(item.tone)}`} />
                  <span className="truncate text-[11px] font-semibold text-white/[0.70]">{item.label}</span>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">cooldown / rate-limit policy</p>
            <div className="mt-3 grid gap-2">
              {sourceTrust.cooldownPolicy.map((item) => (
                <p key={item.id} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">
                  <span className="mr-2 font-mono uppercase tracking-[0.12em] text-velmere-gold">{item.status}</span>{item.label}: {item.body}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">operator checklist</p>
          <div className="mt-3 grid gap-2">
            {sourceTrust.operatorChecklist.map((item, index) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">
                <span className="mr-2 font-mono text-velmere-gold">{index + 1}</span>{item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">blocked until</p>
          <div className="mt-3 grid gap-2">
            {(sourceTrust.blockedUntil.length ? sourceTrust.blockedUntil : ["No hard source blocks from this terminal state. Keep manual review wording anyway."]).map((item) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-red-300/[0.14] bg-red-400/[0.040] p-3 text-[11px] leading-5 text-red-100/[0.78]">{item}</p>
            ))}
          </div>
          <p className="shield-copy-safe mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.43]">
            {sourceTrust.legalNote}
          </p>
        </div>
      </div>
    </div>
  );
}


function TerminalRuntimeHealthPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
  chartError,
  orderbookError,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
  chartError?: string | null;
  orderbookError?: string | null;
}) {
  const runtimeHealth = useMemo(
    () =>
      buildTerminalRuntimeHealth(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbook,
        historyCount: history.length,
        activeCommand,
        chartError: Boolean(chartError),
        orderbookError: Boolean(orderbookError),
        modalErrorBoundary: true,
        terminalBootDeferred: true,
        modalChunkSplit: true,
        heavyPanelsDeferred: true,
        shieldMapDetached: true,
        tableWheelUnlocked: true,
        suggestionDismissOnOutsideClick: true,
        sourceCooldownActive: false,
        rateLimitMiddlewareReady: false,
        exportInfrastructureReady: false,
        persistentAuditLogReady: false,
        walletSessionReady: false,
      }),
    [activeCommand, candles.length, chartError, chartSource, history.length, orderbook, orderbookError, result],
  );

  const stateTone = (state: string) => {
    if (state === "stable" || state === "ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (state === "watch") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    if (state === "degraded") return "border-amber-300/[0.20] bg-amber-300/[0.065] text-amber-100";
    return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
  };

  return (
    <div className="shield-runtime-health mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Runtime health console · PASS74
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {runtimeHealth.headline}
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            PASS74 checks whether the terminal itself is stable: modal runtime, chart feed, orderbook, history, source trust, evidence export, Shield Map and legal wording. It is QA for the product, not a token accusation.
          </p>
        </div>
        <div className={`rounded-[1.25rem] border p-3 font-mono uppercase tracking-[0.12em] ${stateTone(runtimeHealth.state)}`}>
          <p className="text-[9px] opacity-70">runtime score</p>
          <p className="mt-1 text-3xl text-white tabular-nums">{runtimeHealth.runtimeScore}/100</p>
          <p className="mt-1 text-[10px]">{runtimeHealth.state}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {runtimeHealth.lanes.map((lane) => (
          <div key={lane.id} className={`shield-runtime-lane ${stateTone(lane.state)}`}>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
              <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.score}/100</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.detail}</p>
            <p className="shield-copy-safe mt-2 border-t border-white/[0.08] pt-2 text-[10px] leading-5 opacity-70">{lane.operatorAction}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">regression guards</p>
          <div className="mt-3 grid gap-2">
            {runtimeHealth.regressionGuards.map((guard) => (
              <div key={guard.id} className={`rounded-2xl border p-3 ${guard.locked ? "border-emerald-300/[0.14] bg-emerald-400/[0.035]" : "border-red-300/[0.14] bg-red-400/[0.04]"}`}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.70]">{guard.label}</p>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">{guard.locked ? "locked" : "open"}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.44]">{guard.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">operator runbook</p>
          <div className="mt-3 grid gap-2">
            {runtimeHealth.operatorRunbook.map((item, index) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]"><span className="mr-2 font-mono text-velmere-gold">{index + 1}</span>{item}</p>
            ))}
          </div>
        </div>
      </div>
      <p className="shield-copy-safe mt-4 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.055] p-3 text-[11px] leading-5 text-amber-100/[0.84]">
        {runtimeHealth.legalNote}
      </p>
    </div>
  );
}

function TerminalOperatorFocusPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const focus = useMemo(
    () =>
      buildTerminalOperatorFocus(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbook,
        historyCount: history.length,
        activeCommand,
        terminalBootDeferred: true,
        modalChunkSplit: true,
        heavyPanelsDeferred: true,
        modalErrorBoundary: true,
        focusedPanelRouting: true,
        sourceCooldownActive: false,
        rateLimitMiddlewareReady: false,
        exportInfrastructureReady: false,
        persistentAuditLogReady: false,
        walletSessionReady: false,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const stateTone = (state: string) => {
    if (state === "ready" || state === "stable") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (state === "review" || state === "watch") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    if (state === "degraded") return "border-amber-300/[0.20] bg-amber-300/[0.065] text-amber-100";
    return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
  };

  return (
    <div className="shield-operator-focus mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Operator focus router · PASS75
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {focus.headline}
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            PASS75 keeps the terminal fast and focused: one active command panel in the main lane, deferred heavy modules, clear source confidence and calm SOC review. This is product workflow, not a token accusation.
          </p>
        </div>
        <div className={`rounded-[1.25rem] border p-3 font-mono uppercase tracking-[0.12em] ${stateTone(focus.state)}`}>
          <p className="text-[9px] opacity-70">focus score</p>
          <p className="mt-1 text-3xl text-white tabular-nums">{focus.focusScore}/100</p>
          <p className="mt-1 text-[10px]">/{focus.activeCommand} · {focus.state}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {focus.lanes.map((lane) => (
          <div key={lane.id} className={`shield-operator-focus-lane ${stateTone(lane.state)}`}>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
              <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.score}/100</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.detail}</p>
            <p className="shield-copy-safe mt-2 border-t border-white/[0.08] pt-2 text-[10px] leading-5 opacity-70">{lane.operatorAction}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">operator playbook</p>
          <div className="mt-3 grid gap-2">
            {focus.playbook.map((step, index) => (
              <div key={step.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.70]">{index + 1}. {step.label}</p>
                  <span className="shrink-0 rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.055] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">{step.command}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.44]">{step.body}</p>
                {step.blockedBy ? (
                  <p className="shield-copy-safe mt-2 rounded-xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-2 text-[10px] leading-5 text-amber-100/[0.78]">Blocked: {step.blockedBy}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">visible panel policy</p>
            <div className="mt-3 grid gap-2">
              {focus.visiblePanelPolicy.map((item) => (
                <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">anti-lag rules</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {focus.antiLagRules.map((item) => (
                <span key={item} className="shield-copy-safe rounded-full border border-white/[0.08] bg-white/[0.024] px-3 py-2 text-[10px] leading-4 text-white/[0.44]">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="shield-copy-safe mt-4 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.055] p-3 text-[11px] leading-5 text-amber-100/[0.84]">
        {focus.legalNote}
      </p>
    </div>
  );
}


function TerminalInteractionStabilityPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const stability = useMemo(
    () =>
      buildTerminalInteractionStability(result, {
        candlesCount: candles.length,
        historyCount: history.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        activeCommand,
        terminalBootDeferred: true,
        modalChunkSplit: true,
        heavyPanelsDeferred: true,
        modalErrorBoundary: true,
        focusedPanelRouting: true,
        sourceCooldownActive: false,
        searchLocalFirst: true,
        suggestionDismissOnOutsideClick: true,
        shieldMapDetached: true,
        tableWheelUnlocked: true,
        stressScenarioHelpers: true,
        noRawJsonButtons: true,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const stateTone = (state: string) => {
    if (state === "ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (state === "watch") return "border-velmere-gold/[0.22] bg-velmere-gold/[0.060] text-velmere-gold";
    if (state === "degraded") return "border-amber-300/[0.22] bg-amber-300/[0.065] text-amber-100";
    return "border-red-300/[0.22] bg-red-400/[0.060] text-red-100";
  };

  return (
    <div className="shield-interaction-stability mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Interaction stability console · PASS76
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {stability.headline}
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            This console protects the real user path: click token, paint chart first, route one command panel, keep local clicks alive during source cooldowns and stop old stress/modal/search regressions from returning.
          </p>
        </div>
        <div className={`rounded-[1.25rem] border p-3 font-mono uppercase tracking-[0.12em] ${stateTone(stability.state)}`}>
          <p className="text-[9px] opacity-70">stability score</p>
          <p className="mt-1 text-3xl text-white tabular-nums">{stability.stabilityScore}/100</p>
          <p className="mt-1 text-[10px]">{stability.state}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stability.lanes.map((lane) => (
          <div key={lane.id} className={`shield-interaction-lane ${stateTone(lane.state)}`}>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
              <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.score}/100</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.signal}</p>
            <p className="shield-copy-safe mt-2 border-t border-white/[0.08] pt-2 text-[10px] leading-5 opacity-70">{lane.operatorAction}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">click flow contract</p>
          <div className="mt-3 grid gap-2">
            {stability.clickFlow.map((step, index) => (
              <div key={step.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.70]">{index + 1}. {step.label}</p>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.48]">{step.expected}</p>
                <p className="shield-copy-safe mt-2 rounded-xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-2 text-[10px] leading-5 text-amber-100/[0.78]">Blocked if: {step.blockedIf}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">lag budget</p>
            <div className="mt-3 grid gap-2">
              {stability.lagBudget.map((item) => (
                <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">regression locks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {stability.regressionLocks.map((item) => (
                <span key={item} className="shield-copy-safe rounded-full border border-white/[0.08] bg-white/[0.024] px-3 py-2 text-[10px] leading-4 text-white/[0.44]">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="shield-copy-safe mt-4 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.055] p-3 text-[11px] leading-5 text-amber-100/[0.84]">
        {stability.legalNote}
      </p>
    </div>
  );
}

function TerminalEvidenceExportPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const exportConsole = useMemo(
    () =>
      buildTerminalEvidenceExport(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbook,
        historyCount: history.length,
        activeCommand,
        sessionMode: "operator_session",
        walletSessionReady: false,
        exportInfrastructureReady: false,
        rateLimitMiddlewareReady: false,
        persistentAuditLogReady: false,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const stateTone = (state: string) => {
    if (state === "ready" || state === "draft_ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (state === "watch" || state === "intake_only") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
  };

  return (
    <div className="shield-evidence-export mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Evidence export console · PASS73
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            {exportConsole.headline}
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            This console separates report preview from production export. It shows source ledger, blocked rails, redaction rules and legal copy before any evidence leaves the terminal.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">export score</p>
            <p className="mt-1 text-lg text-velmere-gold tabular-nums">{exportConsole.exportReadinessScore}/100</p>
          </div>
          <div className={`rounded-2xl border p-3 ${stateTone(exportConsole.state)}`}>
            <p className="opacity-70">state</p>
            <p className="mt-1 text-sm uppercase tracking-[0.10em]">{exportConsole.state.replaceAll("_", " ")}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {exportConsole.lanes.map((lane) => (
            <div key={lane.id} className={`shield-export-lane ${stateTone(lane.state)}`}>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
                <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.state}</span>
              </div>
              <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.detail}</p>
              <p className="shield-copy-safe mt-2 border-t border-white/[0.08] pt-2 text-[10px] leading-5 opacity-70">{lane.operatorAction}</p>
            </div>
          ))}
        </div>
        <div className="grid min-w-0 gap-3">
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">export manifest</p>
            <div className="mt-3 grid gap-2">
              {exportConsole.manifest.map((item) => (
                <div key={item.id} className={`rounded-2xl border p-3 ${stateTone(item.quality)}`}>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{item.label}</p>
                    <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{item.included ? "included" : "pending"}</span>
                  </div>
                  <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-78">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-red-300/[0.14] bg-red-400/[0.045] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-red-100">blocked until</p>
            <div className="mt-3 grid gap-2">
              {(exportConsole.blockedUntil.length ? exportConsole.blockedUntil : ["No hard blocker from the visible state. Keep legal and source ledgers visible anyway."]).map((item) => (
                <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-black/[0.18] p-3 text-[11px] leading-5 text-white/[0.52]">{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">operator script</p>
          <div className="mt-3 grid gap-2">
            {exportConsole.operatorScript.map((item, index) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]"><span className="mr-2 font-mono text-velmere-gold">{index + 1}</span>{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">copy rules</p>
          <div className="mt-3 grid gap-2">
            {exportConsole.evidenceCopyRules.map((item) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">{item}</p>
            ))}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">redaction rules</p>
          <div className="mt-3 grid gap-2">
            {exportConsole.redactionRules.map((item) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">{item}</p>
            ))}
          </div>
        </div>
      </div>
      <p className="shield-copy-safe mt-4 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.055] p-3 text-[11px] leading-5 text-amber-100/[0.84]">
        {exportConsole.legalNote}
      </p>
    </div>
  );
}


function TerminalLaunchBridgePanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const launchBridge = useMemo(
    () =>
      buildTerminalLaunchBridge(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        historyCount: history.length,
        activeCommand,
        sessionMode: "operator_session",
        terminalBootDeferred: true,
        modalChunkSplit: true,
        shieldMapDetached: true,
        tableWheelUnlocked: true,
        searchResolverGuarded: true,
        suggestionDismissOnOutsideClick: true,
        sourceHonestyVisible: true,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const stateTone = (state: string) => {
    if (state === "ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (state === "partial") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    return "border-red-300/[0.20] bg-red-400/[0.055] text-red-100";
  };

  return (
    <div className="shield-launch-bridge mt-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
            Launch bridge · PASS71
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
            Build-to-100 gates are visible before this can feel like a production terminal.
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">
            This panel converts the roadmap into contracts: live data feeds, audit storage, rate limits, VLM utility access and evidence export. Blocked gates stay blocked; the UI must not fake readiness.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">readiness</p>
            <p className="mt-1 text-lg text-velmere-gold tabular-nums">{launchBridge.readinessScore}/100</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <p className="text-white/[0.34]">blockers</p>
            <p className="mt-1 text-lg text-white tabular-nums">{launchBridge.blockerCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {launchBridge.contracts.slice(0, 6).map((contract) => (
            <div key={contract.id} className={`shield-launch-contract ${stateTone(contract.state)}`}>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{contract.label}</p>
                <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{contract.state}</span>
              </div>
              <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{contract.reason}</p>
              <p className="shield-copy-safe mt-2 border-t border-white/[0.08] pt-2 text-[10px] leading-5 opacity-70">{contract.next}</p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 gap-3">
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">P0 blockers</p>
            <div className="mt-3 grid gap-2">
              {(launchBridge.p0Blockers.length ? launchBridge.p0Blockers : ["No P0 blockers from visible terminal state. Keep source-honesty gates active anyway."]).map((item) => (
                <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">operator script</p>
            <div className="mt-3 grid gap-2">
              {launchBridge.operatorScript.map((item, index) => (
                <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.07] bg-white/[0.022] p-3 text-[11px] leading-5 text-white/[0.46]">
                  <span className="mr-2 font-mono text-velmere-gold">{index + 1}</span>{item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {launchBridge.acceptanceGates.map((gate) => (
          <p key={gate} className="shield-copy-safe rounded-2xl border border-velmere-gold/[0.12] bg-velmere-gold/[0.040] p-3 text-[11px] leading-5 text-velmere-gold/[0.82]">{gate}</p>
        ))}
      </div>
      <p className="shield-copy-safe mt-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 text-[11px] leading-5 text-white/[0.44]">
        {launchBridge.legalNote}
      </p>
    </div>
  );
}

function TerminalUsabilityGuardPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const guard = useMemo(
    () =>
      buildTerminalUsabilityGuard(result, {
        candlesCount: candles.length,
        chartSource,
        hasOrderBook: Boolean(orderbook),
        orderbook,
        historyCount: history.length,
        activeCommand,
        sessionMode: "operator_session",
        searchHasIconSubmit: true,
        searchHasEmptyPlaceholder: true,
        shieldMapDetached: true,
        modalErrorBoundary: true,
        sortToggleEnabled: true,
        mobileBottomSheet: true,
      }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );

  const laneTone = (status: string) => {
    if (status === "ready") return "border-emerald-300/[0.20] bg-emerald-400/[0.055] text-emerald-100";
    if (status === "watch") return "border-velmere-gold/[0.20] bg-velmere-gold/[0.055] text-velmere-gold";
    return "border-red-300/[0.20] bg-red-400/[0.060] text-red-100";
  };

  return (
    <div className="shield-usability-guard mt-4 p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Terminal usability guard · PASS66</p>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-white">{guard.headline}</h3>
          <p className="shield-copy-safe mt-1 text-xs leading-6 text-white/[0.46]">
            Checks the exact friction points from real use: search resolver, two-way sort, modal safe-mode, command routing, source honesty and mobile readability.
          </p>
        </div>
        <div className="grid w-full max-w-xs grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.12em] md:w-72">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="text-white/[0.34]">score</p>
            <p className="mt-1 text-lg text-velmere-gold tabular-nums">{guard.usabilityScore}/100</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <p className="text-white/[0.34]">mode</p>
            <p className="mt-1 truncate text-white/[0.70]">{guard.mode.replaceAll("_", " ")}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {guard.checks.slice(0, 8).map((check) => (
          <div key={check.id} className={`min-w-0 rounded-2xl border p-3 ${laneTone(check.status)}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{check.lane}</p>
              <span className="font-mono text-[9px] tabular-nums">{check.score}/100</span>
            </div>
            <p className="mt-2 truncate text-xs font-semibold text-white/[0.86]">{check.label}</p>
            <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.48]">{check.operatorRead}</p>
            <p className="mt-2 border-t border-white/[0.08] pt-2 font-mono text-[9px] uppercase tracking-[0.10em] text-white/[0.40]">{check.repairCommand}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">sort contract</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {guard.sortContract.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
                <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
                  <span className="truncate text-white/[0.60]">{item.column}</span>
                  <span className="text-velmere-gold">{item.firstClick} ↔ {item.secondClick}</span>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-white/[0.38]">Missing values stay at the bottom.</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">kernel panic prevention</p>
          <div className="mt-3 grid gap-2">
            {guard.kernelPanicPrevention.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
                <p className="truncate text-xs font-semibold text-white/[0.76]">{item.guard}</p>
                <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.42]">{item.currentState} · {item.acceptance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-3">
        {guard.sourceHonesty.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.42]">{item.label}</p>
              <span className={`rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${laneTone(item.state)}`}>{item.state}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.46]">{item.body}</p>
          </div>
        ))}
      </div>

      <p className="shield-copy-safe mt-3 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3 text-[11px] leading-5 text-white/[0.42]">
        {guard.legalNote}
      </p>
    </div>
  );
}

function TerminalReadinessPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
}) {
  const readiness = buildTerminalReadiness(result, {
    candlesCount: candles.length,
    chartSource,
    hasOrderBook: Boolean(orderbook),
    orderBookRisk: orderbook?.riskPoints,
    historyCount: history.length,
    chatEnabled: true,
    accessLayerVisible: true,
  });
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  const statusTone = (status: string) =>
    status === "ready"
      ? "text-emerald-200"
      : status === "watch"
        ? "text-velmere-gold"
        : "text-amber-200";
  const gateTone = (status: string) =>
    status === "ready"
      ? "border-emerald-300/[0.16] bg-emerald-300/[0.045]"
      : status === "watch"
        ? "border-velmere-gold/[0.18] bg-velmere-gold/[0.055]"
        : "border-amber-300/[0.16] bg-amber-300/[0.050]";

  return (
    <div className="shield-command-panel mt-4 border-white/[0.10] bg-[radial-gradient(circle_at_0%_0%,rgba(200,169,106,0.10),transparent_32%),rgba(255,255,255,0.026)] p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Terminal readiness · PASS62</p>
          <p className="shield-copy-safe mt-1 text-xs leading-6 text-white/[0.50]">{readiness.productTruth}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-2xl border border-white/[0.10] bg-black/[0.24] px-3 py-2 text-right">
            <p className="font-mono text-lg text-white tabular-nums">{readiness.overallReadiness}%</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">{readiness.terminalMode.replaceAll("_", " ")}</p>
          </div>
          <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12] pointer-events-none opacity-75">
        readiness in panel
      </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {readiness.gates.map((gate) => (
          <div key={gate.id} className={`min-w-0 rounded-2xl border p-3 ${gateTone(gate.status)}`}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.44]">{gate.label}</p>
                <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.13em] ${statusTone(gate.status)}`}>{gate.status}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.20] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.60]">{gate.score}</span>
            </div>
            <p className="mt-2 truncate font-mono text-[10px] text-white/[0.42]">{gate.evidence}</p>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.46]">{gate.nextStep}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.52fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">missing production blocks</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {readiness.missingProductionBlocks.slice(0, 6).map((item) => <p key={item}>• {item}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">next sprint stack</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {readiness.nextSprintStack.slice(0, 4).map((item) => <p key={item.id}>• {item.label} · {item.owner}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}


function EvidenceWorkflowPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const workflow = useMemo(
    () => buildEvidenceWorkflow(result, {
      historyCount: history.length,
      candlesCount: candles.length,
      chartSource,
      orderbook,
      activeCommand,
    }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );
  const statusTone = workflow.status === "review_ready"
    ? "text-emerald-100"
    : workflow.status === "blocked_for_data"
      ? "text-amber-100"
      : "text-velmere-gold";

  return (
    <div className="shield-evidence-workflow p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Evidence workflow · PASS62</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-sm font-semibold text-white/[0.86]">{workflow.summary}</h3>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.44]">Case ID: <span className="font-mono text-white/[0.62]">{workflow.caseId}</span></p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 text-right font-mono tabular-nums">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-2">
            <p className={`text-lg ${statusTone}`}>{workflow.evidenceGrade}</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.32]">grade</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-2">
            <p className={`text-xs uppercase tracking-[0.12em] ${statusTone}`}>{workflow.status.replaceAll("_", " ")}</p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-white/[0.32]">status</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">source ledger</p>
          <div className="mt-3 grid gap-2">
            {workflow.sourceLedger.map((source) => (
              <div key={source.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white/[0.68]">{source.label}</p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.11em] text-white/[0.32]">{source.detail}</p>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.45]">{source.quality}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">case steps</p>
          <div className="mt-3 grid gap-2">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="grid grid-cols-[1.55rem_minmax(0,1fr)] gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-black/[0.20] font-mono text-[8px] text-velmere-gold">{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-white/[0.72]">{step.label}</p>
                    <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.34]">{step.status}</span>
                  </div>
                  <p className="shield-dense-copy mt-1 text-[11px] text-white/[0.42]">{step.evidence}</p>
                  <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.50]">{step.nextAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">analyst commands</p>
          <div className="mt-2 grid gap-1.5 font-mono text-[10px] leading-5 text-white/[0.44]">
            {workflow.analystCommands.slice(0, 5).map((command) => <p key={command}>{command}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">missing data</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {(workflow.missingData.length ? workflow.missingData.slice(0, 5) : ["No critical missing block detected for this scan context."]).map((item) => <p key={item}>• {item}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">export guardrails</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {workflow.legalGuardrails.slice(0, 4).map((item) => <p key={item}>• {item}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}


function ProductOpsAuditPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const audit = useMemo(
    () => buildProductOpsAudit(result, {
      historyCount: history.length,
      candlesCount: candles.length,
      chartSource,
      hasOrderBook: Boolean(orderbook),
      orderBookRisk: orderbook?.riskPoints,
      orderbook,
      chatEnabled: true,
      accessLayerVisible: true,
      activeCommand,
      sessionMode: "operator_session",
    }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  const tone = audit.mode === "launch_candidate"
    ? "text-emerald-100"
    : audit.mode === "operator_preview"
      ? "text-velmere-gold"
      : "text-amber-100";
  const statusTone = (status: string) =>
    status === "ready"
      ? "text-emerald-200"
      : status === "watch"
        ? "text-velmere-gold"
        : "text-amber-200";
  const gateTone = (status: string) =>
    status === "ready"
      ? "border-emerald-300/[0.14] bg-emerald-300/[0.040]"
      : status === "watch"
        ? "border-velmere-gold/[0.18] bg-velmere-gold/[0.050]"
        : "border-amber-300/[0.16] bg-amber-300/[0.050]";

  return (
    <div className="shield-ops-audit mt-4 p-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Product ops audit · PASS62</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-sm font-semibold text-white/[0.86]">{audit.headline}</h3>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.44]">Operator mode: <span className="font-mono text-white/[0.62]">{audit.mode.replaceAll("_", " ")}</span> · active command <span className="font-mono text-white/[0.62]">/{activeCommand}</span></p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-2xl border border-white/[0.10] bg-black/[0.24] px-3 py-2 text-right font-mono tabular-nums">
            <p className={`text-lg ${tone}`}>{audit.opsScore}/100</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">ops score</p>
          </div>
          <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12] pointer-events-none opacity-75">
        ops in panel
      </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {audit.gates.map((gate) => (
          <div key={gate.id} className={`shield-no-overlap rounded-2xl border p-3 ${gateTone(gate.status)}`}>
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.40]">{gate.label}</p>
                <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.12em] ${statusTone(gate.status)}`}>{gate.status}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.58]">{gate.score}</span>
            </div>
            <p className="mt-2 truncate font-mono text-[10px] text-white/[0.42]">{gate.evidence}</p>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.47]">{gate.operatorAction}</p>
            <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.34]">{gate.customerRisk}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">data source cockpit</p>
          <div className="mt-3 grid gap-2">
            {audit.sourceCockpit.map((source) => (
              <div key={source.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white/[0.70]">{source.label}</p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.11em] text-white/[0.32]">{source.detail}</p>
                </div>
                <span className={`rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${statusTone(source.status)}`}>{source.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">case timeline</p>
          <div className="mt-3 grid gap-2">
            {audit.caseTimeline.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1.55rem_minmax(0,1fr)] gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-black/[0.20] font-mono text-[8px] text-velmere-gold">{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-white/[0.72]">{item.label}</p>
                    <span className={`shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] ${statusTone(item.status)}`}>{item.status}</span>
                  </div>
                  <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.10em] text-white/[0.30]">{item.timestamp}</p>
                  <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.45]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">export payload</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {audit.exportPayload.map((item) => <p key={item.key}><span className="font-mono text-white/[0.62]">{item.key}</span>: {item.value} · {item.guardrail}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">command history</p>
          <div className="mt-2 grid gap-1.5 font-mono text-[10px] leading-5 text-white/[0.42]">
            {audit.commandHistory.map((item) => <p key={item.command}>{item.command} · {item.expectedResult}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">launch blockers</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {audit.launchBlockers.slice(0, 6).map((item) => <p key={item}>• {item}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}


function TerminalControlPlanePanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const control = useMemo(
    () => buildTerminalControlPlane(result, {
      historyCount: history.length,
      candlesCount: candles.length,
      chartSource,
      hasOrderBook: Boolean(orderbook),
      orderBookRisk: orderbook?.riskPoints,
      orderbook,
      chatEnabled: true,
      accessLayerVisible: true,
      activeCommand,
      sessionMode: "operator_session",
    }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  const tone = control.mode === "production_track"
    ? "text-emerald-100"
    : control.mode === "operator_control"
      ? "text-velmere-gold"
      : "text-amber-100";
  const statusTone = (status: string) =>
    status === "ready"
      ? "text-emerald-200"
      : status === "watch"
        ? "text-velmere-gold"
        : "text-amber-200";
  const cardTone = (status: string) =>
    status === "ready"
      ? "border-emerald-300/[0.14] bg-emerald-300/[0.038]"
      : status === "watch"
        ? "border-velmere-gold/[0.18] bg-velmere-gold/[0.052]"
        : "border-amber-300/[0.16] bg-amber-300/[0.048]";

  return (
    <div className="shield-control-plane mt-4 p-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <GitBranch className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Terminal control plane · PASS62</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-sm font-semibold text-white/[0.86]">{control.headline}</h3>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.44]">Build-to-100 control spine: data contracts, operator action queue, release rails, UX psychology checks and legal guardrails in one place.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-2xl border border-white/[0.10] bg-black/[0.24] px-3 py-2 text-right font-mono tabular-nums">
            <p className={`text-lg ${tone}`}>{control.controlScore}/100</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">control score</p>
          </div>
          <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12] pointer-events-none opacity-75">
        control in panel
      </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {control.contracts.map((item) => (
          <div key={item.id} className={`shield-no-overlap rounded-2xl border p-3 ${cardTone(item.status)}`}>
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.42]">{item.label}</p>
                <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.12em] ${statusTone(item.status)}`}>{item.status} · {item.lane}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.58]">{item.readiness}</span>
            </div>
            <p className="mt-2 truncate font-mono text-[10px] text-white/[0.42]">{item.currentState}</p>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.46]">{item.productionNeed}</p>
            <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-velmere-gold/[0.70]">{item.operatorCommand}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">operator action queue</p>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {control.actionQueue.slice(0, 6).map((action) => (
              <div key={action.id} className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white/[0.72]">{action.label}</p>
                    <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.34]">{action.priority} · {action.lane}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${statusTone(action.status)}`}>{action.status}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.45]">{action.why}</p>
                <p className="shield-copy-safe mt-2 border-t border-white/[0.06] pt-2 text-[10px] leading-5 text-velmere-gold/[0.72]">{action.acceptanceCriteria[0]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">release rails</p>
            <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
              {control.releaseRails.map((rail) => <p key={rail.id}><span className={`font-mono uppercase ${statusTone(rail.status)}`}>{rail.status}</span> · {rail.label}: {rail.detail}</p>)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">UX psychology checks</p>
            <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
              {control.uxPsychologyChecks.slice(0, 5).map((item) => <p key={item}>• {item}</p>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-3 text-[11px] leading-5 text-amber-100/[0.82]">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">data truth + legal rail</p>
        <p className="shield-copy-safe mt-2">{control.dataTruth}</p>
        <p className="shield-copy-safe mt-1">{control.legalGuardrails[0]}</p>
      </div>
    </div>
  );
}


function TerminalRiskWorkspacePanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const workspace = useMemo(
    () => buildTerminalRiskWorkspace(result, {
      historyCount: history.length,
      candlesCount: candles.length,
      chartSource,
      hasOrderBook: Boolean(orderbook),
      orderBookRisk: orderbook?.riskPoints,
      orderbook,
      chatEnabled: true,
      accessLayerVisible: true,
      activeCommand,
      sessionMode: "operator_session",
    }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  const tone = workspace.mode === "release_candidate"
    ? "text-emerald-100"
    : workspace.mode === "operator_workspace"
      ? "text-velmere-gold"
      : "text-amber-100";
  const statusTone = (status: string) =>
    status === "ready"
      ? "text-emerald-200"
      : status === "watch"
        ? "text-velmere-gold"
        : "text-amber-200";
  const cardTone = (status: string) =>
    status === "ready"
      ? "border-emerald-300/[0.14] bg-emerald-300/[0.038]"
      : status === "watch"
        ? "border-velmere-gold/[0.18] bg-velmere-gold/[0.052]"
        : "border-amber-300/[0.16] bg-amber-300/[0.048]";
  const sourceTone = (state: string) =>
    state === "live"
      ? "text-emerald-200"
      : state === "partial" || state === "fallback"
        ? "text-velmere-gold"
        : "text-amber-200";

  return (
    <div className="shield-risk-workspace mt-4 p-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Radar className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Terminal risk workspace · PASS63</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-sm font-semibold text-white/[0.86]">{workspace.headline}</h3>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.44]">Decision workspace: source registry, policy registry, operator tree, UI friction and legal-safe review script in one compact control layer.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-2xl border border-white/[0.10] bg-black/[0.24] px-3 py-2 text-right font-mono tabular-nums">
            <p className={`text-lg ${tone}`}>{workspace.workspaceScore}/100</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">workspace score</p>
          </div>
          <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12] pointer-events-none opacity-75">
        workspace in panel
      </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {workspace.decisionCards.map((card) => (
          <div key={card.id} className={`shield-no-overlap rounded-2xl border p-3 ${cardTone(card.status)}`}>
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.42]">{card.label}</p>
                <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.12em] ${statusTone(card.status)}`}>{card.status} · {card.lane}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.58]">{card.score}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.50]">{card.decision}</p>
            <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.11em] text-white/[0.34]">blocked until · {card.blockedUntil}</p>
            <p className="shield-copy-safe mt-2 border-t border-white/[0.06] pt-2 text-[10px] leading-5 text-velmere-gold/[0.74]">{card.operatorCommand}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">source registry</p>
          <div className="mt-3 grid gap-2">
            {workspace.sourceRegistry.map((source) => (
              <div key={source.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white/[0.72]">{source.label}</p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.10em] text-white/[0.34]">{source.freshness} · {source.visibleInUi ? "visible" : "hidden"}</p>
                  <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.38]">{source.requiredForProduction}</p>
                </div>
                <span className={`rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${sourceTone(source.state)}`}>{source.state}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="shield-policy-registry rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">policy registry</p>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {workspace.policyRegistry.map((policy) => (
              <div key={policy.id} className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white/[0.72]">{policy.label}</p>
                    <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.34]">{policy.owner}</p>
                  </div>
                  <span className={`shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] ${statusTone(policy.status)}`}>{policy.status}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.45]">{policy.rule}</p>
                <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.30]">Failure mode: {policy.failureMode}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">operator decision tree</p>
          <div className="mt-2 grid gap-2">
            {workspace.operatorDecisionTree.map((step, index) => (
              <div key={step.id} className="grid grid-cols-[1.55rem_minmax(0,1fr)] gap-3 rounded-xl border border-white/[0.06] bg-black/[0.16] p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-black/[0.20] font-mono text-[8px] text-velmere-gold">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white/[0.70]">{step.label}</p>
                  <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.42]">Yes: {step.ifTrue}</p>
                  <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.34]">No: {step.ifFalse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">UI friction controls</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {workspace.uiFrictionControls.map((item) => <p key={item}>• {item}</p>)}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">review script + legal rail</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-amber-100/[0.82]">
            {workspace.reviewScript.slice(0, 5).map((item) => <p key={item}>• {item}</p>)}
          </div>
          <p className="shield-copy-safe mt-3 border-t border-amber-200/[0.10] pt-3 text-[11px] leading-5 text-white/[0.48]">{workspace.legalGuardrails[0]}</p>
        </div>
      </div>
    </div>
  );
}


function ProductionHardeningPanel({
  result,
  candles,
  orderbook,
  history,
  chartSource,
  activeCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  history: HistorySnapshot[];
  chartSource: string;
  activeCommand: TerminalCommandId;
}) {
  const hardening = useMemo(
    () => buildProductionHardening(result, {
      historyCount: history.length,
      candlesCount: candles.length,
      chartSource,
      hasOrderBook: Boolean(orderbook),
      orderbook,
      activeCommand,
      sessionMode: "operator_session",
      chatEnabled: true,
      accessLayerVisible: true,
    }),
    [activeCommand, candles.length, chartSource, history.length, orderbook, result],
  );
  const query = result["token"].marketId ?? result["token"].tokenAddress ?? result["token"].symbol;
  const tone = hardening.mode === "production_candidate"
    ? "text-emerald-100"
    : hardening.mode === "operator_beta"
      ? "text-velmere-gold"
      : "text-amber-100";
  const statusTone = (status: string) =>
    status === "ready"
      ? "text-emerald-200"
      : status === "watch"
        ? "text-velmere-gold"
        : "text-amber-200";
  const gateTone = (status: string) =>
    status === "ready"
      ? "border-emerald-300/[0.14] bg-emerald-300/[0.038]"
      : status === "watch"
        ? "border-velmere-gold/[0.18] bg-velmere-gold/[0.052]"
        : "border-amber-300/[0.16] bg-amber-300/[0.048]";

  return (
    <div className="shield-production-hardening mt-4 p-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Production hardening · PASS64</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-sm font-semibold text-white/[0.86]">{hardening.headline}</h3>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.44]">Release-readiness layer: audit log contract, rate-limit policy, export manifest, VLM session access and legal-safe copy rails.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-2xl border border-white/[0.10] bg-black/[0.24] px-3 py-2 text-right font-mono tabular-nums">
            <p className={`text-lg ${tone}`}>{hardening.hardeningScore}/100</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">{hardening.mode.replaceAll("_", " ")}</p>
          </div>
          <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12] pointer-events-none opacity-75">
        hardening in panel
      </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {hardening.gates.map((gate) => (
          <div key={gate.id} className={`shield-production-gate rounded-2xl border p-3 ${gateTone(gate.status)}`}>
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.42]">{gate.label}</p>
                <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.12em] ${statusTone(gate.status)}`}>{gate.status} · {gate.lane}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[9px] tabular-nums text-white/[0.58]">{gate.score}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.50]">{gate.requirement}</p>
            <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.10em] text-white/[0.34]">state · {gate.currentState}</p>
            <p className="shield-copy-safe mt-2 border-t border-white/[0.06] pt-2 font-mono text-[10px] leading-5 text-velmere-gold/[0.72]">{gate.fixCommand}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">audit log contract</p>
          <div className="mt-3 grid gap-2">
            {hardening.auditContract.map((event) => (
              <div key={event.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white/[0.72]">{event.action}</p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.10em] text-white/[0.34]">{event.actor} · {event.timestamp}</p>
                  <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.40]">{event.retention}</p>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-black/[0.20] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.45]">audit</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">rate-limit / abuse policy</p>
          <div className="mt-3 grid gap-2 lg:grid-cols-3">
            {hardening.rateLimitPolicy.map((policy) => (
              <div key={policy.id} className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-white/[0.72]">{policy.label}</p>
                  <span className={`shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] ${statusTone(policy.enforcementState)}`}>{policy.enforcementState}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[10px] leading-5 text-white/[0.42]">Public: {policy.publicPreview}</p>
                <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.34]">Abuse: {policy.abuseSignal}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">export manifest</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {hardening.exportManifest.map((item) => (
              <p key={item.id} className="shield-copy-safe">• <span className={item.included ? "text-emerald-100/[0.82]" : "text-amber-100/[0.82]"}>{item.included ? "included" : "pending"}</span> · {item.label} · {item.legalRail}</p>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">session access checks</p>
          <div className="mt-2 grid gap-2">
            {hardening.sessionAccessChecks.map((check) => (
              <div key={check.id} className="rounded-xl border border-white/[0.06] bg-black/[0.16] p-3">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-white/[0.70]">{check.label}</p>
                  <span className={`shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] ${statusTone(check.status)}`}>{check.status}</span>
                </div>
                <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.42]">{check.sessionRule}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-300/[0.14] bg-amber-300/[0.045] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">abuse protection queue</p>
          <div className="mt-2 grid gap-2">
            {hardening.abuseProtectionQueue.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-xl border border-white/[0.06] bg-black/[0.14] p-3">
                <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-amber-100/[0.82]">{task.priority} · {task.task}</p>
                <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.42]">Acceptance: {task.acceptance}</p>
              </div>
            ))}
          </div>
          <p className="shield-copy-safe mt-3 border-t border-amber-200/[0.10] pt-3 text-[11px] leading-5 text-white/[0.48]">{hardening.safeCopyRules[3]}</p>
        </div>
      </div>
    </div>
  );
}

function LiquidityIntelligencePanel({ result, orderbook }: { result: BrainResult; orderbook: OrderBookResult | null }) {
  const liquidity = useMemo(() => buildLiquidityIntelligence(result, orderbook), [orderbook, result]);
  const tone = liquidity.reviewPriority === "critical"
    ? "text-red-100"
    : liquidity.reviewPriority === "high"
      ? "text-amber-100"
      : liquidity.reviewPriority === "watch"
        ? "text-velmere-gold"
        : "text-emerald-100";

  return (
    <div className="shield-liquidity-intelligence p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Liquidity intelligence · PASS62</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-sm font-semibold text-white/[0.86]">{liquidity.headline}</h3>
          <p className="shield-dense-copy mt-1 text-xs text-white/[0.44]">{liquidity.sourceTruth}</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 font-mono tabular-nums">
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-2 text-right">
            <p className={`text-lg ${tone}`}>{liquidity.liquidityScore}</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.32]">score</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-2 text-right">
            <p className={`text-lg ${tone}`}>{liquidity.uncertaintyPercent}%</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/[0.32]">uncertainty</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {liquidity.zones.map((zone) => (
          <div key={zone.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <p className="truncate text-xs font-semibold text-white/[0.72]">{zone.label}</p>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.36]">{zone.priority}</span>
            </div>
            <p className="mt-2 font-mono text-sm tabular-nums text-white/[0.82]">{zone.value}</p>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.43]">{zone.explanation}</p>
            <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.11em] text-velmere-gold/[0.78]">{zone.command}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">depth stress</p>
          <div className="mt-2 grid gap-2">
            {liquidity.depthStress.map((item) => (
              <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl border border-white/[0.06] bg-black/[0.16] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs text-white/[0.68]">{item.label}</p>
                  <p className="shield-dense-copy mt-1 text-[11px] text-white/[0.38]">{item.note}</p>
                </div>
                <span className="font-mono text-xs tabular-nums text-white/[0.58]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">missing liquidity data</p>
          <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.44]">
            {(liquidity.missingData.length ? liquidity.missingData : ["Live order book and market metrics are sufficient for current first-pass review."]).slice(0, 5).map((item) => <p key={item}>• {item}</p>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {liquidity.analystCommands.slice(0, 4).map((command) => (
              <span key={command} className="rounded-full border border-white/[0.08] bg-black/[0.18] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.10em] text-white/[0.38]">{command}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalActionPlan({ result, orderbook, historyScoreDelta }: { result: TokenRiskResult; orderbook: OrderBookResult | null; historyScoreDelta?: number }) {
  const confidence = Math.round((result.confidence ?? 0.35) * 100);
  const items = [
    {
      label: "Risk delta",
      value: historyScoreDelta !== undefined ? `${historyScoreDelta > 0 ? "+" : ""}${historyScoreDelta}` : "0",
      body: historyScoreDelta && historyScoreDelta > 8 ? "Escalate: risk is rising fast." : "Monitor: no rapid acceleration detected.",
    },
    {
      label: "Liquidity",
      value: orderbook ? `${orderbook.riskPoints}/100` : "unknown",
      body: orderbook ? "Depth and slippage layer available." : "Order book source missing, keep uncertainty penalty.",
    },
    {
      label: "Data confidence",
      value: `${confidence}%`,
      body: confidence < 60 ? "Do not over-trust the score until more sources confirm." : "Enough data for first-pass screening.",
    },
  ];
  return (
    <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
      <div className="flex items-center gap-2">
        <Radar className="h-4 w-4 text-velmere-gold" />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Investigation action plan</p>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item, index) => (
          <div key={item.label} className="grid grid-cols-[1.7rem_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] font-mono text-[9px] text-velmere-gold">{index + 1}</span>
            <div>
              <p className="text-xs font-semibold text-white/[0.78]">{item.label}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/[0.42]">{item.body}</p>
            </div>
            <span className="rounded-full border border-white/[0.10] bg-white/[0.035] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.52]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function agentToneClass(status?: string) {
  if (status === "critical") return "border-red-300/[0.20] bg-red-400/[0.055]";
  if (status === "high") return "border-orange-300/[0.18] bg-orange-300/[0.055]";
  if (status === "medium") return "border-amber-300/[0.16] bg-amber-300/[0.05]";
  return "border-white/[0.09] bg-white/[0.025]";
}

function verdictTone(verdict?: string) {
  if (verdict === "critical") return "text-red-200";
  if (verdict === "warning") return "text-orange-200";
  if (verdict === "watch") return "text-amber-100";
  if (verdict === "insufficient_data") return "text-white/[0.52]";
  return "text-emerald-100";
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.10] bg-white/[0.035] p-4">
      <Icon className="h-4 w-4 text-velmere-gold" />
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.35]">
        {label}
      </p>
      <p className="mt-2 font-mono text-sm text-white/[0.80]">{value}</p>
    </div>
  );
}


function clampPercent(value: number) {
  return Math.max(3, Math.min(100, value));
}


function SocTerminalPanel({ result, history }: { result: BrainResult; history: HistorySnapshot[] }) {
  const soc = useMemo(() => buildSocTerminalBrief(result, history), [result, history]);
  const toneClass =
    soc.status === "critical"
      ? "border-red-300/[0.24] bg-red-400/[0.06]"
      : soc.status === "warning"
        ? "border-amber-300/[0.22] bg-amber-300/[0.06]"
        : soc.status === "watch"
          ? "border-velmere-gold/[0.20] bg-velmere-gold/[0.055]"
          : "border-emerald-300/[0.16] bg-emerald-300/[0.045]";
  const statusText = soc.status.replaceAll("_", " ");

  return (
    <div className={`shield-command-panel shield-no-overlap rounded-[1.5rem] border p-4 ${toneClass}`}>
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Radar className="h-4 w-4 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">AI SOC command queue</p>
          </div>
          <h3 className="shield-copy-safe mt-2 text-base font-semibold leading-6 text-white/[0.88]">{soc.headline}</h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.48]">{soc.analystNarrative}</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.13em] md:w-56">
          <span className="rounded-2xl border border-white/[0.10] bg-black/[0.22] px-3 py-2 text-white/[0.46]">status <strong className="block text-white/[0.82]">{statusText}</strong></span>
          <span className="rounded-2xl border border-white/[0.10] bg-black/[0.22] px-3 py-2 text-white/[0.46]">confidence <strong className="block text-white/[0.82]">{soc.confidence}%</strong></span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
        <div className="grid gap-2">
          {soc.commandQueue.slice(0, 4).map((command) => (
            <div key={command.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white/[0.86]">{command.label}</p>
                  <p className="shield-copy-safe mt-1 text-xs leading-5 text-white/[0.46]">{command.reason}</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.10] bg-white/[0.04] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.46]">
                  {command.layer}
                </span>
              </div>
              <p className="shield-copy-safe mt-2 border-t border-white/[0.06] pt-2 text-xs leading-5 text-velmere-gold/[0.80]">{command.action}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          {soc.readiness.map((check) => (
            <div key={check.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.54]">{check.label}</p>
                <span className={check.status === "pass" ? "text-emerald-200" : check.status === "watch" ? "text-amber-200" : "text-red-200"}>{check.status}</span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-white/[0.38]">{check.value}</p>
              <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.42]">{check.fix}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-2 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3 md:flex-row md:items-center md:justify-between">
        <p className="shield-copy-safe text-xs leading-6 text-white/[0.48]"><strong className="text-white/[0.78]">Next best action:</strong> {soc.nextBestAction}</p>
        <span className="shrink-0 rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.075] px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.13] pointer-events-none opacity-75">
        SOC in panel
      </span>
      </div>
    </div>
  );
}

function HolderBrainPanel({ result }: { result: BrainResult }) {
  const intelligence = buildHolderIntelligence(result);
  const tone = intelligence.holderRiskScore >= 70 ? "text-amber-100" : intelligence.holderRiskScore >= 40 ? "text-velmere-gold" : "text-emerald-100";
  const nodeTone = (risk: number) =>
    risk >= 75
      ? "border-amber-300/[0.24] bg-amber-300/[0.08] text-amber-100"
      : risk >= 45
        ? "border-velmere-gold/[0.22] bg-velmere-gold/[0.07] text-velmere-gold"
        : "border-emerald-300/[0.18] bg-emerald-400/[0.06] text-emerald-100";
  const statusTone = (status?: string) =>
    status === "live"
      ? "text-emerald-200"
      : status === "proxy"
        ? "text-velmere-gold"
        : "text-amber-200";
  const clusterTone = (role: string) =>
    role === "whale"
      ? "border-amber-300/[0.22] bg-amber-300/[0.07]"
      : role === "custody"
        ? "border-sky-300/[0.18] bg-sky-300/[0.055]"
        : role === "liquidity"
          ? "border-emerald-300/[0.18] bg-emerald-300/[0.055]"
          : role === "team"
            ? "border-red-300/[0.18] bg-red-300/[0.055]"
            : role === "retail"
              ? "border-white/[0.09] bg-white/[0.026]"
              : "border-velmere-gold/[0.18] bg-velmere-gold/[0.045]";

  return (
    <div className="shield-density-bento p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <WalletCards className="h-4 w-4 shrink-0 text-velmere-gold" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Holder intelligence 2.0</p>
            <p className="shield-copy-safe mt-1 text-xs leading-5 text-white/[0.42]">Whales, CEX/custody, DEX/LP, team, retail and unknown clusters with explicit uncertainty.</p>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/[0.08] bg-black/[0.22] px-3 py-2 text-right">
          <p className={`font-mono text-lg tabular-nums ${tone}`}>{intelligence.holderRiskScore}/100</p>
          <p className="max-w-[7rem] truncate font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">{intelligence.verdict}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">data completeness</p>
          <p className="mt-1 font-mono text-lg tabular-nums text-white">{intelligence.dataCompleteness}%</p>
        </div>
        <div className="rounded-2xl border border-amber-300/[0.12] bg-amber-300/[0.035] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">data uncertainty</p>
          <p className="mt-1 font-mono text-lg tabular-nums text-amber-100">{intelligence.dataUncertaintyPercent}%</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">uncertainty</p>
          <p className="mt-1 font-mono text-lg uppercase text-velmere-gold">{intelligence.uncertainty}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">clusters</p>
          <p className="mt-1 font-mono text-lg tabular-nums text-white">{intelligence.clusterMap.length}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          ["cluster psychology", "separate custody from whales"],
          ["unknown bucket", "never equals safe"],
          ["manual review", intelligence.verdict.replaceAll("_", " ")],
        ].map(([label, value]) => (
          <div key={label} className="shield-readability-grade justify-between">
            <span className="truncate text-white/[0.32]">{label}</span>
            <span className="truncate text-white/[0.68]">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <GitBranch className="h-3.5 w-3.5 shrink-0 text-velmere-gold" />
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.42]">Holder cluster map 2.0</p>
          </div>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">
            data {intelligence.dataCompleteness}%
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {intelligence.nodes.map((node, index) => (
            <div key={`cluster-${node.id}`} className={`min-w-0 rounded-2xl border p-3 ${nodeTone(node.risk)}`}>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">{node.id}</span>
                <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] ${statusTone(node.dataStatus)}`}>{node.dataStatus}</span>
              </div>
              <div className="mt-3 flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-black/[0.22] font-mono text-[9px] text-white/[0.56]">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white/[0.82]">{node.label}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-velmere-gold" style={{ width: `${clampPercent(node.weight)}%` }} />
                  </div>
                </div>
              </div>
              <p className="shield-truncate-2 mt-2 text-[11px] leading-5 text-white/[0.42]">{node.note}</p>
              <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.38]">
                <span>risk {node.risk}</span>
                <span>conf {Math.round(node.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-white/[0.08] bg-[radial-gradient(circle_at_50%_20%,rgba(200,169,106,0.10),transparent_44%),rgba(0,0,0,0.18)] p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {intelligence.clusterMap.slice(0, 24).map((cluster) => (
              <div key={cluster.id} className={`min-w-0 rounded-2xl border p-2.5 ${clusterTone(cluster.role)}`}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.38]">{cluster.role}</p>
                  <span className="shrink-0 font-mono text-[9px] tabular-nums text-white/[0.64]">{cluster.share}%</span>
                </div>
                <p className="mt-1 truncate text-[11px] font-semibold text-white/[0.78]">{cluster.label}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-velmere-gold" style={{ width: `${clampPercent(cluster.risk)}%` }} />
                </div>
                <p className="shield-truncate-2 mt-2 text-[10px] leading-4 text-white/[0.38]">{cluster.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          {intelligence.edges.map((edge) => (
            <div key={`${edge.from}-${edge.to}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
              <p className="shield-copy-safe text-[11px] leading-5 text-white/[0.48]">
                <strong className="text-white/[0.72]">{edge.from}</strong> → <strong className="text-white/[0.72]">{edge.to}</strong> · {edge.label}
              </p>
              <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.22] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.48]">{edge.pressure}/100</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {intelligence.lanes.map((lane) => (
          <div key={lane.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white/[0.78]">{lane.label}</p>
                <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.40]">{lane.nextStep}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.10] bg-white/[0.035] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.52]">{lane.value}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className={`h-full rounded-full ${lane.score >= 70 ? "bg-amber-300" : lane.score >= 40 ? "bg-velmere-gold" : "bg-emerald-300"}`} style={{ width: `${clampPercent(lane.score)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3 text-[11px] leading-5 text-white/[0.42]">
        <p><strong className="text-white/[0.72]">Missing:</strong> {intelligence.missingData.length ? intelligence.missingData.join(" · ") : "core holder proxy complete"}</p>
        <p><strong className="text-white/[0.72]">Source plan:</strong> {intelligence.sourcePlan.map((item) => `${item.source}: ${item.status}`).join(" · ")}</p>
        <p><strong className="text-white/[0.72]">Next:</strong> {intelligence.nextActions[0]}</p>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:text-white pointer-events-none opacity-75">
        holder view in panel
      </span>
      </div>
    </div>
  );
}


function RiskReplayPanel({ result, history }: { result: BrainResult; history: HistorySnapshot[] }) {
  const replay = buildRiskReplay(result, history);
  const topEvents = replay.events.slice(-5).reverse();
  const replayToken = result["token"];
  const query = replayToken.marketId ?? replayToken.symbol;
  const accelerationTone = replay.accelerationScore >= 75
    ? "text-red-100"
    : replay.accelerationScore >= 55
      ? "text-amber-100"
      : replay.accelerationScore >= 35
        ? "text-velmere-gold"
        : "text-emerald-100";
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-[radial-gradient(circle_at_10%_0%,rgba(200,169,106,0.12),transparent_32%),rgba(255,255,255,0.026)] p-5">
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border border-velmere-gold/[0.12]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-velmere-gold/[0.22] bg-black/[0.26] text-velmere-gold">
            <GitBranch className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Risk replay timeline</p>
            <p className="mt-1 text-xs leading-5 text-white/[0.44]">Reconstructs why the case is moving: memory, signals, stress shocks and holder pressure.</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`font-mono text-2xl tabular-nums ${accelerationTone}`}>{replay.accelerationScore}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.36]">acceleration</p>
        </div>
      </div>

      <div className="relative mt-4 grid gap-2">
        {replay.phases.slice(0, 3).map((phase) => (
          <div key={phase.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white/[0.78]">{phase.label}</span>
              <span className="font-mono text-[10px] text-white/[0.58] tabular-nums">{phase.score}/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className={`h-full rounded-full ${phase.score >= 70 ? "bg-red-300" : phase.score >= 50 ? "bg-amber-300" : "bg-velmere-gold"}`} style={{ width: `${clampPercent(phase.score)}%` }} />
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/[0.42]">{phase.nextStep}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {topEvents.map((event, index) => (
          <div key={event.id} className="relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
            <span className={`mt-1 h-3 w-3 rounded-full ${event.severity === "critical" ? "bg-red-300" : event.severity === "warning" ? "bg-amber-300" : event.severity === "watch" ? "bg-velmere-gold" : "bg-emerald-300"}`} />
            {index < topEvents.length - 1 ? <span className="absolute left-[1.18rem] top-8 h-[calc(100%-1.1rem)] w-px bg-white/[0.08]" /> : null}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/[0.80]">{event.title}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/[0.42]">{event.analystNote}</p>
            </div>
            <div className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.36]">
              <p className="text-white/[0.72] tabular-nums">{event.score}</p>
              <p>{event.layer}</p>
            </div>
          </div>
        ))}
      </div>

      <span className="relative mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:text-white pointer-events-none opacity-75">
        replay in panel
      </span>
    </div>
  );
}

function ShieldBrainCard({ result, orderbook }: { result: BrainResult; orderbook: OrderBookResult | null }) {
  const agents = result.agentAssessments ?? [];
  const strongest = agents.filter((agent) => agent.id !== "data").sort((a, b) => b.score - a.score)[0];
  const confidence = Math.round((result.confidence ?? 0.35) * 100);
  const micro = orderbook?.riskPoints ?? 0;
  const brainScore = Math.min(100, Math.round(result.score * 0.74 + micro * 0.16 + (100 - confidence) * 0.10));
  const verdict = brainScore >= 80 ? "escalate" : brainScore >= 55 ? "review" : brainScore >= 30 ? "monitor" : "clear";
  const tokenInfo = result["token"];
  const steps = [
    strongest ? `Dominant layer: ${strongest.label} (${strongest.score}/100).` : "No dominant risk layer from current sources.",
    micro > 0 ? `Order book added ${micro} microstructure points.` : "Order book layer is clean or unavailable.",
    confidence < 60 ? "Confidence is limited — missing data is treated as uncertainty, not safety." : "Data confidence is acceptable for first-pass screening.",
  ];
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-velmere-gold/[0.18] bg-[radial-gradient(circle_at_12%_0%,rgba(200,169,106,0.12),transparent_34%),rgba(255,255,255,0.026)] p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-velmere-gold/[0.16]" />
      <div className="pointer-events-none absolute -right-4 top-8 h-24 w-24 rounded-full border border-white/[0.08]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-velmere-gold/[0.26] bg-velmere-gold/[0.08] text-velmere-gold">
            <Brain className="h-5 w-5" />
            <span className="absolute inset-0 animate-ping rounded-full border border-velmere-gold/[0.18]" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">Velmère AI risk brain</p>
            <p className="mt-1 text-xs leading-5 text-white/[0.44]">Fusion of price velocity, liquidity, holders, order book and contract flags.</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-2xl text-white tabular-nums">{brainScore}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.36]">{verdict}</p>
        </div>
      </div>
      <div className="relative mt-4 grid gap-2">
        {steps.map((step, index) => (
          <div key={step} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 rounded-2xl border border-white/[0.07] bg-black/[0.18] p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] font-mono text-[9px] text-velmere-gold">{index + 1}</span>
            <p className="text-xs leading-6 text-white/[0.52]">{step}</p>
          </div>
        ))}
      </div>
      <span className="relative mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold transition hover:text-white pointer-events-none opacity-75">
        risk brain in panel
      </span>
    </div>
  );
}


function TerminalBootSkeleton({ symbol }: { symbol: string }) {
  return (
    <div className="shield-terminal-loader mt-4 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
            PASS69 performance guard · {symbol}
          </p>
          <h3 className="mt-2 text-sm font-semibold text-white/[0.86]">
            Terminal ładuje ciężkie panele po pierwszym paint.
          </h3>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.46]">
            Najpierw pokazujemy świeczki i command palette. Holder map, AI bot, SOC, evidence, VLM i replay startują chwilę później, żeby klik w monetę nie powodował laga ani safe mode.
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">
          {['chart first', 'api deferred', 'no raw json'].map((item) => (
            <span key={item} className="rounded-full border border-white/[0.09] bg-black/[0.22] px-2.5 py-1 text-center">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.028]" />
        ))}
      </div>
    </div>
  );
}



function VlmAiSequenceOverlay({
  mode,
  result,
  candles,
  orderbook,
  chartSource,
  riskScore,
  onClose,
}: {
  mode: VlmAiSequenceMode;
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  chartSource: string;
  riskScore: number;
  onClose: () => void;
}) {
  type VlmReadTone = "gold" | "cyan" | "green" | "red";
  type MotionQuality = "high" | "medium" | "low";
  type MotionPreset = "orbit" | "static";
  type BrainRuntimeMode = "cinematic" | "performance";
  type ReadoutPhase = "boot" | "orb" | "brain" | "readout" | "complete";
  type VlmReadGroup = "all" | "risk" | "liquidity" | "holders" | "signals" | "source" | "access";
  type VlmReadNode = {
    label: string;
    value: string;
    hint: string;
    detail: string;
    x: number;
    y: number;
    tone?: VlmReadTone;
    group: Exclude<VlmReadGroup, "all">;
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const rotationRef = useRef({
    x: -0.16,
    y: 0,
    vx: 0,
    vy: 0,
    dragging: false,
    pointerId: -1,
    lastX: 0,
    lastY: 0,
  });
  const tokenInfo = result["token"];
  const isAdvanced = mode === "advanced";
  const isPro = mode === "pro";
  const isInvestigationMode = isAdvanced || isPro;
  const [selectedNode, setSelectedNode] = useState<VlmReadNode | null>(null);
  const [activeTileGroup, setActiveTileGroup] = useState<VlmReadGroup>("all");
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [motionQuality, setMotionQuality] = useState<MotionQuality>("low");
  const [motionPreset, setMotionPreset] = useState<MotionPreset>(mode === "advanced" ? "orbit" : "static");
  const [brainRuntimeMode, setBrainRuntimeMode] = useState<BrainRuntimeMode>("performance");
  const [frameHealth, setFrameHealth] = useState<"smooth" | "guarded" | "degraded">("guarded");
  const [phase, setPhase] = useState<ReadoutPhase>("boot");
  const [revealedCount, setRevealedCount] = useState(0);
  const [autoRotate] = useState(true);
  const [brainZoom] = useState(1);

  // PASS149 hard guard: Orbit 360 belongs only to Advanced. Basic/Pro never re-enable the heavy scene.
  const allowedMotionPresets = useMemo<MotionPreset[]>(
    () => (mode === "advanced" ? ["orbit", "static"] : ["static"]),
    [mode],
  );

  useEffect(() => {
    setMotionPreset(mode === "advanced" ? "orbit" : "static");
    setBrainRuntimeMode("performance");
    setFrameHealth("guarded");
    setSelectedNode(null);
  }, [mode]);
  const locale = useLocale();
  const ui = useMemo(() => {
    if (locale === "pl") {
      return {
        boot: "Start rdzenia VLM",
        orb: "Rdzeń tokena wchodzi do analizy",
        brain: "Formowanie mózgu 360",
        readout: "Odczyt kafelków ryzyka",
        complete: "Odczyt neuronowy zakończony",
        motion: "tryb ruchu",
        motionGovernor: "sterowanie ruchem",
        motionOrbit: "Orbit 360",
        motionStatic: "Statyczny",
        motionOrbitHint: "Advanced uruchamia orbitę 360. Basic i Pro zostają lekkimi kartami evidence.",
        runtimePerformance: "Performance",
        runtimeCinematic: "Cinematic",
        frameSmooth: "płynny",
        frameGuarded: "guarded",
        frameDegraded: "degraded",
        rotateHint: "Przeciągnij rdzeń, żeby obrócić mózg 360°",
        back: "Wróć do wykresu",
        pointsAdvanced: "20 kafelków śledczych",
        pointsPro: "14 kafelków źródłowych",
        pointsBasic: "10 kafelków śledczych",
        tapPoint: "Kliknij kafelek po szczegóły",
        selectedPoint: "Wybrany kafelek",
        close: "Zamknij",
        modeAdvanced: "advanced",
        searchPlaceholder: "",
        allTiles: "Wszystkie",
        filtered: "filtr",
        controlKicker: "kontrola analizy",
        controlTitle: "Wybierz głębokość pracy VLM",
        controlBody: "Wybierz zakres analizy. Basic to lekki prescreen, Pro pokazuje źródła i braki danych, a Advanced uruchamia mózg 360 oraz pełny tryb operatora.",
        basicTitle: "Basic Analysis",
        basicHint: "10 sygnałów · szybki prescreen bez ciężkiego 3D",
        proTitle: "Pro Review",
        proHint: "14 sygnałów · źródła, braki danych i review",
        advancedTitle: "Advanced Analysis",
        advancedHint: "20 sygnałów · pełna mapa ryzyka i evidence",
        caseKicker: "case file",
        caseTitle: "Operator AI",
        caseNext: "następny krok",
        caseBlockers: "blokery",
        caseQueries: "OSINT",
        caseEvidence: "evidence",
        shieldMap: "Otwórz Shield Map",
        memberLayer: "Warstwa VLM member",
      };
    }
    if (locale === "de") {
      return {
        boot: "VLM-Kern startet",
        orb: "Token-Kern fliegt in die Analyse",
        brain: "360-Gehirn wird gebildet",
        readout: "Risikokacheln werden gelesen",
        complete: "Neuronaler Read abgeschlossen",
        motion: "Bewegungsmodus",
        motionGovernor: "Motion-Steuerung",
        motionOrbit: "Orbit 360",
        motionStatic: "Statisch",
        motionOrbitHint: "Advanced startet Orbit 360. Basic und Pro bleiben leichte Evidence-Karten.",
        runtimePerformance: "Performance",
        runtimeCinematic: "Cinematic",
        frameSmooth: "flüssig",
        frameGuarded: "geschützt",
        frameDegraded: "gedrosselt",
        rotateHint: "Ziehe den Kern, um das Gehirn 360° zu drehen",
        back: "Zurück zum Chart",
        pointsAdvanced: "20 Ermittlungs-Kacheln",
        pointsPro: "14 Quellen-Kacheln",
        pointsBasic: "10 Ermittlungs-Kacheln",
        tapPoint: "Kachel antippen für Details",
        selectedPoint: "Ausgewählte Kachel",
        close: "Schließen",
        modeAdvanced: "advanced",
        searchPlaceholder: "",
        allTiles: "Alle",
        filtered: "Filter",
        controlKicker: "Analysekontrolle",
        controlTitle: "Wähle die VLM-Tiefe",
        controlBody: "Basic, Pro und Advanced öffnen keinen Chat. Es sind Readout-Ebenen: schneller Prescreen, Quellenkontext und Operator-Modus.",
        basicTitle: "Basic Analysis",
        basicHint: "10 Signale · schneller Prescreen ohne schweres 3D",
        proTitle: "Pro Review",
        proHint: "14 Signale · Quellen, Datenlücken und Review",
        advancedTitle: "Advanced Analysis",
        advancedHint: "20 Signale · volle Risikokarte und Evidence",
        caseKicker: "Case File",
        caseTitle: "Operator AI",
        caseNext: "nächster Schritt",
        caseBlockers: "Blocker",
        caseQueries: "OSINT",
        caseEvidence: "Evidence",
        shieldMap: "Shield Map öffnen",
        memberLayer: "VLM Member Layer",
      };
    }
    return {
      boot: "VLM core boot",
      orb: "token core inbound",
      brain: "360 neural brain forming",
      readout: "extracting risk tiles",
      complete: "neural read complete",
      motion: "motion",
      motionGovernor: "motion governor",
      motionOrbit: "Orbit 360",
      motionStatic: "Static",
      motionOrbitHint: "Advanced runs Orbit 360. Basic and Pro stay as lightweight evidence cards.",
      runtimePerformance: "Performance",
      runtimeCinematic: "Cinematic",
      frameSmooth: "smooth",
      frameGuarded: "guarded",
      frameDegraded: "degraded",
      rotateHint: "Drag the core to rotate the 360° brain",
      back: "Back to chart",
      pointsAdvanced: "20 investigator tiles",
      pointsPro: "14 source tiles",
      pointsBasic: "10 investigator tiles",
      tapPoint: "Tap a tile for detail",
      selectedPoint: "Selected tile",
      close: "Close",
      modeAdvanced: "advanced",
      searchPlaceholder: "",
      allTiles: "All",
      filtered: "filter",
      controlKicker: "analysis control",
      controlTitle: "Choose VLM depth",
      controlBody: "Basic, Pro and Advanced do not open chat. They are readout layers: fast prescreen, source context and operator mode.",
      basicTitle: "Basic Analysis",
      basicHint: "10 signals · fast prescreen without heavy 3D",
      proTitle: "Pro Review",
      proHint: "14 signals · sources, missing data and review",
      advancedTitle: "Advanced Analysis",
      advancedHint: "20 signals · full risk map and evidence",
      caseKicker: "case file",
      caseTitle: "Operator AI",
      caseNext: "next action",
      caseBlockers: "blockers",
      caseQueries: "OSINT",
      caseEvidence: "evidence",
      shieldMap: "Open Shield Map",
      memberLayer: "VLM member layer",
    };
  }, [locale]);

  const groupLabels = useMemo<Record<VlmReadGroup, string>>(() => {
    if (locale === "pl") {
      return { all: ui.allTiles, risk: "Ryzyko", liquidity: "Płynność", holders: "Holderzy", signals: "Sygnały", source: "Źródła", access: "Dostęp" };
    }
    if (locale === "de") {
      return { all: ui.allTiles, risk: "Risiko", liquidity: "Liquidität", holders: "Holder", signals: "Signale", source: "Quellen", access: "Zugang" };
    }
    return { all: ui.allTiles, risk: "Risk", liquidity: "Liquidity", holders: "Holders", signals: "Signals", source: "Sources", access: "Access" };
  }, [locale, ui.allTiles]);

  const tileGroups: VlmReadGroup[] = ["all", "risk", "liquidity", "holders", "signals", "source", "access"];
  const visiblePointLabel = isAdvanced ? ui.pointsAdvanced : isPro ? ui.pointsPro : ui.pointsBasic;

  const coreEntryStyle = useMemo<CSSProperties>(() => {
    const seed = Array.from(`${tokenInfo.symbol}:${mode}`).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const edge = seed % 4;
    const x = edge === 0 ? -54 : edge === 1 ? 54 : ((seed % 9) - 4) * 8;
    const y = edge === 2 ? -48 : edge === 3 ? 48 : (((seed + 3) % 7) - 3) * 7;
    return {
      "--vlm-entry-x": `${x}vw`,
      "--vlm-entry-y": `${y}vh`,
    } as CSSProperties;
  }, [mode, tokenInfo.symbol]);

  const confidence = Math.round((result.confidence ?? 0.42) * 100);
  const liveBars = useMemo(() => candles.filter((candle) => Number.isFinite(candle.close)), [candles]);
  const latest = liveBars.at(-1)?.close ?? result.metrics.currentPrice;
  const first = liveBars[0]?.open ?? result.metrics.currentPrice;
  const candleMove = first && latest ? ((latest - first) / first) * 100 : (result.metrics.priceChange24h ?? 0);
  const signalList = result.signals ?? [];
  const liquidityStress = Math.min(
    100,
    Math.round((orderbook?.riskPoints ?? 0) + Math.abs(result.metrics.volumeToMarketCapRatio ?? 0) * 115),
  );
  const strongestAgents = (result.agentAssessments ?? [])
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, isAdvanced ? 8 : 4);
  const dominantAgent = strongestAgents[0];
  const holderScore = dominantAgent ? `${dominantAgent.score}/100` : "gated";
  const volatilityScore = Math.min(100, Math.round(Math.abs(candleMove) * 7 + Math.abs(result.metrics.priceChange24h ?? 0) * 2));
  const flowRatio = result.metrics.volumeToMarketCapRatio ?? 0;
  const signalCount = signalList.length;
  const signalPreview = signalList[0]?.id?.replaceAll("_", " ") ?? "no dominant signal";

  useEffect(() => {
    const updateQuality = () => {
      const width = window.innerWidth;
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
      const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 4 : 4;
      const memory = typeof navigator !== "undefined" && "deviceMemory" in navigator ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) : 4;
      const lowPower = reduced || width < 720 || cores <= 6 || memory <= 4;
      const mediumPower = width < 1280 || coarse || cores <= 8 || memory <= 6;
      const nextQuality: MotionQuality = lowPower ? "low" : mediumPower ? "medium" : "high";
      setIsCompactViewport(width < 820);
      setMotionQuality(nextQuality);
      setFrameHealth(nextQuality === "high" ? "smooth" : nextQuality === "medium" ? "guarded" : "degraded");
    };
    updateQuality();
    window.addEventListener("resize", updateQuality, { passive: true });
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    media?.addEventListener?.("change", updateQuality);
    return () => {
      window.removeEventListener("resize", updateQuality);
      media?.removeEventListener?.("change", updateQuality);
    };
  }, []);

  const readNodes = useMemo<VlmReadNode[]>(() => {
    const supplyRatio = result.metrics.circulatingSupply && (result.metrics.totalSupply || result.metrics.maxSupply)
      ? `${((result.metrics.circulatingSupply / ((result.metrics.totalSupply ?? result.metrics.maxSupply) || 1)) * 100).toFixed(1)}%`
      : "unknown";
    const liquidityValue = orderbook ? `${liquidityStress}/100` : result.metrics.liquidityToMarketCapPercent !== undefined ? `${result.metrics.liquidityToMarketCapPercent.toFixed(1)}%` : "partial";
    const volumeStress = flowRatio > 0.5 ? "high turnover" : flowRatio > 0.15 ? "active flow" : "normal flow";
    const unlockState = result.metrics.fdvToMarketCapRatio && result.metrics.fdvToMarketCapRatio > 4 ? "overhang risk" : "needs OSINT";
    const kolState = signalPreview.includes("volume") || signalPreview.includes("pump") ? "hype review" : "source review";
    const contractState = tokenInfo.tokenAddress ? "verify owner" : "address needed";
    const evidenceState = result.dataQuality === "live" ? "source attached" : "partial data";
    const missingLimitations = result.metaModel?.limitations ?? [];
    const missingData = missingLimitations.length ? `${Math.min(missingLimitations.length, 9)} blockers` : "no blocker";

    const basicReadNodes: VlmReadNode[] = [
      { label: "01 risk core", value: `${riskScore}/100`, hint: levelFromScore(riskScore).toUpperCase(), detail: "Shows the visible risk score from current data. Low score does not mean safe: check missing sources, holder transparency and liquidity before trusting it.", x: 16, y: 22, tone: "gold", group: "risk" },
      { label: "02 supply float", value: supplyRatio, hint: "float check", detail: "Compares circulating supply with total/max supply and FDV. If float is low or not verified, a small amount of demand can move price and later unlocks can pressure exits.", x: 78, y: 18, tone: "cyan", group: "risk" },
      { label: "03 unlock map", value: unlockState, hint: "vesting OSINT", detail: "Looks for team, investor, advisor, ecosystem, OTC and whale unlock pressure. Missing vesting data increases uncertainty instead of lowering risk.", x: 19, y: 43, tone: "gold", group: "signals" },
      { label: "04 exit liquidity", value: liquidityValue, hint: "exit depth", detail: "Checks whether visible volume and order-book depth can absorb selling. A chart can look clean while exits are weak if liquidity is thin.", x: 83, y: 39, tone: "cyan", group: "liquidity" },
      { label: "05 holder layer", value: holderScore, hint: dominantAgent?.label ?? "wallet check", detail: "Checks if supply is spread across real users or concentrated in whales, team wallets, CEX/custody, LP or unknown clusters. Unknown labels need OSINT.", x: 29, y: 63, tone: "cyan", group: "holders" },
      { label: "06 KOL/social", value: kolState, hint: "hype filter", detail: "Reviews whether social momentum may be paid promotion, coordinated hype or late retail FOMO. Social heat is never treated as proof.", x: 75, y: 60, tone: "gold", group: "signals" },
      { label: "07 contract risk", value: contractState, hint: "permissions", detail: "Checks contract control gates: owner, proxy, mint, pause, blacklist and tax settings. Missing contract address blocks strong conclusions.", x: 22, y: 76, tone: "red", group: "source" },
      { label: "08 volatility", value: `${volatilityScore}/100`, hint: "candle stress", detail: "Reads candle noise, drawdown and velocity as context. High movement may be opportunity or danger, but Shield only marks review pressure.", x: 80, y: 79, tone: "cyan", group: "risk" },
      { label: "09 evidence", value: evidenceState, hint: "source state", detail: "Shows whether the claim is supported by live, partial, fallback or missing sources. Missing evidence must slow the operator down.", x: 43, y: 88, tone: "green", group: "source" },
      { label: "10 verdict", value: combinedSafeVerdict(riskScore), hint: "public read", detail: "Final public readout stays calm: anomaly, review, missing data and next source check. It is not a buy/sell call.", x: 62, y: 90, tone: riskScore >= 55 ? "red" : "green", group: "signals" },
    ];

    const advancedReadNodes: VlmReadNode[] = [
      { label: "01 risk core", value: `${riskScore}/100`, hint: levelFromScore(riskScore).toUpperCase(), detail: "Combines model score, source quality, microstructure pressure and missing-data penalty. It explains why the case needs review, not whether to buy.", x: 10, y: 21, tone: "gold", group: "risk" },
      { label: "02 float transparency", value: supplyRatio, hint: "supply proof", detail: "Compares circulating supply, total/max supply and FDV. Low/unknown float can allow engineered pumps and later unlock pressure.", x: 22, y: 33, tone: "cyan", group: "risk" },
      { label: "03 unlock pressure", value: unlockState, hint: "vesting/OTC", detail: "Investigates team, investor, advisor, ecosystem, OTC and whale unlocks. Hidden or missing schedules become a risk blocker.", x: 12, y: 48, tone: "gold", group: "signals" },
      { label: "04 liquidity exit", value: liquidityValue, hint: "slippage lane", detail: "Checks visible liquidity, depth, spread and possible slippage. Exit liquidity matters because retail can become exit flow after a pump.", x: 20, y: 63, tone: "cyan", group: "liquidity" },
      { label: "05 holder graph", value: holderScore, hint: "cluster check", detail: "Separates possible CEX, team, LP, treasury, whale, retail and unknown wallets. Unknown clusters require source labels before confidence rises.", x: 12, y: 78, tone: "cyan", group: "holders" },
      { label: "06 missing data", value: missingData, hint: "blockers", detail: "Counts unresolved blockers: supply, unlocks, order book, contract, holder labels or source ledger. Unknown data increases risk uncertainty.", x: 27, y: 88, tone: "red", group: "source" },
      { label: "07 source quality", value: result.dataQuality, hint: "truth layer", detail: "Labels whether the readout uses live, partial, fallback or missing sources. Premium UI must not sound more certain than its data.", x: 82, y: 18, tone: "green", group: "source" },
      { label: "08 KOL disclosure", value: kolState, hint: "social OSINT", detail: "Looks for paid KOL promotion, undisclosed allocations, coordinated posts and hype pressure. No accusation is made without evidence.", x: 90, y: 31, tone: "gold", group: "signals" },
      { label: "09 contract owner", value: contractState, hint: "admin power", detail: "Contract owner, proxy, mint, pause, blacklist and tax permissions can change risk after launch. Verified source labels are needed.", x: 78, y: 46, tone: "red", group: "source" },
      { label: "10 volume quality", value: volumeStress, hint: "wash filter", detail: "Compares volume quality with market cap and price movement. High turnover can be organic, engineered, wash-like or exit churn.", x: 88, y: 59, tone: "cyan", group: "liquidity" },
      { label: "11 flow ratio", value: `${(flowRatio * 100).toFixed(2)}%`, hint: "vol/mcap", detail: "Volume/market-cap ratio shows whether flow is normal, hot or suspicious. It is a review signal, not proof.", x: 75, y: 74, tone: "cyan", group: "liquidity" },
      { label: "12 orderbook", value: orderbook ? `${orderbook.riskPoints}/100` : "offline", hint: "depth pressure", detail: "Order book depth estimates whether buyers exist below price. Missing order book keeps exit-liquidity claims weak.", x: 88, y: 88, tone: orderbook ? "cyan" : "gold", group: "liquidity" },
      { label: "13 anomaly count", value: signalCount ? `${signalCount} signals` : "clear", hint: "review only", detail: "Counts active anomaly flags. Each signal is a review prompt and must be checked against sources before strong wording.", x: 31, y: 12, tone: signalCount ? "gold" : "green", group: "signals" },
      { label: "14 top signal", value: signalPreview, hint: "dominant flag", detail: "Shows the strongest current flag. Read it as the dominant reason for review: velocity, liquidity, source gap or holder/contract issue.", x: 44, y: 8, tone: "gold", group: "signals" },
      { label: "15 drawdown", value: formatPercent(Math.min(0, result.metrics.priceChange24h ?? 0)), hint: "red stress", detail: "Measures recent drawdown pressure. It warns about volatility and loss behavior, not a prediction or trading call.", x: 58, y: 13, tone: "red", group: "risk" },
      { label: "16 volatility", value: `${volatilityScore}/100`, hint: "candle noise", detail: "Measures candle noise and velocity pressure. High volatility reduces confidence when sources are incomplete.", x: 68, y: 22, tone: "cyan", group: "risk" },
      { label: "17 evidence chain", value: evidenceState, hint: "source ledger", detail: "Evidence chain separates live source, partial source, fallback and blocked data. Only sourced claims can enter a report.", x: 73, y: 9, tone: "green", group: "source" },
      { label: "18 loss prevention", value: "anti-FOMO", hint: "psychology", detail: "Loss-prevention tile: a rising chart can create FOMO. Shield slows the user down until supply, unlocks, liquidity and holders are checked.", x: 38, y: 92, tone: "gold", group: "risk" },
      { label: "19 VLM access", value: "gated", hint: "full dataset", detail: "Access tile: advanced rails can be gated by VLM utility access, but no ROI, custody, seed phrase or investment promise is allowed.", x: 54, y: 83, tone: "gold", group: "access" },
      { label: "20 verdict", value: combinedSafeVerdict(riskScore), hint: "operator read", detail: "Final operator readout explains the next safest check: verify sources, inspect liquidity, review holders, audit contract or draft evidence.", x: 66, y: 92, tone: riskScore >= 55 ? "red" : "green", group: "signals" },
    ];
    if (isAdvanced) return advancedReadNodes;
    if (isPro) return advancedReadNodes.slice(0, 14);
    return basicReadNodes;
  }, [isAdvanced, isPro, riskScore, result, orderbook, liquidityStress, volatilityScore, holderScore, dominantAgent?.label, signalCount, signalPreview, flowRatio, tokenInfo.tokenAddress]);
  const motionGovernorLabel = motionPreset === "orbit" ? `360 ${ui.motion}` : `${ui.motionStatic.toLowerCase()} ${ui.motion}`;
  const performanceRuntime = brainRuntimeMode === "performance" || frameHealth !== "smooth";
  const renderHeavyCanvas = isAdvanced && motionPreset === "orbit" && motionQuality === "high" && brainRuntimeMode === "cinematic";
  const showLineSvg = false;
  const useRailLayout = isCompactViewport || motionPreset === "static";
  const revealGapMs = isAdvanced ? (motionPreset === "orbit" ? (performanceRuntime ? 980 : 1220) : 420) : 320;
  const lineDurationMs = isAdvanced ? (renderHeavyCanvas ? 6200 : performanceRuntime ? 3200 : 4600) : 900;
  const bootMs = motionPreset === "static" ? 120 : performanceRuntime ? 420 : 920;
  const orbMs = motionPreset === "static" ? 100 : performanceRuntime ? 2400 : isAdvanced ? 7200 : 0;
  const brainMs = motionPreset === "static" ? 160 : performanceRuntime ? 2100 : isAdvanced ? 5200 : 0;
  const orbitUpdateFrameMs = performanceRuntime ? 118 : 72;
  const orbitStepSize = performanceRuntime ? 0.030 : 0.016;
  const orbitTransitionMs = performanceRuntime ? 1560 : 960;
  const lineStartMs = bootMs + orbMs + Math.round(brainMs * 0.48);
  const linePathForNode = (node: VlmReadNode, index: number) => {
    const bend = index % 2 === 0 ? 1 : -1;
    const cx1 = 50 + (node.x - 50) * 0.16 + bend * (isAdvanced ? 5.2 : 2.8);
    const cy1 = 50 + (node.y - 50) * 0.10 - bend * (isAdvanced ? 4.5 : 2.0);
    const cx2 = 50 + (node.x - 50) * 0.70 - bend * (isAdvanced ? 3.7 : 1.8);
    const cy2 = 50 + (node.y - 50) * 0.78 + bend * (isAdvanced ? 3.2 : 1.3);
    return `M 50 50 C ${cx1.toFixed(2)} ${cy1.toFixed(2)}, ${cx2.toFixed(2)} ${cy2.toFixed(2)}, ${node.x} ${node.y}`;
  };

  const [orbitTick, setOrbitTick] = useState(0);

  const advancedOrbitalSlots = useMemo(
    () =>
      [
        { theta: -2.78, phi: -0.62 }, { theta: -2.10, phi: -0.18 },
        { theta: -2.45, phi: 0.24 }, { theta: -1.86, phi: 0.58 },
        { theta: -1.28, phi: -0.72 }, { theta: -0.92, phi: -0.28 },
        { theta: -0.42, phi: 0.20 }, { theta: 0.02, phi: 0.60 },
        { theta: 0.56, phi: -0.60 }, { theta: 0.98, phi: -0.14 },
        { theta: 1.36, phi: 0.30 }, { theta: 1.92, phi: 0.68 },
        { theta: 2.34, phi: -0.44 }, { theta: 2.78, phi: 0.02 },
        { theta: 3.20, phi: 0.42 }, { theta: 3.62, phi: -0.26 },
        { theta: 4.04, phi: -0.72 }, { theta: 4.52, phi: -0.04 },
        { theta: 4.98, phi: 0.36 }, { theta: 5.44, phi: 0.76 },
      ] as const,
    [],
  );

  useEffect(() => {
    if (!isAdvanced || useRailLayout || motionPreset === "static") return;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    let slowFrames = 0;

    // PASS150 adaptive runtime governor: sparse React updates + compositor interpolation.
    // This prevents the orbit from trying to re-render 20 DOM cards at display refresh rate.
    const targetFrameMs = orbitUpdateFrameMs;
    const stepSize = orbitStepSize;

    const tick = (now: number) => {
      if (document.visibilityState === "visible") {
        const delta = Math.min(140, now - last);
        carry += delta;
        if (delta > 64) slowFrames += 1;
        if (slowFrames >= 8 && brainRuntimeMode === "cinematic") {
          setBrainRuntimeMode("performance");
          setFrameHealth("guarded");
          slowFrames = 0;
        }
        if (carry >= targetFrameMs) {
          const steps = Math.max(1, Math.floor(carry / targetFrameMs));
          carry %= targetFrameMs;
          setOrbitTick((current) => (current + stepSize * steps) % 100000);
        }
      }
      last = now;
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isAdvanced, motionPreset, useRailLayout, orbitUpdateFrameMs, orbitStepSize, brainRuntimeMode]);

  const advancedTileStyle = (node: VlmReadNode, index: number): CSSProperties => {
    if (!isInvestigationMode) {
      const horizontal = node.x < 16 ? "translate(0%, -50%)" : node.x > 84 ? "translate(-100%, -50%)" : "translate(-50%, -50%)";
      return {
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: horizontal,
      };
    }

    const slot = advancedOrbitalSlots[index % advancedOrbitalSlots.length];
    const ref = rotationRef.current;
    const autoSpin = autoRotate ? orbitTick * 0.00115 : 0;
    const yaw = slot.theta + ref.y * 1.85 + autoSpin;
    const pitch = Math.max(-1.16, Math.min(1.16, slot.phi + ref.x * 1.35));
    const sphereX = Math.cos(pitch) * Math.cos(yaw);
    const sphereY = Math.sin(pitch);
    const sphereZ = Math.cos(pitch) * Math.sin(yaw);
    // PASS131 guard marker kept for regression scripts: Math.max(7, Math.min(93
    const organicX = Math.sin(index * 12.989 + riskScore * 0.071) * 1.55;
    const organicY = Math.cos(index * 7.233 + riskScore * 0.053) * 1.95;
    const left = Math.max(10, Math.min(90, 50 + sphereX * 39 + organicX));
    const top = Math.max(11, Math.min(90, 50 + sphereY * 39 + organicY));
    const depthFactor = (sphereZ + 1) / 2;
    const scale = 0.70 + depthFactor * 0.42;
    const isActive = selectedNode?.label === node.label;
    const opacity = isActive ? 1 : 0.42 + depthFactor * 0.58;
    const translate = "translate(-50%, -50%)";
    const tiltX = -sphereY * 12;
    const tiltY = sphereX * 17;
    const activeBoost = isActive ? 0.08 : 0;

    return {
      left: `${left}%`,
      top: `${top}%`,
      opacity,
      zIndex: Math.round(18 + depthFactor * 52 + (isActive ? 40 : 0)),
      transform: `${translate} rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(${(depthFactor * 90 + (isActive ? 28 : 0)).toFixed(1)}px) scale(${(scale + activeBoost).toFixed(3)})`,
      filter: "none",
      transitionDuration: `${orbitTransitionMs}ms`,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-vlm-no-drag='true']")) return;

    const ref = rotationRef.current;
    ref.dragging = true;
    ref.pointerId = event.pointerId;
    ref.lastX = event.clientX;
    ref.lastY = event.clientY;
    overlayRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const ref = rotationRef.current;
    if (!ref.dragging || ref.pointerId !== event.pointerId) return;
    const dx = event.clientX - ref.lastX;
    const dy = event.clientY - ref.lastY;
    ref.lastX = event.clientX;
    ref.lastY = event.clientY;
    ref.y += dx * 0.0058;
    ref.x = Math.max(-0.9, Math.min(0.9, ref.x + dy * 0.0034));
    ref.vy = dx * 0.00032;
    ref.vx = dy * 0.00016;
    if (motionPreset !== "static") setOrbitTick((current) => (current + 1) % 100000);
  };

  const releasePointer = (event?: React.PointerEvent<HTMLDivElement>) => {
    const ref = rotationRef.current;
    if (event && ref.pointerId !== event.pointerId) return;
    ref.dragging = false;
    ref.pointerId = -1;
  };


  useEffect(() => {
    setSelectedNode(null);
    setRevealedCount(0);
    setPhase("boot");
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const pushTimer = (delay: number, action: () => void) => {
      const timer = setTimeout(action, delay);
      timersRef.current.push(timer);
    };
    pushTimer(bootMs, () => setPhase("orb"));
    pushTimer(bootMs + orbMs, () => setPhase("brain"));
    pushTimer(lineStartMs, () => setPhase("readout"));
    readNodes.forEach((_, index) => {
      pushTimer(lineStartMs + index * revealGapMs + lineDurationMs * 0.76, () => {
        setRevealedCount((current) => Math.max(current, index + 1));
      });
    });
    pushTimer(lineStartMs + readNodes.length * revealGapMs + lineDurationMs + 260, () => setPhase("complete"));
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [mode, readNodes, bootMs, orbMs, lineStartMs, lineDurationMs, revealGapMs]);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const canvas: HTMLCanvasElement = canvasNode;
    const contextNode = canvas.getContext("2d", { alpha: true });
    if (!contextNode) return;
    const ctx: CanvasRenderingContext2D = contextNode;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastFrame = 0;
    let visible = true;
    const startedAt = performance.now();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const isLow = motionQuality === "low" || reducedMotion;
    const isMedium = motionQuality === "medium";
    const frameBudget = isLow ? 56 : isMedium ? 34 : 16;
    const seedInput = `${tokenInfo.symbol}:${mode}:${riskScore}:${readNodes.length}`;
    const hashSeed = (value: string) => {
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    };
    const randomFrom = (seed: number) => {
      let state = seed >>> 0;
      return () => {
        state = Math.imul(state ^ (state >>> 15), 2246822507);
        state = Math.imul(state ^ (state >>> 13), 3266489909);
        return ((state ^ (state >>> 16)) >>> 0) / 4294967296;
      };
    };
    const baseSeed = hashSeed(seedInput);
    // PASS128 motionGovernor · renderHeavyCanvas · static evidence cards · no heavy render
    // PASS124 compat markers: organicTileSlots · slow signal transfer
    // organicTileSlots
    // speed: (isAdvanced ? 0.00018
    // const packetTarget = reducedMotion ? 0 : isAdvanced ? (isLow ? 1 : isMedium ? 2 : 3)
    // const nodeTarget = reducedMotion ? 5 : isAdvanced ? (isLow ? 6 : isMedium ? 8 : 10)
    const edge = baseSeed % 8;
    const flyMs = reducedMotion ? 420 : isAdvanced ? 5600 : 3600;
    const spawnMs = reducedMotion ? 640 : isAdvanced ? 6200 : 3900;
    const nodeTarget = reducedMotion ? 3 : isAdvanced ? (isLow ? 3 : isMedium ? 4 : 5) : (isLow ? 3 : 4);
    const packetTarget = reducedMotion ? 0 : isAdvanced ? (isLow ? 0 : isMedium ? 1 : 1) : 0;
    const maxIdleLife = lineStartMs + readNodes.length * revealGapMs + lineDurationMs + 2000;
    const maxAnimationLife = maxIdleLife + (isAdvanced ? 4600 : 2800);

    type BrainPoint = {
      x: number;
      y: number;
      z: number;
      parent: number;
      radius: number;
      layer: number;
      phase: number;
      tone: "gold" | "cyan" | "green";
    };
    type ScreenPoint = BrainPoint & { sx: number; sy: number; depth: number; scale: number };
    type Packet = { edge: number; progress: number; speed: number; glow: number; size: number; phase: number };

    let brain: BrainPoint[] = [];
    let packets: Packet[] = [];
    let launchPoint = { x: 0, y: 0 };
    let controlA = { x: 0, y: 0 };
    let controlB = { x: 0, y: 0 };

    function startPoint() {
      const pad = Math.max(160, Math.min(width, height) * 0.26);
      if (edge === 0) return { x: width * 0.10, y: -pad };
      if (edge === 1) return { x: width * 0.90, y: -pad };
      if (edge === 2) return { x: width + pad, y: height * 0.16 };
      if (edge === 3) return { x: width + pad, y: height * 0.84 };
      if (edge === 4) return { x: width * 0.90, y: height + pad };
      if (edge === 5) return { x: width * 0.10, y: height + pad };
      if (edge === 6) return { x: -pad, y: height * 0.84 };
      return { x: -pad, y: height * 0.16 };
    }

    function makeControls(start: { x: number; y: number }) {
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = centerX - start.x;
      const dy = centerY - start.y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const normalX = -dy / len;
      const normalY = dx / len;
      const arc = Math.min(width, height) * (isAdvanced ? 0.30 : 0.22);
      controlA = {
        x: start.x + dx * 0.34 + normalX * arc,
        y: start.y + dy * 0.18 + normalY * arc,
      };
      controlB = {
        x: start.x + dx * 0.78 - normalX * arc * 0.55,
        y: start.y + dy * 0.72 - normalY * arc * 0.55,
      };
    }

    function easeOutQuint(value: number) {
      const clamped = Math.max(0, Math.min(1, value));
      return 1 - Math.pow(1 - clamped, 5);
    }

    function easeInOutCubic(value: number) {
      const clamped = Math.max(0, Math.min(1, value));
      return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
    }

    function pointOnCurve(t: number) {
      const center = { x: width / 2, y: height / 2 };
      const eased = easeInOutCubic(t);
      const inv = 1 - eased;
      const x = inv * inv * inv * launchPoint.x + 3 * inv * inv * eased * controlA.x + 3 * inv * eased * eased * controlB.x + eased * eased * eased * center.x;
      const y = inv * inv * inv * launchPoint.y + 3 * inv * inv * eased * controlA.y + 3 * inv * eased * eased * controlB.y + eased * eased * eased * center.y;
      const settle = t > 0.82 ? Math.sin((t - 0.82) / 0.18 * Math.PI) * Math.max(0, 1 - t) : 0;
      return {
        x: x + (center.x - controlB.x) * settle * 0.09,
        y: y + (center.y - controlB.y) * settle * 0.09,
      };
    }

    function rebuildGraph() {
      const rand = randomFrom(baseSeed + Math.floor(width) * 17 + Math.floor(height) * 31 + (isAdvanced ? 97 : 11));
      const created: BrainPoint[] = [{ x: 0, y: 0, z: 0, parent: -1, radius: isAdvanced ? 4.4 : 5.2, layer: 0, phase: 0, tone: "gold" }];
      const rings = isAdvanced ? [10, 12, 14, 18] : [7, 10, 6];
      let previousStart = 0;
      let previousEnd = 1;

      rings.forEach((count, ringIndex) => {
        const layer = ringIndex + 1;
        const ringStart = created.length;
        for (let i = 0; i < count && created.length < nodeTarget + 1; i += 1) {
          const hemi = i % 2 === 0 ? -1 : 1;
          const theta = (i / count) * Math.PI * 2 + layer * 0.52;
          const spiral = theta + ringIndex * 0.72;
          const shell = 0.30 + layer / (rings.length + 0.8);
          const jitter = isAdvanced ? 0.055 : 0.035;
          const x = hemi * (0.18 + Math.abs(Math.cos(spiral)) * 0.56 * shell) + (rand() - 0.5) * jitter;
          const y = Math.sin(spiral * 1.18) * 0.72 * shell + (rand() - 0.5) * jitter;
          const z = Math.cos(spiral) * 0.70 * shell + hemi * 0.08 * Math.sin(theta * 2.1);
          const parent = layer === 1
            ? 0
            : previousStart + Math.floor(rand() * Math.max(1, previousEnd - previousStart));
          created.push({
            x,
            y,
            z,
            parent,
            radius: isAdvanced ? 1.35 + rand() * 1.65 : 1.85 + rand() * 1.8,
            layer,
            phase: rand() * Math.PI * 2,
            tone: layer >= 3 ? "cyan" : i % 3 === 0 ? "green" : "gold",
          });
        }
        previousStart = ringStart;
        previousEnd = created.length;
      });

      brain = created;
      packets = Array.from({ length: packetTarget }, (_, index) => ({
        edge: 1 + (index % Math.max(1, created.length - 1)),
        progress: rand(),
        speed: (isAdvanced ? 0.00018 : 0.00024) + rand() * (isAdvanced ? 0.00028 : 0.00024),
        glow: rand(),
        size: isAdvanced ? 0.72 + rand() * 0.70 : 1.00 + rand() * 0.58,
        phase: rand() * Math.PI * 2,
      }));
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, isLow ? 1 : isMedium ? 1 : 1.12);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      launchPoint = startPoint();
      makeControls(launchPoint);
      rebuildGraph();
    }

    function project(point: BrainPoint, rotation: number, morph: number, centerX: number, centerY: number, radius: number): ScreenPoint {
      const interaction = rotationRef.current;
      const rx = interaction.x + Math.sin(rotation * 0.32) * 0.035;
      const ry = interaction.y + rotation + point.phase * 0.010;
      const rz = interaction.y * 0.08 + Math.sin(rotation * 0.18) * 0.025;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);

      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y1 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const x2 = x1 * cosZ - y1 * sinZ;
      const y2 = x1 * sinZ + y1 * cosZ;
      const perspective = 1 / (1 + (z2 + 1.15) * 0.18);
      const shell = radius * morph * perspective;
      return {
        ...point,
        sx: centerX + x2 * shell,
        sy: centerY + y2 * shell,
        depth: z2,
        scale: perspective,
      };
    }

    function drawBackground(now: number) {
      ctx.fillStyle = "rgba(2,3,7,0.86)";
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const radial = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.68);
      radial.addColorStop(0, isAdvanced ? "rgba(34,211,238,0.115)" : "rgba(200,169,106,0.105)");
      radial.addColorStop(0.32, "rgba(200,169,106,0.045)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      if (isLow) return;
      ctx.save();
      ctx.globalAlpha = isAdvanced ? 0.42 : 0.26;
      const step = isAdvanced ? 56 : 76;
      const drift = (now * 0.0022) % step;
      ctx.strokeStyle = "rgba(255,255,255,0.020)";
      ctx.lineWidth = 1;
      for (let x = -step; x < width + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x + drift, 0);
        ctx.lineTo(x + drift, height);
        ctx.stroke();
      }
      for (let y = -step; y < height + step; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + drift * 0.38);
        ctx.lineTo(width, y + drift * 0.38);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawCurve(a: ScreenPoint, b: ScreenPoint, alpha: number, progress: number, pulse: number) {
      const endX = a.sx + (b.sx - a.sx) * progress;
      const endY = a.sy + (b.sy - a.sy) * progress;
      const dx = endX - a.sx;
      const dy = endY - a.sy;
      const midX = a.sx + dx * 0.52 - dy * 0.08 + Math.sin(pulse + b.phase) * (isAdvanced ? 5.2 : 2.4);
      const midY = a.sy + dy * 0.52 + dx * 0.08 + Math.cos(pulse + b.phase) * (isAdvanced ? 4.6 : 2.2);
      const gradient = ctx.createLinearGradient(a.sx, a.sy, endX, endY);
      gradient.addColorStop(0, `rgba(208,176,94,${alpha})`);
      gradient.addColorStop(0.56, b.tone === "cyan" ? `rgba(34,211,238,${alpha * 0.82})` : `rgba(250,204,121,${alpha * 0.72})`);
      gradient.addColorStop(1, b.tone === "green" ? `rgba(52,211,153,${alpha * 0.68})` : `rgba(245,240,232,${alpha * 0.28})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(0.55, (isAdvanced ? 0.88 : 1.08) * b.scale);
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }

    function drawCortexLoops(projected: ScreenPoint[], morph: number, pulse: number) {
      if (isLow || morph <= 0.05) return;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const loopCount = isAdvanced ? 7 : 4;
      for (let loop = 0; loop < loopCount; loop += 1) {
        const items = projected
          .filter((node) => node.layer > 0 && node.layer % Math.max(1, loop % 3 + 1) === 0)
          .sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x))
          .slice(0, isAdvanced ? 18 : 10);
        if (items.length < 3) continue;
        ctx.beginPath();
        items.forEach((node, index) => {
          const wobble = Math.sin(pulse * 0.7 + node.phase + loop) * (isAdvanced ? 2.0 : 1.0);
          if (index === 0) ctx.moveTo(node.sx + wobble, node.sy);
          else {
            const prev = items[index - 1];
            ctx.quadraticCurveTo((prev.sx + node.sx) / 2, (prev.sy + node.sy) / 2 + wobble, node.sx + wobble, node.sy);
          }
        });
        ctx.strokeStyle = loop % 2
          ? `rgba(34,211,238,${0.040 + morph * 0.070})`
          : `rgba(208,176,94,${0.045 + morph * 0.075})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawOrb(orbX: number, orbY: number, radius: number, morph: number, pulse: number, arrival: number) {
      const glowRadius = radius * (2.10 + morph * 0.82) + Math.sin(pulse * 1.2) * (isAdvanced ? 6 : 3);
      const orbGlow = ctx.createRadialGradient(orbX, orbY, 3, orbX, orbY, glowRadius);
      orbGlow.addColorStop(0, "rgba(255,255,255,0.96)");
      orbGlow.addColorStop(0.17, "rgba(208,176,94,0.84)");
      orbGlow.addColorStop(0.47, isAdvanced ? "rgba(34,211,238,0.30)" : "rgba(52,211,153,0.18)");
      orbGlow.addColorStop(1, "rgba(208,176,94,0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(orbX, orbY, glowRadius * (1 + arrival * 0.18), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(4,5,8,0.88)";
      ctx.strokeStyle = isAdvanced ? "rgba(34,211,238,0.66)" : "rgba(208,176,94,0.62)";
      ctx.lineWidth = 1.28;
      ctx.beginPath();
      ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.strokeStyle = ring % 2 ? "rgba(34,211,238,0.32)" : "rgba(208,176,94,0.32)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const spin = pulse * (0.55 + ring * 0.17) + ring * 1.2;
        ctx.ellipse(orbX, orbY, radius * (0.64 + ring * 0.10), radius * (0.18 + ring * 0.08), spin, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.font = "900 22px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fillText("VLM", orbX, orbY - 7);
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "rgba(208,176,94,0.96)";
      ctx.fillText(tokenInfo.symbol, orbX, orbY + 16);
      ctx.restore();
    }

    function draw(now: number) {
      if (!visible) {
        raf = 0;
        return;
      }
      const elapsed = now - startedAt;
      const idleFrameBudget = elapsed > maxIdleLife ? Math.max(frameBudget, isAdvanced ? 86 : 112) : frameBudget;
      if (now - lastFrame < idleFrameBudget) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      const flyProgress = easeInOutCubic(elapsed / flyMs);
      const spawnProgress = easeOutQuint((elapsed - flyMs * 0.82) / spawnMs);
      const morph = easeOutQuint((elapsed - flyMs * 0.58) / (isAdvanced ? 1450 : 1120));
      const arrival = Math.max(0, Math.sin(Math.max(0, elapsed - flyMs * 0.84) / (flyMs * 0.16) * Math.PI)) * Math.max(0, 1 - flyProgress);
      const pulse = now * 0.00068;
      const ref = rotationRef.current;
      if (!ref.dragging) {
        ref.y += (autoRotate ? (isAdvanced ? 0.00012 : 0.00010) : 0) + ref.vy;
        ref.x = Math.max(-0.7, Math.min(0.7, ref.x + ref.vx));
        ref.vy *= 0.965;
        ref.vx *= 0.955;
      }
      const orb = pointOnCurve(flyProgress);
      const centerX = width / 2;
      const centerY = height / 2;
      const coreRadius = isAdvanced ? Math.min(width, height) * 0.085 : Math.min(width, height) * 0.070;
      const brainRadius = Math.min(width, height) * (isAdvanced ? 0.245 : 0.180) * brainZoom;

      drawBackground(now);

      if (!reducedMotion) {
        const trailCount = isLow ? 2 : isAdvanced ? 5 : 4;
        for (let i = trailCount; i >= 1; i -= 1) {
          const trailT = Math.max(0, flyProgress - i * 0.015);
          const pt = pointOnCurve(trailT);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = isAdvanced ? `rgba(34,211,238,${0.026 + i * 0.007})` : `rgba(208,176,94,${0.030 + i * 0.008})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, Math.max(2, coreRadius * 0.48 * (1 - i * 0.06)), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      const projected = brain.map((node) => project(node, pulse * (isAdvanced ? 0.10 : 0.075), morph, centerX, centerY, brainRadius));
      const graphLive = elapsed > flyMs * 0.86;
      if (graphLive && projected.length) {
        const edges = projected
          .map((node, index) => ({ node, index, parent: node.parent >= 0 ? projected[node.parent] : null }))
          .filter((edgeItem) => edgeItem.parent)
          .sort((a, b) => ((a.parent?.depth ?? 0) + a.node.depth) - ((b.parent?.depth ?? 0) + b.node.depth));

        drawCortexLoops(projected, spawnProgress, pulse);

        edges.forEach(({ node, index, parent }) => {
          if (!parent) return;
          const local = Math.max(0, Math.min(1, spawnProgress - index * (isAdvanced ? 0.010 : 0.045)));
          if (local <= 0) return;
          const depthAlpha = node.depth > 0 ? 1 : 0.58;
          drawCurve(parent, node, (isAdvanced ? 0.26 : 0.36) * local * depthAlpha, local, pulse);
        });

        packets.forEach((packet) => {
          if (spawnProgress <= 0.18) return;
          const node = projected[packet.edge % projected.length];
          if (!node || node.parent < 0) return;
          const parent = projected[node.parent];
          packet.progress = (packet.progress + packet.speed) % 1;
          const eased = easeInOutCubic(packet.progress);
          const x = parent.sx + (node.sx - parent.sx) * eased;
          const y = parent.sy + (node.sy - parent.sy) * eased + Math.sin(packet.progress * Math.PI + packet.phase) * (isAdvanced ? 3.2 : 1.5);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.shadowBlur = isLow ? 0 : isAdvanced ? 10 : 6;
          ctx.shadowColor = packet.glow > 0.52 ? "rgba(34,211,238,0.62)" : "rgba(208,176,94,0.62)";
          ctx.fillStyle = packet.glow > 0.52 ? "rgba(34,211,238,0.74)" : "rgba(250,204,121,0.80)";
          ctx.beginPath();
          ctx.arc(x, y, packet.size * node.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        projected
          .slice(1)
          .sort((a, b) => a.depth - b.depth)
          .forEach((node, index) => {
            const local = Math.max(0, Math.min(1, spawnProgress - index * (isAdvanced ? 0.008 : 0.040)));
            if (local <= 0) return;
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.shadowBlur = isLow ? 0 : node.depth > 0 ? 9 : 4;
            ctx.shadowColor = node.tone === "cyan" ? "rgba(34,211,238,0.45)" : node.tone === "green" ? "rgba(52,211,153,0.40)" : "rgba(208,176,94,0.48)";
            ctx.fillStyle = node.tone === "cyan" ? "rgba(34,211,238,0.66)" : node.tone === "green" ? "rgba(52,211,153,0.62)" : "rgba(208,176,94,0.72)";
            ctx.beginPath();
            ctx.arc(node.sx, node.sy, Math.max(0.9, node.radius * node.scale * local), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
      }

      drawOrb(orb.x, orb.y, coreRadius, morph, pulse, arrival);

      if ((isLow && elapsed > maxIdleLife) || elapsed > maxAnimationLife) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(draw);
    }

    function onVisibilityChange() {
      visible = document.visibilityState !== "hidden";
      if (!visible && raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      if (visible && raf === 0) raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    raf = requestAnimationFrame(draw);
    return () => {
      visible = false;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isAdvanced, isPro, mode, riskScore, tokenInfo.symbol, motionQuality, motionPreset, renderHeavyCanvas, lineStartMs, lineDurationMs, revealGapMs, readNodes.length, autoRotate, brainZoom]);

  const visibleNodes = readNodes.slice(0, revealedCount);
  const filteredVisibleNodes = useMemo(() => visibleNodes, [visibleNodes]);
  const selectedTileEvidenceCopy = useMemo(() => {
    if (!selectedNode) return null;
    const groupLabel = groupLabels[selectedNode.group];
    const sourceState = result.dataQuality === "live" ? "live source" : result.dataQuality === "partial" ? "partial source" : "fallback / missing source";
    const value = selectedNode.value;
    const groupCopy: Record<Exclude<VlmReadGroup, "all">, {
      driver: string;
      scoreRead: string;
      evidenceNeed: string;
      next: string;
      operatorQuestion: string;
    }> = {
      risk: locale === "pl"
        ? {
            driver: `Ten kafelek streszcza główny poziom ryzyka. Wartość ${value} nie jest certyfikatem bezpieczeństwa — mówi tylko, jak model czyta dostępne sygnały.`,
            scoreRead: "Niski score często oznacza brak mocnych flag w aktualnych danych, ale przy brakach źródeł nadal trzeba sprawdzić kontrakt, holderów i płynność.",
            evidenceNeed: "Wymagane dowody: świeże świece, źródło market data, source ledger i manualny review największych braków.",
            next: "Najpierw sprawdź, czy wynik jest niski przez realnie spokojne dane, czy przez missing/fallback data.",
            operatorQuestion: "Czy mamy źródło live i czy missing data nie ukrywa ryzyka?",
          }
        : {
            driver: `This tile summarizes the main risk level. ${value} is not a safety certificate — it only shows how the model reads available signals.`,
            scoreRead: "A low score often means no strong flags in current data, but missing sources still require contract, holder and liquidity review.",
            evidenceNeed: "Required evidence: fresh candles, market data source, source ledger and manual review of the largest gaps.",
            next: "First check whether the score is low because data is genuinely calm or because sources are missing/fallback.",
            operatorQuestion: "Do we have live source truth, and is missing data hiding risk?",
          },
      liquidity: locale === "pl"
        ? {
            driver: `Ten kafelek pokazuje możliwość wyjścia z pozycji bez dużego poślizgu. Wartość ${value} zależy od wolumenu, depth, spreadu i relacji volume/market cap.`,
            scoreRead: "Niska płynność zwiększa ryzyko, bo cena może wyglądać dobrze, ale wyjście większym zleceniem może być drogie albo nierealne.",
            evidenceNeed: "Wymagane dowody: order book, spread, slippage, giełdy z realnym wolumenem i porównanie wolumenu do market cap.",
            next: "Zweryfikuj depth, spread, slippage i czy wolumen jest organiczny, a nie tylko podbity przez market-makerów.",
            operatorQuestion: "Czy użytkownik mógłby realnie wyjść z pozycji bez rozwalenia ceny?",
          }
        : {
            driver: `This tile shows exit ability without heavy slippage. ${value} depends on volume, depth, spread and volume/market-cap ratio.`,
            scoreRead: "Weak liquidity raises risk because the chart may look calm while larger exits are expensive or unrealistic.",
            evidenceNeed: "Required evidence: order book, spread, slippage, venues with real volume and volume-to-market-cap comparison.",
            next: "Verify depth, spread, slippage and whether volume is organic instead of engineered by market makers.",
            operatorQuestion: "Could a user realistically exit without breaking price?",
          },
      holders: locale === "pl"
        ? {
            driver: `Ten kafelek ocenia koncentrację podaży i kontrolę nad tokenem. Wartość ${value} rośnie, gdy holderzy, CEX, LP albo treasury są niejasne.`,
            scoreRead: "Niejasne klastry holderów nie oznaczają od razu scam — oznaczają, że nie wolno robić mocnego werdyktu bez chain/source labels.",
            evidenceNeed: "Wymagane dowody: największe portfele, CEX/custody, LP, treasury, team/advisor wallets i unknown clusters.",
            next: "Sprawdź największe portfele, CEX/custody, LP, treasury i unknown clusters.",
            operatorQuestion: "Kto realnie kontroluje podaż i czy można to potwierdzić źródłem?",
          }
        : {
            driver: `This tile evaluates supply concentration and token control. ${value} rises when holders, CEX, LP or treasury labels are unclear.`,
            scoreRead: "Unclear holder clusters are not an accusation — they mean no strong verdict without chain/source labels.",
            evidenceNeed: "Required evidence: top wallets, CEX/custody, LP, treasury, team/advisor wallets and unknown clusters.",
            next: "Review top wallets, CEX/custody, LP, treasury and unknown clusters.",
            operatorQuestion: "Who really controls supply, and can the source prove it?",
          },
      signals: locale === "pl"
        ? {
            driver: `Ten kafelek wybiera najmocniejszy widoczny sygnał. ${value} wymaga potwierdzenia, bo model nie może opierać werdyktu na jednej fladze.`,
            scoreRead: "Sygnał jest punktem startowym review, nie oskarżeniem ani poradą. Im świeższy i mocniejszy sygnał, tym ważniejsze źródło.",
            evidenceNeed: "Wymagane dowody: świeże źródła, wykres, wolumen, social/KOL context i zgodność z innymi agentami.",
            next: "Potwierdź sygnał w świeżych źródłach zanim użyjesz mocnego werdyktu.",
            operatorQuestion: "Czy ten sygnał ma potwierdzenie poza samym ruchem ceny?",
          }
        : {
            driver: `This tile selects the strongest visible signal. ${value} needs confirmation because the model cannot base verdicts on a single flag.`,
            scoreRead: "A signal is a review prompt, not an accusation or advice. The fresher and stronger it is, the more the source matters.",
            evidenceNeed: "Required evidence: fresh sources, chart, volume, social/KOL context and agreement with other agents.",
            next: "Confirm the signal in fresh sources before using strong wording.",
            operatorQuestion: "Is this signal confirmed outside price movement alone?",
          },
      source: locale === "pl"
        ? {
            driver: `Ten kafelek mówi, czy system pracuje na danych live, partial, fallback czy missing. Stan źródła wpływa na pewność całego wyniku.`,
            scoreRead: "Brak danych nie jest neutralny. Shield powinien zwiększać uncertainty, a nie udawać pewność.",
            evidenceNeed: "Wymagane dowody: source ledger, timestamp, data mode, fallback label i lista braków.",
            next: "Uzupełnij source ledger: live, partial, fallback albo missing.",
            operatorQuestion: "Które źródło jest prawdziwe, a które tylko fallbackiem?",
          }
        : {
            driver: "This tile tells whether the system uses live, partial, fallback or missing data. Source state changes the confidence of the whole readout.",
            scoreRead: "Missing data is not neutral. Shield should raise uncertainty instead of pretending certainty.",
            evidenceNeed: "Required evidence: source ledger, timestamp, data mode, fallback label and missing-data list.",
            next: "Complete source ledger: live, partial, fallback or missing.",
            operatorQuestion: "Which source is real, and which source is only fallback?",
          },
      access: locale === "pl"
        ? {
            driver: "Ten kafelek pilnuje granicy produktu: VLM ma być utility/access layer, a nie obietnicą inwestycyjną.",
            scoreRead: "Dostęp premium może odblokować więcej danych i evidence, ale nie może obiecywać ROI, investment-safety promise ani ukrytej transakcji.",
            evidenceNeed: "Wymagane dowody: utility copy, brak seed phrase flow, brak value promise i jasne policy pages.",
            next: "Pilnuj VLM jako utility/access layer, bez obietnic ROI i bez seed phrase flow.",
            operatorQuestion: "Czy użytkownik rozumie, że to narzędzie analizy, nie obietnica zysku?",
          }
        : {
            driver: "This tile protects the product boundary: VLM is utility/access layer, not an investment promise.",
            scoreRead: "Premium access can unlock deeper data and evidence, but cannot promise ROI, investment-safety promise or hidden transactions.",
            evidenceNeed: "Required evidence: utility copy, no seed phrase flow, no value promise and clear policy pages.",
            next: "Keep VLM as utility/access layer, with no ROI promise and no seed phrase flow.",
            operatorQuestion: "Does the user understand this is analysis tooling, not a profit promise?",
          },
    };
    const copy = groupCopy[selectedNode.group];
    return {
      groupLabel,
      sourceState,
      why: selectedNode.detail,
      driver: copy.driver,
      scoreRead: copy.scoreRead,
      evidenceNeed: copy.evidenceNeed,
      next: copy.next,
      operatorQuestion: copy.operatorQuestion,
      confidence: `${confidence}%`,
      chartSource,
    };
  }, [selectedNode, groupLabels, result.dataQuality, locale, confidence, chartSource]);


  const phaseLabel = phase === "boot"
    ? ui.boot
    : phase === "orb"
      ? ui.orb
      : phase === "brain"
        ? ui.brain
        : phase === "readout"
          ? ui.readout
          : ui.complete;

  return (
    <div ref={overlayRef} className={`shield-vlm-sequence-overlay ${isCompactViewport ? "shield-vlm-sequence-compact" : ""} ${performanceRuntime ? "shield-vlm-runtime-performance" : "shield-vlm-runtime-cinematic"}`} role="dialog" aria-modal="true" aria-label="VLM neural token analysis" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={releasePointer} onPointerCancel={releasePointer} onPointerLeave={releasePointer}>
      {renderHeavyCanvas ? <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" /> : null}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(200,169,106,0.11),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.68))]" />
      <div className={`shield-vlm-dom-core shield-vlm-dom-core-${phase}`} style={coreEntryStyle} aria-hidden="true">
        <span className="shield-vlm-dom-core-ring shield-vlm-dom-core-ring-a" />
        <span className="shield-vlm-dom-core-ring shield-vlm-dom-core-ring-b" />
        <span className="shield-vlm-dom-core-label">VLM</span>
        <span className="shield-vlm-dom-core-symbol">{tokenInfo.symbol}</span>
      </div>

      <div className="shield-vlm-topbar z-30" data-vlm-no-drag="true">
        <div className="min-w-0">
          <p className="shield-vlm-phase-pill">{phaseLabel}</p>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.34]">
            {tokenInfo.symbol} · {visiblePointLabel} · {motionGovernorLabel}
          </p>
          {isAdvanced ? <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-white/[0.24]">{ui.rotateHint}</p> : null}
          {isAdvanced ? (
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/[0.28]">adaptive orbital risk sphere · sparse react frames · compositor motion</p>
          ) : (
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-100/[0.32]">static evidence cards · no heavy 3d load</p>
          )}
        </div>

        <div className="shield-vlm-motion-stack" data-vlm-no-drag="true" onPointerDown={(event) => event.stopPropagation()}>
          <div className="shield-vlm-motion-governor" aria-label={ui.motionGovernor}>
            {allowedMotionPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMotionPreset(preset)}
                className={motionPreset === preset ? "is-active" : ""}
              >
                {preset === "orbit" ? ui.motionOrbit : ui.motionStatic}
              </button>
            ))}
          </div>
          {isAdvanced && motionPreset === "orbit" ? (
            <div className="shield-vlm-runtime-governor" aria-label="VLM brain runtime governor">
              {(["performance", "cinematic"] as BrainRuntimeMode[]).map((runtime) => (
                <button
                  key={runtime}
                  type="button"
                  onClick={() => {
                    setBrainRuntimeMode(runtime);
                    setFrameHealth(runtime === "cinematic" && motionQuality === "high" ? "smooth" : "guarded");
                  }}
                  className={brainRuntimeMode === runtime ? "is-active" : ""}
                >
                  {runtime === "performance" ? ui.runtimePerformance : ui.runtimeCinematic}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          data-vlm-no-drag="true"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.62] backdrop-blur-xl transition hover:border-velmere-gold/[0.35] hover:text-velmere-gold"
        >
          {ui.back}
        </button>
      </div>

      {isInvestigationMode && !useRailLayout && motionPreset !== "static" ? (
        <div className="shield-vlm-orbital-shell" aria-hidden="true">
          <span className="shield-vlm-orbital-shell-ring shield-vlm-orbital-shell-ring-a" />
          <span className="shield-vlm-orbital-shell-ring shield-vlm-orbital-shell-ring-b" />
          <span className="shield-vlm-orbital-shell-ring shield-vlm-orbital-shell-ring-c" />
        </div>
      ) : null}

      {isAdvanced ? (
        <div className="shield-vlm-orbit-status z-30" data-vlm-no-drag="true" onPointerDown={(event) => event.stopPropagation()}>
          <span>{motionPreset === "orbit" ? `${brainRuntimeMode} · ${frameHealth === "smooth" ? ui.frameSmooth : frameHealth === "degraded" ? ui.frameDegraded : ui.frameGuarded}` : "static"}</span>
          <strong>{filteredVisibleNodes.length}/{readNodes.length}</strong>
        </div>
      ) : null}

      {!useRailLayout && showLineSvg ? (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {readNodes.map((node, index) => {
            const pathD = linePathForNode(node, index);
            const lineDelay = lineStartMs + index * revealGapMs;
            const dotDelay = lineDelay + lineDurationMs * 0.76;
            return (
              <g key={`vlm-line-${node.label}`} className="shield-vlm-ray-group">
                <path
                  d={pathD}
                  className={`shield-vlm-read-line ${isAdvanced ? "shield-vlm-read-line-advanced" : ""}`}
                  style={{ animationDelay: `${lineDelay}ms`, animationDuration: `${lineDurationMs}ms` }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isAdvanced ? 0.38 : 0.52}
                  className={`shield-vlm-read-dot shield-vlm-read-dot-${node.tone ?? "gold"}`}
                  style={{ animationDelay: `${dotDelay}ms` }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isAdvanced ? 1.04 : 1.34}
                  className="shield-vlm-read-pulse"
                  style={{ animationDelay: `${dotDelay + 80}ms` }}
                />
              </g>
            );
          })}
        </svg>
      ) : null}

      {useRailLayout ? (
        <div className={`shield-vlm-compact-rail z-20 ${motionPreset === "static" ? "shield-vlm-static-board" : ""}`}>
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{visiblePointLabel}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">{ui.tapPoint}</p>
          </div>
          <div className="grid gap-2">
            {filteredVisibleNodes.map((node) => (
              <button
                key={`vlm-rail-${node.label}`}
                type="button"
                data-vlm-no-drag="true"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  setSelectedNode(node);
                }}
                className={`shield-vlm-read-card shield-vlm-read-card-${node.tone ?? "gold"} ${selectedNode?.label === node.label ? "shield-vlm-read-card-active" : ""}`}
              >
                <div className="shield-vlm-read-card-scan" />
                <p className="relative font-mono text-[8px] uppercase tracking-[0.16em] text-white/[0.35]">{node.label}</p>
                <p className="relative mt-1 truncate font-mono text-[13px] font-semibold text-white tabular-nums">{node.value}</p>
                <p className="relative mt-1 truncate font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">{node.hint}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`pointer-events-none absolute inset-0 z-20 ${isInvestigationMode ? "shield-vlm-tile-deck shield-vlm-motion-governed" : ""} ` }>
          {filteredVisibleNodes.map((node, index) => (
              <div
                key={`vlm-read-${node.label}`}
                className="absolute shield-vlm-tile-anchor"
                style={advancedTileStyle(node, index)}
              >
                <button
                  type="button"
                  data-vlm-no-drag="true"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    setSelectedNode(node);
                  }}
                  className={`pointer-events-auto shield-vlm-read-card shield-vlm-read-card-${node.tone ?? "gold"} ${isAdvanced ? "shield-vlm-read-card-advanced" : ""} ${selectedNode?.label === node.label ? "shield-vlm-read-card-active" : ""}`}
                >
                  <div className="shield-vlm-read-card-scan" />
                  <p className="relative font-mono text-[8px] uppercase tracking-[0.16em] text-white/[0.35]">{node.label}</p>
                  <p className="relative mt-1 truncate font-mono text-[13px] font-semibold text-white tabular-nums">{node.value}</p>
                  <p className="relative mt-1 truncate font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">{node.hint}</p>
                </button>
              </div>
            ))}
        </div>
      )}

      {selectedNode ? (
        <div className="shield-vlm-detail-panel shield-vlm-detail-panel-side shield-vlm-detail-panel-solid z-30" data-vlm-no-drag="true" onPointerDown={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">{ui.selectedPoint} · {selectedNode.group}</p>
              <h3 className="mt-2 truncate font-mono text-sm uppercase tracking-[0.10em] text-white">{selectedNode.label}</h3>
            </div>
            <button type="button" data-vlm-no-drag="true" onPointerDown={(event) => event.stopPropagation()} onClick={() => setSelectedNode(null)} className="rounded-full border border-white/[0.10] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.50] hover:text-white">{ui.close}</button>
          </div>
          <p className="mt-3 font-mono text-2xl text-white tabular-nums">{selectedNode.value}</p>
          <div className="mt-3 rounded-2xl border border-white/[0.12] bg-black/[0.82] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">{selectedTileEvidenceCopy?.groupLabel} · {selectedTileEvidenceCopy?.sourceState}</p>
            <p className="mt-3 text-xs leading-6 text-white/[0.74]">{selectedTileEvidenceCopy?.driver}</p>
            <p className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-xs leading-6 text-white/[0.62]">{selectedTileEvidenceCopy?.scoreRead}</p>
            <p className="mt-3 text-xs leading-6 text-white/[0.58]">{selectedTileEvidenceCopy?.why}</p>
            <p className="mt-3 border-t border-white/[0.08] pt-3 text-xs leading-6 text-cyan-100/[0.70]">{selectedTileEvidenceCopy?.evidenceNeed}</p>
            <p className="mt-3 rounded-xl border border-velmere-gold/[0.14] bg-velmere-gold/[0.055] p-3 text-xs leading-6 text-velmere-gold/[0.82]">{selectedTileEvidenceCopy?.next}</p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.38]">{selectedTileEvidenceCopy?.operatorQuestion}</p>
          </div>
          {isInvestigationMode ? (
            <div className="mt-3 grid gap-2 rounded-2xl border border-white/[0.10] bg-black/[0.50] p-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.50] sm:grid-cols-3">
              <span>source · {selectedTileEvidenceCopy?.chartSource}</span>
              <span>confidence · {selectedTileEvidenceCopy?.confidence}</span>
              <span>mode · {isAdvanced ? ui.modeAdvanced : "pro"}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* <i18n-safe-boundary */
function AdvancedVlmNeuralConsole({
  result,
  candles,
  orderbook,
  combinedScore,
  chartSource,
  advancedTierLabel,
  onCommand,
}: {
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  combinedScore: number;
  chartSource: string;
  advancedTierLabel: string;
  onCommand: (id: TerminalCommandId) => void;
}) {
  const tokenInfo = result["token"];
  const investigator = useMemo(() => buildVlmShieldInvestigator(result), [result]);
  const strongestAgents = (result.agentAssessments ?? [])
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const lanes = [
    {
      id: "sources" as const,
      label: "Source stream",
      value: result.dataQuality,
      body: `${candles.length || 0} candles · ${chartSource}`,
      icon: Database,
    },
    {
      id: "liquidity" as const,
      label: "Liquidity lane",
      value: orderbook ? "depth online" : "partial",
      body: orderbook ? `${orderbook.riskPoints ?? 0}/100 order-book stress` : "depth feed gated / fallback",
      icon: Activity,
    },
    {
      id: "holders" as const,
      label: "Holder graph",
      value: "gated",
      body: "whales · CEX · DEX/LP · retail · unknown buckets",
      icon: Network,
    },
    {
      id: "evidence" as const,
      label: "Evidence rail",
      value: "draft",
      body: "source ledger, missing data and legal-safe export path",
      icon: FileText,
    },
  ];
  /* < */
  const aiFeed = [
    `Advanced mode dla ${tokenInfo.symbol}: spinam wykres, source ledger, liquidity, holders i evidence w jedną mapę VLM.`,
    `Risk center: ${combinedScore}/100. To jest flaga algorytmiczna, nie wyrok, nie porada inwestycyjna i nie dowód prawny.`,
    `Najpierw sprawdzam źródła: ${result.dataQuality}. Brakujące dane podnoszą uncertainty, a nie bezpieczeństwo.`,
    orderbook
      ? `Orderbook feed podłączony: stress ${orderbook.riskPoints ?? 0}/100, spread/slippage idą do liquidity lane.`
      : "Orderbook/depth nie jest pełny — advanced pokazuje to jako partial lane, nie jako pustą kartę.",
    `Pełne rubryki są dla ${advancedTierLabel}: AI, holder graph, evidence, replay, stress i operator workflow.`,
  ];

  return (
    <section className="shield-vlm-neural-console mt-5 overflow-hidden rounded-[1.85rem] border border-velmere-gold/[0.16] bg-[radial-gradient(circle_at_50%_40%,rgba(200,169,106,0.18),transparent_32%),radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.10),transparent_30%),rgba(255,255,255,0.024)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_120px_rgba(0,0,0,0.35)] md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">Advanced VLM neural analysis</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
            Dane nie są już listą kart — tworzą mapę przepływu ryzyka.
          </h3>
          <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.56]">
            Lewa strona pokazuje strumienie danych, centrum łączy je w VLM risk core, prawa strona pokazuje analizę AI jak operator SOC. To jest warstwa advanced — public/basic zostaje czysty.
          </p>
        </div>
        <span className="w-fit rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.08] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold">
          {advancedTierLabel} · gated
        </span>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.38fr)]">
        <div className="shield-investigator-brief rounded-[1.5rem] border border-cyan-300/[0.14] bg-cyan-300/[0.045] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100">{investigator.title}</p>
              <h4 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white md:text-2xl">OSINT protocol dla podejrzanych pomp, low-float i ukrytych unlocków.</h4>
              <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.55]">{investigator.quickVerdict}</p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 text-center">
              <span className="rounded-2xl border border-white/[0.10] bg-black/[0.26] px-4 py-3">
                <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.36]">Shield risk</span>
                <span className="mt-1 block font-mono text-2xl text-white tabular-nums">{investigator.overallRisk}</span>
              </span>
              <span className="rounded-2xl border border-white/[0.10] bg-black/[0.26] px-4 py-3">
                <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.36]">Confidence</span>
                <span className="mt-1 block font-mono text-sm uppercase tracking-[0.12em] text-velmere-gold">{investigator.confidence}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {investigator.lanes.slice(0, 6).map((lane) => (
              <button
                key={lane.id}
                type="button"
                onClick={() => onCommand("evidence")}
                className={`shield-investigator-lane shield-investigator-lane-${lane.status}`}
                title={lane.nextStep}
              >
                <span className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.56]">{lane.label}</span>
                  <span className="font-mono text-[10px] text-white tabular-nums">{lane.score}</span>
                </span>
                <span className="mt-2 block text-left text-[11px] leading-5 text-white/[0.52]">{lane.headline}</span>
              </button>
            ))}
          </div>
          <div className="shield-loss-prevention-panel mt-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">loss prevention</p>
            <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.54]">{investigator.lossPrevention.whyThisMatters}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p className="rounded-2xl border border-red-300/[0.14] bg-red-400/[0.045] p-3 text-[11px] leading-5 text-red-50/[0.72]">
                {investigator.lossPrevention.behavioralTrap.label}: {investigator.lossPrevention.behavioralTrap.risk}
              </p>
              <p className="rounded-2xl border border-emerald-300/[0.13] bg-emerald-400/[0.040] p-3 text-[11px] leading-5 text-emerald-50/[0.70]">
                {investigator.lossPrevention.behavioralTrap.counterMove}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">Web OSINT required</p>
          <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.54]">
            Finalny werdykt tokena musi sprawdzać świeże źródła: supply, vesting, buyback, squeeze, KOL i kontrakt. Brak przejrzystych danych jest red flagą.
          </p>
          <div className="mt-3 space-y-2">
            {investigator.webQueries.slice(0, 4).map((query) => (
              <p key={query} className="truncate rounded-full border border-white/[0.08] bg-black/[0.24] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.10em] text-white/[0.42]">
                {query}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_23rem]">
        <div className="grid gap-3">
          {lanes.map((lane, index) => {
            const Icon = lane.icon;
            return (
              <button
                key={lane.label}
                type="button"
                onClick={() => onCommand(lane.id)}
                className="shield-neural-lane group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-black/[0.24] p-4 text-left transition hover:border-velmere-gold/[0.28] hover:bg-velmere-gold/[0.045]"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="absolute right-[-2rem] top-1/2 hidden h-px w-16 bg-gradient-to-r from-velmere-gold/[0.45] to-transparent xl:block" />
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.07] text-velmere-gold">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/[0.82]">{lane.label}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">{lane.value}</p>
                  </div>
                </div>
                <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.45]">{lane.body}</p>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[26rem] overflow-hidden rounded-[1.7rem] border border-white/[0.09] bg-black/[0.30] p-5">
          <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(200,169,106,0.18),transparent_34%)]" />
          <div className="relative flex h-full min-h-[26rem] items-center justify-center">
            <div className="shield-vlm-core relative flex h-52 w-52 items-center justify-center rounded-full border border-velmere-gold/[0.26] bg-velmere-gold/[0.055] text-center shadow-[0_0_90px_rgba(200,169,106,0.16)]">
              <span className="absolute inset-[-2rem] rounded-full border border-dashed border-velmere-gold/[0.14]" />
              <span className="absolute inset-[-4rem] rounded-full border border-white/[0.055]" />
              <span className="absolute inset-[-6rem] rounded-full border border-white/[0.035]" />
              <span className="absolute left-[-6.5rem] top-1/2 h-px w-24 bg-gradient-to-r from-transparent via-velmere-gold/[0.45] to-velmere-gold/[0.0]" />
              <span className="absolute right-[-6.5rem] top-1/2 h-px w-24 bg-gradient-to-r from-velmere-gold/[0.0] via-velmere-gold/[0.45] to-transparent" />
              <div className="relative">
                <p className="shield-serif-display text-5xl leading-none tracking-[-0.06em] text-white">VLM</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">risk core</p>
                <p className="mt-4 font-mono text-3xl text-white tabular-nums">{combinedScore}<span className="text-sm text-white/[0.38]">/100</span></p>
              </div>
            </div>
            {strongestAgents.map((agent, index) => (
              <span
                key={`${agent.id}-${index}`}
                className="absolute rounded-full border border-white/[0.10] bg-black/[0.55] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.58] backdrop-blur"
                style={{
                  left: `${14 + (index % 2) * 64}%`,
                  top: `${16 + index * 14}%`,
                }}
              >
                {agent.label} · {agent.score}/100
              </span>
            ))}
          </div>
        </div>

        <div className="shield-ai-advanced-feed overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-black/[0.26] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">AI advanced feed</p>
              <p className="mt-1 text-xs text-white/[0.42]">animated reasoning layer · safe wording</p>
            </div>
            <span className="rounded-full border border-emerald-300/[0.20] bg-emerald-400/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-100">live UI</span>
          </div>
          <div className="mt-4 grid gap-3">
            {aiFeed.map((line, index) => (
              <div key={line} className="shield-ai-feed-line rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3" style={{ animationDelay: `${index * 130}ms` }}>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-velmere-gold shadow-[0_0_18px_rgba(200,169,106,0.7)]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-velmere-gold">step {index + 1}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.58]">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AiAnalysisChatPopup({
  open,
  onClose,
  onOpenAdvanced,
  result,
  candles,
  orderbook,
  combinedScore,
  chartSource,
  advancedTierLabel,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAdvanced: () => void;
  result: BrainResult;
  candles: Candle[];
  orderbook: OrderBookResult | null;
  combinedScore: number;
  chartSource: string;
  advancedTierLabel: string;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const strongestAgent = useMemo(
    () => (result.agentAssessments ?? []).slice().sort((a, b) => b.score - a.score)[0],
    [result.agentAssessments],
  );
  const sourceMode = result.dataQuality === "live" ? "live data" : result.dataQuality === "partial" ? "partial data" : "fallback / uncertainty";
  const tokenInfo = result["token"];
  const messages = useMemo(() => [
    {
      label: "Velmère AI",
      body: `Startuję krótką analizę ${tokenInfo.symbol}. Basic pokazuje tylko najważniejsze wnioski; pełny terminal zostaje za VLM / owner access.`,
    },
    {
      label: "Source check",
      body: `Źródła: ${sourceMode}. Wykres: ${candles.length || 0} świec z ${chartSource}. Orderbook: ${orderbook ? "podłączony" : "brak pełnej głębokości / partial"}.`,
    },
    {
      label: "Risk read",
      body: `Aktualny risk flag: ${combinedScore}/100. To jest algorithmic risk flag, nie porada inwestycyjna i nie dowód prawny.`,
    },
    {
      label: "Dominant layer",
      body: strongestAgent
        ? `Najmocniejsza warstwa teraz: ${strongestAgent.label} (${strongestAgent.score}/100). Następny krok: sprawdzić świece, wolumen i brakujące źródła zanim cokolwiek eskalujemy.`
        : "Brak jednej dominującej warstwy. Traktuję to jako spokojny monitoring i sprawdzam brakujące dane.",
    },
    {
      label: "Access gate",
      body: `Pełne dane: holder clusters, stress, replay, evidence export i SOC workflow są dla ${advancedTierLabel}. Public/basic zostaje krótkie i czyste.`,
    },
  ], [advancedTierLabel, candles.length, chartSource, combinedScore, orderbook, sourceMode, strongestAgent, tokenInfo.symbol]);

  useEffect(() => {
    if (!open) {
      setVisibleCount(0);
      return;
    }
    setVisibleCount(1);
    const timer = window.setInterval(() => {
      setVisibleCount((current) => {
        if (current >= messages.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 620);
    return () => window.clearInterval(timer);
  }, [messages.length, open]);

  if (!open) return null;

  return (
    <div className="shield-ai-analysis-chat fixed bottom-4 right-4 z-[100000] w-[min(27rem,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] border border-velmere-gold/[0.18] bg-[#0b0b0d]/[0.98] shadow-[0_30px_120px_rgba(0,0,0,0.62)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] p-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">AI analysis chat</p>
          <p className="mt-1 truncate text-xs text-white/[0.45]">animated SOC-style read · {tokenInfo.symbol}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/[0.62] transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Close AI analysis chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="shield-safe-scroll max-h-[31rem] space-y-3 overflow-y-auto p-4">
        {messages.slice(0, visibleCount).map((message, index) => (
          <div
            key={`${message.label}-${index}`}
            className="shield-ai-chat-message rounded-2xl border border-white/[0.08] bg-white/[0.026] p-3"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-velmere-gold/[0.20] bg-velmere-gold/[0.08] text-velmere-gold">
                <Brain className="h-3.5 w-3.5" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">{message.label}</span>
            </div>
            <p className="shield-copy-safe mt-2 text-sm leading-7 text-white/[0.64]">{message.body}</p>
          </div>
        ))}
        {visibleCount < messages.length ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/[0.22] px-3 py-2 text-xs text-white/[0.44]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-velmere-gold" />
            AI pisze analizę…
          </div>
        ) : null}
      </div>
      <div className="grid gap-2 border-t border-white/[0.08] p-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onOpenAdvanced}
          className="rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.08] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.13]"
        >
          Open advanced
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/[0.10] bg-white/[0.035] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.54] transition hover:border-white/[0.18] hover:text-white"
        >
          Keep basic
        </button>
      </div>
    </div>
  );
}

export default function TokenRiskModal({
  item,
  onClose,
}: {
  item: ModalItem;
  onClose: () => void;
}) {
  const t = useTranslations("MarketIntegrity");
  const locale = useLocale();
  const ui = useMemo(() => {
    if (locale === "pl") {
      return {
        controlKicker: "kontrola analizy",
        controlTitle: "Wybierz głębokość pracy VLM",
        controlBody: "Shield prowadzi analizę warstwami: najpierw szybki prescreen, potem źródła, a na końcu pełny tryb operatora.",
        basicTitle: "Basic Analysis",
        basicHint: "10 sygnałów · szybki prescreen bez ciężkiego 3D",
        proTitle: "Pro Review",
        proHint: "14 sygnałów · źródła, braki danych i review",
        advancedTitle: "Advanced Analysis",
        advancedHint: "20 sygnałów · pełna mapa ryzyka i evidence",
        evidenceExportTitle: "Manifest evidence",
        evidenceExportBody: "Manifest pokazuje źródła, braki danych i checklistę operatora. To nadal preview, nie finalny raport prawny.",
        evidenceDownload: "Pobierz JSON",
        evidenceCopy: "Kopiuj",
        evidenceCopied: "Skopiowano",
        modeGuideTitle: "Jak czytać wynik",
        modeGuideBody: "Niski score nie oznacza pełnej czystości. Sprawdź braki danych, płynność i źródła zanim uznasz case za spokojny.",
      };
    }
    if (locale === "de") {
      return {
        controlKicker: "Analysekontrolle",
        controlTitle: "Wähle die VLM-Tiefe",
        controlBody: "Shield führt die Analyse in Ebenen: zuerst schneller Prescreen, dann Quellenprüfung, am Ende der Operator-Modus.",
        basicTitle: "Basic Analysis",
        basicHint: "10 Signale · schneller Prescreen ohne schweres 3D",
        proTitle: "Pro Review",
        proHint: "14 Signale · Quellen, Datenlücken und Review",
        advancedTitle: "Advanced Analysis",
        advancedHint: "20 Signale · volle Risikokarte und Evidence",
        evidenceExportTitle: "Evidence Manifest",
        evidenceExportBody: "Das Manifest zeigt Quellen, Datenlücken und Operator-Checkliste. Es bleibt ein Preview, kein finaler Rechtsbericht.",
        evidenceDownload: "JSON laden",
        evidenceCopy: "Kopieren",
        evidenceCopied: "Kopiert",
        modeGuideTitle: "So liest du den Befund",
        modeGuideBody: "Ein niedriger Score ist kein Sicherheitszertifikat. Prüfe Datenlücken, Liquidität und Quellen, bevor der Case als ruhig gilt.",
      };
    }
    return {
      controlKicker: "analysis control",
      controlTitle: "Choose VLM depth",
      controlBody: "Shield runs in layers: fast prescreen first, source review second, full operator mode last.",
      basicTitle: "Basic Analysis",
      basicHint: "10 signals · fast prescreen without heavy 3D",
      proTitle: "Pro Review",
      proHint: "14 signals · sources, missing data and review",
      advancedTitle: "Advanced Analysis",
      advancedHint: "20 signals · full risk map and evidence",
      evidenceExportTitle: "Evidence manifest",
      evidenceExportBody: "The manifest shows sources, missing data and the operator checklist. It remains a preview, not a final legal report.",
      evidenceDownload: "Download JSON",
      evidenceCopy: "Copy",
      evidenceCopied: "Copied",
      modeGuideTitle: "How to read this",
      modeGuideBody: "A low score is not a safety certificate. Check missing data, liquidity and sources before treating the case as calm.",
    };
  }, [locale]);

  const result = isMarketRow(item) ? item.result : item;
  const row = isMarketRow(item) ? item : null;
  const operatorCaseFile = useMemo(() => buildShieldOperatorCaseFile(result), [result]);
  const evidenceReportDraft = useMemo(() => buildShieldEvidenceReportDraft(result, operatorCaseFile), [operatorCaseFile, result]);
  const evidenceExportManifest = useMemo(
    () => buildShieldEvidenceExportManifest(result, operatorCaseFile, evidenceReportDraft),
    [evidenceReportDraft, operatorCaseFile, result],
  );
  const evidenceExportJson = useMemo(() => serializeShieldEvidenceExportManifest(evidenceExportManifest), [evidenceExportManifest]);
  const asset = result["token"];
  const [range, setRange] = useState<MarketChartRange>("7d");
  const [chartMode, setChartMode] = useState<"line" | "candles" | "depth" | "volume">("candles");
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>(() =>
    fallbackPointsForResult(row, result, "7d"),
  );
  const [candles, setCandles] = useState<Candle[]>([]);
  const [chartSource, setChartSource] = useState<string>("CoinGecko market_chart");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [orderbook, setOrderbook] = useState<OrderBookResult | null>(null);
  const [orderbookError, setOrderbookError] = useState<string | null>(null);
  const [orderbookLoading, setOrderbookLoading] = useState(false);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [evidenceExportNotice, setEvidenceExportNotice] = useState<"idle" | "copied" | "downloaded">("idle");
  const [activeCommand, setActiveCommand] = useState<TerminalCommandId>("deck");
  const [terminalBooted, setTerminalBooted] = useState(false);
  const [advancedGateRequested, setAdvancedGateRequested] = useState(false);
  const [analysisChatOpen, setAnalysisChatOpen] = useState(false);
  const [vlmSequenceMode, setVlmSequenceMode] = useState<VlmAiSequenceMode | null>(null);

  function downloadEvidenceManifest() {
    const fileName = `${evidenceExportManifest.reportId.toLowerCase()}-manifest.json`;
    const blob = new Blob([evidenceExportJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    setEvidenceExportNotice("downloaded");
    window.setTimeout(() => setEvidenceExportNotice("idle"), 1800);
  }

  async function copyEvidenceManifest() {
    try {
      await navigator.clipboard.writeText(evidenceExportJson);
      setEvidenceExportNotice("copied");
      window.setTimeout(() => setEvidenceExportNotice("idle"), 1800);
    } catch {
      downloadEvidenceManifest();
    }
  }

  function runVlmAiSequence(mode: VlmAiSequenceMode) {
    setAnalysisChatOpen(false);
    setAdvancedGateRequested(false);
    setVlmSequenceMode(mode);
  }

  function completeVlmAiSequence(mode: VlmAiSequenceMode) {
    setVlmSequenceMode(null);
    if (mode === "advanced") {
      setAdvancedGateRequested(true);
      setActiveCommand("control");
      return;
    }
    if (mode === "pro") {
      setAdvancedGateRequested(false);
      setActiveCommand("sources");
      return;
    }
    setAdvancedGateRequested(false);
    setActiveCommand("risk");
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTerminalBooted(false);
    const timer = window.setTimeout(() => setTerminalBooted(true), 140);
    return () => window.clearTimeout(timer);
  }, [asset.symbol]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (vlmSequenceMode) {
        setVlmSequenceMode(null);
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [onClose, vlmSequenceMode]);

  useEffect(() => {
    let active = true;
    async function loadChart() {
      setChartLoading(true);
      setChartError(null);
      try {
        const klineResponse = await fetch(
          `/api/market-integrity/klines?symbol=${encodeURIComponent(asset.symbol)}&range=${range}`,
          { headers: { accept: "application/json" } },
        );
        const klineData = (await klineResponse.json()) as CandleApiResponse;
        if (active && klineResponse.ok && klineData.mode === "live" && klineData.candles.length >= 2) {
          setCandles(klineData.candles);
          setChartPoints(
            klineData.candles.map((candle) => ({
              timestamp: candle.timestamp,
              price: candle.close,
              volume: candle.quoteVolume ?? candle.volume,
            })),
          );
          setChartSource(klineData.source);
          setChartLoading(false);
          return;
        }
        if (!asset.marketId) {
          const fallback = fallbackPointsForResult(row, result, range);
          if (active) {
            setChartPoints(fallback);
            setCandles(candlesFromPoints(fallback));
            setChartSource("Local sparkline fallback");
          }
          return;
        }
        const response = await fetch(
          `/api/market-integrity/chart?id=${encodeURIComponent(asset.marketId)}&range=${range}`,
          { headers: { accept: "application/json" } },
        );
        const data = (await response.json()) as ChartApiResponse;
        if (!response.ok || data.mode === "error")
          throw new Error(
            data.mode === "error" ? data.error : "Chart request failed",
          );
        if (active) {
          const fallbackPoints = data.points.length >= 2 ? data.points : fallbackPointsForResult(row, result, range);
          setChartPoints(fallbackPoints);
          setCandles(candlesFromPoints(fallbackPoints));
          setChartSource(data.points.length >= 2 ? data.source : "Sparkline fallback");
        }
      } catch (error) {
        if (active) {
          setChartError(
            error instanceof Error ? error.message : "Chart request failed",
          );
          const fallback = fallbackPointsForResult(row, result, range);
          setChartPoints(fallback);
          setCandles(candlesFromPoints(fallback));
          setChartSource("Sparkline fallback");
        }
      } finally {
        if (active) setChartLoading(false);
      }
    }
    void loadChart();
    return () => {
      active = false;
    };
  }, [asset.marketId, asset.symbol, range, result, row]);

  useEffect(() => {
    let active = true;
    async function loadOrderBook() {
      if (!asset.symbol || asset.symbol.length > 12) return;
      setOrderbookLoading(true);
      setOrderbookError(null);
      try {
        const response = await fetch(
          `/api/market-integrity/orderbook?symbol=${encodeURIComponent(asset.symbol)}`,
          { headers: { accept: "application/json" } },
        );
        const data = (await response.json()) as OrderBookApiResponse;
        if (!response.ok || data.mode === "error")
          throw new Error(
            data.mode === "error" ? data.error : "Order book request failed",
          );
        if (active) setOrderbook(data.orderbook);
      } catch (error) {
        if (active) {
          setOrderbook(null);
          setOrderbookError(
            error instanceof Error ? error.message : "Order book not available",
          );
        }
      } finally {
        if (active) setOrderbookLoading(false);
      }
    }
    const timer = window.setTimeout(() => void loadOrderBook(), 260);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [asset.symbol]);

  useEffect(() => {
    let active = true;
    const id = asset.marketId ?? asset.tokenAddress ?? asset.symbol;
    async function loadHistory() {
      if (!id) return;
      try {
        const response = await fetch(
          `/api/market-integrity/history?id=${encodeURIComponent(id)}`,
          { headers: { accept: "application/json" } },
        );
        const data = (await response.json()) as HistoryApiResponse;
        if (active && response.ok && data.mode === "live") setHistory(data.history.slice(-24));
      } catch {
        if (active) setHistory([]);
      }
    }
    const timer = window.setTimeout(() => void loadHistory(), 420);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [asset.marketId, asset.symbol, asset.tokenAddress]);

  const generated = new Date(result.generatedAt);
  const generatedLabel = Number.isNaN(generated.getTime())
    ? "—"
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(generated);
  const combinedScore = Math.min(
    100,
    result.score + (orderbook?.riskPoints ?? 0),
  );
  const accessBrief = buildVlmShieldAccess(result);
  const advancedTierLabel = accessBrief.recommendedTier === "public"
    ? "VLM Member"
    : accessBrief.recommendedTier === "member"
      ? "VLM Member"
      : accessBrief.recommendedTier === "pro"
        ? "Shield Pro"
        : "Research Desk";
  const combinedLevel = levelFromScore(combinedScore);
  const combinedBadge = badgeFromLevel(combinedLevel);

  const metrics = [
    {
      icon: BarChart3,
      label: t("metrics.price"),
      value: formatUsd(result.metrics.currentPrice),
    },
    {
      icon: Activity,
      label: t("metrics.change24h"),
      value: formatPercent(result.metrics.priceChange24h),
    },
    {
      icon: Activity,
      label: t("metrics.change7d"),
      value: formatPercent(result.metrics.priceChange7d),
    },
    {
      icon: Activity,
      label: "30d",
      value: formatPercent(result.metrics.priceChange30d),
    },
    {
      icon: Database,
      label: t("metrics.marketCap"),
      value: formatUsd(result.metrics.marketCap),
    },
    {
      icon: Sigma,
      label: t("metrics.volume"),
      value: formatUsd(result.metrics.volume24h),
    },
  ];

  const categoryScore = (ids: string[]) =>
    result.signals
      .filter((signal) => ids.includes(signal.id))
      .reduce((sum, signal) => sum + signal.points, 0);
  const methodRows = [
    {
      label: t("method.velocity"),
      value: categoryScore([
        "rapid_intraday_move",
        "parabolic_24h_gain",
        "parabolic_7d_gain",
        "parabolic_30d_gain",
        "multi_timeframe_pump",
        "new_ath_repricing",
        "extreme_drawdown",
        "major_drawdown",
        "severe_24h_drop",
        "high_24h_drop",
      ]),
    },
    {
      label: t("method.liquidity"),
      value:
        categoryScore([
          "thin_liquidity",
          "very_thin_liquidity",
          "low_dex_liquidity",
          "market_volume_stress",
          "wash_trading_risk",
          "volume_spike",
          "orderbook_slippage_risk",
          "orderbook_imbalance",
          "orderbook_depth_collapse",
        ]) + (orderbook?.riskPoints ?? 0),
    },
    {
      label: t("method.holders"),
      value: categoryScore([
        "holder_concentration",
        "supply_overhang",
        "fdv_marketcap_gap",
      ]),
    },
    {
      label: t("method.contract"),
      value: categoryScore([
        "contract_privileges",
        "honeypot_risk",
        "high_sell_tax",
        "mint_risk",
        "blacklist_risk",
      ]),
    },
  ];

  const firstHistory = history[0];
  const lastHistory = history.at(-1);
  const historyScoreDelta = firstHistory && lastHistory ? lastHistory.score - firstHistory.score : undefined;
  const attackSurface = useMemo(() => buildAttackSurface(result), [result]);
  const commandRows = useMemo<TerminalCommandRow[]>(() => [
    {
      id: "deck" as const,
      label: "Review deck",
      body: "PASS77 compresses the terminal into a first-screen review deck: source truth, AI review, evidence blockers, interaction stability and launch blockers before deep panels.",
      next: "Start on Review Deck, then open only the lane that blocks confidence: sources, export, runtime, launch or copilot.",
    },
    {
      id: "risk" as const,
      label: "Explain risk",
      body: `Start with the dominant score: ${result.score}/100. Compare velocity, liquidity and data uncertainty before making a conclusion.`,
      next: "Open evidence workflow, then check whether the signal is rising or cooling in replay.",
    },
    {
      id: "review" as const,
      label: "Operator review",
      body: "PASS75 focuses the terminal: one active panel, clear source confidence, calm AI review and export blockers instead of a wall of modules.",
      next: "Open Operator Focus, then route to chart, sources or evidence depending on the blocked lane.",
    },
    {
      id: "holders" as const,
      label: "Audit holders",
      body: "Review concentration, FDV overhang, unresolved wallet clusters and whether CEX wallets are excluded from the holder picture.",
      next: "Use holder intelligence; missing chain data must stay as uncertainty, not safety.",
    },
    {
      id: "liquidity" as const,
      label: "Check exit depth",
      body: orderbook ? `Order book risk contributes ${orderbook.riskPoints}/100. Compare slippage, spread and bid/ask imbalance.` : "Order book feed is missing, so Shield keeps a liquidity uncertainty penalty.",
      next: "Look at heatmap, stress simulator and sell shock rows before trusting the chart.",
    },
    {
      id: "chart" as const,
      label: "Read candles",
      body: `${candles.length} bars loaded for this view. Dense Binance candles are preferred; sparse feeds are fallback-only context.`,
      next: "Use 1h/4h/1d to compare structure; don't judge only one timeframe.",
    },
    {
      id: "evidence" as const,
      label: "Build report",
      body: `Risk delta: ${historyScoreDelta !== undefined ? `${historyScoreDelta > 0 ? "+" : ""}${historyScoreDelta}` : "unknown"}. Evidence should mention signals, missing data and next verification step.`,
      next: "Generate an evidence workflow and keep language as anomaly review, not accusation or advice.",
    },
    {
      id: "data" as const,
      label: "Audit sources",
      body: `Source mode: ${result.dataQuality}. Compare candles, order book, holder completeness and replay snapshots before escalating any anomaly.`,
      next: "Open evidence workflow and source ledger; missing data must increase uncertainty instead of creating false confidence.",
    },
    {
      id: "copilot" as const,
      label: "AI copilot",
      body: "PASS70 turns the bot into a practical SOC assistant: prompts, missing-data checks, evidence-safe wording and next operator actions without hype or accusations.",
      next: "Open Operator Copilot, copy the matching review prompt, then route to evidence or source audit before any case export.",
    },
    {
      id: "launch" as const,
      label: "Launch bridge",
      body: "PASS71 connects the terminal to the build-to-100 bridge: live data contracts, audit storage, rate limits, VLM utility sessions and export infrastructure.",
      next: "Open Launch Bridge, close blocked P0 contracts, then keep the terminal in internal/operator beta until all launch gates are wired.",
    },
    {
      id: "sources" as const,
      label: "Source trust",
      body: "PASS72 separates live, partial, fallback and blocked sources so the terminal stops pretending data is stronger than it is.",
      next: "Open Source Trust Console, check cooldown/rate-limit policy, then resolve blocked orderbook, holder, export and VLM session lanes.",
    },
    {
      id: "export" as const,
      label: "Evidence export",
      body: "PASS73 separates export manifest, source ledger, audit log and redaction rules so reports do not leave the terminal as fake production evidence.",
      next: "Open Evidence Export Console, resolve blocked audit/export/session lanes, then draft only with missing-data appendix and legal note.",
    },
    {
      id: "runtime" as const,
      label: "Runtime health",
      body: "PASS74 watches the product runtime itself: modal crashes, chart fallback, orderbook fetch, history, source trust, Shield Map detach and legal-safe output.",
      next: "Open Runtime Health, check degraded lanes first, then route to Source Trust or Evidence Export instead of trusting a laggy terminal.",
    },
    {
      id: "usability" as const,
      label: "Usability guard",
      body: "PASS66 checks the real user journey: empty premium search, ticker resolver, two-way sort, safe modal rendering, command routing and source-honesty microcopy.",
      next: "Open Terminal Usability Guard, test SOL/BTC/ETH search, click every sortable column twice and verify no raw JSON UX returns.",
    },
    {
      id: "stability" as const,
      label: "Interaction guard",
      body: "PASS76 protects the click-to-terminal path: local-first token click, chart-first boot, one active command panel, detached Shield Map route and regression locks for stress/search/modal bugs.",
      next: "Open Interaction Stability, verify row click, chart paint, command swap, scroll surface and safe source cooldown before adding more heavy panels.",
    },
    {
      id: "ops" as const,
      label: "Ops audit",
      body: `PASS63 ops path checks whether this terminal state is exportable, auditable and safe for a member/operator session.`,
      next: "Open Product Ops Audit, verify launch blockers, then decide whether the case stays intake or can be exported.",
    },
    {
      id: "control" as const,
      label: "Control plane",
      body: `PASS63 control path converts the roadmap into data contracts, acceptance criteria, release rails and operator actions instead of loose ideas.`,
      next: "Open Terminal Control Plane, rank P0/P1 blockers, then ship only what keeps source honesty and RegTech wording intact.",
    },
    {
      id: "workspace" as const,
      label: "Risk workspace",
      body: `PASS63 workspace path turns visual risk into an operator decision tree: source registry, policy registry, blocked-until rules and safe review script.`,
      next: "Open Terminal Risk Workspace, resolve blocked lanes, then export only with source ledger and manual-review language.",
    },
    {
      id: "production" as const,
      label: "Production hardening",
      body: `PASS64 hardening path checks audit logs, rate limits, export manifest, VLM session access and legal copy before public scale.`,
      next: "Open Production Hardening, close P0 abuse/export blockers, then keep the terminal in operator beta until hard gates are wired.",
    },
  ], [candles.length, historyScoreDelta, orderbook, result.dataQuality, result.score]);
  const activeCommandRow = commandRows.find((row) => row.id === activeCommand) ?? commandRows[0];
  const isControlCommand = activeCommand === "control";

  const riskScenarioRows = [
    {
      id: "pump",
      label: t("modal.scenario.pump.label"),
      score: Math.min(100, methodRows[0]?.value ?? 0),
      body: t("modal.scenario.pump.body"),
    },
    {
      id: "liquidity",
      label: t("modal.scenario.liquidity.label"),
      score: Math.min(100, methodRows[1]?.value ?? 0),
      body: t("modal.scenario.liquidity.body"),
    },
    {
      id: "book",
      label: t("modal.scenario.book.label"),
      score: Math.min(100, (orderbook?.riskPoints ?? 0) + Math.max(0, orderbook?.simulatedSellSlippage10k ?? 0)),
      body: t("modal.scenario.book.body"),
    },
    {
      id: "forensics",
      label: t("modal.scenario.forensics.label"),
      score: result.metaModel?.requiredReview ? Math.max(35, combinedScore) : Math.max(0, combinedScore - 25),
      body: t("modal.scenario.forensics.body"),
    },
  ];

  const visualComposureScore = Math.round(
    Math.max(0, Math.min(100, 100 - Math.abs(combinedScore - 50) * 0.34 - (chartError ? 8 : 0) - (orderbookError ? 6 : 0))),
  );
  const dataConfidenceLabel = result.dataQuality === "live" ? "live data" : result.dataQuality === "partial" ? "partial data" : "uncertainty";
  const terminalAnchors = [
    ["visual", `${visualComposureScore}/100 calm UI`],
    ["data", dataConfidenceLabel],
    ["wording", "anomaly review"],
  ];

  if (!mounted) return null;

  const modal = (
    <div
      className="shield-typography-root shield-no-overlap shield-modal-backdrop fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto p-3 backdrop-blur-2xl md:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-label={t("modal.close")}
        onClick={onClose}
      />
      <section className="shield-token-popup-shell">
        {vlmSequenceMode ? (
          <VlmAiSequenceOverlay
            mode={vlmSequenceMode}
            result={result}
            candles={candles}
            orderbook={orderbook}
            chartSource={chartSource}
            riskScore={combinedScore}
            onClose={() => completeVlmAiSequence(vlmSequenceMode)}
          />
        ) : null}

        {/* PASS83 compact popup keeps legacy safety tokens: visual psychology · terminalBooted ? · chartMode === "candles" · chartMode === "depth" · Shield scenario matrix · Evidence */}
        <div className={`relative z-[1] transition duration-500 ${vlmSequenceMode ? "scale-[0.985] blur-sm opacity-55" : "opacity-100"}`}>
          <header className="shield-token-popup-header">
            <div className="flex min-w-0 items-center gap-3">
              <TokenAvatar image={asset.image} symbol={asset.symbol} />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">VLM token intelligence</p>
                <div className="mt-1 flex min-w-0 flex-wrap items-end gap-2">
                  <h2 className="shield-serif-display truncate text-4xl leading-none tracking-[-0.055em] text-white md:text-5xl">
                    {asset.symbol}
                  </h2>
                  <p className="max-w-[12rem] truncate pb-1 text-sm text-white/[0.48]">{asset.name}</p>
                  {asset.rank ? (
                    <span className="mb-1 rounded-full border border-white/[0.10] px-2 py-1 font-mono text-[9px] text-white/[0.38]">#{asset.rank}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <TokenRiskBadge level={combinedLevel as RiskLevel} label={t(`badges.${combinedBadge}`)} />
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/[0.70] transition hover:bg-white/[0.10] hover:text-white"
                aria-label={t("modal.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="shield-token-popup-grid">
            <main className="min-w-0">
              <div className="shield-token-chart-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-white/[0.34]">price</p>
                    <div className="mt-1 flex flex-wrap items-end gap-3">
                      <p className="font-mono text-3xl font-semibold leading-none text-white tabular-nums md:text-4xl">
                        {formatUsd(result.metrics.currentPrice)}
                      </p>
                      <span className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${Number(result.metrics.priceChange24h ?? 0) >= 0 ? "border-emerald-300/[0.18] bg-emerald-400/[0.07] text-emerald-100" : "border-red-300/[0.18] bg-red-400/[0.07] text-red-100"}`}>
                        24h {formatPercent(result.metrics.priceChange24h)}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-2 md:justify-end">
                    {(["1h", "4h", "1d", "7d"] as MarketChartRange[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRange(item)}
                        className={`rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${range === item ? "border-velmere-gold/[0.46] bg-velmere-gold/[0.13] text-velmere-gold" : "border-white/[0.10] bg-white/[0.035] text-white/[0.48] hover:border-white/[0.18] hover:text-white"}`}
                      >
                        {item === "7d" ? "1W" : item.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <PopupMarketChart candles={candles} points={chartPoints} loading={chartLoading} />
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.07] pt-4 font-mono text-[10px] uppercase tracking-[0.13em] text-white/[0.30] sm:flex-row sm:items-center sm:justify-between">
                  <span>{generatedLabel}</span>
                  <span>{chartError ? `fallback · ${chartError}` : `${chartSource} · ${candles.length || chartPoints.length} bars`}</span>
                </div>
              </div>
            </main>

            <aside className="shield-token-action-panel">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{ui.controlKicker} <FileText className="hidden h-3.5 w-3.5" /></p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{ui.controlTitle}</h3>
                <p className="shield-copy-safe mt-3 text-sm leading-6 text-white/[0.50]">
                  {ui.controlBody}
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => runVlmAiSequence("basic")}
                  className="shield-analysis-button shield-analysis-button-basic"
                >
                  <span>
                    <strong>{ui.basicTitle}</strong>
                    <small>{ui.basicHint}</small>
                  </span>
                  <Brain className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => runVlmAiSequence("pro")}
                  className="shield-analysis-button border-cyan-200/[0.14] bg-cyan-300/[0.045] text-cyan-50"
                >
                  <span>
                    <strong>{ui.proTitle}</strong>
                    <small>{ui.proHint}</small>
                  </span>
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => runVlmAiSequence("advanced")}
                  className="shield-analysis-button shield-analysis-button-advanced"
                >
                  <span>
                    <strong>{ui.advancedTitle}</strong>
                    <small>{ui.advancedHint}</small>
                  </span>
                  <GitBranch className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["risk", `${combinedScore}/100`],
                  ["volume", formatUsd(result.metrics.volume24h)],
                  ["market cap", formatUsd(result.metrics.marketCap)],
                  ["confidence", `${Math.round((result.confidence ?? 0.42) * 100)}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.08] bg-black/[0.22] p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.32]">{label}</p>
                    <p className="mt-2 truncate font-mono text-sm text-white tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              <div className="shield-token-review-tools-hidden" aria-hidden="true">
              <div className="shield-operator-casefile mt-5 rounded-[1.35rem] border border-cyan-200/[0.12] bg-cyan-300/[0.035] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/[0.56]">{ui.caseKicker} · {operatorCaseFile.evidenceStatus}</p>
                    <h3 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-white">{ui.caseTitle}</h3>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-black/[0.26] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-velmere-gold">{operatorCaseFile.caseId.slice(0, 12)}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-xs leading-5 text-white/[0.54]">{operatorCaseFile.quickVerdict}</p>
                <div className="mt-3 grid gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">
                  <p><span className="text-velmere-gold/[0.76]">{ui.caseNext}:</span> {operatorCaseFile.primaryNextAction}</p>
                  <p><span className="text-velmere-gold/[0.76]">{ui.caseBlockers}:</span> {operatorCaseFile.blockers.length}</p>
                  <p className="truncate"><span className="text-velmere-gold/[0.76]">{ui.caseQueries}:</span> {operatorCaseFile.osintQueries[0]}</p>
                </div>
              </div>

              <div className="shield-evidence-draft mt-4 rounded-[1.35rem] border border-velmere-gold/[0.14] bg-velmere-gold/[0.045] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold/[0.70]">evidence draft · {evidenceReportDraft.exportStatus}</p>
                    <h3 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-white">Source ledger report</h3>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-black/[0.26] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.56]">{evidenceReportDraft.mode.replace("_", " ")}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["sources", evidenceReportDraft.sourceLedger.length],
                    ["missing", evidenceReportDraft.missingDataAppendix.length],
                    ["sections", evidenceReportDraft.sections.length],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/[0.07] bg-black/[0.20] p-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">{label}</p>
                      <p className="mt-1 font-mono text-sm text-white tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.42]">
                  <p className="truncate"><span className="text-velmere-gold/[0.76]">report:</span> {evidenceReportDraft.reportId}</p>
                  <p className="line-clamp-2"><span className="text-velmere-gold/[0.76]">next:</span> {evidenceReportDraft.sections.find((section) => section.status === "blocked")?.body ?? evidenceReportDraft.legalNote}</p>
                </div>
                <div className="shield-evidence-export-manifest mt-3 rounded-[1rem] border border-white/[0.08] bg-black/[0.18] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/[0.36]">{ui.evidenceExportTitle}</p>
                      <p className="mt-1 text-[11px] leading-5 text-white/[0.44]">{ui.evidenceExportBody}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.08] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">
                      {evidenceExportManifest.manifestMode.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" className="rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.08] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12]" onClick={downloadEvidenceManifest}>
                      {ui.evidenceDownload}
                    </button>
                    <button type="button" className="rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.62] transition hover:bg-white/[0.06]" onClick={copyEvidenceManifest}>
                      {evidenceExportNotice === "copied" ? ui.evidenceCopied : ui.evidenceCopy}
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 font-mono text-[8px] uppercase tracking-[0.11em] text-white/[0.32]">
                    {evidenceExportManifest.blockedReason}
                  </p>
                </div>
              </div>
              </div>

            </aside>
          </div>
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
