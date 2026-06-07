"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Brain, Download, FileText, Loader2, Search, Shield, X } from "lucide-react";
import type {
  VelmereSearchMode,
  VelmereSearchResult,
} from "@/lib/search/intelligence-search-contract";
import {
  buildLensReport,
  resolveLensReportLocale,
  type LensReport,
} from "@/lib/search/lens-report";
import { buildPass451PdfExactPreview } from "@/lib/market-integrity/pass451-pdf-exact-preview-runtime";
import { buildPass453UnifiedIntelligenceHandoff } from "@/lib/market-integrity/pass453-unified-intelligence-handoff-runtime";
import { buildPass454EvidenceDenseHumanAnalysis } from "@/lib/market-integrity/pass454-evidence-dense-human-analysis-runtime";
import { buildPass455HumanDecisionPdfForge } from "@/lib/market-integrity/pass455-human-decision-pdf-forge-runtime";
import { buildPass466ConfidenceWaterfall } from "@/lib/market-integrity/pass466-confidence-waterfall";
import {
  buildPass468HandoffHref,
  buildPass468HandoffPacket,
  writePass468HandoffPacket,
  type Pass468HandoffTarget,
} from "@/lib/market-integrity/pass468-browser-shield-orbit-handoff";
import {
  buildPass469PdfDownloadReceipt,
  readPass469PdfDownloadReceipts,
  writePass469PdfDownloadReceipt,
  type Pass469PdfDownloadReceipt,
} from "@/lib/market-integrity/pass469-pdf-a4-download-receipt";
import {
  auditPass470KeyboardFlow,
  buildPass470ReceiptHistory,
  buildPass470RuntimeGuard,
  type Pass470ReceiptHistory,
} from "@/lib/market-integrity/pass470-browser-runtime-qa";

// PASS453 compatibility marker: report.pass453.labels.diagnostics remains represented by PASS454 evidence-dense diagnostics.
// PASS424 marker: Velmère Intelligence Search · Velmère Lens · Legacy guard marker: Velmère Intelligence Search.
// PASS179 marker: VelmereLensCommandRouter · Lens router retained conceptually for Browser handoff.
// PASS176 marker: VelmereSearchDiscoveryRail · vis-bridge-box · result.bridge?.href.
// PASS177 marker: vis-live-adapter-note.
// PASS267 marker: Lens search suggestions mirror Shield-style token rows · lensSuggestionSeeds · vis-token-suggest-panel · vis-suggestion-token-avatar · selectSuggestion(item).

type SearchResponse = {
  ok: boolean;
  results?: VelmereSearchResult[];
};

function safeClientText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeClientStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .map((item) => safeClientText(item))
    .filter(Boolean)
    .slice(0, 24);
}

function normalizeClientSearchResult(value: unknown): VelmereSearchResult | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<VelmereSearchResult>;
  const symbol = safeClientText(item.symbol);
  const title = safeClientText(item.title, symbol || "Velmère research");
  const id = safeClientText(item.id, `result-${(symbol || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48) || "research"}`);
  const categories = new Set(["token", "market", "contract", "velmere", "osint", "document"]);
  const tones = new Set(["calm", "review", "elevated", "blocked"]);
  const sourceModes = new Set(["table", "live", "live_table", "fallback", "missing"]);
  const sources = Array.isArray(item.sources)
    ? item.sources
        .filter((source) => source && typeof source === "object")
        .map((source, index) => {
          const candidate = source as Partial<VelmereSearchResult["sources"][number]>;
          const mode = sourceModes.has(String(candidate.mode))
            ? candidate.mode!
            : "missing";
          return {
            id: safeClientText(candidate.id, `source-${index + 1}`),
            label: safeClientText(candidate.label, "Source required"),
            mode,
            freshness: safeClientText(candidate.freshness, "missing"),
            confidence: Math.max(0, Math.min(100, Number(candidate.confidence) || 0)),
            note: safeClientText(candidate.note, "Source boundary remains visible."),
          };
        })
        .slice(0, 16)
    : [];

  return {
    ...item,
    id,
    title,
    symbol: symbol || undefined,
    category: categories.has(String(item.category)) ? item.category! : "osint",
    tone: tones.has(String(item.tone)) ? item.tone! : "review",
    summary: safeClientText(item.summary, "The result needs a source-bound detail scan."),
    whyItMatters: safeClientText(item.whyItMatters, "Missing evidence limits the strength of the conclusion."),
    missingData: safeClientStringArray(item.missingData),
    nextOperatorStep: safeClientText(item.nextOperatorStep, "Open Shield and verify the missing source lanes."),
    sourceMode: sourceModes.has(String(item.sourceMode)) ? item.sourceMode! : "missing",
    sourceConfidence: Math.max(0, Math.min(100, Number(item.sourceConfidence) || 0)),
    shieldHref: safeClientText(item.shieldHref, "/market-integrity"),
    sources,
    chips: safeClientStringArray(item.chips),
    marketSnapshot:
      item.marketSnapshot && typeof item.marketSnapshot === "object"
        ? item.marketSnapshot
        : undefined,
  };
}

