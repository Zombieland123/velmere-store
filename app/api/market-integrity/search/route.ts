import { NextResponse } from "next/server";
import { fetchCoinGeckoSuggestions } from "@/lib/market-integrity/coingecko";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  try {
    const suggestions = await fetchCoinGeckoSuggestions(query);
    return NextResponse.json({ mode: "live", suggestions, generatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ mode: "error", error: error instanceof Error ? error.message : "Search failed" }, { status: 502 });
  }
}
