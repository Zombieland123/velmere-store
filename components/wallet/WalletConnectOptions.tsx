"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ExternalLink, QrCode, ShieldCheck, WalletCards, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import { useWalletUiStore } from "@/store/useWalletUiStore";

const copy = {
  en: {
    current: "Current wallet",
    empty: "No wallet connected.",
    safety: "Read-only connection. Velmère never asks for seed phrases or private keys.",
    oneOnly: "One wallet at a time. Disconnect before switching.",
    disconnect: "Disconnect wallet",
    extension: "Browser extension",
    mobile: "Mobile / QR",
    hardware: "Hardware route",
    other: "Other wallets",
    otherTitle: "Choose another wallet route",
    otherBody: "Mobile wallets open through WalletConnect when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is configured. Browser-injected wallets open directly in the current browser.",
    notInstalled: "Install / open",
    statusReady: "Ready",
    statusPreview: "Preview",
    primary: "Main routes",
    openOther: "Open wallet panel",
    closeOther: "Close wallet panel",
    installHint: "If the wallet is not injected, the button opens the official wallet page in a new tab.",
    walletRoutes: "Wallet routes",
    solanaPreview: "Solana / EVM preview",
    injectedEvm: "Injected EVM",
    browserWallet: "Browser Wallet",
    closeWalletPanel: "Close wallet panel",
  },
  pl: {
    current: "Aktualny portfel",
    empty: "Portfel nie jest połączony.",
    safety: "Połączenie read-only. Velmère nigdy nie prosi o seed phrase ani klucz prywatny.",
    oneOnly: "Jeden portfel naraz. Odłącz obecny portfel przed zmianą.",
    disconnect: "Odłącz portfel",
    extension: "Rozszerzenie przeglądarki",
    mobile: "Mobile / QR",
    hardware: "Ścieżka hardware",
    other: "Inne portfele",
    otherTitle: "Wybierz inną ścieżkę portfela",
    otherBody: "Portfele mobilne otwierają się przez WalletConnect po ustawieniu NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Portfele injected działają bezpośrednio w przeglądarce.",
    notInstalled: "Zainstaluj / otwórz",
    statusReady: "Gotowe",
    statusPreview: "Podgląd",
    primary: "Główne ścieżki",
    openOther: "Otwórz panel portfeli",
    closeOther: "Zamknij panel portfeli",
    installHint: "Jeżeli portfel nie jest wstrzyknięty w przeglądarce, przycisk otworzy oficjalną stronę portfela w nowej karcie.",
    walletRoutes: "Ścieżki portfeli",
    solanaPreview: "Podgląd Solana / EVM",
    injectedEvm: "Wstrzyknięty EVM",
    browserWallet: "Portfel przeglądarki",
    closeWalletPanel: "Zamknij panel portfeli",
  },
  de: {
    current: "Aktuelles Wallet",
    empty: "Kein Wallet verbunden.",
    safety: "Read-only Verbindung. Velmère fragt nie nach Seed Phrase oder Private Key.",
    oneOnly: "Ein Wallet gleichzeitig. Trenne das aktuelle Wallet vor dem Wechsel.",
    disconnect: "Wallet trennen",
    extension: "Browser-Erweiterung",
    mobile: "Mobile / QR",
    hardware: "Hardware Route",
    other: "Weitere Wallets",
    otherTitle: "Weitere Wallet-Route wählen",
    otherBody: "Mobile Wallets öffnen über WalletConnect, wenn NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID konfiguriert ist. Browser-Wallets öffnen direkt im aktuellen Browser.",
    notInstalled: "Installieren / öffnen",
    statusReady: "Bereit",
    statusPreview: "Vorschau",
    primary: "Hauptrouten",
    openOther: "Wallet-Panel öffnen",
    closeOther: "Wallet-Panel schließen",
    installHint: "Wenn das Wallet nicht im Browser injiziert ist, öffnet der Button die offizielle Wallet-Seite in einem neuen Tab.",
    walletRoutes: "Wallet-Routen",
    solanaPreview: "Solana / EVM Vorschau",
    injectedEvm: "Injiziertes EVM",
    browserWallet: "Browser-Wallet",
    closeWalletPanel: "Wallet-Panel schließen",
  },
} as const;

