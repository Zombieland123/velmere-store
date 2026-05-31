"use client";

import useSWR from "swr";
import type { ProfileRecord } from "@/lib/db/profile-service";

type ProfileResponse = {
  profile: ProfileRecord;
  source: "supabase" | "mock";
};

function previewHeaders() {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const active = window.localStorage.getItem("velmere:account-session") === "active";
  return active
    ? { "Content-Type": "application/json", "x-velmere-preview-session": "active" }
    : { "Content-Type": "application/json" };
}

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
    headers: previewHeaders(),
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Unable to update profile");
  return response.json() as Promise<ProfileResponse>;
}
