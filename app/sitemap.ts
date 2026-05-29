import type { MetadataRoute } from "next";
import { getVisibleProducts } from "@/lib/products/catalog";
import { siteUrl } from "@/lib/seo/metadata";

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
  const productRoutes = getVisibleProducts().map((product) => `/shop/${product.slug}`);
  const allRoutes = [...routes, ...productRoutes];

  return locales.flatMap((locale) =>
    allRoutes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: new Date("2026-05-29"),
      changeFrequency: route === "" || route === "/shop" ? "weekly" : "monthly",
      priority: route === "" ? 1 : route === "/shop" ? 0.9 : route.startsWith("/shop/") ? 0.8 : 0.6,
    })),
  );
}
