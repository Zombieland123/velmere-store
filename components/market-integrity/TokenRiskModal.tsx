"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  ExternalLink,
  Gauge,
  Loader2,
  Network,
  ShieldCheck,
  Sigma,
  WalletCards,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import TokenRiskBadge from "@/components/market-integrity/TokenRiskBadge";
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

function proxiedIcon(image?: string) {
  if (!image) return undefined;
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
    <img
      src={src}
      alt=""
      className="mt-1 h-11 w-11 shrink-0 rounded-full bg-white/[0.06] object-cover"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function pointsFromPrices(values: number[]): ChartPoint[] {
  const now = Date.now();
  const step =
    values.length > 1 ? (7 * 24 * 60 * 60 * 1000) / (values.length - 1) : 1;
  return values.map((price, index) => ({
    timestamp: now - (values.length - index - 1) * step,
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
    const high = Math.max(open, close, next);
    const low = Math.min(open, close, next);
    return {
      timestamp: point.timestamp,
      open,
      high,
      low,
      close,
      volume: point.volume ?? Math.abs(close - open) * 1000000,
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
      <div className="flex h-[24rem] items-center justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] text-sm text-white/[0.38]">
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
      <svg viewBox="0 0 760 350" className="relative h-[24rem] w-full" aria-hidden="true">
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
}: {
  candles: Candle[];
  loading?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const clean = candles.filter(
    (candle) =>
      Number.isFinite(candle.open) &&
      Number.isFinite(candle.high) &&
      Number.isFinite(candle.low) &&
      Number.isFinite(candle.close),
  );
  if (clean.length < 2)
    return (
      <div className="flex h-[24rem] items-center justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] text-sm text-white/[0.38]">
        No candlestick data available for this asset yet.
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
  const range = max - min || 1;
  const maxVolume = Math.max(...clean.map((candle) => candle.volume || 0), 1);
  const step = plotWidth / clean.length;
  const bodyWidth = Math.max(2.2, Math.min(11, step * 0.62));
  const yPrice = (value: number) =>
    priceHeight - ((value - min) / range) * (priceHeight - 28) + 14;
  const priceTicks = Array.from({ length: 5 }).map((_, index) =>
    min + ((max - min) * (4 - index)) / 4,
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
  const dateLabel = hover
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(hover.timestamp))
    : "—";
  const hoverUp = hover ? hover.close >= hover.open : true;

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.10] bg-[#070708] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.07] pb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.42]">
        <span className="text-white/[0.70]">OHLC</span>
        <span>O <strong className="text-white/[0.78]">{formatUsd(hover?.open)}</strong></span>
        <span>H <strong className="text-emerald-200">{formatUsd(hover?.high)}</strong></span>
        <span>L <strong className="text-red-200">{formatUsd(hover?.low)}</strong></span>
        <span>C <strong className={hoverUp ? "text-emerald-200" : "text-red-200"}>{formatUsd(hover?.close)}</strong></span>
        <span>V <strong className="text-white/[0.70]">{formatNumber(hover?.volume, { notation: "compact", maximumFractionDigits: 2 })}</strong></span>
        <span className="ml-auto text-white/[0.30]">{dateLabel}</span>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:62px_62px]" />
      {loading ? (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-black/[0.58] px-3 py-2 text-xs text-white/[0.58]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> candles
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative h-[26rem] w-full touch-none select-none"
        aria-hidden="true"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * width;
          const next = Math.max(0, Math.min(clean.length - 1, Math.round((x / plotWidth) * clean.length - 0.5)));
          setHoverIndex(next);
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <rect x="0" y="0" width={plotWidth} height={priceHeight} fill="rgba(255,255,255,0.008)" />
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
        {hoverX !== undefined && hover ? (
          <g>
            <line x1={hoverX} x2={hoverX} y1="0" y2={priceHeight + volumeHeight + gap} stroke="rgba(255,255,255,0.22)" strokeDasharray="5 6" />
            <line x1="0" x2={plotWidth} y1={yPrice(hover.close)} y2={yPrice(hover.close)} stroke="rgba(255,255,255,0.16)" strokeDasharray="5 6" />
            <rect x={Math.min(plotWidth - 172, Math.max(8, hoverX + 12))} y="16" width="164" height="84" rx="12" fill="rgba(10,10,12,0.92)" stroke="rgba(255,255,255,0.12)" />
            <text x={Math.min(plotWidth - 156, Math.max(24, hoverX + 28))} y="39" fill="rgba(255,255,255,0.70)" fontSize="11" fontFamily="monospace">{dateLabel}</text>
            <text x={Math.min(plotWidth - 156, Math.max(24, hoverX + 28))} y="60" fill={hoverUp ? "#1ee6a7" : "#ff4d6d"} fontSize="11" fontFamily="monospace">Close {formatUsd(hover.close)}</text>
            <text x={Math.min(plotWidth - 156, Math.max(24, hoverX + 28))} y="81" fill="rgba(255,255,255,0.55)" fontSize="11" fontFamily="monospace">Vol {formatNumber(hover.volume, { notation: "compact", maximumFractionDigits: 2 })}</text>
          </g>
        ) : null}
        <text x="0" y={height - 2} fill="rgba(255,255,255,0.30)" fontSize="10" fontFamily="monospace">PRICE / VOLUME · MA · ANOMALY MARKERS</text>
        <text x={plotWidth + scaleWidth - 8} y={height - 2} textAnchor="end" fill="rgba(255,255,255,0.30)" fontSize="10" fontFamily="monospace">EXCHANGE MODE</text>
      </svg>
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
      <div className="flex h-[24rem] items-center justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] text-sm text-white/[0.38]">
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
      <svg viewBox="0 0 760 350" className="relative h-[24rem] w-full" aria-hidden="true">
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
      <div className="flex h-[24rem] items-center justify-center rounded-[1.5rem] border border-white/[0.10] bg-black/[0.18] px-6 text-center text-sm leading-7 text-white/[0.38]">
        {loading ? "Loading order book depth..." : "Depth chart is available only when the asset has a supported live order book pair."}
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
      <svg viewBox={`0 0 ${width} ${height}`} className="relative h-[26rem] w-full" aria-hidden="true">
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

export default function TokenRiskModal({
  item,
  onClose,
}: {
  item: ModalItem;
  onClose: () => void;
}) {
  const t = useTranslations("MarketIntegrity");
  const locale = useLocale();
  const result = isMarketRow(item) ? item.result : item;
  const row = isMarketRow(item) ? item : null;
  const asset = result.token;
  const [range, setRange] = useState<MarketChartRange>("7d");
  const [chartMode, setChartMode] = useState<"line" | "candles" | "depth" | "volume">("line");
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>(() =>
    pointsFromPrices(row?.sparkline7d ?? result.chart?.sevenDay ?? []),
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [onClose]);

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
        if (active && klineResponse.ok && klineData.mode === "live") {
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
          const fallback = pointsFromPrices(row?.sparkline7d ?? result.chart?.sevenDay ?? []);
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
          setChartPoints(data.points);
          setCandles(candlesFromPoints(data.points));
          setChartSource(data.source);
        }
      } catch (error) {
        if (active) {
          setChartError(
            error instanceof Error ? error.message : "Chart request failed",
          );
          const fallback = pointsFromPrices(row?.sparkline7d ?? result.chart?.sevenDay ?? []);
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
  }, [asset.marketId, asset.symbol, range, result.chart?.sevenDay, row?.sparkline7d]);

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
    void loadOrderBook();
    return () => {
      active = false;
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
    void loadHistory();
    return () => {
      active = false;
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
  const riskScenarioRows = [
    {
      id: "pump",
      label: "Pump velocity",
      score: Math.min(100, methodRows[0]?.value ?? 0),
      body: "Czy wzrost ceny wygląda organicznie, czy jak szybka dystrybucja przed zrzutem.",
    },
    {
      id: "liquidity",
      label: "Exit liquidity",
      score: Math.min(100, methodRows[1]?.value ?? 0),
      body: "Czy rynek ma realną głębokość, czy tylko wygląda płynnie na wykresie.",
    },
    {
      id: "book",
      label: "Order book stress",
      score: Math.min(100, (orderbook?.riskPoints ?? 0) + Math.max(0, orderbook?.simulatedSellSlippage10k ?? 0)),
      body: "Symulacja poślizgu i imbalance między bid/ask; im wyżej, tym trudniej wyjść z pozycji.",
    },
    {
      id: "forensics",
      label: "Forensic review need",
      score: result.metaModel?.requiredReview ? Math.max(35, combinedScore) : Math.max(0, combinedScore - 25),
      body: "Czy wynik wymaga ręcznego review źródeł, holderów, kontraktu i historii anomalii.",
    },
  ];

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-[#050506] p-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-2xl md:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-label={t("modal.close")}
        onClick={onClose}
      />
      <section className="relative my-2 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#0b0b0d] shadow-[0_40px_120px_rgba(0,0,0,0.72)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 md:p-7">
          <div className="flex min-w-0 gap-4">
            <TokenAvatar image={asset.image} symbol={asset.symbol} />
            <div>
              <p className="velmere-label text-velmere-gold">
                {t("modal.kicker")}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <h2 className="font-serif text-4xl leading-none tracking-[-0.045em] md:text-6xl">
                  {asset.symbol}
                </h2>
                <p className="pb-1 text-sm text-white/[0.50]">{asset.name}</p>
                {asset.rank ? (
                  <span className="rounded-full border border-white/[0.10] px-2 py-1 font-mono text-[10px] text-white/[0.42]">
                    #{asset.rank}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-white/[0.38]">
                {t("dataQuality", {
                  quality: t(`quality.${result.dataQuality}`),
                })}{" "}
                · {generatedLabel}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={`/api/market-integrity/report?query=${encodeURIComponent(asset.marketId ?? asset.tokenAddress ?? asset.symbol)}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.48] transition hover:border-velmere-gold/[0.30] hover:text-velmere-gold md:inline-flex"
            >
              Evidence <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <TokenRiskBadge
              level={combinedLevel as RiskLevel}
              label={t(`badges.${combinedBadge}`)}
            />
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/[0.70] transition hover:bg-white/[0.10] hover:text-white"
              aria-label={t("modal.close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 md:p-7">
          <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {ranges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRange(item)}
                    className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${range === item ? "border-velmere-gold/[0.45] bg-velmere-gold/[0.12] text-velmere-gold" : "border-white/[0.10] bg-white/[0.03] text-white/[0.46] hover:text-white"}`}
                  >
                    {item}
                  </button>
                ))}
                <div className="ml-auto inline-flex rounded-full border border-white/[0.10] bg-black/[0.26] p-1">
                  <button
                    type="button"
                    onClick={() => setChartMode("line")}
                    className={`rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${chartMode === "line" ? "bg-white text-black" : "text-white/[0.48] hover:text-white"}`}
                  >
                    {t("modal.chartModes.line")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("candles")}
                    className={`rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${chartMode === "candles" ? "bg-velmere-gold text-black" : "text-white/[0.48] hover:text-white"}`}
                  >
                    {t("modal.chartModes.candles")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("depth")}
                    className={`rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${chartMode === "depth" ? "bg-velmere-gold text-black" : "text-white/[0.48] hover:text-white"}`}
                  >
                    {t("modal.chartModes.depth")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("volume")}
                    className={`rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${chartMode === "volume" ? "bg-velmere-gold text-black" : "text-white/[0.48] hover:text-white"}`}
                  >
                    {t("modal.chartModes.volume")}
                  </button>
                </div>
              </div>
              {chartMode === "line" ? (
                <PriceChart
                  points={chartPoints}
                  change={
                    range === "7d"
                      ? result.metrics.priceChange7d
                      : result.metrics.priceChange24h
                  }
                  loading={chartLoading}
                />
              ) : chartMode === "candles" ? (
                <ExchangeCandlesChart candles={candles} loading={chartLoading} />
              ) : chartMode === "depth" ? (
                <OrderBookDepthChart orderbook={orderbook} loading={orderbookLoading} />
              ) : (
                <VolumeBarsChart points={chartPoints} loading={chartLoading} />
              )}
              <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.13em] text-white/[0.30]">
                <span>{t("modal.chartModes.source")}: {chartSource}</span>
                <span>{candles.length ? `${candles.length} ${t("modal.chartModes.bars")}` : `${chartPoints.length} ${t("modal.chartModes.points")}`}</span>
              </div>
              {chartError ? (
                <p className="mt-2 text-xs text-amber-200/[0.74]">
                  {t("modal.chartFallback")}: {chartError}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {metrics.map(({ icon, label, value }) => (
                  <MetricCard
                    key={label}
                    icon={icon}
                    label={label}
                    value={value}
                  />
                ))}
              </div>
            </div>

            <aside className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/[0.24] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.36]">
                  {t("riskScore")}
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-mono text-6xl font-semibold leading-none text-white">
                    {combinedScore}
                  </span>
                  <span className="pb-2 font-mono text-sm text-white/[0.35]">
                    /100
                  </span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-velmere-gold"
                    style={{
                      width: `${Math.max(4, Math.min(100, combinedScore))}%`,
                    }}
                  />
                </div>
                <p className="mt-4 text-xs leading-6 text-white/[0.45]">
                  {t("scoreNote")}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.035] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("modal.aiTitle")}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/[0.62]">
                  {result.aiSummary ?? t("modal.aiFallback")}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  Shield scenario matrix
                </p>
                <p className="mt-2 text-xs leading-6 text-white/[0.44]">
                  Multi-agent projection: nie przewiduje ceny, tylko pokazuje które warstwy wymagają dalszego śledztwa.
                </p>
                <div className="mt-4 grid gap-3">
                  {riskScenarioRows.map((row) => (
                    <div key={row.id} className="rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-white/[0.74]">{row.label}</span>
                        <span className="font-mono text-[10px] text-white/[0.55]">{Math.round(row.score)}/100</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div className="h-full rounded-full bg-velmere-gold" style={{ width: `${Math.max(3, Math.min(100, row.score))}%` }} />
                      </div>
                      <p className="mt-2 text-[11px] leading-5 text-white/[0.40]">{row.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("agents.title")}
                </p>
                <p className="mt-2 text-xs leading-6 text-white/[0.44]">
                  {result.metaModel?.summary ?? t("method.body")}
                </p>
                {result.confidence !== undefined ? (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.34]">
                    {t("agents.formula")}: {result.scoreFormula ?? "weighted_signal_sum"} · {t("agents.confidence")} {Math.round(result.confidence * 100)}%
                  </p>
                ) : null}
                {result.metaModel ? (
                  <div className="mt-4 grid gap-2 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-white/[0.52]">{t("agents.metaVerdict")}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${verdictTone(result.metaModel.verdict)}`}>
                        {result.metaModel.verdict.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-white/[0.52]">{t("agents.conflict")}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.62]">
                        {result.metaModel.conflictLevel}
                      </span>
                    </div>
                    <p className="text-xs leading-6 text-white/[0.42]">{result.metaModel.escalation}</p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.025] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("history.title")}
                </p>
                <p className="mt-2 text-xs leading-6 text-white/[0.44]">
                  {t("history.body")}
                </p>
                <div className="mt-4 flex items-end gap-1 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
                  {(history.length ? history : [{ score: result.score, timestamp: result.generatedAt, id: asset.marketId ?? asset.symbol, symbol: asset.symbol, level: result.level }]).map((point, index) => (
                    <span
                      key={`${point.timestamp}-${index}`}
                      className="flex-1 rounded-t bg-velmere-gold/[0.72]"
                      style={{ height: `${Math.max(8, Math.min(64, point.score))}px` }}
                      title={`${point.symbol}: ${point.score}/100`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.13em] text-white/[0.38]">
                  <span>{history.length || 1} snapshots</span>
                  <span className={historyScoreDelta && historyScoreDelta > 0 ? "text-amber-200" : "text-emerald-200"}>
                    Δ {historyScoreDelta !== undefined ? `${historyScoreDelta > 0 ? "+" : ""}${historyScoreDelta}` : "0"}
                  </span>
                </div>
              </div>
            </aside>
          </div>

          {result.agentAssessments?.length ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/[0.10] bg-black/[0.20] p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                    {t("agents.matrixTitle")}
                  </p>
                  <p className="mt-2 max-w-3xl text-xs leading-6 text-white/[0.44]">
                    {t("agents.matrixBody")}
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.36]">
                  {result.metaModel?.version ?? "fusion-v2"}
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {result.agentAssessments.map((agent) => (
                  <div
                    key={agent.id}
                    className={`rounded-2xl border p-4 ${agentToneClass(agent.status)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white/[0.86]">
                          {t(`agents.names.${agent.id}`)}
                        </p>
                        <p className={`mt-1 font-mono text-[9px] uppercase tracking-[0.14em] ${verdictTone(agent.verdict)}`}>
                          {agent.verdict.replaceAll("_", " ")}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-white">{agent.score}/100</span>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-velmere-gold"
                        style={{ width: `${Math.max(4, Math.min(100, agent.score))}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-6 text-white/[0.46]">{agent.reasoning}</p>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.34]">
                      <span>{t("agents.confidence")} {Math.round(agent.confidence * 100)}%</span>
                      <span>•</span>
                      <span>{t("agents.evidence")} {agent.evidenceCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.03] p-5">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-velmere-gold" />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("deep.orderbook.title")}
                </p>
              </div>
              {orderbookLoading ? (
                <p className="mt-4 text-sm text-white/[0.42]">
                  {t("deep.loading")}
                </p>
              ) : orderbook ? (
                <div className="mt-4 grid gap-3 text-xs text-white/[0.56]">
                  <div className="grid grid-cols-2 gap-3">
                    <span>{t("deep.orderbook.spread")}</span>
                    <strong className="text-right text-white">
                      {formatPercent(orderbook.spreadPercent)}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <span>{t("deep.orderbook.depth")}</span>
                    <strong className="text-right text-white">
                      {formatUsd(orderbook.bidDepthUsd + orderbook.askDepthUsd)}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <span>{t("deep.orderbook.sellSlip")}</span>
                    <strong className="text-right text-white">
                      {formatPercent(orderbook.simulatedSellSlippage10k)}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <span>{t("deep.orderbook.imbalance")}</span>
                    <strong className="text-right text-white">
                      {formatPercent(orderbook.bidAskImbalancePercent)}
                    </strong>
                  </div>
                  {orderbook.signals.length ? (
                    <div className="mt-2 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.06] p-3 text-amber-100">
                      {orderbook.signals
                        .map((signal) => signal.label)
                        .join(" · ")}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-2xl border border-emerald-300/[0.16] bg-emerald-400/[0.06] p-3 text-emerald-100">
                      {t("deep.orderbook.clean")}
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-white/[0.42]">
                  {orderbookError ?? t("deep.orderbook.unavailable")}
                </p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.03] p-5">
              <div className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-velmere-gold" />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("deep.holders.title")}
                </p>
              </div>
              <div className="mt-4 grid gap-3 text-xs text-white/[0.56]">
                <div className="grid grid-cols-2 gap-3">
                  <span>{t("deep.holders.top10")}</span>
                  <strong className="text-right text-white">
                    {formatPercent(result.metrics.top10HolderPercent)}
                  </strong>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <span>{t("deep.holders.count")}</span>
                  <strong className="text-right text-white">
                    {formatNumber(result.metrics.holderCount)}
                  </strong>
                </div>
                <p className="rounded-2xl border border-white/[0.08] bg-black/[0.22] p-3 leading-6 text-white/[0.42]">
                  {t("deep.holders.note")}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.10] bg-white/[0.03] p-5">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-velmere-gold" />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold">
                  {t("deep.contract.title")}
                </p>
              </div>
              <div className="mt-4 grid gap-3 text-xs text-white/[0.56]">
                <div className="grid grid-cols-2 gap-3">
                  <span>{t("deep.contract.sellTax")}</span>
                  <strong className="text-right text-white">
                    {formatPercent(result.metrics.sellTaxPercentage)}
                  </strong>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <span>{t("deep.contract.buyTax")}</span>
                  <strong className="text-right text-white">
                    {formatPercent(result.metrics.buyTaxPercentage)}
                  </strong>
                </div>
                <p className="rounded-2xl border border-white/[0.08] bg-black/[0.22] p-3 leading-6 text-white/[0.42]">
                  {asset.tokenAddress
                    ? `${asset.chainId ?? "chain"}: ${asset.tokenAddress.slice(0, 10)}…${asset.tokenAddress.slice(-6)}`
                    : t("deep.contract.noAddress")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {result.signals.length ? (
              result.signals.map((signal) => (
                <div
                  key={signal.id}
                  className="rounded-2xl border border-white/[0.10] bg-black/[0.20] p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-velmere-gold" />
                    <div>
                      <p className="text-sm font-semibold text-white/[0.86]">
                        {t(`signals.${signal.id}.label`)}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-white/[0.48]">
                        {t(`signals.${signal.id}.description`)}
                      </p>
                      {signal.metrics ? (
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.34]">
                          {Object.entries(signal.metrics)
                            .slice(0, 3)
                            .map(([key, value]) => `${key}: ${String(value)}`)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                    <span className="ml-auto rounded-full border border-white/[0.10] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.45]">
                      +{signal.points}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-emerald-300/[0.16] bg-emerald-400/[0.06] p-4 text-sm text-emerald-100">
                {t("modal.noSignals")}
              </div>
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
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/[0.10] bg-black/[0.24] p-4 text-xs leading-6 text-white/[0.44] md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-velmere-gold" />
              <p>{t("legalDisclaimer")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {asset.url ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold hover:text-white"
                >
                  DEX <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {asset.marketId ? (
                <a
                  href={`https://www.coingecko.com/en/coins/${asset.marketId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-velmere-gold hover:text-white"
                >
                  CoinGecko <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
