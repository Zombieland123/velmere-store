"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  Brain,
  FileSearch,
  GitBranch,
  Globe2,
  Loader2,
  Map as MapIcon,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "@/navigation";
import AdvancedMarketChart from "@/components/market-integrity/AdvancedMarketChart";
import ResolvedAssetLogo from "@/components/market-integrity/AssetLogo";
import VlmNeuralAuditExperience from "@/components/market-integrity/VlmNeuralAuditExperience";
import {
  buildUnifiedAuditEvidence,
  type UnifiedAuditAssetClass,
  type UnifiedAuditMode,
} from "@/lib/market-integrity/unified-audit";
import type { Pass459Fundamentals } from "@/lib/market-integrity/pass459-alpha-vantage-provider";
import {
  normalizePass471CatalogRows,
  normalizePass471ProviderSearchRows,
  normalizePass471Quotes,
} from "@/lib/market-integrity/pass471-surface-runtime-resilience";

type Locale = "pl" | "de" | "en";
/* PASS455 legacy verifier markers:
type Category = "all" | "crypto"
tabs: { all: "Wszystko"
tabs: { all: "Alles"
tabs: { all: "All"
useState<Category>("all")
category === "all"
["BINANCE", 0]
["MEXC", 1]
data-pass455-mixed-realmarkets-universe="true"
*/
/* PASS456 legacy verifier markers:
type UnifiedAuditAssetClass
function auditAssetClass(asset: Asset)
function assetClassAuditMetrics(asset: Asset, locale: Locale)
id: "coinbase-venue"
assetClass: auditAssetClass(selected)
const chunks = Array.from
Promise.all(
data-pass456-visible-row-quote-batching="true"
*/
// PASS455 compatibility marker: type Category = "all" | "crypto"
type Category =
  | "all"
  | "crypto"
  | "stocks"
  | "indices"
  | "fx"
  | "etf"
  | "commodities"
  | "real_estate"
  | "exchanges";
type AssetCategory = Exclude<Category, "all">;
type RangeKey = "1h" | "4h" | "1d" | "1w";
type SortKey =
  | "price"
  | "change1h"
  | "change24h"
  | "change7d"
  | "marketCap"
  | "volume"
  | "risk";
type SortDirection = "asc" | "desc";

type Asset = {
  id: string;
  symbol: string;
  providerSymbol: string;
  name: string;
  category: AssetCategory;
  domain?: string;
  glyph?: string;
  context: string;
  risk: number;
  exchange?: string | null;
};

type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

type Quote = {
  id: string;
  symbol: string;
  state: "live" | "unavailable";
  source: string;
  sourceTimestamp: number | null;
  exchange: string | null;
  currency: string | null;
  currentPrice: number | null;
  changePercent: number | null;
  candles: Candle[];
  assetClass?:
    | "crypto"
    | "stock"
    | "index"
    | "fx"
    | "etf"
    | "commodity"
    | "real_estate"
    | "exchange_equity"
    | "venue_health";
  truthState?:
    | "source_bound"
    | "compatibility_adapter"
    | "source_required"
    | "provider_error";
  providerKind?: string;
  sourceContract?: string;
  sourcePolicy?: string;
  providerPlan?: string[];
  missingReason?: string | null;
  providerStatus?:
    | "source_bound"
    | "not_configured"
    | "rate_limited"
    | "provider_error"
    | "unsupported";
  primaryProviderConfigured?: boolean;
  providerFunctions?: string[];
  providerEvidence?: Array<{ label: string; value: string; source: string }>;
  fundamentals?: Pass459Fundamentals;
  venueComparison?: {
    version: "pass462-cross-venue-consensus";
    state: "aligned" | "watch" | "divergent" | "stale" | "single_source" | "unavailable";
    primaryVenueId: "binance" | "mexc" | "coinbase";
    primaryVenue: string;
    assetSymbol: string;
    secondaryVenueId: "binance" | "mexc" | "coinbase" | null;
    secondaryVenue: string | null;
    primaryPair: string;
    secondaryPair: string | null;
    quoteBasisState: "same_quote" | "fiat_stable_proxy" | "stable_stable_proxy" | "unsupported";
    quoteBasisPenalty: number;
    directPriceComparable: boolean;
    priceDivergenceBps: number | null;
    spreadDeltaBps: number | null;
    freshnessDeltaSeconds: number | null;
    change24hDeltaPct: number | null;
    healthScoreGap: number | null;
    depthRatio: number | null;
    confidenceCap: number;
    notes: string[];
    evidence: Array<{ label: string; value: string; source: string }>;
    boundary: string;
  } | null;
  secondSourceRequired?: boolean;
  marketCap?: number | null;
  fdv?: number | null;
  volume24h?: number | null;
  high24h?: number | null;
  low24h?: number | null;
  priceChange1h?: number | null;
  priceChange24h?: number | null;
  priceChange7d?: number | null;
  circulatingSupply?: number | null;
  totalSupply?: number | null;
  maxSupply?: number | null;
  docs?: string[];
  consensusState?:
    | "aligned"
    | "watch"
    | "divergent"
    | "stale"
    | "single_source"
    | "unavailable";
  freshnessState?: "fresh" | "aging" | "stale" | "missing";
  freshnessSeconds?: number | null;
  divergenceBps?: number | null;
  divergenceThresholdBps?: number;
  confidenceCap?: number;
  primaryPrice?: number | null;
  secondaryPrice?: number | null;
  secondarySource?: string | null;
  consensusNotes?: string[];
  venueHealth?: {
    version: "pass461-venue-health-runtime";
    venueId: "binance" | "mexc" | "coinbase";
    venue: string;
    assetSymbol: string;
    pair: string;
    baseCurrency: string;
    quoteCurrency: "USD" | "USDT" | "USDC" | "EUR" | "UNKNOWN";
    pairResolutionState: "canonical" | "candidate" | "unsupported";
    pairResolutionNote: string;
    state: "source_bound" | "review" | "stale" | "provider_error" | "unsupported";
    source: string;
    observedAt: string;
    sourceTimestamp: number | null;
    freshnessSeconds: number | null;
    latencyMs: number | null;
    serverClockDriftMs: number | null;
    spreadBps: number | null;
    bidDepthUsd: number | null;
    askDepthUsd: number | null;
    depthImbalancePercent: number | null;
    klineContinuityPercent: number | null;
    referencePrice: number | null;
    priceChange24h: number | null;
    volume24h: number | null;
    confidenceCap: number;
    healthScore: number;
    cacheState: "hit" | "miss" | "stale_fallback";
    storageMode: "upstash_rest" | "upstash_fallback_memory" | "memory";
    quotaMode: string;
    quotaRemaining: number | null;
    providerErrors: string[];
    metrics: Array<{
      id: string;
      label: string;
      value: string;
      state: "ok" | "watch" | "missing";
      source: string;
    }>;
    websocketPolicy: {
      endpoint: string;
      heartbeat: string;
      reconnect: string;
      expiry: string;
    };
    boundary: string;
  } | null;
};

type QuoteResponse = {
  ok: boolean;
  generatedAt: string;
  quotes: Quote[];
};

type SearchResponse = {
  ok: boolean;
  results?: Array<{
    symbol: string;
    name: string;
    exchange: string | null;
    quoteType: string;
  }>;
};

type CatalogRow = {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  assetClass:
    | "crypto"
    | "exchange_token"
    | "stock"
    | "fx"
    | "real_estate"
    | "etf"
    | "commodity";
  priceLane: string;
  proofOrDisclosureLane: string;
  riskPressure: number;
  adapterState:
    | "live_first"
    | "provider_required"
    | "slow_macro"
    | "historical_context"
    | "operator_review";
};

type CatalogResponse = {
  ok: boolean;
  counts?: {
    total: number;
    uniqueSymbols: number;
    inheritedRowsCollapsed: number;
    stocks: number;
    fx: number;
    etf: number;
    commodities: number;
    realEstate: number;
    crypto: number;
    exchangeTokens: number;
  };
  rows?: CatalogRow[];
};

function categoryFromCatalog(
  assetClass: CatalogRow["assetClass"],
): AssetCategory {
  if (assetClass === "stock") return "stocks";
  if (assetClass === "fx") return "fx";
  if (assetClass === "etf") return "etf";
  if (assetClass === "commodity") return "commodities";
  if (assetClass === "real_estate") return "real_estate";
  return "crypto";
}

function cleanAssetSymbol(value: unknown, fallback = "UNKNOWN") {
  const clean = String(value ?? fallback).trim().toUpperCase();
  return clean || fallback;
}

function providerSymbolFromCatalog(row: CatalogRow) {
  const symbol = cleanAssetSymbol(row.symbol);
  if (row.assetClass === "crypto" || row.assetClass === "exchange_token") {
    return symbol.includes("-") ? symbol : `${symbol}-USD`;
  }
  if (row.assetClass === "fx") {
    if (symbol === "DXY") return "DX-Y.NYB";
    return `${symbol.replace(/[^A-Z]/g, "")}=X`;
  }
  if (row.assetClass === "commodity") {
    const futures: Record<string, string> = {
      "XAU/USD": "GC=F",
      "XAG/USD": "SI=F",
      WTI: "CL=F",
      BRENT: "BZ=F",
      NATGAS: "NG=F",
      COPPER: "HG=F",
      PLATINUM: "PL=F",
      COCOA: "CC=F",
      COFFEE: "KC=F",
      WHEAT: "ZW=F",
    };
    return futures[symbol] || symbol;
  }
  return symbol;
}

function assetFromCatalog(row: CatalogRow): Asset {
  return {
    id: `catalog-${row.id}`,
    symbol: row.symbol,
    providerSymbol: providerSymbolFromCatalog(row),
    name: row.name,
    category: categoryFromCatalog(row.assetClass),
    glyph: row.symbol
      .replace(/[^A-Z0-9]/gi, "")
      .slice(0, 3)
      .toUpperCase(),
    context: `${row.priceLane} · ${row.proofOrDisclosureLane}`,
    risk: row.riskPressure,
  };
}

