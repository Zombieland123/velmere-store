import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["pl", "en", "de"],
  defaultLocale: "pl",
});

export const config = {
  matcher: ["/", "/(en|pl|de)/:path*"],
};
