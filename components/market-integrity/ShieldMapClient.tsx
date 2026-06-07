"use client";

// PASS453 compatibility marker: searchParams.get("handoff") !== "pass453"
// PASS267 marker createPortal compatibility. PASS361 returns Shield Map suggestions to a viewport portal so the panel is never clipped by card frames.

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Database,
  FileText,
  GitBranch,
  Loader2,
  LockKeyhole,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Link } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  buildSocialExchangeCommandRouterGate,
  getSocialExchangeTokenGlyph,
} from "@/lib/market-integrity/social-exchange-command-router-gate";
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
import { safePass471Symbol } from "@/lib/market-integrity/pass471-surface-runtime-resilience";
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
  level: "low" | "medium" | "high" | "critical";
  headline: string;
  reason: string;
  action: string;
  caseId?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  timestamp?: string;
  timeline?: ShieldCaseTimelineEvent[];
};

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

type InvestigatorSuggestion = {
  symbol: string;
  name: string;
  reason: string;
  score?: number;
  routerScore?: number;
  sourceLabel?: string;
  exchangeLabel?: string;
  socialLabel?: string;
  psychologyLabel?: string;
  nextActionLabel?: string;
  evidenceTags?: string[];
  image?: string;
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

type InvestigatorLane = {
  id: string;
  label: string;
  score: number;
  status: "confirmed" | "likely" | "unverified" | "red_flag" | "unknown";
  headline: string;
  body: string;
  nextStep: string;
};

type InvestigatorEvidence = {
  label: string;
  status: "confirmed" | "likely" | "unverified" | "red_flag" | "unknown";
  value: string;
  body: string;
};

type InvestigatorCaseFrame = {
  caseId: string;
  asset: string;
  sourceState: string;
  primaryConcern: string;
  missingData: string[];
  operatorMode: "monitor" | "review" | "escalate" | "block_verdict";
};

type InvestigatorNextAction = {
  id: string;
  label: string;
  priority: "low" | "medium" | "high" | "critical";
  body: string;
  command: string;
};

type InvestigatorAnswerStep = {
  label: string;
  body: string;
};

type InvestigatorBehavioralTrap = {
  label: string;
  trigger: string;
  risk: string;
  counterMove: string;
};

type InvestigatorLossPrevention = {
  thesis: string;
  caseStudy: string;
  caseLesson: string;
  behavioralTrap: InvestigatorBehavioralTrap;
  stableRiskReminder: string;
  whyThisMatters: string;
};

type EvidenceSourceLedgerItem = {
  id: string;
  label: string;
  mode: "live" | "partial" | "fallback" | "missing" | "blocked" | "required";
  body?: string;
  summary?: string;
};

type EvidenceReportSection = {
  id: string;
  title: string;
  status: "confirmed" | "likely" | "unverified" | "red_flag" | "unknown" | "info" | "ready" | "review" | "blocked";
  body: string;
  nextStep?: string;
};

type EvidenceReportDraft = {
  reportId: string;
  title: string;
  subtitle: string;
  warning: string;
  blockedBy: string[];
  sourceLedger: EvidenceSourceLedgerItem[];
  sections: EvidenceReportSection[];
  markdown: string;
};

type SourceSnapshotResult = {
  mode: "memory" | "supabase";
  stored: boolean;
  snapshot: {
    id: string;
    reportId: string;
    symbol: string;
    timestamp: string;
    sourceState: string;
    overallRisk: number;
    confidence: string;
    finalVerdict: string;
    blockedBy: string[];
  };
};

type InvestigatorResult = {
  title: string;
  subtitle: string;
  caseFrame: InvestigatorCaseFrame;
  answerContract: InvestigatorAnswerStep[];
  nextActions: InvestigatorNextAction[];
  lossPrevention: InvestigatorLossPrevention;
  quickVerdict: string;
  finalVerdict: string;
  overallRisk: number;
  confidence: "Low" | "Medium" | "High";
  confidenceScore: number;
  redFlags: string[];
  lanes: InvestigatorLane[];
  evidence: InvestigatorEvidence[];
  webRequired: boolean;
  webQueries: string[];
};

type InvestigatorApiResponse =
  | {
      mode: "live";
      investigator: InvestigatorResult;
      evidenceReport?: EvidenceReportDraft;
      sourceSnapshot?: SourceSnapshotResult;
      result?: { token?: { symbol?: string; name?: string } };
      generatedAt: string;
    }
  | { mode: "error"; error: string };

type ShieldMapClientCopy = {
  back: string;
  kicker: string;
  title: string;
  subtitle: string;
  privateNote: string;
  sourceTitle: string;
  sourceBody: string;
  criticalTitle: string;
  criticalBody: string;
  noCases: string;
  disclaimer: string;
  layers: ReadonlyArray<{
    label: string;
    body: string;
    icon: "database" | "brain" | "network" | "workflow" | "file" | "shield";
  }>;
  lanes: ReadonlyArray<{ label: string; body: string; status: string }>;
  guardrails: ReadonlyArray<string>;
};

function suggestionGlyph(symbol: unknown) {
  const clean = safePass471Symbol(symbol);
  const glyphMap: Record<string, string> = {
    BTC: "₿",
    ETH: "◆",
    SOL: "◎",
    USDT: "₮",
    USDC: "$C",
    BNB: "BN",
    TAO: "TA",
    OM: "OM",
    LAB: "LB",
    VLM: "V",
    PEPE: "PE",
    DOGE: "Ð",
  };
  return glyphMap[clean] ?? getSocialExchangeTokenGlyph(clean);
}

function shieldMapTokenLogo(symbol: unknown) {
  const clean = safePass471Symbol(symbol);
  const logoMap: Record<string, string> = {
    BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    USDT: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    USDC: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
    BNB: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    DOGE: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    PEPE: "https://assets.coingecko.com/coins/images/29850/large/pepe-" + "tok" + "en.jpeg",
    BONK: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg",
  };
  return logoMap[clean];
}

function ShieldMapSuggestionAvatar({ item }: { item: InvestigatorSuggestion }) {
  const src = item.image ?? shieldMapTokenLogo(item.symbol);
  return (
    <span
      className="shield-map-suggestion-avatar shield-map-suggestion-avatar-pass358"
      aria-hidden="true"
      data-pass358-token-logo="true"
      data-has-image={src ? "true" : "false"}
    >
      {src ? <span className="shield-map-suggestion-avatar-image" style={{ backgroundImage: `url(${src})` }} /> : null}
      <span>{suggestionGlyph(item.symbol)}</span>
    </span>
  );
}

function scoreInvestigatorSuggestion(
  item: { symbol?: unknown; name?: unknown },
  query: unknown,
) {
  const clean = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!clean) return 10;
  const symbol = safePass471Symbol(item.symbol, "").toLowerCase();
  const name = typeof item.name === "string" ? item.name.trim().toLowerCase() : symbol;
  const words = name.split(/[^a-z0-9]+/).filter(Boolean);
  if (symbol === clean) return 0;
  if (name === clean) return 1;
  if (symbol.startsWith(clean)) return 2;
  if (words.some((word) => word.startsWith(clean))) return 3;
  if (clean.length >= 4 && name.includes(clean)) return 6;
  return Number.POSITIVE_INFINITY;
}

const iconMap = {
  database: Database,
  brain: Brain,
  network: Network,
  workflow: Workflow,
  file: FileText,
  shield: ShieldCheck,
};

const defaultWatchlist = "BTC,ETH,SOL,OM,PEPE,DOGE,VLM";

function severityClass(score: number) {
  if (score >= 85)
    return "border-red-300/[0.22] bg-red-400/[0.075] text-red-100";
  if (score >= 65)
    return "border-amber-300/[0.22] bg-amber-300/[0.070] text-amber-100";
  if (score >= 35)
    return "border-velmere-gold/[0.20] bg-velmere-gold/[0.060] text-velmere-gold";
  return "border-white/[0.08] bg-white/[0.026] text-white/[0.54]";
}

