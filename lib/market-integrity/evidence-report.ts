import type { TokenRiskResult } from "./risk-types";
import type { ShieldOperatorCaseFile, ShieldOperatorLane } from "./operator-casefile";

export type ShieldEvidenceSourceMode = "live" | "partial" | "fallback" | "missing" | "blocked";

export type ShieldEvidenceSource = {
  id: string;
  label: string;
  mode: ShieldEvidenceSourceMode;
  summary: string;
};

export type ShieldEvidenceReportSection = {
  id: "case" | "source_ledger" | "missing_data" | "risk_lanes" | "osint_queue" | "copy_guard";
  title: string;
  status: "ready" | "review" | "blocked";
  body: string;
  items: string[];
};

export type ShieldEvidenceReportDraft = {
  reportId: string;
  symbol: string;
  generatedAt: string;
  mode: "draft_only";
  exportStatus: "blocked" | "review" | "ready";
  sourceLedger: ShieldEvidenceSource[];
  sections: ShieldEvidenceReportSection[];
  missingDataAppendix: string[];
  redactionRules: string[];
  legalNote: string;
};

export type ShieldEvidenceExportManifest = {
  schemaVersion: "vlm-shield-evidence-manifest-v1";
  manifestMode: "json_preview_only";
  exportStatus: ShieldEvidenceReportDraft["exportStatus"];
  createdAt: string;
  reportId: string;
  caseId: string;
  token: {
    symbol: string;
    name: string;
    riskScore: number;
    riskLevel: TokenRiskResult["level"];
    confidence: number;
  };
  sourceLedger: ShieldEvidenceSource[];
  missingDataAppendix: string[];
  sections: ShieldEvidenceReportSection[];
  osintQueue: string[];
  operatorChecklist: string[];
  redactionRules: string[];
  legalNote: string;
  copyGuard: string;
  blockedReason: string;
};

function exportBlockedReason(draft: ShieldEvidenceReportDraft, caseFile: ShieldOperatorCaseFile) {
  if (draft.exportStatus === "ready") return "Manifest is ready for internal review, still not legal proof or financial advice.";
  if (draft.missingDataAppendix.length > 0) return "Final export blocked until missing-data appendix and current-source verification are resolved.";
  if (caseFile.blockers.length > 0) return "Final export blocked while operator blockers remain open.";
  return "Final export remains draft-only until audit storage and renderer are production wired.";
}

function normalizeId(value: string) {
  return value.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toUpperCase();
}

function confidencePercent(result: TokenRiskResult) {
  return Math.round((result.confidence ?? 0.35) * 100);
}

