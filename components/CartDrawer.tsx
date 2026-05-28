"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Link } from "@/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { luxuryEase } from "@/lib/motion";
import LuxuryEmptyState from "@/components/ui/LuxuryEmptyState";
import { formatMoney } from "@/lib/products/catalog";

const SIZES = ["XS", "S", "M", "L", "XL"];

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const common = useTranslations("Common");
  const trust = useTranslations("Trust");
  const pathname = usePathname();
  const locale = useLocale();
  const { items, isOpen, closeCart, removeItem, updateSize, subtotal, itemCount, currency } = useCart();
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "failed">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const hasStripePublishableKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    closeCart();
  }, [closeCart, pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeCart, isOpen]);

  const startCheckout = async () => {
    setCheckoutState("loading");
    setCheckoutError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error ?? t("checkoutFailed"));
      window.location.assign(data.url);
    } catch (error) {
      setCheckoutState("failed");
      setCheckoutError(error instanceof Error ? error.message : t("checkoutFailed"));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label={common("close")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: luxuryEase }}
            onClick={closeCart}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: luxuryEase }}
            className="fixed right-0 top-0 z-[110] flex h-dvh min-h-dvh w-full max-w-md flex-col border-l border-white/10 bg-black/95 text-white shadow-[-40px_0_120px_rgba(0,0,0,0.55)]"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-6">
              <div>
                <p className="luxury-kicker text-velmere-gold/80">{t("kicker")}</p>
                <h2 className="mt-2 font-serif text-3xl text-white">{t("title")}</h2>
              </div>
              <button
                type="button"
                aria-label={common("close")}
                onClick={closeCart}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/62 transition-colors hover:border-white/25 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <LuxuryEmptyState
                    title={t("emptyLuxury.title")}
                    body={t("emptyLuxury.body")}
                    icon={<ShoppingBag className="h-7 w-7" aria-hidden="true" />}
                    className="w-full"
                  />
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-8 inline-flex min-h-12 items-center rounded-full border border-white/12 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors duration-500 hover:border-white/25 hover:text-white"
                  >
                    {t("continueShopping")}
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-white/10 pb-5">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white/[0.035]">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover grayscale contrast-125"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                          {item.name}
                        </h3>
                        <p className="mt-2 font-sans text-lg text-white/58">
                          {formatMoney({ amount: item.price, currency: item.currency }, locale)}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/42">
                          {t("quantity")}: {item.quantity}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateSize(item.id, item.size, size)}
                              className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[10px] transition-colors ${
                                item.size === size
                                  ? "border-velmere-gold bg-velmere-gold text-black"
                                  : "border-white/12 text-white/52 hover:border-white/25 hover:text-white"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size)}
                          className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42 transition-colors hover:text-white"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-white/10 bg-black/55 px-6 py-6">
              <div className="grid gap-2 text-[10px] uppercase tracking-[0.16em] text-white/42 sm:grid-cols-2">
                <span>{trust("securePayment")}</span>
                <span>{trust("trackedShipping")}</span>
                <span>{trust("madeAfterOrder")}</span>
                <span>{trust("support")}</span>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between uppercase tracking-[0.16em] text-white/54">
                  <span>{t("subtotal")}</span>
                  <span>{formatMoney({ amount: subtotal, currency }, locale)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={items.length === 0 || !hasStripePublishableKey || checkoutState === "loading"}
                onClick={startCheckout}
                className="mt-5 flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/34 enabled:cursor-pointer enabled:bg-white enabled:text-black enabled:hover:bg-velmere-gold"
              >
                {checkoutState === "loading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {hasStripePublishableKey ? `${t("checkout")} (${itemCount})` : t("paymentConfigRequired")}
              </button>
              <p className="mt-3 text-xs leading-6 text-white/46">
                {hasStripePublishableKey ? t("checkoutUnavailable") : t("paymentDisabled")}
              </p>
              {checkoutError && (
                <p className="mt-3 rounded-lg border border-velmere-gold/20 bg-velmere-gold/[0.08] p-3 text-xs leading-6 text-white/64">
                  {checkoutError}
                </p>
              )}
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
