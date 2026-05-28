import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*/admin/*", "/*/checkout/success", "/*/checkout/cancel"],
      },
    ],
    sitemap: "https://velmere-store1.vercel.app/sitemap.xml",
  };
}