type WalletConnectOptionsProps = {
  compact?: boolean;
  showStatus?: boolean;
};

type WalletOption = {
  key: string;
  label: string;
  icon: string;
  description: string;
  action: () => Promise<void> | void;
  fallbackHref?: string;
  available?: boolean;
  featured?: boolean;
};

type AnchorRect = { left: number; top: number; right: number; bottom: number; width: number; height: number };

function WalletBadge({ icon, label, featured = false }: { icon: string; label: string; featured?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
        featured
          ? "border-velmere-gold/[0.35] bg-velmere-gold/[0.14] text-velmere-gold"
          : "border-white/[0.10] bg-white/[0.055] text-white/[0.82]"
      }`}
      title={label}
    >
      {icon}
    </span>
  );
}

function WalletRow({ option, readyLabel, previewLabel }: { option: WalletOption; readyLabel: string; previewLabel: string }) {
  const runAction = () => {
    if (!option.available && option.fallbackHref && typeof window !== "undefined") {
      window.open(option.fallbackHref, "_blank", "noopener,noreferrer");
      return;
    }
    void option.action();
  };

  return (
    <button
      type="button"
      onClick={runAction}
      className={`group grid min-h-[5rem] w-full grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 active:scale-[0.985] ${
        option.featured
          ? "border-velmere-gold/[0.30] bg-[linear-gradient(135deg,rgba(200,169,106,0.18),rgba(255,255,255,0.045))] hover:border-velmere-gold/[0.45]"
          : "border-white/[0.10] bg-white/[0.034] hover:border-white/[0.20] hover:bg-white/[0.055]"
      }`}
    >
      <WalletBadge icon={option.icon} label={option.label} featured={option.featured} />
      <span className="min-w-0 flex-1">
        <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[0.92rem] font-semibold leading-5 text-white/[0.86] sm:text-[0.98rem]">{option.label}</span>
        <span className="mt-1 block font-mono text-[9px] uppercase leading-4 tracking-[0.14em] text-white/[0.38]">{option.description}</span>
      </span>
      <span className="col-span-2 ml-[3.75rem] inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-white/[0.10] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.11em] text-white/[0.42] group-hover:text-velmere-gold">
        {option.available ? <CheckCircle2 className="h-3 w-3 text-velmere-gold" /> : <ExternalLink className="h-3 w-3" />}
        {option.available ? readyLabel : previewLabel}
      </span>
    </button>
  );
}

function OtherWalletPanel({
  open,
  onClose,
  title,
  body,
  hint,
  routesLabel,
  closeLabel,
  options,
  readyLabel,
  previewLabel,
  anchorRect,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  hint: string;
  routesLabel: string;
  closeLabel: string;
  options: WalletOption[];
  readyLabel: string;
  previewLabel: string;
  anchorRect: AnchorRect | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setMounted(true);
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!mounted) return null;

  const mobile = viewport.width < 768;
  const panelWidth = mobile ? Math.max(0, viewport.width - 24) : Math.min(430, viewport.width - 32);
  const panelMaxHeight = mobile ? Math.max(0, viewport.height - 28) : Math.min(680, viewport.height - 40);
  const anchorCenterY = anchorRect ? anchorRect.top + anchorRect.height / 2 : viewport.height / 2;
  let left = anchorRect ? anchorRect.right + 16 : Math.max(12, (viewport.width - panelWidth) / 2);
  let opensRight = true;

  if (mobile) {
    left = 12;
    opensRight = true;
  } else if (left + panelWidth > viewport.width - 14) {
    left = Math.max(14, (anchorRect?.left ?? viewport.width) - panelWidth - 16);
    opensRight = false;
  }

  const top = mobile
    ? 14
    : Math.min(Math.max(anchorCenterY - panelMaxHeight / 2, 88), Math.max(88, viewport.height - panelMaxHeight - 14));
  const showBridge = Boolean(anchorRect && !mobile && opensRight);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[1290] bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          {showBridge && anchorRect ? (
            <motion.span
              aria-hidden="true"
              className="fixed z-[1298] h-px origin-left bg-gradient-to-r from-velmere-gold/[0.75] via-velmere-gold/[0.35] to-transparent shadow-[0_0_24px_rgba(200,169,106,0.28)]"
              style={{
                left: anchorRect.right + 2,
                top: anchorCenterY,
                width: Math.max(8, left - anchorRect.right - 2),
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}
          <motion.aside
            initial={{ opacity: 0, x: mobile ? 0 : opensRight ? -34 : 34, y: mobile ? 16 : 0, scale: mobile ? 0.985 : 1 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: mobile ? 0 : opensRight ? -24 : 24, y: mobile ? 12 : 0, scale: mobile ? 0.985 : 1 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="fixed z-[1300] flex flex-col overflow-hidden rounded-[2rem] border border-velmere-gold/[0.20] bg-[#101012]/[0.98] text-white shadow-[0_42px_160px_rgba(0,0,0,0.88)] ring-1 ring-white/[0.05] backdrop-blur-2xl"
            style={{ left, top, width: panelWidth, maxHeight: panelMaxHeight }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.10] p-5">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-velmere-gold">{routesLabel}</p>
                <h3 className="mt-3 font-serif text-[clamp(1.85rem,4vw,3rem)] leading-none tracking-[-0.04em] text-white">{title}</h3>
                <p className="mt-3 max-w-md text-xs leading-6 text-white/[0.52]">{body}</p>
              </div>
              <button type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/[0.10] text-white/[0.50] transition hover:text-white" aria-label={closeLabel}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 luxury-scrollbar">
              <div className="grid gap-3">
                {options.map((option) => (
                  <WalletRow key={option.key} option={option} readyLabel={readyLabel} previewLabel={previewLabel} />
                ))}
              </div>
              <div className="mt-4 rounded-3xl border border-velmere-gold/[0.20] bg-velmere-gold/[0.055] p-4 text-xs leading-6 text-white/[0.55]">
                <QrCode className="mb-2 h-4 w-4 text-velmere-gold" />
                {hint}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default function WalletConnectOptions({ compact = false, showStatus = true }: WalletConnectOptionsProps) {
  const locale = useLocale() as keyof typeof copy;
  const t = copy[locale] ?? copy.en;
  const wallet = useWalletConnect();
  const walletUi = useWalletUiStore();
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherAnchor, setOtherAnchor] = useState<AnchorRect | null>(null);
  const otherButtonRef = useRef<HTMLButtonElement | null>(null);

  const openOtherWallets = () => {
    const rect = otherButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setOtherAnchor({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height });
    }
    setOtherOpen(true);
  };


  useEffect(() => {
    if (!otherOpen) return;
    const updateAnchor = () => {
      const rect = otherButtonRef.current?.getBoundingClientRect();
      if (rect) {
        setOtherAnchor({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height });
      }
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [otherOpen]);

  const primaryOptions: WalletOption[] = [
    {
      key: "metamask",
      label: "MetaMask",
      icon: "🦊",
      description: t.extension,
      action: wallet.connectMetaMask,
      available: wallet.detectedWallets.metamask,
      featured: true,
    },
    {
      key: "phantom",
      label: "Phantom",
      icon: "👻",
      description: t.solanaPreview,
      action: wallet.connectPhantom,
      available: wallet.detectedWallets.phantom,
      featured: true,
    },
  ];

  const otherOptions: WalletOption[] = [
    { key: "walletconnect", label: "WalletConnect", icon: "◎", description: t.mobile, action: wallet.connectWalletConnect, available: wallet.detectedWallets.walletconnect, fallbackHref: "https://walletconnect.com/" },
    { key: "browser", label: t.browserWallet, icon: "▣", description: t.injectedEvm, action: wallet.connectMetaMask, available: wallet.detectedWallets.metamask },
    { key: "coinbase", label: "Coinbase Wallet", icon: "C", description: t.mobile, action: wallet.connectWalletConnect, available: wallet.detectedWallets.walletconnect, fallbackHref: "https://www.coinbase.com/wallet" },
    { key: "rabby", label: "Rabby", icon: "R", description: t.extension, action: wallet.connectMetaMask, available: wallet.detectedWallets.metamask, fallbackHref: "https://rabby.io/" },
    { key: "trust", label: "Trust Wallet", icon: "◆", description: t.mobile, action: wallet.connectWalletConnect, available: wallet.detectedWallets.walletconnect, fallbackHref: "https://trustwallet.com/" },
    { key: "rainbow", label: "Rainbow", icon: "🌈", description: t.mobile, action: wallet.connectWalletConnect, available: wallet.detectedWallets.walletconnect, fallbackHref: "https://rainbow.me/" },
    { key: "ledger", label: "Ledger Live", icon: "▤", description: t.hardware, action: wallet.connectWalletConnect, available: wallet.detectedWallets.walletconnect, fallbackHref: "https://www.ledger.com/ledger-live" },
  ];

  return (
    <div className="space-y-3">
      {showStatus ? (
        <div className="overflow-hidden rounded-3xl border border-white/[0.10] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))]">
          <div className="border-b border-white/[0.10] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-velmere-gold">{t.current}</p>
            <p className="mt-2 break-all text-sm leading-6 text-white/[0.70]">{walletUi.connected ? walletUi.fullAddress : t.empty}</p>
          </div>
          <div className="flex items-start gap-3 p-4 text-xs leading-6 text-white/[0.50]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-velmere-gold" />
            <span>{walletUi.connected ? t.oneOnly : t.safety}</span>
          </div>
        </div>
      ) : null}

      {!walletUi.connected ? (
        <>
          <p className="px-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/[0.30]">{t.primary}</p>
          <div className="grid gap-3">
            {primaryOptions.map((option) => (
              <WalletRow key={option.key} option={option} readyLabel={t.statusReady} previewLabel={t.notInstalled} />
            ))}
          </div>
          <button
            ref={otherButtonRef}
            type="button"
            onClick={openOtherWallets}
            className={`group flex min-h-14 w-full items-center justify-between gap-3 rounded-3xl border border-white/[0.10] bg-black/[0.28] px-4 text-left transition hover:border-velmere-gold/[0.30] hover:bg-white/[0.045] active:scale-[0.99] ${compact ? "" : "mt-1"}`}
            aria-label={t.openOther}
          >
            <span className="inline-flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-velmere-gold/[0.20] bg-velmere-gold/[0.08] text-velmere-gold">
                <WalletCards className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/[0.62] group-hover:text-white">{t.other}</span>
                <span className="mt-1 block text-xs text-white/[0.34]">{t.openOther}</span>
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-white/[0.34] group-hover:text-velmere-gold" />
          </button>
          <OtherWalletPanel
            open={otherOpen}
            onClose={() => setOtherOpen(false)}
            title={t.otherTitle}
            body={t.otherBody}
            hint={t.installHint}
            routesLabel={t.walletRoutes}
            closeLabel={t.closeWalletPanel}
            options={otherOptions}
            readyLabel={t.statusReady}
            previewLabel={t.statusPreview}
            anchorRect={otherAnchor}
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() => wallet.disconnect()}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.045] px-4 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/[0.70] transition hover:border-red-300/[0.30] hover:text-red-200 active:scale-95"
        >
          {t.disconnect}
        </button>
      )}
    </div>
  );
}
