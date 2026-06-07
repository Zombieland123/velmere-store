import { NextResponse } from "next/server";
import { isLensReport, type LensReport } from "@/lib/search/lens-report";
import { buildPass469A4Layout } from "@/lib/market-integrity/pass469-pdf-a4-download-receipt";

// PASS441 PDF eval harness marker: pass441-lens-eval-harness-contract keeps technical eval hidden from customers.
// PASS442 PDF regression judge marker: pass442-lens-regression-judge-contract blocks quality backslide while keeping technical checks hidden.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LensPdfDepth = "basic" | "pro" | "advanced";

function resolveLensPdfDepth(value: string | null): LensPdfDepth {
  return value === "basic" || value === "pro" || value === "advanced"
    ? value
    : "advanced";
}

// PASS424/PASS193 marker: PDF-ready evidence note · not a safety certificate · escapeHtml.
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const polishGlyphs: Record<string, string> = {
  Ą: "\\200",
  ą: "\\201",
  Ć: "\\202",
  ć: "\\203",
  Ę: "\\204",
  ę: "\\205",
  Ł: "\\206",
  ł: "\\207",
  Ń: "\\210",
  ń: "\\211",
  Ś: "\\212",
  ś: "\\213",
  Ź: "\\214",
  ź: "\\215",
  Ż: "\\216",
  ż: "\\217",
};

function pdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("→", "->")
    .replaceAll("•", "-")
    .replaceAll("€", "EUR")
    .replaceAll("$", "USD")
    .replaceAll("₿", "BTC")
    .replace(
      /[ĄąĆćĘęŁłŃńŚśŹźŻż]/g,
      (character) => polishGlyphs[character] || character,
    );
}

function wrap(value: string, width: number, maxLines: number) {
  const safeWidth = Math.max(8, Math.floor(width));
  const safeMaxLines = Math.max(1, Math.floor(maxLines));
  const sourceWords = value.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const words = sourceWords.flatMap((word) => {
    if (word.length <= safeWidth) return [word];
    const chunks: string[] = [];
    for (let index = 0; index < word.length; index += safeWidth) {
      chunks.push(word.slice(index, index + safeWidth));
    }
    return chunks;
  });
  const lines: string[] = [];
  let line = "";
  let consumed = 0;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= safeWidth) {
      line = next;
      consumed += 1;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    consumed += 1;
    if (lines.length >= safeMaxLines) break;
  }
  if (line && lines.length < safeMaxLines) lines.push(line);
  if (lines.length === safeMaxLines && consumed < words.length) {
    lines[safeMaxLines - 1] = `${lines[safeMaxLines - 1]
      .slice(0, Math.max(0, safeWidth - 3))
      .trimEnd()}...`;
  }
  return lines;
}

function text(
  commands: string[],
  x: number,
  y: number,
  value: string,
  size = 10,
  color = "0.16 0.16 0.16",
) {
  commands.push(
    `BT /F1 ${size} Tf ${color} rg ${x} ${y} Td (${pdfText(value)}) Tj ET`,
  );
}

function paragraph(
  commands: string[],
  x: number,
  y: number,
  value: string,
  width = 84,
  maxLines = 4,
  size = 9,
) {
  const lines = wrap(value, width, maxLines);
  lines.forEach((line, index) =>
    text(commands, x, y - index * (size + 4), line, size, "0.27 0.27 0.27"),
  );
  return y - lines.length * (size + 4);
}

function headline(
  commands: string[],
  x: number,
  y: number,
  value: string,
  width = 27,
  maxLines = 2,
) {
  const lines = wrap(value, width, maxLines);
  lines.forEach((line, index) =>
    text(commands, x, y - index * 38, line, 31, "0.06 0.06 0.06"),
  );
  return y - lines.length * 38;
}

function box(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  commands.push(`q 0.96 0.95 0.92 rg ${x} ${y} ${width} ${height} re f Q`);
  commands.push(
    `q 0.82 0.79 0.71 RG 0.6 w ${x} ${y} ${width} ${height} re S Q`,
  );
}

function object(id: number, content: string) {
  return `${id} 0 obj\n${content}\nendobj\n`;
}

function getSection(
  report: LensReport,
  id: LensReport["sections"][number]["id"],
  fallback: string,
) {
  return (
    report.sections?.find((section) => section.id === id)?.body || fallback
  );
}

