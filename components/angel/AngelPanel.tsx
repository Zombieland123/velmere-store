"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type AngelPanelProps = {
  open: boolean;
  onClose: () => void;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AngelPanel({ open, onClose }: AngelPanelProps) {
  const t = useTranslations("Angel");
  const locale = useLocale();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: t("welcome") }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/angel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, locale, history: messages }),
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error ?? t("neuralError"));
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("neuralError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="fixed inset-0 z-[239] cursor-default bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        <motion.aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          initial={{ x: "112%", opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "112%", opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 top-4 z-[240] flex h-[calc(100dvh-2rem)] w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#1A1A1C] text-[#FFFFF0] shadow-[0_40px_140px_rgba(0,0,0,0.86)] ring-1 ring-white/[0.06] backdrop-blur-xl "
        >
          <header className="relative flex items-start justify-between gap-4 border-b border-white/[0.10] px-5 py-5 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.09),transparent_46%)]">
            <div className="relative z-[1]">
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37]">{t("kicker")}</p>
              <h2 className="mt-1 font-serif text-2xl leading-tight">{t("title")}</h2>
              <p className="mt-2 max-w-sm text-xs leading-6 text-white/[0.42]">{t("sidePanelHint")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="relative z-[1] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-white/[0.62] transition-colors hover:border-white/[0.25] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t("close")}</span>
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#1A1A1C] p-5 luxury-scrollbar">
            <div className="grid gap-2 sm:grid-cols-3">
              {[t("hudGas"), t("hudNetwork"), t("hudSynapse")].map((label) => (
                <p key={label} className="rounded-2xl border border-white/[0.05] bg-white/[0.03] px-3 py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-white/[0.48]">
                  {label}
                </p>
              ))}
            </div>

            <div className="space-y-3">
              {messages.map((message, index) => (
                <p
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                    message.role === "assistant" ? "mr-6 border border-white/[0.08] bg-white/[0.055] text-white/[0.78]" : "ml-8 border border-[#d4af37]/[0.18] bg-[#d4af37]/[0.12] text-[#FFFFF0]"
                  }`}
                >
                  {message.content}
                </p>
              ))}
              {loading ? (
                <p className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] text-white/[0.42]">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Angel is thinking...
                </p>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {error ? <p className="text-sm leading-6 text-red-200/[0.80]">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => sendMessage(t("fitPrompt"))} className="min-h-[40px] rounded-full border border-white/[0.10] px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.58] transition-colors hover:border-white/[0.25] hover:text-white">
                {t("fitAction")}
              </button>
              <button type="button" onClick={() => sendMessage(t("tokenPrompt"))} className="min-h-[40px] rounded-full border border-white/[0.10] px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.58] transition-colors hover:border-white/[0.25] hover:text-white">
                {t("tokenAction")}
              </button>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
            className="flex gap-2 border-t border-white/[0.10] p-4"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("placeholder")}
              className="min-h-[44px] flex-1 rounded-full border border-white/[0.10] bg-[#111113] px-5 text-sm text-white outline-none placeholder:text-white/[0.34] focus:border-[#d4af37]/[0.40]"
            />
            <button type="submit" disabled={loading} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#d4af37]/[0.30] bg-[#d4af37]/[0.10] text-[#d4af37] disabled:opacity-40">
              <Send className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t("openLabel")}</span>
            </button>
          </form>
        </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