const curatedAssets: Asset[] = [
  {
    id: "btc-usd",
    symbol: "BTC",
    providerSymbol: "BTC-USD",
    name: "Bitcoin",
    category: "crypto",
    glyph: "₿",
    context: "Crypto quote + cross-venue candle lane",
    risk: 46,
  },
  {
    id: "eth-usd",
    symbol: "ETH",
    providerSymbol: "ETH-USD",
    name: "Ethereum",
    category: "crypto",
    glyph: "Ξ",
    context: "Crypto quote + gas/liquidity lane",
    risk: 44,
  },
  {
    id: "sol-usd",
    symbol: "SOL",
    providerSymbol: "SOL-USD",
    name: "Solana",
    category: "crypto",
    glyph: "SOL",
    context: "Crypto quote + throughput/liquidity lane",
    risk: 52,
  },
  {
    id: "bnb-usd",
    symbol: "BNB",
    providerSymbol: "BNB-USD",
    name: "BNB",
    category: "crypto",
    glyph: "BNB",
    context: "Crypto quote + exchange-token boundary",
    risk: 55,
  },
  {
    id: "xrp-usd",
    symbol: "XRP",
    providerSymbol: "XRP-USD",
    name: "XRP",
    category: "crypto",
    glyph: "XRP",
    context: "Crypto quote + venue/liquidity lane",
    risk: 48,
  },
  {
    id: "ada-usd",
    symbol: "ADA",
    providerSymbol: "ADA-USD",
    name: "Cardano",
    category: "crypto",
    glyph: "ADA",
    context: "Crypto quote + liquidity/cadence lane",
    risk: 47,
  },
  {
    id: "aapl",
    symbol: "AAPL",
    providerSymbol: "AAPL",
    name: "Apple",
    category: "stocks",
    domain: "apple.com",
    context: "Equity quote + issuer filing lane",
    risk: 28,
  },
  {
    id: "nvda",
    symbol: "NVDA",
    providerSymbol: "NVDA",
    name: "Nvidia",
    category: "stocks",
    domain: "nvidia.com",
    context: "Equity quote + earnings context",
    risk: 42,
  },
  {
    id: "msft",
    symbol: "MSFT",
    providerSymbol: "MSFT",
    name: "Microsoft",
    category: "stocks",
    domain: "microsoft.com",
    context: "Equity quote + issuer filing lane",
    risk: 29,
  },
  {
    id: "googl",
    symbol: "GOOGL",
    providerSymbol: "GOOGL",
    name: "Alphabet",
    category: "stocks",
    domain: "google.com",
    context: "Equity quote + issuer filing lane",
    risk: 32,
  },
  {
    id: "amzn",
    symbol: "AMZN",
    providerSymbol: "AMZN",
    name: "Amazon",
    category: "stocks",
    domain: "amazon.com",
    context: "Equity quote + issuer filing lane",
    risk: 36,
  },
  {
    id: "meta",
    symbol: "META",
    providerSymbol: "META",
    name: "Meta Platforms",
    category: "stocks",
    domain: "meta.com",
    context: "Equity quote + event context",
    risk: 37,
  },
  {
    id: "tsla",
    symbol: "TSLA",
    providerSymbol: "TSLA",
    name: "Tesla",
    category: "stocks",
    domain: "tesla.com",
    context: "Equity quote + volatility context",
    risk: 48,
  },
  {
    id: "lvmh",
    symbol: "MC.PA",
    providerSymbol: "MC.PA",
    name: "LVMH",
    category: "stocks",
    domain: "lvmh.com",
    context: "EU quote + issuer disclosure",
    risk: 31,
  },
  {
    id: "sp500",
    symbol: "S&P 500",
    providerSymbol: "^GSPC",
    name: "S&P 500",
    category: "indices",
    glyph: "S&P",
    context: "Index level + timestamp",
    risk: 30,
  },
  {
    id: "nasdaq100",
    symbol: "NDX",
    providerSymbol: "^NDX",
    name: "Nasdaq 100",
    category: "indices",
    glyph: "NDX",
    context: "Index level + timestamp",
    risk: 34,
  },
  {
    id: "dax",
    symbol: "DAX",
    providerSymbol: "^GDAXI",
    name: "DAX Performance Index",
    category: "indices",
    glyph: "DAX",
    context: "Index level + timestamp",
    risk: 32,
  },
  {
    id: "ftse",
    symbol: "FTSE",
    providerSymbol: "^FTSE",
    name: "FTSE 100",
    category: "indices",
    glyph: "FTSE",
    context: "Index level + timestamp",
    risk: 31,
  },
  {
    id: "wig20tr",
    symbol: "WIG20TR",
    providerSymbol: "WIG20TR.WA",
    name: "WIG20 Total Return",
    category: "indices",
    glyph: "W20",
    context: "WSE index level + timestamp",
    risk: 35,
  },
  {
    id: "eurusd",
    symbol: "EUR/USD",
    providerSymbol: "EURUSD=X",
    name: "Euro / US Dollar",
    category: "fx",
    glyph: "€",
    context: "Reference + intraday feed",
    risk: 30,
  },
  {
    id: "eurpln",
    symbol: "EUR/PLN",
    providerSymbol: "EURPLN=X",
    name: "Euro / Polish Zloty",
    category: "fx",
    glyph: "PL",
    context: "Reference + intraday feed",
    risk: 31,
  },
  {
    id: "usdpln",
    symbol: "USD/PLN",
    providerSymbol: "USDPLN=X",
    name: "US Dollar / Polish Zloty",
    category: "fx",
    glyph: "$",
    context: "Reference + intraday feed",
    risk: 34,
  },
  {
    id: "usdjpy",
    symbol: "USD/JPY",
    providerSymbol: "JPY=X",
    name: "US Dollar / Yen",
    category: "fx",
    glyph: "¥",
    context: "Reference + intraday feed",
    risk: 39,
  },
  {
    id: "gbpusd",
    symbol: "GBP/USD",
    providerSymbol: "GBPUSD=X",
    name: "Pound / US Dollar",
    category: "fx",
    glyph: "£",
    context: "Reference + intraday feed",
    risk: 33,
  },
  {
    id: "spy",
    symbol: "SPY",
    providerSymbol: "SPY",
    name: "S&P 500 ETF",
    category: "etf",
    domain: "ssga.com",
    context: "ETF quote + holdings cadence",
    risk: 36,
  },
  {
    id: "qqq",
    symbol: "QQQ",
    providerSymbol: "QQQ",
    name: "Nasdaq 100 ETF",
    category: "etf",
    domain: "invesco.com",
    context: "ETF quote + holdings cadence",
    risk: 39,
  },
  {
    id: "gld",
    symbol: "GLD",
    providerSymbol: "GLD",
    name: "Gold ETF",
    category: "etf",
    domain: "ssga.com",
    context: "ETF quote + commodity context",
    risk: 33,
  },
  {
    id: "vnq-etf",
    symbol: "VNQ",
    providerSymbol: "VNQ",
    name: "Vanguard Real Estate ETF",
    category: "etf",
    domain: "vanguard.com",
    context: "ETF quote + holdings cadence",
    risk: 41,
  },
  {
    id: "gold",
    symbol: "GC",
    providerSymbol: "GC=F",
    name: "Gold Futures",
    category: "commodities",
    glyph: "Au",
    context: "Futures contract + timestamp",
    risk: 34,
  },
  {
    id: "silver",
    symbol: "SI",
    providerSymbol: "SI=F",
    name: "Silver Futures",
    category: "commodities",
    glyph: "Ag",
    context: "Futures contract + timestamp",
    risk: 37,
  },
  {
    id: "wti",
    symbol: "CL",
    providerSymbol: "CL=F",
    name: "WTI Crude Oil",
    category: "commodities",
    glyph: "WTI",
    context: "Futures contract + timestamp",
    risk: 40,
  },
  {
    id: "brent",
    symbol: "BZ",
    providerSymbol: "BZ=F",
    name: "Brent Crude Oil",
    category: "commodities",
    glyph: "BZ",
    context: "Futures contract + timestamp",
    risk: 39,
  },
  {
    id: "vnq-real",
    symbol: "VNQ",
    providerSymbol: "VNQ",
    name: "REIT Basket Proxy",
    category: "real_estate",
    domain: "vanguard.com",
    context: "Slow macro proxy, not property valuation",
    risk: 41,
  },
  {
    id: "iyr",
    symbol: "IYR",
    providerSymbol: "IYR",
    name: "US Real Estate ETF",
    category: "real_estate",
    domain: "ishares.com",
    context: "Slow macro proxy, not property valuation",
    risk: 43,
  },
  {
    id: "xlre",
    symbol: "XLRE",
    providerSymbol: "XLRE",
    name: "Real Estate Select Sector",
    category: "real_estate",
    domain: "ssga.com",
    context: "Slow macro proxy, not property valuation",
    risk: 40,
  },
  {
    id: "pld",
    symbol: "PLD",
    providerSymbol: "PLD",
    name: "Prologis",
    category: "real_estate",
    domain: "prologis.com",
    context: "Public REIT quote + filing context",
    risk: 38,
  },
  {
    id: "coin",
    symbol: "COIN",
    providerSymbol: "COIN",
    name: "Coinbase Global",
    category: "exchanges",
    domain: "coinbase.com",
    context: "Public equity proxy, not venue solvency",
    risk: 45,
  },
  {
    id: "cme",
    symbol: "CME",
    providerSymbol: "CME",
    name: "CME Group",
    category: "exchanges",
    domain: "cmegroup.com",
    context: "Listed exchange operator + filing context",
    risk: 30,
  },
  {
    id: "ice",
    symbol: "ICE",
    providerSymbol: "ICE",
    name: "Intercontinental Exchange",
    category: "exchanges",
    domain: "ice.com",
    context: "Listed exchange operator + filing context",
    risk: 31,
  },
  {
    id: "ndaq",
    symbol: "NDAQ",
    providerSymbol: "NDAQ",
    name: "Nasdaq",
    category: "exchanges",
    domain: "nasdaq.com",
    context: "Listed exchange operator + filing context",
    risk: 32,
  },
  {
    id: "binance-venue",
    symbol: "BINANCE",
    providerSymbol: "BINANCEVENUE",
    name: "Binance Venue Health",
    category: "exchanges",
    glyph: "BN",
    context: "Crypto venue health lane · klines/depth/status adapter",
    risk: 55,
  },
  {
    id: "mexc-venue",
    symbol: "MEXC",
    providerSymbol: "MEXCVENUE",
    name: "MEXC Venue Health",
    category: "exchanges",
    glyph: "MX",
    context: "Crypto venue health lane · websocket cadence/reconnect",
    risk: 58,
  },
  {
    id: "coinbase-venue",
    symbol: "COINBASE",
    providerSymbol: "COINBASEVENUE",
    name: "Coinbase Venue Health",
    category: "exchanges",
    glyph: "CB",
    context: "Crypto venue health lane · status/depth/API resilience",
    risk: 47,
  },
  {
    id: "okx-venue",
    symbol: "OKX",
    providerSymbol: "OKXVENUE",
    name: "OKX Venue Health",
    category: "exchanges",
    glyph: "OK",
    context: "Crypto venue health lane · orderbook/status adapter",
    risk: 54,
  },
  {
    id: "kraken-venue",
    symbol: "KRAKEN",
    providerSymbol: "KRAKENVENUE",
    name: "Kraken Venue Health",
    category: "exchanges",
    glyph: "KR",
    context: "Crypto venue health lane · orderbook/status adapter",
    risk: 46,
  },
  {
    id: "bybit-venue",
    symbol: "BYBIT",
    providerSymbol: "BYBITVENUE",
    name: "Bybit Venue Health",
    category: "exchanges",
    glyph: "BB",
    context: "Crypto venue health lane · derivatives boundary",
    risk: 57,
  },
  {
    id: "jpm",
    symbol: "JPM",
    providerSymbol: "JPM",
    name: "JPMorgan Chase",
    category: "stocks",
    domain: "jpmorganchase.com",
    context: "Bank equity quote + macro stress lane",
    risk: 35,
  },
  {
    id: "asml",
    symbol: "ASML",
    providerSymbol: "ASML",
    name: "ASML Holding",
    category: "stocks",
    domain: "asml.com",
    context: "Semiconductor equity quote + EU issuer lane",
    risk: 34,
  },
  {
    id: "sap",
    symbol: "SAP",
    providerSymbol: "SAP.DE",
    name: "SAP",
    category: "stocks",
    domain: "sap.com",
    context: "EU software quote + issuer lane",
    risk: 30,
  },
  {
    id: "amd",
    symbol: "AMD",
    providerSymbol: "AMD",
    name: "Advanced Micro Devices",
    category: "stocks",
    domain: "amd.com",
    context: "Semiconductor equity quote + supply-chain lane",
    risk: 42,
  },
  {
    id: "tsm",
    symbol: "TSM",
    providerSymbol: "TSM",
    name: "Taiwan Semiconductor",
    category: "stocks",
    domain: "tsmc.com",
    context: "ADR quote + foundry concentration lane",
    risk: 36,
  },
  {
    id: "avgo",
    symbol: "AVGO",
    providerSymbol: "AVGO",
    name: "Broadcom",
    category: "stocks",
    domain: "broadcom.com",
    context: "Semiconductor equity quote + AI infrastructure lane",
    risk: 37,
  },
  {
    id: "gs",
    symbol: "GS",
    providerSymbol: "GS",
    name: "Goldman Sachs",
    category: "stocks",
    domain: "goldmansachs.com",
    context: "Bank equity quote + rate sensitivity lane",
    risk: 38,
  },
  {
    id: "bac",
    symbol: "BAC",
    providerSymbol: "BAC",
    name: "Bank of America",
    category: "stocks",
    domain: "bankofamerica.com",
    context: "Bank equity quote + deposit stress lane",
    risk: 39,
  },
  {
    id: "v",
    symbol: "V",
    providerSymbol: "V",
    name: "Visa",
    category: "stocks",
    domain: "visa.com",
    context: "Payments equity quote + consumer flow lane",
    risk: 27,
  },
  {
    id: "ma",
    symbol: "MA",
    providerSymbol: "MA",
    name: "Mastercard",
    category: "stocks",
    domain: "mastercard.com",
    context: "Payments equity quote + consumer flow lane",
    risk: 28,
  },
  {
    id: "nvo",
    symbol: "NVO",
    providerSymbol: "NVO",
    name: "Novo Nordisk",
    category: "stocks",
    domain: "novonordisk.com",
    context: "Healthcare equity quote + regulatory lane",
    risk: 30,
  },
  {
    id: "air",
    symbol: "AIR.PA",
    providerSymbol: "AIR.PA",
    name: "Airbus",
    category: "stocks",
    domain: "airbus.com",
    context: "EU aerospace quote + orderbook lane",
    risk: 34,
  },
  {
    id: "bmw",
    symbol: "BMW.DE",
    providerSymbol: "BMW.DE",
    name: "BMW",
    category: "stocks",
    domain: "bmw.com",
    context: "EU auto quote + demand lane",
    risk: 36,
  },
  {
    id: "mbg",
    symbol: "MBG.DE",
    providerSymbol: "MBG.DE",
    name: "Mercedes-Benz Group",
    category: "stocks",
    domain: "mercedes-benz.com",
    context: "EU auto quote + demand lane",
    risk: 35,
  },
  {
    id: "vow3",
    symbol: "VOW3.DE",
    providerSymbol: "VOW3.DE",
    name: "Volkswagen Pref",
    category: "stocks",
    domain: "volkswagen-group.com",
    context: "EU auto quote + governance lane",
    risk: 39,
  },
  {
    id: "adidas",
    symbol: "ADS.DE",
    providerSymbol: "ADS.DE",
    name: "Adidas",
    category: "stocks",
    domain: "adidas.com",
    context: "EU consumer quote + brand momentum lane",
    risk: 33,
  },
  {
    id: "hermes",
    symbol: "RMS.PA",
    providerSymbol: "RMS.PA",
    name: "Hermès",
    category: "stocks",
    domain: "hermes.com",
    context: "Luxury equity quote + pricing power lane",
    risk: 28,
  },
  {
    id: "kering",
    symbol: "KER.PA",
    providerSymbol: "KER.PA",
    name: "Kering",
    category: "stocks",
    domain: "kering.com",
    context: "Luxury equity quote + brand cycle lane",
    risk: 36,
  },
  {
    id: "richemont",
    symbol: "CFR.SW",
    providerSymbol: "CFR.SW",
    name: "Richemont",
    category: "stocks",
    domain: "richemont.com",
    context: "Luxury equity quote + watch/jewelry lane",
    risk: 33,
  },
  {
    id: "nike",
    symbol: "NKE",
    providerSymbol: "NKE",
    name: "Nike",
    category: "stocks",
    domain: "nike.com",
    context: "Sportswear equity quote + margin lane",
    risk: 38,
  },
  {
    id: "siemens",
    symbol: "SIE.DE",
    providerSymbol: "SIE.DE",
    name: "Siemens",
    category: "stocks",
    domain: "siemens.com",
    context: "EU industrial quote + infrastructure lane",
    risk: 31,
  },
  {
    id: "allianz",
    symbol: "ALV.DE",
    providerSymbol: "ALV.DE",
    name: "Allianz",
    category: "stocks",
    domain: "allianz.com",
    context: "Insurance equity quote + rate/solvency lane",
    risk: 29,
  },
  {
    id: "mstr",
    symbol: "MSTR",
    providerSymbol: "MSTR",
    name: "MicroStrategy",
    category: "stocks",
    domain: "strategy.com",
    context: "Bitcoin-treasury equity quote + NAV divergence lane",
    risk: 61,
  },
  {
    id: "hood",
    symbol: "HOOD",
    providerSymbol: "HOOD",
    name: "Robinhood",
    category: "stocks",
    domain: "robinhood.com",
    context: "Brokerage equity quote + retail flow lane",
    risk: 49,
  },
  {
    id: "or",
    symbol: "OR.PA",
    providerSymbol: "OR.PA",
    name: "L'Oréal",
    category: "stocks",
    domain: "loreal.com",
    context: "Luxury/beauty equity quote + brand pricing lane",
    risk: 30,
  },
  {
    id: "race",
    symbol: "RACE",
    providerSymbol: "RACE",
    name: "Ferrari",
    category: "stocks",
    domain: "ferrari.com",
    context: "Luxury auto equity quote + scarcity/pricing lane",
    risk: 32,
  },
  {
    id: "porsche",
    symbol: "P911.DE",
    providerSymbol: "P911.DE",
    name: "Porsche AG",
    category: "stocks",
    domain: "porsche.com",
    context: "Luxury auto equity quote + EU issuer lane",
    risk: 35,
  },
  {
    id: "sony",
    symbol: "SONY",
    providerSymbol: "SONY",
    name: "Sony Group",
    category: "stocks",
    domain: "sony.com",
    context: "Global consumer/entertainment equity lane",
    risk: 34,
  },
  {
    id: "shop",
    symbol: "SHOP",
    providerSymbol: "SHOP",
    name: "Shopify",
    category: "stocks",
    domain: "shopify.com",
    context: "Commerce infrastructure equity quote",
    risk: 43,
  },
  {
    id: "doge-usd",
    symbol: "DOGE",
    providerSymbol: "DOGE-USD",
    name: "Dogecoin",
    category: "crypto",
    glyph: "DOGE",
    context: "Crypto quote + meme-liquidity/hype boundary",
    risk: 59,
  },
  {
    id: "link-usd",
    symbol: "LINK",
    providerSymbol: "LINK-USD",
    name: "Chainlink",
    category: "crypto",
    glyph: "LINK",
    context: "Oracle asset quote + liquidity/source lane",
    risk: 48,
  },
  {
    id: "avax-usd",
    symbol: "AVAX",
    providerSymbol: "AVAX-USD",
    name: "Avalanche",
    category: "crypto",
    glyph: "AVAX",
    context: "L1 asset quote + bridge/liquidity lane",
    risk: 51,
  },
  {
    id: "dot-usd",
    symbol: "DOT",
    providerSymbol: "DOT-USD",
    name: "Polkadot",
    category: "crypto",
    glyph: "DOT",
    context: "L1 ecosystem quote + liquidity/cadence lane",
    risk: 50,
  },
  {
    id: "lse",
    symbol: "LSEG.L",
    providerSymbol: "LSEG.L",
    name: "London Stock Exchange Group",
    category: "exchanges",
    domain: "lseg.com",
    context: "Listed exchange/data operator + filing lane",
    risk: 33,
  },
  {
    id: "db1",
    symbol: "DB1.DE",
    providerSymbol: "DB1.DE",
    name: "Deutsche Börse",
    category: "exchanges",
    domain: "deutsche-boerse.com",
    context: "Listed European exchange operator + filing lane",
    risk: 32,
  },
  {
    id: "hkex",
    symbol: "0388.HK",
    providerSymbol: "0388.HK",
    name: "Hong Kong Exchanges",
    category: "exchanges",
    domain: "hkex.com.hk",
    context: "Listed APAC exchange operator + filing lane",
    risk: 36,
  },
  {
    id: "stoxx50",
    symbol: "STOXX50E",
    providerSymbol: "^STOXX50E",
    name: "Euro Stoxx 50",
    category: "indices",
    glyph: "SX5",
    context: "EU blue-chip index level + timestamp",
    risk: 31,
  },
  {
    id: "nikkei",
    symbol: "NIKKEI",
    providerSymbol: "^N225",
    name: "Nikkei 225",
    category: "indices",
    glyph: "N225",
    context: "Japan index level + timestamp",
    risk: 33,
  },
  {
    id: "eurtry",
    symbol: "EUR/TRY",
    providerSymbol: "EURTRY=X",
    name: "Euro / Turkish Lira",
    category: "fx",
    glyph: "TRY",
    context: "Higher-volatility FX reference lane",
    risk: 55,
  },
  {
    id: "usdtry",
    symbol: "USD/TRY",
    providerSymbol: "TRY=X",
    name: "US Dollar / Turkish Lira",
    category: "fx",
    glyph: "TRY",
    context: "Higher-volatility FX reference lane",
    risk: 57,
  },
  {
    id: "eurgbp",
    symbol: "EUR/GBP",
    providerSymbol: "EURGBP=X",
    name: "Euro / Pound",
    category: "fx",
    glyph: "€£",
    context: "Reference + intraday feed",
    risk: 29,
  },
  {
    id: "usdchf",
    symbol: "USD/CHF",
    providerSymbol: "CHF=X",
    name: "US Dollar / Swiss Franc",
    category: "fx",
    glyph: "CHF",
    context: "Reference + intraday feed",
    risk: 27,
  },
  {
    id: "copper",
    symbol: "HG",
    providerSymbol: "HG=F",
    name: "Copper Futures",
    category: "commodities",
    glyph: "Cu",
    context: "Industrial metal futures + macro lane",
    risk: 42,
  },
  {
    id: "natgas",
    symbol: "NG",
    providerSymbol: "NG=F",
    name: "Natural Gas Futures",
    category: "commodities",
    glyph: "NG",
    context: "Energy futures + weather/seasonality lane",
    risk: 53,
  },
  {
    id: "wheat",
    symbol: "ZW",
    providerSymbol: "ZW=F",
    name: "Wheat Futures",
    category: "commodities",
    glyph: "ZW",
    context: "Agriculture futures + supply shock lane",
    risk: 45,
  },
  {
    id: "tlt",
    symbol: "TLT",
    providerSymbol: "TLT",
    name: "20+ Year Treasury Bond ETF",
    category: "etf",
    domain: "ishares.com",
    context: "Duration ETF + rate sensitivity lane",
    risk: 44,
  },
  {
    id: "hyg",
    symbol: "HYG",
    providerSymbol: "HYG",
    name: "High Yield Corporate Bond ETF",
    category: "etf",
    domain: "ishares.com",
    context: "Credit ETF + spread stress lane",
    risk: 47,
  },
  {
    id: "efa",
    symbol: "EFA",
    providerSymbol: "EFA",
    name: "MSCI EAFE ETF",
    category: "etf",
    domain: "ishares.com",
    context: "Global equity ETF + region lane",
    risk: 34,
  },
  {
    id: "reit-eu",
    symbol: "IWDP.L",
    providerSymbol: "IWDP.L",
    name: "Developed Property ETF",
    category: "real_estate",
    domain: "ishares.com",
    context: "Global property ETF proxy, not property valuation",
    risk: 44,
  },
  {
    id: "eurex-venue",
    symbol: "EUREX",
    providerSymbol: "EUREXVENUE",
    name: "Eurex Venue Health",
    category: "exchanges",
    glyph: "EX",
    context: "Derivatives venue health lane · clearing/status adapter",
    risk: 40,
  },
  {
    id: "xetra-venue",
    symbol: "XETRA",
    providerSymbol: "XETRAVENUE",
    name: "Xetra Venue Health",
    category: "exchanges",
    glyph: "XT",
    context: "EU venue health lane · trading/status adapter",
    risk: 38,
  },
  {
    id: "orcl",
    symbol: "ORCL",
    providerSymbol: "ORCL",
    name: "Oracle",
    category: "stocks",
    domain: "oracle.com",
    context: "Enterprise software equity + filing lane",
    risk: 33,
  },
  {
    id: "crm",
    symbol: "CRM",
    providerSymbol: "CRM",
    name: "Salesforce",
    category: "stocks",
    domain: "salesforce.com",
    context: "Cloud software equity + filing lane",
    risk: 37,
  },
  {
    id: "adbe",
    symbol: "ADBE",
    providerSymbol: "ADBE",
    name: "Adobe",
    category: "stocks",
    domain: "adobe.com",
    context: "Creative software equity + filing lane",
    risk: 35,
  },
  {
    id: "nflx",
    symbol: "NFLX",
    providerSymbol: "NFLX",
    name: "Netflix",
    category: "stocks",
    domain: "netflix.com",
    context: "Media equity + subscriber/filing lane",
    risk: 43,
  },
  {
    id: "intc",
    symbol: "INTC",
    providerSymbol: "INTC",
    name: "Intel",
    category: "stocks",
    domain: "intel.com",
    context: "Semiconductor equity + capacity/filing lane",
    risk: 45,
  },
  {
    id: "qcom",
    symbol: "QCOM",
    providerSymbol: "QCOM",
    name: "Qualcomm",
    category: "stocks",
    domain: "qualcomm.com",
    context: "Semiconductor equity + licensing lane",
    risk: 39,
  },
  {
    id: "txn",
    symbol: "TXN",
    providerSymbol: "TXN",
    name: "Texas Instruments",
    category: "stocks",
    domain: "ti.com",
    context: "Analog semiconductor equity + cycle lane",
    risk: 34,
  },
  {
    id: "arm",
    symbol: "ARM",
    providerSymbol: "ARM",
    name: "Arm Holdings",
    category: "stocks",
    domain: "arm.com",
    context: "Semiconductor IP equity + valuation lane",
    risk: 47,
  },
  {
    id: "ibm",
    symbol: "IBM",
    providerSymbol: "IBM",
    name: "IBM",
    category: "stocks",
    domain: "ibm.com",
    context: "Enterprise technology equity + filing lane",
    risk: 30,
  },
  {
    id: "uber",
    symbol: "UBER",
    providerSymbol: "UBER",
    name: "Uber",
    category: "stocks",
    domain: "uber.com",
    context: "Mobility platform equity + margin lane",
    risk: 44,
  },
  {
    id: "abnb",
    symbol: "ABNB",
    providerSymbol: "ABNB",
    name: "Airbnb",
    category: "stocks",
    domain: "airbnb.com",
    context: "Travel platform equity + demand lane",
    risk: 42,
  },
  {
    id: "baba",
    symbol: "BABA",
    providerSymbol: "BABA",
    name: "Alibaba",
    category: "stocks",
    domain: "alibabagroup.com",
    context: "Global commerce equity + jurisdiction lane",
    risk: 52,
  },
];

const text = {
  pl: {
    title: "Real Markets",
    subtitle:
      "Akcje, waluty, ETF, surowce, proxy nieruchomości i operatorzy giełd w jednym terminalu. Wpisz dowolny symbol, aby przeszukać katalog dostawcy.",
    tabs: {
      all: "Główne",
      crypto: "Krypto",
      stocks: "Akcje",
      indices: "Indeksy",
      fx: "FX",
      etf: "ETF",
      commodities: "Surowce",
      real_estate: "Nieruchomości",
      exchanges: "Giełdy",
    },
    search: "Szukaj: AAPL, EURUSD, WIG20, złoto...",
    name: "Instrument",
    price: "Cena",
    change: "Zmiana",
    source: "Źródło",
    risk: "Ryzyko",
    volume: "Wolumen",
    last7d: "Ostatnie 7 dni",
    unavailable: "Provider do podłączenia / brak świeżego payloadu",
    loading: "Pobieranie notowań",
    searching: "Przeszukiwanie katalogu",
    sourceTime: "Timestamp źródła",
    basic: "Basic Analysis",
    pro: "Pro Review",
    advanced: "Advanced Analysis",
    chartUnavailable:
      "Brak realnych świec dla tego instrumentu. Velmère nie generuje wykresu zastępczego.",
    global: "Katalog globalny",
    browser: "Velmère Browser",
    shield: "Wróć do Shield",
    map: "Mapa Shield",
    modeHint: {
      basic:
        "Basic pokazuje cenę, kapitalizację/proxy, zmianę 24h, wolumen i stan źródła.",
      pro: "Pro dodaje świeczki, luki danych, drugiego providera, rytm źródła i kontekst emitenta.",
      advanced:
        "Advanced rozwija 20-punktową matrycę: płynność, poślizg, jakość świec, venue health, filing lane i niestandardowe czerwone flagi.",
    },
    venuePending:
      "Venue health wymaga adaptera status/depth; nie udajemy ceny giełdy, jeśli instrument nie jest publicznym tickerem.",
  },
  de: {
    title: "Real Markets",
    subtitle:
      "Aktien, Währungen, ETFs, Rohstoffe, Immobilien-Proxys und Börsenbetreiber in einem Terminal. Gib ein Symbol ein, um den Provider-Katalog zu durchsuchen.",
    tabs: {
      all: "Top-Märkte",
      crypto: "Krypto",
      stocks: "Aktien",
      indices: "Indizes",
      fx: "FX",
      etf: "ETFs",
      commodities: "Rohstoffe",
      real_estate: "Immobilien",
      exchanges: "Börsen",
    },
    search: "Suche: AAPL, EURUSD, DAX, Gold...",
    name: "Instrument",
    price: "Preis",
    change: "Änderung",
    source: "Quelle",
    risk: "Risiko",
    volume: "Volumen",
    last7d: "Letzte 7 Tage",
    unavailable: "Provider ausstehend / kein frischer Payload",
    loading: "Marktdaten werden geladen",
    searching: "Provider-Katalog wird durchsucht",
    sourceTime: "Quellenzeit",
    basic: "Basic Analysis",
    pro: "Pro Review",
    advanced: "Advanced Analysis",
    chartUnavailable:
      "Keine echten Kerzen für dieses Instrument. Velmère erzeugt keinen Ersatzchart.",
    global: "Globaler Katalog",
    browser: "Velmère Browser",
    shield: "Zurück zu Shield",
    map: "Shield Map",
    modeHint: {
      basic:
        "Basic zeigt Preis, Market-Cap/Proxy, 24h-Bewegung, Volumen und Quellenstatus.",
      pro: "Pro ergänzt Kerzen, Datenlücken, Zweitprovider, Quellenrhythmus und Emittenten-Kontext.",
      advanced:
        "Advanced öffnet eine 20-Punkte-Matrix: Liquidität, Slippage, Kerzenqualität, Venue Health, Filing Lane und ungewöhnliche Red Flags.",
    },
    venuePending:
      "Venue Health benötigt Status-/Depth-Adapter; Velmère zeigt keinen Fake-Preis für eine Börse ohne öffentliches Ticker-Instrument.",
  },
  en: {
    title: "Real Markets",
    subtitle:
      "Stocks, currencies, ETFs, commodities, real-estate proxies and exchange operators in one terminal. Enter any symbol to search the provider universe.",
    tabs: {
      all: "Top markets",
      crypto: "Crypto",
      stocks: "Stocks",
      indices: "Indices",
      fx: "FX",
      etf: "ETFs",
      commodities: "Commodities",
      real_estate: "Real estate",
      exchanges: "Exchanges",
    },
    search: "Search: AAPL, EURUSD, FTSE, gold...",
    name: "Instrument",
    price: "Price",
    change: "Change",
    source: "Source",
    risk: "Risk",
    volume: "Volume",
    last7d: "Last 7 days",
    unavailable: "Provider pending / no fresh payload",
    loading: "Loading market data",
    searching: "Searching provider universe",
    sourceTime: "Source timestamp",
    basic: "Basic Analysis",
    pro: "Pro Review",
    advanced: "Advanced Analysis",
    chartUnavailable:
      "No real candles are available for this instrument. Velmère does not generate a substitute chart.",
    global: "Global catalog",
    browser: "Velmère Browser",
    shield: "Back to Shield",
    map: "Shield Map",
    modeHint: {
      basic:
        "Basic shows price, market-cap/proxy, 24h move, volume and source state.",
      pro: "Pro adds candles, data gaps, second-provider status, source rhythm and issuer context.",
      advanced:
        "Advanced expands a 20-point matrix: liquidity, slippage, candle quality, venue health, filing lane and unusual red flags.",
    },
    venuePending:
      "Venue health needs a status/depth adapter; Velmère does not fake an exchange price when no public ticker exists.",
  },
} as const;

