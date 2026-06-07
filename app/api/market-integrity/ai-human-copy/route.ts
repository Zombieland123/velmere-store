import { NextResponse } from "next/server";
import {
  buildAiHumanCopyEngine,
  humanizeShieldCopy,
} from "@/lib/market-integrity/ai-human-copy-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") ?? "";
  const copyEngine = buildAiHumanCopyEngine();

  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      boundary:
        "AI Human Copy Engine is a public-copy translator. not investment advice. Not safety guarantees. Not bankruptcy claims. Not public accusations. Not buy/sell signals.",
      translated: raw ? humanizeShieldCopy(raw) : null,
      ...copyEngine,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
