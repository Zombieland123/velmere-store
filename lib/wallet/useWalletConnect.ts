"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect } from "wagmi";
import type { WalletKind, ConnectedWallet, WalletConnectionState } from "./types";
import { clearWalletUiSnapshot, setWalletUiSnapshot } from "@/store/useWalletUiStore";
import { isMobileViewport, openMetaMaskMobileDapp, openPhantomMobileBrowser } from "@/lib/wallet/mobile-deeplinks";

type PhantomSolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string } | null;
  connect: (args?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
};

declare global {
  interface Window {
    phantom?: { solana?: PhantomSolanaProvider; ethereum?: unknown };
    solana?: PhantomSolanaProvider;
  }
}

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNativeBalance(value?: bigint, symbol = "ETH") {
  if (typeof value !== "bigint") return `0.0000 ${symbol}`;
  const formatted = Number(formatEther(value));
  if (!Number.isFinite(formatted)) return `0.0000 ${symbol}`;
  return `${formatted.toFixed(4)} ${symbol}`;
}

function isMetaMaskConnector(connectorName: string) {
  return /metamask|injected/i.test(connectorName);
}

function getPhantomProvider() {
  if (typeof window === "undefined") return undefined;
  const provider = window.phantom?.solana ?? window.solana;
  return provider?.isPhantom ? provider : undefined;
}

export function useWalletConnect() {
  const { address, connector, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomConnecting, setPhantomConnecting] = useState(false);
  const [phantomDetected, setPhantomDetected] = useState(false);
  const [lastError, setLastError] = useState<WalletConnectionState | null>(null);

  useEffect(() => {
    const detect = () => setPhantomDetected(Boolean(getPhantomProvider()));
    detect();
    const timer = window.setTimeout(detect, 800);
    return () => window.clearTimeout(timer);
  }, []);

  const metamaskConnector = useMemo(
    () => connectors.find((item) => isMetaMaskConnector(item.name)) ?? connectors[0],
    [connectors],
  );

  const connectedWallet = useMemo<ConnectedWallet | null>(() => {
    if (phantomAddress) {
      return {
        kind: "phantom",
        label: "Phantom",
        address: phantomAddress,
        shortAddress: shortenAddress(phantomAddress),
        chainType: "solana",
        chainId: "solana-mainnet",
        icon: "PH",
      };
    }

    if (!isConnected || !address) return null;
    return {
      kind: "metamask",
      label: connector?.name ?? "Wallet",
      address,
      shortAddress: shortenAddress(address),
      chainType: "evm",
      chainId: chainId ? String(chainId) : undefined,
      icon: "0x",
    };
  }, [address, chainId, connector?.name, isConnected, phantomAddress]);

  const state: WalletConnectionState = connectedWallet
    ? "connected"
    : isConnecting || phantomConnecting
      ? "connecting"
      : error || lastError
        ? "rejected"
        : "idle";

  useEffect(() => {
    if (!connectedWallet) {
      clearWalletUiSnapshot();
      return;
    }

    const isPhantom = connectedWallet.kind === "phantom";
    setWalletUiSnapshot({
      connected: true,
      shortAddress: connectedWallet.shortAddress,
      fullAddress: connectedWallet.address,
      chainType: connectedWallet.chainType,
      network: isPhantom ? "Solana / Phantom" : connectedWallet.chainId ? `Chain ${connectedWallet.chainId}` : "EVM",
      tokenBalanceLabel: isPhantom ? "Connected via Phantom" : formatNativeBalance(balance?.value, balance?.symbol ?? "ETH"),
      accessStatusLabel: isPhantom ? "phantom-linked access" : "wallet-linked access",
    });
  }, [balance?.symbol, balance?.value, connectedWallet]);

  const connectMetaMask = useCallback(async () => {
    setLastError(null);
    const hasInjectedProvider = typeof window !== "undefined" && Boolean((window as Window & { ethereum?: unknown }).ethereum);

    if (!hasInjectedProvider && isMobileViewport()) {
      openMetaMaskMobileDapp();
      return;
    }

    if (!metamaskConnector) {
      setLastError("not_installed");
      if (isMobileViewport()) openMetaMaskMobileDapp();
      return;
    }

    await connectAsync({ connector: metamaskConnector });
  }, [connectAsync, metamaskConnector]);

  const connectPhantom = useCallback(async () => {
    setLastError(null);
    const provider = getPhantomProvider();

    if (!provider) {
      if (isMobileViewport()) {
        openPhantomMobileBrowser();
        return;
      }
      window.open("https://phantom.app/download", "_blank", "noopener,noreferrer");
      setLastError("not_installed");
      return;
    }

    setPhantomConnecting(true);
    try {
      const response = await provider.connect();
      const nextAddress = response.publicKey.toString();
      setPhantomAddress(nextAddress);
    } catch {
      setLastError("rejected");
    } finally {
      setPhantomConnecting(false);
    }
  }, []);

  const connect = useCallback(
    (kind: WalletKind) => {
      if (kind === "metamask") return connectMetaMask();
      return connectPhantom();
    },
    [connectMetaMask, connectPhantom],
  );

  const disconnectWallet = useCallback(() => {
    const provider = getPhantomProvider();
    if (phantomAddress && provider?.disconnect) void provider.disconnect().catch(() => undefined);
    setPhantomAddress(null);
    disconnect();
    clearWalletUiSnapshot();
  }, [disconnect, phantomAddress]);

  return {
    state,
    connectedWallet,
    detectedWallets: {
      metamask: Boolean(metamaskConnector),
      phantom: phantomDetected,
    },
    connect,
    disconnect: disconnectWallet,
    connectMetaMask,
    connectPhantom,
  };
}
