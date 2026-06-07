"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Globe2, LogOut, Mail, Menu, ShieldCheck, ShoppingBag, Unplug, User, Wallet, X } from "lucide-react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/navigation";
import { useCart } from "@/components/CartProvider";
import { clearWalletUiSnapshot, useWalletUiStore } from "@/store/useWalletUiStore";
import WalletConnectOptions from "@/components/wallet/WalletConnectOptions";
import { setVelmereLocalSession, useVelmereAuth } from "@/components/auth/AuthGate";
import { useProfile } from "@/lib/hooks/useProfile";
import type { ProfileRecord } from "@/lib/db/profile-service";

const LOCALES = ["en", "pl", "de"] as const;

const navLabels = {
  en: {
    collection: "Collection",
    men: "Men's collection",
    women: "Women's collection",
    vlm: "VLM",
    square: "Square",
    lookbook: "Lookbook",
    motionLab: "Motion Lab",
    community: "Community",
    support: "Support",
    login: "Login",
    contact: "Contact",
    shield: "Shield",
    research: "Research Lab",
    security: "Security",
  },
  pl: {
    collection: "Kolekcja",
    men: "Kolekcja męska",
    women: "Kolekcja damska",
    vlm: "VLM",
    square: "Square",
    lookbook: "Lookbook",
    motionLab: "Laboratorium ruchu",
    community: "Społeczność",
    support: "Pomoc",
    login: "Logowanie",
    contact: "Kontakt",
    shield: "Shield",
    research: "Research Lab",
    security: "Security",
  },
  de: {
    collection: "Kollektion",
    men: "Herrenkollektion",
    women: "Damenkollektion",
    vlm: "VLM",
    square: "Square",
    lookbook: "Lookbook",
    motionLab: "Motion Lab",
    community: "Community",
    support: "Support",
    login: "Login",
    contact: "Kontakt",
    shield: "Shield",
    research: "Research Lab",
    security: "Sicherheit",
  },
} as const;

const navCopy = {
  en: {
    account: "Account",
    login: "Login",
    privateConsole: "Private member console",
    consoleShort: "Console",
    memberLabel: "Member",
    walletPending: "wallet pending",
    connect: "Connect",
    menu: "Menu",
    wallet: "Wallet",
    optionalWallet:
      "Optional read-only wallet binding. Never enter a seed phrase.",
    disconnect: "Disconnect wallet",
    logout: "Log out",
    memberConsole: "Private member console",
    noWalletConnected: "No wallet connected",
    mail: "Mail",
  },
  pl: {
    account: "Konto",
    login: "Logowanie",
    privateConsole: "Prywatna konsola membera",
    consoleShort: "Konsola",
    memberLabel: "Member",
    walletPending: "portfel niepodłączony",
    connect: "Połącz",
    menu: "Menu",
    wallet: "Portfel",
    optionalWallet:
      "Opcjonalne połączenie read-only. Nigdy nie wpisuj seed phrase.",
    disconnect: "Odłącz portfel",
    logout: "Wyloguj",
    memberConsole: "Prywatna konsola membera",
    noWalletConnected: "Portfel niepodłączony",
    mail: "Mail",
  },
  de: {
    account: "Konto",
    login: "Login",
    privateConsole: "Private Member-Konsole",
    consoleShort: "Konsole",
    memberLabel: "Member",
    walletPending: "Wallet nicht verbunden",
    connect: "Verbinden",
    menu: "Menü",
    wallet: "Wallet",
    optionalWallet:
      "Optionale Read-only-Wallet-Verbindung. Gib niemals eine Seed Phrase ein.",
    disconnect: "Wallet trennen",
    logout: "Ausloggen",
    memberConsole: "Private Member-Konsole",
    noWalletConnected: "Wallet nicht verbunden",
    mail: "Mail",
  },
} as const;

