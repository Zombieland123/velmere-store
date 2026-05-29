import { NextResponse } from "next/server";
import { createSquarePost, getSquarePosts } from "@/lib/db/square-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";
  const result = await getSquarePosts(locale);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const body = String(payload.body ?? "").trim();
    if (!body) return NextResponse.json({ error: "Body is required" }, { status: 400 });

    const result = await createSquarePost({
      locale: String(payload.locale ?? "en"),
      title: String(payload.title ?? "Velmère Square Signal"),
      body,
      authorName: String(payload.authorName ?? "Velmère Member"),
      authorHandle: String(payload.authorHandle ?? "@member"),
      imageUrl: payload.imageUrl ? String(payload.imageUrl) : undefined,
      tags: Array.isArray(payload.tags) ? payload.tags.map(String) : [],
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create post" }, { status: 500 });
  }
}
