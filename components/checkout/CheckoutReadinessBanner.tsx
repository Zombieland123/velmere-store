"use client";

import { useTranslations } from "next-intl";
import { getStoreCheckoutReadiness } from "@/lib/checkout/readiness";

export default function CheckoutReadinessBanner() {
  const t = useTranslations("CheckoutReadiness");
  const readiness = getStoreCheckoutReadiness();

  if (readiness.enabled) return null;

  return (
    <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-white/52">
      {t("customerPending")}
    </p>
  );
}
