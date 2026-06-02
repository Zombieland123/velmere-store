import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import ShieldMapClient from "@/components/market-integrity/ShieldMapClient";
import { buildVelmereMetadata, SUPPORTED_LOCALES } from "@/lib/seo/metadata";

const copy = {
  pl: {
    back: "Wróć do terminala",
    kicker: "Velmère Shield Map",
    title: "Mapa operacyjna Shielda bez zdradzania prywatnego jądra scoringu.",
    subtitle:
      "Ta strona tłumaczy, jak terminal składa sygnał ryzyka z warstw danych: rynek, świece, płynność, order book, holderzy, kontrakt, data quality i evidence. Pokazuje logikę pracy operatora, ale nie ujawnia prywatnych wag, progów ani heurystyk.",
    privateNote:
      "Shield Map jest opisem produktu i workflow. Nie jest werdyktem wobec tokena. Brak flagi oznacza tylko brak aktywnego sygnału w danym źródle, nie bezpieczeństwo.",
    sourceTitle: "private system overview",
    sourceBody:
      "Dane trafiają do terminala warstwami. Każda warstwa może być live, partial, fallback albo missing. Brak danych podnosi niepewność, a nie confidence. Operator widzi, gdzie trzeba zrobić manual review zanim powstanie evidence report.",
    criticalTitle: "critical review list",
    criticalBody:
      "Kompaktowa kolejka spraw do review. Priorytet nie oznacza dowodu ani oskarżenia — to tylko kierunek analizy dla operatora.",
    noCases:
      "Brak aktywnych pozycji w tej kolejce. To nie oznacza bezpieczeństwa tokenów — tylko brak flag w aktualnym źródle.",
    disclaimer:
      "Not financial advice. Algorithmic risk flag only. Anomaly requires human review.",
    layers: [
      {
        label: "Market intake",
        body: "Resolver szuka ticker/adres, ikonę, marketId, OHLCV i podstawowe metryki bez otwierania raw JSON w UI.",
        icon: "database",
      },
      {
        label: "Agent fusion",
        body: "Velocity, liquidity, holders, contract, order book i data quality działają jako osobne warstwy, a nie jeden magiczny score.",
        icon: "brain",
      },
      {
        label: "Risk routing",
        body: "SOC workflow wskazuje, co sprawdzić dalej: świece, depth, holder clusters, liquidity zones albo missing sources.",
        icon: "network",
      },
      {
        label: "Evidence handoff",
        body: "Raport ma zawierać źródła, timestampy, ograniczenia, missing data i disclaimer. Bez obietnic i bez oskarżeń.",
        icon: "file",
      },
    ],
    lanes: [
      {
        label: "Intake",
        body: "Użytkownik podaje symbol albo kontrakt. System próbuje znaleźć najlepszy marketId oraz logo, a fallback oznacza jawnie.",
        status: "visible source state",
      },
      {
        label: "Fusion",
        body: "Agenci porównują velocity, płynność, holderów, order book i kontrakt. Missing data zwiększa uncertainty.",
        status: "no hidden certainty",
      },
      {
        label: "Review",
        body: "Operator widzi priorytet, ale język pozostaje bezpieczny: anomalia, wymaga review, niepewność danych.",
        status: "RegTech wording",
      },
      {
        label: "Export",
        body: "Evidence może powstać dopiero z source ledger, command path, missing data appendix i legal note.",
        status: "guarded evidence",
      },
    ],
    guardrails: [
      "Shield nie oskarża tokenów i nie daje porad inwestycyjnych.",
      "VLM jest utility/access layer, nie inwestycją, yieldem ani obietnicą ROI.",
      "Premium UI nie może udawać pewności tam, gdzie źródła są partial/fallback/missing.",
      "Public launch wymaga rate-limitów, audit logów, data-source policy i export policy.",
    ],
  },
  en: {
    back: "Back to terminal",
    kicker: "Velmère Shield Map",
    title:
      "An operating map of Shield without exposing the private scoring core.",
    subtitle:
      "This page explains how the terminal composes a risk signal from market data, candles, liquidity, order book, holders, contract checks, data quality and evidence. It shows the operator workflow, not private weights, thresholds or heuristics.",
    privateNote:
      "Shield Map is product and workflow documentation. It is not a verdict about any token. No flag only means no active signal in the current source, not safety.",
    sourceTitle: "private system overview",
    sourceBody:
      "Data enters the terminal in layers. Each layer can be live, partial, fallback or missing. Missing data raises uncertainty, not confidence. The operator sees what needs manual review before an evidence report is created.",
    criticalTitle: "critical review list",
    criticalBody:
      "A compact queue for review. Priority is not proof or accusation — it is an analysis route for the operator.",
    noCases:
      "No active items in this queue. That does not mean tokens are safe — only that the current source has no active flags.",
    disclaimer:
      "Not financial advice. Algorithmic risk flag only. Anomaly requires human review.",
    layers: [
      {
        label: "Market intake",
        body: "The resolver maps ticker/contract, icon, marketId, OHLCV and base metrics without opening raw JSON in the UI.",
        icon: "database",
      },
      {
        label: "Agent fusion",
        body: "Velocity, liquidity, holders, contract, order book and data quality act as separate layers, not one magic score.",
        icon: "brain",
      },
      {
        label: "Risk routing",
        body: "SOC workflow suggests the next check: candles, depth, holder clusters, liquidity zones or missing sources.",
        icon: "network",
      },
      {
        label: "Evidence handoff",
        body: "Reports need sources, timestamps, limits, missing data and disclaimers. No promises and no accusations.",
        icon: "file",
      },
    ],
    lanes: [
      {
        label: "Intake",
        body: "User provides a symbol or contract. The system resolves the best marketId and logo, while clearly marking fallback state.",
        status: "visible source state",
      },
      {
        label: "Fusion",
        body: "Agents compare velocity, liquidity, holders, order book and contract data. Missing data increases uncertainty.",
        status: "no hidden certainty",
      },
      {
        label: "Review",
        body: "The operator sees priority, while language stays safe: anomaly, requires review, data uncertainty.",
        status: "RegTech wording",
      },
      {
        label: "Export",
        body: "Evidence can be created only with source ledger, command path, missing data appendix and legal note.",
        status: "guarded evidence",
      },
    ],
    guardrails: [
      "Shield does not accuse tokens and does not provide investment advice.",
      "VLM is a utility/access layer, not an investment, yield or ROI promise.",
      "Premium UI must not fake certainty when sources are partial, fallback or missing.",
      "Public launch needs rate limits, audit logs, data-source policy and export policy.",
    ],
  },
  de: {
    back: "Zurück zum Terminal",
    kicker: "Velmère Shield Map",
    title:
      "Eine operative Shield-Karte ohne Offenlegung des privaten Scoring-Kerns.",
    subtitle:
      "Diese Seite erklärt, wie das Terminal ein Risikosignal aus Marktdata, Candles, Liquidität, Orderbook, Holdern, Contract Checks, Data Quality und Evidence zusammensetzt. Sie zeigt den Operator-Workflow, nicht private Gewichte, Schwellen oder Heuristiken.",
    privateNote:
      "Shield Map ist Produkt- und Workflow-Dokumentation. Kein Urteil über Token. Keine Flagge bedeutet nur kein aktives Signal in der aktuellen Quelle, nicht Sicherheit.",
    sourceTitle: "private system overview",
    sourceBody:
      "Daten kommen schichtweise ins Terminal. Jede Schicht kann live, partial, fallback oder missing sein. Fehlende Daten erhöhen Unsicherheit, nicht Confidence. Der Operator sieht, was vor einem Evidence Report manuell geprüft werden muss.",
    criticalTitle: "critical review list",
    criticalBody:
      "Eine kompakte Review-Queue. Priorität ist kein Beweis und keine Beschuldigung — nur eine Analyse-Route für den Operator.",
    noCases:
      "Keine aktiven Einträge in dieser Queue. Das bedeutet keine Sicherheit, sondern nur keine aktiven Flags in der aktuellen Quelle.",
    disclaimer:
      "Not financial advice. Algorithmic risk flag only. Anomaly requires human review.",
    layers: [
      {
        label: "Market intake",
        body: "Resolver ordnet Ticker/Contract, Icon, marketId, OHLCV und Basisdaten zu, ohne Raw JSON im UI zu öffnen.",
        icon: "database",
      },
      {
        label: "Agent fusion",
        body: "Velocity, Liquidität, Holder, Contract, Orderbook und Data Quality sind separate Schichten, kein magischer Score.",
        icon: "brain",
      },
      {
        label: "Risk routing",
        body: "SOC Workflow schlägt den nächsten Check vor: Candles, Depth, Holder Cluster, Liquidity Zones oder Missing Sources.",
        icon: "network",
      },
      {
        label: "Evidence handoff",
        body: "Reports brauchen Quellen, Timestamps, Grenzen, Missing Data und Disclaimer. Keine Versprechen und keine Beschuldigungen.",
        icon: "file",
      },
    ],
    lanes: [
      {
        label: "Intake",
        body: "Der Nutzer gibt Symbol oder Contract an. Das System löst marketId und Logo auf und markiert Fallback klar.",
        status: "visible source state",
      },
      {
        label: "Fusion",
        body: "Agenten vergleichen Velocity, Liquidität, Holder, Orderbook und Contract-Daten. Missing Data erhöht Unsicherheit.",
        status: "no hidden certainty",
      },
      {
        label: "Review",
        body: "Der Operator sieht Priorität, während Sprache sicher bleibt: Anomalie, Review erforderlich, Datenunsicherheit.",
        status: "RegTech wording",
      },
      {
        label: "Export",
        body: "Evidence entsteht nur mit Source Ledger, Command Path, Missing Data Appendix und Legal Note.",
        status: "guarded evidence",
      },
    ],
    guardrails: [
      "Shield beschuldigt keine Token und gibt keine Anlageberatung.",
      "VLM ist Utility/Access Layer, keine Investition, kein Yield und kein ROI-Versprechen.",
      "Premium UI darf keine Sicherheit vortäuschen, wenn Quellen partial, fallback oder missing sind.",
      "Public Launch braucht Rate Limits, Audit Logs, Data-Source Policy und Export Policy.",
    ],
  },
} as const;

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  return buildVelmereMetadata({
    locale,
    path: "/market-integrity/shield-map",
    title: "Velmère Shield Map — Private Risk Operating System",
    description:
      "A safe overview of the Velmère Shield operating map, source layers, operator workflow and evidence guardrails.",
  });
}

export default function MarketIntegrityShieldMapPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number]))
    notFound();
  unstable_setRequestLocale(locale);
  return <ShieldMapClient copy={copy[locale as keyof typeof copy]} />;
}
