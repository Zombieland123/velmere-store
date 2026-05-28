import { ReactNode } from "react";

type LuxuryEmptyStateProps = {
  title: string;
  body?: string;
  icon?: ReactNode;
  className?: string;
};

export default function LuxuryEmptyState({ title, body, icon, className = "" }: LuxuryEmptyStateProps) {
  return (
    <div className={`relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.025] p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.28)] ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:42px_42px] opacity-30" />
      <div className="relative z-[1] mx-auto flex max-w-sm flex-col items-center">
        {icon ? <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/42">{icon}</div> : null}
        <p className="font-sans text-[11px] font-black uppercase tracking-[0.28em] text-white/42">{title}</p>
        {body ? <p className="mt-4 text-xs leading-6 text-white/38">{body}</p> : null}
      </div>
    </div>
  );
}
