"use client";

import { useState } from "react";
import { Chrome, Loader2, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import Image from "next/image";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { setVelmereLocalSession } from "@/components/auth/AuthGate";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import { useWalletUiStore } from "@/store/useWalletUiStore";

type AuthFormClientProps = {
  labels?: {
    email?: string;
    password?: string;
    signIn?: string;
    privateAccount?: string;
    title?: string;
    body?: string;
    googlePreview?: string;
    notLive?: string;
    emailAccess?: string;
    createAccount?: string;
    alreadyHave?: string;
    forgotPassword?: string;
    returnHome?: string;
    previewNotice?: string;
    minimumPassword?: string;
    emailError?: string;
    passwordError?: string;
    walletRequired?: string;
  };
};

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-2 rounded-xl border border-velmere-danger/[0.25] bg-velmere-danger/[0.10] px-3 py-2 text-xs leading-5 text-red-100">{children}</p>;
}

function displayNameFromEmail(email: string) {
  const localPart = email.split("@")[0]?.trim();
  if (!localPart) return "Velmère Member";
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 32) || "Velmère Member";
}

function WalletButton({ icon, title, body, onClick, disabled }: { icon: string; title: string; body: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-16 items-center gap-4 rounded-2xl border border-white/[0.10] bg-black/[0.24] px-4 text-left transition duration-300 hover:border-velmere-gold/[0.35] hover:bg-white/[0.045] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.985]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.04]">
        <Image src={icon} alt="" width={24} height={24} />
      </span>
      <span>
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.72]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-white/[0.42]">{body}</span>
      </span>
    </button>
  );
}

export default function AuthFormClient({ labels }: AuthFormClientProps) {
  const locale = useLocale();
  const accountHref = `/${locale || "pl"}/account`;
  const goToAccount = () => { window.location.assign(accountHref); };
  const wallet = useWalletConnect();
  const walletUi = useWalletUiStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailLabel = labels?.email ?? "Email";
  const passwordLabel = labels?.password ?? "Password";

  const validate = () => {
    if (!email.includes("@") || email.length < 6) return labels?.emailError ?? "Enter a valid email address.";
    if (password.length < 8) return labels?.passwordError ?? "Password must contain at least 8 characters.";
    if (mode === "create" && !walletUi.connected) return labels?.walletRequired ?? "Connect a wallet before creating a member account for VLM and Square features.";
    return null;
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setVelmereLocalSession(true, {
        displayName: displayNameFromEmail(email),
        email,
      });
      setLoading(false);
      goToAccount();
    }, 420);
  };

  const continueAsPreview = () => {
    setLoading(true);
    window.setTimeout(() => {
      setVelmereLocalSession(true, { displayName: "Velmère Preview" });
      setLoading(false);
      goToAccount();
    }, 320);
  };

  return (
    <section className="rounded-[2rem] border border-white/[0.10] bg-[#111113] p-5 shadow-velmere-card md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="velmere-label text-velmere-gold">{labels?.privateAccount ?? "Private account"}</p>
          <h2 className="mt-4 font-serif text-3xl leading-[0.98] tracking-[-0.035em]">
            {labels?.title ?? "Sign in."}
          </h2>
          <p className="mt-4 text-sm leading-7 text-velmere-muted">
            {labels?.body ?? "Account first. Wallet optional. No seed phrases."}
          </p>
        </div>
        <LockKeyhole className="h-5 w-5 shrink-0 text-velmere-gold" />
      </div>

      <div className="mt-7 grid gap-3">
        <button
          type="button"
          onClick={continueAsPreview}
          disabled={loading}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/[0.10] bg-black/[0.28] px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.64] transition hover:border-white/[0.20] hover:text-white disabled:opacity-50 active:scale-[0.985]"
        >
          <Chrome className="h-4 w-4" /> {labels?.googlePreview ?? "Google preview"}
          <span className="rounded-full border border-white/[0.10] px-2 py-1 text-[8px] text-white/[0.35]">{labels?.notLive ?? "Not live"}</span>
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <WalletButton
            icon="/wallets/metamask.svg"
            title="🦊 MetaMask"
            body={walletUi.connected && walletUi.chainType === "evm" ? walletUi.shortAddress : "Optional EVM binding"}
            disabled={walletUi.connected && walletUi.chainType === "solana"}
            onClick={() => void wallet.connectMetaMask()}
          />
          <WalletButton
            icon="/wallets/phantom.svg"
            title="👻 Phantom"
            body={walletUi.connected && walletUi.chainType === "solana" ? walletUi.shortAddress : "Optional Solana binding"}
            disabled={walletUi.connected && walletUi.chainType === "evm"}
            onClick={() => void wallet.connectPhantom()}
          />
        </div>
      </div>

      <div className="my-7 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.28]">
        <span className="h-px flex-1 bg-white/[0.10]" /> {labels?.emailAccess ?? "email access"} <span className="h-px flex-1 bg-white/[0.10]" />
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/[0.42]">{emailLabel}</span>
          <input
            value={email}
            onChange={(event) => { setEmail(event.target.value); setError(null); }}
            type="email"
            autoComplete="email"
            placeholder="member@velmere.com"
            className="mt-3 h-14 w-full rounded-2xl border border-white/[0.10] bg-black/[0.28] px-4 text-base text-white outline-none transition placeholder:text-white/[0.24] focus:border-velmere-gold/[0.45]"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/[0.42]">{passwordLabel}</span>
          <input
            value={password}
            onChange={(event) => { setPassword(event.target.value); setError(null); }}
            type="password"
            autoComplete={mode === "create" ? "new-password" : "current-password"}
            placeholder={labels?.minimumPassword ?? "Minimum 8 characters"}
            className="mt-3 h-14 w-full rounded-2xl border border-white/[0.10] bg-black/[0.28] px-4 text-base text-white outline-none transition placeholder:text-white/[0.24] focus:border-velmere-gold/[0.45]"
          />
        </label>

        <FieldError>{error ?? undefined}</FieldError>

        <button
          type="submit"
          disabled={loading}
          className="velmere-button-primary w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {mode === "create" ? labels?.createAccount ?? "Create account" : labels?.signIn ?? "Sign in"}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/[0.45]">
        <button type="button" onClick={() => setMode(mode === "signin" ? "create" : "signin")} className="transition hover:text-velmere-gold">
          {mode === "signin" ? labels?.createAccount ?? "Create account" : labels?.alreadyHave ?? "Already have an account?"}
        </button>
        <button type="button" onClick={() => setError("Password reset email is not connected yet. Contact support for account help.")} className="transition hover:text-velmere-gold">
          {labels?.forgotPassword ?? "Forgot password?"}
        </button>
        <Link href="/" className="transition hover:text-velmere-gold">{labels?.returnHome ?? "Return home"}</Link>
      </div>

      <p className="mt-6 rounded-2xl border border-white/[0.10] bg-black/[0.24] p-4 text-xs leading-6 text-white/[0.42]">
        {labels?.previewNotice ?? "Preview mode only. Production auth requires Google OAuth keys, server sessions and final legal copy."}
      </p>
    </section>
  );
}
