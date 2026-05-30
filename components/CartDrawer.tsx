"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/navigation";
import { Drawer } from "vaul";
import { Loader2, Minus, Plus, ShoppingBag, X } from "lucide-react";
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
  const { items, isOpen, closeCart, removeItem, updateSize, addItem, subtotal, itemCount, currency } = useCart();
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

  useEffect(() => closeCart(), [closeCart, pathname]);
  useEffect(() => {
    if (!isOpen) {
      setCheckoutError(null);
      setCheckoutState("idle");
    }
  }, [isOpen]);

  const haptic = () => navigator.vibrate?.(35);

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
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xl" />
        <Drawer.Content className="fixed bottom-2 right-2 top-2 z-[110] flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1C] text-white shadow-2xl shadow-black/50 outline-none md:bottom-4 md:right-4 md:top-4 md:h-[calc(100dvh-2rem)] md:w-[min(31rem,calc(100vw-2rem))]">
          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-white/20 md:hidden" aria-hidden="true" />
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-4 md:px-5 md:py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-velmere-gold/80">{t("kicker")}</p>
              <Drawer.Title className="mt-2 font-serif text-2xl tracking-[0.08em] text-white md:text-3xl">{t("orderBook")}</Drawer.Title>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{itemCount} {t("units")}</p>
            </div>
            <Drawer.Close asChild>
              <button type="button" aria-label={common("close")} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/62 transition-colors hover:border-white/25 hover:text-white active:scale-95">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Drawer.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-touch px-0 py-0 luxury-scrollbar">
            {items.length === 0 ? (
              <div className="flex h-full min-h-[18rem] flex-col items-center justify-center px-6 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#242428]">
                  <ShoppingBag className="h-7 w-7 text-white/38" aria-hidden="true" />
                </div>
                <p className="mt-5 max-w-[15rem] font-mono text-[10px] uppercase leading-6 tracking-[0.18em] text-white/42 md:max-w-xs md:text-[11px] md:leading-7 md:tracking-[0.22em]">{t("emptyLong")}</p>
                <Drawer.Close asChild>
                  <Link href="/shop" className="mt-8 inline-flex min-h-12 items-center rounded-full border border-white/12 bg-[#242428] px-6 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/25 hover:text-white active:scale-95">
                    {t("continueShopping")}
                  </Link>
                </Drawer.Close>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((item, index) => (
                  <li key={`${item.id}-${item.size}`} className="grid gap-4 border-b border-white/5 px-5 py-5">
                    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4">
                      <div className="relative h-24 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover contrast-105" /> : <div className="h-full w-full bg-white/5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/70">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" aria-hidden="true" />
                          [ {index % 2 === 0 ? "ALLOCATED" : "READY"} ]
                        </div>
                        <h3 className="break-words font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-white">{item.name}</h3>
                        <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/42">
                          <span>SIZE: <b className="font-normal text-white/72">{item.size}</b></span>
                          <span>QTY: <b className="font-normal tabular-nums text-white/72">{item.quantity}</b></span>
                          <span className="col-span-2 break-all">PX: <b className="font-normal tabular-nums text-white/72">{formatMoney({ amount: item.price * item.quantity, currency: item.currency }, locale)}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {SIZES.map((size) => (
                        <button key={size} type="button" onClick={() => { haptic(); updateSize(item.id, item.size, size); }} className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-2 font-mono text-[10px] transition-colors active:scale-95 ${item.size === size ? "border-velmere-gold bg-velmere-gold text-black" : "border-white/12 bg-black/20 text-white/52 hover:border-white/25 hover:text-white"}`}>
                          {size}
                        </button>
                      ))}
                      <button type="button" aria-label="Decrease quantity" onClick={() => removeItem(item.id, item.size)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white active:scale-95"><Minus className="h-3 w-3" /></button>
                      <span className="flex h-9 min-w-9 items-center justify-center rounded-full border border-white/10 font-mono text-[10px] text-white/70">{item.quantity}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => { haptic(); addItem({ ...item, quantity: 1 }); }} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white active:scale-95"><Plus className="h-3 w-3" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <footer className="max-h-[50dvh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#151517] px-4 py-4 safe-pb luxury-scrollbar md:max-h-none md:overflow-visible md:px-5 md:py-5">
            {items.length === 0 ? (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#202024] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                <span>{t("noAllocation")}</span>
                <span className="text-[#c8a96a]/70">0.00 EUR</span>
              </div>
            ) : (
              <>
                <div className="grid gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/38 sm:grid-cols-2">
                  <span>{trust("securePayment")}</span><span>{trust("trackedShipping")}</span><span>{trust("madeAfterOrder")}</span><span>{trust("support")}</span>
                </div>
                <div className="mt-4 space-y-2 border-y border-white/10 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/42 md:mt-5 md:py-4">
                  <div className="flex items-center justify-between gap-3"><span>{t("netPrice")}</span><span className="tabular-nums text-white/72">{formatMoney({ amount: netAmount, currency }, locale)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>{t("vat")}</span><span className="tabular-nums text-white/72">{formatMoney({ amount: vatAmount, currency }, locale)}</span></div>
                  <div className="flex items-center justify-between gap-3 pt-2 text-white/70"><span>{t("grossPrice")}</span><span className="tabular-nums text-white">{formatMoney({ amount: subtotal, currency }, locale)}</span></div>
                </div>
                <div className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-[#202024] p-3 font-mono text-[9px] leading-5 text-white/54 md:mt-4 md:gap-3 md:text-[10px]">
                  <label className="flex gap-3"><input type="checkbox" checked={agreedPolicies} onChange={(event) => setAgreedPolicies(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-velmere-gold" /><span>{t("acceptTermsPrefix")} <Link href="/legal/terms" className="text-velmere-gold underline-offset-4 hover:underline">{t("terms")}</Link> {t("and")} <Link href="/returns" className="text-velmere-gold underline-offset-4 hover:underline">{t("refundPolicy")}</Link>.</span></label>
                  <label className="flex gap-3"><input type="checkbox" checked={agreedToken} onChange={(event) => setAgreedToken(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-velmere-gold" /><span>{t("acceptTokenPrefix")} <Link href="/token-agreement" className="text-velmere-gold underline-offset-4 hover:underline">{t("tokenAgreement")}</Link>.</span></label>
                </div>
                <button type="button" disabled={!checkoutAllowed} onClick={startCheckout} className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/34 transition-transform enabled:cursor-pointer enabled:bg-white enabled:text-black enabled:hover:bg-velmere-gold disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 md:mt-5 md:min-h-14 md:text-[11px] md:tracking-[0.2em]">
                  {checkoutState === "loading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {hasStripePublishableKey ? `${t("checkout")} (${itemCount})` : t("paymentConfigRequired")}
                </button>
                {checkoutError ? <p className="mt-3 rounded-xl border border-velmere-gold/20 bg-velmere-gold/[0.08] p-3 font-mono text-[10px] leading-5 text-white/64">{checkoutError}</p> : null}
              </>
            )}
          </footer>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

