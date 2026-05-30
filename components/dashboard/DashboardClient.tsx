"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Activity, BadgeCheck, KeyRound, LockKeyhole, LogOut, PackageCheck, ShieldCheck, Upload, UserRound, WalletCards } from "lucide-react";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import { setVelmereLocalSession } from "@/components/auth/AuthGate";

const copy = {
  en: {
    tabs: ["Overview", "Web3 Assets", "Order History", "Security", "Profile & Avatar"],
    kicker: "Private member console",
    title: "Member console.",
    body: "Profile, orders, security and wallet bindings stay separated. Commerce first; Web3 as an optional access layer.",
    logout: "Log out",
    connect: "Connect wallet",
    disconnect: "Disconnect wallet",
    rank: "Private build",
    wallet: "Optional binding",
    order: "Stripe session pipeline armed",
    security: "2FA setup pending",
    profile: "Avatar and bio editor ready",
  },
  pl: {
    tabs: ["Przegląd", "Aktywa Web3", "Historia zamówień", "Bezpieczeństwo", "Profil i avatar"],
    kicker: "Prywatna konsola członka",
    title: "Panel konta.",
    body: "Profil, zamówienia, bezpieczeństwo i portfele są oddzielone. Najpierw sklep; Web3 tylko jako warstwa dostępu.",
    logout: "Wyloguj się",
    connect: "Połącz portfel",
    disconnect: "Odłącz portfel",
    rank: "Prywatna wersja",
    wallet: "Opcjonalne powiązanie",
    order: "Pipeline Stripe gotowy",
    security: "Konfiguracja 2FA oczekuje",
    profile: "Avatar i bio gotowe do edycji",
  },
  de: {
    tabs: ["Übersicht", "Web3 Assets", "Bestellungen", "Sicherheit", "Profil & Avatar"],
    kicker: "Private Member-Konsole",
    title: "Member console.",
    body: "Profil, Bestellungen, Sicherheit und Wallet-Bindings bleiben getrennt. Commerce zuerst; Web3 als optionale Zugriffsschicht.",
    logout: "Ausloggen",
    connect: "Wallet verbinden",
    disconnect: "Wallet trennen",
    rank: "Private Build",
    wallet: "Optionale Bindung",
    order: "Stripe Pipeline bereit",
    security: "2FA Setup ausstehend",
    profile: "Avatar und Bio Editor bereit",
  },
} as const;

const tabIds = ["overview", "assets", "orders", "security", "profile"] as const;
type TabId = (typeof tabIds)[number];

