"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("EMAIL_FORMAT_INVALID"),
  password: z.string()
    .min(8, "PASSWORD_MIN_LENGTH")
    .regex(/[A-Z]/, "PASSWORD_UPPERCASE_REQUIRED")
    .regex(/[0-9]/, "PASSWORD_NUMBER_REQUIRED")
    .regex(/[^A-Za-z0-9]/, "PASSWORD_SYMBOL_REQUIRED"),
});

type AuthValues = z.infer<typeof authSchema>;

export default function AuthFormClient({ labels }: { labels: { email: string; password: string; signIn: string } }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const form = useForm<AuthValues>({ resolver: zodResolver(authSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async () => {
    setStatus("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setStatus("ready");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[2.5rem] border border-white/10 bg-[#1A1A1C] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:p-8">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div><p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/42">Secure account console</p><h2 className="mt-2 font-serif text-3xl">Velmère Account</h2></div>
        <span className="rounded-full border border-[#c8a96a]/30 bg-[#c8a96a]/10 px-3 py-1 font-mono text-[10px] text-[#c8a96a]">ZOD</span>
      </div>

      <div className="mt-7 space-y-5">
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/52">{labels.email}</span><input type="email" {...form.register("email")} placeholder="member@velmere.com" className="mt-3 h-14 w-full rounded-full border border-white/10 bg-black/35 px-5 text-white outline-none placeholder:text-white/22 focus:border-[#c8a96a]/50" />{form.formState.errors.email ? <p className="mt-2 font-mono text-[10px] text-red-500/80">[SYS_ERR] :: {form.formState.errors.email.message}</p> : null}</label>
        <label className="block"><span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/52">{labels.password}</span><input type="password" {...form.register("password")} placeholder="Symbol + number + uppercase" className="mt-3 h-14 w-full rounded-full border border-white/10 bg-black/35 px-5 text-white outline-none placeholder:text-white/22 focus:border-[#c8a96a]/50" />{form.formState.errors.password ? <p className="mt-2 font-mono text-[10px] text-red-500/80">[SYS_ERR] :: {form.formState.errors.password.message}</p> : null}</label>
        <button type="submit" disabled={status === "loading"} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-[#c8a96a]/25 bg-[#c8a96a]/10 px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8a96a] transition hover:bg-[#c8a96a]/15 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">{status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{status === "ready" ? "[ ACCESS REQUEST VALIDATED ]" : labels.signIn}</button>
      </div>
    </form>
  );
}
