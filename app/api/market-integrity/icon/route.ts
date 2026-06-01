import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set([
  "assets.coingecko.com",
  "coin-images.coingecko.com",
  "static.coingecko.com",
  "www.coingecko.com",
  "dd.dexscreener.com",
  "cdn.dexscreener.com",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  if (!raw) return new NextResponse(null, { status: 404 });
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) return new NextResponse(null, { status: 403 });

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" },
      next: { revalidate: 60 * 60 * 24 },
    } as RequestInit & { next: { revalidate: number } });
    if (!response.ok) return new NextResponse(null, { status: response.status });
    const contentType = response.headers.get("content-type") ?? "image/png";
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
