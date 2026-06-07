import type { VelmereSearchResult } from "@/lib/search/intelligence-search-contract";
import { getPass423RetentionPolicy } from "@/lib/market-integrity/pass423-long-term-memory-spine";
import { buildPass425LensNarrativeContract } from "@/lib/market-integrity/pass425-source-arbitration-hallucination-brake";
import {
  buildPass427LensPreviewLock,
  type Pass427LensPreviewLock,
} from "@/lib/market-integrity/pass427-brain-bugfix-integrity-runtime";
import {
  buildPass428LensNarrativeCoherenceLock,
  type Pass428LensNarrativeCoherenceLock,
} from "@/lib/market-integrity/pass428-brain-narrative-coherence-runtime";
import {
  buildPass429LensSelfAuditContract,
  type Pass429LensSelfAuditContract,
} from "@/lib/market-integrity/pass429-brain-self-audit-consensus-runtime";
import {
  buildPass430LensAnswerProofContract,
  type Pass430LensAnswerProofContract,
} from "@/lib/market-integrity/pass430-brain-answer-verifier-runtime";
import {
  buildPass431LensCriticContract,
  type Pass431LensCriticContract,
} from "@/lib/market-integrity/pass431-brain-critic-loop-runtime";
import {
  buildPass432LensDataTruthContract,
  type Pass432LensDataTruthContract,
} from "@/lib/market-integrity/pass432-live-data-probe-runtime";
import {
  buildPass433LensRealDataContract,
  type Pass433LensRealDataContract,
} from "@/lib/market-integrity/pass433-real-internet-data-arbitration";
import {
  buildPass434LensProviderCrosscheckContract,
  type Pass434LensProviderCrosscheckContract,
} from "@/lib/market-integrity/pass434-provider-crosscheck-missing-data-hunter";
import {
  buildPass435LensLiveQueryContract,
  type Pass435LensLiveQueryContract,
} from "@/lib/market-integrity/pass435-live-query-test-bench";
import {
  buildPass436LensWorldBrainContract,
  type Pass436LensWorldBrainContract,
} from "@/lib/market-integrity/pass436-world-brain-slo-graph-runtime";
import {
  buildPass437LensAdaptiveEvidenceContract,
  type Pass437LensAdaptiveEvidenceContract,
} from "@/lib/market-integrity/pass437-adaptive-evidence-planner-runtime";
import {
  buildPass438LensProviderExecutionContract,
  type Pass438LensProviderExecutionContract,
} from "@/lib/market-integrity/pass438-provider-execution-loop-runtime";
import {
  buildPass439LensTruthReplayContract,
  type Pass439LensTruthReplayContract,
} from "@/lib/market-integrity/pass439-truth-replay-harness-runtime";
import {
  buildPass440LensSemanticDriftContract,
  type Pass440LensSemanticDriftContract,
} from "@/lib/market-integrity/pass440-semantic-drift-source-lineage-runtime";
import {
  buildPass441LensEvalHarnessContract,
  type Pass441LensEvalHarnessContract,
} from "@/lib/market-integrity/pass441-brain-eval-harness-runtime";
import {
  buildPass442LensRegressionJudgeContract,
  type Pass442LensRegressionJudgeContract,
} from "@/lib/market-integrity/pass442-regression-judge-runtime";
import {
  buildPass446HumanReadoutContract,
  type Pass446HumanReadoutContract,
} from "@/lib/market-integrity/pass446-human-readout-lane-runtime";
import {
  buildPass448DepthReportContract,
  explainPass448Missing,
  type Pass448DepthReportContract,
} from "@/lib/market-integrity/pass448-depth-report-polish-runtime";
import {
  buildPass450TieredHumanAnalysis,
  type Pass450TieredHumanAnalysis,
} from "@/lib/market-integrity/pass450-tiered-human-analysis-runtime";
import {
  buildPass451PdfExactPreview,
  type Pass451PdfExactPreview,
} from "@/lib/market-integrity/pass451-pdf-exact-preview-runtime";
import {
  buildPass452SourceBoundDepthLab,
  type Pass452SourceBoundDepthLab,
} from "@/lib/market-integrity/pass452-source-bound-depth-lab-runtime";
import {
  buildPass453UnifiedIntelligenceHandoff,
  type Pass453UnifiedIntelligenceHandoff,
} from "@/lib/market-integrity/pass453-unified-intelligence-handoff-runtime";
import {
  buildPass454EvidenceDenseHumanAnalysis,
  type Pass454EvidenceDenseHumanAnalysis,
} from "@/lib/market-integrity/pass454-evidence-dense-human-analysis-runtime";
import {
  buildPass455HumanDecisionPdfForge,
  type Pass455HumanDecisionPdfForge,
} from "@/lib/market-integrity/pass455-human-decision-pdf-forge-runtime";
import {
  buildPass459ProviderTruthPdf,
  type Pass459ProviderTruthPdf,
} from "@/lib/market-integrity/pass459-provider-truth-pdf-runtime";
import {
  buildPass460LensConsensus,
  type Pass460LensConsensus,
} from "@/lib/market-integrity/pass460-provider-consensus-pdf-runtime";
import {
  buildPass466ConfidenceWaterfall,
  type Pass466ConfidenceWaterfall,
} from "@/lib/market-integrity/pass466-confidence-waterfall";
// PASS423 migration marker: pass422-lens-source-bound-brain remains as backward-compatibility guard text.