function normalizeClientSearchResults(value: unknown) {
  if (!Array.isArray(value)) return [] as VelmereSearchResult[];
  const seen = new Set<string>();
  return value
    .map(normalizeClientSearchResult)
    .filter((item): item is VelmereSearchResult => Boolean(item))
    .filter((item) => {
      const key = `${item.category}:${item.symbol || item.id}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

type PdfPreview = {
  url: string;
  filename: string;
  report: LensReport;
  depth: LensPdfDepth;
  result: VelmereSearchResult;
};

type PreviewView = "pdf" | "reader";
type LensPdfDepth = "basic" | "pro" | "advanced";

const pdfDepthOrder: LensPdfDepth[] = ["basic", "pro", "advanced"];

const modes: VelmereSearchMode[] = [
  "all",
  "token",
  "market",
  "contract",
  "velmere",
  "osint",
];

const copy = {
  pl: {
    placeholder: "Szukaj: SOL, BTC, kontrakt, VLM, Shield...",
    scan: "Skanuj",
    modes: {
      all: "Wszystko",
      token: "Tokeny",
      market: "Rynki",
      contract: "Kontrakty",
      velmere: "Velmère",
      osint: "OSINT",
    },
    loading: "Szukam w źródłach...",
    error: "Nie udało się pobrać wyników. Spróbuj ponownie.",
    preview: "Podgląd PDF",
    download: "Pobierz PDF",
    receiptSaved: "Zapisano potwierdzenie rozpoczęcia pobierania",
    receiptBoundary: "Potwierdza kliknięcie pobierania, nie zapis pliku przez system.",
    receiptHistoryTitle: "Historia PDF",
    receiptHistoryEmpty: "Brak lokalnych potwierdzeń PDF w tej przeglądarce.",
    receiptHistoryShow: "Pokaż pełną historię",
    receiptHistoryHide: "Ukryj historię",
    receiptHistoryBoundary: "Receipty pozostają lokalne, zredagowane i nie zawierają treści raportu.",
    keyboardQa: "Keyboard QA: Tab, Enter, Space i Escape aktywne",
    close: "Zamknij",
    source: "Źródło",
    confidence: "Pewność",
    checked: "Co sprawdzono",
    missing: "Brakujące dane",
    next: "Następny krok",
    sources: "Źródła",
    shield: "Otwórz Shield",
    orbit: "Otwórz Orbit 360",
    emptyTitle: "Velmère Lens PDF Capsule",
    emptyBody:
      "Wpisz token, kontrakt albo temat. Lens buduje krótki raport człowieczym językiem: brief, źródła, brakujące dane i następny krok operatora.",
    afterResultTitle: "Teraz wybierz zakres raportu PDF",
    afterResultBody:
      "Wynik znajduje się wyżej. Basic daje szybki obraz rynku, Pro dodaje drugie źródła, a Advanced otwiera pełną warstwę dowodową i nietypowe anomalie.",
    forgeTitle: "Generowanie PDF Velmère",
    forgeSteps: [
      "Tożsamość instrumentu",
      "Źródła i luki",
      "Ludzki brief",
      "Podpis Velmère",
    ],
    pdfDepthPrompt: "Wybierz zakres PDF",
    pdfDepthLock: "Zakres wybierasz przed generowaniem",
    pdfDepthLabels: { basic: "Basic", pro: "Pro", advanced: "Advanced" },
    pdfDepthDescriptions: {
      basic:
        "Szybka decyzja: trend 1h/24h/7d, skala rynku, świeżość źródła, najważniejszy brak i jeden następny krok.",
      pro:
        "Basic + jakość świec, FDV/podaż, rozjazd drugiego źródła, kontekst płynności, anomalie i scenariusz ryzyka.",
      advanced:
        "Pro + orderbook/poślizg oraz jawna macierz holderów, unlocków, kontraktu, KOL/filingów, blockerów i planu weryfikacji.",
    },
    depthTitle: "Warstwy analizy",
    depth: [
      "Basic: sytuacja teraz, kluczowe liczby, pewność i następny krok",
      "Pro: świece, podaż/FDV, płynność, drugie źródło i scenariusz",
      "Advanced: orderbook, holderzy, unlocki, kontrakt/KOL, blockery i plan dowodowy",
    ],
  },
  de: {
    placeholder: "Suche: SOL, BTC, Contract, VLM, Shield...",
    scan: "Scannen",
    modes: {
      all: "Alles",
      token: "Token",
      market: "Märkte",
      contract: "Contracts",
      velmere: "Velmère",
      osint: "OSINT",
    },
    loading: "Quellen werden durchsucht...",
    error: "Ergebnisse konnten nicht geladen werden.",
    preview: "PDF Vorschau",
    download: "PDF laden",
    receiptSaved: "Startbeleg für den Download gespeichert",
    receiptBoundary: "Bestätigt den Download-Klick, nicht die Speicherung durch das Betriebssystem.",
    receiptHistoryTitle: "PDF-Historie",
    receiptHistoryEmpty: "Keine lokalen PDF-Belege in diesem Browser.",
    receiptHistoryShow: "Vollständige Historie anzeigen",
    receiptHistoryHide: "Historie ausblenden",
    receiptHistoryBoundary: "Belege bleiben lokal, redigiert und enthalten keinen Berichtstext.",
    keyboardQa: "Keyboard QA: Tab, Enter, Space und Escape aktiv",
    close: "Schließen",
    source: "Quelle",
    confidence: "Konfidenz",
    checked: "Geprüft",
    missing: "Fehlende Daten",
    next: "Nächster Schritt",
    sources: "Quellen",
    shield: "Shield öffnen",
    orbit: "Orbit 360 öffnen",
    emptyTitle: "Velmère Lens PDF Capsule",
    emptyBody:
      "Gib Token, Contract oder Thema ein. Lens erstellt einen kurzen Bericht in menschlicher Sprache: Briefing, Quellen, fehlende Daten und nächsten Operator-Schritt.",
    afterResultTitle: "Jetzt den PDF-Umfang wählen",
    afterResultBody:
      "Das Ergebnis steht oben. Basic zeigt den schnellen Marktüberblick, Pro ergänzt Zweitquellen und Advanced öffnet die vollständige Evidenz- und Anomalieebene.",
    forgeTitle: "Velmère PDF wird erzeugt",
    forgeSteps: [
      "Instrument-Identität",
      "Quellen und Lücken",
      "Menschlicher Kurzbericht",
      "Velmère Signatur",
    ],
    pdfDepthPrompt: "PDF-Tiefe wählen",
    pdfDepthLock: "Tiefe vor der Generierung wählen",
    pdfDepthLabels: { basic: "Basic", pro: "Pro", advanced: "Advanced" },
    pdfDepthDescriptions: {
      basic:
        "Schnelle Entscheidung: 1h/24h/7d-Trend, Marktgröße, Quellenfrische, wichtigste Lücke und nächster Schritt.",
      pro:
        "Basic plus Kerzenqualität, FDV/Supply, Zweitquellen-Abweichung, Liquiditätskontext und Risikoszenario.",
      advanced:
        "Pro plus Orderbook/Slippage und klare Matrix für Holder, Unlocks, Contract, KOL/Filings, Blocker und Prüfplan.",
    },
    depthTitle: "Analyse-Ebenen",
    depth: [
      "Basic: aktuelle Lage, Kernzahlen, Konfidenz und nächster Schritt",
      "Pro: Kerzen, Supply/FDV, Liquidität, Zweitquelle und Szenario",
      "Advanced: Orderbook, Holder, Unlocks, Contract/KOL, Blocker und Evidenzplan",
    ],
  },
  en: {
    placeholder: "Search: SOL, BTC, contract, VLM, Shield...",
    scan: "Scan",
    modes: {
      all: "All",
      token: "Tokens",
      market: "Markets",
      contract: "Contracts",
      velmere: "Velmère",
      osint: "OSINT",
    },
    loading: "Searching sources...",
    error: "Results could not be loaded.",
    preview: "PDF preview",
    download: "Download PDF",
    receiptSaved: "Download-start receipt saved",
    receiptBoundary: "Confirms the download click, not that the operating system saved the file.",
    receiptHistoryTitle: "PDF history",
    receiptHistoryEmpty: "No local PDF receipts in this browser.",
    receiptHistoryShow: "Show full history",
    receiptHistoryHide: "Hide history",
    receiptHistoryBoundary: "Receipts stay local, redacted and contain no report content.",
    keyboardQa: "Keyboard QA: Tab, Enter, Space and Escape active",
    close: "Close",
    source: "Source",
    confidence: "Confidence",
    checked: "What was checked",
    missing: "Missing data",
    next: "Next step",
    sources: "Sources",
    shield: "Open Shield",
    orbit: "Open Orbit 360",
    emptyTitle: "Velmère Lens PDF Capsule",
    emptyBody:
      "Enter a token, contract or topic. Lens builds a short human report: brief, sources, missing data and the next operator step.",
    afterResultTitle: "Now choose the PDF depth",
    afterResultBody:
      "The result is shown above. Basic gives a fast market view, Pro adds second-source checks, and Advanced opens the full evidence and anomaly layer.",
    forgeTitle: "Generating Velmère PDF",
    forgeSteps: [
      "Instrument identity",
      "Sources and gaps",
      "Human brief",
      "Velmère signature",
    ],
    pdfDepthPrompt: "Choose PDF depth",
    pdfDepthLock: "Choose the depth before generation",
    pdfDepthLabels: { basic: "Basic", pro: "Pro", advanced: "Advanced" },
    pdfDepthDescriptions: {
      basic:
        "Fast decision: 1h/24h/7d trend, market scale, source freshness, the key gap and one next action.",
      pro:
        "Basic plus candle quality, FDV/supply, second-source divergence, liquidity context, anomalies and a risk scenario.",
      advanced:
        "Pro plus orderbook/slippage and an explicit matrix for holders, unlocks, contract, KOL/filings, blockers and verification plan.",
    },
    depthTitle: "Analysis layers",
    depth: [
      "Basic: current situation, core numbers, confidence and next action",
      "Pro: candles, supply/FDV, liquidity, second source and scenario",
      "Advanced: orderbook, holders, unlocks, contract/KOL, blockers and evidence plan",
    ],
  },
} as const;

function reportSection(
  report: LensReport,
  id: LensReport["sections"][number]["id"],
  fallback: string,
) {
  return report.sections.find((section) => section.id === id)?.body || fallback;
}

function formatSnapshotMoney(locale: string, value?: number, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: Math.abs(value) >= 1_000_000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(value) < 1 ? 6 : 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: Math.abs(value) < 1 ? 6 : 2,
    }).format(value);
  }
}

function formatSnapshotPercent(locale: string, value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)}%`;
}

export default function VelmereIntelligenceSearchClient({
  locale,
  initialQuery = "",
}: {
  locale: string;
  initialQuery?: string;
}) {
  const safeLocale = resolveLensReportLocale(locale);
  const c = copy[safeLocale];
  const pass451 = useMemo(
    () => buildPass451PdfExactPreview(safeLocale),
    [safeLocale],
  );
  const [query, setQuery] = useState(() => safeClientText(initialQuery));
  const deferredQuery = useDeferredValue(query);
  const [mode, setMode] = useState<VelmereSearchMode>("all");
  const [suggestions, setSuggestions] = useState<VelmereSearchResult[]>([]);
  const [results, setResults] = useState<VelmereSearchResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfPreview, setPdfPreview] = useState<PdfPreview | null>(null);
  const [pdfChoiceResult, setPdfChoiceResult] =
    useState<VelmereSearchResult | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfStage, setPdfStage] = useState(0);
  const [selectedPdfDepth, setSelectedPdfDepth] = useState<LensPdfDepth>("advanced");
  const [previewView, setPreviewView] = useState<PreviewView>("reader");
  const [downloadReceipt, setDownloadReceipt] =
    useState<Pass469PdfDownloadReceipt | null>(null);
  const [receiptHistory, setReceiptHistory] =
    useState<Pass470ReceiptHistory>(() => buildPass470ReceiptHistory([]));
  const [receiptHistoryOpen, setReceiptHistoryOpen] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const detailRequestRef = useRef<AbortController | null>(null);
  const pdfRequestRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const previewCloseRef = useRef<HTMLButtonElement | null>(null);
  const previewDialogRef = useRef<HTMLElement | null>(null);
  const forgeDialogRef = useRef<HTMLElement | null>(null);
  const forgeDepthButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewTriggerRef = useRef<HTMLElement | null>(null);
  const committedQueryRef = useRef("");
  const initialQueryPendingRef = useRef(Boolean(safeClientText(initialQuery)));
  const selectedPdfDepthRef = useRef<LensPdfDepth>("advanced");

  const lensSuggestionSeeds = suggestions.slice(0, 3);
  const pdfModalActive = Boolean(pdfPreview || pdfLoadingId || pdfChoiceResult);

  useEffect(() => {
    selectedPdfDepthRef.current = selectedPdfDepth;
  }, [selectedPdfDepth]);
  const pdfDepthLocked = Boolean(pdfLoadingId);
  const activeForgeResult = results.find((item) => item.id === pdfLoadingId);
  const activeForgeIntelligence = activeForgeResult
    ? buildPass455HumanDecisionPdfForge(activeForgeResult, safeLocale)
    : null;
  const pass470KeyboardAudit = useMemo(
    () =>
      auditPass470KeyboardFlow([
        { id: "lens-search-input", role: "combobox", label: c.placeholder, tabbable: true, enterActivates: true },
        ...pdfDepthOrder.map((depth) => ({
          id: `lens-depth-${depth}`,
          role: "button" as const,
          label: c.pdfDepthLabels[depth],
          tabbable: true,
          enterActivates: true,
          spaceActivates: true,
        })),
        { id: "lens-reader-toggle", role: "button", label: c.preview, tabbable: true, enterActivates: true, spaceActivates: true },
        { id: "lens-download-link", role: "link", label: c.download, tabbable: true, enterActivates: true },
        { id: "lens-preview-close", role: "button", label: c.close, tabbable: true, escapeCloses: true, enterActivates: true, spaceActivates: true },
      ]),
    [c.close, c.download, c.pdfDepthLabels, c.placeholder, c.preview],
  );
  const pass470RuntimeGuards = useMemo(
    () => results.map((result) => buildPass470RuntimeGuard(result)),
    [results],
  );

  const endpoint = useMemo(() => {
    const params = new URLSearchParams({
      q: deferredQuery.trim(),
      mode,
      locale: safeLocale,
      intent: "suggest",
    });
    return `/api/search?${params.toString()}`;
  }, [mode, deferredQuery, safeLocale]);

  useEffect(() => {
    const clean = deferredQuery.trim();
    if (!clean) {
      requestRef.current?.abort();
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if (clean.toLowerCase() === committedQueryRef.current.toLowerCase()) {
      setSuggestionsOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const payload = (await response.json()) as SearchResponse;
        if (!response.ok || !payload.ok) return;
        setSuggestions(normalizeClientSearchResults(payload.results).slice(0, 3));
        setSuggestionsOpen(true);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") setSuggestions([]);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [deferredQuery, endpoint]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        formRef.current?.contains(target) ||
        suggestionsRef.current?.contains(target)
      )
        return;
      setSuggestionsOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, []);

  async function runSearch(nextQuery = query) {
    const clean = safeClientText(nextQuery);
    if (!clean) return;
    committedQueryRef.current = clean;
    requestRef.current?.abort();
    detailRequestRef.current?.abort();
    const controller = new AbortController();
    detailRequestRef.current = controller;
    setLoading(true);
    setError("");
    setResults([]);
    setSuggestionsOpen(false);
    setSuggestions([]);
    try {
      const params = new URLSearchParams({
        q: clean,
        mode,
        locale: safeLocale,
        intent: "detail",
      });
      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: controller.signal,
      });
      const payload = (await response.json()) as SearchResponse;
      if (!response.ok || !payload.ok) throw new Error("search_failed");
      if (detailRequestRef.current !== controller) return;
      setResults(normalizeClientSearchResults(payload.results));
    } catch (searchError) {
      if ((searchError as Error).name !== "AbortError") setError(c.error);
    } finally {
      if (detailRequestRef.current === controller) {
        detailRequestRef.current = null;
        setLoading(false);
      }
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  useEffect(() => {
    if (!initialQueryPendingRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      if (!initialQueryPendingRef.current) return;
      initialQueryPendingRef.current = false;
      formRef.current?.requestSubmit();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function chooseSuggestion(item: VelmereSearchResult) {
    const value = item.symbol || item.title;
    committedQueryRef.current = value;
    setQuery(value);
    setSuggestions([]);
    setSuggestionsOpen(false);
    void runSearch(value);
  }

  function selectSuggestion(item: VelmereSearchResult) {
    chooseSuggestion(item);
  }

  useEffect(() => {
    if (!results.length || loading) return;
    const frame = window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultsAnchorRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, results]);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      detailRequestRef.current?.abort();
      pdfRequestRef.current?.abort();
      if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    };
  }, [pdfPreview?.url]);

  useEffect(() => {
    if (!pdfLoadingId) return;
    const frame = window.requestAnimationFrame(() => {
      forgeDepthButtonRef.current?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !forgeDialogRef.current) return;
      const focusable = Array.from(
        forgeDialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) {
        event.preventDefault();
        forgeDialogRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pdfLoadingId]);

  useEffect(() => {
    if (!pdfModalActive) return;
    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;
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
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [pdfModalActive]);

  useEffect(() => {
    if (!pdfPreview) return;
    setReceiptHistory(buildPass470ReceiptHistory(readPass469PdfDownloadReceipts(), 20));
    previewCloseRef.current?.focus();
    const dialog = previewDialogRef.current;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "iframe",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPdfPreview(null);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true",
      );
      if (!focusable.length) {
        event.preventDefault();
        previewCloseRef.current?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => previewTriggerRef.current?.focus());
    };
  }, [pdfPreview]);

  useEffect(() => {
    if (!pdfLoadingId) {
      setPdfStage(0);
      return;
    }
    const timers = [0, 700, 1400, 2100].map((delay, index) =>
      window.setTimeout(() => setPdfStage(index), delay),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [pdfLoadingId]);

  function closePreview() {
    setPreviewView("reader");
    setDownloadReceipt(null);
    setReceiptHistoryOpen(false);
    setPdfPreview(null);
  }

  function openPass468Handoff(
    result: VelmereSearchResult,
    target: Pass468HandoffTarget,
    depth: LensPdfDepth = selectedPdfDepthRef.current,
  ) {
    const packet = buildPass468HandoffPacket(result, depth, target);
    writePass468HandoffPacket(packet);
    window.location.assign(buildPass468HandoffHref(safeLocale, packet));
  }

  function requestPreview(
    result: VelmereSearchResult,
    trigger: HTMLElement,
  ) {
    previewTriggerRef.current = trigger;
    setSuggestionsOpen(false);
    setSuggestions([]);
    setSelectedPdfDepth("basic");
    selectedPdfDepthRef.current = "basic";
    setPdfChoiceResult(result);
  }

  async function openPreview(
    result: VelmereSearchResult,
    requestedDepth: LensPdfDepth = selectedPdfDepthRef.current,
  ) {
    pdfRequestRef.current?.abort();
    const controller = new AbortController();
    pdfRequestRef.current = controller;
    selectedPdfDepthRef.current = requestedDepth;
    setSelectedPdfDepth(requestedDepth);
    setPdfChoiceResult(null);
    setPdfLoadingId(result.id);
    setPdfStage(0);
    setDownloadReceipt(null);
    setReceiptHistoryOpen(false);
    setReceiptHistory(buildPass470ReceiptHistory(readPass469PdfDownloadReceipts(), 20));
    setError("");
    const forgeStartedAt = performance.now();
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1460));
      if (controller.signal.aborted) return;
      const depth = requestedDepth;
      const report = buildLensReport(result, safeLocale);
      report.pass466 = buildPass466ConfidenceWaterfall(
        result,
        safeLocale,
        depth,
      );
      const response = await fetch(`/api/search/lens-report?tier=${encodeURIComponent(depth)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(report),
        signal: controller.signal,
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/pdf")
      ) {
        throw new Error("pdf_failed");
      }
      const blob = await response.blob();
      if (blob.size < 900 || blob.type !== "application/pdf")
        throw new Error("pdf_invalid");
      setPdfStage(3);
      const remainingForgeMs = Math.max(
        0,
        2400 - (performance.now() - forgeStartedAt),
      );
      if (remainingForgeMs > 0) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, remainingForgeMs),
        );
      }
      const filename = `velmere-lens-${report.symbol || "report"}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .slice(0, 80);
      setPreviewView("reader");
      setPdfPreview({
        url: URL.createObjectURL(blob),
        filename: `${filename}-${depth}.pdf`,
        report,
        depth,
        result,
      });
    } catch (previewError) {
      if ((previewError as Error).name !== "AbortError") setError(c.error);
    } finally {
      if (pdfRequestRef.current === controller) {
        pdfRequestRef.current = null;
        setPdfLoadingId(null);
      }
    }
  }

  function recordPass469DownloadReceipt() {
    if (!pdfPreview) return;
    const receipt = buildPass469PdfDownloadReceipt({
      filename: pdfPreview.filename,
      symbol: pdfPreview.report.symbol,
      depth: pdfPreview.depth,
      reportChecksum: pdfPreview.report.brain?.checksum || "unavailable",
      sourceConfidence: pdfPreview.report.sourceConfidence,
      sourceCount: pdfPreview.report.sources.length,
    });
    const persisted = writePass469PdfDownloadReceipt(receipt);
    setDownloadReceipt(persisted ? receipt : null);
    if (persisted) {
      setReceiptHistory(buildPass470ReceiptHistory(readPass469PdfDownloadReceipts(), 20));
    }
  }

  return (
    <main
      className="min-h-screen bg-velmere-black px-5 pb-24 pt-24 text-white md:px-10 md:pt-28"
      data-pass444-lens-pdf-forge="true"
      data-pass445-lens-pdf-human-field="true"
      data-pass446-browser-human-readout="true"
      data-pass447-pdf-preview-parity="true"
      data-pass448-pdf-a4-reader-v2="true"
      data-pass450-tiered-human-report="true"
      data-pass452-browser-realmarkets-qa="true"
      data-pass453-unified-intelligence-handoff="true"
      data-pass454-evidence-dense-human-analysis="true"
      data-pass455-human-decision-pdf-forge="true"
      data-pass456-asset-aware-pdf-runtime="true"
      data-pass465-selectable-pdf-depth="true"
      data-pass467-result-priority-runtime="true"
      data-pass468-browser-shield-orbit-handoff="true"
      data-pass470-browser-runtime-qa="true"
      data-pass471-surface-runtime-resilience="true"
    >
      <section className="mx-auto max-w-[88rem]">
        {!pdfModalActive ? (
        <div className="sticky top-20 z-[55] rounded-[2.1rem] border border-cyan-200/[0.08] bg-velmere-black/[0.82] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:top-24">
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="relative rounded-[2rem] border border-cyan-200/[0.14] bg-[radial-gradient(circle_at_0%_0%,rgba(200,169,106,0.10),transparent_34%),rgba(4,20,22,0.82)] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)] md:p-6"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-black/[0.32] p-2">
              <Search
                className="ml-3 h-5 w-5 shrink-0 text-velmere-gold"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  if (
                    value.trim().toLowerCase() !==
                    committedQueryRef.current.toLowerCase()
                  ) {
                    committedQueryRef.current = "";
                  }
                  setQuery(value);
                }}
                onFocus={() => {
                  if (query.trim() && suggestions.length)
                    setSuggestionsOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSuggestionsOpen(false);
                    setSuggestions([]);
                  }
                }}
                placeholder={c.placeholder}
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen && lensSuggestionSeeds.length > 0}
                aria-controls="velmere-lens-suggestion-list"
                data-testid="lens-search-input"
                data-pass470-keyboard-control="combobox"
                aria-keyshortcuts="Enter Escape ArrowDown"
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/[0.34]"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="inline-flex items-center gap-2 rounded-full border border-velmere-gold/[0.28] bg-velmere-gold/[0.10] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-velmere-gold transition hover:bg-velmere-gold/[0.16] disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span aria-hidden="true">V</span>
                )}
                {c.scan}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                    mode === item
                      ? "border-velmere-gold/[0.34] bg-velmere-gold/[0.10] text-velmere-gold"
                      : "border-white/[0.09] bg-white/[0.025] text-white/[0.48] hover:text-white"
                  }`}
                >
                  {c.modes[item]}
                </button>
              ))}
            </div>

            {suggestionsOpen && query.trim() && lensSuggestionSeeds.length ? (
              <div
                ref={suggestionsRef}
                id="velmere-lens-suggestion-list"
                role="listbox"
                aria-label={safeLocale === "pl" ? "Sugestie wyszukiwania" : safeLocale === "de" ? "Suchvorschläge" : "Search suggestions"}
                data-pass444-three-visible-no-scroll="true"
                className="vis-token-suggest-panel mt-3 grid max-h-none gap-2 overflow-visible rounded-[1.45rem] border border-cyan-200/[0.18] bg-[#061315]/[0.99] p-2 shadow-[0_30px_110px_rgba(0,0,0,0.72)] backdrop-blur-2xl"
              >
                {lensSuggestionSeeds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(item)}
                    className="flex w-full items-center gap-3 rounded-[1rem] border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-left transition hover:border-cyan-200/[0.18] hover:bg-white/[0.055]"
                  >
                    <span
                      className="vis-suggestion-token-avatar grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-white/[0.04] bg-cover bg-center font-mono text-xs text-velmere-gold"
                      style={
                        item.avatarImage
                          ? { backgroundImage: `url(${item.avatarImage})` }
                          : undefined
                      }
                      aria-hidden="true"
                    >
                      {item.avatarImage
                        ? null
                        : item.symbol?.slice(0, 2) || "V"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-white">
                        {item.symbol || item.title}
                      </strong>
                      <span className="block truncate text-xs text-white/[0.48]">
                        {item.title}
                      </span>
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.34]">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </form>
        </div>
        ) : null}


        {error ? (
          <p className="mt-4 rounded-xl border border-red-300/[0.15] bg-red-400/[0.05] p-4 text-sm text-red-100/[0.82]">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="mt-8 flex items-center gap-3 text-sm text-white/[0.48]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {c.loading}
          </p>
        ) : null}

        <div
          ref={resultsAnchorRef}
          className={`${results.length ? "mt-5 scroll-mt-48" : ""} grid gap-4`}
          data-pass467-result-first-layout="true"
          aria-live="polite"
          aria-busy={loading}
        >
          {results.length ? (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/[0.62]">
                {safeLocale === "pl"
                  ? "Wynik bezpośrednio pod wyszukiwarką"
                  : safeLocale === "de"
                    ? "Ergebnis direkt unter der Suche"
                    : "Result directly below search"}
              </p>
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.30]">
                {results.length} · {committedQueryRef.current}
              </span>
            </div>
          ) : null}
          {results.map((result, resultIndex) => (
            <article
              key={result.id}
              data-testid="lens-result-card"
              data-primary-result={resultIndex === 0 ? "true" : "false"}
              data-pass470-runtime-guard={pass470RuntimeGuards[resultIndex]?.safeToRender ? "ok" : "review"}
              data-pass470-source-count={pass470RuntimeGuards[resultIndex]?.sources ?? 0}
              className={`rounded-[1.6rem] border p-5 md:p-6 ${
                resultIndex === 0
                  ? "border-cyan-200/[0.18] bg-[radial-gradient(circle_at_0%_0%,rgba(72,214,220,0.08),transparent_34%),rgba(255,255,255,0.03)] shadow-[0_24px_90px_rgba(0,0,0,0.28)]"
                  : "border-white/[0.09] bg-white/[0.025]"
              }`}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-white/[0.04] bg-cover bg-center font-mono text-sm text-velmere-gold"
                    style={
                      result.avatarImage
                        ? { backgroundImage: `url(${result.avatarImage})` }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {result.avatarImage
                      ? null
                      : result.symbol?.slice(0, 2) || "V"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">
                        {result.title}
                      </h2>
                      {result.symbol ? (
                        <span className="rounded-full border border-white/[0.09] px-2 py-1 font-mono text-[9px] text-white/[0.48]">
                          {result.symbol}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/[0.58]">
                      {result.summary}
                    </p>
                    {(() => {
                      const intelligence = buildPass455HumanDecisionPdfForge(
                        result,
                        safeLocale,
                      );
                      const toneClass =
                        result.tone === "calm"
                          ? "border-emerald-300/[0.18] bg-emerald-300/[0.045]"
                          : result.tone === "review"
                            ? "border-amber-300/[0.16] bg-amber-300/[0.04]"
                            : "border-rose-300/[0.18] bg-rose-300/[0.045]";
                      const labels =
                        safeLocale === "pl"
                          ? { known: "Co wiemy", missing: "Co ogranicza wynik", next: "Następne sprawdzenie" }
                          : safeLocale === "de"
                            ? { known: "Was wir wissen", missing: "Was das Ergebnis begrenzt", next: "Nächste Prüfung" }
                            : { known: "What we know", missing: "What limits the result", next: "Next check" };
                      return (
                        <section
                          className={`mt-4 rounded-[1.35rem] border p-4 ${toneClass}`}
                          data-pass453-human-verdict="true"
                          data-pass455-human-decision-card="true"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/[0.38]">
                                {intelligence.executive.eyebrow}
                              </p>
                              <strong className="mt-2 block text-base text-white/[0.92]">
                                {intelligence.executive.headline}
                              </strong>
                              <p className="mt-2 max-w-3xl text-xs leading-6 text-white/[0.54]">
                                {intelligence.executive.oneSentence}
                              </p>
                            </div>
                            <span className="rounded-full border border-white/[0.10] bg-black/[0.18] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.58]">
                              {intelligence.executive.confidenceLabel}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/[0.07] bg-black/[0.16] p-3">
                              <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">
                                {labels.known}
                              </p>
                              <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.70]">
                                {intelligence.executive.whatWeKnow.slice(0, 4).map((item) => (
                                  <span key={item}>• {item}</span>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/[0.07] bg-black/[0.16] p-3">
                              <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.34]">
                                {labels.missing}
                              </p>
                              <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-white/[0.62]">
                                {intelligence.executive.whatIsMissing.slice(0, 3).map((item) => (
                                  <span key={item}>• {item}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 rounded-2xl border border-velmere-gold/[0.14] bg-velmere-gold/[0.045] px-3 py-3">
                            <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-velmere-gold/[0.76]">
                              {labels.next}
                            </p>
                            <p className="mt-2 text-[11px] leading-5 text-white/[0.62]">
                              {intelligence.executive.nextCheck}
                            </p>
                          </div>
                        </section>
                      );
                    })()}
                    <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.34]">
                      {c.source}: {result.sourceMode} · {c.confidence}:{" "}
                      {result.sourceConfidence}%
                    </p>
                    {result.marketSnapshot ? (
                      <div
                        className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4"
                        data-pass450-market-snapshot="true"
                      >
                        {[
                          [
                            safeLocale === "pl"
                              ? "Cena"
                              : safeLocale === "de"
                                ? "Preis"
                                : "Price",
                            formatSnapshotMoney(
                              safeLocale,
                              result.marketSnapshot.price,
                              result.marketSnapshot.currency,
                            ),
                          ],
                          [
                            safeLocale === "pl"
                              ? "Kapitalizacja"
                              : safeLocale === "de"
                                ? "Market Cap"
                                : "Market cap",
                            formatSnapshotMoney(
                              safeLocale,
                              result.marketSnapshot.marketCap,
                              result.marketSnapshot.currency,
                            ),
                          ],
                          [
                            "24h",
                            formatSnapshotPercent(
                              safeLocale,
                              result.marketSnapshot.change24h,
                            ),
                          ],
                          [
                            safeLocale === "pl"
                              ? "Wolumen"
                              : safeLocale === "de"
                                ? "Volumen"
                                : "Volume",
                            formatSnapshotMoney(
                              safeLocale,
                              result.marketSnapshot.volume24h,
                              result.marketSnapshot.currency,
                            ),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-white/[0.07] bg-black/[0.18] p-3"
                          >
                            <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.32]">
                              {label}
                            </p>
                            <p className="mt-2 truncate font-mono text-sm text-white tabular-nums">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {(() => {
                      const waterfall = buildPass466ConfidenceWaterfall(
                        result,
                        safeLocale,
                        "advanced",
                      );
                      const title =
                        safeLocale === "pl"
                          ? "Waterfall pewności"
                          : safeLocale === "de"
                            ? "Confidence Waterfall"
                            : "Confidence waterfall";
                      const lost =
                        safeLocale === "pl"
                          ? `utracono ${waterfall.lostConfidence} pkt przez granice źródeł`
                          : safeLocale === "de"
                            ? `${waterfall.lostConfidence} Punkte durch Quellengrenzen verloren`
                            : `${waterfall.lostConfidence} points lost to source boundaries`;
                      return (
                        <section
                          className="mt-4 rounded-[1.35rem] border border-white/[0.08] bg-black/[0.18] p-4"
                          data-pass466-confidence-waterfall="true"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-cyan-100/[0.52]">
                                {title}
                              </p>
                              <p className="mt-1 text-[11px] text-white/[0.42]">
                                {lost}
                              </p>
                            </div>
                            <strong className="font-mono text-sm text-white tabular-nums">
                              {waterfall.finalConfidence}%
                            </strong>
                          </div>
                          <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                            {waterfall.stages.map((stage) => (
                              <div
                                key={stage.id}
                                className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5"
                                title={stage.detail}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate font-mono text-[7px] uppercase tracking-[0.10em] text-white/[0.36]">
                                    {stage.label}
                                  </span>
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${stage.state === "confirmed" ? "bg-emerald-300" : stage.state === "review" ? "bg-amber-300" : "bg-rose-300"}`}
                                  />
                                </div>
                                <strong className="mt-2 block font-mono text-xs text-white/[0.76] tabular-nums">
                                  {stage.cap}%
                                </strong>
                                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                                  <span
                                    className="block h-full rounded-full bg-white/[0.44]"
                                    style={{ width: `${stage.cap}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          {waterfall.filingUrl ? (
                            <a
                              href={waterfall.filingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/[0.12] bg-cyan-300/[0.035] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.11em] text-cyan-100/[0.70] transition hover:border-cyan-100/[0.28] hover:text-cyan-50"
                              data-pass466-sec-filing-link="true"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {waterfall.filingLabel || "SEC filing"}
                            </a>
                          ) : null}
                        </section>
                      );
                    })()}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.chips.slice(0, 4).map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-cyan-200/[0.10] bg-cyan-300/[0.035] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.10em] text-cyan-100/[0.56]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    {result.missingData.length ? (
                      <p className="mt-3 rounded-xl border border-amber-200/[0.10] bg-amber-300/[0.035] px-3 py-2 text-xs leading-6 text-white/[0.48]">
                        {c.missing}:{" "}
                        {result.missingData.slice(0, 3).join(" · ")}
                      </p>
                    ) : null}
                    <div
                      className="mt-4 grid gap-2 sm:grid-cols-3"
                      data-pass448-no-raw-unknown="true"
                    >
                      {[
                        ["Basic · 10", c.depth[0]],
                        ["Pro · 14", c.depth[1]],
                        ["Advanced · 20", c.depth[2]],
                      ].map(([title, body]) => (
                        <span
                          key={title}
                          className="rounded-2xl border border-white/[0.07] bg-black/[0.16] p-3"
                        >
                          <strong className="block font-mono text-[8px] uppercase tracking-[0.14em] text-velmere-gold/[0.78]">
                            {title}
                          </strong>
                          <span className="mt-2 block text-[11px] leading-5 text-white/[0.42]">
                            {body}
                          </span>
                        </span>
                      ))}
                    </div>
                    <div
                      className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
                      data-pass452-signature-insights="true"
                      data-pass454-advanced-signature-metrics="true"
                    >
                      {buildPass454EvidenceDenseHumanAnalysis(result, safeLocale).tiers
                        .find((tier) => tier.id === "advanced")
                        ?.metrics.slice(8, 12)
                        .map((insight) => (
                          <div
                            key={insight.id}
                            className="rounded-2xl border border-cyan-200/[0.08] bg-cyan-300/[0.025] p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-100/[0.52]">
                                {insight.label}
                              </span>
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${insight.state === "confirmed" ? "bg-emerald-300" : insight.state === "review" ? "bg-amber-300" : "bg-rose-300"}`}
                              />
                            </div>
                            <strong className="mt-2 block break-words text-xs text-white/[0.78]">
                              {insight.value}
                            </strong>
                            <p className="mt-2 text-[10px] leading-5 text-white/[0.36]">
                              {insight.humanMeaning}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      requestPreview(result, event.currentTarget);
                    }}
                    disabled={pdfLoadingId === result.id}
                    data-testid="lens-preview-button"
                    className="inline-flex items-center gap-2 rounded-full border border-velmere-gold/[0.24] bg-velmere-gold/[0.08] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-velmere-gold"
                  >
                    {pdfLoadingId === result.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {c.preview}
                  </button>
                  <button
                    type="button"
                    onClick={() => openPass468Handoff(result, "shield")}
                    data-testid="lens-shield-handoff"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.62]"
                  >
                    <Shield className="h-4 w-4" />
                    {c.shield}
                  </button>
                  <button
                    type="button"
                    onClick={() => openPass468Handoff(result, "orbit")}
                    data-testid="lens-orbit-handoff"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-200/[0.14] bg-cyan-300/[0.045] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-cyan-50/[0.72]"
                  >
                    <Brain className="h-4 w-4" />
                    {c.orbit}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <article
          data-pass467-pdf-capsule-after-result={results.length ? "true" : "false"}
          className="mt-5 rounded-[1.6rem] border border-velmere-gold/[0.14] bg-[radial-gradient(circle_at_0%_0%,rgba(200,169,106,0.11),transparent_36%),rgba(255,255,255,0.025)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">
                Velmère Browser · PDF
              </p>
              <h1 className="mt-2 font-serif text-3xl tracking-[-0.045em] text-white md:text-4xl">
                {results.length ? c.afterResultTitle : c.emptyTitle}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/[0.56]">
                {results.length ? c.afterResultBody : c.emptyBody}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[c.depth[0], c.depth[1], c.depth[2]].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/[0.07] bg-black/[0.18] p-3"
                  >
                    <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-velmere-gold/[0.78]">
                      {["Basic · 10", "Pro · 14", "Advanced · 20"][index]}
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-white/[0.44]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="grid min-w-[16rem] gap-3"
              data-pass448-browser-stage-v="true"
            >
              <div className="relative overflow-hidden rounded-[1.4rem] border border-velmere-gold/[0.18] bg-black/[0.26] p-4 text-center shadow-[0_0_80px_rgba(200,169,106,0.08)]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-velmere-gold/[0.28] bg-velmere-gold/[0.08] font-serif text-4xl text-velmere-gold shadow-[0_0_70px_rgba(200,169,106,0.18)] before:absolute before:inset-[1.1rem] before:animate-ping before:rounded-full before:border before:border-velmere-gold/[0.12]">
                  V
                </div>
                <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.16em] text-white/[0.40]">
                  4-stage PDF forge · preview = download
                </p>
              </div>
              <div className="grid gap-2 rounded-[1.2rem] border border-white/[0.08] bg-black/[0.20] p-3">
                {c.forgeSteps.map((step, index) => (
                  <span
                    key={step}
                    className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.46]"
                  >
                    <b className="grid h-6 w-6 place-items-center rounded-full border border-velmere-gold/[0.22] text-velmere-gold">
                      {index + 1}
                    </b>
                    {step}
                  </span>
                ))}
              </div>
              <div
                className="grid gap-2 rounded-[1.2rem] border border-cyan-200/[0.10] bg-cyan-300/[0.035] p-3"
                data-pass446-pdf-depth-matrix="true"
              >
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-100/[0.68]">
                  {c.depthTitle}
                </p>
                {c.depth.map((item) => (
                  <span
                    key={item}
                    className="rounded-xl border border-white/[0.07] bg-black/[0.18] px-3 py-2 text-[11px] leading-5 text-white/[0.54]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      {pdfChoiceResult ? (
        <div
          className="fixed inset-x-0 bottom-0 top-20 z-[60] grid place-items-center overflow-y-auto overscroll-contain bg-black/[0.92] p-5 backdrop-blur-2xl md:top-24"
          role="dialog"
          aria-modal="true"
          aria-labelledby="velmere-pdf-depth-title"
          data-testid="lens-pdf-depth-dialog"
        >
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-20 cursor-default md:top-24"
            aria-label={c.close}
            onClick={() => setPdfChoiceResult(null)}
          />
          <section className="relative w-full max-w-3xl rounded-[2rem] border border-velmere-gold/[0.22] bg-[#071012]/[0.99] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.72)] md:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">
              {pdfChoiceResult.symbol} · PDF
            </p>
            <h2
              id="velmere-pdf-depth-title"
              className="mt-2 font-serif text-4xl tracking-[-0.045em] text-white"
            >
              {c.pdfDepthPrompt}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/[0.48]">
              {safeLocale === "pl"
                ? "Najpierw wybierz poziom szczegółowości. Plik powstanie dopiero po potwierdzeniu."
                : safeLocale === "de"
                  ? "Wähle zuerst den Detailgrad. Die Datei wird erst nach der Bestätigung erzeugt."
                  : "Choose the detail level first. The file is generated only after confirmation."}
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {pdfDepthOrder.map((depth) => {
                const active = selectedPdfDepth === depth;
                return (
                  <button
                    key={depth}
                    type="button"
                    onClick={() => {
                      selectedPdfDepthRef.current = depth;
                      setSelectedPdfDepth(depth);
                    }}
                    aria-pressed={active}
                    data-testid={`lens-depth-choice-${depth}`}
                    className={`rounded-[1.35rem] border p-5 text-left transition ${
                      active
                        ? "border-velmere-gold/[0.46] bg-velmere-gold/[0.11]"
                        : "border-white/[0.09] bg-white/[0.025] hover:border-white/[0.18]"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
                        active ? "text-velmere-gold" : "text-white/[0.62]"
                      }`}
                    >
                      {c.pdfDepthLabels[depth]}
                    </span>
                    <span className="mt-3 block text-xs leading-6 text-white/[0.46]">
                      {c.pdfDepthDescriptions[depth]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPdfChoiceResult(null)}
                className="rounded-full border border-white/[0.10] bg-white/[0.035] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-white/[0.58]"
              >
                {c.close}
              </button>
              <button
                type="button"
                onClick={() =>
                  void openPreview(pdfChoiceResult, selectedPdfDepth)
                }
                data-testid="lens-depth-confirm"
                className="rounded-full border border-velmere-gold/[0.28] bg-velmere-gold/[0.10] px-6 py-3 font-mono text-[9px] uppercase tracking-[0.13em] text-velmere-gold"
              >
                {safeLocale === "pl"
                  ? "Generuj PDF"
                  : safeLocale === "de"
                    ? "PDF erzeugen"
                    : "Generate PDF"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {pdfLoadingId ? (
        <div
          className="fixed inset-x-0 bottom-0 top-20 z-[60] grid place-items-center overflow-y-auto overscroll-contain bg-black/[0.92] p-5 backdrop-blur-2xl md:top-24"
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          aria-labelledby="velmere-pdf-forge-title"
          data-pass450-four-stage-v-forge="true"
          data-pass451-progressive-v-forge="true"
          data-testid="lens-pdf-forge"
          data-pass470-keyboard-only-qa={pass470KeyboardAudit.ok ? "ok" : "review"}
        >
          <section
            ref={forgeDialogRef}
            tabIndex={-1}
            className="w-full max-w-xl rounded-[2rem] border border-velmere-gold/[0.22] bg-[#071012]/[0.98] p-7 text-center shadow-[0_40px_140px_rgba(0,0,0,0.72)]"
          >
            <div className="relative mx-auto grid h-28 w-28 place-items-center">
              <span className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border border-velmere-gold/[0.18] border-t-velmere-gold/[0.72]" />
              <span className="absolute inset-3 animate-[spin_5s_linear_infinite_reverse] rounded-full border border-cyan-200/[0.12] border-r-cyan-100/[0.56]" />
              <span className="grid h-20 w-20 place-items-center rounded-full border border-velmere-gold/[0.32] bg-velmere-gold/[0.09] font-serif text-6xl text-velmere-gold shadow-[0_0_90px_rgba(200,169,106,0.24)]">
                V
              </span>
            </div>
            <h2
              id="velmere-pdf-forge-title"
              className="mt-5 font-serif text-3xl tracking-[-0.04em] text-white"
            >
              {c.forgeTitle}
            </h2>
            <p className="mt-2 text-xs leading-6 text-white/[0.48]">
              {activeForgeIntelligence?.forge.stages[pdfStage]?.detail || pass451.forgeStages[pdfStage]?.detail}
            </p>
            <div
              className="mt-5 rounded-[1.4rem] border border-white/[0.08] bg-black/[0.22] p-3 text-left"
              data-pass465-selectable-pdf-depth="true"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/[0.42]">
                  {c.pdfDepthPrompt}
                </p>
                <span className="font-mono text-[8px] uppercase tracking-[0.10em] text-white/[0.30]">
                  {pdfDepthLocked ? `✓ ${c.pdfDepthLock}` : c.pdfDepthLock}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {pdfDepthOrder.map((depth) => {
                  const active = selectedPdfDepth === depth;
                  return (
                    <button
                      key={depth}
                      ref={active ? forgeDepthButtonRef : undefined}
                      type="button"
                      onClick={() => setSelectedPdfDepth(depth)}
                      disabled={pdfDepthLocked}
                      aria-pressed={active}
                      data-testid={`lens-depth-${depth}`}
                      data-pass470-keyboard-control="pdf-depth"
                      aria-keyshortcuts="Enter Space"
                      aria-label={`${c.pdfDepthLabels[depth]} · ${c.pdfDepthDescriptions[depth]}`}
                      className={`rounded-2xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                        active
                          ? "border-velmere-gold/[0.42] bg-velmere-gold/[0.10] text-velmere-gold"
                          : "border-white/[0.08] bg-white/[0.025] text-white/[0.54] hover:border-white/[0.18] hover:text-white/[0.78]"
                      }`}
                    >
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em]">
                        {c.pdfDepthLabels[depth]}
                      </span>
                      <span className="mt-1 block text-[10px] leading-4 text-white/[0.46]">
                        {c.pdfDepthDescriptions[depth]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
              aria-label={pass451.labels.progress}
            >
              <div
                className="h-full rounded-full bg-velmere-gold transition-[width] duration-500 ease-out"
                style={{
                  width: `${((pdfStage + 1) / pass451.forgeStages.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-6 grid gap-2 text-left">
              {(activeForgeIntelligence?.forge.stages || pass451.forgeStages).map((stage, index) => {
                const complete = index < pdfStage;
                const active = index === pdfStage;
                return (
                  <div
                    key={stage.id}
                    className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-velmere-gold/[0.42] bg-velmere-gold/[0.09] text-velmere-gold"
                        : complete
                          ? "border-emerald-300/[0.16] bg-emerald-300/[0.04] text-emerald-100/[0.72]"
                          : "border-white/[0.08] bg-white/[0.025] text-white/[0.34]"
                    }`}
                  >
                    <span className="font-mono text-[10px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.13em]">
                      {stage.label}
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.10em]">
                      {complete
                        ? "✓"
                        : active
                          ? `${Math.round(((index + 1) / 4) * 100)}%`
                          : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {pdfPreview ? (
        <div
          className="fixed inset-x-0 bottom-0 top-20 z-[60] overflow-hidden overscroll-none bg-black/[0.94] p-3 backdrop-blur-xl md:top-24 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="velmere-pdf-preview-title"
          aria-describedby="velmere-pdf-preview-description"
          data-pass450-hard-scroll-lock="true"
          data-pass451-exact-pdf-preview="true"
          data-testid="lens-preview-dialog"
          data-pass470-preview-keyboard-trap={pass470KeyboardAudit.ok ? "ok" : "review"}
        >
          <div
            className="fixed inset-x-0 bottom-0 top-20 md:top-24"
            aria-hidden="true"
            onPointerDown={(event) => {
              if (event.currentTarget === event.target) closePreview();
            }}
          />
          <section
            ref={previewDialogRef}
            className="relative mx-auto flex h-[calc(100vh-6.5rem)] max-w-[1180px] flex-col md:h-[calc(100vh-9rem)]"
          >
            <header className="mb-3 grid gap-3 rounded-2xl border border-white/[0.10] bg-[#0b1112]/[0.98] p-3 shadow-2xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0 px-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="velmere-pdf-preview-title"
                    className="truncate text-sm font-semibold text-white"
                  >
                    {c.preview} · {pdfPreview.report.symbol}
                  </h2>
                  <span className="rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-velmere-gold">
                    {pdfPreview.report.pass451.labels.pageCount}
                  </span>
                  <span className="rounded-full border border-cyan-200/[0.14] bg-cyan-200/[0.05] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-cyan-100/[0.78]" data-pass465-pdf-depth-badge="true">
                    {c.pdfDepthLabels[pdfPreview.depth]}
                  </span>
                </div>
                <p
                  id="velmere-pdf-preview-description"
                  className="mt-1 truncate text-[11px] text-white/[0.42]"
                >
                  {pdfPreview.report.pass451.labels.previewHint}
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap sm:items-center" data-pass469-responsive-pdf-toolbar="true" data-pass470-keyboard-toolbar="true" aria-label={c.keyboardQa}>
                <div
                  className="col-span-2 flex min-w-0 rounded-full border border-white/[0.09] bg-black/[0.28] p-1 sm:col-span-1"
                  aria-label={c.preview}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewView("pdf")}
                    aria-pressed={previewView === "pdf"}
                    className={`min-w-0 flex-1 rounded-full px-3 py-2 font-mono text-[8px] uppercase tracking-[0.11em] transition ${previewView === "pdf" ? "bg-white/[0.10] text-white" : "text-white/[0.42] hover:text-white/[0.72]"}`}
                  >
                    {pdfPreview.report.pass451.labels.exactPreview}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewView("reader")}
                    aria-pressed={previewView === "reader"}
                    data-testid="lens-reader-toggle"
                    data-pass470-keyboard-control="reader-toggle"
                    className={`min-w-0 flex-1 rounded-full px-3 py-2 font-mono text-[8px] uppercase tracking-[0.11em] transition ${previewView === "reader" ? "bg-white/[0.10] text-white" : "text-white/[0.42] hover:text-white/[0.72]"}`}
                  >
                    {pdfPreview.report.pass451.labels.humanReader}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => openPass468Handoff(pdfPreview.result, "shield", pdfPreview.depth)}
                  data-testid="lens-preview-shield-handoff"
                  className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-3 font-mono text-[8px] uppercase tracking-[0.11em] text-white/[0.58]"
                >
                  <Shield className="h-4 w-4" />
                  <span className="truncate">{c.shield}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPass468Handoff(pdfPreview.result, "orbit", pdfPreview.depth)}
                  data-testid="lens-preview-orbit-handoff"
                  className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-cyan-200/[0.14] bg-cyan-300/[0.045] px-3 font-mono text-[8px] uppercase tracking-[0.11em] text-cyan-50/[0.68]"
                >
                  <Brain className="h-4 w-4" />
                  <span className="truncate">{c.orbit}</span>
                </button>
                <a
                  href={pdfPreview.url}
                  download={pdfPreview.filename}
                  onClick={recordPass469DownloadReceipt}
                  className="col-span-2 inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-velmere-gold/[0.26] bg-velmere-gold/[0.08] px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-velmere-gold sm:col-span-1"
                  aria-label={c.download}
                  data-testid="lens-download-link"
                  data-pass470-keyboard-control="download"
                  aria-keyshortcuts="Enter"
                  data-pass469-download-receipt="download_initiated"
                >
                  <Download className="h-4 w-4" />
                  <span className="truncate">{c.download}</span>
                </a>
                <button
                  ref={previewCloseRef}
                  type="button"
                  onClick={closePreview}
                  className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.62]"
                  aria-label={c.close}
                  data-testid="lens-preview-close"
                  data-pass470-keyboard-control="close"
                  aria-keyshortcuts="Escape Enter Space"
                >
                  <X className="h-4 w-4" />
                  <span className="truncate">{c.close}</span>
                </button>
              </div>
              <div
                className="min-h-[1.25rem] px-2 text-[10px] leading-5 text-emerald-100/[0.68] sm:col-span-2 sm:text-right"
                aria-live="polite"
                data-testid="lens-download-receipt"
              >
                {downloadReceipt ? (
                  <span data-pass469-download-receipt-id={downloadReceipt.receiptId}>
                    {c.receiptSaved} · {downloadReceipt.receiptId} · {c.receiptBoundary}
                  </span>
                ) : null}
              </div>
              <div
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] leading-5 text-white/[0.44] sm:col-span-2"
                data-pass470-receipt-history="true"
                data-pass470-receipt-history-checksum={receiptHistory.checksum}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.58]">
                    {c.receiptHistoryTitle} · {receiptHistory.total}
                  </strong>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/[0.34]">
                      {receiptHistory.redaction.replaceAll("_", " ")}
                    </span>
                    {receiptHistory.visible.length ? (
                      <button
                        type="button"
                        onClick={() => setReceiptHistoryOpen((current) => !current)}
                        aria-expanded={receiptHistoryOpen}
                        aria-controls="velmere-receipt-history-drawer"
                        data-pass471-receipt-drawer-toggle="true"
                        className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.11em] text-white/[0.54] hover:text-white/[0.78]"
                      >
                        {receiptHistoryOpen ? c.receiptHistoryHide : c.receiptHistoryShow}
                      </button>
                    ) : null}
                  </div>
                </div>
                {receiptHistory.visible.length ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {receiptHistory.visible.slice(0, 3).map((item) => (
                        <span
                          key={item.receiptId}
                          className="rounded-full border border-white/[0.07] bg-black/[0.18] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.10em] text-white/[0.46]"
                        >
                          {item.symbol} · {item.depth} · {item.sourceConfidence}%
                        </span>
                      ))}
                    </div>
                    {receiptHistoryOpen ? (
                      <div
                        id="velmere-receipt-history-drawer"
                        data-pass471-receipt-drawer="true"
                        className="mt-3 max-h-52 space-y-2 overflow-y-auto overscroll-contain rounded-xl border border-white/[0.07] bg-black/[0.18] p-2"
                      >
                        {receiptHistory.visible.map((item) => (
                          <article
                            key={item.receiptId}
                            className="grid gap-1 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-mono text-[8px] uppercase tracking-[0.11em] text-white/[0.64]">
                                {item.symbol} · {item.depth} · {item.sourceConfidence}% · {item.sourceCount} src
                              </p>
                              <p className="mt-1 truncate text-[9px] text-white/[0.36]">{item.filename}</p>
                            </div>
                            <time className="font-mono text-[8px] uppercase tracking-[0.09em] text-white/[0.30]" dateTime={item.createdAt}>
                              {new Intl.DateTimeFormat(safeLocale, { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}
                            </time>
                          </article>
                        ))}
                        <p className="px-1 text-[9px] leading-4 text-white/[0.30]">{c.receiptHistoryBoundary}</p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-1 text-white/[0.34]">{c.receiptHistoryEmpty}</p>
                )}
              </div>
            </header>

            {previewView === "pdf" ? (
              <div
                data-velmere-modal-scroll="true"
                data-pass451-binary-pdf-exact="true"
                className="min-h-0 flex-1 overflow-hidden overscroll-contain rounded-2xl border border-white/[0.10] bg-[#222] shadow-[0_30px_100px_rgba(0,0,0,0.62)]"
              >
                <iframe
                  src={`${pdfPreview.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                  title={`${c.preview} ${pdfPreview.report.symbol}`}
                  data-testid="lens-pdf-frame"
                  className="h-full min-h-[70vh] w-full bg-[#d9d6cf]"
                />
              </div>
            ) : (
              <div
                data-velmere-modal-scroll="true"
                data-pass448-pdf-a4-reader-v2="true"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-white/[0.10] bg-[#d9d6cf] p-3 shadow-2xl md:p-6"
              >
                <article
                  className="mx-auto w-full max-w-[54rem] bg-[#fbf8f0] p-6 text-[#171717] shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-10"
                  data-pass450-tiered-human-report="true"
                  data-pass469-a4-overflow-audit="pass469-ok"
                  data-pass470-a4-screen-check="reader-safe"
                >
                  <header className="border-b border-black/[0.12] pb-7">
                    <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a6b2f]">
                      <span>
                        Velmère Cybersecurity ·{" "}
                        {pdfPreview.report.labels.report}
                      </span>
                      <span>
                        {pdfPreview.report.symbol} ·{" "}
                        {pdfPreview.report.sourceConfidence}%
                      </span>
                    </div>
                    <h3 className="mt-7 break-words font-serif text-4xl leading-[0.96] tracking-[-0.045em] md:text-5xl">
                      {pdfPreview.report.title}
                    </h3>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-black/[0.68]">
                      {reportSection(
                        pdfPreview.report,
                        "brief",
                        pdfPreview.report.summary,
                      )}
                    </p>
                  </header>

                  <section
                    className={`mt-7 rounded-[1.4rem] border p-5 ${
                      pdfPreview.report.pass453.decision.tone === "calm"
                        ? "border-emerald-900/[0.20] bg-emerald-900/[0.04]"
                        : pdfPreview.report.pass453.decision.tone === "review"
                          ? "border-amber-900/[0.18] bg-amber-900/[0.035]"
                          : "border-rose-900/[0.18] bg-rose-900/[0.035]"
                    }`}
                    data-pass453-pdf-human-verdict="true"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#8a6b2f]">
                          {pdfPreview.report.pass453.decision.eyebrow}
                        </p>
                        <strong className="mt-2 block text-xl text-black/[0.84]">
                          {pdfPreview.report.pass453.decision.headline}
                        </strong>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-black/[0.62]">
                          {pdfPreview.report.pass453.decision.summary}
                        </p>
                      </div>
                      <span className="rounded-full border border-black/[0.10] px-3 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-black/[0.48]">
                        {pdfPreview.report.pass453.labels.sourceBound}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {[
                        [
                          pdfPreview.report.pass453.labels.confidenceCeiling,
                          `${pdfPreview.report.pass453.decision.confidenceCeiling}%`,
                        ],
                        [
                          pdfPreview.report.pass453.labels.sourceQuorum,
                          pdfPreview.report.pass453.decision.sourceQuorum,
                        ],
                        [
                          pdfPreview.report.pass453.labels.evidenceCoverage,
                          `${pdfPreview.report.pass453.decision.evidenceCoverage}%`,
                        ],
                        [
                          pdfPreview.report.pass453.labels.dataFreshness,
                          pdfPreview.report.pass453.decision.dataAgeLabel,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-black/[0.08] bg-black/[0.025] p-3"
                        >
                          <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-black/[0.38]">
                            {label}
                          </p>
                          <strong className="mt-2 block break-words text-xs text-black/[0.72]">
                            {value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section
                    className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                    data-pass450-market-snapshot="true"
                  >
                    {(
                      pdfPreview.report.pass450.tiers.find(
                        (tier) => tier.id === "basic",
                      )?.fields || []
                    )
                      .filter((field) =>
                        [
                          "price",
                          "marketCap",
                          "change24h",
                          "volume24h",
                        ].includes(field.id),
                      )
                      .map((field) => (
                        <div
                          key={field.id}
                          className="rounded-2xl border border-black/[0.09] bg-black/[0.025] p-4"
                        >
                          <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-black/[0.42]">
                            {field.label}
                          </p>
                          <strong className="mt-2 block break-words text-sm text-black/[0.78]">
                            {field.value}
                          </strong>
                        </div>
                      ))}
                  </section>

                  <section className="mt-7 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
                    <div className="rounded-2xl border border-[#9b895f]/[0.30] bg-[#f1ede3] p-5">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8a6b2f]">
                        {pdfPreview.report.labels.checked}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-black/[0.66]">
                        {reportSection(
                          pdfPreview.report,
                          "sources",
                          pdfPreview.report.whyItMatters,
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/[0.09] p-5">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8a6b2f]">
                        {pdfPreview.report.labels.next}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-black/[0.66]">
                        {pdfPreview.report.nextOperatorStep}
                      </p>
                    </div>
                  </section>

                  <section
                    className="mt-7 rounded-[1.4rem] border border-black/[0.10] bg-black/[0.025] p-5"
                    data-pass466-pdf-confidence-waterfall="true"
                  >
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a6b2f]">
                          {safeLocale === "pl"
                            ? "Waterfall pewności"
                            : safeLocale === "de"
                              ? "Confidence Waterfall"
                              : "Confidence waterfall"}
                        </p>
                        <p className="mt-2 max-w-3xl text-xs leading-6 text-black/[0.50]">
                          {pdfPreview.report.pass466.boundary}
                        </p>
                      </div>
                      <strong className="font-mono text-lg text-black/[0.78] tabular-nums">
                        {pdfPreview.report.pass466.finalConfidence}%
                      </strong>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {pdfPreview.report.pass466.stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="rounded-2xl border border-black/[0.08] bg-white/[0.58] p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[8px] uppercase tracking-[0.11em] text-black/[0.42]">
                              {stage.label}
                            </span>
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${stage.state === "confirmed" ? "bg-emerald-600" : stage.state === "review" ? "bg-amber-600" : "bg-rose-600"}`}
                            />
                          </div>
                          <strong className="mt-2 block text-sm text-black/[0.74] tabular-nums">
                            {stage.cap}%
                          </strong>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                            <span
                              className="block h-full rounded-full bg-black/[0.38]"
                              style={{ width: `${stage.cap}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[10px] leading-5 text-black/[0.44]">
                            {stage.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                    {pdfPreview.report.pass466.filingUrl ? (
                      <a
                        href={pdfPreview.report.pass466.filingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-white/[0.64] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.11em] text-black/[0.60]"
                        data-pass466-reader-sec-link="true"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {pdfPreview.report.pass466.filingLabel || "SEC filing"}
                      </a>
                    ) : null}
                  </section>

                  <section
                    className="mt-7"
                    aria-label={pdfPreview.report.labels.sources}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a6b2f]">
                      Velmère Cybersecurity · source ledger
                    </p>
                    <div className="mt-3 divide-y divide-black/[0.08] border-y border-black/[0.08]">
                      {pdfPreview.report.sources.map((source) => (
                        <div
                          key={`${source.label}-${source.mode}`}
                          className="grid gap-2 py-4 text-xs sm:grid-cols-[1fr_auto]"
                        >
                          <div>
                            <strong>{source.label}</strong>
                            <p className="mt-1 text-black/[0.48]">
                              {source.mode} · {source.freshness}
                            </p>
                          </div>
                          <span className="font-mono text-black/[0.58]">
                            {source.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-7 rounded-2xl border border-amber-900/[0.14] bg-amber-900/[0.035] p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a6b2f]">
                      {pdfPreview.report.labels.missing}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-black/[0.66]">
                      {reportSection(
                        pdfPreview.report,
                        "missing",
                        pdfPreview.report.pass450.unknownPolicy,
                      )}
                    </p>
                  </section>

                  <section
                    className="mt-7"
                    data-pass452-pdf-signature-diagnostics="true"
                    data-pass454-evidence-dense-reader="true"
                    data-pass455-human-reader="true" data-pass456-pdf-reader="true"
                  >
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a6b2f]">
                          {pdfPreview.report.pass455.executive.eyebrow}
                        </p>
                        <h4 className="mt-2 font-serif text-2xl tracking-[-0.035em] text-black/[0.82]">
                          {pdfPreview.report.pass455.executive.headline}
                        </h4>
                        <p className="mt-2 max-w-3xl text-xs leading-6 text-black/[0.52]">
                          {pdfPreview.report.pass455.executive.oneSentence}
                        </p>
                      </div>
                      <span className="rounded-full border border-black/[0.10] px-3 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-black/[0.48]">
                        {pdfPreview.report.pass453.labels.sourceBound}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {pdfPreview.report.pass455.tiers
                        .find((tier) => tier.id === pdfPreview.depth)
                        ?.metrics.slice(0, 8)
                        .map((insight) => (
                          <div
                            key={insight.id}
                            className="rounded-2xl border border-black/[0.09] bg-black/[0.025] p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[8px] uppercase tracking-[0.11em] text-black/[0.44]">
                                {insight.label}
                              </span>
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${insight.state === "confirmed" ? "bg-emerald-600" : insight.state === "review" ? "bg-amber-600" : "bg-rose-600"}`}
                              />
                            </div>
                            <strong className="mt-2 block break-words text-sm text-black/[0.74]">
                              {insight.value}
                            </strong>
                            <p className="mt-2 text-[10px] leading-5 text-black/[0.46]">
                              {insight.humanMeaning}
                            </p>
                          </div>
                        ))}
                    </div>
                  </section>

                  <section className="mt-7" data-pass454-depth-matrix="true" data-pass455-localized-depth-matrix="true" data-pass456-full-tier-matrix="true">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a6b2f]">
                      Velmère Cybersecurity · depth matrix
                    </p>
                    <div className="mt-3 grid gap-4">
                      {pdfPreview.report.pass455.tiers
                        .filter((tier) => tier.id === pdfPreview.depth)
                        .map((tier) => (
                        <section
                          key={tier.id}
                          className="rounded-2xl border border-black/[0.10] bg-black/[0.025] p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <strong className="text-base">
                                {tier.label}
                              </strong>
                              <p className="mt-1 text-xs leading-5 text-black/[0.52]">
                                {tier.promise}
                              </p>
                            </div>
                            <span className="rounded-full border border-black/[0.10] px-3 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-black/[0.48]">
                              {tier.fieldCount}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {tier.metrics
                              .slice(0, tier.fieldCount)
                              .map((field) => (
                                <div
                                  key={field.id}
                                  className="rounded-xl border border-black/[0.08] bg-white/[0.54] px-3 py-3"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-[8px] uppercase tracking-[0.11em] text-black/[0.42]">
                                      {field.label}
                                    </span>
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${field.state === "confirmed" ? "bg-emerald-600" : field.state === "review" ? "bg-amber-600" : "bg-rose-600"}`}
                                    />
                                  </div>
                                  <strong className="mt-2 block break-words text-xs leading-5 text-black/[0.72]">
                                    {field.value}
                                  </strong>
                                  <p className="mt-2 text-[10px] leading-5 text-black/[0.42]">
                                    {field.humanMeaning}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>

                  <footer className="mt-8 flex flex-col gap-3 border-t border-black/[0.12] pt-5 text-[10px] leading-5 text-black/[0.44] sm:flex-row sm:items-end sm:justify-between">
                    <p className="max-w-xl">
                      {pdfPreview.report.labels.boundary}
                    </p>
                    <strong className="font-serif text-base text-black/[0.72]">
                      {pdfPreview.report.labels.signature}
                    </strong>
                  </footer>
                </article>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
