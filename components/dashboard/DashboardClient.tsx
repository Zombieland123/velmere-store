"use client";

import { useState } from "react";
import { KeyRound, LockKeyhole, PackageCheck, ShieldCheck, Upload, UserRound, WalletCards } from "lucide-react";
import { useWalletUiStore } from "@/store/useWalletUiStore";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "assets", label: "Web3 Assets" },
  { id: "orders", label: "Order History" },
  { id: "security", label: "Security" },
  { id: "profile", label: "Profile & Avatar" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Field({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#1A1A1C] p-4"><p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">{label}</p><p className="mt-2 break-all font-mono text-xs tabular-nums text-white/75">{value}</p></div>;
}

export default function DashboardClient() {
  const [active, setActive] = useState<TabId>("overview");
  const walletUi = useWalletUiStore();
  const wallet = useWalletConnect();

  return (
    <main className="min-h-[100dvh] bg-[#080809] pt-28 text-white md:pt-32">
      <div className="mx-auto grid w-full max-w-none gap-4 px-4 pb-28 md:px-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-[#161618] p-3 shadow-2xl shadow-black/40 lg:sticky lg:top-28 lg:self-start">
          <p className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">Velmère Console</p>
          <nav className="grid gap-1">
            {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActive(tab.id)} className={`rounded-xl px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition ${active === tab.id ? "bg-white text-black" : "text-white/50 hover:bg-white/[0.05] hover:text-white"}`}>{tab.label}</button>)}
          </nav>
        </aside>

        <section className="min-w-0 rounded-2xl border border-white/10 bg-[#111113] p-4 shadow-2xl shadow-black/40 md:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c8a96a]">Account system prepared</p><h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">Member dashboard.</h1></div>
            <button type="button" onClick={() => void wallet.connectMetaMask()} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 px-5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#c8a96a] hover:bg-[#c8a96a]/15 active:scale-95">{walletUi.connected ? walletUi.shortAddress : "Connect wallet"}</button>
          </div>

          {active === "overview" && <div className="mt-6 grid gap-4 md:grid-cols-3"><Field label="Access rank" value="Private build" /><Field label="Wallet" value={walletUi.connected ? walletUi.fullAddress : "Read-only until connection"} /><Field label="Order engine" value="Stripe session pipeline armed" /><Field label="VLM balance" value={walletUi.tokenBalanceLabel || "0.00 VLM"} /><Field label="Security" value="2FA setup pending" /><Field label="Profile" value="Avatar and bio editor ready" /></div>}

          {active === "assets" && <div className="mt-6"><div className="grid gap-[1px] overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3"><div className="bg-[#161618] p-5"><WalletCards className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Spot Wallet</p><p className="mt-3 font-mono text-2xl tabular-nums">{walletUi.tokenBalanceLabel || "0.0000 ETH"}</p></div><div className="bg-[#161618] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">VLM Access</p><p className="mt-3 font-mono text-2xl tabular-nums text-[#c8a96a]">0.00 VLM</p><p className="mt-3 text-xs text-white/45">Token balance display activates after registry contract publication.</p></div><div className="bg-[#161618] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Staking status</p><p className="mt-3 font-mono text-2xl tabular-nums">Offline</p><p className="mt-3 text-xs text-white/45">No yield promise. Access utility only.</p></div></div></div>}

          {active === "orders" && <div className="mt-6 rounded-2xl border border-white/10 bg-[#161618] p-5"><PackageCheck className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Order History</p><p className="mt-3 text-sm leading-7 text-white/55">Archived transactions will appear here after Stripe webhook fulfillment writes to the database.</p></div>}

          {active === "security" && <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><KeyRound className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Change password</p><input type="password" placeholder="New secure password" className="mt-4 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none placeholder:text-white/25" /><p className="mt-2 font-mono text-[10px] text-red-500/80">[SYS_ERR] :: PASSWORD_COMPLEXITY_RULE_ACTIVE</p></div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><ShieldCheck className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">2FA setup</p><p className="mt-4 text-xs leading-6 text-white/50">TOTP enrollment UI stub. Activation after auth provider connection.</p></div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><LockKeyhole className="h-5 w-5 text-[#c8a96a]" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Wallet binding</p><p className="mt-4 break-all font-mono text-xs text-white/60">{walletUi.fullAddress || "No wallet bound"}</p></div></div>}

          {active === "profile" && <div className="mt-6 grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]"><div className="rounded-2xl border border-white/10 bg-[#161618] p-5 text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 font-serif text-5xl text-[#c8a96a]">V</div><button type="button" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55"><Upload className="h-4 w-4" /> Upload photo</button></div><div className="rounded-2xl border border-white/10 bg-[#161618] p-5"><UserRound className="h-5 w-5 text-[#c8a96a]" /><label className="mt-4 block"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Username</span><input defaultValue="velmere.member" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none" /></label><label className="mt-4 block"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Bio</span><textarea defaultValue="Private access profile." className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-sm outline-none" /></label></div></div>}
        </section>
      </div>
    </main>
  );
}
