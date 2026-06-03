import { analyzeDexScreenerToken } from "@/lib/market-integrity/dexscreener";
import { searchCoinGeckoMarket } from "@/lib/market-integrity/coingecko";
import { marketIntegrityDemoResults } from "@/lib/market-integrity/demo-tokens";
import { recordSingleResult } from "@/lib/market-integrity/market-memory";
import { persistRiskSnapshots } from "@/lib/market-integrity/risk-ledger";
import { abuseShieldResponseMeta, applyApiAbuseShield } from "@/lib/security/api-abuse-shield";
import { securityJson } from "@/lib/security/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const shield = await applyApiAbuseShield(request, "analyze", { keyPrefix: "market-analyze", queryParam: "query", allowEmptyQuery: true });
  if (!shield.ok) return shield.response;

  const query = shield.query ?? "";

  if (!query) {
    return securityJson({ mode: "demo", results: marketIntegrityDemoResults, ...abuseShieldResponseMeta(shield) });
  }

  const demoHit = marketIntegrityDemoResults.find((result) =>
    [result.token.symbol, result.token.name].some((value) => value?.toLowerCase().includes(query.toLowerCase())),
  );

  if (demoHit && ["om", "mantra"].includes(query.toLowerCase())) {
    return securityJson({ mode: "demo", result: demoHit, ...abuseShieldResponseMeta(shield) });
  }

  try {
    const marketHit = await searchCoinGeckoMarket(query);
    if (marketHit) {
      const memory = recordSingleResult(marketHit.result);
      const ledger = memory?.lastSnapshot ? await persistRiskSnapshots([memory.lastSnapshot]) : undefined;
      return securityJson({
        mode: "live",
        result: marketHit.result,
        marketRow: { ...marketHit, memory },
        memory,
        ledger,
        ...abuseShieldResponseMeta(shield),
      });
    }

    const result = await analyzeDexScreenerToken(query);
    const memory = recordSingleResult(result);
    const ledger = memory?.lastSnapshot ? await persistRiskSnapshots([memory.lastSnapshot]) : undefined;
    return securityJson({ mode: "live", result, memory, ledger, ...abuseShieldResponseMeta(shield) });
  } catch (error) {
    return securityJson(
      {
        mode: "error",
        error: error instanceof Error ? error.message : "Market scan failed",
      },
      { status: 502 },
    );
  }
}
