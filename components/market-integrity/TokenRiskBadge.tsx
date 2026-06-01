import type { RiskLevel } from "@/lib/market-integrity/risk-types";

const levelClasses: Record<RiskLevel, string> = {
  low: "border-emerald-400/[0.26] bg-emerald-400/[0.10] text-emerald-200 shadow-[0_0_34px_rgba(52,211,153,0.08)]",
  medium: "border-amber-400/[0.28] bg-amber-400/[0.10] text-amber-200 shadow-[0_0_34px_rgba(251,191,36,0.08)]",
  high: "border-orange-400/[0.30] bg-orange-400/[0.11] text-orange-200 shadow-[0_0_34px_rgba(251,146,60,0.10)]",
  critical: "border-red-400/[0.34] bg-red-500/[0.12] text-red-100 shadow-[0_0_42px_rgba(248,113,113,0.14)]",
};

export default function TokenRiskBadge({ level, label }: { level: RiskLevel; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${levelClasses[level]}`}>
      {label}
    </span>
  );
}
