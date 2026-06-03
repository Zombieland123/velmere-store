"use client";

// Legacy guard marker: Velmère Intelligence Search. Public UX is now Velmère Lens.
// PASS175 safe boundary marker: not financial advice / safety certificate.

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { ArrowRight, Brain, Database, FileSearch, Loader2, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@/navigation";
import VelmereSearchDiscoveryRail from "@/components/search/VelmereSearchDiscoveryRail";
import VelmereLensCommandRouter from "@/components/search/VelmereLensCommandRouter";
import type { VelmereSearchMode, VelmereSearchResult } from "@/lib/search/intelligence-search-contract";

type SearchResponse = {
  ok: boolean;
  mode: string;
  boundary: string;
  query: string;
  generatedAt: string;
  productionBoundary: string;
  results: VelmereSearchResult[];
};

type Locale = "pl" | "de" | "en";

const copy = {
  pl: {
    eyebrow: "Velmère Lens",
    title: "Wpisz token, a Lens pokaże kapsułę i drogę do Shield.",
    body: "Lens nie jest drugą analizą. To szybkie wejście: rozpoznaje token, kontrakt albo temat, pokazuje krótką kapsułę i prowadzi do właściwego modułu.",
    placeholder: "Szukaj: SOL, BTC, kontrakt, VLM, Shield...",
    cta: "Skanuj",
    loading: "Analizuję źródła",
    empty: "Wpisz token albo temat, żeby zobaczyć kapsułę Lens.",
    full: "Pełna analiza Shield",
    bridge: "Most do Shield",
    capsule: "Kapsuła VLM",
    why: "Dlaczego to ma znaczenie",
    missing: "Brakujące dane",
    next: "Następny krok operatora",
    source: "source",
    confidence: "confidence",
    boundary: "Lens jest routerem researchu i krótką kapsułą, nie pełnym Shieldem ani certyfikatem bezpieczeństwa.",
    modes: {
      all: "Wszystko",
      token: "Tokeny",
      contract: "Kontrakty",
      velmere: "Velmère",
      osint: "OSINT",
    },
  },
  de: {
    eyebrow: "Velmère Lens",
    title: "Gib einen Token ein; Lens zeigt Kapsel und Weg zu Shield.",
    body: "Lens ist keine zweite Analyse. Es erkennt Token, Contract oder Thema, zeigt eine kurze Kapsel und führt zum richtigen Modul.",
    placeholder: "Suche: SOL, BTC, Contract, VLM, Shield...",
    cta: "Scannen",
    loading: "Quellen werden analysiert",
    empty: "Gib Token oder Thema ein, um eine Lens-Kapsel zu sehen.",
    full: "Volle Shield Analyse",
    bridge: "Bridge zu Shield",
    capsule: "VLM Kapsel",
    why: "Warum es wichtig ist",
    missing: "Fehlende Daten",
    next: "Nächster Operator-Schritt",
    source: "source",
    confidence: "confidence",
    boundary: "Lens ist Router und kurze Research-Kapsel, nicht vollständiges Shield und kein Sicherheitszertifikat.",
    modes: {
      all: "Alles",
      token: "Token",
      contract: "Contracts",
      velmere: "Velmère",
      osint: "OSINT",
    },
  },
  en: {
    eyebrow: "Velmère Lens",
    title: "Enter a token; Lens shows a capsule and the route to Shield.",
    body: "Lens is not a second analysis. It recognizes a token, contract or topic, shows a compact capsule and routes to the right module.",
    placeholder: "Search: SOL, BTC, contract, VLM, Shield...",
    cta: "Scan",
    loading: "Analyzing sources",
    empty: "Enter a token or topic to see a Lens capsule.",
    full: "Full Shield analysis",
    bridge: "Shield bridge",
    capsule: "VLM capsule",
    why: "Why it matters",
    missing: "Missing data",
    next: "Next operator step",
    source: "source",
    confidence: "confidence",
    boundary: "Lens is a research router and compact capsule, not full Shield and not a safety certificate.",
    modes: {
      all: "All",
      token: "Tokens",
      contract: "Contracts",
      velmere: "Velmère",
      osint: "OSINT",
    },
  },
} as const;

const modeOrder: VelmereSearchMode[] = ["all", "token", "contract", "velmere", "osint"];

function resolveLocale(locale: string): Locale {
  return locale === "pl" || locale === "de" || locale === "en" ? locale : "en";
}

function modeBadge(mode: string) {
  if (mode === "live" || mode === "live_table") return "vis-source-live";
  if (mode === "table") return "vis-source-table";
  if (mode === "fallback") return "vis-source-fallback";
  return "vis-source-missing";
}

function toneClass(tone: string) {
  if (tone === "calm") return "vis-tone-calm";
  if (tone === "elevated") return "vis-tone-elevated";
  if (tone === "blocked") return "vis-tone-blocked";
  return "vis-tone-review";
}

function fallbackInitial(result: VelmereSearchResult) {
  return (result.avatarLabel ?? result.symbol ?? result.title).slice(0, 4).toUpperCase();
}

export default function VelmereIntelligenceSearchClient({ locale }: { locale: string }) {
  const c = copy[resolveLocale(locale)];
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<VelmereSearchMode>("all");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleResults = useMemo(() => response?.results ?? [], [response]);

  function runSearch(nextQuery = query, nextMode = mode) {
    const clean = nextQuery.trim();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(clean)}&mode=${encodeURIComponent(nextMode)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.reason ?? "Search blocked");
          return;
        }
        setResponse(data);
      } catch {
        setError("Search gateway unavailable");
      }
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function changeMode(nextMode: VelmereSearchMode) {
    setMode(nextMode);
    if (query.trim() || response) runSearch(query, nextMode);
  }

  return (
    <main className="min-h-screen bg-velmere-black text-velmere-ivory">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:px-12 md:pb-24 md:pt-32">
        <div className="vis-hero">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.065] px-3 py-1.5 text-velmere-gold">
              <Radar className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{c.eyebrow}</span>
            </div>
            <h1 className="mt-6 font-serif text-5xl leading-none tracking-[-0.055em] text-white md:text-7xl">{c.title}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/[0.58]">{c.body}</p>
          </div>

          <form onSubmit={onSubmit} className="vis-search-shell">
            <div className="vis-search-input-row">
              <Brain className="h-5 w-5 text-velmere-gold" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={c.placeholder}
                className="vis-search-input"
                autoComplete="off"
              />
              <button type="submit" className="vis-search-button" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                <span>{c.cta}</span>
              </button>
            </div>
            <div className="vis-mode-row">
              {modeOrder.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeMode(item)}
                  className={`vis-mode-chip ${mode === item ? "vis-mode-chip-active" : ""}`}
                >
                  {c.modes[item]}
                </button>
              ))}
            </div>
          </form>

          <p className="mt-4 text-xs leading-6 text-white/[0.42]">{c.boundary}</p>
        </div>

        <div className="mt-8 grid gap-6">
          <VelmereLensCommandRouter locale={locale} />
          <VelmereSearchDiscoveryRail locale={locale} />
        </div>

        {error ? (
          <div className="vis-error">{error}</div>
        ) : null}

        <section className="mt-10 grid gap-4">
          {isPending ? (
            <div className="vis-empty">
              <Loader2 className="h-5 w-5 animate-spin text-velmere-gold" aria-hidden="true" />
              <span>{c.loading}</span>
            </div>
          ) : visibleResults.length ? (
            visibleResults.map((result) => (
              <article key={result.id} className="vis-result-card">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`vis-token-avatar ${toneClass(result.tone)}`}>
                        {result.avatarImage ? (
                          <span
                            className="vis-token-avatar-image"
                            aria-hidden="true"
                            style={{ backgroundImage: `url(${result.avatarImage})` }}
                          />
                        ) : (
                          fallbackInitial(result)
                        )}
                      </span>
                      <span className="vis-category">{result.category}</span>
                      <span className={`vis-source-badge ${modeBadge(result.sourceMode)}`}>{result.sourceMode.replace("_", " + ")}</span>
                      <span className="vis-confidence">{c.confidence} · {result.sourceConfidence}%</span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white md:text-3xl">
                      {result.title}{result.symbol ? <span className="ml-2 font-mono text-sm text-velmere-gold">{result.symbol}</span> : null}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/[0.62]">{result.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.chips.map((chip) => <span key={chip} className="vis-soft-chip">{chip}</span>)}
                    </div>
                  </div>

                  <div className="vis-bridge-box">
                    <p>{c.bridge}</p>
                    <span>{result.bridge?.note ?? c.capsule}</span>
                    <span className="vis-live-adapter-note">live adapters · preview skeleton</span>
                    <Link href={result.bridge?.href ?? result.shieldHref} className="vis-shield-link">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      <span>{c.full}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 lg:grid-cols-3">
                  <div className="vis-info-box">
                    <p>{c.why}</p>
                    <span>{result.whyItMatters}</span>
                  </div>
                  <div className="vis-info-box">
                    <p>{c.missing}</p>
                    <span>{result.missingData.join(" · ")}</span>
                  </div>
                  <div className="vis-info-box">
                    <p>{c.next}</p>
                    <span>{result.nextOperatorStep}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 md:grid-cols-2">
                  {result.sources.map((source) => (
                    <div key={source.id} className="vis-source-row">
                      <Database className="h-4 w-4 text-velmere-gold" aria-hidden="true" />
                      <div className="min-w-0">
                        <p>{source.label}</p>
                        <span>{c.source}: {source.mode} · {source.freshness} · {source.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="vis-empty">
              <FileSearch className="h-5 w-5 text-velmere-gold" aria-hidden="true" />
              <span>{c.empty}</span>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
