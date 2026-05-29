"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/navigation";
import { Drawer } from "vaul";
import { Loader2, ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/products/catalog";
import { getStripeClient } from "@/lib/stripe/client";
import { useUiSounds } from "@/lib/audio/useUiSounds";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";

const SIZES = ["XS", "S", "M", "L", "XL"];
const VAT_RATE = 0.19;

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const common = useTranslations("Common");
  const trust = useTranslations("Trust");
  const pathname = usePathname();
  const locale = useLocale();
  const { items, isOpen, closeCart, removeItem, updateSize, subtotal, itemCount, currency } = useCart();
  const wallet = useWalletConnect();
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "failed">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [agreedPolicies, setAgreedPolicies] = useState(false);
  const [agreedToken, setAgreedToken] = useState(false);
  const { playClick } = useUiSounds();
  const hasStripePublishableKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  const netAmount = useMemo(() => Math.round(subtotal / (1 + VAT_RATE)), [subtotal]);
  const vatAmount = Math.max(0, subtotal - netAmount);
  const checkoutAllowed = items.length > 0 && hasStripePublishableKey && agreedPolicies && agreedToken && checkoutState !== "loading";

  useEffect(() => {
    closeCart();
  }, [closeCart, pathname]);

  useEffect(() => {
    if (!isOpen) {
      setCheckoutError(null);
      setCheckoutState("idle");
    }
  }, [isOpen]);

  const haptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
  };

  const startCheckout = async () => {
    if (!checkoutAllowed) return;
    playClick();
    haptic();
    setCheckoutState("loading");
    setCheckoutError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          walletAddress: wallet.connectedWallet?.address ?? null,
          items: items.map((item) => ({
            productId: item.id,
            variantId: item.variantId,
            size: item.size,
            selectedSize: item.size,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as { sessionId?: string; url?: string; error?: string };
      if (!response.ok || !data.sessionId) throw new Error(data.error ?? t("checkoutFailed"));

      const stripe = await getStripeClient();
      if (!stripe) {
        if (data.url) {
          window.location.assign(data.url);
          return;
        }
        throw new Error(t("paymentConfigRequired"));
      }
      const redirect = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (redirect.error) throw new Error(redirect.error.message ?? t("checkoutFailed"));
    } catch (error) {
      setCheckoutState("failed");
      setCheckoutError(error instanceof Error ? error.message : t("checkoutFailed"));
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl" />
        <Drawer.Content className="fixed right-0 top-0 z-[110] flex h-[100dvh] min-h-[100dvh] w-full max-w-md flex-col border-l border-white/10 bg-black/95 text-white shadow-[-40px_0_120px_rgba(0,0,0,0.55)] outline-none safe-pt">
          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-white/20 md:hidden" aria-hidden="true" />
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-velmere-gold/80">{t("kicker")}</p>
              <Drawer.Title className="mt-2 font-serif text-3xl tracking-[0.08em] text-white">{t("title")}</Drawer.Title>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">ORDER BOOK / {itemCount} UNIT(S)</p>
            </div>
            <Drawer.Close asChild>
              <button
                type="button"
                aria-label={common("close")}
                className="flex h-11 w-11 items-center justify-center rounded-none border border-white/10 text-white/62 transition-colors hover:border-white/25 hover:text-white active:scale-95"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Drawer.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-touch px-0 py-0 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-none border border-white/10 bg-white/[0.035]">
                  <ShoppingBag className="h-7 w-7 text-white/38" aria-hidden="true" />
                </div>
                <p className="mt-6 max-w-xs font-mono text-[11px] uppercase leading-7 tracking-[0.22em] text-white/40">
                  YOUR SELECTION IS EMPTY. INITIATE EXPLORATION.
                </p>
                <Drawer.Close asChild>
                  <Link
                    href="/shop"
                    className="mt-8 inline-flex min-h-12 items-center rounded-none border border-white/12 px-6 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/25 hover:text-white active:scale-95"
                  >
                    {t("continueShopping")}
                  </Link>
                </Drawer.Close>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((item, index) => (
                  <li key={`${item.id}-${item.size}`} className="grid gap-3 border-b border-white/5 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/70">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" aria-hidden="true" />
                          [ {index % 2 === 0 ? "ALLOCATED" : "READY"} ]
                        </div>
                        <h3 className="break-words font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
                          {item.name}
                        </h3>
                      </div>
                      <p className="shrink-0 font-mono text-sm tabular-nums text-white/76">
                        {formatMoney({ amount: item.price * item.quantity, currency: item.currency }, locale)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/42 sm:grid-cols-3">
                      <span>SIZE: <b className="font-normal text-white/72">{item.size}</b></span>
                      <span>QTY: <b className="font-normal tabular-nums text-white/72">{item.quantity}</b></span>
                      <span className="break-all">PX: <b className="font-normal tabular-nums text-white/72">{formatMoney({ amount: item.price, currency: item.currency }, locale)}</b></span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            haptic();
                            updateSize(item.id, item.size, size);
                          }}
                          className={`flex h-9 min-w-9 items-center justify-center rounded-none border px-2 font-mono text-[10px] transition-colors active:scale-95 ${
                            item.size === size
                              ? "border-velmere-gold bg-velmere-gold text-black"
                              : "border-white/12 text-white/52 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          haptic();
                          removeItem(item.id, item.size);
                        }}
                        className="ml-auto min-h-9 border border-white/10 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42 transition-colors hover:text-white active:scale-95"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="border-t border-white/10 bg-black/70 px-6 py-5 safe-pb">
            <div className="grid gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/38 sm:grid-cols-2">
              <span>{trust("securePayment")}</span>
              <span>{trust("trackedShipping")}</span>
              <span>{trust("madeAfterOrder")}</span>
              <span>{trust("support")}</span>
            </div>

            <div className="mt-5 space-y-2 border-y border-white/5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/54">
              <div className="flex items-center justify-between gap-3">
                <span>Net Price</span>
                <span className="tabular-nums text-white/72">{formatMoney({ amount: netAmount, currency }, locale)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>VAT / MwSt 19%</span>
                <span className="tabular-nums text-white/72">{formatMoney({ amount: vatAmount, currency }, locale)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 text-white/70">
                <span>Gross Price</span>
                <span className="tabular-nums text-white">{formatMoney({ amount: subtotal, currency }, locale)}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 border border-white/10 bg-white/[0.025] p-3 font-mono text-[10px] leading-5 text-white/54">
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={agreedPolicies}
                  onChange={(event) => setAgreedPolicies(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-velmere-gold"
                />
                <span>
                  I accept the <Link href="/terms" className="text-velmere-gold underline-offset-4 hover:underline">Terms of Service</Link> and <Link href="/returns" className="text-velmere-gold underline-offset-4 hover:underline">Refund Policy / Widerrufsbelehrung</Link>.
                </span>
              </label>
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  checked={agreedToken}
                  onChange={(event) => setAgreedToken(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-velmere-gold"
                />
                <span>
                  I acknowledge the <Link href="/token-agreement" className="text-velmere-gold underline-offset-4 hover:underline">Token Agreement</Link> terms regarding VLM Access.
                </span>
              </label>
            </div>

            <button
              type="button"
              data-magnetic
              disabled={!checkoutAllowed}
              onClick={startCheckout}
              className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-none border border-white/10 px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/34 transition-transform enabled:cursor-pointer enabled:bg-white enabled:text-black enabled:hover:bg-velmere-gold disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              {checkoutState === "loading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {hasStripePublishableKey ? `${t("checkout")} (${itemCount})` : t("paymentConfigRequired")}
            </button>
            <p className="mt-3 font-mono text-[10px] leading-5 text-white/38">
              {hasStripePublishableKey ? "Stripe checkout unlocks after both legal gates are accepted." : t("paymentDisabled")}
            </p>
            {checkoutError && (
              <p className="mt-3 border border-velmere-gold/20 bg-velmere-gold/[0.08] p-3 font-mono text-[10px] leading-5 text-white/64">
                {checkoutError}
              </p>
            )}
          </footer>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
