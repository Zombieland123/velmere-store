"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";

const AUTH_KEY = "velmere:account-session";

type AuthGateProps = {
  children: ReactNode;
  title?: string;
  body?: string;
};

function readLocalSession() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AUTH_KEY) === "active";
  } catch {
    return false;
  }
}

export function setVelmereLocalSession(active = true) {
  if (typeof window === "undefined") return;
  try {
    if (active) window.localStorage.setItem(AUTH_KEY, "active");
    else window.localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("velmere:auth-changed"));
  } catch {}
}

export function useVelmereAuth() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const walletUi = useWalletUiStore();

  useEffect(() => {
    const sync = () => {
      setAuthenticated(readLocalSession());
      setReady(true);
    };
    sync();
    window.addEventListener("velmere:auth-changed", sync);
    return () => window.removeEventListener("velmere:auth-changed", sync);
  }, [walletUi.connected]);

  return { ready, authenticated, walletConnected: Boolean(walletUi.connected) };
}

function WalletPreviewButton({ icon, title, body, onClick, disabled }: { icon: string; title: string; body: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => { navigator.vibrate?.(30); onClick(); }} className="flex min-h-16 items-center gap-4 rounded-2xl border border-white/10 bg-black/24 px-4 text-left transition hover:border-[#c8a96a]/30 hover:bg-white/[0.04] disabled:opacity-45 active:scale-[0.985]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><Image src={icon} alt="" width={24} height={24} /></span>
      <span><span className="block font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/72">{title}</span><span className="mt-1 block text-xs leading-5 text-white/40">{body}</span></span>
    </button>
  );
}

export default function AuthGate({
  children,
  title,
  body,
}: AuthGateProps) {
  const authT = useTranslations("Auth");
  const { ready, authenticated } = useVelmereAuth();
  const gateTitle = title ?? authT("gateTitle");
  const gateBody = body ?? authT("gateBody");
  const walletUi = useWalletUiStore();
  const wallet = useWalletConnect();

  if (!ready) {
    return (
      <div className="min-h-[70dvh] bg-[#080809] px-4 py-32 text-white">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-[#1A1A1C] p-8 shadow-2xl shadow-black/50">
          <div className="h-4 w-44 animate-pulse rounded-full bg-white/8" />
          <div className="mt-6 h-12 w-3/4 animate-pulse rounded-xl bg-white/6" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/6" />
        </div>
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#080809] px-4 py-28 text-white md:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(212,175,55,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]" />
      <div className="relative z-[1] mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-stretch">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1A1A1C] p-6 shadow-[0_42px_140px_rgba(0,0,0,0.72)] md:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 text-[#c8a96a]"><LockKeyhole className="h-5 w-5" aria-hidden="true" /></div>
          <p className="mt-7 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#c8a96a]">{authT("gateKicker")}</p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[0.96] text-white md:text-6xl">{gateTitle}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/56">{gateBody}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/login" className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-2xl bg-white px-6 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:bg-[#F5F0E8] active:scale-[0.985]"><UserPlus className="h-4 w-4" aria-hidden="true" />{authT("loginRegister")}</Link>
            <button type="button" onClick={() => setVelmereLocalSession(true)} className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-2xl border border-[#c8a96a]/30 bg-[#c8a96a]/10 px-6 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#c8a96a] transition hover:bg-[#c8a96a]/15 active:scale-[0.985]"><ShieldCheck className="h-4 w-4" aria-hidden="true" />{authT("previewConsole")}</button>
          </div>
        </section>
        <aside className="rounded-[2rem] border border-white/10 bg-[#151517] p-5 shadow-2xl shadow-black/50 md:p-6">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#c8a96a]">{authT("walletPreview")}</p>
          <p className="mt-3 text-sm leading-7 text-white/48">{authT("walletPreviewBody")}</p>
          <div className="mt-5 grid gap-3">
            <WalletPreviewButton icon="/wallets/metamask.svg" title={authT("metamaskWallet")} body={walletUi.connected ? walletUi.shortAddress : authT("evmPreview")} disabled={walletUi.connected && walletUi.chainType === "solana"} onClick={() => void wallet.connectMetaMask()} />
            <WalletPreviewButton icon="/wallets/phantom.svg" title={authT("phantomWallet")} body={walletUi.connected ? walletUi.shortAddress : authT("solanaPreview")} disabled={walletUi.connected && walletUi.chainType === "evm"} onClick={() => void wallet.connectPhantom()} />
          </div>
          {walletUi.connected ? <button type="button" onClick={() => wallet.disconnect()} className="mt-4 min-h-12 w-full rounded-2xl border border-white/10 bg-black/24 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55 transition hover:text-red-200 active:scale-[0.985]">{authT("disconnectWallet")}</button> : null}
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/24 p-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/38"><p>{authT("googlePrepared")}</p><p>{authT("emailActive")}</p><p>{authT("walletOptional")}</p></div>
        </aside>
      </div>
    </main>
  );
}
