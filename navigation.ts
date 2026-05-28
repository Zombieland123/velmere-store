import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["pl", "en", "de"] as const;
export type AppLocale = (typeof locales)[number];

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });
