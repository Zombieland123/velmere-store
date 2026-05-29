"use client";

import { useState } from "react";
import { useMounted } from "@/lib/hooks/useMounted";
import { Copy, ChevronDown, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ConnectedWallet } from "@/lib/wallet/types";

type WalletStatusChipProps = {
  connectedWallet: ConnectedWallet | null;
  onDisconnect: () => void;
  showDropdown?: boolean;
};

export default function WalletStatusChip({
  connectedWallet,
  onDisconnect,
  showDropdown = true,
}: WalletStatusChipProps) {
  const t = useTranslations("Wallet");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-8 w-40 animate-pulse rounded-full border border-white/10 bg-white/[0.035]" aria-hidden="true" />;
  }

  if (!connectedWallet) {
    return null;
  }

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
    <div className="relative">
      {/* Main Chip */}
      <button
        type="button"
        onClick={() => showDropdown && setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-white/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#FFFFF0]/80 transition-all duration-200 hover:border-[#d4af37]/50 hover:bg-white/[0.08]"
      >
        <span className="text-sm">{connectedWallet.icon}</span>
        <span>{connectedWallet.shortAddress}</span>
        <span className="text-[#d4af37]/60">
          {connectedWallet.chainType.toUpperCase()}
        </span>
        {showDropdown && (
          <ChevronDown className="h-3 w-3 text-white/40" />
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full right-0 z-50 mt-2 min-w-[200px] rounded-xl border border-white/10 bg-[#1a1a1a] p-2 shadow-xl">
            {/* Wallet Info */}
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-[#FFFFF0]">
                {connectedWallet.label}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-white/60">
                {connectedWallet.address}
              </p>
              <p className="mt-1 text-xs text-[#d4af37]/60">
                {t("publicAddress")}: {connectedWallet.chainType.toUpperCase()}
                {connectedWallet.chainId && ` (${connectedWallet.chainId})`}
              </p>
            </div>

            {/* Divider */}
            <div className="mx-2 my-1 border-t border-white/10" />

            {/* Actions */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(connectedWallet.address);
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/80 transition-colors hover:bg-white/[0.05]"
              >
                {copiedAddress ? (
                  <span className="text-[#d4af37]">{t("copied")}</span>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    {t("copyAddress")}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onDisconnect();
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400/80 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="h-3 w-3" />
                {t("disconnect")}
              </button>
            </div>

            {/* Preview Note for Solana */}
            {connectedWallet.chainType === "solana" && (
              <>
                <div className="mx-2 my-1 border-t border-white/10" />
                <div className="px-3 py-2">
                  <p className="text-xs text-[#d4af37]/60">
                    {t("previewOnly")}
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
