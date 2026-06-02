import type { RiskAgentId, RiskLevel, RiskSignalId, TokenRiskResult } from "./risk-types";

type RiskBrainLayer = {
  id: RiskAgentId | "history";
  label: string;
  score: number;
  confidence: number;
  state: "clear" | "watch" | "warning" | "critical" | "insufficient_data";
  evidence: RiskSignalId[];
  explanation: string;
};

type RiskBrainHistoryPoint = {
  score?: number;
  timestamp?: string;
};

function stateFromScore(score: number, confidence: number): RiskBrainLayer["state"] {
  if (confidence < 0.35) return "insufficient_data";
  if (score >= 85) return "critical";
  if (score >= 65) return "warning";
  if (score >= 35) return "watch";
  return "clear";
}

function verdictFromScore(score: number): RiskLevel | "review" {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  if (score >= 20) return "review";
  return "low";
}

function historySlope(history: RiskBrainHistoryPoint[] = []) {
  const clean = history
    .filter((item) => typeof item.score === "number")
    .slice(-24) as Array<{ score: number; timestamp?: string }>;
  if (clean.length < 2) return 0;
  const first = clean[0].score;
  const last = clean.at(-1)?.score ?? first;
  return last - first;
}

export function buildRiskBrain(result: TokenRiskResult, history: RiskBrainHistoryPoint[] = []) {
  const agents = result.agentAssessments ?? [];
  const confidence = result.confidence ?? 0.34;
  const slope = historySlope(history);
  const historyScore = Math.max(0, Math.min(100, Math.abs(slope) * 3 + (slope > 0 ? 18 : 0)));
  const historyLayer: RiskBrainLayer = {
    id: "history",
    label: "Risk delta memory",
    score: Math.round(historyScore),
    confidence: history.length >= 2 ? 0.72 : 0.22,
    state: history.length >= 2 ? stateFromScore(historyScore, 0.72) : "insufficient_data",
    evidence: [],
    explanation:
      history.length >= 2
        ? `Risk score changed by ${slope > 0 ? "+" : ""}${Math.round(slope)} points across the latest stored snapshots.`
        : "Persistent history is not deep enough yet; run cron/Supabase to unlock delta memory.",
  };
  const layers: RiskBrainLayer[] = [
    ...agents.map((agent) => ({
      id: agent.id,
      label: agent.label,
      score: agent.score,
      confidence: agent.confidence,
      state: stateFromScore(agent.score, agent.confidence),
      evidence: agent.evidenceSignalIds,
      explanation: agent.reasoning,
    })),
    historyLayer,
  ];
  const weightedScore = layers.reduce((sum, layer) => {
    const weight = layer.id === "velocity" ? 0.22
      : layer.id === "liquidity" ? 0.19
        : layer.id === "microstructure" ? 0.17
          : layer.id === "holders" ? 0.16
            : layer.id === "contract" ? 0.14
              : layer.id === "history" ? 0.08
                : 0.04;
    return sum + layer.score * weight;
  }, 0);
  const missingData = [
    result.metrics.top10HolderPercent === undefined ? "holder concentration" : null,
    result.metrics.holderCount === undefined ? "holder count" : null,
    result.metrics.liquidityUsd === undefined ? "DEX liquidity" : null,
    result.metrics.simulatedSlippage10k === undefined ? "slippage simulation" : null,
    result.token.tokenAddress ? null : "contract address",
    history.length < 2 ? "persistent risk history" : null,
  ].filter(Boolean) as string[];
  const missingPenalty = Math.min(16, missingData.length * 2.4);
  const brainScore = Math.min(100, Math.round(weightedScore + missingPenalty));
  const strongest = [...layers].filter((layer) => layer.id !== "data").sort((a, b) => b.score - a.score)[0];
  const layerMap = Object.fromEntries(layers.map((layer) => [layer.id, layer]));
  const synergyChecks = [
    {
      id: "pump_without_exit_depth",
      label: "Pump without exit depth",
      score: Math.round(((layerMap.velocity?.score ?? 0) * 0.55) + ((layerMap.liquidity?.score ?? 0) * 0.45)),
      body: "Velocity and liquidity are combined to see if a fast move has enough exit depth behind it.",
    },
    {
      id: "holders_vs_liquidity",
      label: "Holder pressure vs liquidity",
      score: Math.round(((layerMap.holders?.score ?? 0) * 0.55) + ((layerMap.liquidity?.score ?? 0) * 0.45)),
      body: "Holder concentration is compared with visible liquidity instead of being judged in isolation.",
    },
    {
      id: "orderbook_vs_price",
      label: "Order book vs price motion",
      score: Math.round(((layerMap.microstructure?.score ?? 0) * 0.52) + ((layerMap.velocity?.score ?? 0) * 0.48)),
      body: "Depth, imbalance and slippage are compared with the live price trajectory.",
    },
    {
      id: "data_uncertainty",
      label: "Data uncertainty",
      score: Math.round(((layerMap.data?.score ?? 0) * 0.65) + missingPenalty * 2.2),
      body: "Missing sources increase review priority but are never presented as proof of wrongdoing.",
    },
  ].sort((a, b) => b.score - a.score);
  const nextActions = [
    strongest ? `Review ${strongest.label} first.` : "Keep automated monitoring active.",
    missingData.includes("holder concentration") ? "Connect chain holder distribution before trusting holder safety." : "Compare holder distribution against liquidity and volume.",
    missingData.includes("persistent risk history") ? "Enable Supabase/cron snapshots to detect risk acceleration." : "Watch for rising risk delta in the next snapshots.",
    result.metaModel?.requiredReview ? "Open evidence report and verify source data manually." : "Keep this as a monitoring case unless score rises.",
  ];
  return {
    version: "velmere-shield-risk-brain-v1",
    token: result.token,
    brainScore,
    verdict: verdictFromScore(brainScore),
    confidence: Math.round(confidence * 100),
    activeLayers: layers.sort((a, b) => b.score - a.score),
    strongestLayer: strongest,
    synergyChecks,
    missingData,
    decisionPath: [
      `Base risk score: ${result.score}/100.`,
      `Fusion score after AI-brain weighting: ${brainScore}/100.`,
      strongest ? `Dominant layer: ${strongest.label} (${strongest.score}/100).` : "No dominant high-risk layer.",
      synergyChecks[0] ? `Strongest cross-check: ${synergyChecks[0].label} (${synergyChecks[0].score}/100).` : "No strong cross-layer conflict.",
      missingData.length ? `Missing data increases uncertainty: ${missingData.join(", ")}.` : "Core market-integrity layers are present.",
    ],
    nextActions,
    legalNote: "Signal engine only. Not proof, not accusation, not investment advice.",
    generatedAt: new Date().toISOString(),
  };
}
