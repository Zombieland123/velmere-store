import { NextResponse } from "next/server";
import { searchCoinGeckoMarket } from "@/lib/market-integrity/coingecko";
import { analyzeDexScreenerToken } from "@/lib/market-integrity/dexscreener";
import { getPersistentRiskHistory } from "@/lib/market-integrity/risk-ledger";
import { buildTerminalReadiness } from "@/lib/market-integrity/terminal-readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorPayload = { mode: "error"; error: string };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  if (!query) return NextResponse.json<ErrorPayload>({ mode: "error", error: "Missing query" }, { status: 400 });

  try {
    const marketRow = await searchCoinGeckoMarket(query);
    const result = marketRow?.result ?? await analyzeDexScreenerToken(query);
    const id = result.token.marketId ?? result.token.tokenAddress ?? result.token.symbol;
    const history = await getPersistentRiskHistory(id, 144);
    const readiness = buildTerminalReadiness(result, {
      candlesCount: result.chart?.sevenDay?.length ?? marketRow?.sparkline7d?.length ?? 0,
      chartSource: result.chart?.sevenDay?.length ? "risk-result sparkline" : marketRow?.sparkline7d?.length ? "market-row sparkline" : "metric fallback",
      hasOrderBook: false,
      historyCount: history.length,
      chatEnabled: true,
      accessLayerVisible: true,
    });

    return NextResponse.json({
      mode: "live",
      query,
      token: result.token,
      readiness,
      legalNote: "Readiness is product/UX/data QA only. Not financial advice. Algorithmic risk flag only.",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json<ErrorPayload>(
      { mode: "error", error: error instanceof Error ? error.message : "Terminal readiness generation failed" },
      { status: 502 },
    );
  }
}