function Field({ label, value, glow = false }: { label: string; value: string; glow?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${glow ? "border-[#c8a96a]/24 bg-[#c8a96a]/[0.055]" : "border-white/10 bg-[#1A1A1C]"}`}><p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">{label}</p><p className="mt-2 break-all font-mono text-xs tabular-nums text-white/75">{value}</p></div>;
}

export default function DashboardClient() {
  const locale = useLocale() as "en" | "pl" | "de";
  const c = copy[locale] ?? copy.en;
  const [active, setActive] = useState<TabId>("overview");
  const [simulated, setSimulated] = useState(false);
  const walletUi = useWalletUiStore();
  const wallet = useWalletConnect();
  const assetRows = useMemo(() => [
    { asset: walletUi.chainType === "solana" ? "SOL" : "ETH", balance: walletUi.connected ? walletUi.tokenBalanceLabel : c.connect, value: "Live wallet read" },
    { asset: "VLM", balance: "Registry pending", value: "Access utility only" },
    { asset: "AMU", balance: "3162.27", value: "Brand baseline constant" },
  ], [c.connect, walletUi.chainType, walletUi.connected, walletUi.tokenBalanceLabel]);

  return (
    <main className="min-h-[100dvh] bg-[#080809] pt-28 text-white md:pt-32">
      <div className="mx-auto grid w-full max-w-none gap-4 px-4 pb-28 md:px-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-[#161618] p-3 shadow-2xl shadow-black/40 lg:sticky lg:top-28 lg:self-start">
          <p className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">Velmère Console</p>
          <nav className="grid gap-1">
            {tabIds.map((id, index) => <button key={id} type="button" onClick={() => setActive(id)} className={`rounded-xl px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition active:scale-[0.985] ${active === id ? "bg-white text-black" : "text-white/50 hover:bg-white/[0.05] hover:text-white"}`}>{c.tabs[index]}</button>)}
          </nav>
          <button type="button" onClick={() => setVelmereLocalSession(false)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45 transition hover:text-red-200 active:scale-[0.985]"><LogOut className="h-4 w-4" /> {c.logout}</button>
        </aside>

        <section className="min-w-0 rounded-2xl border border-white/10 bg-[#111113] p-4 shadow-2xl shadow-black/40 md:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">{c.kicker}</p><h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">{c.title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/52">{c.body}</p></div>
            <button type="button" onClick={() => walletUi.connected ? wallet.disconnect() : void wallet.connectMetaMask()} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 px-5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#c8a96a] hover:bg-[#c8a96a]/15 active:scale-95">{walletUi.connected ? c.disconnect : c.connect}</button>
          </div>

          {active === "overview" && <div className="mt-6 space-y-4"><div className="grid gap-4 md:grid-cols-3"><Field label="Member rank" value={c.rank} glow /><Field label="Wallet" value={walletUi.connected ? walletUi.fullAddress : c.wallet} /><Field label="Order engine" value={c.order} /><Field label="VLM balance" value={walletUi.tokenBalanceLabel || "0.00 VLM"} /><Field label="Security" value={c.security} /><Field label="Profile" value={c.profile} /></div><div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"><section className="rounded-2xl border border-white/10 bg-[#161618] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c8a96a]">Member timeline</p><div className="mt-5 space-y-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/48"><p>[ ACCESS ] :: SESSION_ACTIVE</p><p>[ ORDERS ] :: AWAITING_FIRST_CHECKOUT</p><p>[ SQUARE ] :: READ_PUBLIC / POST_AFTER_LOGIN</p><p>[ AMU ] :: BASELINE_3162.27</p></div></section><section className="rounded-2xl border border-[#c8a96a]/20 bg-[#c8a96a]/[0.06] p-5"><BadgeCheck className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#c8a96a]">Client relation</p><p className="mt-4 text-sm leading-7 text-white/58">Concierge, sizing, shipping and order signals stay here. The wallet is never required for normal checkout.</p></section></div></div>}

          {active === "assets" && <div className="mt-6 space-y-5"><div className="grid gap-[1px] overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">{assetRows.map((row) => <div key={row.asset} className="bg-[#161618] p-5"><WalletCards className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{row.asset}</p><p className="mt-3 font-mono text-2xl tabular-nums">{row.balance}</p><p className="mt-3 text-xs text-white/45">{row.value}</p></div>)}</div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8a96a]">Wallet test lane</p><p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">Simulation only. No funds move, no transaction is sent. Use this to test UI states before a real VLM contract exists.</p></div><button type="button" onClick={() => { navigator.vibrate?.(30); setSimulated(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/65 active:scale-95"><Activity className="h-4 w-4" /> Simulate $0 test</button></div>{simulated ? <p className="mt-4 rounded-xl border border-[#c8a96a]/20 bg-[#c8a96a]/10 p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c8a96a]">[ SIMULATION_OK ] :: SIGNATURE_PREVIEW_READY :: NO_VALUE_TRANSFER</p> : null}</div></div>}

          {active === "orders" && <div className="mt-6 grid gap-4 md:grid-cols-3"><Field label="Order history" value="No completed orders yet" /><Field label="Checkout" value="Guest checkout allowed" /><Field label="Delivery" value="DHL/DPD carrier layer prepared" /></div>}

          {active === "security" && <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><KeyRound className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Change password</p><input type="password" placeholder="New secure password" className="mt-4 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-[16px] outline-none placeholder:text-white/25 focus:border-[#c8a96a]/40" /><p className="mt-2 font-mono text-[10px] text-white/34">[ RULE ] :: 8+ chars / number / symbol</p></div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><ShieldCheck className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">2FA setup</p><p className="mt-4 text-xs leading-6 text-white/50">TOTP enrollment UI prepared for the auth provider connection.</p></div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><LockKeyhole className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Wallet binding</p><p className="mt-4 break-all font-mono text-xs text-white/60">{walletUi.fullAddress || "No wallet bound"}</p></div></div>}

          {active === "profile" && <div className="mt-6 grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]"><div className="rounded-2xl border border-white/10 bg-[#161618] p-5 text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 font-serif text-5xl text-[#c8a96a]">V</div><button type="button" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 active:scale-95"><Upload className="h-4 w-4" /> Upload photo</button></div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><UserRound className="h-5 w-5 text-[#c8a96a]" /><label className="mt-4 block"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Username</span><input defaultValue="velmere.member" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-[16px] outline-none focus:border-[#c8a96a]/40" /></label><label className="mt-4 block"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Bio</span><textarea defaultValue="Private access profile." className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-[16px] outline-none focus:border-[#c8a96a]/40" /></label></div></div>}
        </section>
      </div>
    </main>
  );
}
