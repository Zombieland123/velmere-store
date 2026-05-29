"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles, WalletCards, Zap } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { useUiSounds } from "@/lib/audio/useUiSounds";
import { useWalletConnect } from "@/lib/wallet/useWalletConnect";
import { useModeStore } from "@/store/useModeStore";

type CommandAction = {
  label: string;
  hint: string;
  perform: () => void;
  icon: React.ReactNode;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const wallet = useWalletConnect();
  const { setProMode, toggleMode } = useModeStore();
  const { playHover, playClick, playSystemOn } = useUiSounds();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        playClick();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [playClick]);

  const commands = useMemo<CommandAction[]>(
    () => [
      {
        label: "> Go to Shop",
        hint: "ROUTE /SHOP",
        icon: <Search className="h-3.5 w-3.5" aria-hidden="true" />,
        perform: () => router.push("/shop"),
      },
      {
        label: "> Go to Archive",
        hint: "ROUTE /ARCHIVE",
        icon: <Search className="h-3.5 w-3.5" aria-hidden="true" />,
        perform: () => router.push("/archive"),
      },
      {
        label: "> Toggle VLM Pro",
        hint: "MODE SWITCH",
        icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
        perform: () => {
          setProMode();
          playSystemOn();
          router.push("/vlm-token?mode=pro#vlm-mode");
        },
      },
      {
        label: "> Toggle Basic / Pro Memory",
        hint: "LOCAL TERMINAL STATE",
        icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
        perform: () => {
          toggleMode();
          playClick();
        },
      },
      {
        label: "> Access Angel",
        hint: "AI CONCIERGE",
        icon: <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />,
        perform: () => window.dispatchEvent(new Event("velmere:angel:open")),
      },
      {
        label: "> Connect Wallet",
        hint: wallet.connectedWallet ? wallet.connectedWallet.shortAddress : "WAGMI INJECTED",
        icon: <WalletCards className="h-3.5 w-3.5" aria-hidden="true" />,
        perform: () => void wallet.connectMetaMask(),
      },
    ],
    [locale, playClick, playSystemOn, router, setProMode, toggleMode, wallet],
  );

  const run = (command: CommandAction) => {
    playClick();
    command.perform();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <button type="button" aria-label="Close command palette" className="absolute inset-0" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative z-[1] w-full max-w-2xl rounded-none border border-white/15 bg-black/92 shadow-[0_40px_140px_rgba(0,0,0,0.8)]"
          >
            <Command className="bg-transparent text-white">
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="mr-3 h-4 w-4 text-velmere-gold/70" aria-hidden="true" />
                <Command.Input
                  autoFocus
                  placeholder="TYPE A COMMAND / ROUTE / ACTION"
                  className="h-14 flex-1 bg-transparent font-mono text-xs uppercase tracking-[0.22em] text-white outline-none placeholder:text-white/25"
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">{locale.toUpperCase()}</span>
              </div>
              <Command.List className="max-h-[22rem] overflow-y-auto p-2 no-scrollbar">
                <Command.Empty className="px-4 py-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                  No command found.
                </Command.Empty>
                {commands.map((command) => (
                  <Command.Item
                    key={command.label}
                    value={`${command.label} ${command.hint}`}
                    onMouseEnter={playHover}
                    onSelect={() => run(command)}
                    className="group flex min-h-12 cursor-pointer items-center justify-between border-b border-white/5 px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/62 outline-none transition-colors data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-velmere-gold/65">{command.icon}</span>
                      {command.label}
                    </span>
                    <span className="text-[9px] text-white/30 group-data-[selected=true]:text-velmere-gold/70">{command.hint}</span>
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
