import { NextResponse } from "next/server";
import { getProfile, updateProfile, type ProfileRecord } from "@/lib/db/profile-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getProfile();
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const profile: ProfileRecord = {
      displayName: String(payload.displayName ?? "Velmère Member").trim() || "Velmère Member",
      handle: String(payload.handle ?? "velmere.member").trim().replace(/^@/, "") || "velmere.member",
      bio: String(payload.bio ?? "").trim(),
      lastNameChange: String(payload.lastNameChange ?? new Date().toISOString()),
    };
    const result = await updateProfile(profile);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update profile" }, { status: 500 });
  }
}
