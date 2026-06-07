import { buildUniversalAssetMarketMatrix } from "@/lib/market-integrity/universal-asset-market-matrix";
import {
  normalizeTwelveDataSearchItem,
  type RealMarketSearchResult,
  type TwelveDataSymbolSearchItem,
} from "@/lib/market-integrity/real-market-search";
import { rankVelmereSearchValues } from "@/lib/search/velmere-search-ranking";
import { applyApiAbuseShield } from "@/lib/security/api-abuse-shield";
import { securityJson } from "@/lib/security/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function localResults(): RealMarketSearchResult[] {
  return buildUniversalAssetMarketMatrix().rows.map((row) => ({
    id: `velmere:${row.id}`,
    symbol: row.symbol,
    name: row.name,
    assetClass: row.assetClass,
    exchange: row.priceLane,
    country: "Velmère reference",
    currency: row.assetClass === "fx" ? row.symbol.split("/")[1] ?? "" : "USD",
    provider: "velmere_matrix",
    providerState: "curated_reference",
  }));
}

function mergeResults(
  local: RealMarketSearchResult[],
  provider: RealMarketSearchResult[],
  query: string,
) {
  const unique = new Map<string, RealMarketSearchResult>();
  for (const item of [...provider, ...local]) {
    const key = `${item.symbol}:${item.exchange}`.toLowerCase();
    if (!unique.has(key)) unique.set(key, item);
  }
  return rankVelmereSearchValues(
    Array.from(unique.values()).map((item) => ({
      ...item,
      keywords: [
        item.assetClass,
        item.exchange,
        item.country,
        item.currency,
        item.provider,
      ],
    })),
    query,
    { limit: 24 },
  );
}

export async function GET(request: Request) {
  const shield = await applyApiAbuseShield(request, "search", {
    keyPrefix: "real-markets-search",
    queryParam: "q",
    allowEmptyQuery: false,
  });
  if (!shield.ok) return shield.response;

  const query = (shield.query ?? "").trim();
  const local = localResults();
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  let providerResults: RealMarketSearchResult[] = [];
  let providerMode: "catalog_live" | "curated_reference" = "curated_reference";

  if (apiKey && query.length >= 2) {
    const params = new URLSearchParams({
      symbol: query,
      outputsize: "32",
      apikey: apiKey,
    });
    try {
      const response = await fetch(
        `https://api.twelvedata.com/symbol_search?${params.toString()}`,
        {
          headers: { accept: "application/json" },
          next: { revalidate: 60 * 60 * 6 },
        } as RequestInit & { next: { revalidate: number } },
      );
      if (response.ok) {
        const payload = (await response.json()) as {
          data?: TwelveDataSymbolSearchItem[];
        };
        providerResults = (payload.data ?? [])
          .map(normalizeTwelveDataSearchItem)
          .filter((item): item is RealMarketSearchResult => Boolean(item));
        if (providerResults.length) providerMode = "catalog_live";
      }
    } catch {
      providerResults = [];
    }
  }

  return securityJson({
    ok: true,
    query,
    providerMode,
    results: mergeResults(local, providerResults, query),
    boundary:
      "Instrument discovery only. Price, filing and second-source lanes require separate timestamped providers.",
  });
}
