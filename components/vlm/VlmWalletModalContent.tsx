"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, LockKeyhole, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import type { ConnectedWallet } from "@/lib/wallet/types";

const evmAddress = /^0x[a-fA-F0-9]{40}$/;

export default function VlmWalletModalContent() {
  const t = useTranslations("Wallet");
  const [manualAddress, setManualAddress] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  const {
    state,
    connectedWallet,
    detectedWallets,
    connect,
    disconnect,
  } = useWalletConnect();

  const manualState = !manualAddress.trim() ? "empty" : evmAddress.test(manualAddress.trim()) ? "valid" : "invalid";

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#FFFFF0]">
          {t("walletPreview")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[#FFFFF0]/68">
          {t("walletPrivacy")}
        </p>
      </div>

      {/* Connected State Card */}
      {connectedWallet && (
        <div className="rounded-2xl border border-white/10 bg-[#121212]/90 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <span className="text-lg">{connectedWallet.icon}</span>
              </div>
              <div>
                <p className="font-medium text-[#FFFFF0]">{connectedWallet.label}</p>
                <p className="break-all font-mono text-xs text-[#FFFFF0]/80 tabular-nums md:text-sm">{connectedWallet.address}</p>
                <p className="break-all font-mono text-xs text-white/48 tabular-nums">
                  {t("publicAddress")}: {connectedWallet.chainType.toUpperCase()}
                  {connectedWallet.chainId && ` (Chain: ${connectedWallet.chainId})`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
            >
              {t("disconnect")}
            </button>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(connectedWallet.address)}
            className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
          >
            {copiedAddress ? (
              <>
                <span className="text-[#d4af37]">{t("copied")}</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {t("copyAddress")}
              </>
            )}
          </button>
          {connectedWallet.chainType === "solana" && (
            <p className="mt-3 text-xs text-[#d4af37]/80">
              {t("previewOnly")}
            </p>
          )}
        </div>
      )}

      {/* Wallet Buttons */}
      {!connectedWallet && (
        <div className="space-y-3">
          <WalletConnectButton
            kind="metamask"
            onConnect={() => connect("metamask")}
            state={detectedWallets.metamask ? state : "not_installed"}
            connectedWallet={null}
          />
          <WalletConnectButton
            kind="phantom"
            onConnect={() => connect("phantom")}
            state={detectedWallets.phantom ? state : "not_installed"}
            connectedWallet={null}
          />
        </div>
      )}

      {/* Public Address Checker */}
      <div>
        <label className="text-[10px] uppercase tracking-[0.18em] text-white/40">
          {t("manualCheck")}
        </label>
        <input
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          placeholder="0x1234...89ab"
          spellCheck={false}
          className="mt-2 min-h-11 w-full min-w-0 rounded-full border border-white/10 bg-[#0a0a0a] px-4 font-mono text-xs text-[#FFFFF0] outline-none transition-colors focus:border-[#d4af37]/30 md:text-sm"
        />
        <p
          className={`mt-2 text-xs ${
            manualState === "valid" ? "text-[#d4af37]" : manualState === "invalid" ? "text-red-200/80" : "text-white/42"
          }`}
        >
          {manualState === "empty" && ""}
          {manualState === "valid" && t("validAddress")}
          {manualState === "invalid" && t("invalidAddress")}
        </p>
        {manualState === "valid" && (
          <p className="mt-1 text-xs text-white/48">
            {t("registryRequired")}
          </p>
        )}
      </div>

      {/* Safety Note */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-4">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" aria-hidden="true" />
        <p className="text-xs leading-6 text-[#FFFFF0]/80">
          {t("neverSeed")}
        </p>
      </div>
    </div>
  );
}
