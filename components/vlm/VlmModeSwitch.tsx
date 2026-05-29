"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import VlmModeTransitionOverlay from "@/components/vlm/VlmModeTransitionOverlay";
import { useUiSounds } from "@/lib/audio/useUiSounds";

/** VLM Basic/Pro controller. Default is a compact header-style bar, not a side widget. */
export default function VlmModeSwitch({ inline = false }: { inline?: boolean }) {
  const t = useTranslations("VlmModeSwitch");
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "pro" ? "pro" : "basic";
  const { playClick, playSystemOn } = useUiSounds();

  const control = (
    <div
      role="tablist"
      aria-label={t("aria")}
      className={`inline-flex rounded-full border border-white/10 bg-[#121214]/88 p-1 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur-2xl ${inline ? "origin-left scale-100" : ""}`}
    >
      {[
        { key: "basic", href: "/vlm-token#vlm-mode", label: t("basic") },
        { key: "pro", href: "/vlm-token?mode=pro#vlm-mode", label: t("pro") },
      ].map((item) => {
        const active = mode === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
              item.key === "pro" ? playSystemOn() : playClick();
            }}
            className={`min-h-10 ${inline ? "min-w-[5.35rem] px-4" : "min-w-24 px-4 md:min-w-28 md:px-5"} rounded-full text-center font-sans text-[9px] font-black uppercase tracking-[0.2em] transition-colors active:scale-95 ${
              active
                ? item.key === "pro"
                  ? "bg-[linear-gradient(135deg,#d4af37,#3a2f16_58%,#101010)] text-[#FFFFF0] shadow-[0_0_34px_rgba(212,175,55,0.2)]"
                  : "bg-[#FFFFF0] text-black"
                : "text-white/48 hover:text-white"
            }`}
          >
            <span className="inline-flex min-h-10 items-center justify-center">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  if (inline) return control;

  return (
    <>
      <VlmModeTransitionOverlay mode={mode} />
      <div className="fixed left-1/2 top-[5.35rem] z-[95] -translate-x-1/2 md:top-[5.65rem]">{control}</div>
    </>
  );
}
