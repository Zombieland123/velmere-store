import type { MetadataRoute } from "next";
import { getVisibleProducts } from "@/lib/products/catalog";
import { siteUrl } from "@/lib/seo/metadata";

const locales = ["pl", "en", "de"];
const routes = [
  "",
  "/shop",
  "/clothing",
  "/vlm-token",
  "/market-integrity",
  "/market-integrity/about",
  "/square",
  "/lookbook",
  "/archive",
  "/terms",
  "/privacy",
  "/shipping",
  "/returns",
  "/impressum",
  "/contact",
  "/faq",
  "/community",
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
      changeFrequency: route === "" || route === "/shop" || route === "/clothing" ? "weekly" : "monthly",
      priority: route === "" ? 1 : (route === "/shop" || route === "/clothing") ? 0.9 : route.startsWith("/shop/") ? 0.8 : 0.6,
    })),
  );
}