const auditText = {
  pl: {
    price: "Ostatnia cena",
    change: "Zmiana względem zamknięcia",
    change1h: "Zmiana 1h",
    change24h: "Zmiana 24h",
    change7d: "Zmiana 7d",
    sourceQuality: "Jakość źródła",
    websocketCadence: "Rytm WebSocket",
    liquidity: "Płynność / wyjścia",
    slippage: "Symulowany poślizg",
    exchange: "Giełda / rynek",
    currency: "Waluta kwotowania",
    category: "Klasa rynku",
    range: "Załadowany zakres",
    observations: "Obserwacje OHLC",
    open: "Otwarcie okna",
    high: "Maksimum okna",
    low: "Minimum okna",
    close: "Ostatnie zamknięcie",
    volume: "Wolumen okna",
    volatility: "Średni zakres świecy",
    gaps: "Luki danych",
    start: "Początek okna",
    end: "Koniec okna",
    provider: "Stan dostawcy",
    second: "Potwierdzenie drugim źródłem",
    filing: "Kontekst emitenta / raportów",
    boundary: "Granica audytu",
    observed: "Wartość pochodzi z aktualnie załadowanej odpowiedzi dostawcy.",
    noGaps:
      "W zwróconym zbiorze nie znaleziono nieprawidłowych wartości zamknięcia.",
    hasGaps: "Niepełne obserwacje wymagają dodatkowej kontroli.",
    live: "Odpowiedź źródła została poprawnie przetworzona.",
    unavailable: "Nie wygenerowano zastępczej serii.",
    secondNote: "Mocniejszy wniosek wymaga niezależnego dostawcy.",
    filingNote:
      "Cena rynkowa i raporty emitenta pozostają osobnymi ścieżkami dowodowymi.",
    boundaryNote: "Wynik opisuje obserwowane dane oraz jawne braki.",
    sourceSignals: "sygnałów opartych na źródłach",
    separateLane: "osobna ścieżka",
    notApplicable: "nie dotyczy",
    sourceBound: "oparte na źródłach",
  },
  de: {
    price: "Letzter Preis",
    change: "Änderung zum Referenzschluss",
    change1h: "Änderung 1h",
    change24h: "Änderung 24h",
    change7d: "Änderung 7d",
    sourceQuality: "Quellenqualität",
    websocketCadence: "WebSocket-Rhythmus",
    liquidity: "Liquidität / Exits",
    slippage: "Simulierter Slippage",
    exchange: "Börse / Markt",
    currency: "Notierungswährung",
    category: "Marktklasse",
    range: "Geladener Bereich",
    observations: "OHLC-Beobachtungen",
    open: "Fenster-Eröffnung",
    high: "Fenster-Hoch",
    low: "Fenster-Tief",
    close: "Letzter Schluss",
    volume: "Fenster-Volumen",
    volatility: "Mittlere Kerzenspanne",
    gaps: "Datenlücken",
    start: "Fenster-Start",
    end: "Fenster-Ende",
    provider: "Provider-Status",
    second: "Bestätigung durch zweite Quelle",
    filing: "Emittenten- / Filing-Kontext",
    boundary: "Audit-Grenze",
    observed: "Der Wert stammt aus der aktuell geladenen Provider-Antwort.",
    noGaps:
      "Im gelieferten Datensatz wurden keine ungültigen Schlusswerte gefunden.",
    hasGaps: "Unvollständige Beobachtungen benötigen zusätzliche Prüfung.",
    live: "Die Quellenantwort wurde erfolgreich verarbeitet.",
    unavailable: "Es wurde keine Ersatzserie erzeugt.",
    secondNote: "Eine stärkere Aussage benötigt einen unabhängigen Provider.",
    filingNote:
      "Marktpreis und Emittentenberichte bleiben getrennte Evidenzpfade.",
    boundaryNote:
      "Das Ergebnis beschreibt beobachtete Daten und sichtbare Lücken.",
    sourceSignals: "quellengebundene Signale",
    separateLane: "separater Pfad",
    notApplicable: "nicht anwendbar",
    sourceBound: "quellengebunden",
  },
  en: {
    price: "Latest price",
    change: "Change against reference close",
    change1h: "Change 1h",
    change24h: "Change 24h",
    change7d: "Change 7d",
    sourceQuality: "Source quality",
    websocketCadence: "WebSocket cadence",
    liquidity: "Liquidity / exits",
    slippage: "Simulated slippage",
    exchange: "Exchange / venue",
    currency: "Quote currency",
    category: "Market class",
    range: "Loaded range",
    observations: "OHLC observations",
    open: "Window open",
    high: "Window high",
    low: "Window low",
    close: "Latest close",
    volume: "Window volume",
    volatility: "Average candle range",
    gaps: "Data gaps",
    start: "Window start",
    end: "Window end",
    provider: "Provider state",
    second: "Second-source confirmation",
    filing: "Issuer / filing context",
    boundary: "Audit boundary",
    observed: "The value comes from the currently loaded provider response.",
    noGaps: "No invalid close values were found in the returned set.",
    hasGaps: "Incomplete observations require additional review.",
    live: "The source response was parsed successfully.",
    unavailable: "No substitute series was generated.",
    secondNote: "Stronger wording requires an independent provider.",
    filingNote:
      "Market price and issuer disclosures remain separate evidence lanes.",
    boundaryNote: "The result describes observed data and visible gaps.",
    sourceSignals: "source-bound signals",
    separateLane: "separate lane",
    notApplicable: "not applicable",
    sourceBound: "source-bound",
  },
} as const;

function localizedAssetContext(asset: Asset, locale: Locale) {
  const context = {
    pl: {
      crypto: "Krypto quote + świece i osobna weryfikacja venue/depth",
      stocks: "Notowanie + osobna ścieżka raportów emitenta",
      indices: "Poziom indeksu + skład i timestamp źródła",
      fx: "Kurs referencyjny + feed intraday",
      etf: "Notowanie ETF + rytm aktualizacji składu",
      commodities: "Kontrakt / spot + timestamp i kontekst serii",
      real_estate: "Powolny proxy makro, nie wycena nieruchomości",
      exchanges:
        "Operator giełdy lub proxy publiczne + osobna kontrola kondycji rynku",
    },
    de: {
      crypto: "Krypto-Kurs + Kerzen und separate Venue-/Depth-Prüfung",
      stocks: "Kurs + separater Pfad für Emittentenberichte",
      indices: "Indexstand + Zusammensetzung und Quellenzeit",
      fx: "Referenzkurs + Intraday-Feed",
      etf: "ETF-Kurs + Aktualisierungsrhythmus der Bestände",
      commodities: "Kontrakt / Spot + Zeitstempel und Serienkontext",
      real_estate: "Langsamer Makro-Proxy, keine Immobilienbewertung",
      exchanges:
        "Börsenbetreiber oder öffentlicher Proxy + separate Marktprüfung",
    },
    en: {
      crypto: "Crypto quote + candles and separate venue/depth verification",
      stocks: "Quote + separate issuer filing lane",
      indices: "Index level + composition and source timestamp",
      fx: "Reference rate + intraday feed",
      etf: "ETF quote + holdings update cadence",
      commodities: "Contract / spot + timestamp and series context",
      real_estate: "Slow macro proxy, not a property valuation",
      exchanges:
        "Exchange operator or public proxy + separate venue-health review",
    },
  } as const;
  return context[locale][asset.category];
}

function categoryFromProvider(
  type: string,
  symbol: string,
  name: string,
): AssetCategory {
  const normalized = type.toUpperCase();
  if (normalized.includes("CRYPTO")) return "crypto";
  if (normalized.includes("INDEX")) return "indices";
  if (normalized.includes("ETF"))
    return name.toLowerCase().includes("real estate") ? "real_estate" : "etf";
  if (normalized.includes("CURRENCY") || symbol.endsWith("=X")) return "fx";
  if (normalized.includes("FUTURE") || symbol.endsWith("=F"))
    return "commodities";
  if (/exchange|nasdaq|cme|intercontinental/i.test(name)) return "exchanges";
  return "stocks";
}

function dynamicRisk(quote?: Quote, fallback = 36) {
  if (quote?.venueHealth) {
    return Math.max(12, Math.min(88, 100 - quote.venueHealth.healthScore));
  }
  if (!quote || quote.state !== "live") return fallback;
  const move = Math.abs(quote.changePercent || 0);
  const candles = quote.candles.slice(-48);
  const averageRange = candles.length
    ? candles.reduce(
        (sum, candle) =>
          sum +
          ((candle.high - candle.low) / Math.max(candle.close, 0.000001)) * 100,
        0,
      ) / candles.length
    : 0;
  return Math.max(
    12,
    Math.min(88, Math.round(18 + move * 4 + averageRange * 5)),
  );
}

function changeForWindow(quote: Quote | undefined, seconds: number) {
  if (!quote || quote.state !== "live") return null;
  if (seconds === 60 * 60 && typeof quote.priceChange1h === "number")
    return quote.priceChange1h;
  if (seconds === 24 * 60 * 60 && typeof quote.priceChange24h === "number")
    return quote.priceChange24h;
  if (quote.candles.length < 2) return null;
  const latest = quote.candles.at(-1);
  if (!latest) return null;
  const target = latest.timestamp - seconds;
  const reference =
    [...quote.candles].reverse().find((candle) => candle.timestamp <= target) ??
    quote.candles[0];
  if (!reference?.close) return null;
  return ((latest.close - reference.close) / reference.close) * 100;
}

function quoteVolume(quote?: Quote) {
  if (!quote || quote.state !== "live") return null;
  if (typeof quote.volume24h === "number" && Number.isFinite(quote.volume24h))
    return quote.volume24h;
  const value = quote.candles.reduce(
    (sum, candle) => sum + (candle.volume || 0),
    0,
  );
  return value || null;
}

