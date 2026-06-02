import type { TokenRiskResult } from "./risk-types";
import type { InvestigatorProtocol, InvestigatorEvidenceStatus } from "./shield-investigator";

export type EvidenceReportSection = {
  id: string;
  title: string;
  status: InvestigatorEvidenceStatus | "info";
  body: string;
  nextStep?: string;
};

export type EvidenceSourceLedgerItem = {
  id: string;
  label: string;
  mode: "live" | "partial" | "fallback" | "blocked" | "required";
  body: string;
};

export type EvidenceReportDraft = {
  reportId: string;
  title: string;
  subtitle: string;
  warning: string;
  blockedBy: string[];
  sourceLedger: EvidenceSourceLedgerItem[];
  sections: EvidenceReportSection[];
  markdown: string;
};

function statusToLabel(status: EvidenceReportSection["status"]) {
  if (status === "red_flag") return "RED FLAG";
  if (status === "confirmed") return "CONFIRMED";
  if (status === "likely") return "LIKELY";
  if (status === "unverified") return "UNVERIFIED";
  if (status === "unknown") return "UNKNOWN";
  return "INFO";
}

function sourceModeFromQuality(quality: TokenRiskResult["dataQuality"]): EvidenceSourceLedgerItem["mode"] {
  if (quality === "live") return "live";
  if (quality === "partial") return "partial";
  return "fallback";
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildEvidenceReportDraft(result: TokenRiskResult, investigator: InvestigatorProtocol): EvidenceReportDraft {
  const symbol = result.token.symbol || "TOKEN";
  const reportId = `${symbol.toLowerCase()}-${String(result.generatedAt ?? Date.now()).replace(/[^0-9]/g, "").slice(0, 12) || Date.now()}`;
  const blockedBy = [
    ...investigator.caseFrame.missingData,
    investigator.webRequired ? "fresh web OSINT not attached yet" : null,
    "persistent source snapshot not stored yet",
  ].filter((item): item is string => Boolean(item));

  const sourceLedger: EvidenceSourceLedgerItem[] = [
    {
      id: "market-data",
      label: "Market data",
      mode: sourceModeFromQuality(result.dataQuality),
      body: `Current result source quality is ${result.dataQuality}. Price, volume, market-cap and signal confidence must stay tied to this source state.`,
    },
    {
      id: "chart-data",
      label: "Chart / candles",
      mode: result.chart?.sevenDay?.length ? "partial" : "fallback",
      body: result.chart?.sevenDay?.length
        ? `${result.chart.sevenDay.length} chart points attached. Candle source still needs final production verification.`
        : "No candle history attached; chart context is fallback/limited.",
    },
    {
      id: "holder-data",
      label: "Holder clustering",
      mode: result.metrics.top10HolderPercent !== undefined ? "partial" : "required",
      body: result.metrics.top10HolderPercent !== undefined
        ? `Top holder proxy is present at ${result.metrics.top10HolderPercent}%. Full clustering is not production-grade yet.`
        : "Holder clustering, CEX/team/LP separation and whale labels are required before a strong holder verdict.",
    },
    {
      id: "unlock-data",
      label: "Vesting / unlocks",
      mode: "required",
      body: "Team, investor, advisor, OTC and ecosystem unlocks must be verified from current web/project sources.",
    },
    {
      id: "contract-data",
      label: "Contract / governance",
      mode: result.token.tokenAddress ? "partial" : "required",
      body: result.token.tokenAddress
        ? `Contract address exists in the local result: ${result.token.tokenAddress}. Explorer audit is still required.`
        : "Contract address is missing from local result. Explorer verification is required.",
    },
    {
      id: "osint",
      label: "Social / KOL / controversy",
      mode: "required",
      body: "Current web search is required for paid promotion, KOL disclosures, controversy, rebrand history and market-maker/buyback claims.",
    },
  ];

  const sections: EvidenceReportSection[] = [
    {
      id: "quick-verdict",
      title: "Quick verdict",
      status: "info",
      body: investigator.quickVerdict,
      nextStep: investigator.nextActions[0]?.command,
    },
    {
      id: "loss-prevention",
      title: "Loss-prevention reason",
      status: "info",
      body: investigator.lossPrevention.whyThisMatters,
      nextStep: investigator.lossPrevention.behavioralTrap.counterMove,
    },
    {
      id: "supply",
      title: "Supply / float",
      status: investigator.lanes.find((lane) => lane.id === "supply")?.status ?? "unknown",
      body: investigator.lanes.find((lane) => lane.id === "supply")?.body ?? "Supply lane unavailable.",
      nextStep: investigator.lanes.find((lane) => lane.id === "supply")?.nextStep,
    },
    {
      id: "unlock",
      title: "Vesting / unlocks",
      status: investigator.lanes.find((lane) => lane.id === "unlock")?.status ?? "unknown",
      body: investigator.lanes.find((lane) => lane.id === "unlock")?.body ?? "Unlock lane unavailable.",
      nextStep: investigator.lanes.find((lane) => lane.id === "unlock")?.nextStep,
    },
    {
      id: "liquidity",
      title: "Liquidity / exits",
      status: investigator.lanes.find((lane) => lane.id === "liquidity")?.status ?? "unknown",
      body: investigator.lanes.find((lane) => lane.id === "liquidity")?.body ?? "Liquidity lane unavailable.",
      nextStep: investigator.lanes.find((lane) => lane.id === "liquidity")?.nextStep,
    },
    {
      id: "social",
      title: "Social / KOL risk",
      status: investigator.lanes.find((lane) => lane.id === "social")?.status ?? "unknown",
      body: investigator.lanes.find((lane) => lane.id === "social")?.body ?? "Social lane unavailable.",
      nextStep: investigator.lanes.find((lane) => lane.id === "social")?.nextStep,
    },
    {
      id: "contract",
      title: "Contract / governance",
      status: investigator.lanes.find((lane) => lane.id === "contract")?.status ?? "unknown",
      body: investigator.lanes.find((lane) => lane.id === "contract")?.body ?? "Contract lane unavailable.",
      nextStep: investigator.lanes.find((lane) => lane.id === "contract")?.nextStep,
    },
  ];

  const markdown = [
    `# VLM Shield Evidence Draft — ${symbol}`,
    "",
    `Report ID: ${reportId}`,
    `Verdict: ${investigator.finalVerdict}`,
    `Overall risk: ${investigator.overallRisk}/100`,
    `Confidence: ${investigator.confidence} (${investigator.confidenceScore}/100)`,
    "",
    "## Warning",
    "This is an educational risk/transparency draft, not financial advice, legal proof or a buy/sell instruction.",
    "",
    "## Blocked by",
    blockedBy.length ? blockedBy.map((item) => `- ${clean(item)}`).join("\n") : "- No core blocker in local model; still requires live source review.",
    "",
    "## Source ledger",
    sourceLedger.map((item) => `- [${item.mode.toUpperCase()}] ${item.label}: ${clean(item.body)}`).join("\n"),
    "",
    "## Sections",
    sections.map((section) => {
      const lines = [`### ${section.title}`, `Status: ${statusToLabel(section.status)}`, clean(section.body)];
      if (section.nextStep) lines.push(`Next step: ${clean(section.nextStep)}`);
      return lines.join("\n");
    }).join("\n\n"),
    "",
    "## OSINT queue",
    investigator.webQueries.map((query) => `- ${query}`).join("\n"),
  ].join("\n");

  return {
    reportId,
    title: `VLM Shield Evidence Draft · ${symbol}`,
    subtitle: "Source ledger / missing data / loss-prevention / OSINT queue",
    warning: "Draft only. Requires current web OSINT and persistent source snapshots before any public-grade conclusion.",
    blockedBy,
    sourceLedger,
    sections,
    markdown,
  };
}
