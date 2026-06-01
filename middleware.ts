import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["pl", "en", "de"],
  defaultLocale: "pl",
});

const ROOT_AUTH_ALIASES: Record<string, string> = {
  "/login": "/pl/login",
  "/logowanie": "/pl/login",
  "/sign-in": "/pl/login",
  "/signin": "/pl/login",
  "/account": "/pl/account",
  "/konto": "/pl/account",
  "/member": "/pl/account",
  "/dashboard": "/pl/account",
};

const LOCALE_AUTH_ALIASES: Record<string, string> = {
  logowanie: "login",
  "sign-in": "login",
  signin: "login",
  konto: "account",
  member: "account",
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  const rootRedirect = ROOT_AUTH_ALIASES[normalizedPath];
  if (rootRedirect) {
    return NextResponse.redirect(new URL(rootRedirect, request.url));
  }

  const match = normalizedPath.match(/^\/(pl|en|de)\/([^/]+)$/);
  if (match) {
    const [, locale, segment] = match;
    const target = LOCALE_AUTH_ALIASES[segment];
    if (target) {
      return NextResponse.redirect(new URL(`/${locale}/${target}`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