export type LensReportLocale = "pl" | "de" | "en";

export type LensReport = {
  version: "velmere-lens-report-v1";
  locale: LensReportLocale;
  generatedAt: string;
  title: string;
  symbol: string;
  summary: string;
  whyItMatters: string;
  sourceMode: string;
  sourceConfidence: number;
  missingData: string[];
  nextOperatorStep: string;
  sources: Array<{
    label: string;
    mode: string;
    freshness: string;
    confidence: number;
  }>;
  brain: {
    version: "pass423-lens-long-memory-brain";
    fieldCount: number;
    sourceState: "confirmed" | "partial" | "missing";
    antiOverfit: "locked" | "shadow" | "limited";
    checksum: string;
    localeBranch: LensReportLocale;
    retentionYears: number;
    memoryMode: "market_ledger_only";
  };
  pass424: {
    version: "pass424-lens-narrative-correction";
    deterministic: true;
    fieldBudget: { basic: 10; pro: 14; advanced: 20 };
    antiRandomCopy: "same_payload_same_locale_same_sections";
  };
  pass425: ReturnType<typeof buildPass425LensNarrativeContract>;
  pass427: Pass427LensPreviewLock;
  pass428: Pass428LensNarrativeCoherenceLock;
  pass429: Pass429LensSelfAuditContract;
  pass430: Pass430LensAnswerProofContract;
  pass431: Pass431LensCriticContract;
  pass432: Pass432LensDataTruthContract;
  pass433: Pass433LensRealDataContract;
  pass434: Pass434LensProviderCrosscheckContract;
  pass435: Pass435LensLiveQueryContract;
  pass436: Pass436LensWorldBrainContract;
  pass437: Pass437LensAdaptiveEvidenceContract;
  pass438: Pass438LensProviderExecutionContract;
  pass439: Pass439LensTruthReplayContract;
  pass440: Pass440LensSemanticDriftContract;
  pass441: Pass441LensEvalHarnessContract;
  pass442: Pass442LensRegressionJudgeContract;
  pass446: Pass446HumanReadoutContract;
  pass448: Pass448DepthReportContract;
  pass450: Pass450TieredHumanAnalysis;
  pass451: Pass451PdfExactPreview;
  pass452: Pass452SourceBoundDepthLab;
  pass453: Pass453UnifiedIntelligenceHandoff;
  pass454: Pass454EvidenceDenseHumanAnalysis;
  pass455: Pass455HumanDecisionPdfForge;
  pass459: Pass459ProviderTruthPdf;
  pass460: Pass460LensConsensus;
  pass466: Pass466ConfidenceWaterfall;
  sections: Array<{
    id:
      | "brief"
      | "marketData"
      | "sources"
      | "secondProvider"
      | "missing"
      | "next"
      | "signature";
    title: string;
    body: string;
  }>;
  labels: {
    report: string;
    brief: string;
    sourceState: string;
    confidence: string;
    checked: string;
    missing: string;
    next: string;
    sources: string;
    boundary: string;
    signature: string;
  };
};

const labels: Record<LensReportLocale, LensReport["labels"]> = {
  pl: {
    report: "Raport Lens",
    brief: "Krótki opis",
    sourceState: "Stan źródła",
    confidence: "Pewność źródeł",
    checked: "Co sprawdzono",
    missing: "Brakujące dane",
    next: "Następny krok",
    sources: "Źródła",
    boundary:
      "Podgląd badawczy. Nie jest certyfikatem bezpieczeństwa ani poradą inwestycyjną.",
    signature: "Velmère Cybersecurity",
  },
  de: {
    report: "Lens Bericht",
    brief: "Kurzbericht",
    sourceState: "Quellenstatus",
    confidence: "Quellenkonfidenz",
    checked: "Was geprüft wurde",
    missing: "Fehlende Daten",
    next: "Nächster Schritt",
    sources: "Quellen",
    boundary:
      "Research-Vorschau. Kein Sicherheitszertifikat und keine Anlageberatung.",
    signature: "Velmère Cybersecurity",
  },
  en: {
    report: "Lens Report",
    brief: "Executive brief",
    sourceState: "Source state",
    confidence: "Source confidence",
    checked: "What was checked",
    missing: "Missing data",
    next: "Next step",
    sources: "Sources",
    boundary:
      "Research preview. Not a safety certificate or investment advice.",
    signature: "Velmère Cybersecurity",
  },
};