const legalLinks = [
  { href: "/impressum", label: "Impressum / Legal Notice" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/returns", label: "Returns / Right of Withdrawal" },
  { href: "/shipping", label: "Shipping" },
  { href: "/contact", label: "Contact" },
];

function truncateAddress(value: string) {
  if (!value) return "Connect";
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

export default function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const { itemCount, openCart, closeCart } = useCart();
  const walletUi = useWalletUiStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const walletRef = useRef<HTMLDivElement | null>(null);
  const memberRef = useRef<HTMLDivElement | null>(null);
  const { ready: authReady, authenticated, localProfile } = useVelmereAuth();
  const fallbackProfile = useMemo<ProfileRecord>(() => ({
    displayName: "Velmère Member",
    handle: "velmere.member",
    bio: "",
    lastNameChange: "2026-05-01T00:00:00.000Z",
  }), []);
  const { data: profileData } = useProfile(fallbackProfile);

  useEffect(() => {
    setMenuOpen(false);
    setWalletOpen(false);
    setLanguageOpen(false);
    setMemberOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!walletRef.current?.contains(event.target as Node))
        setWalletOpen(false);
      if (!memberRef.current?.contains(event.target as Node))
        setMemberOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const onOpenWallet = () => {
      closeCart();
      setMenuOpen(false);
      setWalletOpen(true);
    };
    window.addEventListener("velmere:open-wallet", onOpenWallet);
    return () => window.removeEventListener("velmere:open-wallet", onOpenWallet);
  }, [closeCart]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const t = navCopy[locale as keyof typeof navCopy] ?? navCopy.en;
  const labels = navLabels[locale as keyof typeof navLabels] ?? navLabels.en;
  const walletLabel = walletUi.connected
    ? truncateAddress(walletUi.fullAddress)
    : t.connect;
  const isMemberActive = authReady && authenticated;
  const profile = profileData?.profile ?? fallbackProfile;
  const memberDisplayName = localProfile?.displayName ?? profile.displayName;
  const accountLabel = isMemberActive ? t.account : t.login;
  const memberAddressLabel = walletUi.connected
    ? truncateAddress(walletUi.fullAddress)
    : t.walletPending;
  const memberInitial = (memberDisplayName || "V").slice(0, 1).toUpperCase();

  const disconnectWallet = () => {
    clearWalletUiSnapshot();
    setMemberOpen(false);
  };

  const logoutMember = () => {
    clearWalletUiSnapshot();
    setVelmereLocalSession(false);
    setMemberOpen(false);
  };

  const closeMenuPanel = () => {
    setMenuOpen(false);
    setWalletOpen(false);
    setLanguageOpen(false);
    setMemberOpen(false);
  };

  const activeLocale = LOCALES.includes(locale as (typeof LOCALES)[number]) ? locale : "pl";
  const localizedAccountHref = `/${activeLocale}/account`;
  const localizedLoginHref = `/${activeLocale}/login`;

  const localizedPrimaryLinks = [
    { href: "/clothing", label: labels.collection },
    { href: "/shop?category=men", label: labels.men },
    { href: "/shop?category=women", label: labels.women },
    { href: "/vlm-token", label: labels.vlm },
    { href: "/square", label: labels.square },
    { href: "/lookbook", label: labels.lookbook },
  ];
  const desktopPrimaryLinks = [
    { href: "/clothing", label: labels.collection },
    { href: "/vlm-token", label: labels.vlm },
    { href: "/community", label: labels.community },
    { href: "/security", label: labels.security },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] border-b border-white/[0.08] bg-velmere-black/[0.78] text-velmere-ivory shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl supports-[backdrop-filter]:bg-velmere-black/[0.68]">
        <div className="relative mx-auto flex min-h-[68px] w-full max-w-none items-center gap-2 px-3 pt-[env(safe-area-inset-top)] md:h-20 md:gap-3 md:px-8 md:pt-0 xl:px-[4.75rem]">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Open menu"
            onClick={() => {
              closeCart();
              setMenuOpen(true);
            }}
            className="relative z-[12] inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-0 font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.62] transition hover:border-white/[0.22] hover:text-white active:scale-95 sm:h-11 sm:min-w-[5.6rem] sm:px-4"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">{t.menu}</span>
          </button>

          <Link
            href="/"
            aria-label="Velmère home"
            className="pointer-events-auto absolute left-1/2 z-[10] -translate-x-1/2 rounded-full px-3 py-2 font-sans text-[1.02rem] font-semibold uppercase tracking-[0.20em] text-white transition hover:text-velmere-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velmere-gold/[0.45] max-[360px]:text-[0.88rem] max-[360px]:tracking-[0.14em] sm:text-[1.28rem] md:text-[1.62rem] xl:text-[1.7rem]"
          >
            VELMÈRE
          </Link>

          <nav
            aria-label="Primary navigation"
            className="relative z-[9] ml-3 mr-auto hidden max-w-[38rem] shrink items-center gap-1 overflow-hidden 2xl:flex"
          >
            {desktopPrimaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="pointer-events-auto rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.48] transition hover:bg-white/[0.045] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-[12] ml-auto flex shrink-0 items-center justify-end gap-1.5 md:gap-2">
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLanguageOpen((value) => !value)}
                aria-label="Change language"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/[0.62] transition hover:border-white/[0.22] hover:text-white active:scale-95"
              >
                <Globe2 className="h-4 w-4 animate-[spin_8s_linear_infinite]" />
              </button>
              <AnimatePresence>
                {languageOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 grid w-36 gap-1 rounded-2xl border border-white/[0.10] bg-[#111113] p-2 shadow-2xl shadow-black/[0.60]"
                  >
                    {LOCALES.map((item) => (
                      <Link
                        key={item}
                        href={pathname}
                        locale={item}
                        className={`rounded-xl px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition ${locale === item ? "bg-white text-black" : "text-white/[0.54] hover:bg-white/[0.055] hover:text-white"}`}
                      >
                        {item}
                      </Link>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>


            <Link
              href="/market-integrity"
              aria-label={labels.shield}
              title={labels.shield}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.18] bg-velmere-gold/[0.06] text-velmere-gold transition hover:border-velmere-gold/[0.38] hover:bg-velmere-gold/[0.11] active:scale-95 md:inline-flex"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>

            <div ref={walletRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setWalletOpen((value) => !value)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-velmere-gold/[0.25] bg-velmere-gold/[0.10] px-3 font-mono text-[9px] uppercase tracking-[0.14em] text-velmere-gold transition hover:border-velmere-gold/[0.45] hover:bg-velmere-gold/[0.15] active:scale-95"
              >
                <Wallet className="h-3.5 w-3.5" />
                {walletLabel}
              </button>
              <AnimatePresence>
                {walletOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/[0.10] bg-[#111113] p-4 shadow-2xl shadow-black/[0.60]"
                  >
                    <p className="velmere-label text-velmere-gold">
                      {t.wallet}
                    </p>
                    <p className="mt-3 break-all text-xs leading-6 text-white/[0.60]">
                      {walletUi.connected
                        ? walletUi.fullAddress
                        : t.optionalWallet}
                    </p>
                    <div className="mt-4">
                      <WalletConnectOptions compact />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <a
              href={isMemberActive ? localizedAccountHref : localizedLoginHref}
              aria-label={accountLabel}
              title={accountLabel}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/[0.62] transition hover:border-white/[0.22] hover:text-white active:scale-95 sm:h-11 sm:w-11"
            >
              <User className="h-4 w-4" />
            </a>
            <button
              type="button"
              aria-label="Open private mail"
              onClick={() => window.dispatchEvent(new Event("velmere:open-mail"))}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/[0.62] transition hover:border-white/[0.22] hover:text-white active:scale-95 lg:inline-flex"
            >
              <Mail className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.055] text-white/[0.78] shadow-[0_10px_34px_rgba(0,0,0,0.24)] transition hover:border-white/[0.28] hover:text-white active:scale-95 sm:h-11 sm:w-11"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-black bg-velmere-gold px-1 text-[10px] font-semibold text-black">
                  {itemCount}
                </span>
              ) : null}
            </button>
            {isMemberActive ? (
              <div ref={memberRef} className="relative hidden shrink-0 2xl:block">
                <button
                  type="button"
                  aria-expanded={memberOpen}
                  aria-label={`${memberDisplayName} (${memberAddressLabel})`}
                  onClick={() => setMemberOpen((value) => !value)}
                  className="group inline-flex max-w-[13rem] items-center gap-2 rounded-full border border-velmere-gold/[0.20] bg-velmere-gold/[0.07] py-1.5 pl-2 pr-2.5 text-left shadow-[0_0_30px_rgba(196,168,91,0.08)] transition hover:border-velmere-gold/[0.38] hover:bg-velmere-gold/[0.11] active:scale-[0.985]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-velmere-gold/[0.28] bg-black/[0.36] font-serif text-sm text-velmere-gold">
                    {memberInitial}
                  </span>
                  <span className="min-w-0 leading-none">
                    <span className="block truncate text-[10.5px] font-semibold text-white/[0.82]">
                      {memberDisplayName}
                    </span>
                    <span className="mt-1 block truncate font-mono text-[8.5px] uppercase tracking-[0.10em] text-white/[0.38]">
                      ({memberAddressLabel})
                    </span>
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/[0.36] transition ${memberOpen ? "rotate-180 text-velmere-gold" : ""}`} />
                </button>
                <AnimatePresence>
                  {memberOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#111113] p-2 shadow-2xl shadow-black/[0.65]"
                    >
                      <div className="rounded-xl border border-white/[0.08] bg-black/[0.20] p-3">
                        <p className="truncate text-sm font-semibold text-white/[0.86]">{memberDisplayName}</p>
                        <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/[0.38]">
                          {walletUi.connected ? walletUi.fullAddress : t.noWalletConnected}
                        </p>
                      </div>
                      <a
                        href={localizedAccountHref}
                        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.70] transition hover:bg-white/[0.055] hover:text-velmere-gold"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {t.memberConsole}
                      </a>
                      <button
                        type="button"
                        onClick={disconnectWallet}
                        disabled={!walletUi.connected}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.60] transition hover:bg-white/[0.055] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Unplug className="h-4 w-4" />
                        {walletUi.connected ? t.disconnect : t.noWalletConnected}
                      </button>
                      <button
                        type="button"
                        onClick={logoutMember}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.60] transition hover:bg-white/[0.055] hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[90] bg-black/[0.62] backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              className="fixed bottom-4 left-4 top-4 z-[100] flex w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#111113] text-velmere-ivory shadow-2xl shadow-black/[0.70]"
              initial={{ x: "-108%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-108%", opacity: 0 }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b border-white/[0.10] px-6 py-5">
                <Link
                  href="/"
                  onClick={closeMenuPanel}
                  className="font-sans text-2xl font-semibold uppercase tracking-[0.22em]"
                >
                  VELMÈRE
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.10] text-white/[0.60] transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-6 luxury-scrollbar">
                <p className="velmere-label text-velmere-gold">Explore</p>
                <nav className="mt-4 grid gap-6" aria-label="Menu navigation">
                  {[
                    {
                      title:
                        locale === "pl"
                          ? "SKLEP"
                          : locale === "de"
                            ? "SHOP"
                            : "SHOP",
                      links: [
                        localizedPrimaryLinks[0],
                        localizedPrimaryLinks[1],
                        localizedPrimaryLinks[2],
                        { href: "/lookbook", label: labels.lookbook },
                        { href: "/faq", label: labels.support },
                      ],
                    },
                    {
                      title:
                        locale === "pl"
                          ? "SPOŁECZNOŚĆ"
                          : locale === "de"
                            ? "COMMUNITY"
                            : "COMMUNITY",
                      links: [
                        { href: "/square", label: labels.square },
                        { href: "/community", label: labels.community },
                      ],
                    },
                    {
                      title: "VLM / WEB3",
                      links: [
                        { href: "/vlm-token", label: labels.vlm },
                        { href: "/market-integrity", label: labels.shield },
                        { href: "/security", label: labels.security },
                        { href: "/research-lab", label: labels.research },
                        { href: "/token-agreement", label: "Token agreement" },
                      ],
                    },
                    {
                      title:
                        locale === "pl"
                          ? "KONTO"
                          : locale === "de"
                            ? "KONTO"
                            : "ACCOUNT",
                      links: [
                        { href: isMemberActive ? localizedAccountHref : localizedLoginHref, label: isMemberActive ? t.privateConsole : labels.login },
                        { href: localizedAccountHref, label: t.account },
                        { href: "/contact", label: labels.contact },
                      ],
                    },
                  ].map((group) => (
                    <div key={group.title}>
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/[0.35]">
                        {group.title}
                      </p>
                      <div className="mt-2 grid">
                        {group.links.map((link) => {
                          const isHardLocaleHref = link.href.startsWith(`/${activeLocale}/`);
                          const className = "border-b border-white/[0.10] py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/[0.78] transition hover:text-velmere-gold";

                          return isHardLocaleHref ? (
                            <a key={link.href} href={link.href} onClick={closeMenuPanel} className={className}>
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMenuPanel}
                              className={className}
                            >
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                <div className="mt-8 rounded-2xl border border-white/[0.10] bg-black/[0.24] p-4">
                  <p className="velmere-label text-velmere-gold">
                    Wallet safety
                  </p>
                  <p className="mt-3 text-xs leading-6 text-white/[0.46]">
                    Connect with a wallet signature. Never enter your seed phrase
                    or private key.
                  </p>
                </div>

                <div className="mt-8">
                  <p className="velmere-label text-velmere-gold">Legal</p>
                  <div className="mt-4 grid gap-3">
                    {legalLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMenuPanel}
                        className="text-xs uppercase tracking-[0.16em] text-white/[0.44] transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="velmere-label text-velmere-gold">Language</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {LOCALES.map((item) => (
                      <Link
                        key={item}
                        href={pathname || "/"}
                        locale={item}
                        onClick={closeMenuPanel}
                        aria-current={locale === item ? "page" : undefined}
                        className={`inline-flex h-10 items-center rounded-full border px-4 text-[11px] uppercase tracking-[0.18em] transition ${locale === item ? "border-velmere-gold text-velmere-gold" : "border-white/[0.10] text-white/[0.48] hover:text-white"}`}
                      >
                        {item.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
