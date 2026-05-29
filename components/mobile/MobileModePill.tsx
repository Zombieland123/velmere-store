"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

export default function MobileModePill() {
  const t = useTranslations("VlmModeSwitch");
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "pro" ? "pro" : "basic";
  const items = [
    { key: "basic", href: "/vlm-token#vlm-mode", label: t("basic") },
    { key: "pro", href: "/vlm-token?mode=pro#vlm-mode", label: t("pro") },
  ] as const;

  return (
    <div className="fixed left-1/2 z-[80] flex -translate-x-1/2 rounded-full border border-white/10 bg-black/70 p-1 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:hidden safe-bottom-4">
      {items.map((item) => {
        const active = mode === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-[6.25rem] items-center justify-center rounded-full px-5 font-sans text-[10px] font-black uppercase tracking-[0.18em] luxury-hover ${
              active ? "bg-[#F5F0E8] text-black" : "text-white/52 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
