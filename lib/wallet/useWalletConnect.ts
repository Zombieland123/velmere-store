"use client";

import { useState, useEffect, useCallback } from "react";
import type { WalletKind, ConnectedWallet, WalletConnectionState } from "./types";
import { clearWalletUiSnapshot, setWalletUiSnapshot } from "@/store/useWalletUiStore";

// MetaMask EIP-6963 provider types
interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963Provider {
  info: EIP6963ProviderInfo;
  provider: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

// Phantom Solana provider types
interface PhantomSolanaProvider {
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
}

interface PhantomWindow {
  phantom?: {
    solana?: PhantomSolanaProvider;
  };
  solana?: PhantomSolanaProvider & { isPhantom?: boolean };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    } & EIP6963Provider["provider"];
    phantom?: PhantomWindow["phantom"];
    solana?: PhantomWindow["solana"];
  }
}

const WALLET_ICONS = {
  metamask: "MM",
  phantom: "PH",
};

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNativeBalance(hexBalance: unknown, symbol: string): string {
  if (typeof hexBalance !== "string") return `0.000 ${symbol}`;
  try {
    const wei = BigInt(hexBalance);
    const oneEth = BigInt("1000000000000000000");
    const fourDecimals = BigInt("100000000000000");
    const whole = wei / oneEth;
    const fraction = (wei % oneEth) / fourDecimals;
    return `${whole}.${fraction.toString().padStart(4, "0")} ${symbol}`;
  } catch {
    return `0.000 ${symbol}`;
  }
}

async function readEvmBalance(provider: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }, address: string): Promise<string> {
  const balance = await provider.request({ method: "eth_getBalance", params: [address, "latest"] });
  return formatNativeBalance(balance, "ETH");
}

export function useWalletConnect() {
  const [state, setState] = useState<WalletConnectionState>("idle");
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [detectedWallets, setDetectedWallets] = useState<{
    metamask: boolean;
    phantom: boolean;
  }>({ metamask: false, phantom: false });

  // Detect wallets on mount
  useEffect(() => {
    setState("detecting");
    
    const detectWallets = () => {
      const hasMetaMask = typeof window !== "undefined" && (
        window.ethereum ||
        // Check for EIP-6963 providers
        (window as any).ethereumProviders?.length > 0
      );
      
      const hasPhantom = typeof window !== "undefined" && (
        (window as PhantomWindow).phantom?.solana ||
        ((window as PhantomWindow).solana?.isPhantom)
      );

      setDetectedWallets({
        metamask: Boolean(hasMetaMask),
        phantom: Boolean(hasPhantom),
      });
      
      setState("idle");
    };

    if (typeof window !== "undefined") {
      detectWallets();
      
      // Listen for EIP-6963 provider announcements
      const handleProviderAnnouncement = (event: CustomEvent) => {
        if (event.detail?.info?.rdns?.includes("metamask")) {
          setDetectedWallets(prev => ({ ...prev, metamask: true }));
        }
      };

      window.addEventListener("eip6963:announceProvider", handleProviderAnnouncement as EventListener);
      
      return () => {
        window.removeEventListener("eip6963:announceProvider", handleProviderAnnouncement as EventListener);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return undefined;

    const handleAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : [];
      const address = typeof list[0] === "string" ? list[0] : "";
      if (!address) {
        setConnectedWallet(null);
        setState("idle");
        clearWalletUiSnapshot();
        return;
      }
      readEvmBalance(window.ethereum!, address).then((balance) => {
        setWalletUiSnapshot({
          connected: true,
          shortAddress: shortenAddress(address),
          fullAddress: address,
          chainType: "evm",
          tokenBalanceLabel: balance,
        });
      }).catch(() => undefined);
    };

    const handleChainChanged = (chainId: unknown) => {
      if (typeof chainId === "string") setWalletUiSnapshot({ network: chainId });
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connectMetaMask = useCallback(async () => {
    if (!detectedWallets.metamask) {
      setState("not_installed");
      return;
    }

    try {
      setState("connecting");

      let provider: any;
      
      // Try EIP-6963 providers first
      if ((window as any).ethereumProviders?.length > 0) {
        const metamaskProvider = (window as any).ethereumProviders.find(
          (p: EIP6963Provider) => p.info.rdns?.includes("metamask")
        );
        if (metamaskProvider) {
          provider = metamaskProvider.provider;
        }
      }
      
      // Fallback to window.ethereum
      if (!provider && window.ethereum) {
        provider = window.ethereum;
      }

      if (!provider) {
        setState("not_installed");
        return;
      }

      // Request accounts
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!accounts || (accounts as string[]).length === 0) {
        setState("rejected");
        return;
      }

      // Get chain ID and native balance for read-only preview.
      const chainId = await provider.request({ method: "eth_chainId" });

      const address = (accounts as string[])[0];
      const nativeBalance = await readEvmBalance(provider, address).catch(() => "0.000 ETH");
      const wallet: ConnectedWallet = {
        kind: "metamask",
        label: "MetaMask",
        address,
        shortAddress: shortenAddress(address),
        chainType: "evm",
        chainId: chainId as string,
        icon: WALLET_ICONS.metamask,
      };

      setConnectedWallet(wallet);
      setState("connected");
      setWalletUiSnapshot({
        connected: true,
        shortAddress: wallet.shortAddress,
        fullAddress: wallet.address,
        chainType: wallet.chainType,
        network: wallet.chainId ?? "EVM",
        tokenBalanceLabel: nativeBalance,
        accessStatusLabel: "wallet-linked access",
      });
    } catch (error) {
      console.error("MetaMask connection error:", error);
      setState("rejected");
    }
  }, [detectedWallets.metamask]);

  const connectPhantom = useCallback(async () => {
    if (!detectedWallets.phantom) {
      setState("not_installed");
      return;
    }

    try {
      setState("connecting");

      const phantomWindow = window as PhantomWindow;
      let solana: PhantomSolanaProvider | undefined;

      // Try window.phantom.solana first
      if (phantomWindow.phantom?.solana) {
        solana = phantomWindow.phantom.solana;
      }
      // Fallback to window.solana if it's Phantom
      else if (phantomWindow.solana?.isPhantom) {
        solana = phantomWindow.solana;
      }

      if (!solana) {
        setState("not_installed");
        return;
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();

      const wallet: ConnectedWallet = {
        kind: "phantom",
        label: "Phantom",
        address,
        shortAddress: shortenAddress(address),
        chainType: "solana",
        icon: WALLET_ICONS.phantom,
      };

      setConnectedWallet(wallet);
      setState("connected");
      setWalletUiSnapshot({
        connected: true,
        shortAddress: wallet.shortAddress,
        fullAddress: wallet.address,
        chainType: wallet.chainType,
        network: "SOL",
        tokenBalanceLabel: "0.00 SOL",
        accessStatusLabel: "wallet-linked access",
      });
    } catch (error) {
      console.error("Phantom connection error:", error);
      setState("rejected");
    }
  }, [detectedWallets.phantom]);

  const connect = useCallback((kind: WalletKind) => {
    if (kind === "metamask") {
      return connectMetaMask();
    } else if (kind === "phantom") {
      return connectPhantom();
    }
  }, [connectMetaMask, connectPhantom]);

  const disconnect = useCallback(() => {
    setConnectedWallet(null);
    setState("idle");
    clearWalletUiSnapshot();
  }, []);

  return {
    state,
    connectedWallet,
    detectedWallets,
    connect,
    disconnect,
    connectMetaMask,
    connectPhantom,
  };
}
