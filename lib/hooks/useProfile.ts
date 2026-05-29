"use client";

import useSWR from "swr";
import type { ProfileRecord } from "@/lib/db/profile-service";

type ProfileResponse = {
  profile: ProfileRecord;
  source: "supabase" | "mock";
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to fetch profile");
  return response.json() as Promise<ProfileResponse>;
};

export function useProfile(fallback: ProfileRecord) {
  return useSWR<ProfileResponse>("/api/profile", fetcher, {
    fallbackData: { profile: fallback, source: "mock" },
    revalidateOnFocus: false,
  });
}

export async function updateProfileRequest(profile: ProfileRecord) {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Unable to update profile");
  return response.json() as Promise<ProfileResponse>;
}