export function resolveLensReportLocale(locale: string): LensReportLocale {
  return locale === "de" || locale === "en" ? locale : "pl";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function stableChecksum(parts: string[]) {
  const raw = parts.join("|");
  let hash = 2166136261;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `vlm-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function compactSentence(value: string, max = 520) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function sectionCopy(
  locale: LensReportLocale,
  result: VelmereSearchResult,
  sourceConfidence: number,
  missingData: string[],
  sources: LensReport["sources"],
  pass450: Pass450TieredHumanAnalysis,
) {
  const symbol = (result.symbol || result.avatarLabel || "VLM").toUpperCase();
  const secondProvider = sources.length >= 2 ? sources[1] : undefined;
  const primarySource = sources[0];
  const missing = missingData.length
    ? missingData
        .map(
          (item, index) =>
            `${index + 1}. ${explainPass448Missing(locale, item)}`,
        )
        .join(" · ")
    : locale === "pl"
      ? "Brak głównej luki w krótkim raporcie; mocniejsze twierdzenia nadal wymagają świeżych źródeł."
      : locale === "de"
        ? "Keine Hauptlücke im Kurzbericht; stärkere Aussagen brauchen weiterhin frische Quellen."
        : "No core gap in the short report; stronger claims still require fresh sources.";
  const primary = primarySource
    ? `${primarySource.label}: ${primarySource.mode}, ${primarySource.freshness}, confidence ${primarySource.confidence}%.`
    : locale === "pl"
      ? "Brak potwierdzonego źródła w wejściu - raport pozostaje trybem ostrożnym."
      : locale === "de"
        ? "Keine bestätigte Quelle im Input - der Bericht bleibt vorsichtig."
        : "No confirmed source in the input - the report stays conservative.";
  const second = secondProvider
    ? `${secondProvider.label}: ${secondProvider.mode}, ${secondProvider.freshness}, confidence ${secondProvider.confidence}%.`
    : locale === "pl"
      ? "Drugi provider nie jest potwierdzony, więc Lens pokazuje braki zamiast dopisywać pewność."
      : locale === "de"
        ? "Der Zweitprovider ist nicht bestätigt; Lens zeigt die Lücke statt Sicherheit vorzutäuschen."
        : "Second provider is not confirmed, so Lens shows the gap instead of inventing confidence.";

  if (locale === "pl") {
    return [
      {
        id: "brief" as const,
        title: "Brief dla człowieka",
        body: `${symbol}: ${compactSentence(result.summary, 520)} To jest krótka kapsuła PDF: co widać, czego brakuje i jaki następny krok ma wykonać operator.`,
      },
      {
        id: "marketData" as const,
        title: "Dane rynku",
        body: pass450.customerSummary,
      },
      {
        id: "sources" as const,
        title: "Co sprawdzono",
        body: `${compactSentence(result.whyItMatters, 460)} Źródło główne: ${primary}`,
      },
      { id: "secondProvider" as const, title: "Drugi provider", body: second },
      { id: "missing" as const, title: "Brakujące dane", body: missing },
      {
        id: "next" as const,
        title: "Następny krok",
        body: compactSentence(result.nextOperatorStep, 420),
      },
      {
        id: "signature" as const,
        title: "Podpis",
        body: `Velmère Cybersecurity · raport z jednego payloadu · język PL · pamięć rynku do ${getPass423RetentionPolicy().retentionYears} lat z decay i bez overfitu po jednym evencie.`,
      },
    ];
  }
  if (locale === "de") {
    return [
      {
        id: "brief" as const,
        title: "Menschlicher Kurzbericht",
        body: `${symbol}: ${compactSentence(result.summary, 520)} Das ist eine kurze PDF-Kapsel: was sichtbar ist, was fehlt und welcher Operator-Schritt folgt.`,
      },
      {
        id: "marketData" as const,
        title: "Marktdaten",
        body: pass450.customerSummary,
      },
      {
        id: "sources" as const,
        title: "Was geprüft wurde",
        body: `${compactSentence(result.whyItMatters, 460)} Hauptquelle: ${primary}`,
      },
      { id: "secondProvider" as const, title: "Zweitprovider", body: second },
      { id: "missing" as const, title: "Fehlende Daten", body: missing },
      {
        id: "next" as const,
        title: "Nächster Schritt",
        body: compactSentence(result.nextOperatorStep, 420),
      },
      {
        id: "signature" as const,
        title: "Signatur",
        body: `Velmère Cybersecurity · Bericht aus einem Payload · Sprache DE · Marktgedächtnis bis ${getPass423RetentionPolicy().retentionYears} Jahre mit Decay und ohne One-Event-Overfit.`,
      },
    ];
  }
  return [
    {
      id: "brief" as const,
      title: "Human brief",
      body: `${symbol}: ${compactSentence(result.summary, 520)} This is a short PDF capsule: what is visible, what is missing and which operator step comes next.`,
    },
    {
      id: "marketData" as const,
      title: "Market data",
      body: pass450.customerSummary,
    },
    {
      id: "sources" as const,
      title: "What was checked",
      body: `${compactSentence(result.whyItMatters, 460)} Primary source: ${primary}`,
    },
    { id: "secondProvider" as const, title: "Second provider", body: second },
    { id: "missing" as const, title: "Missing data", body: missing },
    {
      id: "next" as const,
      title: "Next step",
      body: compactSentence(result.nextOperatorStep, 420),
    },
    {
      id: "signature" as const,
      title: "Signature",
      body: `Velmère Cybersecurity · one-payload report · EN locale · market memory up to ${getPass423RetentionPolicy().retentionYears} years with decay and no one-event overfit.`,
    },
  ];
}

export function buildLensReport(
  result: VelmereSearchResult,
  locale: string,
  generatedAt = new Date().toISOString(),
): LensReport {
  const safeLocale = resolveLensReportLocale(locale);
  const sourceConfidence = clampPercent(result.sourceConfidence);
  const missingData = result.missingData
    .slice(0, 6)
    .map((item) => item.slice(0, 160));
  const sources = result.sources.slice(0, 4).map((source) => ({
    label: source.label.slice(0, 80),
    mode: source.mode,
    freshness: source.freshness.slice(0, 60),
    confidence: clampPercent(source.confidence),
  }));
  const pass450 = buildPass450TieredHumanAnalysis(result, safeLocale);
  const pass451 = buildPass451PdfExactPreview(safeLocale);
  const pass452 = buildPass452SourceBoundDepthLab(result, safeLocale);
  const pass453 = buildPass453UnifiedIntelligenceHandoff(
    result,
    safeLocale,
    generatedAt,
  );
  const pass454 = buildPass454EvidenceDenseHumanAnalysis(result, safeLocale);
  const pass455 = buildPass455HumanDecisionPdfForge(result, safeLocale);
  const pass459 = buildPass459ProviderTruthPdf(result, safeLocale);
  const pass460 = buildPass460LensConsensus(result, safeLocale);
  const pass466 = buildPass466ConfidenceWaterfall(
    result,
    safeLocale,
    "advanced",
  );
  const sections = sectionCopy(
    safeLocale,
    result,
    sourceConfidence,
    missingData,
    sources,
    pass450,
  );
  const symbol = (result.symbol || result.avatarLabel || "VLM").slice(0, 20);
  const checksum = stableChecksum([
    safeLocale,
    result.id,
    symbol,
    String(sourceConfidence),
    missingData.join("/"),
    sources.map((source) => `${source.label}:${source.confidence}`).join("/"),
  ]);
  const pass425 = buildPass425LensNarrativeContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingData,
    checksum,
  });
  const pass427 = buildPass427LensPreviewLock({
    locale: safeLocale,
    checksum,
    sections,
  });
  const pass428 = buildPass428LensNarrativeCoherenceLock({
    locale: safeLocale,
    checksum,
    sections,
  });
  const pass429 = buildPass429LensSelfAuditContract({
    locale: safeLocale,
    checksum,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    duplicateBodyCount: pass428.duplicateBodyCount,
    localeLeakCount: pass428.localeLeakCount,
  });
  const pass430 = buildPass430LensAnswerProofContract({
    locale: safeLocale,
    checksum,
    sectionCount: sections.length,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    duplicateBodyCount: pass428.duplicateBodyCount,
    localeLeakCount: pass428.localeLeakCount,
  });
  const pass431 = buildPass431LensCriticContract({
    locale: safeLocale,
    pass430,
    sections,
  });
  const pass432 = buildPass432LensDataTruthContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    sectionCount: sections.length,
    missingDataCount: missingData.length,
  });
  const pass433 = buildPass433LensRealDataContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
  });
  const pass434 = buildPass434LensProviderCrosscheckContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
  });
  const pass435 = buildPass435LensLiveQueryContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
  });
  const pass436 = buildPass436LensWorldBrainContract({
    locale: safeLocale,
    pass435,
  });
  const pass437 = buildPass437LensAdaptiveEvidenceContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
  });
  const pass438 = buildPass438LensProviderExecutionContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    plannerMode: pass437.plannerMode,
  });
  const pass439 = buildPass439LensTruthReplayContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    pass438ReleaseAllowed: pass438.missingDataVisible ? false : true,
  });
  const pass440 = buildPass440LensSemanticDriftContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    pass439PdfAllowed: !pass439.missingDataVisible,
  });
  const pass441 = buildPass441LensEvalHarnessContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    pass440MissingVisible: pass440.missingDataVisible,
  });
  const pass442 = buildPass442LensRegressionJudgeContract({
    locale: safeLocale,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
    pass441MissingVisible: pass441.missingDataVisible,
  });
  const pass446 = buildPass446HumanReadoutContract({
    locale: safeLocale,
    activeDepth: "advanced",
    hasPrice:
      typeof result.marketSnapshot?.price === "number" ||
      /cena|price|preis/i.test(result.summary),
    hasMarketCapOrProxy:
      typeof result.marketSnapshot?.marketCap === "number" ||
      /kapitalizacja|market cap|marktkapitalisierung|proxy/i.test(
        result.summary,
      ),
    hasVolume:
      typeof result.marketSnapshot?.volume24h === "number" ||
      /wolumen|volume|volumen/i.test(result.summary),
    hasSecondProvider:
      sources.filter((source) => source.mode !== "missing").length >= 2,
    hasTimestamp: sources.some((source) =>
      /request|czas|fresh|timestamp|live/i.test(source.freshness),
    ),
  });
  const pass448 = buildPass448DepthReportContract({
    locale: safeLocale,
    symbol,
    sourceConfidence,
    sourceCount: sources.length,
    missingDataCount: missingData.length,
  });
  return {
    version: "velmere-lens-report-v1",
    locale: safeLocale,
    generatedAt,
    title: result.title.slice(0, 80),
    symbol,
    summary: result.summary.slice(0, 700),
    whyItMatters: result.whyItMatters.slice(0, 520),
    sourceMode: result.sourceMode,
    sourceConfidence,
    missingData,
    nextOperatorStep: result.nextOperatorStep.slice(0, 420),
    sources,
    brain: {
      version: "pass423-lens-long-memory-brain",
      fieldCount: sections.length,
      sourceState:
        sources.length >= 2
          ? "confirmed"
          : sources.length === 1
            ? "partial"
            : "missing",
      antiOverfit:
        sourceConfidence < 45 || sources.length < 2
          ? "locked"
          : sourceConfidence < 68
            ? "shadow"
            : "limited",
      checksum,
      localeBranch: safeLocale,
      retentionYears: getPass423RetentionPolicy().retentionYears,
      memoryMode: "market_ledger_only",
    },
    pass424: {
      version: "pass424-lens-narrative-correction",
      deterministic: true,
      fieldBudget: { basic: 10, pro: 14, advanced: 20 },
      antiRandomCopy: "same_payload_same_locale_same_sections",
    },
    pass425,
    pass427,
    pass428,
    pass429,
    pass430,
    pass431,
    pass432,
    pass433,
    pass434,
    pass435,
    pass436,
    pass437,
    pass438,
    pass439,
    pass440,
    pass441,
    pass442,
    pass446,
    pass448,
    pass450,
    pass451,
    pass452,
    pass453,
    pass454,
    pass455,
    pass459,
    pass460,
    pass466,
    sections,
    labels: labels[safeLocale],
  };
}

export function isLensReport(value: unknown): value is LensReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Partial<LensReport>;
  return (
    report.version === "velmere-lens-report-v1" &&
    typeof report.title === "string" &&
    typeof report.symbol === "string" &&
    typeof report.summary === "string" &&
    typeof report.whyItMatters === "string" &&
    typeof report.nextOperatorStep === "string" &&
    typeof report.sourceConfidence === "number" &&
    Array.isArray(report.missingData) &&
    Array.isArray(report.sources) &&
    Boolean(report.labels)
  );
}
