import { searchVelmereIntelligence, type VelmereSearchMode } from "@/lib/search/intelligence-search-contract";
import { assertSearchCopyIsSafe, sanitizeSearchInput, velmereSearchSafetyBoundary } from "@/lib/search/intelligence-search-safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedModes = new Set<VelmereSearchMode>(["all", "token", "contract", "velmere", "osint"]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = sanitizeSearchInput(url.searchParams.get("q") ?? "");
  const rawMode = url.searchParams.get("mode") ?? "all";
  const mode = allowedModes.has(rawMode as VelmereSearchMode) ? rawMode as VelmereSearchMode : "all";
  const response = searchVelmereIntelligence(query, mode);
  const safety = assertSearchCopyIsSafe(JSON.stringify(response));

  if (!safety.ok) {
    return jsonResponse({
      ok: false,
      mode: "blocked",
      reason: safety.reason,
      boundary: velmereSearchSafetyBoundary,
    }, 400);
  }

  return jsonResponse({
    ok: true,
    mode: "velmere_intelligence_search_preview",
    boundary: velmereSearchSafetyBoundary,
    ...response,
  });
}