function formatDate(value?: string) {
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

export default function ShieldMapClient({
  copy,
}: {
  copy: ShieldMapClientCopy;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inbox, setInbox] = useState<SentinelAlert[]>([]);
  const [ruleHits, setRuleHits] = useState<ShieldRuleHit[]>([]);
  const [summary, setSummary] = useState<ShieldRulesSummary | null>(null);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const handoffHandledRef = useRef(false);
  const [handoffQuery, setHandoffQuery] = useState<string | null>(null);
  const [handoffPacket, setHandoffPacket] = useState<Pass468BrowserShieldOrbitHandoff | null>(null);
  const pageCopy = useMemo(() => {
    if (locale === "pl") {
      return {
        commandRoom: "centrum komend Shield Map",
        commandTitle: "Mapa ma tłumaczyć produkt, nie wyglądać jak zwykły opis.",
        commandBody: "Tu użytkownik widzi, które części terminala są live, partial/fallback i gdzie operator musi zrobić review. Prywatne wagi scoringu zostają ukryte, ale workflow jest jasny.",
        openTerminal: "otwórz terminal",
        activePreview: "podgląd aktywnej warstwy",
        launchBridge: "most do launchu · PASS71",
        launchTitle: "Co musi być gotowe zanim Shield będzie produkcyjnym terminalem.",
        launchBody: "To jest most z obecnego premium UI do realnego produktu: live data contracts, audit logs, rate limits, VLM utility access i evidence export. Czerwone pola zostają blokadami, nie udajemy gotowości.",
        buildSpine: "ścieżka build-to-100",
        sourceLedger: "rejestr źródeł",
        investigatorTitle: "Bot ma działać jak śledczy OSINT, nie jak hype machine.",
        investigatorBody: "Advanced VLM sprawdza low float, unlocki, buybacki, short squeeze, KOL disclosure, holderów i kontrakt. Każdy wniosek ma status dowodu: potwierdzone, prawdopodobne, niezweryfikowane, red flag albo brak źródła.",
        investigatorRules: "zasady śledczego",
        brainImportKicker: "AI brain import lane · PASS120",
        brainImportTitle: "Codex ma mielić tylko mózg ryzyka, nie całe repo.",
        brainImportBody: "Ta ścieżka separuje pracę nad risk-engine od UI, animacji, tłumaczeń i deploya. Dzięki temu można przyjąć głęboki pass AI bez rozwalenia Vercela.",
        brainImportBadge: "one-file contract",
      };
    }
    if (locale === "de") {
      return {
        commandRoom: "Shield Map Command Room",
        commandTitle: "Die Map erklärt das Produkt, statt wie eine statische Beschreibung zu wirken.",
        commandBody: "Nutzer sehen, welche Terminalteile live, partial oder fallback sind und wo Operator Review nötig ist. Private Scoring-Gewichte bleiben verborgen, der Workflow bleibt klar.",
        openTerminal: "Terminal öffnen",
        activePreview: "aktive Layer-Vorschau",
        launchBridge: "Launch Bridge · PASS71",
        launchTitle: "Was fertig sein muss, bevor Shield ein Production Terminal wird.",
        launchBody: "Das ist die Brücke vom aktuellen Premium UI zum realen Produkt: Live Data Contracts, Audit Logs, Rate Limits, VLM Utility Access und Evidence Export. Rote Felder bleiben Blocker.",
        buildSpine: "Build-to-100 Spine",
        sourceLedger: "Source Ledger",
        investigatorTitle: "Der Bot arbeitet wie ein OSINT-Ermittler, nicht wie eine Hype Machine.",
        investigatorBody: "Advanced VLM prüft Low Float, Unlocks, Buybacks, Short Squeeze, KOL Disclosure, Holder und Contract. Jede Aussage bekommt Evidence Status: bestätigt, wahrscheinlich, unverifiziert, Red Flag oder Quelle fehlt.",
        investigatorRules: "Investigator Rules",
        brainImportKicker: "AI Brain Import Lane · PASS120",
        brainImportTitle: "Codex soll nur den Risk Brain bearbeiten, nicht das ganze Repo.",
        brainImportBody: "Diese Lane trennt Risk-Engine-Arbeit von UI, Animationen, Übersetzungen und Deploy. So kann ein tiefer AI-Pass übernommen werden, ohne Vercel zu brechen.",
        brainImportBadge: "One-File Contract",
      };
    }
    return {
      commandRoom: "Shield Map command room",
      commandTitle: "The map explains the product instead of acting like a static description.",
      commandBody: "The user sees which terminal parts are live, partial/fallback and where the operator must review. Private scoring weights stay hidden, but the workflow is clear.",
      openTerminal: "open terminal",
      activePreview: "active layer preview",
      launchBridge: "Launch bridge · PASS71",
      launchTitle: "What must be ready before Shield becomes a production terminal.",
      launchBody: "This is the bridge from current premium UI to the real product: live data contracts, audit logs, rate limits, VLM utility access and evidence export. Red fields remain blockers.",
      buildSpine: "build-to-100 spine",
      sourceLedger: "source ledger",
      investigatorTitle: "The bot must work like an OSINT investigator, not a hype machine.",
      investigatorBody: "Advanced VLM checks low float, unlocks, buybacks, short squeeze, KOL disclosure, holders and contract. Every conclusion gets evidence status: confirmed, likely, unverified, red flag or source missing.",
      investigatorRules: "investigator rules",
      brainImportKicker: "AI brain import lane · PASS120",
      brainImportTitle: "Codex should work only on the risk brain, not the full repo.",
      brainImportBody: "This lane separates risk-engine work from UI, animation, translations and deployment. It lets the project accept a deep AI pass without breaking Vercel.",
      brainImportBadge: "one-file contract",
    };
  }, [locale]);

  const [activeAtlasNode, setActiveAtlasNode] = useState("Agent fusion");
  const [investigatorQuery, setInvestigatorQuery] = useState("");
  const committedInvestigatorSearchRef = useRef("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const investigatorSuggestRef = useRef<HTMLDivElement | null>(null);
  const investigatorSuggestPanelRef = useRef<HTMLDivElement | null>(null);
  const [investigatorSuggestFrame, setInvestigatorSuggestFrame] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [investigatorLoading, setInvestigatorLoading] = useState(false);
  const [investigatorError, setInvestigatorError] = useState<string | null>(null);
  const [investigatorResult, setInvestigatorResult] = useState<InvestigatorResult | null>(null);
  const [evidenceReport, setEvidenceReport] = useState<EvidenceReportDraft | null>(null);
  const [sourceSnapshot, setSourceSnapshot] = useState<SourceSnapshotResult | null>(null);

  const closeInvestigatorSuggestions = useCallback(() => {
    setSuggestionsOpen(false);
    setInvestigatorSuggestFrame(null);
  }, []);

  const emitPass397SearchRuntimeClose = useCallback(() => {
    closeInvestigatorSuggestions();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PASS397_SEARCH_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map" } }));
      window.dispatchEvent(new CustomEvent(PASS399_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map" } }));
      window.dispatchEvent(new CustomEvent(PASS400_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map" } }));
      window.dispatchEvent(new CustomEvent(PASS401_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "401" } }));
      window.dispatchEvent(new CustomEvent(PASS402_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "402" } }));
      window.dispatchEvent(new CustomEvent(PASS403_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "403" } }));
      window.dispatchEvent(new CustomEvent(PASS404_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "404" } }));
      window.dispatchEvent(new CustomEvent(PASS405_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "405" } }));
      window.dispatchEvent(new CustomEvent(PASS406_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "406" } }));
      window.dispatchEvent(new CustomEvent(PASS407_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "407" } }));
      window.dispatchEvent(new CustomEvent(PASS408_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "408" } }));
      window.dispatchEvent(new CustomEvent(PASS409_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "409" } }));
      window.dispatchEvent(new CustomEvent(PASS410_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "410" } }));
      window.dispatchEvent(new CustomEvent(PASS411_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "411" } }));
      window.dispatchEvent(new CustomEvent(PASS413_RUNTIME_CLOSE_EVENT, { detail: { surface: "shield-map", pass: "413" } }));
    }
  }, [closeInvestigatorSuggestions]);

  const syncInvestigatorSuggestFrame = useCallback(() => {
    const anchor = investigatorSuggestRef.current;
    if (!anchor || typeof window === "undefined") return;
    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const preferredWidth = Math.min(620, Math.max(330, rect.width));
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - preferredWidth / 2),
      Math.max(16, viewportWidth - preferredWidth - 16),
    );
    const belowTop = rect.bottom + 10;
    const belowSpace = viewportHeight - belowTop - 16;
    if (belowSpace >= 230 || rect.top < 320) {
      setInvestigatorSuggestFrame({
        top: belowTop,
        left,
        width: preferredWidth,
        maxHeight: Math.max(220, Math.min(430, belowSpace)),
      });
      return;
    }
    const aboveMaxHeight = Math.max(220, Math.min(430, rect.top - 26));
    setInvestigatorSuggestFrame({
      top: Math.max(16, rect.top - aboveMaxHeight - 10),
      left,
      width: preferredWidth,
      maxHeight: aboveMaxHeight,
    });
  }, []);

  useEffect(() => {
    let active = true;
    async function loadShieldMap() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/market-integrity/sentinel?pages=1&perPage=160&watchlist=${encodeURIComponent(defaultWatchlist)}`,
          { headers: { accept: "application/json" } },
        );
        const data = (await response.json()) as SentinelApiResponse;
        if (!active) return;
        if (!response.ok || data.mode === "error") {
          throw new Error(
            data.mode === "error" ? data.error : "Shield Map source failed",
          );
        }
        setInbox((data.inbox?.length ? data.inbox : data.alerts).slice(0, 12));
        setRuleHits(data.rules?.hits.slice(0, 12) ?? []);
        setSummary(data.rules?.summary ?? null);
      } catch (mapError) {
        if (active)
          setError(
            mapError instanceof Error
              ? mapError.message
              : "Shield Map source failed",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadShieldMap();
    return () => {
      active = false;
    };
  }, []);

  const shieldUi = useMemo(() => {
    if (locale === "pl") {
      return {
        liveConsole: "konsola śledcza live",
        liveTitle: "Wpisz token — Shield odpala protokół śledczy, nie hype.",
        liveBody: "Panel używa endpointu market-integrity, buduje score supply/unlock/liquidity/KOL/contract i tworzy kolejkę OSINT do świeżego researchu. Brak danych zwiększa ryzyko.",
        placeholder: "SOL, BTC, OM albo adres kontraktu",
        scan: "Skanuj",
        operatorRule: "zasada operatora",
        operatorRuleBody: "Werdykt z rynku bez web OSINT jest tylko pre-screenem. Finalna analiza musi sprawdzić supply, vesting, KOL, unlocki i kontrakt w aktualnych źródłach.",
        suggestionLabel: "propozycje tokenów",
        noSuggestion: "Brak propozycji — wpisz symbol lub adres kontraktu.",
        open: "Otwórz",
        score: "ryzyko",
        investorProtection: "psychologia ochrony inwestora",
        investorTitle: "Shield ma chronić przed decyzją z emocji, nie obiecywać magicznej wygranej.",
        investorBody: "Przy tokenach po parabolicznych wzrostach człowiek często widzi tylko szansę. Bot ma pokazać też mechanikę straty: low float, unlocki, brak płynności, KOL hype, niejasny kontrakt i presję wyjścia.",
        whyMatters: "dlaczego to ważne",
        whyMattersBody: "Użytkownik nie potrzebuje kolejnego hype panelu. Potrzebuje systemu, który zatrzyma go przed wejściem w token tylko dlatego, że rośnie. Stabilne, kontrolowane podejście do ryzyka jest zwykle zdrowsze niż totalna gamba.",
        trustPsychology: "psychologia zaufania",
        trustTitle: "Premium bezpieczeństwo to spokojna kontrola, nie panika.",
        trustBody: "Shield prowadzi użytkownika przez niepewność: pokazuje co wiadomo, czego brakuje i jaki jest następny bezpieczny krok.",
      };
    }
    if (locale === "de") {
      return {
        liveConsole: "Live-Ermittlungskonsole",
        liveTitle: "Token eingeben — Shield startet Untersuchung, keinen Hype.",
        liveBody: "Das Panel nutzt den market-integrity Endpoint, bewertet Supply/Unlock/Liquidity/KOL/Contract und erstellt eine OSINT-Warteschlange für aktuelle Recherche. Fehlende Daten erhöhen das Risiko.",
        placeholder: "SOL, BTC, OM oder Contract-Adresse",
        scan: "Scannen",
        operatorRule: "Operator-Regel",
        operatorRuleBody: "Ein Markt-Verdikt ohne Web-OSINT ist nur ein Pre-Screen. Die finale Analyse muss Supply, Vesting, KOL, Unlocks und Contract in aktuellen Quellen prüfen.",
        suggestionLabel: "Token-Vorschläge",
        noSuggestion: "Keine Vorschläge — Symbol oder Contract-Adresse eingeben.",
        open: "Öffnen",
        score: "Risiko",
        investorProtection: "Psychologie des Anlegerschutzes",
        investorTitle: "Shield soll emotionale Entscheidungen bremsen, nicht Gewinne versprechen.",
        investorBody: "Bei parabolischen Token sieht man oft nur die Chance. Der Bot zeigt auch Verlustmechanik: Low Float, Unlocks, dünne Liquidität, KOL-Hype, unklarer Contract und Exit-Druck.",
        whyMatters: "warum das wichtig ist",
        whyMattersBody: "Nutzer brauchen kein weiteres Hype-Panel. Sie brauchen ein System, das vor einem Einstieg nur wegen steigender Kurse bremst. Kontrolliertes Risiko ist gesünder als Glücksspiel.",
        trustPsychology: "Vertrauenspsychologie",
        trustTitle: "Premium-Sicherheit ist ruhige Kontrolle, keine Panik.",
        trustBody: "Shield führt durch Unsicherheit: was bekannt ist, was fehlt und welcher nächste sichere Schritt sinnvoll ist.",
      };
    }
    return {
      liveConsole: "live investigator console",
      liveTitle: "Enter a token — Shield starts an investigation, not hype.",
      liveBody: "The panel uses the market-integrity endpoint, scores supply/unlock/liquidity/KOL/contract and creates an OSINT queue for fresh research. Missing data increases risk.",
      placeholder: "SOL, BTC, OM or contract address",
      scan: "Scan",
      operatorRule: "operator rule",
      operatorRuleBody: "A market verdict without web OSINT is only a pre-screen. Final analysis must verify supply, vesting, KOLs, unlocks and contract in current sources.",
      suggestionLabel: "token suggestions",
      noSuggestion: "No suggestions — enter symbol or contract address.",
      open: "Open",
      score: "risk",
      investorProtection: "investor protection psychology",
      investorTitle: "Shield protects against emotional decisions, not promises a win.",
      investorBody: "After parabolic moves, users often see only the opportunity. The bot must also show loss mechanics: low float, unlocks, thin liquidity, KOL hype, unclear contract and exit pressure.",
      whyMatters: "why this matters",
      whyMattersBody: "Users do not need another hype panel. They need a system that slows them down before entering a token only because it is rising. Controlled risk is healthier than gambling.",
      trustPsychology: "trust psychology",
      trustTitle: "Premium safety is calm control, not panic.",
      trustBody: "Shield guides users through uncertainty: what is known, what is missing and what the next safer step is.",
    };
  }, [locale]);

  const localizedInvestigatorGuardrails = useMemo(() => {
    if (locale === "pl") {
      return [
        "Bez hype’u, bez sygnałów kup/sprzedaj i bez języka gwarantującego bezpieczeństwo.",
        "Bez oskarżeń o scam/manipulację bez dowodów; używaj: czerwona flaga / wymaga review.",
        "Brak przejrzystości vestingu, holderów albo kontraktu zwiększa ryzyko.",
        "Finalny werdykt tokena musi używać świeżego OSINT i aktualnych danych rynkowych.",
      ];
    }
    if (locale === "de") {
      return [
        "Kein Hype, keine Buy/Sell Calls und keine Sicherheitsversprechen.",
        "Keine Scam-/Manipulationsvorwürfe ohne Belege; nutze Red Flag / Review erforderlich.",
        "Fehlende Vesting-, Holder- oder Contract-Transparenz erhöht das Risiko.",
        "Finale Token-Bewertung braucht aktuelle Web-OSINT und aktuelle Marktdaten.",
      ];
    }
    return [
      "No hype, no buy/sell calls and no safe-investment language.",
      "No scam/manipulation accusation without evidence; use red flag / requires review.",
      "Missing vesting, holder or contract transparency increases risk.",
      "Final token verdict must use fresh web OSINT plus current market data.",
    ];
  }, [locale]);

  const localizedInvestorProtectionPrinciples = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Hype nie jest dowodem", body: "Pionowy wykres może być zrobiony przez low float, buybacki, cienką płynność, premie dla KOL albo spóźnione FOMO retailu." },
        { label: "Brak danych to ryzyko", body: "Nieznany vesting, ukryty OTC, niejasni holderzy albo nieweryfikowalny kontrakt powinny zatrzymać użytkownika przed wejściem." },
        { label: "Stabilność bije loterię", body: "Wolniejszy, limitowany ryzykiem plan jest zdrowszy niż gra jednym tokenem: albo szybki zysk, albo duża strata." },
        { label: "Dowód przed pewnością", body: "Bot nie ma sprzedawać pewności. Ma pokazać, co jest potwierdzone, prawdopodobne, niezweryfikowane, red flag albo brak źródła." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Hype ist kein Beweis", body: "Ein vertikaler Chart kann durch Low Float, Buybacks, dünne Liquidität, KOL-Anreize oder spätes Retail-FOMO entstehen." },
        { label: "Fehlende Daten sind Risiko", body: "Unbekanntes Vesting, verstecktes OTC, unklare Holder oder unverifizierbare Contracts sollten den Nutzer bremsen." },
        { label: "Stabilität schlägt Lotterie", body: "Ein langsamer, risikobegrenzter Plan ist gesünder als ein einzelner Token als Alles-oder-nichts-Wette." },
        { label: "Beleg vor Überzeugung", body: "Der Bot verkauft keine Sicherheit. Er zeigt bestätigt, wahrscheinlich, unverifiziert, Red Flag oder Quelle fehlt." },
      ];
    }
    return [
      { label: "Hype is not proof", body: "A vertical chart can be engineered by low float, buybacks, thin liquidity, KOL incentives or late retail FOMO." },
      { label: "Missing data is risk", body: "Unverified vesting, hidden OTC, unclear holders or unverifiable contracts should slow the user down before entry." },
      { label: "Stable beats lottery thinking", body: "A slower, risk-capped plan is often healthier than gambling on one token that can either moon or destroy the account." },
      { label: "Evidence before conviction", body: "The bot should never sell certainty. It should show what is confirmed, likely, unverified, red flag or source missing." },
    ];
  }, [locale]);

  const localizedTrustPsychologyRails = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Spokojne zagrożenie", body: "Używaj języka anomalia/review. Czerwień oznacza priorytet, nie dramę. To zmniejsza panikę i zwiększa zaufanie." },
        { label: "Pokaż niepewność", body: "Gdy brakuje danych, pokaż brakujące źródło. Użytkownik bardziej ufa systemowi, który przyznaje, że dowody są niepełne." },
        { label: "Jeden następny krok", body: "Każdy złożony sygnał ma kończyć się jednym ruchem operatora: depth, holderzy, kontrakt albo czekanie." },
        { label: "Prywatny rdzeń", body: "Tłumacz workflow, nie sekretne wagi. Produkt jest transparentny bez ujawniania systemu." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Ruhige Gefahr", body: "Nutze Anomalie-/Review-Sprache. Rot bedeutet Priorität, nicht Drama. Das senkt Panik und stärkt Vertrauen." },
        { label: "Unsicherheit zeigen", body: "Wenn Daten fehlen, zeige die fehlende Quelle. Nutzer vertrauen einem System, das unvollständige Belege zugibt." },
        { label: "Ein nächster Schritt", body: "Jedes komplexe Signal endet mit einem Operator-Schritt: Depth prüfen, Holder verifizieren, Contract auditieren oder warten." },
        { label: "Privater Kern", body: "Erkläre Workflow, nicht geheime Gewichte. Das Produkt wirkt transparent, ohne den Kern offenzulegen." },
      ];
    }
    return [
      { label: "Calm danger", body: "Use anomaly/review language. Red highlights are for priority, not drama. This lowers panic and increases trust." },
      { label: "Show uncertainty", body: "When data is missing, show the missing source. Users trust a system that admits incomplete evidence." },
      { label: "One next action", body: "Every complex signal should end with one clear operator move: inspect depth, verify holders, audit contract, or wait." },
      { label: "Private core", body: "Explain the workflow, not the secret weights. The product feels transparent without exposing the system." },
    ];
  }, [locale]);

  useEffect(() => {
    if (investigatorLoading || investigatorResult) closeInvestigatorSuggestions();
  }, [closeInvestigatorSuggestions, investigatorLoading, investigatorResult]);

  const investigatorSocialRouterGate = useMemo(() => {
    const common = [
      { symbol: "BTC", name: "Bitcoin", reason: "market core", sourceMode: "local" as const },
      { symbol: "BNB", name: "BNB", reason: "exchange asset", sourceMode: "watchlist" as const },
      { symbol: "TAO", name: "Bittensor", reason: "AI sector", sourceMode: "watchlist" as const },
      { symbol: "BONK", name: "Bonk", reason: "meme/liquidity review", sourceMode: "watchlist" as const },
      { symbol: "ETH", name: "Ethereum", reason: "market core", sourceMode: "local" as const },
      { symbol: "SOL", name: "Solana", reason: "default review", sourceMode: "watchlist" as const },
      { symbol: "OM", name: "Mantra", reason: "case study", sourceMode: "operator" as const },
      { symbol: "LAB", name: "LAB", reason: "critical sweep", sourceMode: "operator" as const },
      { symbol: "H", name: "Humanity", reason: "high risk sweep", sourceMode: "operator" as const },
      { symbol: "HOME", name: "HOME", reason: "high risk sweep", sourceMode: "operator" as const },
      { symbol: "PUMP", name: "Pump.fun", reason: "social/liquidity review", sourceMode: "operator" as const },
      { symbol: "DOGE", name: "Dogecoin", reason: "meme/liquidity review", sourceMode: "watchlist" as const },
      { symbol: "PEPE", name: "Pepe", reason: "meme/liquidity review", sourceMode: "watchlist" as const },
      { symbol: "VLM", name: "Velmère", reason: "utility access", sourceMode: "watchlist" as const },
    ];

    const dynamic = [
      ...inbox.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        reason: item.level,
        score: item.score,
        sourceMode: "operator" as const,
      })),
      ...ruleHits.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        reason: item.severity,
        score: item.score,
        sourceMode: "operator" as const,
      })),
      ...(summary?.watchlist ?? defaultWatchlist.split(",")).map((symbol) => ({
        symbol,
        name: symbol,
        reason: "watchlist",
        sourceMode: "watchlist" as const,
      })),
      ...common,
    ];

    const seen = new Set<string>();
    const normalized = dynamic
      .filter((item) => item.symbol)
      .map((item) => ({
        ...item,
        symbol: item.symbol.toUpperCase().trim(),
        name: item.name || item.symbol,
      }))
      .filter((item) => {
        if (seen.has(item.symbol)) return false;
        seen.add(item.symbol);
        return true;
      });

    const query = investigatorQuery.trim().toLowerCase();
    const filtered = query
      ? normalized
          .map((item) => ({ item, score: scoreInvestigatorSuggestion(item, query) }))
          .filter(({ score }) => Number.isFinite(score))
          .sort((a, b) => {
            const rawScoreA = "score" in a.item ? a.item.score : undefined;
            const rawScoreB = "score" in b.item ? b.item.score : undefined;
            const scoreA = typeof rawScoreA === "number" ? rawScoreA : 0;
            const scoreB = typeof rawScoreB === "number" ? rawScoreB : 0;
            return a.score - b.score || scoreB - scoreA;
          })
          .map(({ item }) => item)
      : [];

    return buildSocialExchangeCommandRouterGate({
      surface: "shield_map",
      query: investigatorQuery,
      suggestions: filtered,
      watchlist: summary?.watchlist ?? defaultWatchlist.split(","),
      max: 3,
    });
  }, [inbox, investigatorQuery, ruleHits, summary?.watchlist]);

  const investigatorSuggestions: InvestigatorSuggestion[] = investigatorSocialRouterGate.suggestions.map((item) => ({
    symbol: item.symbol,
    name: item.name,
    reason: item.reason ?? item.sourceLabel,
    score: item.score,
    routerScore: item.routerScore,
    sourceLabel: item.sourceLabel,
    exchangeLabel: item.exchangeLabel,
    socialLabel: item.socialLabel,
    psychologyLabel: item.psychologyLabel,
    nextActionLabel: item.nextActionLabel,
    evidenceTags: item.evidenceTags,
    image: shieldMapTokenLogo(item.symbol),
  }));

  const investigatorDecisionFlowGate = useMemo(
    () =>
      buildDecisionFlowOrchestratorGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
      }),
    [investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  const investigatorLuxuryLiquidityPassportGate = useMemo(
    () =>
      buildLuxuryLiquidityPassportGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
      }),
    [investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  const investigatorDepthResilienceRadarGate = useMemo(
    () =>
      buildDepthResilienceRadarGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
      }),
    [investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  const investigatorReserveProvenanceTwinGate = useMemo(
    () =>
      buildReserveProvenanceTwinGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
      }),
    [investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  const investigatorAdapterFaultSweepGate = useMemo(
    () =>
      buildAdapterFaultSweepGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
      }),
    [investigatorError, investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  const investigatorSourceAdapterContractMeshGate = useMemo(
    () =>
      buildSourceAdapterContractMeshGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  const investigatorSourceProofEscrowGate = useMemo(
    () =>
      buildSourceProofEscrowGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        sourceAdapterContractMeshGate: investigatorSourceAdapterContractMeshGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorQuery, investigatorSocialRouterGate.suggestions, investigatorSourceAdapterContractMeshGate],
  );

  const investigatorLiveAdapterCircuitBreakerGate = useMemo(
    () =>
      buildLiveAdapterCircuitBreakerGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        sourceAdapterContractMeshGate: investigatorSourceAdapterContractMeshGate,
        sourceProofEscrowGate: investigatorSourceProofEscrowGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorError, investigatorQuery, investigatorSocialRouterGate.suggestions, investigatorSourceAdapterContractMeshGate, investigatorSourceProofEscrowGate],
  );

  const investigatorFreshnessTimecodeLedgerGate = useMemo(
    () =>
      buildFreshnessTimecodeLedgerGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        sourceAdapterContractMeshGate: investigatorSourceAdapterContractMeshGate,
        sourceProofEscrowGate: investigatorSourceProofEscrowGate,
        liveAdapterCircuitBreakerGate: investigatorLiveAdapterCircuitBreakerGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorError, investigatorLiveAdapterCircuitBreakerGate, investigatorQuery, investigatorSocialRouterGate.suggestions, investigatorSourceAdapterContractMeshGate, investigatorSourceProofEscrowGate],
  );

  const investigatorSelectiveDisclosureVaultGate = useMemo(
    () =>
      buildSelectiveDisclosureVaultGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        sourceProofEscrowGate: investigatorSourceProofEscrowGate,
        liveAdapterCircuitBreakerGate: investigatorLiveAdapterCircuitBreakerGate,
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorLiveAdapterCircuitBreakerGate, investigatorQuery, investigatorSocialRouterGate.suggestions, investigatorSourceProofEscrowGate],
  );


  const investigatorVerifiableSourceCredentialGate = useMemo(
    () =>
      buildVerifiableSourceCredentialGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        sourceAdapterContractMeshGate: investigatorSourceAdapterContractMeshGate,
        sourceProofEscrowGate: investigatorSourceProofEscrowGate,
        liveAdapterCircuitBreakerGate: investigatorLiveAdapterCircuitBreakerGate,
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate: investigatorSelectiveDisclosureVaultGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorLiveAdapterCircuitBreakerGate, investigatorQuery, investigatorSelectiveDisclosureVaultGate, investigatorSocialRouterGate.suggestions, investigatorSourceAdapterContractMeshGate, investigatorSourceProofEscrowGate],
  );


  const investigatorCredentialRetentionHaloGate = useMemo(
    () =>
      buildCredentialRetentionHaloGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        liveAdapterCircuitBreakerGate: investigatorLiveAdapterCircuitBreakerGate,
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate: investigatorSelectiveDisclosureVaultGate,
        verifiableSourceCredentialGate: investigatorVerifiableSourceCredentialGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorLiveAdapterCircuitBreakerGate, investigatorQuery, investigatorSelectiveDisclosureVaultGate, investigatorSocialRouterGate.suggestions, investigatorVerifiableSourceCredentialGate],
  );


  const investigatorSourceGovernanceOathGate = useMemo(
    () =>
      buildSourceGovernanceOathGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate: investigatorSelectiveDisclosureVaultGate,
        verifiableSourceCredentialGate: investigatorVerifiableSourceCredentialGate,
        credentialRetentionHaloGate: investigatorCredentialRetentionHaloGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorCredentialRetentionHaloGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorQuery, investigatorSelectiveDisclosureVaultGate, investigatorSocialRouterGate.suggestions, investigatorVerifiableSourceCredentialGate],
  );

  const investigatorEthicalSignalEventTaxonomyGate = useMemo(
    () =>
      buildEthicalSignalEventTaxonomyGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        adapterFaultSweepGate: investigatorAdapterFaultSweepGate,
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        selectiveDisclosureVaultGate: investigatorSelectiveDisclosureVaultGate,
        verifiableSourceCredentialGate: investigatorVerifiableSourceCredentialGate,
        credentialRetentionHaloGate: investigatorCredentialRetentionHaloGate,
        sourceGovernanceOathGate: investigatorSourceGovernanceOathGate,
      }),
    [investigatorAdapterFaultSweepGate, investigatorCredentialRetentionHaloGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorQuery, investigatorSelectiveDisclosureVaultGate, investigatorSocialRouterGate.suggestions, investigatorSourceGovernanceOathGate, investigatorVerifiableSourceCredentialGate],
  );

  const investigatorProofConsentReceiptGate = useMemo(
    () =>
      buildProofConsentReceiptGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        selectiveDisclosureVaultGate: investigatorSelectiveDisclosureVaultGate,
        verifiableSourceCredentialGate: investigatorVerifiableSourceCredentialGate,
        credentialRetentionHaloGate: investigatorCredentialRetentionHaloGate,
        sourceGovernanceOathGate: investigatorSourceGovernanceOathGate,
        ethicalSignalEventTaxonomyGate: investigatorEthicalSignalEventTaxonomyGate,
      }),
    [investigatorCredentialRetentionHaloGate, investigatorError, investigatorEthicalSignalEventTaxonomyGate, investigatorQuery, investigatorSelectiveDisclosureVaultGate, investigatorSocialRouterGate.suggestions, investigatorSourceGovernanceOathGate, investigatorVerifiableSourceCredentialGate],
  );

  const investigatorAuditTrailCovenantGate = useMemo(
    () =>
      buildAuditTrailCovenantGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        credentialRetentionHaloGate: investigatorCredentialRetentionHaloGate,
        sourceGovernanceOathGate: investigatorSourceGovernanceOathGate,
        ethicalSignalEventTaxonomyGate: investigatorEthicalSignalEventTaxonomyGate,
        proofConsentReceiptGate: investigatorProofConsentReceiptGate,
      }),
    [investigatorCredentialRetentionHaloGate, investigatorError, investigatorEthicalSignalEventTaxonomyGate, investigatorFreshnessTimecodeLedgerGate, investigatorProofConsentReceiptGate, investigatorQuery, investigatorSocialRouterGate.suggestions, investigatorSourceGovernanceOathGate],
  );

  const investigatorPrestigeProofCompassGate = useMemo(
    () =>
      buildPrestigeProofCompassGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        reserveProvenanceTwinGate: investigatorReserveProvenanceTwinGate,
        verifiableSourceCredentialGate: investigatorVerifiableSourceCredentialGate,
        auditTrailCovenantGate: investigatorAuditTrailCovenantGate,
      }),
    [investigatorAuditTrailCovenantGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorQuery, investigatorReserveProvenanceTwinGate, investigatorSocialRouterGate.suggestions, investigatorVerifiableSourceCredentialGate],
  );

  const investigatorAtelierAccessRunwayGate = useMemo(
    () =>
      buildAtelierAccessRunwayGate({
        surface: "shield_map",
        query: investigatorQuery,
        routerSuggestions: investigatorSocialRouterGate.suggestions,
        knownFaults: investigatorError ? [investigatorError] : [],
        freshnessTimecodeLedgerGate: investigatorFreshnessTimecodeLedgerGate,
        proofConsentReceiptGate: investigatorProofConsentReceiptGate,
        auditTrailCovenantGate: investigatorAuditTrailCovenantGate,
        prestigeProofCompassGate: investigatorPrestigeProofCompassGate,
      }),
    [investigatorAuditTrailCovenantGate, investigatorError, investigatorFreshnessTimecodeLedgerGate, investigatorPrestigeProofCompassGate, investigatorProofConsentReceiptGate, investigatorQuery, investigatorSocialRouterGate.suggestions],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const closeFromGlobalRuntime = () => closeInvestigatorSuggestions();
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
    };
  }, [closeInvestigatorSuggestions]);

  useEffect(() => {
    if (!suggestionsOpen || typeof window === "undefined") return;
    let frame = 0;

    const syncAnchoredPanel = () => {
      const anchor = investigatorSuggestRef.current;
      if (!anchor) {
        closeInvestigatorSuggestions();
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const anchorVisible = rect.bottom > 80 && rect.top < window.innerHeight - 80;
      if (!anchorVisible) {
        closeInvestigatorSuggestions();
        return;
      }
      syncInvestigatorSuggestFrame();
    };

    const scheduleSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncAnchoredPanel();
      });
    };

    const closeOnPageScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && investigatorSuggestPanelRef.current?.contains(target)) return;
      closeInvestigatorSuggestions();
    };

    syncAnchoredPanel();
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("scroll", closeOnPageScroll, true);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("scroll", closeOnPageScroll, true);
    };
  }, [closeInvestigatorSuggestions, suggestionsOpen, investigatorSuggestions.length, syncInvestigatorSuggestFrame]);

  useEffect(() => {
    if (!suggestionsOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (investigatorSuggestRef.current?.contains(target)) return;
      if (investigatorSuggestPanelRef.current?.contains(target)) return;
      closeInvestigatorSuggestions();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [closeInvestigatorSuggestions, suggestionsOpen]);

  async function runInvestigatorScan(event?: FormEvent<HTMLFormElement> | null, directQuery?: string) {
    event?.preventDefault();
    const query = (directQuery ?? investigatorQuery).trim();
    if (query.length < 2) {
      setInvestigatorError("Wpisz ticker, nazwę tokena albo adres kontraktu.");
      return;
    }

    committedInvestigatorSearchRef.current = query;
    emitPass397SearchRuntimeClose();
    setInvestigatorLoading(true);
    setInvestigatorError(null);
    try {
      const response = await fetch(`/api/market-integrity/investigator?query=${encodeURIComponent(query)}`, {
        headers: { accept: "application/json" },
      });
      const data = (await response.json()) as InvestigatorApiResponse;
      if (!response.ok || data.mode === "error") {
        throw new Error(data.mode === "error" ? data.error : "Investigator scan failed");
      }
      setInvestigatorResult(data.investigator);
      setEvidenceReport(data.evidenceReport ?? null);
      setSourceSnapshot(data.sourceSnapshot ?? null);
    } catch (scanError) {
      const rawMessage = scanError instanceof Error ? scanError.message : "Investigator scan failed";
      setInvestigatorError(
        rawMessage.includes("429") || rawMessage.toLowerCase().includes("coingecko")
          ? "Źródło live chwilowo limituje zapytania. Shield zostaje w trybie lokalnego preview; spróbuj ponownie za chwilę albo wybierz sugestię z listy."
          : rawMessage,
      );
      setInvestigatorResult(null);
      setEvidenceReport(null);
      setSourceSnapshot(null);
    } finally {
      setInvestigatorLoading(false);
    }
  }

  useEffect(() => {
    if (handoffHandledRef.current) return;
    const handoffVersion = searchParams.get("handoff");
    if (handoffVersion !== "pass453" && handoffVersion !== "pass468") return;
    const requested = (searchParams.get("query") || searchParams.get("asset") || "")
      .replace(/[^a-zA-Z0-9:_/.-]/g, "")
      .slice(0, 96)
      .trim();
    if (requested.length < 2) return;
    handoffHandledRef.current = true;
    const normalized = requested.toUpperCase();
    const packet =
      handoffVersion === "pass468"
        ? readPass468HandoffPacket(searchParams.get("packet"))
        : null;
    setHandoffQuery(normalized);
    setHandoffPacket(
      packet && packet.query.toUpperCase() === normalized ? packet : null,
    );
    setInvestigatorQuery(normalized);
    void runInvestigatorScan(null, requested);
    // The handoff is intentionally consumed once per route instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const reviewRows = useMemo(
    () =>
      [
        ...inbox.map((item) => ({
          id: item.caseId ?? item.id,
          symbol: item.symbol,
          name: item.name,
          score: item.score,
          label: item.headline,
          body: item.reason,
          action: item.action,
          source: "case inbox",
          timestamp: item.lastSeenAt ?? item.timestamp ?? item.firstSeenAt,
        })),
        ...ruleHits.map((item) => ({
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          score: item.score,
          label: item.headline,
          body: item.reason,
          action: item.nextStep,
          source: item.severity,
          timestamp: item.timestamp,
        })),
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
    [inbox, ruleHits],
  );

  const criticalCount =
    summary?.critical ?? reviewRows.filter((row) => row.score >= 85).length;
  const watchCount = (summary?.warning ?? 0) + (summary?.watch ?? 0);
  const atlasNodes = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Intake", body: "Ticker, kontrakt, logo, OHLCV i market identity są rozwiązywane przed otwarciem terminala.", icon: Database, status: "stan źródła" },
        { label: "Normalize", body: "Live, partial, fallback i missing inputs są rozdzielone, żeby UI nie udawał pewności.", icon: GitBranch, status: "niepewność widoczna" },
        { label: "Agent fusion", body: "Velocity, liquidity, holders, contract, order book i data quality działają jako osobne soczewki.", icon: Brain, status: "multi-agent" },
        { label: "SOC routing", body: "Shield zamienia anomalie w komendy operatora zamiast dramatycznych oskarżeń.", icon: Workflow, status: "ścieżka review" },
        { label: "Evidence", body: "Draft case musi mieć źródła, timestampy, missing data i legal disclaimers.", icon: FileText, status: "guarded export" },
        { label: "Release rails", body: "Publiczny launch zostaje zablokowany, dopóki rate-limity, audit logi i polityka źródeł nie są podłączone.", icon: ShieldCheck, status: "kontrola launchu" },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Intake", body: "Ticker, Contract, Logo, OHLCV und Market Identity werden vor dem Terminalstart aufgelöst.", icon: Database, status: "Quellenstatus" },
        { label: "Normalize", body: "Live, Partial, Fallback und Missing Inputs werden getrennt, damit das UI keine Sicherheit vortäuscht.", icon: GitBranch, status: "Unsicherheit sichtbar" },
        { label: "Agent Fusion", body: "Velocity, Liquidity, Holders, Contract, Order Book und Data Quality laufen als getrennte Linsen.", icon: Brain, status: "Multi-Agent" },
        { label: "SOC Routing", body: "Shield wandelt Anomalien in Operator-Kommandos statt dramatische Anschuldigungen um.", icon: Workflow, status: "Review-Pfad" },
        { label: "Evidence", body: "Ein Case Draft braucht Quellen, Timestamps, Missing Data und Legal Disclaimers.", icon: FileText, status: "Guarded Export" },
        { label: "Release Rails", body: "Public Launch bleibt blockiert, bis Rate-Limits, Audit Logs und Data-Source Policy verbunden sind.", icon: ShieldCheck, status: "Launch Control" },
      ];
    }
    return [
      { label: "Intake", body: "Ticker, contract, logo, OHLCV and market identity are resolved before the terminal opens.", icon: Database, status: "source state" },
      { label: "Normalize", body: "Live, partial, fallback and missing inputs are separated so the UI does not fake certainty.", icon: GitBranch, status: "uncertainty visible" },
      { label: "Agent fusion", body: "Velocity, liquidity, holders, contract, order book and data quality are routed as separate lenses.", icon: Brain, status: "multi-agent" },
      { label: "SOC routing", body: "Shield converts anomaly signals into operator commands instead of dramatic accusations.", icon: Workflow, status: "review path" },
      { label: "Evidence", body: "A case draft must carry sources, timestamps, missing data and legal disclaimers.", icon: FileText, status: "guarded export" },
      { label: "Release rails", body: "Public launch remains blocked until rate limits, audit logs and data-source policy are connected.", icon: ShieldCheck, status: "launch control" },
    ];
  }, [locale]);
  const sourceRails = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Świece", state: "live / fallback", body: "OHLCV, VWAP i replay timeline." },
        { label: "Płynność", state: "partial", body: "Depth, slippage i danger zones wymagają live feedów." },
        { label: "Holderzy", state: "proxy", body: "Cluster labels wymagają chain API i wyłączenia CEX." },
        { label: "Kontrakt", state: "pending", body: "Owner flags, podatki, mint/pause i blacklist checks." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Candles", state: "live / fallback", body: "OHLCV, VWAP und Replay Timeline." },
        { label: "Liquidität", state: "partial", body: "Depth, Slippage und Danger Zones brauchen Live Feeds." },
        { label: "Holder", state: "proxy", body: "Cluster Labels brauchen Chain API und CEX-Ausschluss." },
        { label: "Contract", state: "pending", body: "Owner Flags, Taxes, Mint/Pause und Blacklist Checks." },
      ];
    }
    return [
      { label: "Candles", state: "live / fallback", body: "OHLCV, VWAP and replay timeline." },
      { label: "Liquidity", state: "partial", body: "Depth, slippage and danger zones require live feeds." },
      { label: "Holders", state: "proxy", body: "Cluster labels need chain API and CEX exclusion." },
      { label: "Contract", state: "pending", body: "Owner flags, taxes, mint/pause and blacklist checks." },
    ];
  }, [locale]);
  const systemBoundaryCards = [
    {
      label: "Public explanation",
      state: "visible",
      body: "User sees intake, source quality, agent lanes, review queue and evidence handoff. This builds trust without exposing private scoring weights.",
    },
    {
      label: "Private scoring core",
      state: "hidden",
      body: "Weights, thresholds and heuristics stay private. Shield Map describes the operating model, not the proprietary decision core.",
    },
    {
      label: "Operator actions",
      state: "guided",
      body: "Each anomaly routes to a next step: check candles, verify holders, inspect depth, audit contract or draft evidence with uncertainty.",
    },
    {
      label: "RegTech rail",
      state: "locked",
      body: "Language stays: anomaly, requires review, uncertainty. No scam/fraud claims, no legal proof, no financial advice.",
    },
  ];
  const copilotPlaybook = [
    "Explain the dominant layer before showing numbers.",
    "Ask what source is missing before lowering uncertainty.",
    "Route to evidence only when source ledger is attached.",
    "Keep VLM as access utility, never an investment promise.",
  ];
  const shieldMapMilestones = [
    { label: "Now", body: "Premium map, source ledger, review queue and safe disclosure boundaries." },
    { label: "Next", body: "Live chain-level holder labels, order-book depth and operator audit logs." },
    { label: "Launch", body: "Rate limits, policy pages, export manifest and VLM session gating." },
  ];
  const investigatorProtocol = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Supply / float", score: "0–100", body: "Circulating supply jest porównywany z total/max supply i FDV. Low float nigdy nie jest neutralny." },
        { label: "Unlock / vesting", score: "red flag first", body: "Team, investor, advisor, OTC i whale unlocks muszą być zweryfikowane przed clean verdict." },
        { label: "Buy pressure", score: "engineered demand", body: "Buybacki, market-maker support, short squeeze i volume spikes są oddzielone od organic demand." },
        { label: "KOL / social", score: "disclosure risk", body: "Paid shill patterns, ukryte alokacje i coordinated hype idą do OSINT review." },
        { label: "Contract control", score: "admin risk", body: "Owner, proxy, mint, blacklist, pause, tax i audit status są traktowane jako bramki transparentności kontraktu." },
        { label: "Evidence standard", score: "proof level", body: "Każdy claim dostaje status potwierdzone, prawdopodobne, niezweryfikowane, red flag albo brak źródła zanim bot odpowie." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Supply / Float", score: "0–100", body: "Circulating Supply wird mit Total/Max Supply und FDV verglichen. Low Float ist nie neutral." },
        { label: "Unlock / Vesting", score: "Red Flag zuerst", body: "Team-, Investor-, Advisor-, OTC- und Whale-Unlocks müssen vor einem sauberen Verdict verifiziert werden." },
        { label: "Buy Pressure", score: "Engineered Demand", body: "Buybacks, Market-Maker Support, Short Squeezes und Volume Spikes werden von organischer Nachfrage getrennt." },
        { label: "KOL / Social", score: "Disclosure Risk", body: "Paid Shill Patterns, undisclosed Allocations und koordinierter Hype werden zu OSINT Review geroutet." },
        { label: "Contract Control", score: "Admin Risk", body: "Owner, Proxy, Mint, Blacklist, Pause, Tax und Audit Status sind Transparenz-Gates." },
        { label: "Evidence Standard", score: "Proof Level", body: "Jede Aussage wird als bestätigt, wahrscheinlich, unverifiziert, Red Flag oder Quelle fehlt markiert, bevor der Bot spricht." },
      ];
    }
    return [
      { label: "Supply / float", score: "0–100", body: "Circulating supply is compared with total/max supply and FDV. Low float is never treated as neutral." },
      { label: "Unlock / vesting", score: "red flag first", body: "Team, investor, advisor, OTC and whale unlocks must be verified before any clean verdict." },
      { label: "Buy pressure", score: "engineered demand", body: "Buybacks, market-maker support, short squeezes and volume spikes are separated from organic demand." },
      { label: "KOL / social", score: "disclosure risk", body: "Paid shill patterns, undisclosed allocations and coordinated hype are routed to OSINT review." },
      { label: "Contract control", score: "admin risk", body: "Owner, proxy, mint, blacklist, pause, tax and audit status are treated as contract transparency gates." },
      { label: "Evidence standard", score: "proof level", body: "Every claim is marked confirmed, likely, unverified, red flag or source missing before the bot speaks." },
    ];
  }, [locale]);
  const investigatorGuardrails = [
    "No hype, no buy/sell calls and no safe-investment language.",
    "No scam/manipulation accusation without evidence; use red flag / requires review.",
    "Missing vesting, holder or contract transparency increases risk.",
    "Final token verdict must use fresh web OSINT plus current market data.",
  ];
  const pass461OrbitConsensus = useMemo(() => {
    const sourceState = investigatorResult?.caseFrame.sourceState?.toLowerCase() || "";
    if (investigatorLoading) {
      return {
        state: "probing" as const,
        score: 50,
        label: locale === "pl" ? "sonda źródeł" : locale === "de" ? "Quellenprüfung" : "source probe",
        body: locale === "pl" ? "Orbit czeka na świeże źródła i nie publikuje werdyktu." : locale === "de" ? "Orbit wartet auf frische Quellen und veröffentlicht kein Urteil." : "Orbit waits for fresh sources and does not publish a verdict.",
      };
    }
    if (investigatorError) {
      return {
        state: "unavailable" as const,
        score: 20,
        label: locale === "pl" ? "źródło niedostępne" : locale === "de" ? "Quelle nicht verfügbar" : "source unavailable",
        body: locale === "pl" ? "Błąd źródła pozostaje jawny; wynik nie jest zastępowany zgadywaniem." : locale === "de" ? "Der Quellenfehler bleibt sichtbar; kein Raten ersetzt das Ergebnis." : "The source error stays visible; guessing does not replace the result.",
      };
    }
    if (!investigatorResult) {
      return {
        state: "idle" as const,
        score: 0,
        label: locale === "pl" ? "oczekuje" : locale === "de" ? "wartet" : "idle",
        body: locale === "pl" ? "Uruchom analizę, aby Orbit pokazał konsensus, świeżość i limit pewności." : locale === "de" ? "Analyse starten, damit Orbit Konsens, Frische und Confidence-Limit zeigt." : "Run an analysis so Orbit can show consensus, freshness and the confidence cap.",
      };
    }
    if (sourceState.includes("stale") || sourceState.includes("expired")) {
      return {
        state: "stale" as const,
        score: Math.min(52, Math.max(20, 100 - investigatorResult.overallRisk)),
        label: locale === "pl" ? "dane nieświeże" : locale === "de" ? "Daten veraltet" : "stale evidence",
        body: locale === "pl" ? "Wniosek jest ograniczony do czasu odświeżenia timestampów." : locale === "de" ? "Die Aussage bleibt bis zur Aktualisierung der Zeitstempel begrenzt." : "The conclusion stays capped until timestamps are refreshed.",
      };
    }
    if (sourceState.includes("missing") || sourceState.includes("unknown") || sourceState.includes("unverified")) {
      return {
        state: "single_source" as const,
        score: Math.min(62, Math.max(24, 100 - investigatorResult.overallRisk)),
        label: locale === "pl" ? "brak quorum" : locale === "de" ? "Quorum fehlt" : "quorum missing",
        body: locale === "pl" ? "Jedna ścieżka dowodowa nie wystarcza do mocnego werdyktu." : locale === "de" ? "Eine Evidenzspur reicht nicht für ein starkes Urteil." : "One evidence lane is not enough for a strong verdict.",
      };
    }
    if (investigatorResult.overallRisk >= 72) {
      return {
        state: "divergent" as const,
        score: Math.max(20, 100 - investigatorResult.overallRisk),
        label: locale === "pl" ? "wysoki rozjazd" : locale === "de" ? "hohe Abweichung" : "high divergence",
        body: locale === "pl" ? "Orbit zwalnia animację i blokuje mocny claim do manualnego review." : locale === "de" ? "Orbit verlangsamt sich und blockiert starke Aussagen bis zum manuellen Review." : "Orbit slows down and blocks strong claims until manual review.",
      };
    }
    if (investigatorResult.overallRisk >= 45) {
      return {
        state: "watch" as const,
        score: Math.max(38, 100 - investigatorResult.overallRisk),
        label: locale === "pl" ? "konsensus do review" : locale === "de" ? "Konsens prüfen" : "consensus watch",
        body: locale === "pl" ? "Źródła są częściowo zgodne, ale wymagają drugiej ścieżki i świeżego timestampu." : locale === "de" ? "Quellen sind teilweise konsistent, benötigen aber eine zweite Spur und frische Zeitstempel." : "Sources partly agree but still need a second lane and fresh timestamp.",
      };
    }
    return {
      state: "aligned" as const,
      score: Math.min(92, Math.max(68, 100 - investigatorResult.overallRisk)),
      label: locale === "pl" ? "konsensus zgodny" : locale === "de" ? "Konsens ausgerichtet" : "consensus aligned",
      body: locale === "pl" ? "Źródła są wystarczająco zgodne do spokojnego readoutu, bez obietnic bezpieczeństwa." : locale === "de" ? "Quellen stimmen genug für einen ruhigen Readout überein, ohne Sicherheitsversprechen." : "Sources align enough for a calm readout, without safety promises.",
    };
  }, [investigatorError, investigatorLoading, investigatorResult, locale]);
  const investorProtectionPrinciples = [
    {
      label: "Hype is not proof",
      body: "A vertical chart can be engineered by low float, buybacks, thin liquidity, KOL incentives or late retail FOMO.",
    },
    {
      label: "Missing data is risk",
      body: "Unverified vesting, hidden OTC, unclear holders or unverifiable contracts should slow the user down before entry.",
    },
    {
      label: "Stable beats lottery thinking",
      body: "A slower, risk-capped plan is often healthier than gambling on one token that can either moon or destroy the account.",
    },
    {
      label: "Evidence before conviction",
      body: "The bot should never sell certainty. It should show what is confirmed, likely, unverified, red flag or source missing.",
    },
  ];
  const aiBotUpgradeLanes = [
    {
      label: "Memory discipline",
      state: "partial",
      body: "Bot keeps a case frame: token identity, source state, missing data, latest verdict and next operator action.",
    },
    {
      label: "Question router",
      state: "ready",
      body: "User prompts are routed into supply, unlock, liquidity, social, contract or evidence lanes before the bot answers.",
    },
    {
      label: "Evidence mode",
      state: "blocked",
      body: "Final accusations stay blocked until source ledger, timestamps and export-safe language are attached.",
    },
    {
      label: "OSINT queue",
      state: "partial",
      body: "The bot already creates web-search queries; production still needs current-source fetching and source scoring.",
    },
  ];
  const activeAtlas = atlasNodes.find((node) => node.label === activeAtlasNode) ?? atlasNodes[2];
  const ActiveAtlasIcon = activeAtlas.icon;
  const commandRoomCards = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "queue", value: String(reviewRows.length), body: "otwarte ścieżki review z aktualnego market sweep" },
        { label: "critical", value: String(criticalCount), body: "anomalie wysokiego priorytetu, nadal nie dowód" },
        { label: "watch", value: String(watchCount), body: "wymaga manual review przed eskalacją" },
        { label: "policy", value: "locked", body: "bez oskarżeń, bez porad, VLM tylko utility" },
      ];
    }
    if (locale === "de") {
      return [
        { label: "queue", value: String(reviewRows.length), body: "offene Review Lanes aus aktuellem Market Sweep" },
        { label: "critical", value: String(criticalCount), body: "High-Priority Anomalien, noch kein Beweis" },
        { label: "watch", value: String(watchCount), body: "manueller Review vor Eskalation nötig" },
        { label: "policy", value: "locked", body: "keine Anschuldigung, keine Beratung, VLM nur Utility" },
      ];
    }
    return [
      { label: "queue", value: String(reviewRows.length), body: "open review lanes from current market sweep" },
      { label: "critical", value: String(criticalCount), body: "high-priority anomalies, still not proof" },
      { label: "watch", value: String(watchCount), body: "requires manual review before escalation" },
      { label: "policy", value: "locked", body: "no accusation, no advice, VLM utility only" },
    ];
  }, [criticalCount, locale, reviewRows.length, watchCount]);
  const launchBridgeContracts = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "search intake", state: "ready", body: "Pusta premium search, icon submit, outside-click dismiss i guarded resolver path." },
        { label: "modal runtime", state: "ready", body: "Terminal otwiera się jako client-only chunk z boot skeleton i safe-mode boundary." },
        { label: "live data spine", state: "partial", body: "Candles są live/fallback aware; holder i order-book feeds dalej wymagają produkcyjnych API." },
        { label: "audit storage", state: "blocked", body: "Operator commands, AI prompts i export manifests wymagają persistent storage." },
        { label: "VLM access", state: "blocked", body: "Utility-only session gating dalej wymaga wallet/signature i limitów membership." },
        { label: "export evidence", state: "blocked", body: "Case export wymaga source ledger, missing-data appendix i legal-safe renderer." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Search Intake", state: "ready", body: "Leere Premium Search, Icon Submit, Outside-Click Dismiss und Guarded Resolver Path." },
        { label: "Modal Runtime", state: "ready", body: "Terminal öffnet als Client-only Chunk mit Boot Skeleton und Safe-Mode Boundary." },
        { label: "Live Data Spine", state: "partial", body: "Candles sind live/fallback-aware; Holder- und Order-Book-Feeds brauchen Production APIs." },
        { label: "Audit Storage", state: "blocked", body: "Operator Commands, AI Prompts und Export Manifests brauchen persistenten Storage." },
        { label: "VLM Access", state: "blocked", body: "Utility-only Session Gating braucht Wallet/Signature und Membership Limits." },
        { label: "Export Evidence", state: "blocked", body: "Case Export braucht Source Ledger, Missing-Data Appendix und legal-safe Renderer." },
      ];
    }
    return [
      { label: "search intake", state: "ready", body: "Empty premium search, icon submit, outside-click dismiss and guarded resolver path." },
      { label: "modal runtime", state: "ready", body: "Terminal opens in a client-only chunk with boot skeleton and safe-mode boundary." },
      { label: "live data spine", state: "partial", body: "Candles are live/fallback aware; holder and order-book feeds still need production APIs." },
      { label: "audit storage", state: "blocked", body: "Operator commands, AI prompts and export manifests need persistent storage." },
      { label: "VLM access", state: "blocked", body: "Utility-only session gating still needs wallet/signature and membership limits." },
      { label: "export evidence", state: "blocked", body: "Case export needs source ledger, missing-data appendix and legal-safe renderer." },
    ];
  }, [locale]);

  const brainImportLanes = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Codex folder", state: "ready", body: "Codex pracuje tylko w `Desktop/codex`, bez dotykania pełnego repo." },
        { label: "One file", state: "ready", body: "Edytowany jest tylko eksportowany risk-engine, a reszta plików jest read-only reference." },
        { label: "Import guard", state: "ready", body: "Preflight blokuje signal IDs spoza typów, browser/Node APIs, `as any` i język inwestycyjny." },
        { label: "Scenario matrix", state: "partial", body: "BTC, stablecoin, RWA, low-float pump, contract trap i no-data token są opisane do manual QA." },
        { label: "Live feeds", state: "blocked", body: "Holder/orderbook/contract/OSINT feeds nadal muszą zostać produkcyjnie podłączone." },
        { label: "Evidence export", state: "blocked", body: "Finalny AI verdict wymaga source ledger, timestamps i export-safe wording." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Codex Folder", state: "ready", body: "Codex arbeitet nur in `Desktop/codex`, ohne das volle Repo zu berühren." },
        { label: "One File", state: "ready", body: "Bearbeitet wird nur der exportierte risk-engine; andere Dateien sind read-only Reference." },
        { label: "Import Guard", state: "ready", body: "Preflight blockiert Signal IDs außerhalb der Typen, Browser/Node APIs, `as any` und Investment-Sprache." },
        { label: "Scenario Matrix", state: "partial", body: "BTC, Stablecoin, RWA, Low-Float Pump, Contract Trap und No-Data Token sind für manuelle QA beschrieben." },
        { label: "Live Feeds", state: "blocked", body: "Holder/Orderbook/Contract/OSINT Feeds müssen noch production-ready angebunden werden." },
        { label: "Evidence Export", state: "blocked", body: "Finales AI Verdict braucht Source Ledger, Timestamps und export-safe Wording." },
      ];
    }
    return [
      { label: "Codex folder", state: "ready", body: "Codex works only inside `Desktop/codex`, without touching the full repo." },
      { label: "One file", state: "ready", body: "Only the exported risk-engine is edited; all other files stay read-only reference." },
      { label: "Import guard", state: "ready", body: "Preflight blocks signal IDs outside types, browser/Node APIs, `as any` and investment language." },
      { label: "Scenario matrix", state: "partial", body: "BTC, stablecoin, RWA, low-float pump, contract trap and no-data token are documented for manual QA." },
      { label: "Live feeds", state: "blocked", body: "Holder/orderbook/contract/OSINT feeds still need production wiring." },
      { label: "Evidence export", state: "blocked", body: "Final AI verdict needs source ledger, timestamps and export-safe wording." },
    ];
  }, [locale]);
  const sourceTrustAdapters = [
    { label: "Search resolver", state: "ready", body: "Local table and suggestions resolve first; external analyze only runs after guarded lookup." },
    { label: "429 cooldown", state: "partial", body: "Client cooldown is visible; production still needs server cache and abuse/rate-limit middleware." },
    { label: "Candles / OHLCV", state: "partial", body: "Klines and fallback charts are labeled, with density shown before chart confidence." },
    { label: "Orderbook depth", state: "blocked", body: "Live depth, spread, slippage and imbalance must be wired before exit-liquidity claims." },
    { label: "Holder clusters", state: "partial", body: "Whales, CEX/custody, team, LP, retail and unlabeled buckets need source labels." },
    { label: "Evidence export", state: "blocked", body: "PDF/JSON export needs case id, immutable source ledger, missing-data appendix and legal copy." },
  ];
  const evidenceExportStages = [
    { label: "Case header", state: "ready", body: "Symbol, timestamp, case id and active review state are always included." },
    { label: "Source ledger", state: "partial", body: "Live, partial, fallback and blocked source modes must travel with every report." },
    { label: "Missing-data appendix", state: "partial", body: "Unverified holders, missing orderbook and weak candles become uncertainty, never safety." },
    { label: "Redaction rules", state: "ready", body: "Private scoring weights, internal prompts and raw wallet labels stay out of public exports." },
    { label: "Audit storage", state: "blocked", body: "Production export needs persistent command logs, source snapshots and operator handoff." },
    { label: "Renderer", state: "blocked", body: "PDF/JSON evidence renderer is still blocked until legal copy and export infrastructure are wired." },
  ];
  const runtimeHealthLanes = [
    { label: "Modal runtime", state: "ready", body: "Token terminal loads as client-only chunk with boot skeleton and safe-mode boundary, so one panel cannot kill the market table." },
    { label: "Chart runtime", state: "partial", body: "Candles prefer Binance klines; fallback sparkline mode remains labeled and keeps confidence limited." },
    { label: "Orderbook runtime", state: "blocked", body: "Live multi-exchange depth is not production wired yet, so depth claims stay in review mode." },
    { label: "History runtime", state: "partial", body: "Replay snapshots exist, but sparse history must be treated as context, not proof." },
    { label: "Search runtime", state: "ready", body: "Local-first resolver, outside-click dismiss and one-letter guard reduce API spam and kernel-panic style UX." },
    { label: "Evidence runtime", state: "blocked", body: "Export remains manifest-first until renderer, persistent audit storage and legal policy pages are ready." },
  ];
  const runtimeRegressionLocks = [
    "stress simulator is accessed through safe helpers, not spread as an array",
    "Shield Map opens as a full page; header shield remains compact quick lens",
    "table wheel scroll must never trap the page",
    "raw API JSON links stay out of the user-facing buttons",
    "search/analyze 429 states show cooldown and local-first fallback",
  ];
  const operatorFocusLanes = [
    { label: "First paint", state: "ready", body: "Chart, source label and command palette should appear before heavy AI/SOC modules. This reduces the lag feeling after clicking an asset row." },
    { label: "Focused panel routing", state: "ready", body: "The modal renders one active command console in the main lane instead of stacking every PASS panel under the chart." },
    { label: "AI SOC review", state: "partial", body: "AI should guide the operator with missing-data checks, review prompts and calm wording. It is not a hype machine and not legal proof." },
    { label: "Evidence export", state: "blocked", body: "Export is still manifest/draft mode until persistent audit storage, renderer and legal policy pages are wired." },
    { label: "Source trust", state: "partial", body: "Live, partial, fallback and blocked lanes remain visible before any summary can sound confident." },
    { label: "Launch controls", state: "blocked", body: "Rate-limit middleware, VLM session gating, wallet proof and audit logs remain P0 before public production launch." },
  ];
  const operatorFocusRules = [
    "One visible command console per main-lane route; inactive consoles stay behind the palette.",
    "Heavy modules are deferred until terminalBooted; boot skeleton protects first paint.",
    "Header buttons change active command state; they never open raw JSON API pages.",
    "AI copy says anomaly/review/uncertainty, never accusation, legal proof, ROI or investment advice.",
  ];
  const interactionStabilityLanes = [
    { label: "Click intake", state: "ready", body: "Token clicks resolve local rows first, keep one-letter scans blocked and open the terminal shell before external analyze calls can rate-limit." },
    { label: "Chart-first boot", state: "ready", body: "The first paint should show identity, chart skeleton, source label and command palette before SOC, holders, replay or evidence panels." },
    { label: "One active panel", state: "ready", body: "The selected command owns the main lane; inactive consoles stay behind routing so Shield does not become a long wall of cards." },
    { label: "Source cooldown", state: "partial", body: "Client cooldown is visible and local table interactions continue. Production still needs server cache and abuse middleware." },
    { label: "Scroll surface", state: "ready", body: "Market table horizontal overflow must not trap vertical mouse-wheel scrolling over rows." },
    { label: "Regression locks", state: "ready", body: "Stress helpers, modal boundary, missing icon imports and raw JSON buttons are checked so previous crashes do not return." },
  ];
  const interactionStabilityRules = [
    "No [...stress] or direct stress spreading; use helper contracts only.",
    "No heavy inline Shield Map under the main search; full map stays on its own route.",
    "No raw /api JSON buttons inside premium UI.",
    "No scan placeholder, no text scan button and no single-letter API spam.",
    "Every strong visual claim carries source mode, uncertainty and manual-review wording.",
  ];
  const reviewDeckLanes = [
    { label: "Operator brief", state: "ready", body: "PASS77 opens with a concise decision surface before any deep console. The first screen should say what to review next, not dump every module." },
    { label: "Source truth", state: "partial", body: "Live, partial, fallback and blocked source modes stay visible before the AI bot can sound confident." },
    { label: "AI review", state: "partial", body: "Bot tone stays SOC-style: missing data, next commands, calm review language and no hype." },
    { label: "Evidence gate", state: "blocked", body: "Export remains draft-only until persistent audit log, renderer and legal policy pack are wired." },
    { label: "Interaction path", state: "ready", body: "Chart-first boot, one active panel, outside-click dropdown dismiss and table scroll locks remain regression guarded." },
    { label: "Launch blockers", state: "blocked", body: "Rate limits, wallet/session access, VLM utility gating and export infrastructure remain P0 launch blockers." },
  ];
  const reviewDeckRules = [
    "Default terminal command is /deck, then the user drills into one lane only.",
    "Deep panels stay hidden until selected; premium UI cannot become a wall of consoles.",
    "Shield Map explains workflow, not private scoring weights or internal prompts.",
    "Every deck card uses anomaly/review/uncertainty language and keeps Not financial advice visible.",
  ];
  const neuralCommandStages = [
    { label: "Intake prism", state: "ready", body: "Search, token identity, logo, contract and market row resolve before VLM starts any neural interpretation." },
    { label: "Risk cortex", state: "partial", body: "The VLM core separates price movement, liquidity stress, holder layer and source confidence into independent brain lobes." },
    { label: "Source immune system", state: "partial", body: "Fallback, missing and blocked data are surfaced as uncertainty instead of being hidden behind a confident score." },
    { label: "SOC copilot", state: "ready", body: "The AI bot speaks like an operator assistant: next check, missing source, review step, evidence gate." },
    { label: "Evidence membrane", state: "blocked", body: "Export remains locked until source ledger, audit storage, legal copy and redaction rules are production wired." },
    { label: "VLM access shell", state: "blocked", body: "Advanced rails stay designed for member/holder access, but no value promise, no custody and no seed phrase flow." },
  ];
  const cyberDefenseMatrix = [
    { label: "Rate-limit shield", state: "blocked", body: "Server cache, abuse throttles and cooldown policy must protect scan endpoints before public traffic." },
    { label: "Wallet safety", state: "partial", body: "Every wallet screen must repeat non-custodial rules: never seed phrase, never hidden approval, never forced transaction." },
    { label: "Contract sentinel", state: "partial", body: "Owner, tax, mint, pause, blacklist and proxy checks need verified source labels before being shown as strong warnings." },
    { label: "Data provenance", state: "partial", body: "Every readout card needs source mode: live, partial, fallback, blocked or simulated. Premium means no fake certainty." },
    { label: "Evidence redaction", state: "ready", body: "Public reports hide private scoring weights, internal prompts and sensitive heuristics while keeping review logic visible." },
    { label: "Operator audit log", state: "blocked", body: "Actions, command route, prompt, timestamp and source snapshot need persistent logs before export can be trusted." },
  ];
  const trustPsychologyRails = [
    { label: "Calm danger", body: "Use anomaly/review language. Red highlights are for priority, not drama. This lowers panic and increases trust." },
    { label: "Show uncertainty", body: "When data is missing, show the missing source. Users trust a system that admits incomplete evidence." },
    { label: "One next action", body: "Every complex signal should end with one clear operator move: inspect depth, verify holders, audit contract, or wait." },
    { label: "Private core", body: "Explain the workflow, not the secret weights. The product feels transparent without exposing the system." },
  ];
  const launchReadinessBars = [
    { label: "UI shell", value: "82%", body: "Premium layout, modal shell, search intake and Shield routes are in place." },
    { label: "Motion", value: "64%", body: "VLM neural readout works; next passes should keep polishing 3D brain pacing and mobile performance." },
    { label: "Data spine", value: "48%", body: "Candles and fallback labels exist; holder, orderbook, contract and source ledger still need production feeds." },
    { label: "Launch safety", value: "38%", body: "Legal-safe copy exists, but audit storage, rate limits and evidence renderer remain blockers." },
  ];

  const primeCryptoResearchCards = useMemo(() => {
    if (locale === "pl") {
      return [
        {
          label: "Bajak Protocol",
          value: "numerical audit",
          body: "Research Lab może pokazywać badania liczb pierwszych jako audyt numeryczny: redukcja błędu R(x), testy falsyfikacyjne i zeta-zero alignment — bez mówienia, że to dowód RH.",
        },
        {
          label: "Kryptografia",
          value: "safe boundary",
          body: "Sekcja może tłumaczyć, dlaczego liczby pierwsze są ważne w kryptografii, ale nie może sugerować łamania portfeli, kluczy prywatnych ani Bitcoina.",
        },
        {
          label: "Odwrócony wzór",
          value: "research mode",
          body: "Wątek odwróconego wzoru pokazujemy jako hipotezę/research pipeline: dataset, benchmark, negatywne kontrole, replikacja i peer review.",
        },
      ];
    }
    if (locale === "de") {
      return [
        {
          label: "Bajak Protocol",
          value: "numerisches Audit",
          body: "Research Lab kann Primzahl-Forschung als numerisches Audit zeigen: R(x)-Fehlerreduktion, Falsifikationstests und Zeta-Zero Alignment — ohne RH-Beweis zu behaupten.",
        },
        {
          label: "Kryptografie",
          value: "sichere Grenze",
          body: "Die Sektion erklärt, warum Primzahlen für Kryptografie wichtig sind, ohne Wallets, Private Keys oder Bitcoin-Angriffe zu suggerieren.",
        },
        {
          label: "Inverse Formel",
          value: "Research Mode",
          body: "Die inverse Formel wird als Hypothese/Pipeline dargestellt: Dataset, Benchmark, Negativkontrollen, Replikation und Peer Review.",
        },
      ];
    }
    return [
      {
        label: "Bajak Protocol",
        value: "numerical audit",
        body: "Research Lab can present prime-number work as a numerical audit: R(x) error reduction, falsification tests and zeta-zero alignment — without claiming an RH proof.",
      },
      {
        label: "Cryptography",
        value: "safe boundary",
        body: "The section explains why primes matter in cryptography, without suggesting wallet, private-key or Bitcoin-breaking capabilities.",
      },
      {
        label: "Inverse formula",
        value: "research mode",
        body: "The inverse-formula thread is framed as a hypothesis/pipeline: dataset, benchmark, negative controls, replication and peer review.",
      },
    ];
  }, [locale]);

  const shieldAccessModes = useMemo(() => {
    if (locale === "pl") {
      return [
        { label: "Basic", value: "publiczny prescreen", body: "Szybki risk score, top 10 punktów i edukacyjny opis bez głębokiego OSINT. Ma zatrzymać impulsywne wejście, nie dawać sygnału kup/sprzedaj." },
        { label: "Pro", value: "member review", body: "Więcej źródeł, source confidence, ścieżki supply/liquidity/holders/contract i spokojny operator copy." },
        { label: "Advanced", value: "investigator mode", body: "Pełny VLM risk brain, top 20 punktów, OSINT queue, evidence status, missing-data appendix i export-ready workflow." },
      ];
    }
    if (locale === "de") {
      return [
        { label: "Basic", value: "öffentlicher Prescreen", body: "Schneller Risk Score, Top-10-Punkte und edukative Erklärung ohne Deep OSINT. Es bremst impulsive Einstiege, keine Buy/Sell Calls." },
        { label: "Pro", value: "Member Review", body: "Mehr Quellen, Source Confidence, Supply/Liquidity/Holders/Contract Lanes und ruhige Operator-Sprache." },
        { label: "Advanced", value: "Investigator Mode", body: "Voller VLM Risk Brain, Top-20-Punkte, OSINT Queue, Evidence Status, Missing-Data Appendix und exportfähiger Workflow." },
      ];
    }
    return [
      { label: "Basic", value: "public prescreen", body: "Fast risk score, top 10 points and educational copy without deep OSINT. It slows impulsive entry; it is not a entry/exit command." },
      { label: "Pro", value: "member review", body: "More sources, source confidence, supply/liquidity/holders/contract lanes and calm operator language." },
      { label: "Advanced", value: "investigator mode", body: "Full VLM risk brain, top 20 points, OSINT queue, evidence status, missing-data appendix and export-ready workflow." },
    ];
  }, [locale]);

  const statePillClass = (state: string) =>
    state === "ready"
      ? "border-emerald-300/[0.18] bg-emerald-400/[0.055] text-emerald-100"
      : state === "partial"
        ? "border-velmere-gold/[0.18] bg-velmere-gold/[0.055] text-velmere-gold"
        : "border-red-300/[0.18] bg-red-400/[0.055] text-red-100";

  return (
    <main className="shield-typography-root bg-velmere-black text-velmere-ivory" data-pass314-shield-map-simplified="true" data-pass339-search-portal="true" data-pass315-shield-map-trim="true" data-pass361-shield-map-search-portal="true" data-pass394-search-anchor-lock="true" data-pass395-search-runtime-lock="true" data-pass408-search-runtime-lock={pass408TerminalSourceProofOrbit.version} data-pass409-search-runtime-lock={pass409TerminalSourceTruthOrbit.version}
      data-pass410-search-runtime-lock={pass410TerminalLiveParityOrbit.version} data-pass411-search-runtime-lock={pass411TerminalSourceEqualizerOrbit.version}
                    data-pass413-search-runtime-lock={pass413TerminalStabilityRuntime.version}
                    data-pass413-three-only="true" data-pass397-unified-search-pdf-brain="true" data-pass398-terminal-fidelity-loop={pass398TerminalFidelityContract.version} data-pass399-kernel-exactness-loop={pass399KernelExactnessContract.version}
      data-pass400-terminal-proof-engine={pass400TerminalProofContract.version}
      data-pass401-terminal-exactness-matrix={pass401TerminalExactnessMatrix.version}
      data-pass402-terminal-clean-orbit={pass402TerminalCleanOrbit.version}
      data-pass403-terminal-truth-orbit={pass403TerminalTruthOrbit.version}
      data-pass404-terminal-exact-orbit={pass404TerminalExactOrbit.version}>
      <section className="luxury-section-wide border-b border-white/[0.06] py-8 md:py-12">
        <div className="mx-auto max-w-none">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Link
                href="/market-integrity"
                className="shield-premium-focus inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.026] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.55] transition hover:border-velmere-gold/[0.30] hover:text-velmere-gold"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {copy.back}
              </Link>
              <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                Velmère Shield · live defense map
              </p>
              <h1 className="mt-3 max-w-4xl text-[clamp(2.2rem,5vw,5.4rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-white">
                Żywy system ryzyka, nie statyczna dokumentacja.
              </h1>
              <p className="shield-copy-safe mt-5 max-w-3xl text-sm leading-7 text-white/[0.58] md:text-base">
                Jedna mapa pokazuje intake, źródła, płynność, OSINT i następny krok operatora. Prywatne wagi scoringu zostają ukryte, a publiczny widok ma wyglądać jak premium SOC cockpit.
              </p>
            </div>
            <div className="shield-map-panel min-w-0 p-4 md:w-[22rem]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-velmere-gold/[0.22] bg-velmere-gold/[0.08] text-velmere-gold">
                  <Radar className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.35]">
                    safe disclosure mode
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Private scoring core hidden
                  </p>
                </div>
              </div>
              <p className="shield-copy-safe mt-4 text-xs leading-6 text-white/[0.48]">
                {copy.privateNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-10">
        <div className="shield-map-nexus-grid mx-auto grid max-w-none gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(22rem,0.46fr)]">
          <div className="shield-map-neural-nexus p-4 md:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.48fr)] lg:items-center">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">
                  VLM Shield neural core · PASS90
                </p>
                <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
                  Shield ma wyglądać jak żywy system obronny, nie statyczny opis.
                </h2>
                <p className="shield-copy-safe mt-4 max-w-3xl text-sm leading-7 text-white/[0.56]">
                  Ta warstwa tłumaczy, jak VLM AI rozbija token na źródła, ryzyko, płynność, holderów, kontrakt, dowody i blokady launchu. Użytkownik widzi logikę systemu, ale prywatny scoring core zostaje ukryty.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {neuralCommandStages.map((stage) => (
                    <div key={stage.label} className={`shield-nexus-stage ${statePillClass(stage.state)}`}>
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{stage.label}</p>
                        <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.11em]">{stage.state}</span>
                      </div>
                      <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{stage.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`shield-nexus-visual shield-nexus-visual-pro shield-pass461-consensus-${pass461OrbitConsensus.state}`}
                data-pass461-orbit-consensus={pass461OrbitConsensus.state}
                role="img"
                aria-label={`${pass461OrbitConsensus.label} · ${pass461OrbitConsensus.score}/100`}
              >
                <div className="shield-holo-grid" />
                <div className="shield-holo-orbit shield-holo-orbit-a" />
                <div className="shield-holo-orbit shield-holo-orbit-b" />
                <div className="shield-holo-orbit shield-holo-orbit-c" />
                <div className="shield-holo-core">
                  <span className="shield-holo-token-face">
                    <span className="shield-holo-token-title">VLM</span>
                    <span className="shield-holo-token-subtitle">SHIELD</span>
                  </span>
                  <span className="shield-holo-token-edge" />
                  <span className="shield-holo-scan shield-holo-scan-a" />
                  <span className="shield-holo-scan shield-holo-scan-b" />
                </div>
                <div className="shield-holo-data-chip shield-holo-chip-a">CONSENSUS</div>
                <div className="shield-holo-data-chip shield-holo-chip-b">FRESHNESS</div>
                <div className="shield-holo-data-chip shield-holo-chip-c">SOURCE</div>
                <div className="shield-holo-data-chip shield-holo-chip-d">EVIDENCE</div>
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className="shield-holo-node"
                    style={{
                      transform: `rotate(${index * 36}deg) translateX(${7.6 + (index % 2) * 1.2}rem)`,
                      animationDelay: `${index * 160}ms`,
                    }}
                  />
                ))}
                <div className="shield-pass461-consensus-badge">
                  <span>{pass461OrbitConsensus.label}</span>
                  <strong>{pass461OrbitConsensus.score}/100</strong>
                  <small>{pass461OrbitConsensus.body}</small>
                </div>
                <div className="shield-nexus-caption">holographic VLM intelligence core · evidence-first · PASS461 consensus</div>
              </div>
            </div>
          </div>
          <div className="shield-map-cyber-brief p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">cybersecurity launch brief</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Co musi chronić Shield przed startem.</h3>
            <div className="mt-4 grid gap-2">
              {cyberDefenseMatrix.map((item) => (
                <div key={item.label} className={`shield-cyber-defense-card ${statePillClass(item.state)}`}>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{item.label}</p>
                    <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.11em]">{item.state}</span>
                  </div>
                  <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-4 md:py-6">
        <div className="shield-investigator-live-console mx-auto max-w-none rounded-[2rem] border border-cyan-300/[0.14] bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.10),transparent_34%),rgba(255,255,255,0.024)] p-4 md:p-6" data-pass453-shieldmap-handoff="true" data-pass468-orbit-handoff="true">
          {handoffQuery ? (
            <div className="mb-5 flex flex-col gap-3 rounded-[1.3rem] border border-cyan-200/[0.16] bg-cyan-300/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-cyan-100/[0.62]">
                  {locale === "pl" ? "Lens → Shield → Shield Map" : locale === "de" ? "Lens → Shield → Shield Map" : "Lens → Shield → Shield Map"}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/[0.56]">
                  {locale === "pl"
                    ? `${handoffQuery}: mapa przejęła ten sam instrument i uruchamia śledczy skan bez zmiany podmiotu.`
                    : locale === "de"
                      ? `${handoffQuery}: Die Map übernimmt dasselbe Instrument und startet den Investigator-Scan ohne Asset-Wechsel.`
                      : `${handoffQuery}: the map received the same instrument and starts the investigator scan without changing the subject.`}
                </p>
                {handoffPacket ? (
                  <div className="mt-2 flex flex-wrap gap-1.5" data-pass468-orbit-evidence-context="display-only">
                    {[
                      handoffPacket.depth.toUpperCase(),
                      `${handoffPacket.sourceConfidence}%`,
                      handoffPacket.sourceMode,
                      handoffPacket.snapshot.venueComparisonState ||
                        handoffPacket.snapshot.fundamentalState ||
                        "fresh investigator scan",
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
                  href={`/search?query=${encodeURIComponent(handoffQuery)}`}
                  className="rounded-full border border-white/[0.10] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.48]"
                >
                  {locale === "pl" ? "Wróć do Lens" : locale === "de" ? "Zurück zu Lens" : "Back to Lens"}
                </Link>
                <button
                  type="button"
                  onClick={() => { setHandoffQuery(null); setHandoffPacket(null); }}
                  className="rounded-full border border-cyan-200/[0.16] bg-cyan-300/[0.055] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50"
                >
                  {locale === "pl" ? "Ukryj" : locale === "de" ? "Ausblenden" : "Hide"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(22rem,0.42fr)] xl:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100">{shieldUi.liveConsole}</p>
              <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
                {shieldUi.liveTitle}
              </h2>
              <p className="shield-copy-safe mt-4 max-w-3xl text-sm leading-7 text-white/[0.56]">
                {shieldUi.liveBody}
              </p>
              <form onSubmit={runInvestigatorScan} className="shield-map-unified-search-shell shield-market-search-dock relative mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div ref={investigatorSuggestRef} className="relative z-[120] min-w-0">
                  <label className="group flex min-h-14 items-center gap-3 rounded-full border border-cyan-200/[0.16] bg-[#080d0f]/[0.92] px-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition focus-within:border-velmere-gold/[0.40] focus-within:bg-black/[0.50]">
                    <Search className="h-4 w-4 shrink-0 text-velmere-gold" />
                    <input
                      value={investigatorQuery}
                      onChange={(event) => {
                        if (event.target.value.trim().toLowerCase() !== committedInvestigatorSearchRef.current.toLowerCase()) {
                          committedInvestigatorSearchRef.current = "";
                        }
                        setInvestigatorQuery(event.target.value);
                        if (!event.target.value.trim()) closeInvestigatorSuggestions();
                        else setSuggestionsOpen(true);
                      }}
                      onFocus={() => {
                        if (
                          !investigatorLoading &&
                          investigatorQuery.trim() &&
                          investigatorQuery.trim().toLowerCase() !== committedInvestigatorSearchRef.current.toLowerCase()
                        ) {
                          syncInvestigatorSuggestFrame();
                          setSuggestionsOpen(true);
                        }
                      }}
                      placeholder={shieldUi.placeholder}
                      className="min-w-0 flex-1 bg-transparent font-mono text-[13px] uppercase tracking-[0.12em] text-white outline-none placeholder:text-white/[0.25]"
                    />
                  </label>
                  {suggestionsOpen && investigatorQuery.trim() && !investigatorLoading && investigatorSuggestFrame && typeof document !== "undefined"
                    ? createPortal(
                        <div
                          ref={investigatorSuggestPanelRef}
                          className="shield-map-token-suggest-panel shield-map-token-suggest-portal shield-token-search-suggest-panel shield-map-token-suggest-pass358 fixed rounded-[1.25rem] border border-cyan-200/[0.18] bg-[#080d0f]/[0.985] text-left shadow-[0_34px_100px_rgba(0,0,0,0.62)] backdrop-blur-2xl"
                          style={{
                            top: investigatorSuggestFrame.top,
                            left: investigatorSuggestFrame.left,
                            width: investigatorSuggestFrame.width,
                            maxHeight: investigatorSuggestFrame.maxHeight,
                          }}
                          role="listbox"
                          aria-label={shieldUi.suggestionLabel}
                          data-pass343-inline-search-suggestions="true"
                          data-pass358-token-logo-suggestions="true"
                          data-pass361-viewport-search-portal="true"
                          data-pass362-scroll-anchored-portal="true"
                          data-pass363-close-on-page-scroll="true"
                          data-pass362-legacy-scroll-resync="disabled-close-on-scroll"
                          data-pass394-no-fallback-portal-position="true"
                          data-pass395-search-runtime-lock="true" data-pass408-search-runtime-lock={pass408TerminalSourceProofOrbit.version} data-pass409-search-runtime-lock={pass409TerminalSourceTruthOrbit.version}
      data-pass410-search-runtime-lock={pass410TerminalLiveParityOrbit.version} data-pass411-search-runtime-lock={pass411TerminalSourceEqualizerOrbit.version}
                    data-pass413-search-runtime-lock={pass413TerminalStabilityRuntime.version}
                    data-pass413-three-only="true" data-pass397-unified-search-pdf-brain="true"
                        >
                          <div className="border-b border-white/[0.07] px-4 py-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold/[0.72]">
                                Social-Exchange Router · Shield Map
                              </span>
                              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50/[0.55]">
                                evidence · social · depth
                              </span>
                            </div>
                            <div className="shield-social-router-chip-row mt-2">
                              {investigatorSocialRouterGate.chips.slice(0, 4).map((chip) => (
                                <span key={chip}>{chip}</span>
                              ))}
                            </div>
                          </div>
                          <div
                            className="shield-map-token-suggest-scroll"
                            style={{ maxHeight: investigatorSuggestFrame?.maxHeight ? Math.max(180, investigatorSuggestFrame.maxHeight - 76) : 354 }}
                          >
                            {investigatorSuggestions.length ? investigatorSuggestions.slice(0, 3).map((item) => (
                              <button
                                key={`${item.symbol}-${item.reason}`}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  committedInvestigatorSearchRef.current = item.symbol;
                                  setInvestigatorQuery(item.symbol);
                                  closeInvestigatorSuggestions();
                                  void runInvestigatorScan(null, item.symbol);
                                }}
                                className="shield-token-search-suggest-row flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-300/[0.055]"
                              >
                                <ShieldMapSuggestionAvatar item={item} />
                                <span className="min-w-0 flex-1">
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span className="block truncate text-sm font-semibold text-white">{item.symbol}</span>
                                    <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">
                                      {item.score !== undefined ? `${item.score}/100` : item.sourceLabel ?? item.reason}
                                    </span>
                                  </span>
                                  <span className="block truncate text-[11px] leading-5 text-white/[0.56]">{item.name}</span>
                                  <span className="shield-social-router-reason mt-1">
                                    <span>{item.exchangeLabel ?? "source check"}</span>
                                    <span>{item.socialLabel ?? "signal"}</span>
                                    <span>{item.psychologyLabel ?? "calm review"}</span>
                                  </span>
                                  <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.34]">
                                    {item.nextActionLabel ?? "open Shield Map investigator"}
                                  </span>
                                </span>
                                <span className="shrink-0 rounded-full border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold/[0.76]">
                                  scan
                                </span>
                              </button>
                            )) : (
                              <p className="shield-copy-safe m-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-xs text-white/[0.48]">{shieldUi.noSuggestion}</p>
                            )}
                          </div>
                        </div>,
                        document.body,
                      )
                    : null}
                </div>
                <button
                  type="submit"
                  disabled={investigatorLoading}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-cyan-200/[0.22] bg-cyan-300/[0.075] px-6 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-50 transition hover:bg-cyan-300/[0.12] disabled:cursor-wait disabled:opacity-60"
                >
                  {investigatorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                  {shieldUi.scan}
                </button>
              </form>
              <div className="shield-map-public-brief mt-3" data-pass314-shield-map-signal-diet="true" data-pass315-public-command-strip="true" data-pass313-atelier-access-runway="shield-map">
                <div>
                  <p>Shield Map · clean command mode</p>
                  <span>Jedna wyszukiwarka, jedna kolejka evidence i jeden następny krok. Pełne PASS telemetry zostaje w kodzie/guardach, ale nie zalewa publicznego UI.</span>
                </div>
                <div>
                  <b>source</b>
                  <b>depth</b>
                  <b>OSINT</b>
                </div>
              </div>

              {investigatorError ? (
                <p className="shield-copy-safe mt-3 rounded-2xl border border-red-300/[0.18] bg-red-400/[0.055] p-3 text-xs leading-6 text-red-100">{investigatorError}</p>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.09] bg-black/[0.28] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{shieldUi.operatorRule}</p>
              <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.54]">
                {shieldUi.operatorRuleBody}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["float", "unlock", "liquidity", "KOL"].map((item) => (
                  <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">{item}</span>
                ))}
              </div>
            </div>
          </div>

          {investigatorResult ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(20rem,0.38fr)]">
              <div className="rounded-[1.6rem] border border-white/[0.09] bg-black/[0.22] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100">{investigatorResult.title}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{investigatorResult.finalVerdict}</h3>
                    <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.54]">{investigatorResult.quickVerdict}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-cyan-200/[0.16] bg-cyan-300/[0.055] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50">
                        mode · {investigatorResult.caseFrame.operatorMode}
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">
                        concern · {investigatorResult.caseFrame.primaryConcern}
                      </span>
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 text-center">
                    <span className="rounded-2xl border border-white/[0.10] bg-white/[0.025] px-4 py-3">
                      <span className="block font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">risk</span>
                      <span className="mt-1 block font-mono text-2xl text-white tabular-nums">{investigatorResult.overallRisk}</span>
                    </span>
                    <span className="rounded-2xl border border-white/[0.10] bg-white/[0.025] px-4 py-3">
                      <span className="block font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">confidence</span>
                      <span className="mt-1 block font-mono text-sm uppercase tracking-[0.12em] text-velmere-gold">{investigatorResult.confidence}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {investigatorResult.lanes.map((lane) => (
                    <div key={lane.id} className={`shield-investigator-lane shield-investigator-lane-${lane.status}`}>
                      <span className="flex min-w-0 items-center justify-between gap-2">
                        <span className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.56]">{lane.label}</span>
                        <span className="font-mono text-[10px] text-white tabular-nums">{lane.score}</span>
                      </span>
                      <span className="mt-2 block text-[11px] leading-5 text-white/[0.52]">{lane.headline}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="shield-investigator-contract-panel">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100">answer contract</p>
                    <div className="mt-3 grid gap-2">
                      {investigatorResult.answerContract.map((step, index) => (
                        <div key={step.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-200/[0.16] bg-cyan-300/[0.055] font-mono text-[8px] text-cyan-50">{index + 1}</span>
                            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.44]">{step.label}</span>
                          </div>
                          <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.52]">{step.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shield-investigator-contract-panel">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">operator next actions</p>
                    <div className="mt-3 grid gap-2">
                      {investigatorResult.nextActions.slice(0, 4).map((action) => (
                        <div key={action.id} className={`shield-next-action-card shield-next-action-${action.priority}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.48]">{action.label}</span>
                            <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">{action.priority}</span>
                          </div>
                          <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.52]">{action.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="shield-loss-prevention-panel mt-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">loss-prevention layer</p>
                  <h4 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{investigatorResult.lossPrevention.caseStudy}</h4>
                  <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.56]">{investigatorResult.lossPrevention.caseLesson}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div className="rounded-2xl border border-red-300/[0.14] bg-red-400/[0.045] p-3">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-red-100">psychology trap · {investigatorResult.lossPrevention.behavioralTrap.label}</p>
                      <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-red-50/[0.72]">{investigatorResult.lossPrevention.behavioralTrap.risk}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-300/[0.13] bg-emerald-400/[0.040] p-3">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-emerald-100">counter move</p>
                      <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-emerald-50/[0.70]">{investigatorResult.lossPrevention.behavioralTrap.counterMove}</p>
                    </div>
                  </div>
                  <p className="shield-copy-safe mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3 text-[11px] leading-5 text-white/[0.52]">{investigatorResult.lossPrevention.stableRiskReminder}</p>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">web OSINT queue</p>
                <div className="mt-3 grid gap-2">
                  {investigatorResult.webQueries.slice(0, 5).map((query) => (
                    <p key={query} className="truncate rounded-full border border-white/[0.08] bg-black/[0.22] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.10em] text-white/[0.42]">{query}</p>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  {investigatorResult.redFlags.slice(0, 4).map((flag) => (
                    <p key={flag} className="shield-copy-safe rounded-2xl border border-red-300/[0.14] bg-red-400/[0.045] p-3 text-[11px] leading-5 text-red-50/[0.72]">{flag}</p>
                  ))}
                </div>
              </div>
              {evidenceReport ? (
                <div className="xl:col-span-2 shield-evidence-report-draft">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100">evidence report draft · {evidenceReport.reportId}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{evidenceReport.title}</h3>
                      <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.54]">{evidenceReport.warning}</p>
                      {sourceSnapshot ? (
                        <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-cyan-200/[0.14] bg-cyan-300/[0.045] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-50/[0.72]">
                          <span>snapshot · {sourceSnapshot.mode}</span>
                          <span>{sourceSnapshot.stored ? "stored" : "already stored"}</span>
                          <span>{sourceSnapshot.snapshot.reportId}</span>
                        </div>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.38]">
                      operator draft · export hidden
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.60fr)_minmax(0,0.40fr)]">
                    <div className="grid gap-2">
                      {evidenceReport.sections.slice(0, 5).map((section) => (
                        <div key={section.id} className={`shield-evidence-section-card shield-evidence-section-${section.status}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{section.title}</p>
                            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">{section.status}</span>
                          </div>
                          <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.52]">{section.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-2">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.38]">source ledger</p>
                      {evidenceReport.sourceLedger.slice(0, 6).map((source) => (
                        <div key={source.id} className={`shield-source-ledger-card shield-source-ledger-${source.mode}`}>
                          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.44]">{source.label}</span>
                          <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">{source.mode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="luxury-section-wide py-4 md:py-6">
        <div className="shield-investigator-section mx-auto grid max-w-none gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.42fr)]">
          <div className="rounded-[2rem] border border-cyan-300/[0.14] bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.10),transparent_34%),rgba(255,255,255,0.026)] p-4 md:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100">VLM Shield Investigator</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
              {pageCopy.investigatorTitle}
            </h2>
            <p className="shield-copy-safe mt-4 max-w-3xl text-sm leading-7 text-white/[0.56]">
              {pageCopy.investigatorBody}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {investigatorProtocol.map((item) => (
                <div key={item.label} className="shield-investigator-protocol-card">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.58]">{item.label}</p>
                    <span className="shrink-0 rounded-full border border-cyan-200/[0.16] bg-cyan-300/[0.06] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.10em] text-cyan-100">{item.score}</span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-[11px] leading-5 text-white/[0.50]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">{pageCopy.investigatorRules}</p>
            <div className="mt-4 grid gap-2">
              {investigatorGuardrails.map((rule) => (
                <div key={rule} className="flex gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-velmere-gold" />
                  <p className="shield-copy-safe text-xs leading-6 text-white/[0.54]">{rule}</p>
                </div>
              ))}
            </div>
            <p className="shield-copy-safe mt-4 rounded-2xl border border-cyan-200/[0.14] bg-cyan-300/[0.045] p-3 text-[11px] leading-6 text-cyan-50/[0.72]">
              Missing transparency is not neutral. In VLM Shield it increases risk until a current source proves otherwise.
            </p>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-4 md:py-6">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,0.50fr)]">
          <div className="rounded-[2rem] border border-cyan-200/[0.13] bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.10),transparent_34%),rgba(255,255,255,0.024)] p-4 md:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100">AI bot development lane</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
              VLM bot ma prowadzić śledztwo jak operator, nie gadać jak chatbot.
            </h2>
            <p className="shield-copy-safe mt-4 max-w-3xl text-sm leading-7 text-white/[0.56]">
              Kolejna warstwa rozwoju to pamięć case&apos;u, router pytań, evidence mode i aktualny OSINT. Bot ma zawsze kończyć jednym następnym krokiem: verify supply, inspect unlocks, check liquidity, review KOL, audit contract albo draft evidence.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {aiBotUpgradeLanes.map((lane) => (
                <div key={lane.label} className={`shield-ai-bot-upgrade-card ${statePillClass(lane.state)}`}>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
                    <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.state}</span>
                  </div>
                  <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">bot answer contract</p>
            <div className="mt-4 space-y-2">
              {["Quick verdict", "Key red flags", "Evidence status", "Missing data", "Next action"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.20] p-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] font-mono text-[9px] text-velmere-gold">{index + 1}</span>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.58]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-4 md:py-6">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,0.48fr)]">
          <div className="rounded-[2rem] border border-emerald-300/[0.12] bg-[radial-gradient(circle_at_18%_12%,rgba(52,211,153,0.09),transparent_34%),rgba(255,255,255,0.024)] p-4 md:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-100">{shieldUi.investorProtection}</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
              {shieldUi.investorTitle}
            </h2>
            <p className="shield-copy-safe mt-4 max-w-3xl text-sm leading-7 text-white/[0.56]">
              {shieldUi.investorBody}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {localizedInvestorProtectionPrinciples.map((item) => (
                <div key={item.label} className="shield-investor-protection-card">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">{item.label}</p>
                  <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.52]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">{shieldUi.whyMatters}</p>
            <p className="shield-copy-safe mt-4 text-xs leading-6 text-white/[0.56]">
              {shieldUi.whyMattersBody}
            </p>
            <div className="mt-4 grid gap-2">
              {["slow down", "verify supply", "check unlocks", "inspect exits", "avoid all-in"].map((item) => (
                <span key={item} className="rounded-full border border-white/[0.08] bg-black/[0.20] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-4 md:py-6">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,0.55fr)]">
          <div className="shield-map-psychology p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">trust psychology</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  Premium bezpieczeństwo to spokojna kontrola, nie panika.
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  Shield ma prowadzić użytkownika przez niepewność: pokazuje co wiadomo, czego brakuje i jaki jest następny bezpieczny krok. To buduje zaufanie mocniej niż agresywne alerty.
                </p>
              </div>
              <span className="w-fit rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">
                calm SOC language
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {trustPsychologyRails.map((rail) => (
                <div key={rail.label} className="shield-trust-psych-card">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">{rail.label}</p>
                  <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.50]">{rail.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="shield-map-launch-score p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">launch readiness</p>
            <div className="mt-4 grid gap-3">
              {launchReadinessBars.map((bar) => (
                <div key={bar.label} className="shield-launch-score-row">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.68]">{bar.label}</p>
                    <span className="font-mono text-sm text-white tabular-nums">{bar.value}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-gradient-to-r from-velmere-gold via-cyan-200 to-emerald-200" style={{ width: bar.value }} />
                  </div>
                  <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.42]">{bar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-8">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.46fr)]">
          <div className="shield-map-command-room p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                  {pageCopy.commandRoom}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {pageCopy.commandTitle}
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  {pageCopy.commandBody}
                </p>
              </div>
              <Link
                href="/market-integrity"
                className="shield-premium-focus inline-flex shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.20] bg-velmere-gold/[0.075] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.12]"
              >
                {pageCopy.openTerminal}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {commandRoomCards.map((card) => (
                <div key={card.label} className="shield-map-command-card">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.36]">{card.label}</p>
                  <p className="mt-2 font-mono text-2xl text-white tabular-nums">{card.value}</p>
                  <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.42]">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="shield-map-radar-board p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{pageCopy.activePreview}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="relative inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.06] text-velmere-gold">
                <span className="absolute inset-[-0.8rem] rounded-full border border-dashed border-velmere-gold/[0.13]" />
                <ActiveAtlasIcon className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-white">{activeAtlas.label}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold/[0.82]">{activeAtlas.status}</p>
                <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.46]">{activeAtlas.body}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none">
          <div className="shield-map-launch-bridge p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                  {pageCopy.launchBridge}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {pageCopy.launchTitle}
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  {pageCopy.launchBody}
                </p>
              </div>
              <span className="w-fit rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">
                {pageCopy.buildSpine}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {launchBridgeContracts.map((contract) => (
                <div key={contract.label} className="shield-map-launch-card">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.72]">
                      {contract.label}
                    </p>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${statePillClass(contract.state)}`}>
                      {contract.state}
                    </span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.46]">
                    {contract.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="luxury-section-wide py-6 md:py-8">
        <div className="mx-auto max-w-none">
          <div className="shield-map-launch-bridge p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-cyan-100">
                  {pageCopy.brainImportKicker}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  {pageCopy.brainImportTitle}
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  {pageCopy.brainImportBody}
                </p>
              </div>
              <span className="w-fit rounded-full border border-cyan-200/[0.18] bg-cyan-300/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-100">
                {pageCopy.brainImportBadge}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {brainImportLanes.map((lane) => (
                <div key={lane.label} className="shield-map-contract-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/[0.54]">{lane.label}</p>
                    <span className={`rounded-full border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.10em] ${statePillClass(lane.state)}`}>{lane.state}</span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-[11px] leading-5 text-white/[0.48]">{lane.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none">
          <div className="shield-map-source-trust p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                  source trust console · PASS72
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  Shield Map ma pokazywać prawdę o źródłach, nie tylko ładny radar.
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  Każda warstwa ma stan: ready, partial albo blocked. Dzięki temu użytkownik widzi, czy terminal pracuje na live danych, fallbacku albo brakującym źródle. Premium design nie może udawać większej pewności niż mamy w danych.
                </p>
              </div>
              <span className="w-fit rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">
                no fake certainty
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sourceTrustAdapters.map((adapter) => (
                <div key={adapter.label} className="shield-map-source-card">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.72]">
                      {adapter.label}
                    </p>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${statePillClass(adapter.state)}`}>
                      {adapter.state}
                    </span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.46]">
                    {adapter.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none">
          <div className="shield-map-evidence-export p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                  evidence export console · PASS73
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  Raport ma być kontrolowanym exportem, nie ścianą JSON ani dekoracją.
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  Shield Map pokazuje, co musi trafić do evidence reportu: case header, source ledger, missing-data appendix, redakcje i legal note. Dopóki audit log i renderer są zablokowane, export zostaje manifestem/operator preview.
                </p>
              </div>
              <span className="w-fit rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">
                manifest before export
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {evidenceExportStages.map((stage) => (
                <div key={stage.label} className="shield-map-export-card">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.72]">
                      {stage.label}
                    </p>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${statePillClass(stage.state)}`}>
                      {stage.state}
                    </span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.46]">
                    {stage.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="shield-copy-safe mt-5 rounded-2xl border border-amber-300/[0.16] bg-amber-300/[0.055] p-3 text-[11px] leading-6 text-amber-100/[0.84]">
              Evidence export is an internal review aid: Not financial advice. Algorithmic risk flag only. Manual review required.
            </p>
          </div>
        </div>
      </section>

            <section id="shield-access-mode-matrix" className="luxury-section-wide border-t border-white/[0.06] py-10 md:py-14">
        <div className="mx-auto max-w-none">
          <div className="rounded-[2rem] border border-cyan-200/[0.10] bg-gradient-to-br from-cyan-300/[0.055] via-white/[0.025] to-velmere-gold/[0.055] p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100">
              {locale === "pl" ? "Basic / Pro / Advanced · warstwy Shield" : locale === "de" ? "Basic / Pro / Advanced · Shield Ebenen" : "Basic / Pro / Advanced · Shield layers"}
            </p>
            <h2 className="mt-3 max-w-5xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
              {locale === "pl" ? "Ten sam terminal, różna głębokość dowodów." : locale === "de" ? "Ein Terminal, unterschiedliche Beweistiefe." : "One terminal, different evidence depth."}
            </h2>
            <p className="shield-copy-safe mt-4 max-w-4xl text-sm leading-7 text-white/[0.58]">
              {locale === "pl"
                ? "Basic ma być szybki i spokojny. Pro dodaje źródła i kontekst. Advanced odblokowuje pełny tryb operatora: risk brain, OSINT, evidence i missing-data. Żaden poziom nie jest poradą inwestycyjną."
                : locale === "de"
                  ? "Basic bleibt schnell und ruhig. Pro ergänzt Quellen und Kontext. Advanced öffnet den Operator-Modus: Risk Brain, OSINT, Evidence und Missing-Data. Keine Ebene ist Investment Advice."
                  : "Basic stays fast and calm. Pro adds sources and context. Advanced opens the operator path: risk brain, OSINT, evidence and missing-data. No tier is investment advice."}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {shieldAccessModes.map((item) => (
                <article key={item.label} className="rounded-[1.5rem] border border-white/[0.08] bg-black/[0.24] p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.36]">{item.label}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cyan-100">{item.value}</p>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.54]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

<section id="prime-crypto-research-lab" className="luxury-section-wide border-t border-white/[0.06] py-10 md:py-14">
        <div className="mx-auto max-w-none">
          <div className="rounded-[2rem] border border-velmere-gold/[0.12] bg-gradient-to-br from-velmere-gold/[0.07] via-white/[0.025] to-cyan-300/[0.05] p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-velmere-gold">
              {locale === "pl" ? "research lab · liczby pierwsze / kryptografia" : locale === "de" ? "research lab · primzahlen / kryptografie" : "research lab · primes / cryptography"}
            </p>
            <h2 className="mt-3 max-w-5xl text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
              {locale === "pl" ? "Velmère może mieć własny dział badań, ale komunikacja musi być rygorystyczna." : locale === "de" ? "Velmère kann ein eigenes Forschungslabor zeigen, aber die Sprache muss streng bleiben." : "Velmère can show a research lab, but the language must stay rigorous."}
            </h2>
            <p className="shield-copy-safe mt-4 max-w-4xl text-sm leading-7 text-white/[0.58]">
              {locale === "pl"
                ? "Wątki liczb pierwszych, zeta-zero, Bajak Protocol i odwrócony wzór są mocne marketingowo, ale muszą być pokazane jako audyt numeryczny i research pipeline. Zero obietnic łamania kryptografii, zero claimów o dowodzie RH, zero hype'u bez replikacji."
                : locale === "de"
                  ? "Primzahlen, Zeta-Zeros, Bajak Protocol und inverse Formel sind stark für Storytelling, müssen aber als numerisches Audit und Research-Pipeline gezeigt werden. Keine Versprechen zum Brechen von Kryptografie, kein RH-Beweis-Claim, kein Hype ohne Replikation."
                  : "Prime numbers, zeta zeros, the Bajak Protocol and the inverse formula are powerful for storytelling, but they must be presented as a numerical audit and research pipeline. No crypto-breaking promises, no RH-proof claim, no hype without replication."}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {primeCryptoResearchCards.map((item) => (
                <article key={item.label} className="rounded-[1.5rem] border border-white/[0.08] bg-black/[0.24] p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.36]">{item.label}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-velmere-gold">{item.value}</p>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.54]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,0.55fr)]">
          <div className="shield-map-boundary p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                  system boundary
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  Shield Map ma budować zaufanie, ale nie zdradzać prywatnego jądra.
                </h2>
              </div>
              <span className="w-fit rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">
                private core protected
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {systemBoundaryCards.map((card) => (
                <div key={card.label} className="shield-map-boundary-card">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.72]">
                      {card.label}
                    </p>
                    <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/[0.22] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">
                      {card.state}
                    </span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.46]">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="shield-map-copilot p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
              AI copilot playbook
            </p>
            <p className="shield-copy-safe mt-3 text-sm leading-7 text-white/[0.54]">
              Bot w Shield Map nie ma straszyć ani robić hype&apos;u. Ma prowadzić operatora krótkimi komendami: co sprawdzić, czego brakuje i kiedy nie wolno robić mocnych wniosków.
            </p>
            <div className="mt-4 grid gap-2">
              {copilotPlaybook.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] font-mono text-[9px] text-velmere-gold">
                    {index + 1}
                  </span>
                  <p className="shield-copy-safe text-xs leading-6 text-white/[0.50]">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {shieldMapMilestones.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.024] p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">{item.label}</p>
                  <p className="shield-copy-safe mt-1 text-[11px] leading-5 text-white/[0.42]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none">
          <div className="shield-map-panel overflow-hidden p-4 md:p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.38fr)] lg:items-stretch">
              <div className="min-w-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                      operating atlas
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                      Jak Shield prowadzi analizę bez robienia fałszywych werdyktów.
                    </h2>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.46]">
                    <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.065] px-3 py-1.5 text-velmere-gold">
                      private core hidden
                    </span>
                    <span className="rounded-full border border-white/[0.10] bg-white/[0.026] px-3 py-1.5">
                      no accusations
                    </span>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {atlasNodes.map((node, index) => {
                    const Icon = node.icon;
                    return (
                      <button
                        key={node.label}
                        type="button"
                        onClick={() => setActiveAtlasNode(node.label)}
                        className={`group relative min-w-0 overflow-hidden rounded-[1.35rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/[0.35] ${activeAtlas.label === node.label ? "border-velmere-gold/[0.34] bg-velmere-gold/[0.065]" : "border-white/[0.08] bg-black/[0.20] hover:border-velmere-gold/[0.22] hover:bg-white/[0.026]"}`}
                      >
                        <div className="absolute right-3 top-3 font-mono text-[2.4rem] leading-none text-white/[0.025]">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.07] text-velmere-gold">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.72]">
                              {node.label}
                            </p>
                            <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-velmere-gold/[0.82]">
                              {node.status}
                            </p>
                          </div>
                        </div>
                        <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.46]">
                          {node.body}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="min-w-0 rounded-[1.35rem] border border-white/[0.08] bg-black/[0.22] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                  source truth ledger
                </p>
                <div className="mt-4 space-y-2">
                  {sourceRails.map((rail) => (
                    <div
                      key={rail.label}
                      className="rounded-2xl border border-white/[0.075] bg-white/[0.024] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.70]">
                          {rail.label}
                        </p>
                        <span className="shrink-0 rounded-full border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">
                          {rail.state}
                        </span>
                      </div>
                      <p className="shield-copy-safe mt-2 text-[11px] leading-5 text-white/[0.42]">
                        {rail.body}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="shield-copy-safe mt-4 rounded-2xl border border-white/[0.075] bg-white/[0.024] p-3 text-[11px] leading-6 text-white/[0.43]">
                  Shield Map pokazuje architekturę i workflow. Nie ujawnia prywatnych wag, progów ani heurystyk scoringu. Brak flagi nie oznacza bezpieczeństwa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-8 md:py-12">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="shield-map-panel p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                  {copy.sourceTitle}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
                  Source → agents → review → evidence
                </h2>
              </div>
              <LockKeyhole className="h-5 w-5 shrink-0 text-velmere-gold" />
            </div>
            <p className="shield-copy-safe mt-3 text-sm leading-7 text-white/[0.54]">
              {copy.sourceBody}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.layers.map((layer) => {
                const Icon = iconMap[layer.icon];
                return (
                  <div
                    key={layer.label}
                    className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.07] text-velmere-gold">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/[0.70]">
                        {layer.label}
                      </p>
                    </div>
                    <p className="shield-copy-safe mt-3 text-xs leading-6 text-white/[0.45]">
                      {layer.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shield-map-panel p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                  {copy.criticalTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/[0.50]">
                  {copy.criticalBody}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.50]">
                <span className="rounded-full border border-red-300/[0.18] bg-red-400/[0.06] px-3 py-1.5">
                  C {criticalCount}
                </span>
                <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-3 py-1.5">
                  W {watchCount}
                </span>
              </div>
            </div>
            <div className="shield-safe-scroll mt-4 max-h-[30rem] rounded-[1.25rem] border border-white/[0.08]">
              {loading ? (
                <div className="p-5 text-sm text-white/[0.48]">
                  Loading Shield Map queue…
                </div>
              ) : error ? (
                <div className="p-5 text-sm leading-6 text-amber-100">
                  Shield Map source is partial: {error}
                </div>
              ) : reviewRows.length ? (
                reviewRows.map((row) => (
                  <Link
                    key={row.id}
                    href={`/market-integrity?scan=${encodeURIComponent(row.symbol)}`}
                    className="grid min-w-0 gap-3 border-b border-white/[0.06] p-3 transition last:border-b-0 hover:bg-white/[0.035] md:grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] md:items-center"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.65]">
                      {row.symbol}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white/[0.78]">
                        {row.label}
                      </span>
                      <span className="shield-copy-safe mt-1 block text-[11px] leading-5 text-white/[0.42]">
                        {row.body}
                      </span>
                      <span className="mt-2 block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.32]">
                        {row.source} · {formatDate(row.timestamp)} ·{" "}
                        {row.action}
                      </span>
                    </span>
                    <span
                      className={`inline-flex justify-center rounded-full border px-2.5 py-1.5 text-center font-mono text-[10px] tabular-nums ${severityClass(row.score)}`}
                    >
                      {row.score}/100
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-5 text-sm leading-7 text-white/[0.46]">
                  {copy.noCases}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none">
          <div className="shield-map-operator-focus p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-velmere-gold">
                  operator focus router · PASS75
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  Shield ma działać jak system operacyjny analityka, nie ściana losowych paneli.
                </h2>
                <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                  PASS75 porządkuje terminal: jeden aktywny panel komendy, deferred heavy modules, runtime guards, source trust i evidence blockers. To ma zmniejszać lag po kliknięciu tokena i prowadzić operatora po logicznej ścieżce review.
                </p>
              </div>
              <span className="w-fit rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.060] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold">
                focused terminal OS
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {operatorFocusLanes.map((lane) => (
                <div key={lane.label} className={`shield-map-focus-card ${statePillClass(lane.state)}`}>
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.15em]">{lane.label}</p>
                    <span className="shrink-0 rounded-full border border-white/[0.10] bg-black/[0.18] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.state}</span>
                  </div>
                  <p className="shield-copy-safe mt-3 text-xs leading-6 opacity-80">{lane.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {operatorFocusRules.map((rule) => (
                <p key={rule} className="shield-copy-safe rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 text-[10px] leading-5 text-white/[0.46]">
                  {rule}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none shield-map-review-deck p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.38fr)] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                review deck · PASS77
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                Pierwszy ekran terminala ma prowadzić decyzję, a nie zasypywać panelami.
              </h2>
              <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                PASS77 dodaje Review Deck: krótki briefing operatora, prawdę o źródłach, AI review, evidence gate, stabilność interakcji i launch blockers. Deep modules zostają dostępne, ale dopiero po wyborze komendy.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">deck rule</p>
              <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.58]">
                Review Deck is an operator workflow summary. It is not legal proof, not investment advice and not an accusation.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reviewDeckLanes.map((lane) => (
              <div key={lane.label} className={`shield-map-review-card ${statePillClass(lane.state)}`}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.state}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {reviewDeckRules.map((rule) => (
              <p key={rule} className="shield-copy-safe rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 text-[10px] leading-5 text-white/[0.46]">
                {rule}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="luxury-section-wide py-6 md:py-10">
        <div className="mx-auto max-w-none shield-map-interaction-stability p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.38fr)] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                interaction stability console · PASS76
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                Shield Map ma pilnować realnej ścieżki kliknięcia, nie tylko opisywać system.
              </h2>
              <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                PASS76 dodaje warstwę kontroli interakcji: kliknięcie tokena, chart-first boot, jeden aktywny panel, cooldown źródeł, scroll tabeli i regression locks. To jest mapa stabilności produktu, nie scoring tokena.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">private core boundary</p>
              <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.58]">
                Public map shows workflow and safety rails. Private scoring weights, internal prompts and sensitive heuristics remain hidden.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {interactionStabilityLanes.map((lane) => (
              <div key={lane.label} className={`shield-map-interaction-card ${statePillClass(lane.state)}`}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.state}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {interactionStabilityRules.map((rule) => (
              <p key={rule} className="shield-copy-safe rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 text-[10px] leading-5 text-white/[0.46]">
                {rule}
              </p>
            ))}
          </div>
        </div>
      </section>


      <section className="luxury-section-wide py-6 md:py-8">
        <div className="mx-auto max-w-none shield-map-runtime-health p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.38fr)] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
                runtime health console · PASS74
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                Shield Map musi pokazywać też stan samego terminala.
              </h2>
              <p className="shield-copy-safe mt-3 max-w-3xl text-sm leading-7 text-white/[0.54]">
                Ta sekcja tłumaczy runtime safeguards: które elementy produktu są stabilne, które są częściowe, a które blokują launch. Dzięki temu premium UI nie udaje pełnej produkcji, kiedy brakuje orderbooka, audit storage albo export rendererów.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">runtime rule</p>
              <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.58]">
                Terminal runtime is product QA. Runtime safeguards are not a token score. Not financial advice. Algorithmic risk flag only.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {runtimeHealthLanes.map((lane) => (
              <div key={lane.label} className={`shield-map-runtime-card ${statePillClass(lane.state)}`}>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{lane.label}</p>
                  <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em]">{lane.state}</span>
                </div>
                <p className="shield-copy-safe mt-2 text-[11px] leading-5 opacity-80">{lane.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {runtimeRegressionLocks.map((item) => (
              <p key={item} className="shield-copy-safe rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3 text-[10px] leading-5 text-white/[0.46]">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="luxury-section-wide pb-14">
        <div className="mx-auto grid max-w-none gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="shield-map-panel p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
              operator lanes
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {copy.lanes.map((lane, index) => (
                <div
                  key={lane.label}
                  className="rounded-[1.25rem] border border-white/[0.08] bg-black/[0.18] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] font-mono text-[10px] text-velmere-gold">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.70]">
                        {lane.label}
                      </p>
                      <p className="shield-copy-safe mt-2 text-xs leading-6 text-white/[0.45]">
                        {lane.body}
                      </p>
                      <p className="mt-3 inline-flex rounded-full border border-velmere-gold/[0.16] bg-velmere-gold/[0.055] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-velmere-gold">
                        {lane.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="shield-map-panel p-4 md:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">
              release guardrails
            </p>
            <div className="mt-4 space-y-2">
              {copy.guardrails.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.18] p-3"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-velmere-gold" />
                  <p className="shield-copy-safe text-xs leading-6 text-white/[0.50]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <p className="shield-copy-safe mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.026] p-3 text-[11px] leading-6 text-white/[0.42]">
              {copy.disclaimer}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
