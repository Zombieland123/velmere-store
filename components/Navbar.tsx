"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, User, Wallet, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { Link, usePathname } from "@/navigation";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import VlmModeSwitch from "@/components/vlm/VlmModeSwitch";
import { useUiSounds } from "@/lib/audio/useUiSounds";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import AudioToggleButton from "@/components/ui/AudioToggleButton";

const LOCALES = ["pl", "en", "de"] as const;
const drawerTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

function CloseGlyph() {
  return (
    <span aria-hidden="true" className="relative block h-4 w-4">
      <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 rotate-45 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 -rotate-45 bg-current" />
    </span>
  );
}

function trunc(value: string) {
  if (!value) return "WALLET";
  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

export default function Navbar() {
  const t = useTranslations("Nav");
  const common = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount, openCart, closeCart } = useCart();
  const walletUi = useWalletUiStore();
  const wallet = useWalletConnect();
  const isVlmRoute = pathname.includes("/vlm-token");
  const { playHover, playClick } = useUiSounds();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const localizedPath = useCallback(
    () => {
      const withoutLocale = pathname.replace(/^\/(pl|en|de)/, "") || "";
      const basePath = withoutLocale || "/";
      const query = searchParams.toString();
      return query ? `${basePath}?${query}` : basePath;
    },
    [pathname, searchParams],
  );

  const closeDrawerAfterNavigation = useCallback(() => setIsOpen(false), []);

  const closeDrawer = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previousBody = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus(), 0);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDrawer, isOpen]);

  const primaryLinks = [
    { href: `/shop?category=men`, label: t("menswear") },
    { href: `/shop?category=women`, label: t("womenswear") },
    { href: `/shop?sort=new`, label: t("newDrop") },
    { href: `/lookbook`, label: t("lookbook") },
    { href: `/archive`, label: t("archive") },
    { href: `/square`, label: t("square") },
    { href: `/vlm-token`, label: t("vlm") },
  ];

  const legalLinks = [
    { href: `/legal/terms`, label: t("terms") },
    { href: `/legal/privacy`, label: t("privacy") },
    { href: `/legal/shipping`, label: t("shipping") },
    { href: `/returns`, label: t("returns") },
    { href: `/impressum`, label: t("impressum") },
    { href: `/contact`, label: t("contact") },
  ];

  const drawer = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label={common("close")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => closeDrawer()}
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-xl"
          />

          <motion.aside
            ref={drawerRef}
            id="velmere-shop-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="velmere-shop-drawer-title"
            initial={{ x: "-112%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-112%", opacity: 0 }}
            transition={drawerTransition}
            className="fixed bottom-4 left-4 top-4 z-[110] flex h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1C] text-white shadow-2xl shadow-black/50 outline-none"
          >
            <div className="flex min-h-full flex-col overflow-y-auto px-6 py-6 luxury-scrollbar">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <Link id="velmere-shop-drawer-title" href="/" onClick={closeDrawerAfterNavigation} className="font-sans text-2xl font-semibold uppercase tracking-[0.2em] text-white">
                  VELMÈRE
                </Link>
                <button type="button" aria-label={common("close")} onClick={() => closeDrawer()} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/64 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white">
                  <CloseGlyph />
                </button>
              </div>

              <nav className="py-7" aria-label={t("shopMenu")}>
                <p className="luxury-kicker text-white/38">{t("primary")}</p>
                <div className="mt-4 space-y-1">
                  {primaryLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeDrawerAfterNavigation} className="flex min-h-11 items-center border-b border-white/10 py-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white/84 transition-colors hover:text-velmere-gold">
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/dashboard" onClick={closeDrawerAfterNavigation} className="flex min-h-11 items-center border-b border-[#c8a96a]/20 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8a96a] transition-colors hover:text-white">
                    [ DASHBOARD / ACCOUNT ]
                  </Link>
                </div>
              </nav>

              <div className="mt-auto space-y-7 border-t border-white/10 pt-6">
                <div>
                  <p className="luxury-kicker text-white/38">{common("language")}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {LOCALES.map((item) => (
                      <Link key={item} href={localizedPath()} locale={item} onClick={closeDrawerAfterNavigation} aria-current={locale === item ? "page" : undefined} className={`inline-flex h-10 items-center rounded-full border px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${locale === item ? "border-velmere-gold text-velmere-gold" : "border-white/10 text-white/48 hover:border-white/25 hover:text-white"}`}>
                        {t(`locales.${item}`)}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="luxury-kicker text-white/38">{t("legal")}</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {legalLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={closeDrawerAfterNavigation} className="text-[11px] uppercase tracking-[0.18em] text-white/46 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[50] border-b border-white/5 bg-[#050506]/72 backdrop-blur-xl">
        <div className="flex min-h-[72px] w-full max-w-none items-center gap-3 px-4 pt-[env(safe-area-inset-top)] md:h-20 md:px-8 md:pt-0">
          <div className="flex min-w-0 items-center gap-3">
            <button ref={menuButtonRef} type="button" aria-expanded={isOpen} aria-controls="velmere-shop-drawer" onMouseEnter={playHover} onClick={() => { playClick(); closeCart(); setIsOpen(true); }} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-[#111113] px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 transition hover:border-white/20 hover:bg-[#1A1A1C] hover:text-white active:scale-95">
              <Menu className="h-4 w-4" aria-hidden="true" />
              {t("menu")}
            </button>
            <Link href="/" aria-label="Velmère" onMouseEnter={playHover} className="hidden shrink-0 font-sans text-2xl font-semibold uppercase tracking-[0.22em] text-white md:inline-flex xl:text-3xl">
              VELMÈRE
            </Link>
          </div>

          <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {primaryLinks.slice(0, 6).map((link) => (
              <Link key={link.href} href={link.href} onMouseEnter={playHover} className="rounded-full px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42 transition hover:bg-white/[0.04] hover:text-white xl:px-4">
                {link.label}
              </Link>
            ))}
            {isVlmRoute ? <div className="ml-2"><VlmModeSwitch inline /></div> : null}
          </nav>

          <Link href="/" aria-label="Velmère" className="absolute left-1/2 -translate-x-1/2 font-sans text-2xl font-semibold uppercase tracking-[0.22em] text-white md:hidden">
            VELMÈRE
          </Link>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-2">
            <AudioToggleButton />
            <div className="hidden rounded-full border border-white/10 bg-[#111113] p-1 sm:flex">
              {LOCALES.map((item) => (
                <Link key={item} href={localizedPath()} locale={item} aria-label={`${common("language")} ${item.toUpperCase()}`} aria-current={locale === item ? "page" : undefined} className={`inline-flex h-9 min-w-10 items-center justify-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${locale === item ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
                  {item.toUpperCase()}
                </Link>
              ))}
            </div>
            <button type="button" onClick={() => walletUi.connected ? undefined : void wallet.connectMetaMask()} className="hidden h-11 max-w-[12rem] items-center gap-2 truncate rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c8a96a] transition hover:border-[#c8a96a]/45 hover:bg-[#c8a96a]/15 active:scale-95 md:inline-flex xl:max-w-[17rem]">
              <Wallet className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{walletUi.connected ? `${trunc(walletUi.fullAddress)} · ${walletUi.network || "EVM"}` : "Connect wallet"}</span>
            </button>
            <Link href="/dashboard" aria-label="Dashboard" onMouseEnter={playHover} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111113] font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/62 transition hover:border-[#d4af37] hover:bg-[#1A1A1C] hover:text-white active:scale-95 sm:w-auto sm:px-4">
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:ml-2 sm:inline">Account</span>
            </Link>
            <button type="button" aria-label={t("cart")} onMouseEnter={playHover} onClick={() => { playClick(); setIsOpen(false); openCart(); }} className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111113] text-white/72 transition hover:border-white/20 hover:bg-[#1A1A1C] hover:text-white active:scale-95">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-black bg-velmere-gold px-1 text-[10px] font-semibold text-black">{itemCount}</span> : null}
            </button>
          </div>
        </div>
      </header>
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
