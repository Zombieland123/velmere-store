import type { MetadataRoute } from "next";

const baseUrl = "https://velmere-store1.vercel.app";
const locales = ["pl", "en", "de"];
const routes = [
  "",
  "/shop",
  "/vlm-token",
  "/square",
  "/lookbook",
  "/archive",
  "/terms",
  "/privacy",
  "/shipping",
  "/returns",
  "/impressum",
  "/contact",
  "/token-agreement",
  "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date("2026-05-26"),
      changeFrequency: route === "" || route === "/shop" ? "weekly" : "monthly",
      priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.6,
    })),
  );
}