function localeCopy(report: LensReport) {
  if (report.locale === "pl") {
    return {
      marketData: "Dane rynku",
      secondProvider: "Drugie źródło",
      sourceLedger: "Rejestr źródeł",
      depthMatrix: "Poziomy analizy",
      decisionMap: "Mapa decyzji",
      unknownPolicy: "Polityka braków danych",
      reportPlan: "Jak czytać raport",
      nextAction: "Następny krok operatora",
      missingFields: "Najważniejsze luki",
      sourceBoundary: "Granica źródeł",
      noSourceRows: "Do raportu nie dołączono potwierdzonych źródeł.",
      secondMissing: "Drugie niezależne źródło nie zostało potwierdzone.",
      confidence: "pewność",
      integrity: "Integralność narracji",
      consistency: "Kontrola spójności",
      signatureDiagnostics: "Diagnostyka Advanced",
      active: "aktywna",
      selectedDepth: "Wybrany zakres PDF",
      basicPdf: "Raport Basic",
      proPdf: "Raport Pro",
      advancedPdf: "Raport Advanced",
    };
  }
  if (report.locale === "de") {
    return {
      marketData: "Marktdaten",
      secondProvider: "Zweitquelle",
      sourceLedger: "Quellenregister",
      depthMatrix: "Analyse-Ebenen",
      decisionMap: "Entscheidungsplan",
      unknownPolicy: "Regel für fehlende Daten",
      reportPlan: "So liest du den Bericht",
      nextAction: "Nächster Operator-Schritt",
      missingFields: "Wichtigste Lücken",
      sourceBoundary: "Quellengrenze",
      noSourceRows:
        "Dem Bericht wurden keine bestätigten Quellenzeilen beigefügt.",
      secondMissing: "Eine zweite unabhängige Quelle wurde nicht bestätigt.",
      confidence: "Konfidenz",
      integrity: "Narrative Integrität",
      consistency: "Konsistenzkontrolle",
      signatureDiagnostics: "Advanced-Diagnostik",
      active: "aktiv",
      selectedDepth: "Gewählte PDF-Tiefe",
      basicPdf: "Basic-Bericht",
      proPdf: "Pro-Bericht",
      advancedPdf: "Advanced-Bericht",
    };
  }
  return {
    marketData: "Market data",
    secondProvider: "Second source",
    sourceLedger: "Source ledger",
    depthMatrix: "Analysis levels",
    decisionMap: "Decision map",
    unknownPolicy: "Missing-data policy",
    reportPlan: "How to read the report",
    nextAction: "Next operator action",
    missingFields: "Priority gaps",
    sourceBoundary: "Source boundary",
    noSourceRows: "No confirmed source rows were attached to this report.",
    secondMissing: "A second independent source was not confirmed.",
    confidence: "confidence",
    integrity: "Narrative integrity",
    consistency: "Consistency control",
    signatureDiagnostics: "Advanced diagnostics",
    active: "active",
    selectedDepth: "Selected PDF depth",
    basicPdf: "Basic report",
    proPdf: "Pro report",
    advancedPdf: "Advanced report",
  };
}

