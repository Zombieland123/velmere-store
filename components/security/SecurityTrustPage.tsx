import {
  Activity,
  Database,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { resolveSecurityTrustLocale } from "@/lib/security/security-trust-copy";

// Public Security explains customer protections. Operator deployment details stay private.
const copy = {
  pl: {
    eyebrow: "Velmère Security",
    title: "Bezpieczeństwo, które da się wyjaśnić.",
    subtitle: "Velmère oddziela tożsamość, sekrety, dane rynkowe i raporty. Użytkownik widzi źródło oraz braki danych, a prywatne informacje nie trafiają do publicznego wyniku.",
    section: "Jak chronimy Velmère",
    architecture: "Velmère Defense Architecture",
    architectureTitle: "Nazwane warstwy ochrony. Publiczny efekt, prywatna mechanika.",
    architectureBody: "Każda warstwa ma konkretną odpowiedzialność i widoczny efekt. Nie publikujemy progów detekcji, reguł korelacji, konfiguracji dostawców ani wag scoringu.",
    active: "aktywna warstwa",
    controlled: "kontrolowany preview",
    privateTitle: "Czego nie ujawniamy",
    privateBody: "Nie publikujemy konfiguracji infrastruktury, sekretów dostawców, tokenów API, surowych logów, reguł wykrywania nadużyć ani szczegółów, które ułatwiałyby obejście zabezpieczeń.",
    boundary: "Publiczna strona opisuje model ochrony. Szczegóły konfiguracji i wyniki testów pozostają w kontrolowanym audycie technicznym.",
    protections: [
      ["Podpis zamiast sekretu", "Portfel potwierdza kontrolę podpisem. Velmère nie prosi o seed phrase ani prywatny klucz.", Fingerprint],
      ["Sekrety po stronie serwera", "Klucze dostawców i konfiguracja środowiska nie są osadzane w publicznym interfejsie.", KeyRound],
      ["Ograniczanie nadużyć", "Wrażliwe endpointy otrzymują limity, walidację wejścia i kontrolowany zakres zapytań.", Activity],
      ["Źródło obok wniosku", "Analizy pokazują dostawcę, timestamp, confidence i brakujące dane zamiast fikcyjnej pewności.", RadioTower],
      ["Redakcja przed eksportem", "Raport publiczny usuwa sekrety, identyfikatory operatora i surowe dane diagnostyczne.", LockKeyhole],
      ["Oddzielne warstwy danych", "Rynek, tożsamość, płatność i audyt mają osobne kontrakty oraz ograniczone uprawnienia.", Database],
    ],
    innovations: [
      ["Aegis Request Mesh", "ochrona publicznego ruchu", "Klasyfikuje podejrzane żądania, ogranicza kosztowne ścieżki API i zatrzymuje nieprawidłowe wejście przed analizą.", "active", Activity],
      ["Obsidian Secret Boundary", "izolacja sekretów", "Oddziela publiczny interfejs od kluczy dostawców, konfiguracji środowiska i uprawnień administracyjnych.", "active", KeyRound],
      ["Proofline Source Ledger", "źródło przy każdym wniosku", "Wiąże wynik AI ze źródłem, czasem obserwacji, stanem świeżości i brakującymi polami.", "active", RadioTower],
      ["Veil Export Firewall", "bezpieczny PDF i eksport", "Redaguje dane operatorskie, prywatne identyfikatory, sekrety i surowe payloady przed utworzeniem raportu.", "active", LockKeyhole],
      ["Sentinel Replay Chain", "ciąg zdarzeń bezpieczeństwa", "Porządkuje blokady, limity, fallbacki i zdarzenia administracyjne w ślad do późniejszego review.", "controlled", Database],
      ["Human Override Protocol", "kontrola nad pewnością AI", "Nakłada limity pewności przy brakujących źródłach i kieruje niejednoznaczne przypadki do ręcznej weryfikacji.", "active", Fingerprint],
    ],
  },
  de: {
    eyebrow: "Velmère Security",
    title: "Sicherheit, die sich erklären lässt.",
    subtitle: "Velmère trennt Identität, Secrets, Marktdaten und Reports. Nutzer sehen Quellen und Datenlücken; private Informationen gelangen nicht in öffentliche Ergebnisse.",
    section: "So schützen wir Velmère",
    architecture: "Velmère Defense Architecture",
    architectureTitle: "Benannte Schutzschichten. Öffentliche Wirkung, private Mechanik.",
    architectureBody: "Jede Schicht hat eine klare Verantwortung und sichtbare Wirkung. Erkennungsschwellen, Korrelationsregeln, Provider-Konfiguration und Scoring-Gewichte bleiben privat.",
    active: "aktive Schicht",
    controlled: "kontrolliertes Preview",
    privateTitle: "Was wir nicht offenlegen",
    privateBody: "Wir veröffentlichen keine Infrastrukturkonfiguration, Provider-Secrets, API-Tokens, Raw Logs, Abuse-Regeln oder Details, die eine Umgehung erleichtern.",
    boundary: "Diese Seite beschreibt das Schutzmodell. Konfigurationsdetails und Testergebnisse bleiben im kontrollierten technischen Audit.",
    protections: [
      ["Signatur statt Secret", "Die Wallet bestätigt Kontrolle per Signatur. Velmère fragt nie nach Seed Phrase oder Private Key.", Fingerprint],
      ["Serverseitige Secrets", "Provider-Schlüssel und Umgebungsdaten werden nicht in das öffentliche Interface eingebettet.", KeyRound],
      ["Missbrauch begrenzen", "Sensible Endpoints erhalten Limits, Input-Validierung und kontrollierte Query-Grenzen.", Activity],
      ["Quelle neben dem Befund", "Analysen zeigen Provider, Timestamp, Confidence und fehlende Daten statt falscher Gewissheit.", RadioTower],
      ["Redaktion vor Export", "Öffentliche Reports entfernen Secrets, Operator-Kennungen und rohe Diagnosedaten.", LockKeyhole],
      ["Getrennte Datenebenen", "Markt, Identität, Zahlung und Audit nutzen getrennte Verträge und begrenzte Rechte.", Database],
    ],
    innovations: [
      ["Aegis Request Mesh", "Schutz des öffentlichen Traffics", "Klassifiziert verdächtige Requests, begrenzt teure API-Pfade und stoppt ungültige Eingaben vor der Analyse.", "active", Activity],
      ["Obsidian Secret Boundary", "Secret-Isolation", "Trennt das öffentliche Interface von Provider-Schlüsseln, Umgebungsdaten und administrativen Rechten.", "active", KeyRound],
      ["Proofline Source Ledger", "Quelle an jedem Befund", "Verknüpft AI-Ergebnisse mit Quelle, Beobachtungszeit, Aktualität und fehlenden Feldern.", "active", RadioTower],
      ["Veil Export Firewall", "sicheres PDF und Export", "Redigiert Operator-Daten, private Kennungen, Secrets und Raw Payloads vor der Reporterstellung.", "active", LockKeyhole],
      ["Sentinel Replay Chain", "Security Event Chain", "Ordnet Blocks, Limits, Fallbacks und Admin-Ereignisse für spätere Reviews.", "controlled", Database],
      ["Human Override Protocol", "Kontrolle der AI-Konfidenz", "Begrenzt Konfidenz bei fehlenden Quellen und routet uneindeutige Fälle in manuelle Prüfung.", "active", Fingerprint],
    ],
  },
  en: {
    eyebrow: "Velmère Security",
    title: "Security that can be explained.",
    subtitle: "Velmère separates identity, secrets, market data and reports. Users see sources and data gaps while private information stays out of public output.",
    section: "How Velmère is protected",
    architecture: "Velmère Defense Architecture",
    architectureTitle: "Named protection layers. Public effect, private mechanics.",
    architectureBody: "Each layer has a precise responsibility and visible outcome. Detection thresholds, correlation rules, provider configuration and scoring weights remain private.",
    active: "active layer",
    controlled: "controlled preview",
    privateTitle: "What we do not disclose",
    privateBody: "We do not publish infrastructure configuration, provider secrets, API tokens, raw logs, abuse-detection rules or details that would make controls easier to bypass.",
    boundary: "This page describes the protection model. Configuration detail and test evidence remain in a controlled technical audit.",
    protections: [
      ["Sign instead of disclosing", "A wallet proves control with a signature. Velmère never asks for a seed phrase or private key.", Fingerprint],
      ["Server-side secrets", "Provider keys and environment configuration are not embedded in the public interface.", KeyRound],
      ["Abuse controls", "Sensitive endpoints receive rate limits, input validation and bounded query scope.", Activity],
      ["A source beside each finding", "Analysis exposes provider, timestamp, confidence and missing data instead of false certainty.", RadioTower],
      ["Redaction before export", "Public reports remove secrets, operator identifiers and raw diagnostic payloads.", LockKeyhole],
      ["Separated data layers", "Market, identity, payment and audit use distinct contracts and limited permissions.", Database],
    ],
    innovations: [
      ["Aegis Request Mesh", "public traffic defense", "Classifies suspicious requests, constrains expensive API paths and stops invalid input before analysis.", "active", Activity],
      ["Obsidian Secret Boundary", "secret isolation", "Separates the public interface from provider keys, environment configuration and administrative privileges.", "active", KeyRound],
      ["Proofline Source Ledger", "a source beside every finding", "Binds AI output to its source, observation time, freshness state and missing fields.", "active", RadioTower],
      ["Veil Export Firewall", "safe PDF and export", "Redacts operator data, private identifiers, secrets and raw payloads before a report is created.", "active", LockKeyhole],
      ["Sentinel Replay Chain", "security event continuity", "Organizes blocks, limits, fallbacks and administrative events into a trail for later review.", "controlled", Database],
      ["Human Override Protocol", "AI confidence control", "Caps confidence when sources are missing and routes ambiguous cases to manual verification.", "active", Fingerprint],
    ],
  },
} as const;

export default function SecurityTrustPage({ locale }: { locale: string }) {
  const safeLocale = resolveSecurityTrustLocale(locale);
  const c = copy[safeLocale];
  return (
    <main className="min-h-screen bg-velmere-black px-5 pb-24 pt-28 text-white md:px-10 md:pt-36">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-velmere-gold/[0.20] bg-velmere-gold/[0.07] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.17em] text-velmere-gold">
            <ShieldCheck className="h-4 w-4" />
            {c.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-none tracking-[-0.055em] md:text-7xl">{c.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/[0.60]">{c.subtitle}</p>
        </div>

        <section className="mt-14">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{c.section}</h2>
          <div className="mt-5 overflow-hidden rounded-[1.7rem] border border-white/[0.09] bg-[#0b0d0e]">
            {c.protections.map(([title, body, Icon], index) => (
              <article key={title} className="grid gap-4 border-b border-white/[0.07] p-5 last:border-b-0 md:grid-cols-[3rem_14rem_1fr] md:items-center md:p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] text-velmere-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm leading-7 text-white/[0.52]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">{c.architecture}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:items-end">
            <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.05em] md:text-6xl">{c.architectureTitle}</h2>
            <p className="max-w-2xl text-sm leading-7 text-white/[0.52]">{c.architectureBody}</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {c.innovations.map(([name, label, body, status, Icon]) => (
              <article key={name} className="group rounded-[1.6rem] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.015))] p-5 transition hover:border-cyan-200/[0.20] hover:bg-cyan-300/[0.035]">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-cyan-200/[0.14] bg-cyan-300/[0.05] text-cyan-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.13em] ${status === "active" ? "border-emerald-300/[0.16] bg-emerald-300/[0.05] text-emerald-200" : "border-amber-300/[0.16] bg-amber-300/[0.05] text-amber-200"}`}>
                    {status === "active" ? c.active : c.controlled}
                  </span>
                </div>
                <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.16em] text-velmere-gold">{label}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">{name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/[0.50]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 rounded-[1.7rem] border border-cyan-200/[0.12] bg-cyan-300/[0.035] p-6 md:grid-cols-[minmax(12rem,.65fr)_minmax(0,1.35fr)] md:p-8">
          <div>
            <LockKeyhole className="h-5 w-5 text-cyan-200" />
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.04em]">{c.privateTitle}</h2>
          </div>
          <div>
            <p className="text-sm leading-7 text-white/[0.56]">{c.privateBody}</p>
            <p className="mt-4 border-t border-white/[0.08] pt-4 text-xs leading-6 text-white/[0.36]">{c.boundary}</p>
          </div>
        </section>
      </section>
    </main>
  );
}
