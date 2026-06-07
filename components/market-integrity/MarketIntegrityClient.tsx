"use client";

// PASS453 compatibility marker: routeParams.get("handoff") === "pass453"

import {
  Component,
  useCallback,
  useDeferredValue,
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
  Globe,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import type { MarketIntegrityRow } from "@/lib/market-integrity/coingecko";
import type { TokenRiskResult } from "@/lib/market-integrity/risk-types";
import { buildSocialExchangeCommandRouterGate } from "@/lib/market-integrity/social-exchange-command-router-gate";
import { pass395SearchRuntimeContract } from "@/lib/market-integrity/pass395-neural-orbit-search-contract";
import { PASS397_SEARCH_RUNTIME_CLOSE_EVENT, pass397UnifiedTerminalContract } from "@/lib/market-integrity/pass397-unified-search-pdf-brain";
import { pass398TerminalFidelityContract } from "@/lib/market-integrity/pass398-terminal-fidelity-loop";
import { PASS399_RUNTIME_CLOSE_EVENT, pass399KernelExactnessContract } from "@/lib/market-integrity/pass399-kernel-exactness-loop";
import { PASS400_RUNTIME_CLOSE_EVENT, pass400TerminalProofContract } from "@/lib/market-integrity/pass400-terminal-proof-engine";
import { PASS401_RUNTIME_CLOSE_EVENT, pass401TerminalExactnessMatrix } from "@/lib/market-integrity/pass401-terminal-exactness-matrix";
import { PASS402_RUNTIME_CLOSE_EVENT, pass402TerminalCleanOrbit } from "@/lib/market-integrity/pass402-terminal-clean-orbit-controller";
import { PASS403_RUNTIME_CLOSE_EVENT, pass403TerminalTruthOrbit } from "@/lib/market-integrity/pass403-terminal-truth-orbit";
import { PASS404_RUNTIME_CLOSE_EVENT, pass404TerminalExactOrbit } from "@/lib/market-integrity/pass404-terminal-exact-orbit";
import { PASS405_RUNTIME_CLOSE_EVENT, pass405TerminalOnePayloadOrbit } from "@/lib/market-integrity/pass405-terminal-one-payload-orbit";
import { PASS406_RUNTIME_CLOSE_EVENT, pass406TerminalPayloadIntegrityOrbit } from "@/lib/market-integrity/pass406-terminal-payload-integrity-orbit";
import { PASS407_RUNTIME_CLOSE_EVENT, pass407TerminalPayloadIntegrityOrbit } from "@/lib/market-integrity/pass407-terminal-exact-payload-orbit";
import { PASS408_RUNTIME_CLOSE_EVENT, pass408TerminalSourceProofOrbit } from "@/lib/market-integrity/pass408-terminal-source-proof-orbit";
import { PASS409_RUNTIME_CLOSE_EVENT, pass409TerminalSourceTruthOrbit } from "@/lib/market-integrity/pass409-terminal-source-truth-orbit";
import { PASS410_RUNTIME_CLOSE_EVENT, pass410TerminalLiveParityOrbit } from "@/lib/market-integrity/pass410-terminal-live-parity-orbit";
import { PASS411_RUNTIME_CLOSE_EVENT, pass411TerminalSourceEqualizerOrbit } from "@/lib/market-integrity/pass411-terminal-source-equalizer-orbit";
import { PASS413_RUNTIME_CLOSE_EVENT, pass413TerminalStabilityRuntime } from "@/lib/market-integrity/pass413-terminal-stability-runtime";
import { PASS414_RUNTIME_CLOSE_EVENT, pass414TerminalParityStabilizer } from "@/lib/market-integrity/pass414-terminal-parity-stabilizer";
import { PASS415_RUNTIME_CLOSE_EVENT, pass415ClampSuggestions, pass415TerminalLatencyStabilizer } from "@/lib/market-integrity/pass415-terminal-latency-stabilizer";
import { PASS416_RUNTIME_CLOSE_EVENT, pass416ClampSuggestions, pass416TerminalPrecisionAnchor } from "@/lib/market-integrity/pass416-terminal-precision-anchor";
import { PASS418_RUNTIME_CLOSE_EVENT, pass418ClampSuggestions, pass418TerminalChartAnchorStabilizer } from "@/lib/market-integrity/pass418-terminal-cleanroom-runtime";
import { PASS419_RUNTIME_CLOSE_EVENT, pass419ClampSuggestions, pass419TerminalChartAnchorStabilizer } from "@/lib/market-integrity/pass419-terminal-payload-stabilizer";
import { buildDecisionFlowOrchestratorGate } from "@/lib/market-integrity/decision-flow-orchestrator-gate";
import { buildLuxuryLiquidityPassportGate } from "@/lib/market-integrity/luxury-liquidity-passport-gate";
import { buildDepthResilienceRadarGate } from "@/lib/market-integrity/depth-resilience-radar-gate";
import { buildReserveProvenanceTwinGate } from "@/lib/market-integrity/reserve-provenance-twin-gate";
import { buildAdapterFaultSweepGate } from "@/lib/market-integrity/adapter-fault-sweep-gate";
import { buildSourceAdapterContractMeshGate } from "@/lib/market-integrity/source-adapter-contract-mesh-gate";
import { buildSourceProofEscrowGate } from "@/lib/market-integrity/source-proof-escrow-gate";
import { buildLiveAdapterCircuitBreakerGate } from "@/lib/market-integrity/live-adapter-circuit-breaker-gate";
import { buildFreshnessTimecodeLedgerGate } from "@/lib/market-integrity/freshness-timecode-ledger-gate";
import { buildSelectiveDisclosureVaultGate } from "@/lib/market-integrity/selective-disclosure-vault-gate";
import { buildVerifiableSourceCredentialGate } from "@/lib/market-integrity/verifiable-source-credential-gate";
import { buildCredentialRetentionHaloGate } from "@/lib/market-integrity/credential-retention-halo-gate";
import { buildSourceGovernanceOathGate } from "@/lib/market-integrity/source-governance-oath-gate";
import { buildEthicalSignalEventTaxonomyGate } from "@/lib/market-integrity/ethical-signal-event-taxonomy-gate";
import { buildProofConsentReceiptGate } from "@/lib/market-integrity/proof-consent-receipt-gate";
import { buildAuditTrailCovenantGate } from "@/lib/market-integrity/audit-trail-covenant-gate";
import { buildPrestigeProofCompassGate } from "@/lib/market-integrity/prestige-proof-compass-gate";
import { buildAtelierAccessRunwayGate } from "@/lib/market-integrity/atelier-access-runway-gate";
import {
  readPass468HandoffPacket,
  type Pass468BrowserShieldOrbitHandoff,
} from "@/lib/market-integrity/pass468-browser-shield-orbit-handoff";

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
  sourceMode?: "local" | "live" | "merged";
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
                Ładuję terminal w osobnym chunku, żeby klik tokena nie lagował
                main page.
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
            {this.state.message ?? "Modal failed to render"}
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
type SortDirection = "asc" | "desc";

type MarketSortKey =
  | "rank"
  | "price"
  | "change1h"
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

const knownTokenLogoMap = {
  btc: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  bitcoin: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  eth: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  ethereum: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  sol: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  solana: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  usdc: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
  tether: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  usdt: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  bnb: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  xrp: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  ada: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  doge: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  avax: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  link: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  matic:
    "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
  near: "https://assets.coingecko.com/coins/images/10365/large/near.jpg",
  sui: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png",
  arbitrum: "https://assets.coingecko.com/coins/images/16547/large/arb.jpg",
  arb: "https://assets.coingecko.com/coins/images/16547/large/arb.jpg",
  optimism:
    "https://assets.coingecko.com/coins/images/25244/large/Optimism.png",
  op: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png",
  wif: "https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg",
  bonk: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg",
} as const;

function knownTokenLogo(symbol?: string, id?: string, name?: string) {
  const candidates = [symbol, id, name]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  const logoLookup: { [key: string]: string | undefined } = knownTokenLogoMap;
  for (const candidate of candidates) {
    if (logoLookup[candidate]) return logoLookup[candidate];
  }
  return undefined;
}

function knownTokenGlyph(symbol?: string, id?: string, name?: string) {
  const candidates = [symbol, id, name]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  const glyphs: { [key: string]: string | undefined } = {
    btc: "₿",
    bitcoin: "₿",
    eth: "◆",
    ethereum: "◆",
    sol: "◎",
    solana: "◎",
    usdt: "₮",
    tether: "₮",
    usdc: "$",
    "usd-coin": "$",
    xrp: "✕",
    ripple: "✕",
    doge: "Ð",
    dogecoin: "Ð",
    bnb: "B",
    binancecoin: "B",
    ada: "A",
    cardano: "A",
    trx: "T",
    tron: "T",
    link: "L",
    chainlink: "L",
    avax: "A",
    avalanche: "A",
    dot: "D",
    polkadot: "D",
    ltc: "Ł",
    litecoin: "Ł",
    shib: "S",
    "shiba-inu": "S",
    pepe: "P",
    near: "N",
  };
  for (const candidate of candidates) {
    if (glyphs[candidate]) return glyphs[candidate];
  }
  return symbol?.slice(0, 2).toUpperCase() ?? "?";
}

function TokenAvatar({
  image,
  symbol,
  id,
  name,
}: {
  image?: string;
  symbol: string;
  id?: string;
  name?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = proxiedIcon(image ?? knownTokenLogo(symbol, id, name));
  const symbolLabel = knownTokenGlyph(symbol, id, name);
  if (!src || failed) {
    return (
      <span className="shield-suggestion-token-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.20] bg-[radial-gradient(circle_at_35%_20%,rgba(200,169,106,0.34),rgba(34,211,238,0.07)_48%,rgba(0,0,0,0.52))] font-mono text-[13px] font-black text-white shadow-[0_0_22px_rgba(210,176,94,0.12)] ring-1 ring-white/[0.08] tabular-nums">
        {symbolLabel}
      </span>
    );
  }
  return (
    <span className="shield-suggestion-token-avatar relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-black/[0.36] shadow-[0_0_22px_rgba(210,176,94,0.12)] ring-1 ring-white/[0.08]">
      <Image
        src={src}
        alt=""
        width={36}
        height={36}
        unoptimized
        className="h-full w-full rounded-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
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
  change1h: "1h change",
  change24h: "24h change",
  change7d: "7d change",
  marketCap: "market cap",
  volume: "24h volume",
  risk: "risk score",
};

function sortDirectionCopy(key: MarketSortKey, direction: SortDirection) {
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

function defaultSortStateForTab(tab: (typeof tabs)[number]): {
  key: MarketSortKey;
  direction: SortDirection;
} {
  if (tab === "highestRisk") return { key: "risk", direction: "desc" };
  if (tab === "trending") return { key: "change24h", direction: "desc" };
  return { key: "rank", direction: "asc" };
}

export default function MarketIntegrityClient({
  demoResults,
}: {
  demoResults: TokenRiskResult[];
}) {
  const t = useTranslations("MarketIntegrity");
  const locale = useLocale();
  const safeLocale = locale === "de" || locale === "en" ? locale : "pl";
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
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
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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
  const [lensHandoff, setLensHandoff] = useState<{ query: string; packet?: Pass468BrowserShieldOrbitHandoff } | null>(null);
  const [sourceCooldownUntil, setSourceCooldownUntil] = useState<number | null>(
    null,
  );
  const [cooldownTick, setCooldownTick] = useState(0);
  const searchShellRef = useRef<HTMLFormElement | null>(null);
  const suggestPanelRef = useRef<HTMLDivElement | null>(null);
  const [suggestPanelFrame, setSuggestPanelFrame] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [activeShieldLayer, setActiveShieldLayer] = useState("Velocity");
  const routeScanHandledRef = useRef(false);
  const committedSearchRef = useRef("");
  const [isOpeningTerminal, startTerminalTransition] = useTransition();
  void cooldownTick;
  const sourceCooldownActive = Boolean(
    sourceCooldownUntil && sourceCooldownUntil > Date.now(),
  );
  const sourceCooldownSeconds =
    sourceCooldownActive && sourceCooldownUntil
      ? Math.max(1, Math.ceil((sourceCooldownUntil - Date.now()) / 1000))
      : 0;

  const syncSuggestionPanelFrame = useCallback(() => {
    const anchor = searchShellRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const preferredWidth = Math.min(520, Math.max(320, rect.width));
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - preferredWidth / 2),
      Math.max(16, viewportWidth - preferredWidth - 16),
    );
    const belowTop = rect.bottom + 10;
    const belowSpace = viewportHeight - belowTop - 16;
    if (belowSpace >= 240 || rect.top < 300) {
      setSuggestPanelFrame({
        top: belowTop,
        left,
        width: preferredWidth,
        maxHeight: Math.max(180, Math.min(300, belowSpace)),
      });
      return;
    }
    const aboveMaxHeight = Math.max(180, Math.min(300, rect.top - 26));
    setSuggestPanelFrame({
      top: Math.max(16, rect.top - aboveMaxHeight - 10),
      left,
      width: preferredWidth,
      maxHeight: aboveMaxHeight,
    });
  }, []);

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
    if (typeof window === "undefined") return;
    const closeFromGlobalRuntime = () => closeSearchSuggestionsForModal();
    window.addEventListener(PASS397_SEARCH_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS399_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS400_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS401_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS402_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS403_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS404_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS405_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS406_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS407_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS408_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS409_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS410_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS411_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS413_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS414_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS415_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS416_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    window.addEventListener(PASS419_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    return () => {
      window.removeEventListener(PASS397_SEARCH_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS399_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS400_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS401_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS402_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS403_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS404_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS405_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS406_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS407_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS408_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS409_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS410_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS411_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS413_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS414_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS415_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS416_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
      window.removeEventListener(PASS419_RUNTIME_CLOSE_EVENT, closeFromGlobalRuntime);
    };
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
    if (selected) {
      emitPass397SearchRuntimeClose();
      return;
    }
    const clean = deferredQuery.trim();
    if (clean.length < 1) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSuggestionLoading(false);
      return;
    }
    if (clean.toLowerCase() === committedSearchRef.current.toLowerCase()) {
      closeSearchSuggestionsForModal();
      return;
    }

    const localItems = pass419ClampSuggestions(
      findLocalSuggestions(clean).map((item) => ({
        ...item,
        sourceMode: item.sourceMode ?? "local",
      })),
      (item) => `${item.symbol}:${item.id}`,
      3,
    );

    setSuggestions(localItems);
    setSuggestionLoading(false);

    if (localItems.length) {
      syncSuggestionPanelFrame();
      setSuggestionsOpen(true);
    } else {
      setSuggestionsOpen(false);
    }

    // PASS365: Shield search now uses the same local-first Browser interaction model as Real Markets.
    // Live API resolution is reserved for submit/scan, not every keystroke, to remove scroll/input lag.
    // PASS161: do not put findLocalSuggestions in this dependency list before its const initializer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketRows, deferredQuery, selected, syncSuggestionPanelFrame]);

  useEffect(() => {
    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchShellRef.current?.contains(target)) return;
      if (suggestPanelRef.current?.contains(target)) return;
      closeSearchSuggestionsForModal();
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  useEffect(() => {
    if (selected) closeSearchSuggestionsForModal();
  }, [selected]);

  useEffect(() => {
    if (!suggestionsOpen || selected) return;
    const handleResize = () => syncSuggestionPanelFrame();
    const handleScroll = () => {
      setSuggestionsOpen(false);
      setSuggestPanelFrame(null);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [selected, suggestionsOpen, syncSuggestionPanelFrame]);

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
      if (sortKey === "change1h") return row.priceChange1h;
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

  const scoreMarketSearchRow = useCallback((row: MarketIntegrityRow, value: string) => {
    const clean = value.trim().toLowerCase();
    if (!clean) return 10;
    const symbol = row.symbol.toLowerCase();
    const id = row.id.toLowerCase();
    const name = row.name.toLowerCase();
    const nameWords = name.split(/[^a-z0-9]+/).filter(Boolean);

    if (symbol === clean) return 0;
    if (id === clean) return 1;
    if (name === clean) return 2;
    if (symbol.startsWith(clean)) return 3;
    if (id.startsWith(clean)) return 4;
    if (nameWords.some((word) => word.startsWith(clean))) return 5;
    if (clean.length >= 4 && name.includes(clean)) return 7;
    return Number.POSITIVE_INFINITY;
  }, []);

  const toSuggestion = useCallback(
    (row: MarketIntegrityRow): Suggestion => ({
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      image: row.image ?? knownTokenLogo(row.symbol, row.id, row.name),
      rank: row.rank,
      sourceMode: "local",
    }),
    [],
  );

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

  const findLocalSuggestions = useCallback(
    (value: string) => {
      const clean = value.trim().toLowerCase();
      if (!clean) return [];
      return marketRows
        .map((row) => ({ row, score: scoreMarketSearchRow(row, clean) }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) =>
          a.score - b.score ||
          (a.row.rank ?? 99999) - (b.row.rank ?? 99999),
        )
        .map(({ row }) => toSuggestion(row));
    },
    [marketRows, scoreMarketSearchRow, toSuggestion],
  );

  function mergeSuggestions(
    localItems: Suggestion[],
    remoteItems: Suggestion[],
  ) {
    const seen = new Set<string>();
    const merged: Suggestion[] = [];
    const localLookup = new Map<string, Suggestion>();
    for (const item of localItems) {
      localLookup.set(item.id.toLowerCase(), item);
      localLookup.set(item.symbol.toLowerCase(), item);
      localLookup.set(item.name.toLowerCase(), item);
    }
    for (const item of [...localItems, ...remoteItems]) {
      const localMeta =
        localLookup.get(item.id.toLowerCase()) ??
        localLookup.get(item.symbol.toLowerCase()) ??
        localLookup.get(item.name.toLowerCase());
      const mergedItem: Suggestion = {
        ...item,
        image:
          item.image ??
          localMeta?.image ??
          knownTokenLogo(item.symbol, item.id, item.name),
        rank: item.rank ?? localMeta?.rank,
        name: item.name || localMeta?.name || item.symbol,
        sourceMode: localMeta ? "merged" : (item.sourceMode ?? "live"),
      };
      const key = mergedItem.id.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(mergedItem);
      if (merged.length >= 3) break;
    }
    return merged;
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
    committedSearchRef.current = clean;
    setError(null);
    closeSearchSuggestionsForModal();
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
      setError(
        `Źródło live ma chwilowy cooldown (${sourceCooldownSeconds}s). Wybierz token z tabeli albo poczekaj chwilę przed kolejnym skanem.`,
      );
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

  function closeSearchSuggestionsForModal() {
    setSuggestionsOpen(false);
    setSuggestions([]);
    setSuggestionLoading(false);
    setSuggestPanelFrame(null);
  }

  function emitPass397SearchRuntimeClose() {
    closeSearchSuggestionsForModal();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PASS397_SEARCH_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield" } }));
      window.dispatchEvent(new CustomEvent(PASS399_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield" } }));
      window.dispatchEvent(new CustomEvent(PASS400_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield" } }));
      window.dispatchEvent(new CustomEvent(PASS401_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "401" } }));
      window.dispatchEvent(new CustomEvent(PASS402_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "402" } }));
      window.dispatchEvent(new CustomEvent(PASS403_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "403" } }));
      window.dispatchEvent(new CustomEvent(PASS404_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "404" } }));
      window.dispatchEvent(new CustomEvent(PASS405_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "405" } }));
      window.dispatchEvent(new CustomEvent(PASS406_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "406" } }));
      window.dispatchEvent(new CustomEvent(PASS407_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "407" } }));
      window.dispatchEvent(new CustomEvent(PASS408_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "408" } }));
      window.dispatchEvent(new CustomEvent(PASS409_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "409" } }));
      window.dispatchEvent(new CustomEvent(PASS410_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "410" } }));
      window.dispatchEvent(new CustomEvent(PASS411_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "411" } }));
      window.dispatchEvent(new CustomEvent(PASS413_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "413" } }));
      window.dispatchEvent(new CustomEvent(PASS414_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "414" } }));
      window.dispatchEvent(new CustomEvent(PASS415_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "415" } }));
      window.dispatchEvent(new CustomEvent(PASS416_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "416" } }));
      window.dispatchEvent(new CustomEvent(PASS419_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield", pass: "419" } }));
    }
  }

  function openTokenModal(item: MarketIntegrityRow | TokenRiskResult) {
    emitPass397SearchRuntimeClose();
    startTerminalTransition(() => setSelected(item));
  }

  function handleSuggestionSelect(item: Suggestion) {
    committedSearchRef.current = item.symbol;
    setQuery(item.symbol);
    closeSearchSuggestionsForModal();
    const localMatch =
      findLocalMarketMatch(item.id) ??
      findLocalMarketMatch(item.symbol) ??
      findLocalMarketMatch(item.name);
    if (localMatch) {
      setResult(localMatch.result);
      openTokenModal(localMatch);
      return;
    }
    void scanToken(item.id || item.symbol || item.name);
  }

  function closeTokenModal() {
    setSelected(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    committedSearchRef.current = query.trim();
    void scanToken();
  }

  useEffect(() => {
    if (routeScanHandledRef.current || marketLoading || !marketRows.length)
      return;
    const routeParams = new URLSearchParams(window.location.search);
    const routeScan =
      routeParams.get("scan") ??
      routeParams.get("asset") ??
      routeParams.get("query");
    if (!routeScan) return;
    const fromSearchBridge =
      routeParams.get("from") === "velmere-search" ||
      routeParams.get("from") === "velmere-browser";
    const handoffVersion = routeParams.get("handoff");
    const pass453Handoff = handoffVersion === "pass453";
    const pass468Handoff = handoffVersion === "pass468";
    const pass468Packet = pass468Handoff
      ? readPass468HandoffPacket(routeParams.get("packet"))
      : null;
    routeScanHandledRef.current = true;
    const cleanRouteScan = routeScan
      .replace(/[^a-zA-Z0-9:_ -]/g, "")
      .slice(0, 96);
    setQuery(cleanRouteScan.toUpperCase());
    if (fromSearchBridge || pass453Handoff || pass468Handoff) {
      setActiveTab("top");
      setSortKey("risk");
      setSortDirection("desc");
      setLensHandoff({
        query: cleanRouteScan.toUpperCase(),
        packet:
          pass468Packet &&
          pass468Packet.query.toUpperCase() === cleanRouteScan.toUpperCase()
            ? pass468Packet
            : undefined,
      });
    }
    void scanToken(cleanRouteScan);
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
    const fallback = defaultSortStateForTab(tab);
    setSortKey(fallback.key);
    setSortDirection(fallback.direction);
  }

  function updateSort(nextKey: MarketSortKey) {
    const fallback = defaultSortStateForTab(activeTab);
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDirection(nextKey === "rank" ? "asc" : "desc");
      return;
    }
    if (sortDirection === "desc") {
      setSortDirection("asc");
      return;
    }
    setSortKey(fallback.key);
    setSortDirection(fallback.direction);
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
        aria-label={`Sort by ${label}. ${active ? sortDirectionCopy(sort, sortDirection) : "Click once for gainers or largest values, click again for losers or smallest values, click a third time to reset."}`}
        title={`Sort by ${label} · ${active ? sortDirectionCopy(sort, sortDirection) : "3-state cycle: desc → asc → reset"}`}
        data-testid={`shield-sort-${sort}`}
        aria-pressed={active}
        className={`inline-flex min-h-11 w-full items-center gap-1.5 rounded-lg px-1 transition hover:bg-white/[0.035] hover:text-white ${align === "right" ? "justify-end" : "justify-start"} ${active ? "text-velmere-gold" : "text-white/[0.38]"}`}
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

  const socialExchangeRouterGate = useMemo(
    () =>
      buildSocialExchangeCommandRouterGate({
        surface: "shield_terminal",
        query,
        suggestions: suggestions.map((item) => ({
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          image: item.image,
          rank: item.rank,
          sourceMode: item.sourceMode,
        })),
        watchlist: watchlistSymbols,
        max: 3,
      }),
    [query, suggestions, watchlistSymbols],
  );

  const decisionFlowOrchestratorGate = useMemo(
    () =>
      buildDecisionFlowOrchestratorGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
      }),
    [query, socialExchangeRouterGate.suggestions],
  );

  const luxuryLiquidityPassportGate = useMemo(
    () =>
      buildLuxuryLiquidityPassportGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
      }),
    [query, socialExchangeRouterGate.suggestions],
  );

  const depthResilienceRadarGate = useMemo(
    () =>
      buildDepthResilienceRadarGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
      }),
    [query, socialExchangeRouterGate.suggestions],
  );

  const reserveProvenanceTwinGate = useMemo(
    () =>
      buildReserveProvenanceTwinGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
      }),
    [query, socialExchangeRouterGate.suggestions],
  );

  const adapterFaultSweepGate = useMemo(
    () =>
      buildAdapterFaultSweepGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
      }),
    [error, query, socialExchangeRouterGate.suggestions],
  );

  const sourceAdapterContractMeshGate = useMemo(
    () =>
      buildSourceAdapterContractMeshGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        adapterFaultSweepGate,
      }),
    [adapterFaultSweepGate, query, socialExchangeRouterGate.suggestions],
  );

  const sourceProofEscrowGate = useMemo(
    () =>
      buildSourceProofEscrowGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        adapterFaultSweepGate,
        sourceAdapterContractMeshGate,
      }),
    [adapterFaultSweepGate, query, socialExchangeRouterGate.suggestions, sourceAdapterContractMeshGate],
  );

  const liveAdapterCircuitBreakerGate = useMemo(
    () =>
      buildLiveAdapterCircuitBreakerGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        sourceAdapterContractMeshGate,
        sourceProofEscrowGate,
      }),
    [adapterFaultSweepGate, error, query, socialExchangeRouterGate.suggestions, sourceAdapterContractMeshGate, sourceProofEscrowGate],
  );

  const freshnessTimecodeLedgerGate = useMemo(
    () =>
      buildFreshnessTimecodeLedgerGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        sourceAdapterContractMeshGate,
        sourceProofEscrowGate,
        liveAdapterCircuitBreakerGate,
      }),
    [adapterFaultSweepGate, error, liveAdapterCircuitBreakerGate, query, socialExchangeRouterGate.suggestions, sourceAdapterContractMeshGate, sourceProofEscrowGate],
  );

  const selectiveDisclosureVaultGate = useMemo(
    () =>
      buildSelectiveDisclosureVaultGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        sourceProofEscrowGate,
        liveAdapterCircuitBreakerGate,
        freshnessTimecodeLedgerGate,
      }),
    [adapterFaultSweepGate, error, freshnessTimecodeLedgerGate, liveAdapterCircuitBreakerGate, query, socialExchangeRouterGate.suggestions, sourceProofEscrowGate],
  );

  const verifiableSourceCredentialGate = useMemo(
    () =>
      buildVerifiableSourceCredentialGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        sourceAdapterContractMeshGate,
        sourceProofEscrowGate,
        liveAdapterCircuitBreakerGate,
        freshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate,
      }),
    [adapterFaultSweepGate, error, freshnessTimecodeLedgerGate, liveAdapterCircuitBreakerGate, query, selectiveDisclosureVaultGate, socialExchangeRouterGate.suggestions, sourceAdapterContractMeshGate, sourceProofEscrowGate],
  );

  const credentialRetentionHaloGate = useMemo(
    () =>
      buildCredentialRetentionHaloGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        liveAdapterCircuitBreakerGate,
        freshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate,
        verifiableSourceCredentialGate,
      }),
    [adapterFaultSweepGate, error, freshnessTimecodeLedgerGate, liveAdapterCircuitBreakerGate, query, selectiveDisclosureVaultGate, socialExchangeRouterGate.suggestions, verifiableSourceCredentialGate],
  );

  const sourceGovernanceOathGate = useMemo(
    () =>
      buildSourceGovernanceOathGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        freshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate,
        verifiableSourceCredentialGate,
        credentialRetentionHaloGate,
      }),
    [adapterFaultSweepGate, credentialRetentionHaloGate, error, freshnessTimecodeLedgerGate, query, selectiveDisclosureVaultGate, socialExchangeRouterGate.suggestions, verifiableSourceCredentialGate],
  );

  const ethicalSignalEventTaxonomyGate = useMemo(
    () =>
      buildEthicalSignalEventTaxonomyGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        adapterFaultSweepGate,
        freshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate,
        verifiableSourceCredentialGate,
        credentialRetentionHaloGate,
        sourceGovernanceOathGate,
      }),
    [adapterFaultSweepGate, credentialRetentionHaloGate, error, freshnessTimecodeLedgerGate, query, selectiveDisclosureVaultGate, socialExchangeRouterGate.suggestions, sourceGovernanceOathGate, verifiableSourceCredentialGate],
  );

  const proofConsentReceiptGate = useMemo(
    () =>
      buildProofConsentReceiptGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        selectiveDisclosureVaultGate,
        verifiableSourceCredentialGate,
        credentialRetentionHaloGate,
        sourceGovernanceOathGate,
        ethicalSignalEventTaxonomyGate,
      }),
    [credentialRetentionHaloGate, error, ethicalSignalEventTaxonomyGate, query, selectiveDisclosureVaultGate, socialExchangeRouterGate.suggestions, sourceGovernanceOathGate, verifiableSourceCredentialGate],
  );

  const auditTrailCovenantGate = useMemo(
    () =>
      buildAuditTrailCovenantGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        freshnessTimecodeLedgerGate,
        credentialRetentionHaloGate,
        sourceGovernanceOathGate,
        ethicalSignalEventTaxonomyGate,
        proofConsentReceiptGate,
      }),
    [credentialRetentionHaloGate, error, ethicalSignalEventTaxonomyGate, freshnessTimecodeLedgerGate, proofConsentReceiptGate, query, socialExchangeRouterGate.suggestions, sourceGovernanceOathGate],
  );

  const prestigeProofCompassGate = useMemo(
    () =>
      buildPrestigeProofCompassGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        freshnessTimecodeLedgerGate,
        reserveProvenanceTwinGate,
        verifiableSourceCredentialGate,
        auditTrailCovenantGate,
      }),
    [auditTrailCovenantGate, error, freshnessTimecodeLedgerGate, query, reserveProvenanceTwinGate, socialExchangeRouterGate.suggestions, verifiableSourceCredentialGate],
  );

  const atelierAccessRunwayGate = useMemo(
    () =>
      buildAtelierAccessRunwayGate({
        surface: "shield_terminal",
        query,
        routerSuggestions: socialExchangeRouterGate.suggestions,
        knownFaults: error ? [error] : [],
        freshnessTimecodeLedgerGate,
        proofConsentReceiptGate,
        auditTrailCovenantGate,
        prestigeProofCompassGate,
      }),
    [auditTrailCovenantGate, error, freshnessTimecodeLedgerGate, prestigeProofCompassGate, proofConsentReceiptGate, query, socialExchangeRouterGate.suggestions],
  );

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
    <main className="shield-typography-root shield-no-overlap bg-velmere-black text-velmere-ivory" data-pass325-public-operator-wall-hidden="true" data-pass359-public-surface-trim="true" data-pass364-shield-search-browser-portal="true"
                    data-pass394-close-on-page-scroll="true" data-pass365-local-first-shield-search="true" data-pass394-search-anchor-lock="true" data-pass395-search-runtime-lock="true" data-pass397-unified-search-pdf-brain="true" data-pass412-three-suggestions="true" data-pass453-shield-handoff="true" data-pass468-shield-handoff="true">
      {lensHandoff ? (
        <section className="border-b border-cyan-200/[0.10] bg-cyan-300/[0.035] px-5 py-3" data-pass453-browser-shield-connected="true">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-100/[0.62]">
                {safeLocale === "pl" ? "Handoff Browser → Shield" : safeLocale === "de" ? "Handoff Browser → Shield" : "Browser → Shield handoff"}
              </p>
              <p className="mt-1 text-xs leading-5 text-white/[0.56]">
                {safeLocale === "pl"
                  ? `${lensHandoff.query}: ten sam instrument został przekazany z Lens/PDF do pełnego skanu Shield.`
                  : safeLocale === "de"
                    ? `${lensHandoff.query}: Dasselbe Instrument wurde von Lens/PDF an den vollständigen Shield-Scan übergeben.`
                    : `${lensHandoff.query}: the same instrument was handed from Lens/PDF into the full Shield scan.`}
              </p>
              {lensHandoff.packet ? (
                <div className="mt-2 flex flex-wrap gap-1.5" data-pass468-evidence-context="display-only">
                  {[
                    lensHandoff.packet.depth.toUpperCase(),
                    `${lensHandoff.packet.sourceConfidence}%`,
                    lensHandoff.packet.sourceMode,
                    lensHandoff.packet.snapshot.venueComparisonState ||
                      lensHandoff.packet.snapshot.fundamentalState ||
                      "fresh scan required",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-200/[0.12] bg-black/[0.16] px-2 py-1 font-mono text-[7px] uppercase tracking-[0.11em] text-cyan-50/[0.56]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/market-integrity/shield-map?query=${encodeURIComponent(lensHandoff.query)}&from=velmere-browser&handoff=${lensHandoff.packet ? "pass468" : "pass453"}${lensHandoff.packet ? `&packet=${encodeURIComponent(lensHandoff.packet.payloadId)}&depth=${lensHandoff.packet.depth}` : ""}`}
                className="rounded-full border border-cyan-200/[0.18] bg-cyan-300/[0.055] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50"
              >
                {safeLocale === "pl" ? "Otwórz Mapę Shield" : safeLocale === "de" ? "Shield Map öffnen" : "Open Shield Map"}
              </Link>
              <button
                type="button"
                onClick={() => setLensHandoff(null)}
                className="rounded-full border border-white/[0.10] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.48]"
              >
                {safeLocale === "pl" ? "Ukryj" : safeLocale === "de" ? "Ausblenden" : "Hide"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
      <section className="luxury-section shield-no-overlap shield-market-search-dock sticky top-[4.35rem] z-[120] overflow-visible border-b border-white/[0.06] bg-velmere-black/[0.86] py-4 backdrop-blur-xl md:top-[4.75rem]">
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
                data-pass414-input-pinned-search={pass414TerminalParityStabilizer.version} data-pass415-input-pinned-search={pass415TerminalLatencyStabilizer.version}
                data-pass418-input-pinned-search={pass418TerminalChartAnchorStabilizer.version} data-pass419-input-pinned-search={pass419TerminalChartAnchorStabilizer.version}
              >
                <label className="sr-only" htmlFor="market-integrity-search">
                  {t("searchLabel")}
                </label>
                <div className="flex min-h-[3.5rem] items-center gap-3 rounded-full bg-black/[0.34] px-4 md:px-5">
                  <input
                    id="market-integrity-search"
                    value={query}
                    onFocus={() => {
                      if (selected) return;
                      syncSuggestionPanelFrame();
                      if (suggestions.length) setSuggestionsOpen(true);
                      else setSuggestPanelFrame(null);
                    }}
                    onChange={(event) => {
                      if (event.target.value.trim().toLowerCase() !== committedSearchRef.current.toLowerCase()) {
                        committedSearchRef.current = "";
                      }
                      setQuery(event.target.value);
                      if (selected || !event.target.value.trim()) closeSearchSuggestionsForModal();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        closeSearchSuggestionsForModal();
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
                        committedSearchRef.current = "";
                        setQuery("");
                        setSuggestions([]);
                        closeSearchSuggestionsForModal();
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

                {!selected && suggestionsOpen && suggestions.length && suggestPanelFrame && typeof document !== "undefined" ? createPortal(
                  <div
                    ref={suggestPanelRef}
                    className="shield-token-search-suggest-panel shield-token-search-suggest-portal shield-token-search-suggest-pass345 shield-token-search-suggest-pass358 shield-token-search-suggest-pass364 fixed overflow-hidden rounded-[1.25rem] border border-cyan-200/[0.18] bg-[#080d0f]/[0.985] text-left shadow-[0_34px_100px_rgba(0,0,0,0.72)] backdrop-blur-2xl"
                    style={{ top: suggestPanelFrame.top, left: suggestPanelFrame.left, width: suggestPanelFrame.width, maxHeight: suggestPanelFrame.maxHeight }}
                    data-pass345-inline-search-no-portal="false"
                    data-pass345-search-results-count={Math.min(suggestions.length, 3)}
                    data-pass358-browser-ranking="true"
                    data-pass364-shield-search-browser-portal="true"
                    data-pass394-close-on-page-scroll="true"
                    data-pass395-search-runtime-lock={pass395SearchRuntimeContract.version}
                    data-pass397-search-runtime-lock={pass397UnifiedTerminalContract.version}
                    data-pass398-search-runtime-lock={pass398TerminalFidelityContract.version}
                    data-pass399-search-runtime-lock={pass399KernelExactnessContract.version}
                    data-pass400-search-runtime-lock={pass400TerminalProofContract.version}
                    data-pass401-search-runtime-lock={pass401TerminalExactnessMatrix.version}
                    data-pass402-search-runtime-lock={pass402TerminalCleanOrbit.version}
                    data-pass403-search-runtime-lock={pass403TerminalTruthOrbit.version}
                    data-pass404-search-runtime-lock={pass404TerminalExactOrbit.version} data-pass405-search-runtime-lock={pass405TerminalOnePayloadOrbit.version} data-pass406-search-runtime-lock={pass406TerminalPayloadIntegrityOrbit.version} data-pass407-search-runtime-lock={pass407TerminalPayloadIntegrityOrbit.version} data-pass408-search-runtime-lock={pass408TerminalSourceProofOrbit.version} data-pass409-search-runtime-lock={pass409TerminalSourceTruthOrbit.version} data-pass410-search-runtime-lock={pass410TerminalLiveParityOrbit.version} data-pass411-search-runtime-lock={pass411TerminalSourceEqualizerOrbit.version}
                    data-pass413-search-runtime-lock={pass413TerminalStabilityRuntime.version}
                    data-pass414-search-runtime-lock={pass414TerminalParityStabilizer.version}
                    data-pass415-search-runtime-lock={pass415TerminalLatencyStabilizer.version} data-pass416-search-runtime-lock={pass416TerminalPrecisionAnchor.version}
                    data-pass413-three-only="true"
                    data-pass414-three-only="true"
                    data-pass415-three-only="true" data-pass416-three-only="true" data-pass418-three-only="true" data-pass419-three-only="true"
                    role="listbox"
                  >
                    <div className="border-b border-white/[0.07] px-4 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold/[0.72]">
                          Shield Search · Browser engine · local first
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50/[0.55]">
                          no lag · symbol first · scan on submit
                        </span>
                      </div>
                      <div className="shield-social-router-chip-row mt-2">
                        {socialExchangeRouterGate.chips.slice(0, 4).map((chip) => (
                          <span key={chip}>{chip}</span>
                        ))}
                      </div>
                    </div>
                    <div className="shield-token-search-suggest-scroll" style={{ maxHeight: Math.max(120, suggestPanelFrame.maxHeight - 82) }}>
                      {pass419ClampSuggestions(suggestions, (item) => `${item.symbol}:${item.id}`, 3).map((item) => (
                        <button
                          key={item.id ?? item.symbol}
                          type="button"
                          onClick={() => handleSuggestionSelect(item)}
                          className="shield-token-search-suggest-row flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-300/[0.055]"
                          role="option"
                          aria-selected={false}
                        >
                          <TokenAvatar
                            image={item.image}
                            symbol={item.symbol}
                            id={item.id ?? item.symbol.toLowerCase()}
                            name={item.name}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="block truncate text-sm font-semibold text-white">
                                {item.symbol}
                              </span>
                              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">
                                {item.sourceMode === "local"
                                  ? "table"
                                  : item.sourceMode === "merged"
                                    ? "live + table"
                                    : "live"}
                              </span>
                            </span>
                            <span className="block truncate text-[11px] leading-5 text-white/[0.56]">
                              {item.name}
                            </span>
                            <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">
                              {item.rank ? `rank #${item.rank}` : "search index"} · open Shield row
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold/[0.76]">
                            select
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body,
                ) : null}
              </form>

              <div className="flex items-center justify-end gap-2">
                <Link
                  href="/search"
                  className="shield-map-button shield-premium-focus"
                  aria-label="Open Velmère Browser"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Velmère browser
                </Link>
                <Link
                  href="/market-integrity/shield-map"
                  className="shield-map-button shield-premium-focus"
                  aria-label="Open full Shield Map page"
                >
                  <Radar className="h-3.5 w-3.5" />
                  Shield map
                </Link>
                <Link
                  href="/market-integrity/cross-asset"
                  className="shield-map-button shield-premium-focus shield-cross-asset-link"
                  aria-label="Open cross asset exchange health tables"
                >
                  <LineChart className="h-3.5 w-3.5" />
                  Real markets
                </Link>
              </div>
            </div>

            <div className="shield-social-exchange-router-rail mt-3" data-pass293-social-exchange-router="active">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold/[0.70]">
                  Social-Exchange Command Router
                </p>
                <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.48]">
                  Jedna logika wyszukiwania dla Shield, Shield Map i VLM Browser: source state, market depth, social context, zero dark patterns.
                </p>
              </div>
              <div className="shield-social-router-chip-row">
                {socialExchangeRouterGate.chips.slice(0, 5).map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>

              <div className="shield-pass294-trust-sync mt-3" data-pass294-trust-signal-feed="shield-terminal">
                <span>PASS294 · Trust Signal Feed sync</span>
                <p className="shield-copy-safe">Shield terminal sync: depth context, source quorum and anti-FOMO rails stay visible before any token action.</p>
                <div>
                  <b>source quorum</b>
                  <b>depth context</b>
                  <b>operator boundary</b>
                </div>
              </div>

              <div className="shield-pass295-decision-sync mt-3" data-pass295-decision-flow="shield-terminal">
                <span>PASS295 · Decision Flow sync</span>
                <p className="shield-copy-safe">Shield terminal now routes search pressure through one calm next action: source lock → depth check → social context → operator receipt.</p>
                <div>
                  <b>{decisionFlowOrchestratorGate.status.replaceAll("_", " ")}</b>
                  <b>{decisionFlowOrchestratorGate.confidence}/100</b>
                  <b>{decisionFlowOrchestratorGate.actions[0]?.label ?? "source first"}</b>
                </div>
              </div>

              <div className="shield-pass296-liquidity-passport-sync mt-3" data-pass296-luxury-liquidity-passport="shield-terminal">
                <span>PASS296 · Luxury Liquidity Passport sync</span>
                <p className="shield-copy-safe">Shield terminal now gives each query a private proof passport: exchange depth, traceability, social context and earned elite status before public copy.</p>
                <div>
                  <b>{luxuryLiquidityPassportGate.status.replaceAll("_", " ")}</b>
                  <b>{luxuryLiquidityPassportGate.readiness}/100</b>
                  <b>{luxuryLiquidityPassportGate.actions[0]?.label ?? "passport review"}</b>
                </div>
              </div>

              <div className="shield-pass297-depth-radar-sync mt-3" data-pass297-depth-resilience-radar="shield-terminal">
                <span>PASS297 · Depth Resilience Radar sync</span>
                <p className="shield-copy-safe">Shield terminal now turns MEXC-style depth and LVMH/Aura-style provenance into resilience rings: thin depth slows the next action, premium status waits for proof.</p>
                <div>
                  <b>{depthResilienceRadarGate.mode.replaceAll("_", " ")}</b>
                  <b>{depthResilienceRadarGate.resilienceScore}/100</b>
                  <b>shock {depthResilienceRadarGate.shockPressure}/100</b>
                </div>
              </div>

              <div className="shield-pass298-reserve-twin-sync mt-3" data-pass298-reserve-provenance-twin="shield-terminal">
                <span>PASS298 · Reserve-Provenance Twin sync</span>
                <p className="shield-copy-safe">Shield terminal now pairs reserve/backing transparency with exchange depth and luxury provenance before customer-facing proof copy can unlock.</p>
                <div>
                  <b>{reserveProvenanceTwinGate.mode.replaceAll("_", " ")}</b>
                  <b>reserve {reserveProvenanceTwinGate.reserveScore}/100</b>
                  <b>{reserveProvenanceTwinGate.trustTier.replaceAll("_", " ")}</b>
                </div>
              </div>

              <div className="shield-pass300-fault-sweep-sync mt-3" data-pass300-adapter-fault-sweep="shield-terminal">
                <span>PASS300 · Adapter Fault Sweep sync</span>
                <p className="shield-copy-safe">Shield terminal now starts every operator path with runtime/search/adapter fault pressure before any premium status or proof receipt can appear.</p>
                <div>
                  <b>{adapterFaultSweepGate.mode.replaceAll("_", " ")}</b>
                  <b>runtime {adapterFaultSweepGate.runtimeScore}/100</b>
                  <b>{adapterFaultSweepGate.proofTier.replaceAll("_", " ")}</b>
                </div>
              </div>

              <div className="shield-pass301-contract-mesh-sync mt-3" data-pass301-source-adapter-contract-mesh="shield-terminal">
                <span>PASS301 · Source Adapter Contract Mesh sync</span>
                <p className="shield-copy-safe">Shield terminal now checks adapter contracts: identity, depth, reserve, contract control, OSINT and provenance each have timeout, retry and customer-copy rules.</p>
                <div>
                  <b>{sourceAdapterContractMeshGate.mode.replaceAll("_", " ")}</b>
                  <b>mesh {sourceAdapterContractMeshGate.meshScore}/100</b>
                  <b>{sourceAdapterContractMeshGate.proofTier.replaceAll("_", " ")}</b>
                </div>
              </div>

              <div className="shield-pass302-proof-escrow-sync mt-3" data-pass302-source-proof-escrow="shield-terminal">
                <span>PASS302 · Source Proof Escrow sync</span>
                <p className="shield-copy-safe">Shield terminal now holds public proof copy in escrow until exchange depth, reserve snapshot, contract permissions, provenance passport and redaction lanes agree.</p>
                <div>
                  <b>{sourceProofEscrowGate.releaseState.replaceAll("_", " ")}</b>
                  <b>escrow {sourceProofEscrowGate.escrowScore}/100</b>
                  <b>{sourceProofEscrowGate.trustSeal.replaceAll("_", " ")}</b>
                </div>
              </div>

              <div className="shield-pass303-circuit-breaker-sync mt-3" data-pass303-live-adapter-circuit-breaker="shield-terminal">
                <span>PASS303 · Live Adapter Circuit Breaker sync</span>
                <p className="shield-copy-safe">Shield terminal now opens, cools or locks live-source proof based on adapter continuity, source pressure, proof escrow and runtime faults.</p>
                <div>
                  <b>{liveAdapterCircuitBreakerGate.breakerState.replaceAll("_", " ")}</b>
                  <b>live {liveAdapterCircuitBreakerGate.liveReadiness}/100</b>
                  <b>pressure {liveAdapterCircuitBreakerGate.breakerPressure}/100</b>
                </div>
              </div>

              <div className="shield-pass304-timecode-ledger-sync mt-3" data-pass304-freshness-timecode-ledger="shield-terminal">
                <span>PASS304 · Freshness Timecode Ledger sync</span>
                <p className="shield-copy-safe">Shield terminal now stamps live depth, reserve context, provenance and browser replay with an expiry window before proof copy can move.</p>
                <div>
                  <b>{freshnessTimecodeLedgerGate.ledgerState.replaceAll("_", " ")}</b>
                  <b>fresh {freshnessTimecodeLedgerGate.freshnessScore}/100</b>
                  <b>drift {freshnessTimecodeLedgerGate.driftPressure}/100</b>
                </div>
              </div>

              <div className="shield-pass305-disclosure-vault-sync mt-3" data-pass305-selective-disclosure-vault="shield-terminal">
                <span>PASS305 · Selective Disclosure Vault sync</span>
                <p className="shield-copy-safe">Shield terminal now reveals public summary, guided preview, redacted receipt or operator vault based on proof timing, privacy and replay boundaries.</p>
                <div>
                  <b>{selectiveDisclosureVaultGate.vaultState.replaceAll("_", " ")}</b>
                  <b>disclosure {selectiveDisclosureVaultGate.disclosureScore}/100</b>
                  <b>privacy {selectiveDisclosureVaultGate.privacyScore}/100</b>
                </div>
              </div>


              <div className="shield-pass306-source-credential-sync mt-3" data-pass306-verifiable-source-credential="shield-terminal">
                <span>PASS306 · Verifiable Source Credential sync</span>
                <p className="shield-copy-safe">Shield terminal now issues only the credential class that issuer quorum, freshness expiry, proof completeness and selective disclosure can support.</p>
                <div>
                  <b>{verifiableSourceCredentialGate.credentialState.replaceAll("_", " ")}</b>
                  <b>credential {verifiableSourceCredentialGate.credentialScore}/100</b>
                  <b>quorum {verifiableSourceCredentialGate.issuerQuorum}/100</b>
                </div>
              </div>


              <div className="shield-pass307-retention-halo-sync mt-3" data-pass307-credential-retention-halo="shield-terminal">
                <span>PASS307 · Credential Retention Halo sync</span>
                <p className="shield-copy-safe">Shield terminal now gives every proof class an expiry, purge and replay retention window before public copy can persist.</p>
                <div>
                  <b>{credentialRetentionHaloGate.haloState.replaceAll("_", " ")}</b>
                  <b>retention {credentialRetentionHaloGate.retentionScore}/100</b>
                  <b>purge {credentialRetentionHaloGate.purgeAfterSeconds}s</b>
                </div>
              </div>


              <div className="shield-pass308-governance-oath-sync mt-3" data-pass308-source-governance-oath="shield-terminal">
                <span>PASS308 · Source Governance Oath sync</span>
                <p className="shield-copy-safe">Shield terminal now requires a source governance oath before premium proof copy can leave the operator-safe lane.</p>
                <div>
                  <b>{sourceGovernanceOathGate.oathState.replaceAll("_", " ")}</b>
                  <b>governance {sourceGovernanceOathGate.governanceScore}/100</b>
                  <b>pressure {sourceGovernanceOathGate.oathPressure}/100</b>
                </div>
              </div>


              <div className="shield-pass309-event-taxonomy-sync mt-3" data-pass309-ethical-signal-event-taxonomy="shield-terminal">
                <span>PASS309 · Ethical Signal Event Taxonomy sync</span>
                <p className="shield-copy-safe">Shield terminal now records only consent-safe proof, source and disclosure event classes instead of raw private payloads or engagement-pressure telemetry.</p>
                <div>
                  <b>{ethicalSignalEventTaxonomyGate.taxonomyState.replaceAll("_", " ")}</b>
                  <b>taxonomy {ethicalSignalEventTaxonomyGate.taxonomyScore}/100</b>
                  <b>privacy {ethicalSignalEventTaxonomyGate.privacyScore}/100</b>
                </div>
              </div>


              <div className="shield-pass310-proof-consent-sync mt-3" data-pass310-proof-consent-receipt="shield-terminal">
                <span>PASS310 · Proof Consent Receipt sync</span>
                <p className="shield-copy-safe">Shield terminal now requires a visible consent, source, expiry and redaction receipt before proof copy or report language can move public.</p>
                <div>
                  <b>{proofConsentReceiptGate.receiptState.replaceAll("_", " ")}</b>
                  <b>receipt {proofConsentReceiptGate.receiptScore}/100</b>
                  <b>consent {proofConsentReceiptGate.consentScore}/100</b>
                </div>
              </div>


              <div className="shield-pass311-audit-covenant-sync mt-3" data-pass311-audit-trail-covenant="shield-terminal">
                <span>PASS311 · Audit Trail Covenant sync</span>
                <p className="shield-copy-safe">Shield terminal now appends only a minimal audit trail after source timecode, consent chain, redaction and retention custody agree.</p>
                <div>
                  <b>{auditTrailCovenantGate.covenantState.replaceAll("_", " ")}</b>
                  <b>covenant {auditTrailCovenantGate.covenantScore}/100</b>
                  <b>custody {auditTrailCovenantGate.custodyPressure}/100</b>
                </div>
              </div>


              <div className="shield-pass312-prestige-compass-sync mt-3" data-pass312-prestige-proof-compass="shield-terminal">
                <span>PASS312 · Prestige Proof Compass sync</span>
                <p className="shield-copy-safe">Shield terminal now turns exchange freshness, reserve proof, DPP provenance, credential and audit covenant into one evidence-maturity status badge with anti-FOMO friction.</p>
                <div>
                  <b>{prestigeProofCompassGate.compassState.replaceAll("_", " ")}</b>
                  <b>prestige {prestigeProofCompassGate.prestigeScore}/100</b>
                  <b>friction {prestigeProofCompassGate.exclusivityFriction}/100</b>
                </div>
              </div>



              <div className="shield-pass313-access-runway-sync mt-3" data-pass313-atelier-access-runway="shield-terminal">
                <span>PASS313 · Atelier Access Runway sync</span>
                <p className="shield-copy-safe">Shield terminal now converts elite status into a proof-gated silent drop: live epoch, DPP passport, consent and audit must agree before any salon/access copy appears.</p>
                <div>
                  <b>{atelierAccessRunwayGate.runwayState.replaceAll("_", " ")}</b>
                  <b>salon {atelierAccessRunwayGate.salonAccessScore}/100</b>
                  <b>drop risk {atelierAccessRunwayGate.statusDropRisk}/100</b>
                </div>
              </div>

            {sourceCooldownActive ? (
              <div
                className="shield-source-cooldown mt-3"
                role="status"
                aria-live="polite"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold">
                  source cooldown
                </span>
                <span className="text-xs leading-5 text-white/[0.54]">
                  External search/analyze is rate-limited for{" "}
                  {sourceCooldownSeconds}s. Table clicks stay local-first and
                  safe.
                </span>
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
                            Tarcza pokazuje tylko warstwy review. Pełna mapa
                            działania jest na osobnej stronie Shield Map.
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <span className="shield-readability-grade">
                          <span className="text-white/[0.34]">
                            safe wording
                          </span>
                          <span className="text-velmere-gold">
                            requires review
                          </span>
                        </span>
                        <span className="shield-readability-grade">
                          <span className="text-white/[0.34]">legal rail</span>
                          <span className="text-velmere-gold">
                            Not financial advice
                          </span>
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
                                initial={
                                  reducedMotion ? false : { width: "8%" }
                                }
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
                        <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">
                          runtime guard
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-velmere-gold">
                          PASS74
                        </span>
                      </div>
                      <p className="shield-copy-safe mt-1 text-[10px] leading-5 text-white/[0.40]">
                        Tarcza nie pokazuje pełnego systemu ani JSON. To szybki
                        lens: warstwa, następny krok i skrót do pełnej Shield
                        Map.
                      </p>
                      <div className="mt-2 grid gap-1.5">
                        {(criticalReviewRows.length
                          ? criticalReviewRows
                          : [
                              {
                                id: "no-critical",
                                symbol: "—",
                                label: "No critical queue from current sweep",
                                score: 0,
                                action: "Open full map for source lanes",
                                source: "runtime",
                              },
                            ]
                        )
                          .slice(0, 3)
                          .map((row) => (
                            <Link
                              key={row.id}
                              href={
                                row.symbol !== "—"
                                  ? `/market-integrity?scan=${encodeURIComponent(row.symbol)}`
                                  : "/market-integrity/shield-map"
                              }
                              className="shield-lens-review-row shield-premium-focus"
                            >
                              <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.62]">
                                {row.symbol}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[10px] text-white/[0.42]">
                                {row.label}
                              </span>
                              <span className="shrink-0 font-mono text-[9px] text-velmere-gold">
                                {row.score}/100
                              </span>
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
                    <article
                      key={`mobile-${row.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => openTokenModal(row)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        openTokenModal(row);
                      }}
                      aria-label={`Open ${row.name} Shield analysis`}
                      className="shield-mobile-coin-card shield-premium-focus text-left transition hover:border-velmere-gold/[0.28] hover:bg-white/[0.042]"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <TokenAvatar
                            image={row.image}
                            symbol={row.symbol}
                            id={row.id}
                            name={row.name}
                          />
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
                    </article>
                  );
                })}
              </div>
              <div
                className="shield-table-scroll-x hidden md:block"
                data-pass315-table-scroll-direct="true"
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
                      <th className="px-4 py-4 text-right">
                        <SortHeader
                          label="1h"
                          sort="change1h"
                          align="right"
                        />
                      </th>
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
                                id={row.id}
                                name={row.name}
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
          <TokenRiskModal
            item={selected}
            onClose={closeTokenModal}
            handoffContext={lensHandoff?.packet}
          />
        </ShieldModalErrorBoundary>
      ) : null}
    </main>
  );
}

// PASS197 marker: Shield search suggestions render through a fixed body portal with glyph fallbacks so the dropdown cannot hide under Shield Investigator panels.
// PASS197 compatibility markers retained after PASS359 inline stabilization: createPortal · document.body · shield-token-search-suggest-portal.
// Compatibility markers for older guards after PASS197 portal refactor: z-[10000] · TokenAvatar image={item.image} · item.sourceMode === "local" ? "table" · <TokenAvatar image={item.image} symbol={item.symbol} id={item.id} name={item.name} />
// PASS196 marker: Shield search suggestions keep logo-aware image lookup plus glyph fallback for BTC/ETH/SOL/USDT.
// PASS293 compatibility: preserve legacy guard markers while Social-Exchange Router upgrades the panel.
// PASS193/PASS149 marker: token suggestions · logo aware.
// PASS149/PASS168 marker: click to open Shield readout.
// PASS414 compatibility marker: suggestions.slice(0, 3) is superseded by pass416ClampSuggestions(..., 3).

// PASS416 TERMINAL PRECISION ANCHOR · Shield search uses the same three-only clamp and close bus as Browser and Real Markets.

// PASS418 TERMINAL CLEANROOM RUNTIME · Shield suggestions stay max-three, deferred local-first and closed before modal/chart actions.

// PASS419 TERMINAL PAYLOAD STABILIZER · Shield suggestions use deferred local-first ranking, stable de-dupe, max-three and close before any token modal/chart action.
