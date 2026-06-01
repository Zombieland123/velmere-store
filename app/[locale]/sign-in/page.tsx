import { redirect } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/lib/seo/metadata";

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const safeLocale = SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number]) ? locale : "pl";
  redirect(`/${safeLocale}/login`);
}
