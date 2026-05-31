"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight, ShieldCheck, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import WalletSafetyExplainer from "@/components/vlm/WalletSafetyExplainer";
import WalletConnectOptions from "@/components/wallet/WalletConnectOptions";

const copy = {
  en: {
    trigger: "Access route",
    kicker: "VLM / ACCESS ROUTE",
    title: "Token access panel.",
    body: "VLM is not active for purchase yet. This panel prepares the future swap, claim and wallet-check flow without pretending that a live contract exists.",
    wallet: "Wallet route",
    swap: "Swap preview",
    security: "Security notes",
    noCustody: "No custody. No seed phrase. No price promise.",
    metamask: "MetaMask route",
    phantom: "Phantom route",
    connect: "Connect wallet",
    waitlist: "Join waitlist",
    close: "Close VLM access panel",
    pending:
      "Contract address, ABI, audit and legal copy must be added before enabling real purchase or swap actions.",
  },
  pl: {
    trigger: "Ścieżka dostępu",
    kicker: "VLM / ŚCIEŻKA DOSTĘPU",
    title: "Panel dostępu tokena.",
    body: "VLM nie jest jeszcze aktywny do zakupu. Ten panel przygotowuje przyszły flow wymiany, claimu i sprawdzania portfela bez udawania, że kontrakt już działa.",
    wallet: "Ścieżka portfela",
    swap: "Podgląd wymiany",
    security: "Notatki bezpieczeństwa",
    noCustody: "Bez custody. Bez seed phrase. Bez obietnicy ceny.",
    metamask: "MetaMask",
    phantom: "Phantom",
    connect: "Połącz portfel",
    waitlist: "Dołącz do listy",
    close: "Zamknij panel VLM",
    pending:
      "Adres kontraktu, ABI, audyt i tekst prawny muszą zostać dodane przed prawdziwym zakupem albo wymianą.",
  },
  de: {
    trigger: "Access route",
    kicker: "VLM / ACCESS ROUTE",
    title: "Token-Zugangspanel.",
    body: "VLM ist noch nicht zum Kauf aktiv. Dieses Panel bereitet Swap-, Claim- und Wallet-Check-Flows vor, ohne einen Live-Vertrag vorzutäuschen.",
    wallet: "Wallet route",
    swap: "Swap preview",
    security: "Security notes",
    noCustody: "Keine Verwahrung. Keine Seed Phrase. Kein Preisversprechen.",
    metamask: "MetaMask",
    phantom: "Phantom",
    connect: "Wallet verbinden",
    waitlist: "Liste beitreten",
    close: "VLM-Zugangspanel schließen",
    pending:
      "Contract address, ABI, audit and legal copy must be added before enabling real purchase or swap actions.",
  },
} as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function VlmBuyAccessPanel() {
  const locale = useLocale() as keyof typeof copy;
  const t = copy[locale] ?? copy.en;
  const walletUi = useWalletUiStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.trigger}
        className="fixed left-0 top-[calc(50%+5.2rem)] z-[1180] hidden -translate-y-1/2 items-center gap-2 rounded-r-2xl border border-l-0 border-velmere-gold/[0.25] bg-[#111113]/[0.95] px-3 py-5 text-velmere-gold shadow-[0_24px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition hover:bg-[#17181B] active:scale-95 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
        <span className="[writing-mode:vertical-rl] rotate-180 font-mono text-[9px] font-black uppercase tracking-[0.2em]">
          VLM
        </span>
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
          <motion.div
            className="fixed inset-0 z-[1200] bg-[#050505]/[0.92] backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
          >
            <button
              type="button"
              aria-label={t.close}
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="vlm-access-panel-title"
              initial={{ x: "-105%", opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-105%", opacity: 0 }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-[1201] flex h-[100dvh] w-full max-w-[36rem] flex-col overscroll-contain border-r border-white/[0.10] bg-[#111113] text-velmere-ivory shadow-[40px_0_140px_rgba(0,0,0,0.74)]"
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)] md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="velmere-label text-velmere-gold">
                      {t.kicker}
                    </p>
                    <h2
                      id="vlm-access-panel-title"
                      className="mt-5 font-serif text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.055em]"
                    >
                      {t.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label={t.close}
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-white/[0.50] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-velmere-gold"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-6 text-sm leading-7 text-velmere-muted">
                  {t.body}
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    [
                      t.wallet,
                      walletUi.connected ? walletUi.shortAddress : t.connect,
                    ],
                    [t.swap, "VLM / ETH / SOL — read-only preview"],
                    [t.security, t.noCustody],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/[0.10] bg-black/[0.25] p-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/[0.40]">
                        {label}
                      </p>
                      <p className="mt-2 break-all text-sm leading-6 text-white/[0.70]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <WalletConnectOptions showStatus={false} />
                  <button
                    type="button"
                    className="velmere-button-primary mt-3 w-full"
                  >
                    {t.waitlist}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6">
                  <WalletSafetyExplainer />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-velmere-gold/[0.20] bg-velmere-gold/[0.06] p-4 text-xs leading-6 text-white/[0.60]">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-velmere-gold" />
                  <span>{t.pending}</span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
