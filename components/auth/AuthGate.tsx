"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "@/navigation";
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
      setAuthenticated(readLocalSession() || Boolean(walletUi.connected));
      setReady(true);
    };
    sync();
    window.addEventListener("velmere:auth-changed", sync);
    return () => window.removeEventListener("velmere:auth-changed", sync);
  }, [walletUi.connected]);

  return { ready, authenticated: authenticated || Boolean(walletUi.connected) };
}

export default function AuthGate({
  children,
  title = "MEMBER ACCESS REQUIRED",
  body = "This area opens after account activation or wallet connection.",
}: AuthGateProps) {
  const { ready, authenticated } = useVelmereAuth();
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
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#080809] px-4 py-32 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(212,175,55,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]" />
      <div className="relative z-[1] mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#1A1A1C] p-6 text-center shadow-[0_42px_140px_rgba(0,0,0,0.72)] md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 text-[#c8a96a]">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-7 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#c8a96a]">[ ACCOUNT_GATE ]</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-white md:text-6xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/56">{body}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/login" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-white px-6 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:bg-[#F5F0E8] active:scale-95">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Log in / register
          </Link>
          <button
            type="button"
            onClick={() => void wallet.connectMetaMask()}
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 px-6 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#c8a96a] transition hover:bg-[#c8a96a]/15 active:scale-95"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {walletUi.connected ? walletUi.shortAddress : "Connect wallet"}
          </button>
        </div>

        <div className="mt-6 grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-white/38">
          <p>[ GOOGLE OAUTH ] :: PREPARED</p>
          <p>[ EMAIL AUTH ] :: VALIDATION ACTIVE</p>
          <p>[ WALLET BINDING ] :: OPTIONAL</p>
        </div>
      </div>
    </main>
  );
}
