"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Paperclip, Send, ShieldCheck, X } from "lucide-react";
import { useLocale } from "next-intl";

const copy = {
  en: { chip: "Mail", title: "Send a private note", name: "Name / handle", email: "Email (optional)", subject: "Subject", message: "Message", file: "Attach file", send: "Send note", sent: "Message queued. We will review it manually.", error: "Message could not be queued.", note: "Use this route for specific and important matters: order issues, legal questions, security reports, collaboration files or requests that Angel cannot solve inside the interface. Please do not send seed phrases, private keys or wallet recovery data." },
  pl: { chip: "Mail", title: "Wyślij prywatną notatkę", name: "Imię / handle", email: "E-mail (opcjonalnie)", subject: "Tytuł", message: "Wiadomość", file: "Załącz plik", send: "Wyślij notatkę", sent: "Wiadomość przyjęta. Sprawdzimy ją ręcznie.", error: "Nie udało się przyjąć wiadomości.", note: "Używaj tej ścieżki tylko do konkretnych i ważnych spraw: zamówień, kwestii prawnych, zgłoszeń bezpieczeństwa, plików współpracy albo tematów, których Angel nie rozwiąże w interfejsie. Nigdy nie wysyłaj seed phrase, kluczy prywatnych ani danych odzyskiwania portfela." },
  de: { chip: "Mail", title: "Private Nachricht senden", name: "Name / Handle", email: "E-Mail (optional)", subject: "Betreff", message: "Nachricht", file: "Datei anhängen", send: "Senden", sent: "Nachricht eingereiht. Wir prüfen sie manuell.", error: "Nachricht konnte nicht eingereiht werden.", note: "Nutze diesen Kanal nur für konkrete und wichtige Themen: Bestellungen, rechtliche Fragen, Security Reports, Kooperationsdateien oder Anliegen, die Angel im Interface nicht lösen kann. Sende niemals Seed Phrases, Private Keys oder Wallet-Recovery-Daten." },
} as const;

export default function FloatingMailWidget() {
  const locale = useLocale() as keyof typeof copy;
  const t = copy[locale] ?? copy.en;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const openMail = () => setOpen(true);
    window.addEventListener("velmere:open-mail", openMail);
    return () => window.removeEventListener("velmere:open-mail", openMail);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact/message", { method: "POST", body: form });
      if (!response.ok) throw new Error("contact_failed");
      setStatus("sent");
      event.currentTarget.reset();
      setFileName("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-[240] bg-black/[0.60] p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "-105%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-105%", opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-md overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[#111113] text-velmere-ivory shadow-2xl shadow-black/[0.70]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.10] p-5">
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-velmere-gold" /><p className="velmere-label text-velmere-gold">{t.title}</p></div>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.10] text-white/[0.50] transition hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={submit} className="grid gap-4 p-5">
                <input name="name" placeholder={t.name} className="rounded-2xl border border-white/[0.10] bg-black/[0.30] px-4 py-3 text-sm outline-none placeholder:text-white/[0.30] focus:border-velmere-gold/[0.40]" />
                <input name="email" type="email" placeholder={t.email} className="rounded-2xl border border-white/[0.10] bg-black/[0.30] px-4 py-3 text-sm outline-none placeholder:text-white/[0.30] focus:border-velmere-gold/[0.40]" />
                <input name="subject" required placeholder={t.subject} className="rounded-2xl border border-white/[0.10] bg-black/[0.30] px-4 py-3 text-sm outline-none placeholder:text-white/[0.30] focus:border-velmere-gold/[0.40]" />
                <textarea name="message" required placeholder={t.message} className="min-h-40 resize-none rounded-2xl border border-white/[0.10] bg-black/[0.30] px-4 py-3 text-sm leading-7 outline-none placeholder:text-white/[0.30] focus:border-velmere-gold/[0.40]" />
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/[0.10] px-5 py-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/[0.50] transition hover:text-white">
                  <Paperclip className="h-4 w-4" /> {fileName || t.file}
                  <input name="attachment" type="file" className="hidden" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
                </label>
                <button disabled={status === "loading"} className="velmere-button-primary disabled:cursor-wait disabled:opacity-60"><Send className="h-4 w-4" /> {status === "loading" ? "..." : t.send}</button>
                {status === "sent" ? <p className="rounded-2xl border border-velmere-gold/[0.20] bg-velmere-gold/[0.08] p-3 text-xs leading-6 text-velmere-gold">{t.sent}</p> : null}
                {status === "error" ? <p className="rounded-2xl border border-red-500/[0.25] bg-red-500/[0.08] p-3 text-xs leading-6 text-red-200">{t.error}</p> : null}
                <p className="flex items-start gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.035] p-3 text-xs leading-6 text-white/[0.50]">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-velmere-gold" />
                  <span>{t.note}</span>
                </p>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
