import { analyzeDexScreenerToken } from "@/lib/market-integrity/dexscreener";
import { searchCoinGeckoMarket } from "@/lib/market-integrity/coingecko";
import { marketIntegrityDemoResults } from "@/lib/market-integrity/demo-tokens";
import { recordSingleResult } from "@/lib/market-integrity/market-memory";
import { buildRiskBrain } from "@/lib/market-integrity/risk-brain";
import { getPersistentRiskHistory, persistRiskSnapshots } from "@/lib/market-integrity/risk-ledger";
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
      const id = marketHit.result.token.marketId ?? marketHit.result.token.tokenAddress ?? marketHit.result.token.symbol;
      const history = await getPersistentRiskHistory(id);
      const brain = buildRiskBrain(marketHit.result, history);
      return securityJson({
        mode: "live",
        result: marketHit.result,
        marketRow: { ...marketHit, memory },
        memory,
        ledger,
        history,
        brain,
        pass422: brain.pass422,
        pass425: brain.pass425,
        pass427: brain.pass427,
        pass428: brain.pass428,
        pass429: brain.pass429,
        pass430: brain.pass430,
        pass431: brain.pass431,
        pass432: brain.pass432,
        pass433: brain.pass433,
        pass434: brain.pass434,
        pass435: brain.pass435,
        pass436: brain.pass436,
        pass437: brain.pass437,
        pass438: brain.pass438,
        pass439: brain.pass439,
        pass440: brain.pass440,
        pass441: brain.pass441,
        pass442: brain.pass442,
        ...abuseShieldResponseMeta(shield),
      });
    }

    const result = await analyzeDexScreenerToken(query);
    const memory = recordSingleResult(result);
    const ledger = memory?.lastSnapshot ? await persistRiskSnapshots([memory.lastSnapshot]) : undefined;
    const id = result.token.marketId ?? result.token.tokenAddress ?? result.token.symbol;
    const history = await getPersistentRiskHistory(id);
    const brain = buildRiskBrain(result, history);
    return securityJson({
      mode: "live",
      result,
      memory,
      ledger,
      history,
      brain,
      pass422: brain.pass422,
      pass425: brain.pass425,
        pass427: brain.pass427,
        pass428: brain.pass428,
        pass429: brain.pass429,
        pass430: brain.pass430,
        pass431: brain.pass431,
        pass432: brain.pass432,
        pass433: brain.pass433,
        pass434: brain.pass434,
        pass435: brain.pass435,
        pass436: brain.pass436,
        pass437: brain.pass437,
        pass438: brain.pass438,
        pass439: brain.pass439,
        pass440: brain.pass440,
        pass441: brain.pass441,
        pass442: brain.pass442,
      ...abuseShieldResponseMeta(shield),
    });
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
