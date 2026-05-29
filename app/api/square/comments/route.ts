import { NextResponse } from "next/server";
import { createSquareComment } from "@/lib/db/square-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const postId = String(payload.postId ?? "").trim();
    const body = String(payload.body ?? "").trim();
    if (!postId || !body) return NextResponse.json({ error: "postId and body are required" }, { status: 400 });

    const result = await createSquareComment({
      postId,
      body,
      authorName: String(payload.authorName ?? "Velmère Member"),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create comment" }, { status: 500 });
  }
}
