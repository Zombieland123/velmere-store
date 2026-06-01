import { NextResponse } from "next/server";
import { searchCoinGeckoMarket } from "@/lib/market-integrity/coingecko";
import { analyzeDexScreenerToken } from "@/lib/market-integrity/dexscreener";
import { buildInvestigationPlan } from "@/lib/market-integrity/investigation-plan";
import { recordSingleResult } from "@/lib/market-integrity/market-memory";
import { getPersistentRiskHistory, persistRiskSnapshots } from "@/lib/market-integrity/risk-ledger";

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
    const memory = recordSingleResult(result);
    const ledger = memory?.lastSnapshot ? await persistRiskSnapshots([memory.lastSnapshot]) : undefined;
    const id = result.token.marketId ?? result.token.tokenAddress ?? result.token.symbol;
    const history = await getPersistentRiskHistory(id, 144);
    const investigationPlan = buildInvestigationPlan(result, history);

    return NextResponse.json({
      mode: "live",
      reportType: "velmere-shield-market-integrity-evidence-bundle",
      result,
      memory,
      ledger,
      history,
      investigationPlan,
      legalNote: "Automated market-integrity signal. Not legal proof, not an accusation, not financial advice.",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json<ErrorPayload>(
      { mode: "error", error: error instanceof Error ? error.message : "Report generation failed" },
      { status: 502 },
    );
  }
}
