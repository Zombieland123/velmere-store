import type { TokenRiskResult } from "./risk-types";
import { buildAiRiskBotBrief } from "./ai-risk-bot";
import { buildHolderIntelligence } from "./holder-intelligence";
import { buildStressScenarios, getWorstStressScenario } from "./stress-simulator";
import { buildRiskReplay } from "./risk-replay";

type HistoryLike = Array<{ score?: number; timestamp?: string; price?: number; volume24h?: number }>;

export type ShieldChatCard = {
  label: string;
  value: string;
  tone: "low" | "watch" | "warning" | "critical" | "neutral";
  body: string;
};

export type ShieldChatResponse = {
  prompt: string;
  mode: "risk" | "holders" | "liquidity" | "candles" | "evidence" | "general";
  headline: string;
  answer: string;
  cards: ShieldChatCard[];
  nextActions: string[];
  guardrails: string[];
  confidence: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function n(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function pct(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "unknown";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(Math.abs(value) >= 10 ? 1 : 2)}%`;
}

function money(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "unknown";
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function tone(score: number): ShieldChatCard["tone"] {
  if (score >= 82) return "critical";
  if (score >= 62) return "warning";
  if (score >= 35) return "watch";
  return "low";
}

function inferMode(prompt: string): ShieldChatResponse["mode"] {
  const q = prompt.toLowerCase();
  if (/(holder|wallet|whale|cluster|cex|owner|supply)/.test(q)) return "holders";
  if (/(liquid|depth|order|book|sell|slippage|exit)/.test(q)) return "liquidity";
  if (/(candle|chart|price|volume|pump|dump|timeframe|1h|4h|7d)/.test(q)) return "candles";
  if (/(report|evidence|json|case|proof|dowod|raport)/.test(q)) return "evidence";
  if (/(risk|score|why|explain|dlaczego|ryzyko)/.test(q)) return "risk";
  return "general";
}

export function buildShieldChatResponse(
  result: TokenRiskResult,
  history: HistoryLike = [],
  prompt = "Explain the current risk.",
): ShieldChatResponse {
  const mode = inferMode(prompt);
  const bot = buildAiRiskBotBrief(result, history);
  const holders = buildHolderIntelligence(result);
  const stress = buildStressScenarios(result);
  const replay = buildRiskReplay(result, history);
  const dominantSignal = [...result.signals].sort((a, b) => b.points - a.points)[0];
  const worstStress = getWorstStressScenario(stress);
  const historyDelta = history.length >= 2
    ? Math.round(n(history.at(-1)?.score, result.score) - n(history[0]?.score, result.score))
    : 0;
  const liquidity = n(result.metrics.liquidityUsd || result.metrics.liquidityUsd);
  const marketCap = n(result.metrics.marketCap || result.metrics.marketCapUsd);
  const liqCoverage = marketCap > 0 ? (liquidity / marketCap) * 100 : undefined;
  const confidence = clamp(Math.round(n(result.confidence, 0.42) * 100) - (result.dataQuality === "demo" ? 18 : result.dataQuality === "partial" ? 8 : 0));

  const baseCards: ShieldChatCard[] = [
    {
      label: "Risk score",
      value: `${result.score}/100`,
      tone: tone(result.score),
      body: dominantSignal ? `Dominant signal: ${dominantSignal.label}.` : "No dominant signal returned by the engine.",
    },
    {
      label: "Replay delta",
      value: `${historyDelta > 0 ? "+" : ""}${historyDelta}`,
      tone: tone(Math.abs(historyDelta) * 6),
      body: `Replay phase: ${replay.dominantPhase}. Acceleration ${replay.accelerationScore}/100.`,
    },
    {
      label: "Confidence",
      value: `${confidence}%`,
      tone: confidence < 45 ? "warning" : confidence < 65 ? "watch" : "low",
      body: `Data quality: ${result.dataQuality}. Missing inputs must stay visible as uncertainty.`,
    },
  ];

  const modeCards: Record<ShieldChatResponse["mode"], ShieldChatCard[]> = {
    risk: [
      ...baseCards,
      {
        label: "Bot verdict",
        value: bot.verdict,
        tone: tone(result.score),
        body: bot.narrative,
      },
    ],
    holders: [
      {
        label: "Holder brain",
        value: `${holders.holderRiskScore}/100`,
        tone: tone(holders.holderRiskScore),
        body: `Data completeness ${holders.dataCompleteness}%. Missing: ${holders.missingData.length ? holders.missingData.join(", ") : "none in proxy model"}.`,
      },
      ...holders.lanes.slice(0, 3).map((lane) => ({
        label: lane.label,
        value: lane.value,
        tone: tone(lane.score),
        body: lane.nextStep,
      })),
    ],
    liquidity: [
      {
        label: "Liquidity",
        value: money(liquidity),
        tone: liqCoverage === undefined ? "watch" : tone(100 - Math.min(100, liqCoverage * 14)),
        body: liqCoverage === undefined ? "Coverage unknown. Treat depth as incomplete." : `Liquidity coverage is ~${liqCoverage.toFixed(2)}% of market cap.`,
      },
      {
        label: "Worst stress",
        value: worstStress ? `${worstStress.score}/100` : "unknown",
        tone: worstStress ? tone(worstStress.score) : "neutral",
        body: worstStress ? `${worstStress.label}: ${worstStress.nextStep}` : "Stress simulator did not return a scenario.",
      },
      {
        label: "24h volume",
        value: money(result.metrics.volume24h),
        tone: tone(n(result.metrics.volumeToMarketCapRatio) * 180),
        body: `Volume/market context: ${pct(result.metrics.volumeToMarketCapRatio ? result.metrics.volumeToMarketCapRatio * 100 : undefined)}.`,
      },
    ],
    candles: [
      {
        label: "1h",
        value: pct(result.metrics.priceChange1h),
        tone: tone(Math.abs(n(result.metrics.priceChange1h)) * 5),
        body: "Use 1h as micro-structure, not the full verdict.",
      },
      {
        label: "24h",
        value: pct(result.metrics.priceChange24h),
        tone: tone(Math.abs(n(result.metrics.priceChange24h)) * 4),
        body: "Compare 24h move against liquidity and volume pressure.",
      },
      {
        label: "7d",
        value: pct(result.metrics.priceChange7d),
        tone: tone(Math.abs(n(result.metrics.priceChange7d)) * 2.5),
        body: "7d tells whether this is isolated or part of a broader repricing.",
      },
    ],
    evidence: [
      ...baseCards,
      {
        label: "Case language",
        value: "anomaly review",
        tone: "neutral",
        body: "Do not call it fraud/scam. Use evidence, uncertainty, next verification and non-advice wording.",
      },
    ],
    general: [
      ...baseCards,
      {
        label: "Best next question",
        value: bot.nextQuestion,
        tone: "neutral",
        body: "Ask a narrower question: holders, liquidity, candles, evidence, or replay.",
      },
    ],
  };

  const nextActionsByMode: Record<ShieldChatResponse["mode"], string[]> = {
    risk: ["Open replay timeline", "Compare dominant signal with liquidity and holders", "Generate evidence JSON"],
    holders: holders.nextActions.slice(0, 3),
    liquidity: ["Check stress simulator", "Compare order book bid depth vs sell shock", "Verify whether liquidity is DEX, CEX, or proxy-only"],
    candles: ["Compare 1h / 4h / 1d", "Look for volume expansion with weak depth", "Do not judge sparse fallback charts as full exchange data"],
    evidence: ["Export report JSON", "Attach missing-data note", "Keep wording as risk anomaly review"],
    general: bot.commands.slice(0, 3).map((command) => command.label),
  };

  const headlineByMode: Record<ShieldChatResponse["mode"], string> = {
    risk: `Risk explanation for ${result.token.symbol}`,
    holders: `Holder / supply review for ${result.token.symbol}`,
    liquidity: `Exit depth review for ${result.token.symbol}`,
    candles: `Candlestick structure review for ${result.token.symbol}`,
    evidence: `Evidence report plan for ${result.token.symbol}`,
    general: `Shield assistant for ${result.token.symbol}`,
  };

  return {
    prompt,
    mode,
    headline: headlineByMode[mode],
    answer:
      mode === "holders"
        ? `Holder layer is ${holders.verdict} with ${holders.dataCompleteness}% data completeness. Treat unknown clusters as uncertainty until real on-chain holder data is connected.`
        : mode === "liquidity"
          ? `Liquidity review depends on depth coverage, stress scenarios and spread/slippage. Current visible liquidity is ${money(liquidity)}.`
          : mode === "candles"
            ? `Candles show 1h ${pct(result.metrics.priceChange1h)}, 24h ${pct(result.metrics.priceChange24h)}, 7d ${pct(result.metrics.priceChange7d)}. Structure must be cross-checked with liquidity.`
            : mode === "evidence"
              ? "Build the report around signals, missing inputs, replay phase and next verification. Do not present it as investment advice or legal proof."
              : bot.narrative,
    cards: modeCards[mode],
    nextActions: nextActionsByMode[mode],
    guardrails: [
      "No investment advice.",
      "No fraud accusation without external verification.",
      "Missing data increases uncertainty, not confidence.",
    ],
    confidence,
  };
}
