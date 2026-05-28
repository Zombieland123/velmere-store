"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { Link, usePathname } from "@/navigation";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import VlmModeSwitch from "@/components/vlm/VlmModeSwitch";

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

export default function Navbar() {
  const t = useTranslations("Nav");
  const common = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount, openCart, closeCart } = useCart();
  const walletUi = useWalletUiStore();
  const isVlmRoute = pathname.includes("/vlm-token");

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shopButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  const localizedPath = useCallback(
    (targetLocale: string) => {
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
    if (restoreFocus) window.setTimeout(() => shopButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previousBody = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousHtml;
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
    { href: `/vlm-token`, label: t("vlm") },
    { href: `/square`, label: t("square") },
  ];

  const editorialLinks = [{ href: `/shop`, label: t("shopAll") }];

  const legalLinks = [
    { href: `/terms`, label: t("terms") },
    { href: `/privacy`, label: t("privacy") },
    { href: `/shipping`, label: t("shipping") },
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl"
          />

          <motion.aside
            ref={drawerRef}
            id="velmere-shop-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="velmere-shop-drawer-title"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={drawerTransition}
            className="fixed inset-y-0 left-0 z-[110] flex h-dvh min-h-dvh w-[min(22rem,calc(100vw-2rem))] flex-col overflow-y-auto rounded-r-[3rem] bg-black/95 text-white shadow-2xl backdrop-blur-3xl no-scrollbar"
          >
            <div className="absolute bottom-5 left-0 top-5 w-px bg-gradient-to-b from-transparent via-[#d4af37]/50 to-transparent" />
            <div className="flex min-h-full flex-col px-6 py-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <Link
                  id="velmere-shop-drawer-title"
                  href="/"
                  onClick={closeDrawerAfterNavigation}
                  className="font-sans text-2xl font-semibold uppercase tracking-[0.18em] text-white"
                >
                  VELMÈRE
                </Link>
                <button
                  type="button"
                  aria-label={common("close")}
                  onClick={() => closeDrawer()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/64 transition-colors hover:border-white/25 hover:text-white"
                >
                  <CloseGlyph />
                </button>
              </div>

              <nav className="py-7" aria-label={t("shopMenu")}>
                <p className="luxury-kicker text-white/38">{t("primary")}</p>
                <div className="mt-4 space-y-1">
                  {primaryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeDrawerAfterNavigation}
                      className="flex min-h-11 items-center border-b border-white/10 py-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-white/84 transition-colors hover:text-velmere-gold"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="mt-auto space-y-7 border-t border-white/10 pt-6">
                <p className="luxury-kicker text-white/38">{t("editorial")}</p>
                <div className="grid gap-2">
                  {editorialLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeDrawerAfterNavigation}
                      className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/64 transition-colors hover:border-white/25 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div>
                  <p className="luxury-kicker text-white/38">{common("language")}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {LOCALES.map((item) => (
                      <Link
                        key={item}
                        href={localizedPath(item)}
                        locale={item}
                        onClick={closeDrawerAfterNavigation}
                        aria-current={locale === item ? "page" : undefined}
                        className={`inline-flex h-10 items-center rounded-full border px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                          locale === item
                            ? "border-velmere-gold text-velmere-gold"
                            : "border-white/10 text-white/48 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {t(`locales.${item}`)}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="luxury-kicker text-white/38">{t("account")}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/account"
                      onClick={closeDrawerAfterNavigation}
                      className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62 luxury-hover hover:border-white/25 hover:text-white"
                    >
                      {t("loginCta")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeDrawerAfterNavigation();
                        openCart();
                      }}
                      className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62 luxury-hover hover:border-white/25 hover:text-white"
                    >
                      {t("cart")}{itemCount > 0 ? ` · ${itemCount}` : ""}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="luxury-kicker text-white/38">{t("legal")}</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeDrawerAfterNavigation}
                        className="text-[11px] uppercase tracking-[0.18em] text-white/46 transition-colors hover:text-white"
                      >
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
      <header className="fixed inset-x-0 top-0 z-[50] border-b border-white/5 bg-black/55 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-5 pt-[env(safe-area-inset-top)] md:h-20 md:px-12 md:pt-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              ref={shopButtonRef}
              type="button"
              aria-expanded={isOpen}
              aria-controls="velmere-shop-drawer"
              onClick={() => {
                closeCart();
                setIsOpen(true);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72 luxury-hover hover:border-white/20 hover:text-white"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              {t("menu")}
            </button>
            {isVlmRoute ? (
              <div className="hidden lg:block">
                <VlmModeSwitch inline />
              </div>
            ) : null}
          </div>

          <Link
            href="/"
            aria-label="Velmère"
            className="absolute left-1/2 -translate-x-1/2 shrink-0 font-sans text-2xl font-semibold uppercase tracking-[0.18em] text-white md:static md:translate-x-0 md:text-3xl"
          >
            VELMÈRE
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2 md:gap-6">
            {walletUi.connected ? (
              <div className="hidden items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#FFFFF0]/82 lg:flex">
                <span className="font-mono tabular-nums text-[#d4af37]">{walletUi.tokenBalanceLabel}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="font-mono text-white/66">{walletUi.shortAddress}</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[9px] text-white/58">
                  {walletUi.network}
                </span>
                <span className="rounded-full border border-[#d4af37]/30 px-2 py-0.5 font-mono text-[9px] text-[#d4af37]">
                  {walletUi.accessStatusLabel}
                </span>
              </div>
            ) : null}
            <div className="hidden rounded-full border border-white/10 p-1 sm:flex">
              {LOCALES.map((item) => (
                <Link
                  key={item}
                  href={localizedPath(item)}
                  locale={item}
                  aria-label={`${common("language")} ${item.toUpperCase()}`}
                  aria-current={locale === item ? "page" : undefined}
                  className={`inline-flex h-9 min-w-10 items-center justify-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    locale === item ? "bg-white text-black" : "text-white/50 hover:text-white"
                  }`}
                >
                  {item.toUpperCase()}
                </Link>
              ))}
            </div>
            {!walletUi.connected ? (
              <span className="hidden h-11 items-center rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] lg:inline-flex">
                {t("guestMode")}
              </span>
            ) : null}
            <Link
              href="/account"
              aria-label={t("loginCta")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/62 luxury-hover hover:border-[#d4af37] hover:text-white sm:w-auto sm:px-4"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:ml-2 sm:inline">{t("loginCta")}</span>
            </Link>
            <button
              type="button"
              aria-label={t("cart")}
              onClick={() => {
                setIsOpen(false);
                openCart();
              }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/72 luxury-hover hover:border-white/20 hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-black bg-velmere-gold px-1 text-[10px] font-semibold text-black">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
