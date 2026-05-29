"use client";

import { useCallback, useEffect, useMemo } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect } from "wagmi";
import type { WalletKind, ConnectedWallet, WalletConnectionState } from "./types";
import { clearWalletUiSnapshot, setWalletUiSnapshot } from "@/store/useWalletUiStore";

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

export function useWalletConnect() {
  const { address, connector, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const metamaskConnector = useMemo(
    () => connectors.find((item) => isMetaMaskConnector(item.name)) ?? connectors[0],
    [connectors],
  );

  const connectedWallet = useMemo<ConnectedWallet | null>(() => {
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
  }, [address, chainId, connector?.name, isConnected]);

  const state: WalletConnectionState = isConnected
    ? "connected"
    : isConnecting
      ? "connecting"
      : error
        ? "rejected"
        : "idle";

  useEffect(() => {
    if (!connectedWallet) {
      clearWalletUiSnapshot();
      return;
    }

    setWalletUiSnapshot({
      connected: true,
      shortAddress: connectedWallet.shortAddress,
      fullAddress: connectedWallet.address,
      chainType: "evm",
      network: connectedWallet.chainId ? `Chain ${connectedWallet.chainId}` : "EVM",
      tokenBalanceLabel: formatNativeBalance(balance?.value, balance?.symbol ?? "ETH"),
      accessStatusLabel: "wallet-linked access",
    });
  }, [balance?.symbol, balance?.value, connectedWallet]);

  const connectMetaMask = useCallback(async () => {
    if (!metamaskConnector) return;
    await connectAsync({ connector: metamaskConnector });
  }, [connectAsync, metamaskConnector]);

  const connectPhantom = useCallback(async () => {
    throw new Error("Phantom Solana preview is not enabled in the EVM wagmi provider yet.");
  }, []);

  const connect = useCallback(
    (kind: WalletKind) => {
      if (kind === "metamask") return connectMetaMask();
      return connectPhantom();
    },
    [connectMetaMask, connectPhantom],
  );

  const disconnectWallet = useCallback(() => {
    disconnect();
    clearWalletUiSnapshot();
  }, [disconnect]);

  return {
    state,
    connectedWallet,
    detectedWallets: {
      metamask: Boolean(metamaskConnector),
      phantom: false,
    },
    connect,
    disconnect: disconnectWallet,
    connectMetaMask,
    connectPhantom,
  };
}
