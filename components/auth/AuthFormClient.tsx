"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Chrome, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { setVelmereLocalSession } from "@/components/auth/AuthGate";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import { useWalletUiStore } from "@/store/useWalletUiStore";

const authSchema = z.object({
  email: z.string().email("EMAIL_FORMAT_INVALID"),
  password: z.string()
    .min(8, "PASSWORD_MIN_LENGTH")
    .regex(/[A-Z]/, "PASSWORD_UPPERCASE_REQUIRED")
    .regex(/[0-9]/, "PASSWORD_NUMBER_REQUIRED")
    .regex(/[^A-Za-z0-9]/, "PASSWORD_SYMBOL_REQUIRED"),
});

type AuthValues = z.infer<typeof authSchema>;

type AuthLabels = { email: string; password: string; signIn: string };

function WalletOption({
  icon,
  title,
  body,
  disabled,
  onClick,
}: {
  icon: string;
  title: string;
  body: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        navigator.vibrate?.(30);
        onClick();
      }}
      className="group flex min-h-16 w-full items-center gap-4 rounded-2xl border border-white/10 bg-[#111113] px-4 text-left transition hover:border-[#c8a96a]/35 hover:bg-[#1f1f22] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.985]"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
        <Image src={icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/82 group-hover:text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/42">{body}</span>
      </span>
      <span className="ml-auto h-2 w-2 rounded-full bg-[#c8a96a]/60 shadow-[0_0_18px_rgba(200,169,106,0.46)]" />
    </button>
  );
}

export default function AuthFormClient({ labels }: { labels: AuthLabels }) {
  const t = useTranslations("Auth");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "wallet">("idle");
  const router = useRouter();
  const wallet = useWalletConnect();
  const walletUi = useWalletUiStore();
  const form = useForm<AuthValues>({ resolver: zodResolver(authSchema), defaultValues: { email: "", password: "" } });

  const activateLocalAccount = async (nextStatus: "loading" | "wallet" = "loading") => {
    setStatus(nextStatus);
    await new Promise((resolve) => window.setTimeout(resolve, nextStatus === "wallet" ? 520 : 700));
    setVelmereLocalSession(true);
    setStatus("ready");
    window.setTimeout(() => router.push("/account"), 180);
  };

  const onSubmit = async () => activateLocalAccount("loading");

  const connectWalletAccount = async (kind: "metamask" | "phantom") => {
    if (!walletUi.connected) {
      kind === "metamask" ? await wallet.connectMetaMask() : await wallet.connectPhantom();
    }
    await activateLocalAccount("wallet");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#1A1A1C] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:p-7 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(200,169,106,0.13),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_32%)]" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#c8a96a]/85">{t("consoleKicker")}</p>
            <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">{t("accountTitle")}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/50">{t("accountBody")}</p>
          </div>
          <span className="rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#c8a96a]">AUTH</span>
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => activateLocalAccount("wallet")}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/28 px-4 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/64 transition hover:border-white/20 hover:text-white active:scale-[0.985]"
          >
            <Chrome className="h-4 w-4" /> {t("continueGoogle")}
            <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] text-white/35">{t("prepared")}</span>
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            <WalletOption icon="/wallets/metamask.svg" title={t("metamaskWallet")} body={t("metamaskBody")} disabled={walletUi.connected && walletUi.chainType === "solana"} onClick={() => void connectWalletAccount("metamask")} />
            <WalletOption icon="/wallets/phantom.svg" title={t("phantomWallet")} body={t("phantomBody")} disabled={walletUi.connected && walletUi.chainType === "evm"} onClick={() => void connectWalletAccount("phantom")} />
          </div>
        </div>

        <div className="my-7 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
          <span className="h-px flex-1 bg-white/10" /> {t("orEmail")} <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-5">
          <label className="block"><span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/52">{labels.email}</span><input type="email" {...form.register("email")} placeholder="member@velmere.com" className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/35 px-5 text-[16px] text-white outline-none placeholder:text-white/22 focus:border-[#c8a96a]/50" />{form.formState.errors.email ? <p className="mt-2 font-mono text-[10px] text-red-500/80">[SYS_ERR] :: {form.formState.errors.email.message}</p> : null}</label>
          <label className="block"><span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/52">{labels.password}</span><input type="password" {...form.register("password")} placeholder={t("passwordPlaceholder")} className="mt-3 h-14 w-full rounded-2xl border border-white/10 bg-black/35 px-5 text-[16px] text-white outline-none placeholder:text-white/22 focus:border-[#c8a96a]/50" />{form.formState.errors.password ? <p className="mt-2 font-mono text-[10px] text-red-500/80">[SYS_ERR] :: {form.formState.errors.password.message}</p> : null}</label>
          <button type="submit" disabled={status === "loading" || status === "wallet"} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#c8a96a]/25 bg-[#c8a96a]/10 px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8a96a] transition hover:bg-[#c8a96a]/15 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.985]">{status === "loading" || status === "wallet" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{status === "ready" ? t("validated") : labels.signIn}</button>
          <p className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-white/32"><ShieldCheck className="mr-2 inline h-3.5 w-3.5 text-[#c8a96a]/70" />{t("localSessionNotice")}</p>
        </div>
      </div>
    </form>
  );
}
