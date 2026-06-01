import { NextResponse } from "next/server";
import { analyzeDexScreenerToken } from "@/lib/market-integrity/dexscreener";
import { searchCoinGeckoMarket } from "@/lib/market-integrity/coingecko";
import { marketIntegrityDemoResults } from "@/lib/market-integrity/demo-tokens";
import { recordSingleResult } from "@/lib/market-integrity/market-memory";
import { persistRiskSnapshots } from "@/lib/market-integrity/risk-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ mode: "demo", results: marketIntegrityDemoResults });
  }

  const demoHit = marketIntegrityDemoResults.find((result) =>
    [result.token.symbol, result.token.name].some((value) => value?.toLowerCase().includes(query.toLowerCase())),
  );

  if (demoHit && ["om", "mantra"].includes(query.toLowerCase())) {
    return NextResponse.json({ mode: "demo", result: demoHit });
  }

  try {
    const marketHit = await searchCoinGeckoMarket(query);
    if (marketHit) {
      const memory = recordSingleResult(marketHit.result);
      const ledger = memory?.lastSnapshot ? await persistRiskSnapshots([memory.lastSnapshot]) : undefined;
      return NextResponse.json({
        mode: "live",
        result: marketHit.result,
        marketRow: { ...marketHit, memory },
        memory,
        ledger,
      });
    }

    const result = await analyzeDexScreenerToken(query);
    const memory = recordSingleResult(result);
    const ledger = memory?.lastSnapshot ? await persistRiskSnapshots([memory.lastSnapshot]) : undefined;
    return NextResponse.json({ mode: "live", result, memory, ledger });
  } catch (error) {
    return NextResponse.json(
      {
        mode: "error",
        error: error instanceof Error ? error.message : "Market scan failed",
      },
      { status: 502 },
    );
  }
}