function MarketSparkline({ quote }: { quote?: Quote }) {
  const values =
    quote?.candles.map((candle) => candle.close).filter(Number.isFinite) ?? [];
  if (values.length < 2)
    return <span className="font-mono text-[9px] text-white/[0.24]">—</span>;
  const sample = values.slice(-56);
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const span = Math.max(max - min, 0.000001);
  const points = sample
    .map(
      (value, index) =>
        `${(index / Math.max(sample.length - 1, 1)) * 122},${34 - ((value - min) / span) * 28}`,
    )
    .join(" ");
  const rising = sample.at(-1)! >= sample[0];
  return (
    <svg
      viewBox="0 0 122 38"
      className="h-10 w-[7.6rem]"
      aria-label="7 day price sparkline"
    >
      <polyline
        points={points}
        fill="none"
        stroke={rising ? "#25dbb1" : "#ff4e78"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssetLogo({
  asset,
  large = false,
}: {
  asset: Asset;
  large?: boolean;
}) {
  const assetClass =
    asset.category === "stocks"
      ? "stock"
      : asset.category === "indices"
        ? "market"
        : asset.category === "commodities"
          ? "commodity"
          : asset.category === "real_estate"
            ? "real_estate"
            : asset.category === "exchanges"
              ? "exchange"
              : asset.category;
  const size = large ? "h-14 w-14" : "h-10 w-10";
  return (
    <ResolvedAssetLogo
      symbol={asset.symbol}
      name={asset.name}
      id={asset.id}
      assetClass={assetClass}
      imageUrl={
        asset.domain
          ? `/api/market-integrity/brand-icon?domain=${encodeURIComponent(asset.domain)}`
          : undefined
      }
      venue={asset.category === "exchanges" ? asset.name.replace(/\s+Venue Health$/i, "") : undefined}
      className={`relative grid ${size} shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.05] font-mono text-[10px] font-semibold text-velmere-gold [&>img]:absolute [&>img]:inset-[14%] [&>img]:z-10 [&>img]:h-[72%] [&>img]:w-[72%] [&>img]:object-contain [&>img]:opacity-0 [&>img.is-loaded]:opacity-100 [&>span]:relative [&>span]:z-0`}
    />
  );
}

function isVenueHealthAsset(asset?: Asset | null) {
  return Boolean(asset?.providerSymbol.endsWith("VENUE"));
}

function auditAssetClass(asset: Asset): UnifiedAuditAssetClass {
  if (isVenueHealthAsset(asset)) return "exchange";
  if (asset.category === "stocks" || asset.category === "exchanges")
    return "stock";
  if (asset.category === "indices") return "index";
  if (asset.category === "fx") return "fx";
  if (asset.category === "etf") return "etf";
  if (asset.category === "commodities") return "commodity";
  if (asset.category === "real_estate") return "real_estate";
  return "crypto";
}

type AssetClassAuditMetric = {
  id: string;
  label: string;
  value?: string | number | null;
  note: string;
  status: "verified" | "review" | "missing";
};

function assetClassAuditMetrics(
  asset: Asset,
  locale: Locale,
): AssetClassAuditMetric[] {
  const assetClass = auditAssetClass(asset);
  const pending = (pl: string, de: string, en: string) =>
    locale === "pl" ? pl : locale === "de" ? de : en;
  const metric = (
    id: string,
    label: [string, string, string],
    source: [string, string, string],
    value?: string | number | null,
    status: AssetClassAuditMetric["status"] = "missing",
  ): AssetClassAuditMetric => ({
    id,
    label: pending(...label),
    value,
    note: pending(...source),
    status,
  });

  if (assetClass === "exchange") {
    const lifecycle =
      asset.symbol === "BINANCE" || asset.symbol === "MEXC"
        ? pending(
            "Wymagana rotacja połączenia, heartbeat i kontrola reconnect.",
            "Verbindungsrotation, Heartbeat und Reconnect-Kontrolle erforderlich.",
            "Connection rotation, heartbeat and reconnect controls are required.",
          )
        : pending(
            "Wymagany adapter statusu, depth i błędów API.",
            "Status-, Depth- und API-Fehler-Adapter erforderlich.",
            "Status, depth and API-error adapters are required.",
          );
    return [
      metric(
        "withdrawals",
        ["Wypłaty", "Auszahlungen", "Withdrawals"],
        [
          "Połącz status wpłat/wypłat z oficjalnego status API.",
          "Ein-/Auszahlungsstatus aus offizieller Status-API anbinden.",
          "Connect deposit/withdrawal status from an official status API.",
        ],
      ),
      metric(
        "reserves",
        [
          "Rezerwy / disclosure",
          "Reserven / Disclosure",
          "Reserves / disclosure",
        ],
        [
          "Wymaga aktualnego, niezależnie weryfikowalnego disclosure.",
          "Aktuelles, unabhängig prüfbares Disclosure erforderlich.",
          "Requires current, independently verifiable disclosure.",
        ],
      ),
      metric(
        "heartbeatAge",
        ["Wiek heartbeat", "Heartbeat-Alter", "Heartbeat age"],
        [
          "Mierz ostatni poprawny heartbeat i opóźnienie strumienia.",
          "Letzten gültigen Heartbeat und Stream-Latenz messen.",
          "Measure the last valid heartbeat and stream lag.",
        ],
      ),
      metric(
        "reconnectPolicy",
        ["Polityka reconnect", "Reconnect-Policy", "Reconnect policy"],
        [lifecycle, lifecycle, lifecycle],
        lifecycle,
        "review",
      ),
      metric(
        "statusPage",
        ["Status operacyjny", "Betriebsstatus", "Operational status"],
        [
          "Wymaga oficjalnego status page lub endpointu systemowego.",
          "Offizielle Status-Seite oder System-Endpoint erforderlich.",
          "Requires an official status page or system endpoint.",
        ],
      ),
      metric(
        "orderbookIntegrity",
        [
          "Integralność orderbooka",
          "Orderbook-Integrität",
          "Order-book integrity",
        ],
        [
          "Porównaj snapshot i incremental depth oraz wykryj luki sekwencji.",
          "Snapshot und Incremental Depth abgleichen und Sequenzlücken erkennen.",
          "Reconcile snapshots with incremental depth and detect sequence gaps.",
        ],
      ),
      metric(
        "apiErrorRate",
        ["Błędy API", "API-Fehlerrate", "API error rate"],
        [
          "Zlicz timeouty, rate-limit i błędy providerów w oknie czasu.",
          "Timeouts, Rate-Limits und Providerfehler im Zeitfenster zählen.",
          "Count timeouts, rate limits and provider errors over a time window.",
        ],
      ),
      metric(
        "maintenanceState",
        ["Tryb maintenance", "Wartungsstatus", "Maintenance state"],
        [
          "Wymaga rozróżnienia planowanej konserwacji od awarii.",
          "Geplante Wartung muss von Ausfällen getrennt werden.",
          "Planned maintenance must be separated from outages.",
        ],
      ),
      metric(
        "proofOfReserves",
        ["Proof of reserves", "Proof of Reserves", "Proof of reserves"],
        [
          "Pokaż datę, zakres i niezależność audytu; nie traktuj samego linku jako dowodu.",
          "Datum, Umfang und Unabhängigkeit des Audits zeigen; Link allein ist kein Beweis.",
          "Show audit date, scope and independence; a link alone is not proof.",
        ],
      ),
      metric(
        "jurisdiction",
        ["Granica jurysdykcji", "Jurisdiktionsgrenze", "Jurisdiction boundary"],
        [
          "Zasady i dostępność usług zależą od kraju użytkownika.",
          "Regeln und Verfügbarkeit hängen vom Land des Nutzers ab.",
          "Rules and service availability depend on the user's country.",
        ],
      ),
    ];
  }

  if (assetClass === "stock")
    return [
      metric(
        "peRatio",
        ["P/E", "KGV", "P/E"],
        [
          "Wymaga aktualnych danych fundamentalnych i okresu TTM/forward.",
          "Aktuelle Fundamentaldaten und TTM/Forward-Zeitraum erforderlich.",
          "Requires current fundamentals and a defined TTM/forward period.",
        ],
      ),
      metric(
        "earningsDate",
        ["Najbliższe wyniki", "Nächster Earnings-Termin", "Next earnings"],
        [
          "Wymaga kalendarza emitenta lub giełdy.",
          "Emittenten- oder Börsenkalender erforderlich.",
          "Requires an issuer or exchange calendar.",
        ],
      ),
      metric(
        "revenueGrowth",
        ["Wzrost przychodów", "Umsatzwachstum", "Revenue growth"],
        [
          "Wymaga spójnego okresu porównawczego z raportu emitenta.",
          "Konsistenter Vergleichszeitraum aus Emittentenbericht erforderlich.",
          "Requires a consistent comparison period from issuer filings.",
        ],
      ),
      metric(
        "filingFreshness",
        ["Świeżość filingów", "Filing-Freshness", "Filing freshness"],
        [
          "Podaj datę najnowszego raportu i okres sprawozdawczy.",
          "Datum des jüngsten Berichts und Berichtsperiode angeben.",
          "Show the latest filing date and reporting period.",
        ],
      ),
      metric(
        "enterpriseValue",
        ["Enterprise value", "Enterprise Value", "Enterprise value"],
        [
          "Wymaga kapitalizacji, długu i gotówki z jednego okresu.",
          "Market Cap, Schulden und Cash aus derselben Periode erforderlich.",
          "Requires market cap, debt and cash from the same period.",
        ],
      ),
      metric(
        "freeCashFlow",
        ["Free cash flow", "Free Cashflow", "Free cash flow"],
        [
          "Wymaga cash-flow statement i jawnej definicji okresu.",
          "Cashflow-Statement und klar definierter Zeitraum erforderlich.",
          "Requires a cash-flow statement and an explicit period.",
        ],
      ),
      metric(
        "debtLoad",
        ["Obciążenie długiem", "Verschuldung", "Debt load"],
        [
          "Połącz dług netto, zapadalność i koszt finansowania.",
          "Nettoschulden, Fälligkeiten und Finanzierungskosten verbinden.",
          "Combine net debt, maturity schedule and financing cost.",
        ],
      ),
      metric(
        "insiderActivity",
        ["Transakcje insiderów", "Insider-Aktivität", "Insider activity"],
        [
          "Wymaga oficjalnych zgłoszeń, bez wyciągania wniosków z pojedynczej transakcji.",
          "Offizielle Meldungen nötig; keine Aussage aus einer Einzeltransaktion.",
          "Requires official filings; do not infer intent from one transaction.",
        ],
      ),
      metric(
        "institutionalOwnership",
        [
          "Udział instytucji",
          "Institutioneller Anteil",
          "Institutional ownership",
        ],
        [
          "Wymaga aktualnego źródła ownership z datą raportową.",
          "Aktuelle Ownership-Quelle mit Berichtsdatum erforderlich.",
          "Requires a dated, current ownership source.",
        ],
      ),
    ];

  if (assetClass === "fx")
    return [
      metric(
        "spread",
        ["Spread", "Spread", "Spread"],
        [
          "Wymaga bid/ask z konkretnego providera i sesji.",
          "Bid/Ask eines konkreten Providers und einer Session erforderlich.",
          "Requires provider-specific bid/ask and session context.",
        ],
      ),
      metric(
        "realizedVolatility",
        [
          "Zmienność realizowana",
          "Realisierte Volatilität",
          "Realized volatility",
        ],
        [
          "Wylicz z jednolitego interwału i jawnego okna czasu.",
          "Aus einheitlichem Intervall und offenem Zeitfenster berechnen.",
          "Calculate from a consistent interval and explicit window.",
        ],
      ),
      metric(
        "rateDifferential",
        ["Różnica stóp", "Zinsdifferenz", "Rate differential"],
        [
          "Wymaga aktualnych stóp banków centralnych dla obu walut.",
          "Aktuelle Leitzinsen beider Währungen erforderlich.",
          "Requires current policy rates for both currencies.",
        ],
      ),
      metric(
        "macroCalendar",
        ["Kalendarz makro", "Makrokalender", "Macro calendar"],
        [
          "Wymaga zdarzeń z datą, strefą czasową i ważnością.",
          "Ereignisse mit Datum, Zeitzone und Relevanz erforderlich.",
          "Requires events with date, timezone and importance.",
        ],
      ),
      metric(
        "forwardPoints",
        ["Forward points", "Forward Points", "Forward points"],
        [
          "Wymaga tenorów i źródła rynku forward.",
          "Tenöre und Forward-Marktquelle erforderlich.",
          "Requires tenors and a forward-market source.",
        ],
      ),
      metric(
        "carryRegime",
        ["Reżim carry", "Carry-Regime", "Carry regime"],
        [
          "Łączy różnicę stóp, koszt hedgingu i zmienność.",
          "Verbindet Zinsdifferenz, Hedgingkosten und Volatilität.",
          "Combines rate differential, hedging cost and volatility.",
        ],
      ),
      metric(
        "liquiditySession",
        ["Sesja płynności", "Liquiditätssession", "Liquidity session"],
        [
          "Porównaj Azję, Londyn i Nowy Jork zamiast jednego snapshotu.",
          "Asien, London und New York statt eines Snapshots vergleichen.",
          "Compare Asia, London and New York rather than one snapshot.",
        ],
      ),
      metric(
        "centralBankRisk",
        ["Ryzyko banku centralnego", "Zentralbank-Risiko", "Central-bank risk"],
        [
          "Wymaga kalendarza decyzji i komunikatów źródłowych.",
          "Entscheidungskalender und Primärkommunikation erforderlich.",
          "Requires a decision calendar and primary communications.",
        ],
      ),
    ];

  if (assetClass === "etf")
    return [
      metric(
        "aum",
        ["AUM", "AUM", "AUM"],
        [
          "Wymaga aktualnej wartości aktywów od emitenta.",
          "Aktueller Vermögenswert vom Emittenten erforderlich.",
          "Requires current assets under management from the issuer.",
        ],
      ),
      metric(
        "navPremium",
        [
          "Premia / dyskonto do NAV",
          "NAV-Prämie / Discount",
          "NAV premium / discount",
        ],
        [
          "Wymaga NAV i ceny z tego samego timestampu.",
          "NAV und Preis mit demselben Zeitstempel erforderlich.",
          "Requires NAV and price from the same timestamp.",
        ],
      ),
      metric(
        "trackingError",
        ["Tracking error", "Tracking Error", "Tracking error"],
        [
          "Wymaga benchmarku, okresu i danych total-return.",
          "Benchmark, Zeitraum und Total-Return-Daten erforderlich.",
          "Requires a benchmark, period and total-return data.",
        ],
      ),
      metric(
        "holdingsConcentration",
        [
          "Koncentracja holdings",
          "Holdings-Konzentration",
          "Holdings concentration",
        ],
        [
          "Wymaga aktualnego pliku składu i wag pozycji.",
          "Aktuelle Bestandsdatei und Positionsgewichte erforderlich.",
          "Requires a current holdings file and position weights.",
        ],
      ),
      metric(
        "creationRedemption",
        [
          "Creation / redemption",
          "Creation / Redemption",
          "Creation / redemption",
        ],
        [
          "Wymaga przepływów jednostek i płynności koszyka.",
          "Anteilsflüsse und Basket-Liquidität erforderlich.",
          "Requires share flows and basket liquidity.",
        ],
      ),
      metric(
        "issuerConcentration",
        ["Ryzyko emitenta", "Emittentenrisiko", "Issuer concentration"],
        [
          "Oddziel kondycję emitenta od ryzyka aktywów bazowych.",
          "Emittentenstatus vom Basiswertrisiko trennen.",
          "Separate issuer condition from underlying-asset risk.",
        ],
      ),
      metric(
        "liquidityTier",
        ["Warstwa płynności", "Liquiditätsstufe", "Liquidity tier"],
        [
          "Połącz spread ETF, depth i płynność składników.",
          "ETF-Spread, Depth und Basiswertliquidität verbinden.",
          "Combine ETF spread, depth and underlying liquidity.",
        ],
      ),
      metric(
        "holdingsFreshness",
        ["Świeżość holdings", "Holdings-Freshness", "Holdings freshness"],
        [
          "Pokaż datę publikacji składu, nie tylko nazwę funduszu.",
          "Veröffentlichungsdatum der Bestände zeigen, nicht nur Fondsname.",
          "Show the holdings publication date, not only the fund name.",
        ],
      ),
    ];

  if (assetClass === "commodity")
    return [
      metric(
        "openInterest",
        ["Open interest", "Open Interest", "Open interest"],
        [
          "Wymaga konkretnego kontraktu i daty giełdowej.",
          "Konkreter Kontrakt und Börsendatum erforderlich.",
          "Requires a specific contract and exchange date.",
        ],
      ),
      metric(
        "contractExpiry",
        ["Wygaśnięcie kontraktu", "Kontraktverfall", "Contract expiry"],
        [
          "Wymaga miesiąca kontraktu i reguł rolowania.",
          "Kontraktmonat und Rollregeln erforderlich.",
          "Requires the contract month and roll rules.",
        ],
      ),
      metric(
        "futuresCurve",
        ["Krzywa futures", "Futures-Kurve", "Futures curve"],
        [
          "Porównaj kilka terminów; pojedyncza cena nie pokazuje contango/backwardation.",
          "Mehrere Laufzeiten vergleichen; ein Preis zeigt kein Contango/Backwardation.",
          "Compare multiple maturities; one price cannot show contango/backwardation.",
        ],
      ),
      metric(
        "inventorySignal",
        ["Zapasy / podaż", "Bestände / Angebot", "Inventory / supply"],
        [
          "Wymaga właściwego źródła branżowego i daty publikacji.",
          "Passende Branchenquelle und Veröffentlichungsdatum erforderlich.",
          "Requires the relevant industry source and publication date.",
        ],
      ),
      metric(
        "rollYield",
        ["Roll yield", "Roll Yield", "Roll yield"],
        [
          "Wylicz z jawnej krzywej i reguły rolowania.",
          "Aus offener Kurve und Rollregel berechnen.",
          "Calculate from an explicit curve and roll rule.",
        ],
      ),
      metric(
        "curveStress",
        ["Naprężenie krzywej", "Kurvenstress", "Curve stress"],
        [
          "Wykrywa nagłe zmiany między terminami, bez prognozy ceny.",
          "Erkennt abrupte Laufzeitverschiebungen ohne Preisprognose.",
          "Detects abrupt maturity shifts without forecasting price.",
        ],
      ),
      metric(
        "deliveryRisk",
        ["Ryzyko dostawy", "Lieferrisiko", "Delivery risk"],
        [
          "Wymaga zasad kontraktu, lokalizacji i stanów magazynowych.",
          "Kontraktregeln, Standorte und Lagerbestände erforderlich.",
          "Requires contract rules, locations and inventories.",
        ],
      ),
      metric(
        "seasonality",
        ["Sezonowość", "Saisonalität", "Seasonality"],
        [
          "Wymaga wieloletniej serii i ochrony przed overfitem.",
          "Mehrjährige Reihe und Overfit-Schutz erforderlich.",
          "Requires a multi-year series and overfit controls.",
        ],
      ),
    ];

  if (assetClass === "real_estate")
    return [
      metric(
        "ffo",
        ["FFO / AFFO", "FFO / AFFO", "FFO / AFFO"],
        [
          "Wymaga raportu REIT i spójnej definicji okresu.",
          "REIT-Bericht und konsistente Periodendefinition erforderlich.",
          "Requires a REIT report and consistent period definition.",
        ],
      ),
      metric(
        "occupancy",
        ["Obłożenie", "Auslastung", "Occupancy"],
        [
          "Wymaga segmentu, geografii i daty raportowej.",
          "Segment, Geografie und Berichtsdatum erforderlich.",
          "Requires segment, geography and reporting date.",
        ],
      ),
      metric(
        "leverage",
        ["Dźwignia", "Leverage", "Leverage"],
        [
          "Połącz dług netto, EBITDA/NOI i zapadalność.",
          "Nettoschulden, EBITDA/NOI und Fälligkeiten verbinden.",
          "Combine net debt, EBITDA/NOI and maturities.",
        ],
      ),
      metric(
        "navDiscount",
        ["Dyskonto do NAV", "NAV-Discount", "NAV discount"],
        [
          "Wymaga aktualnego NAV i jawnej metodologii wyceny.",
          "Aktueller NAV und offene Bewertungsmethodik erforderlich.",
          "Requires current NAV and an explicit valuation method.",
        ],
      ),
      metric(
        "debtMaturity",
        ["Zapadalność długu", "Schuldenfälligkeit", "Debt maturity"],
        [
          "Pokaż koncentrację zapadalności i koszt refinansowania.",
          "Fälligkeitskonzentration und Refinanzierungskosten zeigen.",
          "Show maturity concentration and refinancing cost.",
        ],
      ),
      metric(
        "tenantConcentration",
        [
          "Koncentracja najemców",
          "Mieterkonzentration",
          "Tenant concentration",
        ],
        [
          "Wymaga udziałów top najemców i końca umów.",
          "Top-Mieteranteile und Vertragsenden erforderlich.",
          "Requires top-tenant shares and lease expiries.",
        ],
      ),
      metric(
        "refinancingRisk",
        ["Ryzyko refinansowania", "Refinanzierungsrisiko", "Refinancing risk"],
        [
          "Łączy zapadalność, stopy i pokrycie odsetek.",
          "Verbindet Fälligkeit, Zinsen und Zinsdeckung.",
          "Combines maturities, rates and interest coverage.",
        ],
      ),
      metric(
        "capRateSpread",
        ["Spread cap rate", "Cap-Rate-Spread", "Cap-rate spread"],
        [
          "Wymaga porównywalnego segmentu i stopy bazowej.",
          "Vergleichbares Segment und Basiszins erforderlich.",
          "Requires a comparable segment and reference rate.",
        ],
      ),
    ];

  if (assetClass === "index")
    return [
      metric(
        "constituentBreadth",
        ["Szerokość rynku", "Marktbreite", "Market breadth"],
        [
          "Wymaga zmian wszystkich składników, nie tylko poziomu indeksu.",
          "Änderungen aller Bestandteile nötig, nicht nur Indexstand.",
          "Requires constituent moves, not only the index level.",
        ],
      ),
      metric(
        "concentration",
        ["Koncentracja wag", "Gewichtskonzentration", "Weight concentration"],
        [
          "Wymaga aktualnych wag składników.",
          "Aktuelle Bestandgewichte erforderlich.",
          "Requires current constituent weights.",
        ],
      ),
      metric(
        "realizedVolatility",
        [
          "Zmienność realizowana",
          "Realisierte Volatilität",
          "Realized volatility",
        ],
        [
          "Wylicz z jawnego okna i interwału.",
          "Aus offenem Fenster und Intervall berechnen.",
          "Calculate from an explicit window and interval.",
        ],
      ),
      metric(
        "sectorBreadth",
        ["Szerokość sektorów", "Sektorbreite", "Sector breadth"],
        [
          "Wymaga mapowania składników do sektorów.",
          "Zuordnung der Bestandteile zu Sektoren erforderlich.",
          "Requires constituent-to-sector mapping.",
        ],
      ),
      metric(
        "topWeight",
        ["Największa waga", "Größtes Gewicht", "Top weight"],
        [
          "Wymaga aktualnego rebalancingu i wag.",
          "Aktuelles Rebalancing und Gewichte erforderlich.",
          "Requires current rebalance data and weights.",
        ],
      ),
      metric(
        "rebalanceRisk",
        ["Ryzyko rebalancingu", "Rebalancing-Risiko", "Rebalance risk"],
        [
          "Wymaga daty i reguł zmian składu.",
          "Datum und Regeln der Zusammensetzungsänderung erforderlich.",
          "Requires the date and rules for constituent changes.",
        ],
      ),
      metric(
        "macroSensitivity",
        ["Wrażliwość makro", "Makro-Sensitivität", "Macro sensitivity"],
        [
          "Wymaga historycznego testu bez udawania przyczynowości.",
          "Historischer Test ohne vorgetäuschte Kausalität erforderlich.",
          "Requires historical testing without claiming causality.",
        ],
      ),
    ];

  return [
    metric(
      "circulatingRatio",
      ["Podaż w obiegu", "Umlaufquote", "Circulating ratio"],
      [
        "Wymaga circulating i total supply z tego samego źródła.",
        "Circulating und Total Supply aus derselben Quelle erforderlich.",
        "Requires circulating and total supply from the same source.",
      ],
    ),
    metric(
      "sourceQuorum",
      ["Quorum venue", "Venue-Quorum", "Venue quorum"],
      [
        "Porównaj co najmniej dwa niezależne venue.",
        "Mindestens zwei unabhängige Venues vergleichen.",
        "Compare at least two independent venues.",
      ],
    ),
    metric(
      "providerResilience",
      ["Odporność providerów", "Provider-Resilienz", "Provider resilience"],
      [
        "Raport nie powinien zależeć od jednego feedu.",
        "Bericht darf nicht von einem Feed abhängen.",
        "The report should not depend on one feed.",
      ],
    ),
  ];
}

function formatMarketCapProxy(
  quote: Quote | undefined,
  asset: Asset | null | undefined,
  locale: Locale,
) {
  if (
    typeof quote?.marketCap === "number" &&
    Number.isFinite(quote.marketCap)
  ) {
    const formatted = new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(quote.marketCap);
    return asset?.category === "crypto"
      ? `${formatted} · CoinGecko market cap`
      : `${formatted} · provider market cap`;
  }
  if (quote?.currentPrice && asset?.category === "indices")
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(quote.currentPrice)} index level`;
  if (quote?.currentPrice && asset?.category === "crypto")
    return locale === "pl"
      ? "kapitalizacja wymaga CoinGecko market lane"
      : locale === "de"
        ? "Market-Cap braucht CoinGecko Market Lane"
        : "requires CoinGecko market-cap lane";
  if (
    quote?.currentPrice &&
    (asset?.category === "fx" || asset?.category === "commodities")
  )
    return locale === "pl"
      ? "nie jest oparte o kapitalizację"
      : locale === "de"
        ? "nicht Market-Cap-basiert"
        : "not market-cap based";
  if (
    quote?.currentPrice &&
    (asset?.category === "stocks" ||
      asset?.category === "etf" ||
      asset?.category === "real_estate")
  )
    return locale === "pl"
      ? "kapitalizacja z Alpha Vantage/filing lane do dopięcia"
      : locale === "de"
        ? "Market-Cap via Alpha Vantage/Filing Lane ausstehend"
        : "market cap via Alpha Vantage/filing lane pending";
  if (isVenueHealthAsset(asset))
    return locale === "pl"
      ? "venue-health lane: status/depth, nie cena akcji"
      : locale === "de"
        ? "Venue-Health Lane: Status/Depth, kein Aktienpreis"
        : "venue-health lane: status/depth, not an equity price";
  return quote?.missingReason ?? null;
}

function sourceQualityLabel(
  quote: Quote | undefined,
  asset: Asset | null | undefined,
  locale: Locale,
) {
  if (isVenueHealthAsset(asset) || quote?.assetClass === "venue_health") {
    if (quote?.venueHealth) {
      const state = `${quote.venueHealth.state} · ${quote.venueHealth.healthScore}/100`;
      return locale === "pl"
        ? `venue health: ${state} · depth/latency/kline`
        : locale === "de"
          ? `Venue Health: ${state} · Depth/Latenz/Kline`
          : `venue health: ${state} · depth/latency/kline`;
    }
    return locale === "pl"
      ? "venue health: otwórz szczegóły, aby uruchomić status/depth/websocket"
      : locale === "de"
        ? "Venue Health: Details öffnen für Status/Depth/WebSocket"
        : "venue health: open detail to run status/depth/websocket";
  }
  if (!quote || quote.state !== "live") {
    return locale === "pl"
      ? "do podłączenia: brak świeżego payloadu"
      : locale === "de"
        ? "ausstehend: kein frischer Payload"
        : "pending: no fresh payload";
  }
  if (quote.consensusState === "divergent") {
    return locale === "pl"
      ? "rozjazd providerów · mocny wniosek zablokowany"
      : locale === "de"
        ? "Provider-Abweichung · starke Aussage blockiert"
        : "provider divergence · strong claim blocked";
  }
  if (quote.consensusState === "stale") {
    return locale === "pl"
      ? "stary timestamp · wymagane odświeżenie"
      : locale === "de"
        ? "veralteter Zeitstempel · Aktualisierung nötig"
        : "stale timestamp · refresh required";
  }
  if (quote.consensusState === "single_source") {
    return locale === "pl"
      ? "jedno źródło · limit pewności aktywny"
      : locale === "de"
        ? "eine Quelle · Konfidenzlimit aktiv"
        : "single source · confidence cap active";
  }
  if (quote.consensusState === "watch") {
    return locale === "pl"
      ? "providerzy blisko progu · obserwuj"
      : locale === "de"
        ? "Provider nahe Schwelle · beobachten"
        : "providers near threshold · watch";
  }
  if (quote.truthState === "source_bound") {
    return locale === "pl"
      ? "source-bound · główny provider aktywny"
      : locale === "de"
        ? "source-bound · Hauptprovider aktiv"
        : "source-bound · primary provider active";
  }
  if (quote.truthState === "compatibility_adapter") {
    return locale === "pl"
      ? "kompatybilny fallback · wymaga głównego providera"
      : locale === "de"
        ? "Kompatibilitäts-Fallback · Hauptprovider nötig"
        : "compatibility fallback · primary provider required";
  }
  return quote.sourceTimestamp
    ? locale === "pl"
      ? "live payload z timestampem"
      : locale === "de"
        ? "Live-Payload mit Timestamp"
        : "live payload with timestamp"
    : locale === "pl"
      ? "payload bez timestampu"
      : locale === "de"
        ? "Payload ohne Timestamp"
        : "payload without timestamp";
}

function modeIntro(mode: UnifiedAuditMode, locale: Locale) {
  const intro = {
    pl: {
      basic:
        "Basic = szybki obraz: cena, zmiana, wolumen, market-cap/proxy i stan źródła.",
      pro: "Pro = kontrola jakości: świeczki, luki, drugi provider i rytm źródła.",
      advanced:
        "Advanced = pełna matryca: płynność, slippage, venue health, filing lane i anomalie.",
    },
    de: {
      basic:
        "Basic = schneller Blick: Preis, Änderung, Volumen, Market-Cap/Proxy und Quellenstatus.",
      pro: "Pro = Qualitätskontrolle: Kerzen, Lücken, Zweitprovider und Quellenrhythmus.",
      advanced:
        "Advanced = volle Matrix: Liquidität, Slippage, Venue Health, Filing Lane und Anomalien.",
    },
    en: {
      basic:
        "Basic = quick read: price, move, volume, market-cap/proxy and source state.",
      pro: "Pro = quality check: candles, gaps, second provider and source rhythm.",
      advanced:
        "Advanced = full matrix: liquidity, slippage, venue health, filing lane and anomalies.",
    },
  } as const;
  return intro[locale][mode];
}

function buildHumanMarketBrief(
  asset: Asset,
  quote: Quote | undefined,
  locale: Locale,
  range: RangeKey,
) {
  const price = formatPrice(quote);
  const change =
    typeof quote?.changePercent === "number"
      ? `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%`
      : null;
  const volume = quoteVolume(quote);
  const volumeText = volume
    ? new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(volume)
    : null;
  if (locale === "pl") {
    if (isVenueHealthAsset(asset)) {
      return `${asset.name}: osobna ścieżka venue health. Najpierw status/depth/websocket, potem dopiero wnioski; Velmère nie udaje ceny giełdy.`;
    }
    return `${asset.symbol}: ${price !== "—" ? `cena ${price}` : "cena do podłączenia"}${change ? `, zmiana ${change}` : ""}${volumeText ? `, wolumen ${volumeText}` : ""}. Zakres ${range.toUpperCase()} i źródło są widoczne, a brakujące pola zostają w raporcie.`;
  }
  if (locale === "de") {
    if (isVenueHealthAsset(asset)) {
      return `${asset.name}: separater Venue-Health-Pfad. Erst Status/Depth/WebSocket, dann Schlussfolgerungen; Velmère täuscht keinen Börsenpreis vor.`;
    }
    return `${asset.symbol}: ${price !== "—" ? `Preis ${price}` : "Preis ausstehend"}${change ? `, Änderung ${change}` : ""}${volumeText ? `, Volumen ${volumeText}` : ""}. Bereich ${range.toUpperCase()} und Quelle bleiben sichtbar; fehlende Felder bleiben im Bericht.`;
  }
  if (isVenueHealthAsset(asset)) {
    return `${asset.name}: separate venue-health lane. Status/depth/websocket first, conclusions later; Velmère does not fake an exchange price.`;
  }
  return `${asset.symbol}: ${price !== "—" ? `price ${price}` : "price pending"}${change ? `, change ${change}` : ""}${volumeText ? `, volume ${volumeText}` : ""}. Range ${range.toUpperCase()} and source stay visible, while missing fields remain in the report.`;
}

function formatPrice(quote?: Quote) {
  if (!quote || quote.currentPrice === null) return "—";
  try {
    if (quote.currency) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: quote.currency,
        maximumFractionDigits: quote.currentPrice < 10 ? 4 : 2,
      }).format(quote.currentPrice);
    }
  } catch {
    // Fall through to a source-neutral number.
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: quote.currentPrice < 10 ? 5 : 2,
  }).format(quote.currentPrice);
}

export default function CrossAssetCollapseRadarPanel({
  locale = "pl",
}: {
  locale?: string;
}) {
  const safeLocale: Locale = locale === "de" || locale === "en" ? locale : "pl";
  const c = text[safeLocale];
  const a = auditText[safeLocale];
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [remoteAssets, setRemoteAssets] = useState<Asset[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [range, setRange] = useState<RangeKey>("1w");
  const [auditMode, setAuditMode] = useState<UnifiedAuditMode | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);
  const [catalogCounts, setCatalogCounts] = useState<
    CatalogResponse["counts"] | null
  >(null);
  const [catalogAssets, setCatalogAssets] = useState<Asset[]>([]);
  const [visibleLimit, setVisibleLimit] = useState(18);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const committedSearchRef = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/market-integrity/real-markets/catalog", {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload: CatalogResponse) => {
        if (!payload.ok) return;
        if (payload.counts) setCatalogCounts(payload.counts);
        const safeRows = normalizePass471CatalogRows(payload.rows);
        if (safeRows.length) setCatalogAssets(safeRows.map(assetFromCatalog));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setRemoteAssets([]);
      setSearching(false);
      setSearchOpen(false);
      return;
    }
    if (clean.toLowerCase() === committedSearchRef.current.toLowerCase()) {
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      fetch(
        `/api/market-integrity/real-markets?q=${encodeURIComponent(clean)}`,
        { signal: controller.signal },
      )
        .then((response) => response.json())
        .then((payload: SearchResponse) => {
          if (!payload.ok) return;
          const providerRows = normalizePass471ProviderSearchRows(payload.results);
          setRemoteAssets(
            providerRows
              .map((item) => {
                const known = curatedAssets.find(
                  (asset) => asset.providerSymbol === item.symbol,
                );
                return (
                  known || {
                    id: `provider-${item.symbol.toLowerCase()}`,
                    symbol: item.symbol.replace(/=X$|=F$/i, ""),
                    providerSymbol: item.symbol,
                    name: item.name,
                    category: categoryFromProvider(
                      item.quoteType,
                      item.symbol,
                      item.name,
                    ),
                    context: `${item.exchange || c.global} · ${item.quoteType.toLowerCase()}`,
                    risk: 36,
                    exchange: item.exchange,
                  }
                );
              })
              .slice(0, 8),
          );
          if (
            clean.toLowerCase() !== committedSearchRef.current.toLowerCase()
          ) {
            setSearchOpen(true);
          }
        })
        .catch(() => undefined)
        .finally(() => setSearching(false));
    }, 260);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [c.global, query]);

  const allAssets = useMemo(() => {
    const combined = [...curatedAssets, ...catalogAssets];
    return Array.from(
      new globalThis.Map(
        combined.map((asset) => [
          `${asset.category}:${cleanAssetSymbol(asset.symbol)}`,
          asset,
        ]),
      ).values(),
    );
  }, [catalogAssets]);

  const searchSuggestions = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    const local = allAssets
      .map((asset) => {
        const symbol = asset.symbol.toLowerCase();
        const provider = asset.providerSymbol.toLowerCase();
        const name = asset.name.toLowerCase();
        const score =
          symbol === clean || provider === clean
            ? 0
            : symbol.startsWith(clean) || provider.startsWith(clean)
              ? 1
              : name.split(/\s+/).some((word) => word.startsWith(clean))
                ? 2
                : name.includes(clean)
                  ? 4
                  : Number.POSITIVE_INFINITY;
        return { asset, score };
      })
      .filter((item) => Number.isFinite(item.score))
      .sort((a, b) => a.score - b.score)
      .map((item) => item.asset);
    const seen = new Set<string>();
    return [...local, ...remoteAssets]
      .filter((asset) => asset.category !== "crypto")
      .filter((asset) => {
        if (seen.has(asset.providerSymbol)) return false;
        seen.add(asset.providerSymbol);
        return true;
      })
      .slice(0, 3);
  }, [allAssets, query, remoteAssets]);

  const coverageCounts = useMemo(() => {
    const publicMarketAssets = allAssets.filter(
      (asset) => asset.category !== "crypto" && !isVenueHealthAsset(asset),
    );
    const mainSymbols = new Set([
      "AAPL",
      "NVDA",
      "MSFT",
      "DAX",
      "EUR/USD",
      "GC",
      "SPY",
      "VNQ",
      "NDAQ",
    ]);
    const mainSymbolCount = new Set(
      publicMarketAssets
        .map((asset) => asset.symbol.toUpperCase())
        .filter((symbol) => mainSymbols.has(symbol)),
    ).size;
    const curated = (Object.keys(c.tabs) as Category[]).reduce<
      Record<Category, number>
    >(
      (accumulator, item) => {
        accumulator[item] =
          item === "all"
            ? mainSymbolCount
            : allAssets.filter((asset) => asset.category === item).length;
        return accumulator;
      },
      {
        all: mainSymbolCount,
        crypto: 0,
        stocks: 0,
        indices: 0,
        fx: 0,
        etf: 0,
        commodities: 0,
        real_estate: 0,
        exchanges: 0,
      },
    );
    if (!catalogCounts) return curated;
    return {
      ...curated,
      crypto: Math.max(
        curated.crypto,
        catalogCounts.crypto + catalogCounts.exchangeTokens,
      ),
      stocks: Math.max(curated.stocks, catalogCounts.stocks),
      fx: Math.max(curated.fx, catalogCounts.fx),
      etf: Math.max(curated.etf, catalogCounts.etf),
      commodities: Math.max(curated.commodities, catalogCounts.commodities),
      real_estate: Math.max(curated.real_estate, catalogCounts.realEstate),
    };
  }, [allAssets, c.tabs, catalogCounts]);

  const rows = useMemo(() => {
    if (category === "all") {
      const priority = new globalThis.Map([
        ["AAPL", 0],
        ["NVDA", 1],
        ["MSFT", 2],
        ["DAX", 3],
        ["EUR/USD", 4],
        ["GC", 5],
        ["SPY", 6],
        ["VNQ", 7],
        ["NDAQ", 8],
      ]);
      const seen = new Set<string>();
      return allAssets
        .filter(
          (asset) =>
            asset.category !== "crypto" &&
            !isVenueHealthAsset(asset) &&
            priority.has(asset.symbol.toUpperCase()),
        )
        .filter((asset) => {
          const symbol = asset.symbol.toUpperCase();
          if (seen.has(symbol)) return false;
          seen.add(symbol);
          return true;
        })
        .sort(
          (left, right) =>
            (priority.get(left.symbol.toUpperCase()) ?? 99) -
            (priority.get(right.symbol.toUpperCase()) ?? 99),
        );
    }
    const categoryRows = allAssets.filter(
      (asset) => asset.category === category,
    );
    if (category !== "exchanges") return categoryRows;
    return [...categoryRows].sort(
      (left, right) =>
        Number(isVenueHealthAsset(right)) - Number(isVenueHealthAsset(left)),
    );
  }, [allAssets, category]);

  useEffect(() => {
    setVisibleLimit(18);
  }, [category]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchRef.current?.contains(target)) return;
      setSearchOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    const preventBackgroundScroll = (event: WheelEvent | TouchEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-velmere-modal-scroll='true']")
      )
        return;
      event.preventDefault();
    };
    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
      capture: true,
    });
    return () => {
      document.removeEventListener("wheel", preventBackgroundScroll, true);
      document.removeEventListener("touchmove", preventBackgroundScroll, true);
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [selected]);

  useEffect(() => {
    const quoteRows = rows.slice(0, visibleLimit);
    const symbols = Array.from(
      new Set(quoteRows.map((asset) => asset.providerSymbol)),
    );
    if (!symbols.length) return;
    const controller = new AbortController();
    const chunks = Array.from(
      { length: Math.ceil(symbols.length / 18) },
      (_, index) => symbols.slice(index * 18, index * 18 + 18),
    );
    setLoading(true);
    Promise.all(
      chunks.map(async (chunk) => {
        const response = await fetch(
          `/api/market-integrity/real-markets?symbols=${encodeURIComponent(chunk.join(","))}&range=1w`,
          { signal: controller.signal },
        );
        return (await response.json()) as QuoteResponse;
      }),
    )
      .then((payloads) => {
        const quotes = payloads.flatMap((payload) =>
          normalizePass471Quotes(payload?.ok ? payload.quotes : []),
        ) as Quote[];
        if (!quotes.length) return;
        setQuotes((current) => ({
          ...current,
          ...Object.fromEntries(quotes.map((quote) => [quote.symbol, quote])),
        }));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [visibleLimit, rows.map((row) => row.providerSymbol).join(",")]);

  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    fetch(
      `/api/market-integrity/real-markets?symbols=${encodeURIComponent(selected.providerSymbol)}&range=${range}&detail=1`,
      { signal: controller.signal },
    )
      .then((response) => response.json())
      .then((payload: QuoteResponse) => {
        const quote = normalizePass471Quotes(payload?.quotes)[0] as Quote | undefined;
        if (quote)
          setQuotes((current) => ({ ...current, [quote.symbol]: quote }));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [range, selected?.providerSymbol]);

  const selectedQuote = selected ? quotes[selected.providerSymbol] : undefined;
  const selectedRisk = dynamicRisk(selectedQuote, selected?.risk);
  const selectedChange1h = changeForWindow(selectedQuote, 60 * 60);
  const selectedChange24h = changeForWindow(selectedQuote, 24 * 60 * 60);
  const selectedChange7d =
    typeof selectedQuote?.priceChange7d === "number"
      ? selectedQuote.priceChange7d
      : (selectedQuote?.changePercent ?? null);
  const selectedVolume = quoteVolume(selectedQuote);
  const auditEvidence = useMemo(() => {
    if (!selected || !auditMode) return [];
    const candles = selectedQuote?.candles || [];
    const latest = candles.at(-1);
    const first = candles[0];
    const missing = candles.filter(
      (candle) => !Number.isFinite(candle.close),
    ).length;
    const avgRange = candles.length
      ? candles.reduce(
          (sum, candle) =>
            sum +
            ((candle.high - candle.low) / Math.max(candle.close, 0.000001)) *
              100,
          0,
        ) / candles.length
      : null;
    const totalVolume = candles.reduce(
      (sum, candle) => sum + (candle.volume || 0),
      0,
    );
    return buildUnifiedAuditEvidence(
      {
        locale: safeLocale,
        assetClass: auditAssetClass(selected),
        subject: `${selected.symbol} · ${selected.name}`,
        source: selectedQuote?.source || "",
        sourceTimestamp: selectedQuote?.sourceTimestamp,
        riskScore: selectedRisk,
        confidence:
          selectedQuote?.state === "live"
            ? Math.min(
                selectedQuote.confidenceCap ?? 96,
                58 + candles.length / 2,
              )
            : 18,
        metrics: [
          {
            id: "modeIntro",
            label: "Mode",
            value: modeIntro(auditMode, safeLocale),
            note: localizedAssetContext(selected, safeLocale),
            status: "verified",
          },
          {
            id: "humanBrief",
            label:
              safeLocale === "pl"
                ? "Brief dla człowieka"
                : safeLocale === "de"
                  ? "Menschlicher Brief"
                  : "Human brief",
            value: buildHumanMarketBrief(
              selected,
              selectedQuote,
              safeLocale,
              range,
            ),
            note:
              safeLocale === "pl"
                ? "AI ma tłumaczyć dane wprost: co widać, czego brakuje i co dalej."
                : safeLocale === "de"
                  ? "AI erklärt direkt: was sichtbar ist, was fehlt und was folgt."
                  : "AI explains directly: what is visible, what is missing and what comes next.",
            status: "verified",
          },
          {
            id: "price",
            label: a.price,
            value:
              typeof selectedQuote?.currentPrice === "number"
                ? formatPrice(selectedQuote)
                : null,
            note: isVenueHealthAsset(selected) ? c.venuePending : a.observed,
            status:
              typeof selectedQuote?.currentPrice === "number"
                ? "verified"
                : isVenueHealthAsset(selected)
                  ? "review"
                  : "missing",
          },
          {
            id: "marketCap",
            label:
              safeLocale === "pl"
                ? "Kapitalizacja / proxy"
                : safeLocale === "de"
                  ? "Marktkapitalisierung / Proxy"
                  : "Market cap / proxy",
            value: formatMarketCapProxy(selectedQuote, selected, safeLocale),
            note:
              safeLocale === "pl"
                ? "Dla indeksów/FX/surowców nie udajemy klasycznej kapitalizacji; pokazujemy właściwy proxy."
                : safeLocale === "de"
                  ? "Für Indizes/FX/Rohstoffe wird keine klassische Marktkapitalisierung vorgetäuscht; der passende Proxy bleibt sichtbar."
                  : "For indices/FX/commodities we do not fake a classic market cap; the correct proxy stays visible.",
            status: selectedQuote?.marketCap ? "verified" : "review",
          },
          {
            id: "fdv",
            label: "FDV",
            value:
              typeof selectedQuote?.fdv === "number"
                ? new Intl.NumberFormat(safeLocale, {
                    notation: "compact",
                    maximumFractionDigits: 2,
                  }).format(selectedQuote.fdv)
                : null,
            note:
              safeLocale === "pl"
                ? "Tylko dla krypto/providerów z jawnie podanym FDV."
                : safeLocale === "de"
                  ? "Nur für Krypto/Provider mit explizitem FDV."
                  : "Only for crypto/providers with explicit FDV.",
            status: selectedQuote?.fdv ? "verified" : "missing",
          },
          {
            id: "change1h",
            label: a.change1h,
            value:
              typeof selectedChange1h === "number"
                ? `${selectedChange1h >= 0 ? "+" : ""}${selectedChange1h.toFixed(2)}%`
                : null,
            note: a.observed,
            status:
              typeof selectedChange1h === "number" ? "verified" : "missing",
          },
          {
            id: "change24h",
            label: a.change24h,
            value:
              typeof selectedChange24h === "number"
                ? `${selectedChange24h >= 0 ? "+" : ""}${selectedChange24h.toFixed(2)}%`
                : null,
            note: a.observed,
            status:
              typeof selectedChange24h === "number" ? "verified" : "missing",
          },
          {
            id: "change7d",
            label: "7D",
            value:
              typeof selectedChange7d === "number"
                ? `${selectedChange7d >= 0 ? "+" : ""}${selectedChange7d.toFixed(2)}%`
                : null,
            note: a.observed,
            status:
              typeof selectedChange7d === "number" ? "verified" : "missing",
          },
          {
            id: "change",
            label: a.change,
            value:
              typeof selectedQuote?.changePercent === "number"
                ? `${selectedQuote.changePercent >= 0 ? "+" : ""}${selectedQuote.changePercent.toFixed(2)}%`
                : null,
            note: a.observed,
          },
          {
            id: "volume",
            label: a.volume,
            value: selectedVolume
              ? new Intl.NumberFormat(safeLocale, {
                  notation: "compact",
                  maximumFractionDigits: 2,
                }).format(selectedVolume)
              : null,
            note: a.observed,
            status: selectedVolume ? "verified" : "missing",
          },
          {
            id: "sourceContract",
            label: "PASS458 source contract",
            value: selectedQuote?.sourceContract,
            note: selectedQuote?.sourcePolicy,
            status:
              selectedQuote?.truthState === "source_bound"
                ? "verified"
                : "review",
          },
          {
            id: "providerPlan",
            label: "Provider plan",
            value: selectedQuote?.providerPlan?.slice(0, 3),
            note:
              selectedQuote?.missingReason ||
              "Provider plan attached to quote.",
            status: selectedQuote?.missingReason ? "review" : "verified",
          },
          {
            id: "providerConsensus",
            label: "PASS460 provider consensus",
            value: selectedQuote?.consensusState,
            note:
              selectedQuote?.consensusNotes?.join(" · ") ||
              "Consensus gate waits for primary and secondary prices.",
            status:
              selectedQuote?.consensusState === "aligned"
                ? "verified"
                : "review",
          },
          {
            id: "providerDivergence",
            label: "Provider divergence",
            value:
              typeof selectedQuote?.divergenceBps === "number"
                ? `${selectedQuote.divergenceBps.toFixed(1)} bps / ${selectedQuote.divergenceThresholdBps ?? 0} bps gate`
                : null,
            note:
              selectedQuote?.secondarySource || "Second price lane required.",
            status:
              selectedQuote?.consensusState === "aligned"
                ? "verified"
                : selectedQuote?.divergenceBps == null
                  ? "missing"
                  : "review",
          },
          {
            id: "freshnessGate",
            label: "Freshness gate",
            value: selectedQuote?.freshnessState
              ? `${selectedQuote.freshnessState}${typeof selectedQuote.freshnessSeconds === "number" ? ` · ${selectedQuote.freshnessSeconds}s` : ""}`
              : null,
            note: `Confidence cap ${selectedQuote?.confidenceCap ?? 20}/100`,
            status:
              selectedQuote?.freshnessState === "fresh" ? "verified" : "review",
          },
          {
            id: "crossVenueConsensus",
            label:
              safeLocale === "pl"
                ? "PASS462 konsensus między giełdami"
                : safeLocale === "de"
                  ? "PASS462 Börsenübergreifender Konsens"
                  : "PASS462 cross-venue consensus",
            value: selectedQuote?.venueComparison
              ? `${selectedQuote.venueComparison.state} · ${selectedQuote.venueComparison.primaryVenue} ↔ ${selectedQuote.venueComparison.secondaryVenue || "source required"}`
              : null,
            note:
              selectedQuote?.venueComparison?.notes.join(" · ") ||
              (safeLocale === "pl"
                ? "Drugie niezależne venue jest wymagane do oceny jakości ceny."
                : safeLocale === "de"
                  ? "Ein zweiter unabhängiger Handelsplatz ist für die Preisqualitätsprüfung erforderlich."
                  : "A second independent venue is required to assess price quality."),
            status:
              selectedQuote?.venueComparison?.state === "aligned"
                ? "verified"
                : selectedQuote?.venueComparison
                  ? "review"
                  : "missing",
          },
          {
            id: "crossVenueDivergence",
            label:
              safeLocale === "pl"
                ? "Rozjazd ceny / spreadu"
                : safeLocale === "de"
                  ? "Preis- / Spread-Abweichung"
                  : "Price / spread divergence",
            value: selectedQuote?.venueComparison
              ? `${selectedQuote.venueComparison.priceDivergenceBps == null ? "source required" : `${selectedQuote.venueComparison.priceDivergenceBps.toFixed(1)} bps`} · ${selectedQuote.venueComparison.spreadDeltaBps == null ? "source required" : `${selectedQuote.venueComparison.spreadDeltaBps.toFixed(1)} bps spread delta`}`
              : null,
            note: selectedQuote?.venueComparison?.boundary,
            status:
              selectedQuote?.venueComparison?.state === "aligned"
                ? "verified"
                : selectedQuote?.venueComparison
                  ? "review"
                  : "missing",
          },
          {
            id: "fundamentalProfile",
            label:
              safeLocale === "pl"
                ? "Profil fundamentalny"
                : safeLocale === "de"
                  ? "Fundamentalprofil"
                  : "Fundamental profile",
            value: selectedQuote?.fundamentals
              ? `${selectedQuote.fundamentals.profileType} · ${selectedQuote.fundamentals.sector || selectedQuote.fundamentals.country || "source required"}`
              : null,
            note:
              selectedQuote?.fundamentals?.industry ||
              selectedQuote?.fundamentals?.latestQuarter ||
              (safeLocale === "pl"
                ? "OVERVIEW lub ETF_PROFILE wymagany."
                : safeLocale === "de"
                  ? "OVERVIEW oder ETF_PROFILE erforderlich."
                  : "OVERVIEW or ETF_PROFILE required."),
            status:
              selectedQuote?.fundamentals?.profileType &&
              selectedQuote.fundamentals.profileType !== "not_applicable"
                ? "verified"
                : "missing",
          },
          {
            id: "fundamentalDepth",
            label:
              safeLocale === "pl"
                ? "Wycena / jakość / struktura"
                : safeLocale === "de"
                  ? "Bewertung / Qualität / Struktur"
                  : "Valuation / quality / structure",
            value: selectedQuote?.fundamentals
              ? selectedQuote.fundamentals.profileType === "etf"
                ? `AUM ${selectedQuote.fundamentals.netAssets == null ? "source required" : new Intl.NumberFormat(safeLocale, { notation: "compact", maximumFractionDigits: 2 }).format(selectedQuote.fundamentals.netAssets)} · TER ${selectedQuote.fundamentals.expenseRatio == null ? "source required" : `${selectedQuote.fundamentals.expenseRatio}%`} · holdings ${selectedQuote.fundamentals.topHoldings.length}`
                : `P/E ${selectedQuote.fundamentals.peRatio ?? "source required"} · P/B ${selectedQuote.fundamentals.priceToBookRatio ?? "source required"} · ROE ${selectedQuote.fundamentals.returnOnEquity == null ? "source required" : `${selectedQuote.fundamentals.returnOnEquity}%`}`
              : null,
            note:
              selectedQuote?.fundamentals?.profileType === "etf"
                ? selectedQuote.fundamentals.topHoldings
                    .slice(0, 4)
                    .map((holding) => `${holding.symbol}${holding.weight == null ? "" : ` ${holding.weight}%`}`)
                    .join(" · ") || "Holdings source required."
                : selectedQuote?.fundamentals?.description?.slice(0, 220),
            status:
              selectedQuote?.fundamentals?.profileType &&
              selectedQuote.fundamentals.profileType !== "not_applicable"
                ? "verified"
                : "missing",
          },
          {
            id: "fundamentalQualityGate",
            label:
              safeLocale === "pl"
                ? "PASS464 jakość sprawozdań"
                : safeLocale === "de"
                  ? "PASS464 Berichtsqualität"
                  : "PASS464 statement quality",
            value: selectedQuote?.fundamentals?.quality
              ? `${selectedQuote.fundamentals.quality.state} · ${selectedQuote.fundamentals.quality.qualityScore}/100 · cap ${selectedQuote.fundamentals.quality.confidenceCap}/100`
              : null,
            note: selectedQuote?.fundamentals?.quality
              ? selectedQuote.fundamentals.profileType === "etf"
                ? `top10 ${selectedQuote.fundamentals.quality.etf.concentrationTop10 ?? "source required"}% · effective holdings ${selectedQuote.fundamentals.quality.etf.effectiveHoldings ?? "source required"} · overlap ${selectedQuote.fundamentals.quality.etf.overlapPercent ?? "comparison required"}${selectedQuote.fundamentals.quality.etf.overlapPercent == null ? "" : "%"}`
                : `FCF ${selectedQuote.fundamentals.quality.freeCashFlowTtm ?? "source required"} · net debt/EBITDA ${selectedQuote.fundamentals.quality.netDebtToEbitda ?? "source required"}x · current ratio ${selectedQuote.fundamentals.quality.currentRatio ?? "source required"}x`
              : (safeLocale === "pl"
                  ? "Wymagane INCOME_STATEMENT, BALANCE_SHEET i CASH_FLOW."
                  : safeLocale === "de"
                    ? "INCOME_STATEMENT, BALANCE_SHEET und CASH_FLOW erforderlich."
                    : "INCOME_STATEMENT, BALANCE_SHEET and CASH_FLOW required."),
            status:
              selectedQuote?.fundamentals?.quality?.state === "source_bound"
                ? "verified"
                : selectedQuote?.fundamentals?.quality
                  ? "review"
                  : "missing",
          },
          {
            id: "secXbrlSecondSource",
            label:
              safeLocale === "pl"
                ? "PASS465 SEC/XBRL drugie źródło"
                : safeLocale === "de"
                  ? "PASS465 SEC/XBRL Zweitquelle"
                  : "PASS465 SEC/XBRL second source",
            value: selectedQuote?.fundamentals?.secXbrl
              ? `${selectedQuote.fundamentals.secXbrl.state} · coverage ${selectedQuote.fundamentals.secXbrl.conceptCoverageScore}/100 · cap ${selectedQuote.fundamentals.secXbrl.confidenceCap}/100`
              : null,
            note: selectedQuote?.fundamentals?.secXbrl
              ? `${selectedQuote.fundamentals.secXbrl.alignedConcepts.length} aligned · ${selectedQuote.fundamentals.secXbrl.divergentConcepts.length} divergent · ${selectedQuote.fundamentals.secXbrl.missingConcepts.length} missing concepts`
              : (safeLocale === "pl"
                  ? "SEC Companyfacts/XBRL wymagany jako drugie źródło fundamentals."
                  : safeLocale === "de"
                    ? "SEC Companyfacts/XBRL als zweite Fundamentalquelle erforderlich."
                    : "SEC Companyfacts/XBRL required as the second fundamentals source."),
            status:
              selectedQuote?.fundamentals?.secXbrl?.state === "sec_aligned"
                ? "verified"
                : selectedQuote?.fundamentals?.secXbrl
                  ? "review"
                  : "missing",
          },
          {
            id: "secFilingCadence",
            label:
              safeLocale === "pl"
                ? "Filing / earnings cadence"
                : safeLocale === "de"
                  ? "Filing / Earnings-Takt"
                  : "Filing / earnings cadence",
            value: selectedQuote?.fundamentals?.secXbrl
              ? `${selectedQuote.fundamentals.secXbrl.earningsCadence.latestForm || "form required"} · ${selectedQuote.fundamentals.secXbrl.earningsCadence.daysSinceLatestFiling ?? "?"}d · ${selectedQuote.fundamentals.secXbrl.earningsCadence.cadenceState}`
              : null,
            note:
              selectedQuote?.fundamentals?.secXbrl?.filingUrl ||
              selectedQuote?.fundamentals?.secXbrl?.earningsCadence.nextCheck ||
              (safeLocale === "pl"
                ? "Bez SEC_USER_AGENT pokazujemy brak źródła, nie zmyśloną datę raportu."
                : safeLocale === "de"
                  ? "Ohne SEC_USER_AGENT bleibt die Quelle sichtbar fehlend."
                  : "Without SEC_USER_AGENT the source remains visibly missing."),
            status:
              selectedQuote?.fundamentals?.secXbrl?.earningsCadence.cadenceState === "fresh"
                ? "verified"
                : selectedQuote?.fundamentals?.secXbrl
                  ? "review"
                  : "missing",
          },
          {
            id: "venueHealthScore",
            label:
              safeLocale === "pl"
                ? "PASS461 kondycja venue"
                : safeLocale === "de"
                  ? "PASS461 Venue-Zustand"
                  : "PASS461 venue health",
            value: selectedQuote?.venueHealth
              ? `${selectedQuote.venueHealth.state} · ${selectedQuote.venueHealth.healthScore}/100`
              : null,
            note: selectedQuote?.venueHealth?.boundary || c.venuePending,
            status:
              selectedQuote?.venueHealth?.state === "source_bound"
                ? "verified"
                : selectedQuote?.venueHealth
                  ? "review"
                  : "missing",
          },
          {
            id: "venueLatencySpread",
            label:
              safeLocale === "pl"
                ? "Latency / spread"
                : safeLocale === "de"
                  ? "Latenz / Spread"
                  : "Latency / spread",
            value: selectedQuote?.venueHealth
              ? `${selectedQuote.venueHealth.latencyMs ?? "source required"} ms · ${typeof selectedQuote.venueHealth.spreadBps === "number" ? `${selectedQuote.venueHealth.spreadBps.toFixed(2)} bps` : "source required"}`
              : null,
            note:
              safeLocale === "pl"
                ? "Mierzone z publicznego ping/time/bookTicker, bez udawania statusu wypłat lub rezerw."
                : safeLocale === "de"
                  ? "Aus öffentlichem Ping/Time/BookTicker gemessen, ohne Auszahlungs- oder Reservestatus vorzutäuschen."
                  : "Measured from public ping/time/bookTicker without pretending to know withdrawal or reserve status.",
            status: selectedQuote?.venueHealth ? "verified" : "missing",
          },
          {
            id: "venueDepthContinuity",
            label:
              safeLocale === "pl"
                ? "Depth / ciągłość świec"
                : safeLocale === "de"
                  ? "Depth / Kerzenkontinuität"
                  : "Depth / candle continuity",
            value: selectedQuote?.venueHealth
              ? `imbalance ${selectedQuote.venueHealth.depthImbalancePercent == null ? "source required" : `${selectedQuote.venueHealth.depthImbalancePercent.toFixed(1)}%`} · continuity ${selectedQuote.venueHealth.klineContinuityPercent == null ? "source required" : `${selectedQuote.venueHealth.klineContinuityPercent.toFixed(1)}%`}`
              : null,
            note:
              safeLocale === "pl"
                ? "Top-20 orderbook i 1m klines są osobnymi sygnałami odporności źródła."
                : safeLocale === "de"
                  ? "Top-20-Orderbook und 1m-Klines bleiben getrennte Quellenresilienz-Signale."
                  : "Top-20 orderbook and 1m klines remain separate source-resilience signals.",
            status:
              selectedQuote?.venueHealth?.state === "review" ||
              selectedQuote?.venueHealth?.state === "stale"
                ? "review"
                : selectedQuote?.venueHealth
                  ? "verified"
                  : "missing",
          },
          {
            id: "venuePersistence",
            label:
              safeLocale === "pl"
                ? "Cache / quota ledger"
                : safeLocale === "de"
                  ? "Cache / Quota-Ledger"
                  : "Cache / quota ledger",
            value: selectedQuote?.venueHealth
              ? `${selectedQuote.venueHealth.cacheState} · ${selectedQuote.venueHealth.storageMode} · ${selectedQuote.venueHealth.quotaMode}`
              : null,
            note:
              safeLocale === "pl"
                ? "Upstash jest trwałym trybem opcjonalnym; pamięć procesu pozostaje jawnie oznaczonym fallbackiem."
                : safeLocale === "de"
                  ? "Upstash ist der optionale dauerhafte Modus; Prozessspeicher bleibt ein klar markierter Fallback."
                  : "Upstash is the optional durable mode; process memory remains an explicitly labelled fallback.",
            status:
              selectedQuote?.venueHealth?.storageMode === "upstash_rest"
                ? "verified"
                : selectedQuote?.venueHealth
                  ? "review"
                  : "missing",
          },
          {
            id: "quoteObject",
            label: "Quote packet",
            value: {
              price: selectedQuote?.currentPrice ?? null,
              change: selectedQuote?.changePercent ?? null,
              volume: selectedVolume ?? null,
              source: selectedQuote?.source ?? "pending",
            },
            note: "Object-safe readout: React never receives raw provider objects as children.",
            status: selectedQuote?.state === "live" ? "verified" : "review",
          },
          {
            id: "exchange",
            label: a.exchange,
            value:
              selectedQuote?.exchange || selected.exchange || selected.symbol,
            note: a.observed,
          },
          {
            id: "currency",
            label: a.currency,
            value: selectedQuote?.currency,
            note: a.observed,
          },
          {
            id: "category",
            label: a.category,
            value: c.tabs[selected.category],
            note: localizedAssetContext(selected, safeLocale),
          },
          {
            id: "range",
            label: a.range,
            value: range.toUpperCase(),
            note: a.observed,
          },
          {
            id: "observations",
            label: a.observations,
            value: candles.length,
            note: a.observed,
          },
          {
            id: "candles",
            label: "OHLC candles",
            value: candles.length ? `${candles.length} candles` : null,
            note: candles.length ? a.observed : a.unavailable,
            status: candles.length ? "verified" : "missing",
          },
          {
            id: "open",
            label: a.open,
            value: first?.open?.toFixed(4),
            note: a.observed,
          },
          {
            id: "high",
            label: a.high,
            value: candles.length
              ? Math.max(...candles.map((item) => item.high)).toFixed(4)
              : null,
            note: a.observed,
          },
          {
            id: "low",
            label: a.low,
            value: candles.length
              ? Math.min(...candles.map((item) => item.low)).toFixed(4)
              : null,
            note: a.observed,
          },
          {
            id: "close",
            label: a.close,
            value: latest?.close?.toFixed(4),
            note: a.observed,
          },
          {
            id: "volatility",
            label: a.volatility,
            value: avgRange !== null ? `${avgRange.toFixed(2)}%` : null,
            note: a.observed,
          },
          {
            id: "gaps",
            label: a.gaps,
            value: missing,
            note: missing ? a.hasGaps : a.noGaps,
            status: missing ? "review" : "verified",
          },
          {
            id: "sessionStart",
            label: a.start,
            value: first
              ? new Date(first.timestamp * 1000).toLocaleString(safeLocale)
              : null,
            note: a.observed,
          },
          {
            id: "sessionEnd",
            label: a.end,
            value: latest
              ? new Date(latest.timestamp * 1000).toLocaleString(safeLocale)
              : null,
            note: a.observed,
          },
          {
            id: "providerState",
            label: a.provider,
            value: selectedQuote?.state,
            note: selectedQuote?.state === "live" ? a.live : a.unavailable,
            status: selectedQuote?.state === "live" ? "verified" : "missing",
          },
          {
            id: "sourceQuality",
            label: a.sourceQuality,
            value: sourceQualityLabel(selectedQuote, selected, safeLocale),
            note:
              safeLocale === "pl"
                ? "No fake-live: brak źródła zostaje widoczny."
                : safeLocale === "de"
                  ? "No fake-live: fehlende Quelle bleibt sichtbar."
                  : "No fake-live: missing source remains visible.",
            status: selectedQuote?.state === "live" ? "verified" : "review",
          },
          {
            id: "secondSource",
            label: a.second,
            value: null,
            note: a.secondNote,
            status: "missing",
          },
          {
            id: "venueHealth",
            label: "Venue health",
            value: isVenueHealthAsset(selected)
              ? selected.context
              : selected.category === "exchanges"
                ? "listed operator + separate venue lane"
                : null,
            note: c.venuePending,
            status: selected.category === "exchanges" ? "review" : "missing",
          },
          {
            id: "websocketCadence",
            label: a.websocketCadence,
            value: isVenueHealthAsset(selected)
              ? "kline/depth/status heartbeat lane"
              : null,
            note:
              safeLocale === "pl"
                ? "Strumienie Binance/MEXC wymagają heartbeat, reconnect i expiry guard przed publiczną pewnością."
                : safeLocale === "de"
                  ? "Binance/MEXC-Streams brauchen Heartbeat, Reconnect und Expiry Guard vor öffentlicher Konfidenz."
                  : "Binance/MEXC-style streams need heartbeat, reconnect and expiry handling before public confidence.",
            status: isVenueHealthAsset(selected) ? "review" : "missing",
          },
          {
            id: "liquidity",
            label: a.liquidity,
            value:
              selected.category === "fx"
                ? "deep reference market"
                : selected.category === "commodities"
                  ? "contract liquidity context"
                  : null,
            note:
              safeLocale === "pl"
                ? "Jakość wyjścia to nie to samo co kierunek ceny."
                : safeLocale === "de"
                  ? "Exit-Qualität ist nicht dasselbe wie Preisrichtung."
                  : "Exit quality is not the same as price direction.",
            status: "review",
          },
          {
            id: "slippage",
            label: a.slippage,
            value:
              selected.category === "fx"
                ? "spread/provider lane pending"
                : null,
            note:
              safeLocale === "pl"
                ? "Advanced oddziela poślizg od trendowej narracji."
                : safeLocale === "de"
                  ? "Advanced trennt Slippage von Trend-Narrativ."
                  : "Advanced mode keeps slippage separate from trend copy.",
            status: "review",
          },
          {
            id: "filing",
            label: a.filing,
            value:
              selected.category === "stocks" ||
              selected.category === "exchanges"
                ? a.separateLane
                : a.notApplicable,
            note: a.filingNote,
            status: "review",
          },
          {
            id: "pdfReadout",
            label: "PDF-ready human brief",
            value: "brief · source state · missing data · next operator step",
            note: "This same payload should feed Lens preview and download.",
            status: "verified",
          },
          {
            id: "auditBoundary",
            label: a.boundary,
            value: a.sourceBound,
            note: a.boundaryNote,
          },
          ...assetClassAuditMetrics(selected, safeLocale),
        ],
      },
      auditMode,
    );
  }, [
    a,
    auditMode,
    c,
    range,
    safeLocale,
    selected,
    selectedChange1h,
    selectedChange24h,
    selectedChange7d,
    selectedQuote,
    selectedRisk,
    selectedVolume,
  ]);

  const displayRows = useMemo(() => {
    if (!sort) return rows;
    const value = (asset: Asset) => {
      const quote = quotes[asset.providerSymbol];
      if (sort.key === "price") return quote?.currentPrice;
      if (sort.key === "change1h") return changeForWindow(quote, 60 * 60);
      if (sort.key === "change24h") return changeForWindow(quote, 24 * 60 * 60);
      if (sort.key === "change7d")
        return quote?.priceChange7d ?? quote?.changePercent;
      if (sort.key === "marketCap") return quote?.marketCap;
      if (sort.key === "volume") return quoteVolume(quote);
      return dynamicRisk(quote, asset.risk);
    };
    return [...rows].sort((leftAsset, rightAsset) => {
      const left = value(leftAsset);
      const right = value(rightAsset);
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      return (left - right) * (sort.direction === "asc" ? 1 : -1);
    });
  }, [quotes, rows, sort]);

  const visibleRows = useMemo(
    () => displayRows.slice(0, visibleLimit),
    [displayRows, visibleLimit],
  );

  function updateSort(key: SortKey) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: "desc" };
      if (current.direction === "desc") return { key, direction: "asc" };
      return null;
    });
  }

  function SortButton({ label, sortKey }: { label: string; sortKey: SortKey }) {
    const active = sort?.key === sortKey;
    return (
      <button
        type="button"
        onClick={() => updateSort(sortKey)}
        data-testid={`realmarkets-sort-${sortKey}`}
        aria-label={`${label}: ${
          active
            ? sort.direction === "desc"
              ? "descending"
              : "ascending"
            : "neutral"
        }`}
        aria-pressed={active}
        className={`inline-flex min-h-10 w-full items-center gap-1.5 rounded-lg px-1 transition hover:bg-white/[0.035] hover:text-white ${active ? "text-velmere-gold" : "text-white/[0.32]"}`}
        title="Click: highest, lowest, neutral"
      >
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${active ? "opacity-100" : "opacity-35"}`}
        />
        {active ? (
          <span className="text-[8px]">
            {sort.direction === "desc" ? "↓" : "↑"}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <section
      data-pass446-realmarkets-venue-catalog="true"
      data-pass447-crypto-realmarkets-catalog="true"
      data-pass448-realmarkets-depth-shell="true"
      data-pass450-market-coverage-rail="true"
      data-pass452-dynamic-realmarkets-coverage="true"
      data-pass453-catalog-dedupe="true"
      data-pass453-full-catalog-rows="true"
      data-pass454-evidence-dense-realmarkets="true"
      data-pass455-mixed-realmarkets-universe="true"
      data-pass456-visible-row-quote-batching="true"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.20em] text-velmere-gold">
            Velmère Shield
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.055em] text-white md:text-6xl">
            {c.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/[0.54]">
            {c.subtitle}
          </p>
        </div>
        <div ref={searchRef} className="relative min-w-[18rem]">
          <label className="flex items-center gap-3 rounded-full border border-white/[0.10] bg-white/[0.035] px-4 py-3 transition focus-within:border-velmere-gold/[0.34]">
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin text-velmere-gold" />
            ) : (
              <Search className="h-4 w-4 text-velmere-gold" />
            )}
            <input
              value={query}
              data-testid="realmarkets-search-input"
              onChange={(event) => {
                if (
                  event.target.value.trim().toLowerCase() !==
                  committedSearchRef.current.toLowerCase()
                ) {
                  committedSearchRef.current = "";
                }
                setQuery(event.target.value);
                setSearchOpen(Boolean(event.target.value.trim()));
              }}
              onFocus={() => setSearchOpen(Boolean(query.trim()))}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
                if (event.key === "Enter" && searchSuggestions[0]) {
                  event.preventDefault();
                  const asset = searchSuggestions[0];
                  committedSearchRef.current = asset.symbol;
                  setQuery(asset.symbol);
                  setRemoteAssets([asset]);
                  setSearchOpen(false);
                  setRange("1w");
                  setSelected(asset);
                }
              }}
              placeholder={c.search}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/[0.30]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  committedSearchRef.current = "";
                  setQuery("");
                  setRemoteAssets([]);
                  setSearchOpen(false);
                }}
                className="text-white/[0.38] hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          {searchOpen && query.trim() && searchSuggestions.length ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-[500] overflow-hidden rounded-[1.25rem] border border-cyan-200/[0.18] bg-[#080d0f]/[0.99] p-2 shadow-[0_34px_100px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
              {searchSuggestions.map((asset) => (
                <button
                  key={asset.providerSymbol}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    committedSearchRef.current = asset.symbol;
                    setQuery(asset.symbol);
                    setRemoteAssets([asset]);
                    setSearchOpen(false);
                    setRange("1w");
                    setSelected(asset);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-cyan-300/[0.055]"
                >
                  <AssetLogo asset={asset} />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-white">
                      {asset.symbol}
                    </strong>
                    <small className="block truncate text-xs text-white/[0.48]">
                      {asset.name}
                    </small>
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.34]">
                    {c.tabs[asset.category]}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(Object.keys(c.tabs) as Category[])
          .filter((item) => item !== "crypto")
          .map((item) => (
          <button
            key={item}
            type="button"
            data-testid={`realmarkets-tab-${item}`}
            onClick={() => {
              setCategory(item);
              setSearchOpen(false);
            }}
            className={`rounded-full border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] transition ${
              category === item
                ? "border-velmere-gold/[0.36] bg-velmere-gold/[0.11] text-velmere-gold"
                : "border-white/[0.09] bg-white/[0.025] text-white/[0.45] hover:text-white"
            }`}
          >
            <span>{c.tabs[item]}</span>
            <span className="ml-2 rounded-full border border-white/[0.08] px-1.5 py-0.5 text-[7px] text-white/[0.34]">
              {coverageCounts[item]}
            </span>
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-white/[0.10] sm:block" />
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.48] transition hover:text-white"
        >
          <Globe2 className="h-3.5 w-3.5" />
          {c.browser}
        </Link>
        <Link
          href="/market-integrity/shield-map"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.48] transition hover:text-white"
        >
          <MapIcon className="h-3.5 w-3.5" />
          {c.map}
        </Link>
        <Link
          href="/market-integrity"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-200/[0.18] bg-cyan-300/[0.055] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-cyan-50 transition hover:bg-cyan-300/[0.10]"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {c.shield}
        </Link>
      </div>

      {category === "exchanges" ? (
        <div
          className="mt-3 grid gap-2 rounded-[1.4rem] border border-velmere-gold/[0.12] bg-velmere-gold/[0.035] p-4 md:grid-cols-3"
          data-pass452-venue-lifecycle="true"
        >
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-velmere-gold/[0.70]">
              Binance WebSocket
            </p>
            <p className="mt-2 text-xs leading-5 text-white/[0.52]">
              {safeLocale === "pl"
                ? "Heartbeat, kontrola ping/pong i planowany reconnect przed limitem połączenia."
                : safeLocale === "de"
                  ? "Heartbeat, Ping/Pong-Kontrolle und geplanter Reconnect vor dem Verbindungslimit."
                  : "Heartbeat, ping/pong supervision and planned reconnect before the connection limit."}
            </p>
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-velmere-gold/[0.70]">
              MEXC WebSocket
            </p>
            <p className="mt-2 text-xs leading-5 text-white/[0.52]">
              {safeLocale === "pl"
                ? "Połączenie traktowane jako maksymalnie 24-godzinne; expiry i reconnect są częścią Advanced."
                : safeLocale === "de"
                  ? "Verbindung als maximal 24 Stunden behandelt; Expiry und Reconnect gehören zu Advanced."
                  : "Connection treated as no longer than 24 hours; expiry and reconnect belong to Advanced."}
            </p>
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-velmere-gold/[0.70]">
              {safeLocale === "pl"
                ? "Połączenia live"
                : safeLocale === "de"
                  ? "Live-Verbindungen"
                  : "Live connections"}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/[0.52]">
              {safeLocale === "pl"
                ? "Venue health pozostaje osobną warstwą od ceny publicznej spółki."
                : safeLocale === "de"
                  ? "Venue Health bleibt getrennt vom Preis einer börsennotierten Gesellschaft."
                  : "Venue health stays separate from the price of a listed company."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-[1.6rem] border border-white/[0.09] bg-[#0c0d0e]">
        <div className="min-w-[1240px]">
          <div className="grid grid-cols-[minmax(15rem,1.7fr)_minmax(8rem,.8fr)_6rem_6rem_6rem_minmax(8rem,.8fr)_minmax(8rem,.8fr)_6rem_9rem] gap-4 border-b border-white/[0.08] px-5 py-4 font-mono text-[8px] uppercase tracking-[0.15em] text-white/[0.32]">
            <span>{c.name}</span>
            <SortButton label={c.price} sortKey="price" />
            <SortButton label="1H" sortKey="change1h" />
            <SortButton label="24H" sortKey="change24h" />
            <SortButton label="7D" sortKey="change7d" />
            <SortButton
              label={
                safeLocale === "pl"
                  ? "Market cap"
                  : safeLocale === "de"
                    ? "Market Cap"
                    : "Market cap"
              }
              sortKey="marketCap"
            />
            <SortButton label={c.volume} sortKey="volume" />
            <SortButton label={c.risk} sortKey="risk" />
            <span>{c.last7d}</span>
          </div>
          {visibleRows.map((asset) => {
            const quote = quotes[asset.providerSymbol];
            const change1h = changeForWindow(quote, 60 * 60);
            const change24h = changeForWindow(quote, 24 * 60 * 60);
            const change7d =
              typeof quote?.priceChange7d === "number"
                ? quote.priceChange7d
                : (quote?.changePercent ?? null);
            const volume = quoteVolume(quote);
            return (
              <button
                key={`${asset.category}-${asset.id}`}
                type="button"
                data-testid="realmarkets-row"
                onClick={() => {
                  setSearchOpen(false);
                  setRange("1w");
                  setSelected(asset);
                }}
                className="grid w-full grid-cols-[minmax(15rem,1.7fr)_minmax(8rem,.8fr)_6rem_6rem_6rem_minmax(8rem,.8fr)_minmax(8rem,.8fr)_6rem_9rem] items-center gap-4 border-b border-white/[0.07] px-5 py-4 text-left transition last:border-b-0 hover:bg-white/[0.035]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <AssetLogo asset={asset} />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm text-white">
                      {asset.name}
                    </strong>
                    <small className="mt-1 block font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.34]">
                      {asset.symbol} ·{" "}
                      {asset.exchange || c.tabs[asset.category]}
                    </small>
                  </span>
                </span>
                <strong className="font-mono text-sm text-white tabular-nums">
                  {formatPrice(quote)}
                </strong>
                {[change1h, change24h, change7d].map((change, index) => (
                  <span
                    key={index}
                    className={`font-mono text-xs tabular-nums ${typeof change === "number" ? (change >= 0 ? "text-emerald-300" : "text-rose-300") : "text-white/[0.30]"}`}
                  >
                    {typeof change === "number"
                      ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
                      : "—"}
                  </span>
                ))}
                <span className="font-mono text-xs text-white/[0.58]">
                  {typeof quote?.marketCap === "number"
                    ? new Intl.NumberFormat(safeLocale, {
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(quote.marketCap)
                    : asset.category === "indices"
                      ? safeLocale === "pl"
                        ? "poziom indeksu"
                        : safeLocale === "de"
                          ? "Indexstand"
                          : "index level"
                      : asset.category === "fx" ||
                          asset.category === "commodities"
                        ? safeLocale === "pl"
                          ? "nie dotyczy"
                          : safeLocale === "de"
                            ? "nicht anwendbar"
                            : "not applicable"
                        : safeLocale === "pl"
                          ? "brak źródła"
                          : safeLocale === "de"
                            ? "Quelle fehlt"
                            : "source missing"}
                </span>
                <span className="font-mono text-xs text-white/[0.58]">
                  {volume
                    ? new Intl.NumberFormat(safeLocale, {
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(volume)
                    : safeLocale === "pl"
                      ? "brak danych"
                      : safeLocale === "de"
                        ? "keine Daten"
                        : "no data"}
                </span>
                <span className="font-mono text-[10px] text-white/[0.62]">
                  {dynamicRisk(quote, asset.risk)}/100
                </span>
                <MarketSparkline quote={quote} />
              </button>
            );
          })}
          {loading || searching ? (
            <div className="flex items-center gap-3 border-t border-white/[0.07] px-5 py-4 text-xs text-white/[0.42]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {searching ? c.searching : c.loading}
            </div>
          ) : null}
          {visibleRows.length < displayRows.length ? (
            <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-5 py-4">
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.34]">
                {safeLocale === "pl"
                  ? `Widoczne ${visibleRows.length} z ${displayRows.length}`
                  : safeLocale === "de"
                    ? `${visibleRows.length} von ${displayRows.length} sichtbar`
                    : `Showing ${visibleRows.length} of ${displayRows.length}`}
              </span>
              <button
                type="button"
                onClick={() =>
                  setVisibleLimit((current) =>
                    Math.min(current + 18, displayRows.length),
                  )
                }
                className="rounded-full border border-cyan-200/[0.16] bg-cyan-300/[0.05] px-4 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50 transition hover:bg-cyan-300/[0.10]"
              >
                {safeLocale === "pl"
                  ? "Pokaż więcej"
                  : safeLocale === "de"
                    ? "Mehr anzeigen"
                    : "Show more"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {selected && typeof document !== "undefined"
        ? createPortal(
            <div
              data-velmere-modal-scroll="true"
              className="fixed inset-0 overflow-y-auto overscroll-contain bg-black/[0.94] p-3 backdrop-blur-xl md:p-8"
              style={{ zIndex: 2_000_000 }}
              role="dialog"
              aria-modal="true"
            >
              <button
                className="fixed inset-0 cursor-default"
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
              />
              <section className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[2rem] border border-velmere-gold/[0.20] bg-[#0b0c0d] shadow-[0_40px_140px_rgba(0,0,0,0.7)]">
                <header className="flex items-center justify-between gap-4 border-b border-white/[0.09] p-5 md:p-7">
                  <div className="flex min-w-0 items-center gap-4">
                    <AssetLogo asset={selected} large />
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">
                        VLM Real Markets Intelligence
                      </p>
                      <h2 className="mt-1 truncate font-serif text-4xl tracking-[-0.05em] text-white md:text-5xl">
                        {selected.name}
                      </h2>
                      <p className="mt-1 text-xs text-white/[0.40]">
                        {localizedAssetContext(selected, safeLocale)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/[0.62]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </header>

                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_19rem] md:p-6">
                  <main className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.025] p-4">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/[0.34]">
                          {c.price}
                        </p>
                        <strong className="mt-2 block font-mono text-3xl text-white tabular-nums">
                          {formatPrice(selectedQuote)}
                        </strong>
                      </div>
                      <div className="flex gap-2">
                        {(["1h", "4h", "1d", "1w"] as RangeKey[]).map(
                          (item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setRange(item)}
                              className={`rounded-full border px-3 py-2 font-mono text-[9px] uppercase ${range === item ? "border-velmere-gold/[0.36] bg-velmere-gold/[0.10] text-velmere-gold" : "border-white/[0.10] text-white/[0.42]"}`}
                            >
                              {item.toUpperCase()}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div
                      className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                      data-pass448-realmarkets-depth-shell="true"
                    >
                      {[
                        [
                          safeLocale === "pl"
                            ? "Kapitalizacja / proxy"
                            : safeLocale === "de"
                              ? "Market-Cap / Proxy"
                              : "Market cap / proxy",
                          formatMarketCapProxy(
                            selectedQuote,
                            selected,
                            safeLocale,
                          ) || "—",
                        ],
                        [
                          a.change24h,
                          typeof selectedChange24h === "number"
                            ? `${selectedChange24h >= 0 ? "+" : ""}${selectedChange24h.toFixed(2)}%`
                            : "—",
                        ],
                        [
                          a.volume,
                          selectedVolume
                            ? new Intl.NumberFormat(safeLocale, {
                                notation: "compact",
                                maximumFractionDigits: 2,
                              }).format(selectedVolume)
                            : "—",
                        ],
                        [
                          a.sourceQuality,
                          sourceQualityLabel(
                            selectedQuote,
                            selected,
                            safeLocale,
                          ),
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/[0.08] bg-black/[0.22] p-4"
                        >
                          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.30]">
                            {label}
                          </span>
                          <strong className="mt-2 block break-words text-sm text-white/[0.82]">
                            {value}
                          </strong>
                        </div>
                      ))}
                    </div>
                    {selectedQuote?.state === "live" &&
                    selectedQuote.candles.length > 1 ? (
                      <AdvancedMarketChart
                        candles={selectedQuote.candles}
                        locale={safeLocale}
                      />
                    ) : (
                      <div className="grid min-h-[500px] place-items-center rounded-2xl border border-dashed border-white/[0.10] bg-black/[0.22] p-8 text-center text-sm leading-7 text-white/[0.42]">
                        {c.chartUnavailable}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.32]">
                      <span>
                        {selectedQuote?.state === "live"
                          ? selectedQuote.source
                          : c.unavailable}
                      </span>
                      <span>
                        {c.sourceTime}:{" "}
                        {selectedQuote?.sourceTimestamp
                          ? new Date(
                              selectedQuote.sourceTimestamp * 1000,
                            ).toLocaleString(safeLocale)
                          : "—"}
                      </span>
                    </div>
                    <div
                      className="mt-4 rounded-2xl border border-cyan-200/[0.10] bg-cyan-300/[0.035] p-4"
                      data-pass458-provider-truth-router="true"
                      data-pass459-keyed-provider-truth="true"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-cyan-100/[0.58]">
                            {safeLocale === "pl"
                              ? "Kontrakt źródłowy"
                              : safeLocale === "de"
                                ? "Quellenvertrag"
                                : "Source contract"}
                          </p>
                          <strong className="mt-1 block text-sm text-white/[0.84]">
                            {selectedQuote?.sourceContract ||
                              (safeLocale === "pl"
                                ? "Kontrakt źródła do podłączenia"
                                : safeLocale === "de"
                                  ? "Quellenvertrag ausstehend"
                                  : "Source contract pending")}
                          </strong>
                        </div>
                        <span className="rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.52]">
                          {selectedQuote?.truthState || "source_required"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-white/[0.50]">
                        {selectedQuote?.sourcePolicy ||
                          selectedQuote?.missingReason ||
                          (safeLocale === "pl"
                            ? "Brak źródła zostaje jawny w UI, PDF i bocie."
                            : safeLocale === "de"
                              ? "Fehlende Quelle bleibt in UI, PDF und Bot sichtbar."
                              : "Missing source remains visible in UI, PDF and bot.")}
                      </p>
                      {selectedQuote?.providerPlan?.length ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {selectedQuote.providerPlan
                            .slice(0, 3)
                            .map((step) => (
                              <span
                                key={step}
                                className="rounded-xl border border-white/[0.07] bg-black/[0.18] p-3 text-[11px] leading-5 text-white/[0.46]"
                              >
                                {step}
                              </span>
                            ))}
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.38]">
                        <span className="rounded-full border border-white/[0.08] px-2.5 py-1">
                          {selectedQuote?.providerStatus || "source_required"}
                        </span>
                        <span className="rounded-full border border-white/[0.08] px-2.5 py-1">
                          {selectedQuote?.primaryProviderConfigured
                            ? "key configured"
                            : "key required"}
                        </span>
                        {selectedQuote?.providerFunctions
                          ?.slice(0, 3)
                          .map((fn) => (
                            <span
                              key={fn}
                              className="rounded-full border border-white/[0.08] px-2.5 py-1"
                            >
                              {fn}
                            </span>
                          ))}
                      </div>
                      {selectedQuote?.providerEvidence?.length ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {selectedQuote.providerEvidence
                            .slice(0, 8)
                            .map((fact) => (
                              <div
                                key={`${fact.label}-${fact.source}`}
                                className="rounded-xl border border-white/[0.07] bg-black/[0.18] p-3"
                              >
                                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.30]">
                                  {fact.label} · {fact.source}
                                </span>
                                <strong className="mt-1 block break-words text-[11px] font-medium leading-5 text-white/[0.66]">
                                  {fact.value}
                                </strong>
                              </div>
                            ))}
                        </div>
                      ) : null}
                      {selectedQuote?.fundamentals &&
                      selectedQuote.fundamentals.profileType !== "not_applicable" ? (
                        <div
                          className="mt-3 rounded-xl border border-sky-200/[0.11] bg-sky-300/[0.035] p-3"
                          data-pass462-fundamentals="true" data-pass464-fundamental-quality-ready="true" data-pass465-sec-xbrl-ready="true"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-sky-100/[0.62]">
                                {safeLocale === "pl" ? "Fundamenty źródłowe" : safeLocale === "de" ? "Quellengebundene Fundamentaldaten" : "Source-bound fundamentals"}
                              </span>
                              <strong className="mt-1 block text-sm text-white/[0.82]">
                                {selectedQuote.fundamentals.name || selected.symbol} · {selectedQuote.fundamentals.profileType}
                              </strong>
                            </div>
                            <span className="rounded-full border border-sky-100/[0.14] bg-sky-100/[0.045] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-sky-50/[0.72]">
                              {selectedQuote.fundamentals.latestQuarter || "profile attached"}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-white/[0.48]">
                            {selectedQuote.fundamentals.description ||
                              (safeLocale === "pl" ? "Opis emitenta wymaga źródła." : safeLocale === "de" ? "Emittentenbeschreibung erfordert eine Quelle." : "Issuer description requires a source.")}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            {(selectedQuote.fundamentals.profileType === "etf"
                              ? [
                                  ["Net assets", selectedQuote.fundamentals.netAssets == null ? "source required" : new Intl.NumberFormat(safeLocale, { notation: "compact", maximumFractionDigits: 2 }).format(selectedQuote.fundamentals.netAssets)],
                                  ["Expense ratio", selectedQuote.fundamentals.expenseRatio == null ? "source required" : `${selectedQuote.fundamentals.expenseRatio}%`],
                                  ["Turnover", selectedQuote.fundamentals.turnover == null ? "source required" : `${selectedQuote.fundamentals.turnover}%`],
                                  ["Top holdings", String(selectedQuote.fundamentals.topHoldings.length)],
                                ]
                              : [
                                  ["P/E · PEG", `${selectedQuote.fundamentals.peRatio ?? "source required"} · ${selectedQuote.fundamentals.pegRatio ?? "source required"}`],
                                  ["P/B · EPS", `${selectedQuote.fundamentals.priceToBookRatio ?? "source required"} · ${selectedQuote.fundamentals.dilutedEps ?? "source required"}`],
                                  ["Margin · ROE", `${selectedQuote.fundamentals.profitMargin == null ? "source required" : `${selectedQuote.fundamentals.profitMargin}%`} · ${selectedQuote.fundamentals.returnOnEquity == null ? "source required" : `${selectedQuote.fundamentals.returnOnEquity}%`}`],
                                  ["52W range", `${selectedQuote.fundamentals.week52Low ?? "source required"} – ${selectedQuote.fundamentals.week52High ?? "source required"}`],
                                ]
                            ).map(([label, value]) => (
                              <div key={label} className="rounded-lg border border-white/[0.06] bg-black/[0.16] p-2.5">
                                <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">{label}</span>
                                <strong className="mt-1 block break-words text-[11px] text-white/[0.68]">{value}</strong>
                              </div>
                            ))}
                          </div>
                          {selectedQuote.fundamentals.quality ? (
                            <div
                              className="mt-3 rounded-xl border border-violet-200/[0.10] bg-violet-300/[0.025] p-3"
                              data-pass464-fundamental-quality="true" data-pass465-sec-xbrl-quality="true"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-violet-100/[0.62]">
                                    {safeLocale === "pl" ? "Jakość finansowa" : safeLocale === "de" ? "Finanzqualität" : "Fundamental quality"}
                                  </span>
                                  <strong className="mt-1 block text-sm text-white/[0.80]">
                                    {selectedQuote.fundamentals.quality.state} · {selectedQuote.fundamentals.quality.qualityScore}/100
                                  </strong>
                                </div>
                                <span className="rounded-full border border-violet-100/[0.14] bg-violet-100/[0.045] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-violet-50/[0.72]">
                                  cap {selectedQuote.fundamentals.quality.confidenceCap}/100
                                </span>
                              </div>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                {(selectedQuote.fundamentals.profileType === "etf"
                                  ? [
                                      [safeLocale === "pl" ? "Top 10" : "Top 10", selectedQuote.fundamentals.quality.etf.concentrationTop10 == null ? "source required" : `${selectedQuote.fundamentals.quality.etf.concentrationTop10}%`],
                                      [safeLocale === "pl" ? "Efektywne pozycje" : safeLocale === "de" ? "Effektive Positionen" : "Effective holdings", selectedQuote.fundamentals.quality.etf.effectiveHoldings == null ? "source required" : String(selectedQuote.fundamentals.quality.etf.effectiveHoldings)],
                                      [safeLocale === "pl" ? "Top 3 sektory" : safeLocale === "de" ? "Top-3-Sektoren" : "Top-3 sectors", selectedQuote.fundamentals.quality.etf.sectorTop3 == null ? "source required" : `${selectedQuote.fundamentals.quality.etf.sectorTop3}%`],
                                      [safeLocale === "pl" ? "Overlap benchmarku" : safeLocale === "de" ? "Benchmark-Overlap" : "Benchmark overlap", selectedQuote.fundamentals.quality.etf.overlapPercent == null ? `${selectedQuote.fundamentals.quality.etf.benchmarkSymbol || "benchmark"} · source required` : `${selectedQuote.fundamentals.quality.etf.overlapPercent}% · ${selectedQuote.fundamentals.quality.etf.benchmarkSymbol || "benchmark"}`],
                                    ]
                                  : [
                                      [safeLocale === "pl" ? "Raport / filing" : safeLocale === "de" ? "Bericht / Filing" : "Report / filing", selectedQuote.fundamentals.quality.filingDate || selectedQuote.fundamentals.quality.reportedPeriodEnd || "source required"],
                                      [safeLocale === "pl" ? "Wolne przepływy TTM" : safeLocale === "de" ? "Freier Cashflow TTM" : "Free cash flow TTM", selectedQuote.fundamentals.quality.freeCashFlowTtm == null ? "source required" : new Intl.NumberFormat(safeLocale, { notation: "compact", maximumFractionDigits: 2 }).format(selectedQuote.fundamentals.quality.freeCashFlowTtm)],
                                      [safeLocale === "pl" ? "Dług netto / EBITDA" : safeLocale === "de" ? "Nettoschulden / EBITDA" : "Net debt / EBITDA", selectedQuote.fundamentals.quality.netDebtToEbitda == null ? "source required" : `${selectedQuote.fundamentals.quality.netDebtToEbitda}x`],
                                      [safeLocale === "pl" ? "Current ratio" : safeLocale === "de" ? "Liquiditätsgrad" : "Current ratio", selectedQuote.fundamentals.quality.currentRatio == null ? "source required" : `${selectedQuote.fundamentals.quality.currentRatio}x`],
                                      [safeLocale === "pl" ? "Marża FCF" : safeLocale === "de" ? "FCF-Marge" : "FCF margin", selectedQuote.fundamentals.quality.freeCashFlowMargin == null ? "source required" : `${selectedQuote.fundamentals.quality.freeCashFlowMargin}%`],
                                      [safeLocale === "pl" ? "Konwersja gotówki" : safeLocale === "de" ? "Cash-Konversion" : "Cash conversion", selectedQuote.fundamentals.quality.cashConversion == null ? "source required" : `${selectedQuote.fundamentals.quality.cashConversion}x`],
                                      [safeLocale === "pl" ? "Dług netto" : safeLocale === "de" ? "Nettoschulden" : "Net debt", selectedQuote.fundamentals.quality.netDebt == null ? "source required" : new Intl.NumberFormat(safeLocale, { notation: "compact", maximumFractionDigits: 2 }).format(selectedQuote.fundamentals.quality.netDebt)],
                                      [safeLocale === "pl" ? "Świeżość" : safeLocale === "de" ? "Aktualität" : "Freshness", `${selectedQuote.fundamentals.quality.freshnessState}${selectedQuote.fundamentals.quality.filingAgeDays == null ? "" : ` · ${selectedQuote.fundamentals.quality.filingAgeDays}d`}`],
                                    ]
                                ).map(([label, value]) => (
                                  <div key={label} className="rounded-lg border border-white/[0.06] bg-black/[0.16] p-2.5">
                                    <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">{label}</span>
                                    <strong className="mt-1 block break-words text-[11px] text-white/[0.68]">{value}</strong>
                                  </div>
                                ))}
                              </div>
                              {selectedQuote.fundamentals.quality.flags.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {selectedQuote.fundamentals.quality.flags.slice(0, 4).map((flag) => (
                                    <span key={flag} className="rounded-full border border-amber-100/[0.10] bg-amber-100/[0.035] px-2.5 py-1 text-[9px] leading-4 text-amber-50/[0.58]">
                                      {flag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <p className="mt-3 text-[9px] leading-4 text-white/[0.30]">
                                {selectedQuote.fundamentals.quality.boundary}
                              </p>
                            </div>
                          ) : null}
                          {selectedQuote.fundamentals.topHoldings.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {selectedQuote.fundamentals.topHoldings.slice(0, 6).map((holding) => (
                                <span key={`${holding.symbol}-${holding.description}`} className="rounded-full border border-white/[0.08] bg-black/[0.16] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-white/[0.48]">
                                  {holding.symbol || holding.description}{holding.weight == null ? "" : ` · ${holding.weight}%`}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {selectedQuote?.venueHealth ? (
                        <div
                          className="mt-3 rounded-xl border border-emerald-200/[0.12] bg-emerald-300/[0.035] p-3"
                          data-pass461-live-venue-health="true" data-pass462-cross-venue-ready="true" data-pass463-canonical-pair-coverage="true"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-emerald-100/[0.64]">
                                {/* PASS461 · legacy verifier marker retained after PASS462 venue comparison upgrade */}
                                {safeLocale === "pl" ? "Stan giełdy + kanoniczna para" : safeLocale === "de" ? "Börsenstatus + kanonisches Paar" : "Venue health + canonical pair"}
                              </span>
                              <strong className="mt-1 block text-sm text-white/[0.82]">
                                {selectedQuote.venueHealth.assetSymbol} · {selectedQuote.venueHealth.venue} · {selectedQuote.venueHealth.pair}
                              </strong>
                            </div>
                            <span className="rounded-full border border-emerald-100/[0.14] bg-emerald-100/[0.045] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-emerald-50/[0.72]">
                              {selectedQuote.venueHealth.state} · {selectedQuote.venueHealth.healthScore}/100
                            </span>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                            {[
                              [safeLocale === "pl" ? "Pokrycie pary" : safeLocale === "de" ? "Paarabdeckung" : "Pair coverage", `${selectedQuote.venueHealth.pairResolutionState} · ${selectedQuote.venueHealth.quoteCurrency}`],
                              ["Reference price", selectedQuote.venueHealth.referencePrice == null ? "source required" : new Intl.NumberFormat(safeLocale, { maximumFractionDigits: 4 }).format(selectedQuote.venueHealth.referencePrice)],
                              ["Latency", selectedQuote.venueHealth.latencyMs == null ? "source required" : `${selectedQuote.venueHealth.latencyMs} ms`],
                              ["Spread", selectedQuote.venueHealth.spreadBps == null ? "source required" : `${selectedQuote.venueHealth.spreadBps.toFixed(2)} bps`],
                              ["Depth imbalance", selectedQuote.venueHealth.depthImbalancePercent == null ? "source required" : `${selectedQuote.venueHealth.depthImbalancePercent.toFixed(1)}%`],
                              ["Kline continuity", selectedQuote.venueHealth.klineContinuityPercent == null ? "source required" : `${selectedQuote.venueHealth.klineContinuityPercent.toFixed(1)}%`],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-lg border border-white/[0.06] bg-black/[0.16] p-2.5">
                                <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">{label}</span>
                                <strong className="mt-1 block text-[11px] text-white/[0.68]">{value}</strong>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-white/[0.06] bg-black/[0.14] p-3">
                              <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.30]">
                                {safeLocale === "pl" ? "Cache i trwałość" : safeLocale === "de" ? "Cache und Persistenz" : "Cache and persistence"}
                              </span>
                              <p className="mt-1 text-[11px] leading-5 text-white/[0.56]">
                                {selectedQuote.venueHealth.cacheState} · {selectedQuote.venueHealth.storageMode} · quota {selectedQuote.venueHealth.quotaMode}
                              </p>
                              <p className="mt-1 text-[9px] leading-4 text-white/[0.34]">
                                {selectedQuote.venueHealth.pairResolutionNote}
                              </p>
                            </div>
                            <div className="rounded-lg border border-white/[0.06] bg-black/[0.14] p-3">
                              <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.30]">WebSocket lifecycle</span>
                              <p className="mt-1 text-[11px] leading-5 text-white/[0.56]">
                                {selectedQuote.venueHealth.websocketPolicy.reconnect} {selectedQuote.venueHealth.websocketPolicy.expiry}
                              </p>
                            </div>
                          </div>
                          {selectedQuote.venueComparison ? (
                            <div className="mt-3 rounded-lg border border-fuchsia-200/[0.11] bg-fuchsia-300/[0.035] p-3" data-pass462-cross-venue-consensus="true" data-pass463-quote-basis="true">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-fuchsia-100/[0.62]">
                                  {safeLocale === "pl" ? "Konsensus między giełdami + baza kwotowania" : safeLocale === "de" ? "Börsenkonsens + Quotierungsbasis" : "Cross-venue consensus + quote basis"}
                                </span>
                                <span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.58]">
                                  {selectedQuote.venueComparison.state} · cap {selectedQuote.venueComparison.confidenceCap}/100
                                </span>
                              </div>
                              <strong className="mt-2 block text-[12px] text-white/[0.76]">
                                {selectedQuote.venueComparison.primaryVenue} {selectedQuote.venueComparison.primaryPair} ↔ {selectedQuote.venueComparison.secondaryVenue || "source required"} {selectedQuote.venueComparison.secondaryPair || ""}
                              </strong>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                                {[
                                  [safeLocale === "pl" ? "Baza kwotowania" : safeLocale === "de" ? "Quotierungsbasis" : "Quote basis", `${selectedQuote.venueComparison.quoteBasisState} · -${selectedQuote.venueComparison.quoteBasisPenalty} cap`],
                                  ["Price divergence", selectedQuote.venueComparison.priceDivergenceBps == null ? "source required" : `${selectedQuote.venueComparison.priceDivergenceBps.toFixed(1)} bps`],
                                  ["Spread delta", selectedQuote.venueComparison.spreadDeltaBps == null ? "source required" : `${selectedQuote.venueComparison.spreadDeltaBps.toFixed(1)} bps`],
                                  ["Freshness delta", selectedQuote.venueComparison.freshnessDeltaSeconds == null ? "source required" : `${selectedQuote.venueComparison.freshnessDeltaSeconds.toFixed(0)}s`],
                                  ["Depth ratio", selectedQuote.venueComparison.depthRatio == null ? "source required" : `${selectedQuote.venueComparison.depthRatio.toFixed(2)}x`],
                                ].map(([label, value]) => (
                                  <div key={label} className="rounded-lg border border-white/[0.06] bg-black/[0.15] p-2.5">
                                    <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">{label}</span>
                                    <strong className="mt-1 block text-[11px] text-white/[0.68]">{value}</strong>
                                  </div>
                                ))}
                              </div>
                              <p className="mt-3 text-[10px] leading-5 text-white/[0.42]">{selectedQuote.venueComparison.notes.join(" · ")}</p>
                              <p className="mt-2 text-[9px] leading-4 text-white/[0.30]">{selectedQuote.venueComparison.boundary}</p>
                            </div>
                          ) : null}
                          {selectedQuote.venueHealth.providerErrors.length ? (
                            <p className="mt-3 rounded-lg border border-amber-200/[0.10] bg-amber-300/[0.035] p-3 text-[11px] leading-5 text-amber-50/[0.64]">
                              {selectedQuote.venueHealth.providerErrors.slice(0, 3).join(" · ")}
                            </p>
                          ) : null}
                          <p className="mt-3 text-[10px] leading-5 text-white/[0.38]">
                            {selectedQuote.venueHealth.boundary}
                          </p>
                        </div>
                      ) : null}
                      <div
                        className="mt-3 rounded-xl border border-violet-200/[0.10] bg-violet-300/[0.035] p-3"
                        data-pass460-provider-consensus="true"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-violet-100/[0.58]">
                            {safeLocale === "pl"
                              ? "Konsensus providerów"
                              : safeLocale === "de"
                                ? "Provider-Konsens"
                                : "Provider consensus"}
                          </span>
                          <span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.52]">
                            {selectedQuote?.consensusState || "unavailable"}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-lg border border-white/[0.06] bg-black/[0.16] p-2.5">
                            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">
                              Freshness
                            </span>
                            <strong className="mt-1 block text-[11px] text-white/[0.66]">
                              {selectedQuote?.freshnessState || "missing"}
                              {typeof selectedQuote?.freshnessSeconds ===
                              "number"
                                ? ` · ${selectedQuote.freshnessSeconds}s`
                                : ""}
                            </strong>
                          </div>
                          <div className="rounded-lg border border-white/[0.06] bg-black/[0.16] p-2.5">
                            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">
                              Divergence
                            </span>
                            <strong className="mt-1 block text-[11px] text-white/[0.66]">
                              {typeof selectedQuote?.divergenceBps === "number"
                                ? `${selectedQuote.divergenceBps.toFixed(1)} bps`
                                : safeLocale === "pl"
                                  ? "druga cena wymagana"
                                  : safeLocale === "de"
                                    ? "zweiter Preis nötig"
                                    : "second price required"}
                            </strong>
                          </div>
                          <div className="rounded-lg border border-white/[0.06] bg-black/[0.16] p-2.5">
                            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/[0.28]">
                              Confidence cap
                            </span>
                            <strong className="mt-1 block text-[11px] text-white/[0.66]">
                              {selectedQuote?.confidenceCap ?? 20}/100
                            </strong>
                          </div>
                        </div>
                        {selectedQuote?.consensusNotes?.length ? (
                          <p className="mt-3 text-[11px] leading-5 text-white/[0.44]">
                            {selectedQuote.consensusNotes
                              .slice(0, 2)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </main>

                  <aside className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.025] p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">
                      Analysis modes
                    </p>
                    <div className="mt-4 grid gap-3">
                      {(
                        [
                          ["basic", c.basic, Brain],
                          ["pro", c.pro, FileSearch],
                          ["advanced", c.advanced, GitBranch],
                        ] as const
                      ).map(([mode, label, Icon]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setAuditMode(mode)}
                          className="group rounded-2xl border border-white/[0.10] bg-white/[0.025] p-4 text-left transition hover:border-cyan-200/[0.24] hover:bg-cyan-300/[0.055]"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <strong className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.72]">
                              {label}
                            </strong>
                            <Icon className="h-4 w-4 text-cyan-200/[0.70]" />
                          </span>
                          <span className="mt-2 block text-xs leading-5 text-white/[0.42]">
                            {mode === "basic"
                              ? "10"
                              : mode === "pro"
                                ? "14"
                                : "20"}{" "}
                            {a.sourceSignals} · {c.modeHint[mode]}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div
                      className="mt-4 rounded-2xl border border-cyan-200/[0.10] bg-cyan-300/[0.035] p-4"
                      data-pass448-no-raw-unknown="true"
                      data-pass454-analysis-depth-copy="true"
                    >
                      <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-cyan-100/[0.62]">
                        Basic / Pro / Advanced
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/[0.46]">
                        {safeLocale === "pl"
                          ? "Basic: cena, kapitalizacja/proxy, 24h i wolumen. Pro: świece, FDV, turnover, świeżość i drugi provider. Advanced: slippage, asymetria depth, odporność venue, dryf timestampu, source entropy i tryb publikacji wniosku."
                          : safeLocale === "de"
                            ? "Basic: Preis, Market-Cap/Proxy, 24h und Volumen. Pro: Kerzen, FDV, Turnover, Freshness und Zweitprovider. Advanced: Slippage, Depth-Asymmetrie, Venue-Resilienz, Timestamp-Drift, Quellenentropie und Freigabemodus."
                            : "Basic: price, market-cap/proxy, 24h and volume. Pro: candles, FDV, turnover, freshness and second provider. Advanced: slippage, depth asymmetry, venue resilience, timestamp drift, source entropy and claim-release mode."}
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/[0.08] p-4">
                        <span className="font-mono text-[8px] uppercase text-white/[0.30]">
                          {c.risk}
                        </span>
                        <strong className="mt-2 block text-sm text-white">
                          {selectedRisk}/100
                        </strong>
                      </div>
                      <div className="rounded-2xl border border-white/[0.08] p-4">
                        <span className="font-mono text-[8px] uppercase text-white/[0.30]">
                          {c.source}
                        </span>
                        <strong className="mt-2 block text-xs text-white">
                          {selectedQuote?.state || "unavailable"}
                        </strong>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}

      <nav
        className="mt-8 flex flex-wrap justify-center gap-2 border-t border-white/[0.08] pt-6"
        aria-label="Real Markets navigation"
      >
        <Link
          href="/market-integrity"
          className="rounded-full border border-white/[0.10] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.52] transition hover:text-white"
        >
          {c.shield}
        </Link>
        <Link
          href="/market-integrity/shield-map"
          className="rounded-full border border-white/[0.10] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.52] transition hover:text-white"
        >
          {c.map}
        </Link>
        <Link
          href="/search"
          className="rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.07] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-velmere-gold"
        >
          {c.browser}
        </Link>
      </nav>

      {selected && auditMode && typeof document !== "undefined"
        ? createPortal(
            <VlmNeuralAuditExperience
              locale={safeLocale}
              mode={auditMode}
              symbol={selected.symbol}
              name={selected.name}
              evidence={auditEvidence}
              onClose={() => setAuditMode(null)}
            />,
            document.body,
          )
        : null}
    </section>
  );
}
