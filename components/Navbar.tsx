"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, ShoppingBag, User, Wallet, X } from "lucide-react";
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

function trunc(value: string) {
  if (!value) return "CONNECT";
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
  const { playHover, playClick } = useUiSounds();
  const isVlmRoute = pathname.includes("/vlm-token");

  const [isOpen, setIsOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const walletRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  const localizedPath = useCallback(() => {
    const withoutLocale = pathname.replace(/^\/(pl|en|de)/, "") || "";
    const basePath = withoutLocale || "/";
    const query = searchParams.toString();
    return query ? `${basePath}?${query}` : basePath;
  }, [pathname, searchParams]);

  const closeDrawerAfterNavigation = useCallback(() => setIsOpen(false), []);
  const closeDrawer = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!walletRef.current?.contains(event.target as Node)) setWalletOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousBody = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
    };
  }, [isOpen]);

  const topLinks = [
    { href: `/shop?category=men`, label: t("menswear") },
    { href: `/shop?category=women`, label: t("womenswear") },
  ];

  const drawerLinks = [
    { href: `/shop`, label: "All products" },
    ...topLinks,
    { href: `/shop?sort=new`, label: t("newDrop") },
    { href: `/lookbook`, label: t("lookbook") },
    { href: `/archive`, label: t("archive") },
    { href: `/square`, label: t("square") },
    { href: `/vlm-token`, label: t("vlm") },
    { href: `/account`, label: "Account / Dashboard" },
  ];

  const legalLinks = [
    { href: `/legal/terms`, label: t("terms") },
    { href: `/legal/privacy`, label: t("privacy") },
    { href: `/legal/shipping`, label: t("shipping") },
    { href: `/returns`, label: t("returns") },
    { href: `/impressum`, label: t("impressum") },
    { href: `/contact`, label: t("contact") },
  ];

  const walletSummary = walletUi.connected
    ? `${trunc(walletUi.fullAddress)} · ${walletUi.network || "Wallet"}`
    : "Connect wallet";

  const connectWalletFromMenu = (kind: "metamask" | "phantom") => {
    if (walletUi.connected) return;
    navigator.vibrate?.(25);
    void wallet.connect(kind);
  };

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
            className="fixed inset-0 z-[100] bg-black/48 backdrop-blur-xl"
          />
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            initial={{ x: "-112%", opacity: 0.85 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-112%", opacity: 0 }}
            transition={drawerTransition}
            className="fixed bottom-4 left-4 top-4 z-[110] flex h-[calc(100dvh-2rem)] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1C] text-white shadow-2xl shadow-black/60 outline-none"
          >
            <div className="flex min-h-full flex-col overflow-y-auto px-6 py-6 luxury-scrollbar">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <Link href="/" onClick={closeDrawerAfterNavigation} className="font-sans text-2xl font-semibold uppercase tracking-[0.22em] text-white">
                  VELMÈRE
                </Link>
                <button type="button" aria-label={common("close")} onClick={() => closeDrawer()} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/64 transition-colors hover:border-white/25 hover:bg-white/5 hover:text-white">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <nav className="py-7" aria-label={t("shopMenu")}>
                <p className="luxury-kicker text-white/38">Commerce / Universe</p>
                <div className="mt-4 space-y-1">
                  {drawerLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeDrawerAfterNavigation} className="flex min-h-11 items-center border-b border-white/10 py-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white/84 transition-colors hover:text-velmere-gold">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="mt-auto space-y-7 border-t border-white/10 pt-6">
                <div>
                  <p className="luxury-kicker text-white/38">Wallet access</p>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/24 p-3">
                    <p className="break-all font-mono text-[10px] uppercase tracking-[0.16em] text-white/48">
                      {walletUi.connected ? walletUi.fullAddress : "MetaMask / Phantom mobile ready"}
                    </p>
                    {walletUi.connected ? (
                      <div className="mt-3 grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/46">
                        <div className="flex justify-between gap-3"><span>Network</span><span className="text-white/72">{walletUi.network || "Wallet"}</span></div>
                        <div className="flex justify-between gap-3"><span>Balance</span><span className="text-white/72">{walletUi.tokenBalanceLabel || "Connected"}</span></div>
                      </div>
                    ) : null}
                    {!walletUi.connected ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => connectWalletFromMenu("metamask")} className="min-h-11 rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c8a96a] transition hover:bg-[#c8a96a]/15 active:scale-95">MetaMask</button>
                        <button type="button" onClick={() => connectWalletFromMenu("phantom")} className="min-h-11 rounded-full border border-white/10 bg-white/[0.045] px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/[0.08] active:scale-95">Phantom</button>
                      </div>
                    ) : null}
                    {walletUi.connected ? (
                      <button type="button" onClick={() => wallet.disconnect()} className="mt-2 min-h-11 w-full rounded-full border border-white/10 bg-white/[0.035] px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:border-red-400/30 hover:text-red-200 active:scale-95">Disconnect</button>
                    ) : null}
                  </div>
                </div>
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
      <header className="fixed inset-x-0 top-0 z-[50] border-b border-white/10 bg-[#080809]/94 text-white shadow-[0_18px_70px_rgba(0,0,0,0.58)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#080809]/88">
        <div className="relative flex min-h-[72px] w-full max-w-none items-center gap-3 px-4 pt-[env(safe-area-inset-top)] md:h-20 md:px-6 md:pt-0 xl:px-8">
          <button ref={menuButtonRef} type="button" aria-expanded={isOpen} aria-controls="velmere-shop-drawer" onMouseEnter={playHover} onClick={() => { playClick(); closeCart(); setIsOpen(true); }} className="relative z-20 inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#151517] px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 transition hover:border-white/20 hover:bg-[#1F1F22] hover:text-white active:scale-95">
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("menu")}</span>
          </button>
          {isVlmRoute ? <div className="absolute left-[7.15rem] top-1/2 z-20 hidden -translate-y-1/2 xl:flex 2xl:left-[7.9rem]"><VlmModeSwitch inline /></div> : null}

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-5 whitespace-nowrap xl:gap-7">
            <Link href="/" aria-label="Velmère" onMouseEnter={playHover} className="pointer-events-auto font-sans text-[1.45rem] font-semibold uppercase tracking-[0.22em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.8)] max-[370px]:text-[1.22rem] max-[370px]:tracking-[0.16em] md:text-[1.9rem]">
              VELMÈRE
            </Link>
            <nav aria-label="Primary" className="pointer-events-auto hidden items-center gap-2 lg:flex">
              {topLinks.map((link) => (
                <Link key={link.href} href={link.href} onMouseEnter={playHover} className="rounded-full px-2.5 py-2 font-mono text-[9px] xl:text-[10px] font-semibold uppercase tracking-[0.18em] text-white/62 transition hover:bg-white/[0.05] hover:text-white xl:px-4">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="min-w-0 flex-1" />
          <div className="relative z-20 ml-auto flex min-w-0 items-center justify-end gap-2">
            <AudioToggleButton />
            <div className="hidden rounded-full border border-white/10 bg-[#151517] p-1 sm:flex">
              {LOCALES.map((item) => (
                <Link key={item} href={localizedPath()} locale={item} aria-label={`${common("language")} ${item.toUpperCase()}`} aria-current={locale === item ? "page" : undefined} className={`inline-flex h-9 min-w-10 items-center justify-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${locale === item ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
                  {item.toUpperCase()}
                </Link>
              ))}
            </div>
            <div ref={walletRef} className="relative hidden md:block">
              <button type="button" onClick={() => setWalletOpen((value) => !value)} className="inline-flex h-11 max-w-[12rem] items-center gap-2 truncate rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c8a96a] transition hover:border-[#c8a96a]/45 hover:bg-[#c8a96a]/15 active:scale-95 xl:max-w-[15rem]">
                <Wallet className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{walletSummary}</span>
                {walletUi.connected ? <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" /> : null}
              </button>
              <AnimatePresence>
                {walletOpen ? (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }} className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1C] p-4 shadow-2xl shadow-black/60">
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#c8a96a]">{walletUi.connected ? "Wallet connected" : "Wallet access"}</p>
                    <p className="mt-3 break-all font-mono text-xs text-white/70">{walletUi.connected ? walletUi.fullAddress : "Choose a wallet. Mobile opens the wallet browser, then Velmère auto-requests connection."}</p>
                    {walletUi.connected ? (
                      <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-black/24 p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                        <div className="flex justify-between gap-3"><span>Network</span><span className="text-white/70">{walletUi.network || "Wallet"}</span></div>
                        <div className="flex justify-between gap-3"><span>Balance</span><span className="text-white/70">{walletUi.tokenBalanceLabel || "Connected"}</span></div>
                        <div className="flex justify-between gap-3"><span>Access</span><span className="text-[#c8a96a]">{walletUi.accessStatusLabel || "preview"}</span></div>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => connectWalletFromMenu("metamask")} className="min-h-11 rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c8a96a] transition hover:bg-[#c8a96a]/15 active:scale-95">MetaMask</button>
                        <button type="button" onClick={() => connectWalletFromMenu("phantom")} className="min-h-11 rounded-full border border-white/10 bg-white/[0.045] px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/[0.08] active:scale-95">Phantom</button>
                      </div>
                    )}
                    {walletUi.connected ? (
                      <button type="button" onClick={() => { wallet.disconnect(); setWalletOpen(false); }} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65 transition hover:border-red-400/30 hover:text-red-200 active:scale-95">
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        Disconnect wallet
                      </button>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <Link href="/account" aria-label="Account" onMouseEnter={playHover} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#151517] font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 transition hover:border-[#d4af37] hover:bg-[#1F1F22] hover:text-white active:scale-95 sm:w-auto sm:px-4">
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:ml-2 sm:inline">Account</span>
            </Link>
            <button type="button" aria-label={t("cart")} onMouseEnter={playHover} onClick={() => { playClick(); setIsOpen(false); openCart(); }} className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#151517] text-white/72 transition hover:border-white/20 hover:bg-[#1F1F22] hover:text-white active:scale-95">
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