function metricKnown(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function sourceModeFromResult(result: TokenRiskResult, id: string): ShieldEvidenceSourceMode {
  if (result.dataQuality === "demo") return id === "market" ? "fallback" : "missing";
  if (id === "market") return result.dataQuality === "live" ? "live" : "partial";
  if (id === "candles") return result.chart?.sevenDay?.length ? "partial" : "missing";
  if (id === "supply") return metricKnown(result.metrics.circulatingSupply) || metricKnown(result.metrics.maxSupply) || metricKnown(result.metrics.fdv) ? "partial" : "missing";
  if (id === "liquidity") return metricKnown(result.metrics.liquidityUsd) || metricKnown(result.metrics.simulatedSlippage10k) ? "partial" : "missing";
  if (id === "holders") return metricKnown(result.metrics.top10HolderPercent) || metricKnown(result.metrics.holderCount) ? "partial" : "missing";
  if (id === "contract") return result.token.tokenAddress ? "partial" : "missing";
  if (id === "osint") return "blocked";
  return "missing";
}

function sourceSummary(result: TokenRiskResult, source: ShieldEvidenceSource): string {
  if (source.mode === "live") return "Live source attached to this prescreen.";
  if (source.mode === "partial") return "Partial source attached; manual review still required.";
  if (source.mode === "fallback") return "Fallback source only; do not use as final evidence.";
  if (source.mode === "blocked") return "Fresh OSINT/search source is not attached in this draft.";
  return "Missing source; uncertainty must stay visible.";
}

function sourceLedger(result: TokenRiskResult): ShieldEvidenceSource[] {
  const base: Omit<ShieldEvidenceSource, "mode" | "summary">[] = [
    { id: "market", label: "Market identity / price" },
    { id: "candles", label: "Candles / OHLCV" },
    { id: "supply", label: "Supply / FDV / float" },
    { id: "liquidity", label: "Liquidity / slippage" },
    { id: "holders", label: "Holder clusters" },
    { id: "contract", label: "Contract permissions" },
    { id: "osint", label: "Fresh web OSINT" },
  ];

  return base.map((item) => {
    const mode = sourceModeFromResult(result, item.id);
    const source = { ...item, mode, summary: "" };
    return { ...source, summary: sourceSummary(result, source) };
  });
}

function missingData(result: TokenRiskResult, ledger: ShieldEvidenceSource[]) {
  const explicitLimitations = result.metaModel?.limitations ?? [];
  const missingSources = ledger
    .filter((source) => source.mode === "missing" || source.mode === "blocked" || source.mode === "fallback")
    .map((source) => `${source.label}: ${source.summary}`);

  return Array.from(new Set([...explicitLimitations, ...missingSources])).slice(0, 10);
}

function sectionStatus(hasBlockers: boolean, hasMissing: boolean): ShieldEvidenceReportSection["status"] {
  if (hasBlockers) return "blocked";
  if (hasMissing) return "review";
  return "ready";
}

function laneItem(lane: ShieldOperatorLane) {
  return `${lane.label} · ${lane.status} · ${lane.nextAction}`;
}

export function buildShieldEvidenceReportDraft(result: TokenRiskResult, caseFile: ShieldOperatorCaseFile): ShieldEvidenceReportDraft {
  const generatedAt = result.generatedAt || new Date().toISOString();
  const reportId = normalizeId(`VLM-EVIDENCE-${result.token.symbol}-${generatedAt}`).slice(0, 64);
  const ledger = sourceLedger(result);
  const missing = missingData(result, ledger);
  const confidence = confidencePercent(result);
  const hasBlockedSources = ledger.some((source) => source.mode === "blocked" || source.mode === "missing" || source.mode === "fallback");
  const exportStatus: ShieldEvidenceReportDraft["exportStatus"] = hasBlockedSources || confidence < 55 ? "blocked" : result.level === "low" ? "review" : "blocked";

  const sections: ShieldEvidenceReportSection[] = [
    {
      id: "case",
      title: "Case header",
      status: "ready",
      body: `${result.token.symbol} · score ${result.score}/100 · confidence ${confidence}% · ${caseFile.evidenceStatus}`,
      items: [caseFile.quickVerdict, `Dominant agent: ${caseFile.dominantAgentLabel}`, `Next action: ${caseFile.primaryNextAction}`],
    },
    {
      id: "source_ledger",
      title: "Source ledger",
      status: sectionStatus(false, hasBlockedSources),
      body: "Every strong claim must keep its source mode attached.",
      items: ledger.map((source) => `${source.label}: ${source.mode} — ${source.summary}`),
    },
    {
      id: "missing_data",
      title: "Missing-data appendix",
      status: sectionStatus(missing.length > 0, missing.length > 0),
      body: "Missing transparency is not neutral; it remains uncertainty until a current source proves otherwise.",
      items: missing.length ? missing : ["No explicit missing-data item was detected in this draft."],
    },
    {
      id: "risk_lanes",
      title: "Operator risk lanes",
      status: sectionStatus(caseFile.blockers.length > 0, caseFile.lanes.some((lane) => lane.status === "unknown" || lane.status === "unverified")),
      body: "Risk lanes route the operator to the next verification step instead of making accusations.",
      items: caseFile.lanes.slice(0, 6).map(laneItem),
    },
    {
      id: "osint_queue",
      title: "OSINT queue",
      status: "review",
      body: "Fresh web research is required before a final token verdict.",
      items: caseFile.osintQueries,
    },
    {
      id: "copy_guard",
      title: "Copy guard",
      status: "ready",
      body: "Evidence copy must remain review language, not financial advice or legal proof.",
      items: [
        "Use: anomaly, requires review, missing source, manual verification.",
        "Avoid direct trading commands, certainty promises, safety claims and unproven accusation language.",
        caseFile.copyGuard,
      ],
    },
  ];

  return {
    reportId,
    symbol: result.token.symbol,
    generatedAt,
    mode: "draft_only",
    exportStatus,
    sourceLedger: ledger,
    sections,
    missingDataAppendix: missing,
    redactionRules: [
      "Do not expose private scoring weights, thresholds or internal prompts.",
      "Do not include raw wallet labels unless source and redaction policy are attached.",
      "Do not phrase prescreen output as proof, investment advice or accusation.",
    ],
    legalNote: "Not financial advice. Algorithmic risk flag only. Manual review and current-source verification required.",
  };
}


export function buildShieldEvidenceExportManifest(
  result: TokenRiskResult,
  caseFile: ShieldOperatorCaseFile,
  draft: ShieldEvidenceReportDraft,
): ShieldEvidenceExportManifest {
  return {
    schemaVersion: "vlm-shield-evidence-manifest-v1",
    manifestMode: "json_preview_only",
    exportStatus: draft.exportStatus,
    createdAt: new Date().toISOString(),
    reportId: draft.reportId,
    caseId: caseFile.caseId,
    token: {
      symbol: result.token.symbol,
      name: result.token.name,
      riskScore: result.score,
      riskLevel: result.level,
      confidence: confidencePercent(result),
    },
    sourceLedger: draft.sourceLedger,
    missingDataAppendix: draft.missingDataAppendix,
    sections: draft.sections,
    osintQueue: caseFile.osintQueries,
    operatorChecklist: caseFile.operatorChecklist,
    redactionRules: draft.redactionRules,
    legalNote: draft.legalNote,
    copyGuard: caseFile.copyGuard,
    blockedReason: exportBlockedReason(draft, caseFile),
  };
}

export function serializeShieldEvidenceExportManifest(manifest: ShieldEvidenceExportManifest) {
  return JSON.stringify(manifest, null, 2);
}