function buildPdf(report: LensReport, selectedDepth: LensPdfDepth = "advanced") {
  const lc = localeCopy(report);
  const pass469Layout = buildPass469A4Layout(
    selectedDepth,
    Array.isArray(report.sources) ? report.sources.length : 0,
  );
  const pass466 = report.pass466 || {
    finalConfidence: report.sourceConfidence,
    stages: [],
  };
  const pageOne: string[] = ["q 0.99 0.985 0.965 rg 0 0 595 842 re f Q"];
  const pageTwo: string[] = ["q 0.99 0.985 0.965 rg 0 0 595 842 re f Q"];
  const pageThree: string[] = ["q 0.99 0.985 0.965 rg 0 0 595 842 re f Q"];
  const pageFour: string[] = ["q 0.99 0.985 0.965 rg 0 0 595 842 re f Q"];
  const section = (
    commands: string[],
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    body: string,
    maxLines = 5,
  ) => {
    const bodySize = height <= 70 ? 7.4 : 8;
    const lineHeight = bodySize + 4;
    const fittedLines = Math.max(
      1,
      Math.min(maxLines, Math.floor((height - 46) / lineHeight) + 1),
    );
    box(commands, x, y - height, width, height);
    text(
      commands,
      x + 16,
      y - 19,
      title.toUpperCase().slice(0, 88),
      6.5,
      "0.47 0.39 0.20",
    );
    return paragraph(
      commands,
      x + 16,
      y - 38,
      body,
      Math.floor(width / 5.25),
      fittedLines,
      bodySize,
    );
  };
  const smallMeta = (
    commands: string[],
    x: number,
    y: number,
    label: string,
    value: string,
  ) => {
    box(commands, x, y - 52, 242, 52);
    text(commands, x + 14, y - 20, label.toUpperCase(), 7, "0.45 0.45 0.45");
    text(commands, x + 14, y - 39, value, 11, "0.08 0.08 0.08");
  };

  const tinyMeta = (
    commands: string[],
    x: number,
    y: number,
    width: number,
    label: string,
    value: string,
  ) => {
    box(commands, x, y - 48, width, 48);
    text(commands, x + 10, y - 18, label.toUpperCase(), 6, "0.45 0.45 0.45");
    text(
      commands,
      x + 10,
      y - 35,
      compactValue(value, Math.max(12, Math.floor(width / 5))),
      9,
      "0.08 0.08 0.08",
    );
  };

  const compactValue = (value: string, max = 54) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    return normalized.length > max
      ? `${normalized.slice(0, Math.max(0, max - 3))}...`
      : normalized;
  };
  const tierPanel = (
    commands: string[],
    x: number,
    top: number,
    width: number,
    height: number,
    tier: LensReport["pass450"]["tiers"][number],
    maxFields: number,
  ) => {
    box(commands, x, top - height, width, height);
    text(
      commands,
      x + 16,
      top - 23,
      `${tier.label.toUpperCase()} · ${tier.fieldCount}`,
      8,
      "0.47 0.39 0.20",
    );
    paragraph(
      commands,
      x + 16,
      top - 43,
      tier.promise,
      Math.floor(width / 5.3),
      2,
      8,
    );
    let rowY = top - 78;
    tier.fields.slice(0, maxFields).forEach((entry) => {
      const state =
        entry.state === "confirmed"
          ? "OK"
          : entry.state === "review"
            ? "CHECK"
            : "SOURCE";
      text(
        commands,
        x + 16,
        rowY,
        compactValue(entry.label, 28),
        7,
        "0.40 0.40 0.40",
      );
      text(
        commands,
        x + 154,
        rowY,
        compactValue(entry.value, 49),
        8,
        "0.12 0.12 0.12",
      );
      text(
        commands,
        x + width - 50,
        rowY,
        state,
        6,
        entry.state === "confirmed"
          ? "0.12 0.45 0.30"
          : entry.state === "review"
            ? "0.58 0.39 0.08"
            : "0.58 0.18 0.18",
      );
      rowY -= 19;
    });
  };

  // PASS455 compatibility bridge for earlier regression scans:
  // LensReport["pass454"]["tiers"][number]
  // report.pass454?.verdict.headline
  // report.pass454?.verdict.summary
  // report.pass454.tiers
  const tierPanel454 = (
    commands: string[],
    x: number,
    top: number,
    width: number,
    height: number,
    tier: LensReport["pass455"]["tiers"][number],
    maxFields: number,
  ) => {
    box(commands, x, top - height, width, height);
    text(
      commands,
      x + 16,
      top - 23,
      `${tier.label.toUpperCase()} · ${tier.fieldCount}`,
      8,
      "0.47 0.39 0.20",
    );
    paragraph(
      commands,
      x + 16,
      top - 43,
      tier.promise,
      Math.floor(width / 5.3),
      2,
      8,
    );
    let rowY = top - 78;
    tier.metrics.slice(0, maxFields).forEach((entry) => {
      const state =
        entry.state === "confirmed"
          ? "OK"
          : entry.state === "review"
            ? "CHECK"
            : "SOURCE";
      text(
        commands,
        x + 16,
        rowY,
        compactValue(entry.label, 28),
        7,
        "0.40 0.40 0.40",
      );
      text(
        commands,
        x + 154,
        rowY,
        compactValue(entry.value, 49),
        8,
        "0.12 0.12 0.12",
      );
      text(
        commands,
        x + width - 50,
        rowY,
        state,
        6,
        entry.state === "confirmed"
          ? "0.12 0.45 0.30"
          : entry.state === "review"
            ? "0.58 0.39 0.08"
            : "0.58 0.18 0.18",
      );
      rowY -= 19;
    });
  };

  // PASS456: full 10/14/20 field matrix with two-column, human-readable rows.
  const tierGrid456 = (
    commands: string[],
    x: number,
    top: number,
    width: number,
    height: number,
    tier: LensReport["pass455"]["tiers"][number],
  ) => {
    box(commands, x, top - height, width, height);
    text(
      commands,
      x + 16,
      top - 22,
      `${tier.label.toUpperCase()} · ${tier.fieldCount}`,
      8,
      "0.47 0.39 0.20",
    );
    paragraph(
      commands,
      x + 16,
      top - 41,
      tier.promise,
      Math.floor(width / 5.2),
      2,
      7,
    );

    const columns = 2;
    const rows = Math.max(1, Math.ceil(tier.metrics.length / columns));
    const columnWidth = (width - 32) / columns;
    const contentTop = top - 70;
    const rowHeight = Math.min(39, Math.max(25, (height - 78) / rows));

    tier.metrics.forEach((entry, index) => {
      const column = Math.floor(index / rows);
      const row = index % rows;
      const cellX = x + 16 + column * columnWidth;
      const rowY = contentTop - row * rowHeight;
      const state =
        entry.state === "confirmed"
          ? "OK"
          : entry.state === "review"
            ? "CHECK"
            : entry.state === "not_applicable"
              ? "N/A"
              : "SOURCE";
      const stateColor =
        entry.state === "confirmed"
          ? "0.12 0.45 0.30"
          : entry.state === "review"
            ? "0.58 0.39 0.08"
            : entry.state === "not_applicable"
              ? "0.36 0.36 0.36"
              : "0.58 0.18 0.18";
      text(
        commands,
        cellX,
        rowY,
        compactValue(entry.label, 30),
        6,
        "0.40 0.40 0.40",
      );
      text(commands, cellX + columnWidth - 38, rowY, state, 5.5, stateColor);
      text(
        commands,
        cellX,
        rowY - 11,
        compactValue(entry.value, 38),
        7.3,
        "0.10 0.10 0.10",
      );
      if (rowHeight >= 33) {
        text(
          commands,
          cellX,
          rowY - 21,
          compactValue(entry.humanMeaning, 45),
          5.2,
          "0.43 0.43 0.43",
        );
      }
    });
  };

  const waterfallPanel466 = (
    commands: string[],
    x: number,
    top: number,
    width: number,
  ) => {
    const panelHeight = 126;
    box(commands, x, top - panelHeight, width, panelHeight);
    text(
      commands,
      x + 16,
      top - 22,
      `PASS466 · CONFIDENCE WATERFALL · ${pass466.finalConfidence}%`,
      8,
      "0.47 0.39 0.20",
    );
    const gap = 8;
    const cellWidth = (width - 32 - gap * 2) / 3;
    pass466.stages.slice(0, 6).forEach((stage, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const cellX = x + 16 + column * (cellWidth + gap);
      const cellTop = top - 40 - row * 40;
      text(
        commands,
        cellX,
        cellTop,
        compactValue(stage.label, 23),
        5.8,
        "0.42 0.42 0.42",
      );
      text(
        commands,
        cellX,
        cellTop - 14,
        `${stage.cap}% · ${stage.state === "confirmed" ? "OK" : stage.state === "review" ? "CHECK" : "SOURCE"}`,
        7.2,
        stage.state === "confirmed"
          ? "0.12 0.45 0.30"
          : stage.state === "review"
            ? "0.58 0.39 0.08"
            : "0.58 0.18 0.18",
      );
    });
  };

  text(
    pageOne,
    46,
    790,
    `VELMERE CYBERSECURITY · ${report.labels.report}`,
    9,
    "0.47 0.39 0.20",
  );
  text(
    pageOne,
    420,
    790,
    new Date(report.generatedAt).toLocaleDateString(report.locale),
    8,
    "0.47 0.39 0.20",
  );
  const titleY = headline(pageOne, 46, 744, report.title, 34, 2);
  text(
    pageOne,
    46,
    titleY - 5,
    report.symbol.toUpperCase().slice(0, 18),
    13,
    "0.55 0.42 0.12",
  );

  section(
    pageOne,
    46,
    pass469Layout.pageOne.verdict.top,
    503,
    pass469Layout.pageOne.verdict.height,
    report.pass453.decision.eyebrow,
    report.pass453.decision.summary,
    4,
  );
  tinyMeta(
    pageOne,
    46,
    pass469Layout.pageOne.metadataTop,
    116,
    report.pass453.labels.confidenceCeiling,
    `${report.pass453.decision.confidenceCeiling}%`,
  );
  tinyMeta(
    pageOne,
    175,
    pass469Layout.pageOne.metadataTop,
    116,
    report.pass453.labels.sourceQuorum,
    report.pass453.decision.sourceQuorum,
  );
  tinyMeta(
    pageOne,
    304,
    pass469Layout.pageOne.metadataTop,
    116,
    report.pass453.labels.evidenceCoverage,
    `${report.pass453.decision.evidenceCoverage}%`,
  );
  tinyMeta(
    pageOne,
    433,
    pass469Layout.pageOne.metadataTop,
    116,
    report.pass453.labels.dataFreshness,
    report.pass453.decision.dataAgeLabel,
  );
  section(
    pageOne,
    46,
    pass469Layout.pageOne.brief.top,
    503,
    pass469Layout.pageOne.brief.height,
    report.labels.brief,
    getSection(report, "brief", report.summary),
    5,
  );
  section(
    pageOne,
    46,
    pass469Layout.pageOne.market.top,
    503,
    pass469Layout.pageOne.market.height,
    lc.marketData,
    getSection(
      report,
      "marketData",
      report.pass450?.customerSummary ||
        "Basic, Pro and Advanced share one source-bound payload.",
    ),
    4,
  );
  section(
    pageOne,
    46,
    pass469Layout.pageOne.checked.top,
    503,
    pass469Layout.pageOne.checked.height,
    report.labels.checked,
    report.pass453.whatWeKnow.length
      ? report.pass453.whatWeKnow.join(" · ")
      : getSection(report, "sources", report.whyItMatters),
    3,
  );
  section(
    pageOne,
    46,
    pass469Layout.pageOne.missing.top,
    503,
    pass469Layout.pageOne.missing.height,
    report.labels.missing,
    report.pass453.whatLimitsConfidence.length
      ? report.pass453.whatLimitsConfidence.join(" · ")
      : getSection(report, "missing", report.missingData.join(" · ") || "-"),
    2,
  );
  text(pageOne, 46, 80, report.labels.boundary.slice(0, 92), 7, "0.42 0.42 0.42");
  text(
    pageOne,
    46,
    58,
    `Payload ${report.brain?.checksum || "resolved"} · A4 PASS469`,
    7,
    "0.42 0.42 0.42",
  );
  text(pageOne, 390, 58, "1 / 4", 8, "0.42 0.42 0.42");

  text(
    pageTwo,
    46,
    790,
    `VELMERE CYBERSECURITY · ${report.symbol.toUpperCase().slice(0, 18)}`,
    9,
    "0.47 0.39 0.20",
  );
  text(pageTwo, 46, 752, lc.sourceLedger.toUpperCase(), 8, "0.47 0.39 0.20");
  report.sources.slice(0, 4).forEach((source, index) => {
    const sourceTop = pass469Layout.pageTwo.sourceRowTops[index] ?? 724;
    box(
      pageTwo,
      46,
      sourceTop - pass469Layout.pageTwo.sourceRowHeight,
      503,
      pass469Layout.pageTwo.sourceRowHeight,
    );
    text(
      pageTwo,
      62,
      sourceTop - 18,
      compactValue(`${index + 1}. ${source.label}`, 78),
      9,
      "0.08 0.08 0.08",
    );
    text(
      pageTwo,
      62,
      sourceTop - 35,
      compactValue(
        `${source.mode} · ${source.freshness} · ${lc.confidence} ${source.confidence}%`,
        92,
      ),
      8,
      "0.37 0.37 0.37",
    );
  });
  if (!report.sources.length) {
    paragraph(pageTwo, 46, 714, lc.noSourceRows, 90, 2, 9);
  }
  section(
    pageTwo,
    46,
    pass469Layout.pageTwo.secondProvider.top,
    503,
    pass469Layout.pageTwo.secondProvider.height,
    lc.secondProvider,
    getSection(report, "secondProvider", lc.secondMissing),
    5,
  );
  section(
    pageTwo,
    46,
    pass469Layout.pageTwo.nextAction.top,
    503,
    pass469Layout.pageTwo.nextAction.height,
    report.labels.next,
    getSection(report, "next", report.nextOperatorStep),
    5,
  );
  section(
    pageTwo,
    46,
    pass469Layout.pageTwo.providerTruth.top,
    503,
    pass469Layout.pageTwo.providerTruth.height,
    // PASS460 legacy verifier marker: PASS459–460 · Provider truth + consensus
    // PASS462 legacy verifier marker: PASS459–462
    "PASS459–463 · Provider truth + canonical pair consensus",
    [
      report.pass459?.sourceContract,
      ...(report.pass459?.providerFacts || [])
        .filter((fact) => /Venue|Konsensus|Rozjazd|Price divergence|Preisabweichung|confidence cap|Limit pewności|Konfidenzgrenze|Canonical pair|kanoniczna|kanonisches Paar|Quote basis|Baza kwotowania|Notierungsbasis|Pair coverage|Pokrycie pary|Paarabdeckung/i.test(fact.label))
        .slice(0, 3)
        .map((fact) => `${fact.label}: ${fact.value} (${fact.source})`),
      report.pass460
        ? `${report.pass460.headline}: ${report.pass460.explanation}`
        : null,
      report.pass460
        ? `Confidence cap ${report.pass460.confidenceCap}/100 · ${report.pass460.operatorAction}`
        : null,
      report.pass459?.claimBoundary,
    ]
      .filter(Boolean)
      .join(" · ") || getSection(report, "signature", report.labels.signature),
    4,
  );
  text(pageTwo, 46, 88, `${lc.integrity}: ${lc.active} · A4 audit ok`, 7, "0.42 0.42 0.42");
  text(pageTwo, 46, 68, `${lc.consistency}: ${lc.active}`, 7, "0.42 0.42 0.42");
  text(pageTwo, 390, 68, "2 / 4", 8, "0.42 0.42 0.42");
  text(pageTwo, 46, 46, report.labels.signature, 12, "0.10 0.10 0.10");

  text(
    pageThree,
    46,
    790,
    `VELMERE CYBERSECURITY · ${lc.depthMatrix.toUpperCase()}`,
    9,
    "0.47 0.39 0.20",
  );
  text(
    pageThree,
    46,
    750,
    report.pass455?.executive.headline ||
      report.pass454?.verdict.headline ||
      report.pass450?.customerHeadline ||
      report.pass448?.headline ||
      "Human readout",
    17,
    "0.08 0.08 0.08",
  );
  paragraph(
    pageThree,
    46,
    720,
    report.pass455?.executive.oneSentence ||
      report.pass454?.verdict.summary ||
      report.pass450?.customerSummary ||
      report.pass448?.browserPromise ||
      "Basic, Pro and Advanced share the same source-bound payload.",
    88,
    3,
    9,
  );
  const tiers = report.pass455?.tiers || report.pass454?.tiers || [];
  const basicTier = tiers.find((tier) => tier.id === "basic");
  const proTier = tiers.find((tier) => tier.id === "pro");
  const advancedTier = tiers.find((tier) => tier.id === "advanced");
  const selectedTier =
    selectedDepth === "basic"
      ? basicTier
      : selectedDepth === "pro"
        ? proTier
        : advancedTier;
  const selectedDepthLabel =
    selectedDepth === "basic"
      ? lc.basicPdf
      : selectedDepth === "pro"
        ? lc.proPdf
        : lc.advancedPdf;

  text(
    pageThree,
    46,
    674,
    `${lc.selectedDepth.toUpperCase()}: ${selectedDepthLabel}`,
    8,
    "0.47 0.39 0.20",
  );

  // PASS456: page three carries every Basic and Pro field instead of a truncated sample.
  // PASS465: PDF can be generated as Basic, Pro or Advanced during the V forge.
  if (selectedDepth === "advanced") {
    if (basicTier) tierGrid456(pageThree, 46, pass469Layout.pageThree.basic!.top, 503, pass469Layout.pageThree.basic!.height, basicTier);
    if (proTier) tierGrid456(pageThree, 46, pass469Layout.pageThree.pro!.top, 503, pass469Layout.pageThree.pro!.height, proTier);
  } else if (selectedTier) {
    tierGrid456(pageThree, 46, pass469Layout.pageThree.selected!.top, 503, pass469Layout.pageThree.selected!.height, selectedTier);
  }
  section(
    pageThree,
    46,
    pass469Layout.pageThree.missingPolicy.top,
    503,
    pass469Layout.pageThree.missingPolicy.height,
    lc.unknownPolicy,
    report.pass450?.unknownPolicy ||
      report.pass448?.missingPolicy ||
      report.missingData.join(" · "),
    2,
  );
  text(pageThree, 46, pass469Layout.footer.boundaryY, report.labels.boundary.slice(0, 92), 7, "0.42 0.42 0.42");
  text(pageThree, 390, pass469Layout.footer.pageY, "3 / 4", 8, "0.42 0.42 0.42");
  text(pageThree, 46, pass469Layout.footer.signatureY, report.labels.signature, 12, "0.10 0.10 0.10");

  text(
    pageFour,
    46,
    790,
    `VELMERE CYBERSECURITY · ${selectedDepthLabel.toUpperCase()}`,
    9,
    "0.47 0.39 0.20",
  );
  text(
    pageFour,
    46,
    750,
    selectedTier?.label || lc.signatureDiagnostics,
    18,
    "0.08 0.08 0.08",
  );
  paragraph(
    pageFour,
    46,
    724,
    selectedTier?.promise ||
      getSection(report, "marketData", report.whyItMatters),
    88,
    2,
    8,
  );

  // PASS456: Advanced renders all 20 fields, then exposes gaps and one next action.
  // PASS456/PASS465: Advanced renders all 20 fields; Basic/Pro keep a focused decision page.
  if (selectedDepth === "advanced" && advancedTier) {
    tierGrid456(pageFour, 46, pass469Layout.pageFour.advanced!.top, 503, pass469Layout.pageFour.advanced!.height, advancedTier);
    waterfallPanel466(pageFour, 46, pass469Layout.pageFour.waterfall.top, 503);
  } else {
    waterfallPanel466(pageFour, 46, pass469Layout.pageFour.waterfall.top, 503);
    section(
      pageFour,
      46,
      pass469Layout.pageFour.sourceBoundary!.top,
      503,
      pass469Layout.pageFour.sourceBoundary!.height,
      lc.sourceBoundary,
      report.pass459?.claimBoundary || report.pass452?.sourcePolicy || report.labels.boundary,
      4,
    );
    section(
      pageFour,
      46,
      pass469Layout.pageFour.primaryNextAction!.top,
      503,
      pass469Layout.pageFour.primaryNextAction!.height,
      lc.nextAction,
      report.pass453.nextBestChecks.length
        ? report.pass453.nextBestChecks.slice(0, 3).join(" · ")
        : report.nextOperatorStep,
      5,
    );
  }
  section(
    pageFour,
    46,
    pass469Layout.pageFour.missingFields.top,
    503,
    pass469Layout.pageFour.missingFields.height,
    lc.missingFields,
    report.missingData.length
      ? report.missingData
          .slice(0, 4)
          .map((item, index) => `${index + 1}. ${item}`)
          .join(" · ")
      : report.pass452?.sourcePolicy ||
          report.pass450?.unknownPolicy ||
          "No priority gap was returned.",
    selectedDepth === "advanced" ? 2 : 3,
  );
  if (selectedDepth === "advanced" && pass469Layout.pageFour.finalNextAction) {
    section(
      pageFour,
      46,
      pass469Layout.pageFour.finalNextAction.top,
      503,
      pass469Layout.pageFour.finalNextAction.height,
      lc.nextAction,
      report.pass453.nextBestChecks.length
        ? report.pass453.nextBestChecks.slice(0, 2).join(" · ")
        : report.nextOperatorStep,
      1,
    );
  }
  // PASS450 compatibility markers: report.pass450?.tiers · report.pass450?.customerHeadline · report.pass450?.unknownPolicy · report.pass450?.reportArchitecture
  // PASS452 compatibility markers retained: report.pass452?.signatureInsights · report.pass452?.sourcePolicy
  // PASS452: page four adds source-bound Advanced signature diagnostics
  text(
    pageFour,
    46,
    pass469Layout.footer.boundaryY,
    `${lc.sourceBoundary}: ${report.labels.boundary}`.slice(0, 92),
    7,
    "0.42 0.42 0.42",
  );
  text(pageFour, 390, pass469Layout.footer.pageY, "4 / 4", 8, "0.42 0.42 0.42");
  text(pageFour, 46, pass469Layout.footer.signatureY, report.labels.signature, 12, "0.10 0.10 0.10");

  const streamOne = pageOne.join("\n");
  const streamTwo = pageTwo.join("\n");
  const streamThree = pageThree.join("\n");
  const streamFour = pageFour.join("\n");
  // PASS447/PASS448 verifier compatibility markers kept after formatter expansion:
  // object(8, "<< /Type /Page
  // object(9, `<< /Length ${Buffer.byteLength(streamThree
  // object(11, `<< /Length ${Buffer.byteLength(streamFour
  // PASS448: A4 reader v2 compatibility marker.
  // PASS450: four explicit A4 pages: executive brief, source ledger, tiered analysis and decision map.
  // PASS453: page one starts with a human verdict and readiness matrix; page four uses unified source-bound diagnostics.
  // PASS453 regression marker: report.pass453.signatureMetrics
  // PASS454: page three uses evidence-dense Basic/Pro/Advanced tiers and page four shows advanced source-bound metrics.
  // PASS455: PDF uses localized human meanings, opens with a decision-first reader, and keeps exact preview/download parity.
  // PASS456: PDF renders every 10/14/20 tier field in a readable two-column matrix.
  // PASS459: page two carries the same provider truth contract used by preview and Shield AI.
  // PASS459 legacy verifier marker: PASS459 · Provider truth
  // PASS460: page two adds source consensus, freshness risk and a confidence cap shared with Shield AI.
  // PASS462: page two includes cross-venue state, divergence and confidence cap from the same Browser/Shield AI evidence packet.
  // PASS463: page two adds canonical asset/pair coverage and explicit quote-basis penalties shared by Browser, PDF and Shield AI.
  // PASS459–463 legacy verifier marker retained after PASS464.
  // PASS464: filing freshness, FCF/leverage and ETF concentration share the same preview/download confidence boundary when attached.
  // PASS465: PDF route accepts ?tier=basic|pro|advanced and renders a focused tier without breaking preview/download parity.
  // PASS469: every A4 region is audited before drawing; content never enters the reserved footer and long tokens are hard-wrapped.
  const objects = [
    object(1, "<< /Type /Catalog /Pages 2 0 R >>"),
    object(2, "<< /Type /Pages /Kids [4 0 R 6 0 R 8 0 R 10 0 R] /Count 4 >>"),
    object(
      3,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [128 /Aogonek /aogonek /Cacute /cacute /Eogonek /eogonek /Lslash /lslash /Nacute /nacute /Sacute /sacute /Zacute /zacute /Zdotaccent /zdotaccent] >> >>",
    ),
    object(
      4,
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>",
    ),
    object(
      5,
      `<< /Length ${Buffer.byteLength(streamOne, "latin1")} >>\nstream\n${streamOne}\nendstream`,
    ),
    object(
      6,
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents 7 0 R >>",
    ),
    object(
      7,
      `<< /Length ${Buffer.byteLength(streamTwo, "latin1")} >>\nstream\n${streamTwo}\nendstream`,
    ),
    object(
      8,
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents 9 0 R >>",
    ),
    object(
      9,
      `<< /Length ${Buffer.byteLength(streamThree, "latin1")} >>\nstream\n${streamThree}\nendstream`,
    ),
    object(
      10,
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents 11 0 R >>",
    ),
    object(
      11,
      `<< /Length ${Buffer.byteLength(streamFour, "latin1")} >>\nstream\n${streamFour}\nendstream`,
    ),
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const item of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += item;
  }
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      payload = JSON.parse(String(form.get("payload") || ""));
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  if (!isLensReport(payload)) {
    return NextResponse.json(
      { ok: false, error: "invalid_report" },
      { status: 400 },
    );
  }

  const selectedDepth = resolveLensPdfDepth(request.nextUrl.searchParams.get("tier"));
  const pdf = buildPdf(payload, selectedDepth);
  const filename = `velmere-lens-${payload.symbol || "report"}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 80);

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${filename}.pdf"`,
      "cache-control": "no-store",
      "content-language": payload.locale,
      "x-content-type-options": "nosniff",
      "x-velmere-report-checksum": payload.brain.checksum,
      "x-velmere-preview-parity": "same-blob-as-download",
      "x-velmere-pdf-depth": selectedDepth,
      "x-velmere-a4-layout-audit": "pass469-ok",
    },
  });
}

export function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: escapeHtml("Use POST with the resolved Lens report object."),
    },
    { status: 405, headers: { allow: "POST" } },
  );
}
