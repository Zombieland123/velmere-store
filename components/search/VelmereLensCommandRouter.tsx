import { BookOpen, FileSearch, Network, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { velmereLensRoutes } from "@/lib/search/velmere-lens-route-map";

type Locale = "pl" | "de" | "en";

const copy = {
  pl: {
    eyebrow: "Velmère Lens",
    title: "Wyszukiwarka Velmère zbiera token, kontekst i drogę do raportu.",
    body: "Lens rozpoznaje token, kontrakt albo temat, pokazuje krótką kapsułę i przygotowuje ścieżkę do raportu PDF oraz pełnego modułu Shield.",
    open: "Otwórz",
    report: "Raport PDF-ready",
    previewTitle: "Kapsuła raportu Velmère",
    previewBody: "Lens przygotuje kapsułę raportu: opis tokena, ścieżkę do Shield, stan źródeł, braki danych i następny krok operatora.",
    previewCta: "Podgląd raportu",
    missing: "do dopięcia przed pełnym raportem",
    boundary: "Lens porządkuje research i skraca drogę do pełnego raportu.",
  },
  de: {
    eyebrow: "Velmère Lens",
    title: "Velmère Search sammelt Token, Kontext und Report-Pfad.",
    body: "Lens erkennt Token, Contract oder Thema, zeigt eine kurze Kapsel und bereitet den Pfad zum PDF-Report und zum Shield-Modul vor.",
    open: "Öffnen",
    report: "PDF-ready Report",
    previewTitle: "Velmère report capsule",
    previewBody: "Lens erstellt eine Report-Kapsel: Token-Beschreibung, Shield-Pfad, Quellenstatus, Datenlücken und nächster Operator-Schritt.",
    previewCta: "Report preview",
    missing: "vor vollständigem Report fehlt",
    boundary: "Lens ordnet Research und verkürzt den Weg zum vollständigen Report.",
  },
  en: {
    eyebrow: "Velmère Lens",
    title: "Velmère Search collects the token, context and report path.",
    body: "Lens recognizes a token, contract or topic, shows a short capsule and prepares the path to a PDF report and full Shield module.",
    open: "Open",
    report: "PDF-ready report",
    previewTitle: "Velmère report capsule",
    previewBody: "Lens erstellt eine Report-Kapsel: Token-Beschreibung, Shield-Pfad, Quellenstatus, Datenlücken und nächster Operator-Schritt.",
    previewCta: "Report preview",
    missing: "to complete before full report",
    boundary: "Lens organizes research and shortens the path to the full report.",
  },
} as const;

const iconMap = {
  shield: ShieldCheck,
  contract_lens: FileSearch,
  vlm_access: WalletCards,
  velmere_docs: BookOpen,
  osint_queue: Network,
  source_ledger: Sparkles,
} as const;

function resolveLocale(locale: string): Locale {
  return locale === "pl" || locale === "de" || locale === "en" ? locale : "en";
}

export default function VelmereLensCommandRouter({ locale }: { locale: string }) {
  const c = copy[resolveLocale(locale)];

  return (
    <section className="vlcr-shell" aria-label={c.eyebrow}>
      <div className="max-w-3xl">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-velmere-gold">{c.eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl leading-none tracking-[-0.045em] text-white md:text-5xl">{c.title}</h2>
        <p className="mt-4 text-sm leading-7 text-white/[0.58]">{c.body}</p>
        <p className="mt-4 inline-flex rounded-full border border-cyan-200/[0.12] bg-cyan-300/[0.04] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-cyan-100/[0.64]">
          {c.boundary}
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {velmereLensRoutes.map((route) => {
          const Icon = iconMap[route.id] ?? ShieldCheck;
          return (
            <article key={route.id} className="vlcr-card">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.075] text-velmere-gold">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="vlcr-priority">{route.priority}</span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/[0.36]">{route.capsuleRole}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white/[0.88]">{route.label}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/[0.56]">{route.whatItDoes}</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-velmere-gold/[0.64]">{route.reportTitle}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/[0.20] p-3">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/[0.34]">{c.missing}</p>
                <p className="mt-2 text-[11px] leading-5 text-white/[0.50]">{route.missingBeforeFullTrust.join(" · ")}</p>
              </div>

            </article>
          );
        })}
      </div>

      <div className="vlcr-report-preview">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">{c.previewTitle}</p>
        <p className="mt-2 text-sm leading-6 text-white/[0.58]">{c.previewBody}</p>

      </div>
    </section>
  );
}

// PASS193 compatibility markers retained after PASS194 button removal: vlcr-action-row · route.reportHref
// PASS194 Lens cards are descriptive only: no Open/PDF-ready action buttons in the card grid.
// PASS179 compatibility marker: Lens does not replace Shield.
// PASS179 compatibility marker: Lens nie zastępuje Shielda.
